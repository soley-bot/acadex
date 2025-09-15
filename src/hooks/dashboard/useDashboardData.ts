// Dashboard React Query Hooks
// Standardized API layer for all dashboard data fetching

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { logger } from '@/lib'
import type {
  DashboardData,
  EnrolledCourse,
  QuizAttempt,
  UserSettings,
  UserStats,
  ApiResponse,
  PaginationMeta
} from '@/types/dashboard'

// ==============================================
// DASHBOARD DATA HOOKS
// ==============================================

/**
 * Main dashboard data aggregation
 * Combines stats, recent courses, and quiz attempts
 */
export function useDashboardData() {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['dashboard', 'overview', user?.id],
    queryFn: async (): Promise<DashboardData> => {
      if (!user?.id) throw new Error('User not authenticated')
      
      const response = await fetch(`/api/dashboard/overview?userId=${user.id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data')
      }
      
      const data = await response.json()
      return data
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,  // 5 minutes
    gcTime: 10 * 60 * 1000,    // 10 minutes
    retry: 3
  })
}

// ==============================================
// COURSE HOOKS
// ==============================================

/**
 * User's enrolled courses with progress
 */
export function useEnrolledCourses() {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['dashboard', 'courses', user?.id],
    queryFn: async (): Promise<EnrolledCourse[]> => {
      if (!user?.id) throw new Error('User not authenticated')
      
      const response = await fetch(`/api/enrollments?userId=${user.id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch enrolled courses')
      }
      
      const result = await response.json()
      
      // Transform data to match our interface
      return result.data?.map((enrollment: any) => ({
        id: enrollment.course_id,
        course_id: enrollment.course_id,
        title: enrollment.courses.title,
        description: enrollment.courses.description || '',
        category: enrollment.courses.category || 'General',
        difficulty: enrollment.courses.level || 'Beginner',
        duration: enrollment.courses.duration || '4 weeks',
        progress_percentage: enrollment.progress || 0,
        last_accessed: enrollment.last_accessed || enrollment.enrolled_at,
        enrolled_at: enrollment.enrolled_at,
        total_lessons: enrollment.courses.total_lessons || 20,
        completed_lessons: Math.round((enrollment.progress || 0) / 100 * 20),
        created_at: enrollment.enrolled_at,
        next_lesson: enrollment.progress < 100 ? {
          id: 'next-lesson',
          title: 'Continue Learning'
        } : undefined
      })) || []
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 3
  })
}

// ==============================================
// QUIZ HOOKS
// ==============================================

/**
 * User's quiz attempts with pagination
 */
export function useQuizAttempts(limit = 10, page = 1) {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['dashboard', 'quiz-attempts', user?.id, { limit, page }],
    queryFn: async (): Promise<{ data: QuizAttempt[], pagination: PaginationMeta }> => {
      if (!user?.id) throw new Error('User not authenticated')
      
      const response = await fetch(
        `/api/quiz-attempts?userId=${user.id}&limit=${limit}&page=${page}`
      )
      if (!response.ok) {
        throw new Error('Failed to fetch quiz attempts')
      }
      
      const result = await response.json()
      
      // Transform data to match our interface
      const transformedData = result.data?.map((attempt: any) => ({
        id: attempt.id,
        quiz_id: attempt.quiz_id,
        user_id: attempt.user_id,
        quiz_title: attempt.quiz_title,
        category: attempt.category || 'General',
        difficulty: attempt.difficulty || 'Intermediate',
        score: attempt.score || 0,
        total_questions: attempt.total_questions || 0,
        percentage: Math.min(Math.max(attempt.percentage || 0, 0), 100),
        completed_at: attempt.completed_at,
        time_taken_minutes: attempt.time_taken_minutes || 15,
        created_at: attempt.completed_at,
        timeSpent: `${attempt.time_taken_minutes || 15} min`
      })) || []
      
      return {
        data: transformedData,
        pagination: result.pagination
      }
    },
    enabled: !!user?.id,
    staleTime: 3 * 60 * 1000,  // 3 minutes (more frequent updates)
    gcTime: 10 * 60 * 1000,
    retry: 3
  })
}

