/**
 * Optimized API hooks using React Query
 * Replaces direct fetch calls with smart caching
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

// Optimized imports from consolidated sources
import { logger, supabase, type Quiz, type Course } from '@/lib'
import type { UserRole } from '@/lib/auth-security'
import type { 
  AdminQuizzesResponse,
  AdminCoursesResponse,
  AdminDashboardResponse,
  AdminDashboardStats,
  PaginationMeta
} from '@/types'

// Re-export consolidated types for backward compatibility
export type { AdminDashboardResponse as AdminDashboardData } from '@/types'

// ==============================================
// TYPES & INTERFACES (Legacy - to be consolidated)
// ==============================================

interface Category {
  id: string
  name: string
  type: string
  color: string
}

// ==============================================
// AUTH HELPER
// ==============================================

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    throw new Error('Authentication required')
  }
  
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`
  }
}

// ==============================================
// CACHE INVALIDATION UTILITIES (Phase 3 Optimization)
// ==============================================

/**
 * Smart cache invalidation hooks for optimized user experience
 */
export function useCacheInvalidation() {
  const queryClient = useQueryClient()

  const invalidateAdminQuizzes = useCallback((specificPage?: number) => {
    if (specificPage) {
      // Invalidate specific page only
      queryClient.invalidateQueries({
        queryKey: ['admin', 'quizzes', { page: specificPage }]
      })
    } else {
      // Invalidate all quiz pages
      queryClient.invalidateQueries({
        queryKey: ['admin', 'quizzes']
      })
    }
  }, [queryClient])

  const invalidateAdminCourses = useCallback((specificPage?: number) => {
    if (specificPage) {
      queryClient.invalidateQueries({
        queryKey: ['admin', 'courses', { page: specificPage }]
      })
    } else {
      queryClient.invalidateQueries({
        queryKey: ['admin', 'courses']
      })
    }
  }, [queryClient])

  const invalidateCategories = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: ['admin', 'categories']
    })
  }, [queryClient])

  const prefetchNextPage = useCallback((entity: 'quizzes' | 'courses', currentPage: number, limit: number) => {
    const nextPage = currentPage + 1
    queryClient.prefetchQuery({
      queryKey: ['admin', entity, { page: nextPage, limit }],
      queryFn: () => {
        // This will use the same queryFn as the main hooks
        if (entity === 'quizzes') {
          return fetch(`/api/admin/quizzes?page=${nextPage}&limit=${limit}`)
        } else {
          return fetch(`/api/admin/courses?page=${nextPage}&limit=${limit}`)
        }
      },
      staleTime: 2 * 60 * 1000, // 2 minutes for prefetched data
    })
  }, [queryClient])

  return {
    invalidateAdminQuizzes,
    invalidateAdminCourses, 
    invalidateCategories,
    prefetchNextPage
  }
}

// ==============================================
// INDIVIDUAL HOOKS (Current Pattern)
// ==============================================

/**
 * Fetch admin quizzes with pagination and caching
 */
