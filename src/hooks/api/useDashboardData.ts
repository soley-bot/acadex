/**
 * Dashboard-related hooks using React Query for optimized caching
 */
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { logger, createSupabaseClient } from '@/lib'
import type { AdminDashboardResponse, Course, UserRole } from '@/types'

const supabase = createSupabaseClient()

// Auth helper - BEST PRACTICE: Use getUser() for verification
async function getAuthHeaders() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    throw new Error('Authentication required')
  }

  // After user verification, get session for token
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    throw new Error('Session not found')
  }

  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`
  }
}

// Type definitions
interface StudentDashboardStats {
  totalCourses: number
  completedCourses: number
  totalQuizzes: number
  averageScore: number
  studyHours: number
  streak: number
}

interface RecentCourse {
  id: string
  title: string
  progress: number
  lastAccessed: string
  duration: string
  category: string
}

interface RecentQuiz {
  id: string
  quizId: string
  title: string
  score: number
  totalQuestions: number
  completedAt: string
  percentage: number
}

interface StudentDashboardResponse {
  stats: StudentDashboardStats
  recentCourses: RecentCourse[]
  recentQuizzes: RecentQuiz[]
}

interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

/**
 * Fetch all admin dashboard data in optimized batch
 * This replaces multiple separate API calls with a single request
 */
export function useAdminDashboardData(page = 1, limit = 12) {
  return useQuery({
    queryKey: ['admin', 'dashboard', { page, limit }],
    queryFn: async (): Promise<AdminDashboardResponse> => {
      logger.debug('🚀 Fetching admin dashboard data in batch')
      const headers = await getAuthHeaders()
      
      // Make parallel requests for better performance - use full mode for admin dashboard
      const [quizzesRes, categoriesRes] = await Promise.all([
        fetch(`/api/admin/quizzes?page=${page}&limit=${limit}&mode=full`, {
          method: 'GET',
          headers,
          credentials: 'include'
        }),
        fetch('/api/admin/categories', {
          method: 'GET',
          headers,
          credentials: 'include'
        })
      ])

      if (!quizzesRes.ok || !categoriesRes.ok) {
        throw new Error('Failed to fetch dashboard data')
      }

      const [quizzesData, categoriesData] = await Promise.all([
        quizzesRes.json(),
        categoriesRes.json()
      ])

      return {
        success: true,
        quizzes: quizzesData.quizzes || [],
        categories: categoriesData.categories || [],
        courses: [], // Future: Add courses endpoint when dashboard needs course data
        stats: {
          totalQuizzes: quizzesData.pagination?.total || 0,
          totalCourses: 0,
          totalStudents: 0,
          totalInstructors: 0,
          publishedQuizzes: 0,
          publishedCourses: 0,
          activeUsers: 0,
          recentSignups: 0
        }
      }
    },
    staleTime: 60 * 1000, // 1 minute (dashboard needs frequent updates)
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true, // Dashboard should stay current
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes for dashboard
    refetchIntervalInBackground: false, // Only when tab is active
    retry: (failureCount, error) => {
      if (error.message.includes('Authentication') || error.message.includes('Unauthorized')) {
        return false
      }
      return failureCount < 1 // Dashboard should fail fast
    },
    placeholderData: (previousData) => previousData || {
      success: false,
      quizzes: [],
      categories: [],
      courses: [],
      stats: { 
        totalQuizzes: 0, 
        totalCourses: 0, 
        totalStudents: 0,
        totalInstructors: 0,
        publishedQuizzes: 0,
        publishedCourses: 0,
        activeUsers: 0,
        recentSignups: 0
      }
    }, // Provide fallback structure when previousData is undefined
  })
}

/**
 * Student dashboard data hooks
 */
export function useStudentDashboard(userId: string | null) {
  logger.debug('useStudentDashboard called', { userId })

  return useQuery({
    queryKey: ['student', 'dashboard', userId],
    queryFn: async (): Promise<StudentDashboardResponse> => {
      if (!userId) throw new Error('User ID required')

      logger.debug('Fetching dashboard data', { userId })

      const headers = await getAuthHeaders()
      logger.debug('Auth headers obtained')

      const response = await fetch(`/api/student/dashboard?userId=${userId}`, {
        method: 'GET',
        headers,
        credentials: 'include'
      })

      logger.debug('Dashboard API response', { status: response.status })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        logger.error('Dashboard API error', { errorData })
        throw new Error(errorData.error || `Failed to fetch dashboard data: ${response.status}`)
      }

      const data = await response.json()
      logger.debug('Dashboard API data received')
      return data
    },
    enabled: !!userId, // Only run when userId is available
    staleTime: 2 * 60 * 1000, // 2 minutes (dashboard should be relatively fresh)
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true, // Refresh when user returns
    retry: (failureCount, error: any) => {
      // Don't retry auth errors, retry network/server errors up to 2 times
      if (error?.message?.includes('401') || error?.message?.includes('403')) {
        return false
      }
      return failureCount < 2
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000), // Exponential backoff
  })
}

/**
 * Hook to invalidate student dashboard data when progress changes
 */
export function useInvalidateStudentDashboard() {
  const queryClient = useQueryClient()
  
  return useCallback((userId: string) => {
    // Invalidate dashboard data to trigger refresh
    queryClient.invalidateQueries({
      queryKey: ['student', 'dashboard', userId]
    })
    
    // Also invalidate related data
    queryClient.invalidateQueries({
      queryKey: ['student', 'progress', userId]
    })
    
    logger.info('✅ Student dashboard data invalidated', { userId })
  }, [queryClient])
}

/**
 * Lazy-load quiz statistics for performance optimization
 */
export function useQuizStatistics(quizIds: string[]) {
  return useQuery({
    queryKey: ['quiz-statistics', quizIds],
    queryFn: async () => {
      if (quizIds.length === 0) return {}
      
      logger.debug(`🔢 Lazy loading quiz statistics for ${quizIds.length} quizzes`)
      const headers = await getAuthHeaders()
      
      const response = await fetch(`/api/admin/quizzes/stats?quizIds=${quizIds.join(',')}`, {
        method: 'GET',
        headers,
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to fetch quiz statistics')
      }

      const data = await response.json()
      return data.stats || {}
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: quizIds.length > 0, // Only run if we have quiz IDs
  })
}