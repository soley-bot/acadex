/**
 * Optimized API hooks using React Query
 * Replaces direct fetch calls with smart caching
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, Quiz, Course } from '@/lib/supabase'
import { logger } from '@/lib/logger'

// ==============================================
// TYPES & INTERFACES
// ==============================================

interface Category {
  id: string
  name: string
  type: string
  color: string
}

export interface AdminQuizzesResponse {
  quizzes: Quiz[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface AdminDashboardData {
  quizzes: Quiz[]
  categories: Category[]
  courses: Course[]
  stats: {
    totalQuizzes: number
    totalCourses: number
    totalStudents: number
  }
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
        quizzes: data.quizzes || [],
        pagination: data.pagination || { page, limit, total: 0, totalPages: 0 }
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes (quizzes change frequently)
    gcTime: 5 * 60 * 1000, // 5 minutes (renamed from cacheTime in newer versions)
    placeholderData: (previousData) => previousData || { 
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
    staleTime: 10 * 60 * 1000, // 10 minutes (categories don't change often)
    gcTime: 30 * 60 * 1000, // 30 minutes (renamed from cacheTime in newer versions)
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
    queryFn: async (): Promise<AdminDashboardData> => {
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
        quizzes: quizzesData.quizzes || [],
        categories: categoriesData.categories || [],
        courses: [], // TODO: Add courses if needed
        stats: {
          totalQuizzes: quizzesData.pagination?.total || 0,
          totalCourses: 0,
          totalStudents: 0
        }
      }
    },
    staleTime: 30 * 1000, // 30 seconds (shorter for more responsive updates)
    gcTime: 5 * 60 * 1000, // 5 minutes (renamed from cacheTime in newer versions)
    placeholderData: (previousData) => previousData || {
      quizzes: [],
      categories: [],
      courses: [],
      stats: { totalQuizzes: 0, totalCourses: 0, totalStudents: 0 }
    }, // Provide fallback structure when previousData is undefined
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
    refetchOnMount: true, // Always fetch fresh data on mount
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