export function useAdminQuizzes(page = 1, limit = 12) {
  return useQuery({
    queryKey: ['admin', 'quizzes', { page, limit }],
    queryFn: async (): Promise<AdminQuizzesResponse> => {
      const headers = await getAuthHeaders()
      
      const response = await fetch(`/api/admin/quizzes?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers,
        credentials: 'include'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch quizzes')
      }

      const data = await response.json()
      // Ensure we always return a valid structure
      return {
        success: true,
        quizzes: data.quizzes || [],
        pagination: data.pagination || { page, limit, total: 0, totalPages: 0 }
      }
    },
    staleTime: 3 * 60 * 1000, // 3 minutes (optimized for admin workflow)
    gcTime: 15 * 60 * 1000, // 15 minutes (longer retention for better UX)
    refetchOnWindowFocus: true, // Keep admin data fresh when switching back
    refetchOnMount: false, // Don't refetch if data is fresh
    refetchOnReconnect: true, // Refetch when connection restored
    retry: (failureCount, error) => {
      // Don't retry auth errors, retry network errors up to 2 times
      if (error.message.includes('Authentication') || error.message.includes('Unauthorized')) {
        return false
      }
      return failureCount < 2
    },
    placeholderData: (previousData) => previousData || { 
      success: false,
      quizzes: [], 
      pagination: { page, limit, total: 0, totalPages: 0 } 
    }, // Provide fallback structure when previousData is undefined
  })
}

/**
 * Fetch admin categories with caching
 */
export function useAdminCategories() {
  return useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: async (): Promise<{ categories: Category[] }> => {
      const headers = await getAuthHeaders()
      
      const response = await fetch('/api/admin/categories', {
        method: 'GET',
        headers,
        credentials: 'include'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch categories')
      }

      const data = await response.json()
      // Ensure we always return a valid structure
      return {
        categories: data.categories || []
      }
    },
    staleTime: 30 * 60 * 1000, // 30 minutes (categories rarely change)
    gcTime: 2 * 60 * 60 * 1000, // 2 hours (very long retention for static data)
    refetchOnWindowFocus: false, // Categories don't need frequent updates
    refetchOnMount: false, // Use cached data if available
    refetchOnReconnect: false, // Categories are static, no need to refetch
  })
}

/**
 * Fetch admin courses with pagination, search, and category filtering
 */
export function useAdminCourses(page = 1, limit = 50, search = '', category = 'all') {
  return useQuery({
    queryKey: ['admin', 'courses', { page, limit, search, category }],
    queryFn: async (): Promise<AdminCoursesResponse> => {
      const headers = await getAuthHeaders()
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search,
        category
      })
      
      const response = await fetch(`/api/admin/courses?${params}`, {
        method: 'GET',
        headers,
        credentials: 'include'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch courses')
      }

      const data = await response.json()
      return {
        courses: data.data || [],
        pagination: data.pagination || { page, limit, total: 0, totalPages: 0 },
        success: data.success
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes (longer retention for admin workflow)
    refetchOnWindowFocus: true, // Keep course data fresh
    refetchOnMount: false, // Don't refetch if data is fresh
    refetchOnReconnect: true, // Refetch when connection restored
    retry: (failureCount, error) => {
      if (error.message.includes('Authentication') || error.message.includes('Unauthorized')) {
        return false
      }
      return failureCount < 2
    },
    enabled: true, // Always enabled for admin
    placeholderData: (previousData) => previousData || { 
      courses: [], 
      pagination: { page, limit, total: 0, totalPages: 0 },
      success: false
    }
  })
}

/**
 * Fetch single quiz with caching
 */
export function useAdminQuiz(id: string | null) {
  return useQuery({
    queryKey: ['admin', 'quiz', id],
    queryFn: async (): Promise<Quiz> => {
      if (!id) throw new Error('Quiz ID required')
      
      const headers = await getAuthHeaders()
      
      const response = await fetch(`/api/admin/quizzes/${id}`, {
        method: 'GET',
        headers,
        credentials: 'include'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch quiz')
      }

      const result = await response.json()
      
      // The API returns the quiz object directly, not wrapped
      if (!result || !result.id) {
        throw new Error('Quiz not found or invalid response format')
      }
      
      return result
    },
    enabled: !!id, // Only run when id is provided
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime in newer versions)
  })
}

// ==============================================
// BATCHED HOOKS (Performance Optimization)
// ==============================================

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
      
      // Make parallel requests for better performance
      const [quizzesRes, categoriesRes] = await Promise.all([
        fetch(`/api/admin/quizzes?page=${page}&limit=${limit}`, {
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
        courses: [], // TODO: Add courses if needed
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

// ==============================================
// PUBLIC-FACING HOOKS (Student & General)
// ==============================================

/**
 * Fetch public courses with filtering and pagination
 */
interface CourseFilters {
  page?: number
  limit?: number
  category?: string
  level?: string
  search?: string
}

interface PublicCoursesResponse {
  data: Course[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasMore: boolean
  }
}

export function usePublicCourses(filters: CourseFilters = {}) {
  const { page = 1, limit = 9, category, level, search } = filters
  
  return useQuery({
    queryKey: ['public', 'courses', { page, limit, category, level, search }],
    queryFn: async (): Promise<PublicCoursesResponse> => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(category && { category }),
        ...(level && { level }),
        ...(search && { search })
      })
      
      const response = await fetch(`/api/courses?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch courses')
      }

      return response.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes (courses don't change frequently)
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false, // Don't refetch when switching tabs
    refetchOnMount: false, // Use cached data if available
  })
}

/**
 * Fetch course categories for public use
 */
export function usePublicCategories() {
  return useQuery({
    queryKey: ['public', 'categories'],
    queryFn: async (): Promise<string[]> => {
      const response = await fetch('/api/courses/categories')
      
      if (!response.ok) {
        throw new Error('Failed to fetch categories')
      }

      const data = await response.json()
      return data.categories || []
    },
    staleTime: 30 * 60 * 1000, // 30 minutes (categories rarely change)
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })
}

/**
 * Student dashboard data hooks
 */
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

export function useStudentDashboard(userId: string | null) {
  console.log('useStudentDashboard called with userId:', userId)
  
  return useQuery({
    queryKey: ['student', 'dashboard', userId],
    queryFn: async (): Promise<StudentDashboardResponse> => {
      if (!userId) throw new Error('User ID required')
      
      console.log('Fetching dashboard data for user:', userId)
      
      const headers = await getAuthHeaders()
      console.log('Auth headers:', headers)
      
      const response = await fetch(`/api/student/dashboard?userId=${userId}`, {
        method: 'GET',
        headers,
        credentials: 'include'
      })
      
      console.log('Dashboard API response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Dashboard API error:', errorData)
        throw new Error(errorData.error || `Failed to fetch dashboard data: ${response.status}`)
      }

      const data = await response.json()
      console.log('Dashboard API data:', data)
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
 * Quiz taking hooks
 */
interface QuizQuestion {
  id: string
  question: string
  options: string[]
  type: string
  points: number
  explanation?: string
}

interface QuizResponse {
  id: string
  title: string
  description: string
  questions: QuizQuestion[]
  timeLimit: number | null
  passingScore: number
}

export function useQuizForTaking(quizId: string | null) {
  return useQuery({
    queryKey: ['quiz', 'taking', quizId],
    queryFn: async (): Promise<QuizResponse> => {
      if (!quizId) throw new Error('Quiz ID required')
      
      const response = await fetch(`/api/quizzes/${quizId}/take`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch quiz')
      }

      return response.json()
    },
    enabled: !!quizId,
    staleTime: 10 * 60 * 1000, // 10 minutes (quiz content shouldn't change during session)
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false, // Don't refetch during quiz taking
    refetchOnMount: false,
  })
}

/**
 * Admin Users Management
 */
interface AdminUser {
  id: string
  name: string
  email: string
  role: UserRole
  created_at: string
  updated_at: string
  last_sign_in_at?: string
  is_active: boolean
}

export function useAdminUsers(page: number = 1, limit: number = 10, search?: string, roleFilter?: string) {
  return useQuery({
    queryKey: ['admin', 'users', { page, limit, search, roleFilter }],
    queryFn: async (): Promise<{ data: AdminUser[], pagination: PaginationMeta }> => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(roleFilter && roleFilter !== 'all' && { role: roleFilter })
      })

      const response = await fetch(`/api/admin/users?${params}`, {
        headers: await getAuthHeaders()
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to fetch users')
      }

      return response.json()
    },
    staleTime: 2 * 60 * 1000, // 2 minutes (user data changes less frequently)
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  })
}

/**
 * Admin Enrollments Management
 */
interface AdminEnrollment {
  id: string
  user_id: string
  course_id: string
  enrolled_at: string
  status: 'active' | 'completed' | 'suspended'
  progress_percentage: number
  last_accessed?: string
  completed_at?: string
  courses: {
    title: string
    instructor_name: string
    price: number
    level: string
  }
  users: {
    name: string
    email: string
  }
}

interface EnrollmentStats {
  totalEnrollments: number
  activeEnrollments: number
  completedEnrollments: number
  totalRevenue: number
}

export function useAdminEnrollments(page: number = 1, limit: number = 10, search?: string, statusFilter?: string) {
  return useQuery({
    queryKey: ['admin', 'enrollments', { page, limit, search, statusFilter }],
    queryFn: async (): Promise<{ data: AdminEnrollment[], pagination: PaginationMeta, stats: EnrollmentStats }> => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(statusFilter && statusFilter !== 'all' && { status: statusFilter })
      })

      const response = await fetch(`/api/admin/enrollments?${params}`, {
        headers: await getAuthHeaders()
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to fetch enrollments')
      }

      return response.json()
    },
    staleTime: 3 * 60 * 1000, // 3 minutes (enrollment data changes moderately)
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
  })
}

// ==============================================
// MUTATION HOOKS
// ==============================================

/**
 * Delete quiz mutation with cache invalidation
 */
export function useDeleteQuiz() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (quizId: string) => {
      const headers = await getAuthHeaders()
      
      const response = await fetch(`/api/admin/quizzes/${quizId}`, {
        method: 'DELETE',
        headers,
        credentials: 'include'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete quiz')
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate and refetch quiz lists
      queryClient.invalidateQueries({ queryKey: ['admin', 'quizzes'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] })
      logger.info('✅ Quiz deleted and cache invalidated')
    },
    onError: (error) => {
      logger.error('❌ Failed to delete quiz:', error)
    }
  })
}

