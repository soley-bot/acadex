/**
 * Admin quiz-related hooks using React Query for optimized caching
 */
import { useQuery } from '@tanstack/react-query'
import { logger, supabase, type Quiz } from '@/lib'
import type { AdminQuizzesResponse } from '@/types'

// Auth helper
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