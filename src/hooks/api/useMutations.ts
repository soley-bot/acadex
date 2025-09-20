/**
 * Mutation hooks for admin operations
 */
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { logger, supabase } from '@/lib'

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