/**
 * Create category mutation with cache invalidation
 */
export function useCreateCategory() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (categoryData: Partial<Category>) => {
      const headers = await getAuthHeaders()
      
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(categoryData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create category')
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate categories cache
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] })
      logger.info('✅ Category created and cache invalidated')
    },
    onError: (error) => {
      logger.error('❌ Failed to create category:', error)
    }
  })
}

// ==============================================
// PREFETCH UTILITIES
// ==============================================

/**
 * Prefetch quiz data for faster navigation
 */
export function usePrefetchQuiz() {
  const queryClient = useQueryClient()
  
  return (quizId: string) => {
    queryClient.prefetchQuery({
      queryKey: ['admin', 'quiz', quizId],
      queryFn: async () => {
        const headers = await getAuthHeaders()
        
        const response = await fetch(`/api/admin/quizzes/${quizId}`, {
          method: 'GET',
          headers,
          credentials: 'include'
        })

        if (!response.ok) throw new Error('Failed to prefetch quiz')
        
        const result = await response.json()
        
        // The API returns the quiz object directly, not wrapped
        if (!result || !result.id) {
          throw new Error('Quiz not found or invalid response format')
        }
        
        return result
      },
      staleTime: 5 * 60 * 1000,
    })
  }
}

// ==============================================
// BULK OPERATIONS
// ==============================================