/**
 * Available quizzes for taking
 */
export function useAvailableQuizzes(limit = 20) {
  return useQuery({
    queryKey: ['dashboard', 'available-quizzes', { limit }],
    queryFn: async () => {
      const response = await fetch(`/api/quizzes?limit=${limit}&published=true`)
      if (!response.ok) {
        throw new Error('Failed to fetch available quizzes')
      }
      
      return response.json()
    },
    staleTime: 10 * 60 * 1000,  // 10 minutes (less frequent updates)
    gcTime: 15 * 60 * 1000,
    retry: 3
  })
}

// ==============================================
// USER SETTINGS HOOKS
// ==============================================

/**
 * User settings and preferences
 */
export function useUserSettings() {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['dashboard', 'settings', user?.id],
    queryFn: async (): Promise<UserSettings> => {
      if (!user?.id) throw new Error('User not authenticated')
      
      const response = await fetch(`/api/user/settings?userId=${user.id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch user settings')
      }
      
      return response.json()
    },
    enabled: !!user?.id,
    staleTime: 15 * 60 * 1000,  // 15 minutes (settings change infrequently)
    gcTime: 30 * 60 * 1000,
    retry: 3
  })
}

/**
 * Update user settings mutation
 */
export function useUpdateUserSettings() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (settings: Partial<UserSettings>) => {
      if (!user?.id) throw new Error('User not authenticated')
      
      const response = await fetch(`/api/user/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id, ...settings })
      })
      
      if (!response.ok) {
        throw new Error('Failed to update settings')
      }
      
      return response.json()
    },
    onSuccess: () => {
      // Invalidate settings cache
      queryClient.invalidateQueries({
        queryKey: ['dashboard', 'settings', user?.id]
      })
      logger.info('User settings updated successfully')
    },
    onError: (error) => {
      logger.error('Failed to update user settings:', error)
    }
  })
}

// ==============================================
// STATS & PROGRESS HOOKS
// ==============================================

/**
 * User progress statistics
 */
export function useUserStats() {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['dashboard', 'stats', user?.id],
    queryFn: async (): Promise<UserStats> => {
      if (!user?.id) throw new Error('User not authenticated')
      
      const response = await fetch(`/api/user/stats?userId=${user.id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch user statistics')
      }
      
      return response.json()
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,   // 5 minutes
    gcTime: 15 * 60 * 1000,
    retry: 3
  })
}

// ==============================================
// CACHE UTILITIES
// ==============================================

/**
 * Invalidate dashboard-related caches
 */
export function useDashboardCacheUtils() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  const invalidateAll = () => {
    queryClient.invalidateQueries({
      queryKey: ['dashboard']
    })
  }
  
  const invalidateCourses = () => {
    queryClient.invalidateQueries({
      queryKey: ['dashboard', 'courses', user?.id]
    })
  }
  
  const invalidateQuizzes = () => {
    queryClient.invalidateQueries({
      queryKey: ['dashboard', 'quiz-attempts', user?.id]
    })
  }
  
  const invalidateStats = () => {
    queryClient.invalidateQueries({
      queryKey: ['dashboard', 'stats', user?.id]
    })
  }
  
  return {
    invalidateAll,
    invalidateCourses,
    invalidateQuizzes,
    invalidateStats
  }
}

// ==============================================
// ERROR HANDLING HOOK
// ==============================================

/**
 * Centralized error handling for dashboard
 */
export function useDashboardErrorHandler() {
  const queryClient = useQueryClient()
  
  return {
    handleError: (error: Error, context: string) => {
      logger.error(`Dashboard error in ${context}:`, error)
      // Could add toast notifications, error reporting, etc.
    },
    
    handleRetry: (queryKey: string[]) => {
      queryClient.refetchQueries({ queryKey })
    }
  }
}