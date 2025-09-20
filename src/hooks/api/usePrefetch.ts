/**
 * Prefetch utilities for performance optimization
 */
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib'

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