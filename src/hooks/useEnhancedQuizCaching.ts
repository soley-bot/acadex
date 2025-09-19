/**
 * Enhanced Quiz Caching Hooks
 * Week 2 Day 1: Advanced caching for quiz-specific operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect } from 'react'
import { cacheKeys, cacheTimings, useSmartCacheInvalidation, useOptimisticUpdates, usePrefetchingStrategy } from './useAdvancedCaching'
import { logger } from '@/lib/logger'
import { supabase } from '@/lib/supabase'

// ==============================================
// ENHANCED QUIZ HOOKS WITH ADVANCED CACHING
// ==============================================

export function useEnhancedQuizData(quizId: string, options?: { prefetchQuestions?: boolean }) {
  const { prefetchQuizQuestions } = usePrefetchingStrategy()
  
  const query = useQuery({
    queryKey: cacheKeys.quiz(quizId),
    queryFn: async () => {
      const response = await fetch(`/api/quizzes/${quizId}`)
      if (!response.ok) throw new Error('Failed to fetch quiz')
      return response.json()
    },
    ...cacheTimings.interactive,
    enabled: !!quizId,
    placeholderData: (previousData) => previousData, // Keep previous data while loading
  })
  
  // Prefetch questions when quiz data loads successfully
  useEffect(() => {
    if (query.data && options?.prefetchQuestions) {
      prefetchQuizQuestions(quizId)
    }
  }, [query.data, options?.prefetchQuestions, prefetchQuizQuestions, quizId])
  
  return {
    ...query,
    quiz: query.data,
  }
}

export function useEnhancedQuizQuestions(quizId: string) {
  const queryClient = useQueryClient()
  
  return useQuery({
    queryKey: cacheKeys.quizQuestions(quizId),
    queryFn: async () => {
      const response = await fetch(`/api/quizzes/${quizId}/questions`)
      if (!response.ok) throw new Error('Failed to fetch quiz questions')
      return response.json()
    },
    ...cacheTimings.interactive,
    enabled: !!quizId,
    placeholderData: () => {
      // Try to get questions from the main quiz cache first
      const quizData = queryClient.getQueryData(cacheKeys.quiz(quizId)) as any
      return quizData?.questions || undefined
    },
    staleTime: 10 * 60 * 1000, // Questions don't change during a session
    gcTime: 30 * 60 * 1000, // Keep questions cached longer
  })
}

// ==============================================
// QUIZ ATTEMPT CACHING WITH OPTIMISTIC UPDATES
// ==============================================

export function useEnhancedQuizAttempts(quizId: string, userId: string) {
  return useQuery({
    queryKey: cacheKeys.quizAttempts(quizId, userId),
    queryFn: async () => {
      const response = await fetch(`/api/quizzes/${quizId}/attempts?userId=${userId}`)
      if (!response.ok) throw new Error('Failed to fetch quiz attempts')
      return response.json()
    },
    ...cacheTimings.realtime, // Quiz attempts need to be fresh
    enabled: !!(quizId && userId),
  })
}

export function useQuizAttemptMutation() {
  const queryClient = useQueryClient()
  const { invalidateQuizRelated } = useSmartCacheInvalidation()
  const { updateQuizOptimistically } = useOptimisticUpdates()
  
  return useMutation({
    mutationFn: async (attemptData: { quizId: string; userId: string; answers: any; score?: number }) => {
      const response = await fetch('/api/quiz-attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attemptData),
      })
      
      if (!response.ok) throw new Error('Failed to submit quiz attempt')
      return response.json()
    },
    
    onMutate: async (attemptData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: cacheKeys.quizAttempts(attemptData.quizId, attemptData.userId) })
      
      // Snapshot previous value
      const previousAttempts = queryClient.getQueryData(cacheKeys.quizAttempts(attemptData.quizId, attemptData.userId))
      
      // Optimistically update the cache
      const optimisticAttempt = {
        id: `temp-${Date.now()}`,
        ...attemptData,
        createdAt: new Date().toISOString(),
        status: 'completed',
      }
      
      queryClient.setQueryData(
        cacheKeys.quizAttempts(attemptData.quizId, attemptData.userId),
        (old: any) => old ? [...old, optimisticAttempt] : [optimisticAttempt]
      )
      
      // Update quiz statistics optimistically
      if (attemptData.score !== undefined) {
        updateQuizOptimistically(attemptData.quizId, {
          totalAttempts: (old: any) => (old?.totalAttempts || 0) + 1,
          lastAttemptScore: attemptData.score,
        })
      }
      
      return { previousAttempts }
    },
    
    onError: (err, attemptData, context) => {
      // Revert optimistic updates on error
      if (context?.previousAttempts) {
        queryClient.setQueryData(
          cacheKeys.quizAttempts(attemptData.quizId, attemptData.userId),
          context.previousAttempts
        )
      }
      
      logger.error('Quiz attempt submission failed', { error: err, attemptData })
    },
    
    onSettled: (data, error, attemptData) => {
      // Always refetch to ensure consistency
      invalidateQuizRelated(attemptData.quizId)
      queryClient.invalidateQueries({ queryKey: cacheKeys.quizAttempts(attemptData.quizId, attemptData.userId) })
    },
  })
}

// ==============================================
// USER PROGRESS CACHING WITH BACKGROUND SYNC
// ==============================================

export function useEnhancedUserProgress(userId: string) {
  return useQuery({
    queryKey: cacheKeys.userProgress(userId),
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}/progress`)
      if (!response.ok) throw new Error('Failed to fetch user progress')
      return response.json()
    },
    ...cacheTimings.background,
    enabled: !!userId,
    refetchInterval: 5 * 60 * 1000, // Background refresh every 5 minutes
    refetchIntervalInBackground: true, // Continue refreshing even when tab is not active
  })
}

// ==============================================
// QUIZ ANALYTICS WITH SMART INVALIDATION
// ==============================================

export function useQuizAnalytics(quizId: string, dateRange?: string) {
  return useQuery({
    queryKey: cacheKeys.analyticsQuizzes(dateRange),
    queryFn: async () => {
      const params = new URLSearchParams()
      if (quizId) params.append('quizId', quizId)
      if (dateRange) params.append('dateRange', dateRange)
      
      const response = await fetch(`/api/analytics/quizzes?${params}`)
      if (!response.ok) throw new Error('Failed to fetch quiz analytics')
      return response.json()
    },
    ...cacheTimings.background,
    enabled: !!quizId,
  })
}

// ==============================================
// BULK QUIZ OPERATIONS WITH BATCH INVALIDATION
// ==============================================

export function useBulkQuizOperations() {
  const queryClient = useQueryClient()
  const { invalidateQuizRelated, invalidateAnalytics } = useSmartCacheInvalidation()
  
  const bulkUpdate = useMutation({
    mutationFn: async (updates: { quizIds: string[]; changes: Record<string, any> }) => {
      const response = await fetch('/api/quizzes/bulk-update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      
      if (!response.ok) throw new Error('Bulk update failed')
      return response.json()
    },
    
    onSuccess: (data, variables) => {
      // Invalidate all affected quizzes
      variables.quizIds.forEach(quizId => {
        invalidateQuizRelated(quizId)
      })
      
      // Invalidate analytics if quiz status changed
      if (variables.changes.isPublished !== undefined) {
        invalidateAnalytics()
      }
      
      logger.info('Bulk quiz update completed', { 
        quizCount: variables.quizIds.length,
        changes: variables.changes 
      })
    },
  })
  
  const bulkDelete = useMutation({
    mutationFn: async (quizIds: string[]) => {
      const response = await fetch('/api/quizzes/bulk-delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizIds }),
      })
      
      if (!response.ok) throw new Error('Bulk delete failed')
      return response.json()
    },
    
    onSuccess: (data, quizIds) => {
      // Remove from cache and invalidate related queries
      quizIds.forEach(quizId => {
        queryClient.removeQueries({ queryKey: cacheKeys.quiz(quizId) })
        queryClient.removeQueries({ queryKey: cacheKeys.quizQuestions(quizId) })
        queryClient.removeQueries({ queryKey: cacheKeys.quizAttempts(quizId) })
      })
      
      // Invalidate lists and analytics
      queryClient.invalidateQueries({ queryKey: cacheKeys.quizzes() })
      invalidateAnalytics()
      
      logger.info('Bulk quiz deletion completed', { deletedCount: quizIds.length })
    },
  })
  
  return {
    bulkUpdate,
    bulkDelete,
  }
}

// ==============================================
// INTELLIGENT PREFETCHING FOR QUIZ SEQUENCES
// ==============================================

export function useQuizSequencePrefetching() {
  const { prefetchQuizQuestions, prefetchUserProgress } = usePrefetchingStrategy()
  const queryClient = useQueryClient()
  
  const prefetchNextQuiz = useCallback(async (currentQuizId: string, userId: string) => {
    try {
      // Get current quiz to find the next one
      const currentQuiz = queryClient.getQueryData(cacheKeys.quiz(currentQuizId)) as any
      
      if (currentQuiz?.courseId) {
        // Prefetch other quizzes in the same course
        const courseQuizzes = await queryClient.fetchQuery({
          queryKey: cacheKeys.courseQuizzes(currentQuiz.courseId),
          queryFn: () => fetch(`/api/courses/${currentQuiz.courseId}/quizzes`).then(r => r.json()),
          ...cacheTimings.background,
        })
        
        // Find next quiz
        const currentIndex = courseQuizzes.findIndex((quiz: any) => quiz.id === currentQuizId)
        const nextQuiz = courseQuizzes[currentIndex + 1]
        
        if (nextQuiz) {
          // Prefetch next quiz data and questions
          prefetchQuizQuestions(nextQuiz.id)
          queryClient.prefetchQuery({
            queryKey: cacheKeys.quiz(nextQuiz.id),
            queryFn: () => fetch(`/api/quizzes/${nextQuiz.id}`).then(r => r.json()),
            ...cacheTimings.interactive,
          })
        }
      }
      
      // Always prefetch user progress for completion tracking
      prefetchUserProgress(userId)
      
    } catch (error) {
      logger.warn('Failed to prefetch next quiz', { error, currentQuizId })
    }
  }, [queryClient, prefetchQuizQuestions, prefetchUserProgress])
  
  return { prefetchNextQuiz }
}