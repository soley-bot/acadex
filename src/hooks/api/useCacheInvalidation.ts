/**
 * Smart cache invalidation hooks for optimized user experience
 */
import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

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