/**
 * Bulk quiz operations mutation
 */
export function useBulkQuizOperations() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ action, itemIds, params }: { 
      action: 'publish' | 'unpublish' | 'delete' | 'duplicate' | 'archive' | 'export'
      itemIds: string[]
      params?: Record<string, any>
    }) => {
      const response = await fetch('/api/admin/quizzes/bulk', {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify({ action, itemIds, params })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Bulk operation failed')
      }

      return response.json()
    },
    onSuccess: (data, variables) => {
      // Invalidate quiz queries to refresh data
      queryClient.invalidateQueries({
        queryKey: ['admin', 'quizzes']
      })
      queryClient.invalidateQueries({
        queryKey: ['admin', 'dashboard']
      })

      logger.info('Bulk quiz operation completed', {
        action: variables.action,
        count: variables.itemIds.length
      })
    },
    onError: (error) => {
      logger.error('Bulk quiz operation failed', { error })
    }
  })
}

/**
 * Bulk course operations mutation
 */
export function useBulkCourseOperations() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ action, itemIds, params }: { 
      action: 'publish' | 'unpublish' | 'delete' | 'duplicate' | 'archive' | 'export'
      itemIds: string[]
      params?: Record<string, any>
    }) => {
      const response = await fetch('/api/admin/courses/bulk', {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify({ action, itemIds, params })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Bulk operation failed')
      }

      return response.json()
    },
    onSuccess: (data, variables) => {
      // Invalidate course queries to refresh data
      queryClient.invalidateQueries({
        queryKey: ['admin', 'courses']
      })
      queryClient.invalidateQueries({
        queryKey: ['admin', 'dashboard']
      })

      logger.info('Bulk course operation completed', {
        action: variables.action,
        count: variables.itemIds.length
      })
    },
    onError: (error) => {
      logger.error('Bulk course operation failed', { error })
    }
  })
}
