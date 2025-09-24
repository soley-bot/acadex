/**
 * Progressive Enhancement Hooks
 * Week 2 Day 2: Advanced UX patterns for responsive interfaces
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { logger } from '@/lib/logger'
import { cacheKeys } from '@/hooks/useConsolidatedCaching'

// ==============================================
// OPTIMISTIC UI UPDATES
// ==============================================

export function useOptimisticQuizSubmission() {
  const queryClient = useQueryClient()
  const [isOptimistic, setIsOptimistic] = useState(false)
  
  return useMutation({
    mutationFn: async (submissionData: { 
      quizId: string
      userId: string
      answers: Record<string, any>
      timeSpent: number
    }) => {
      const response = await fetch('/api/quiz-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      })
      
      if (!response.ok) throw new Error('Submission failed')
      return response.json()
    },
    
    onMutate: async (submissionData) => {
      setIsOptimistic(true)
      
      // Cancel outgoing refetches for this quiz
      await queryClient.cancelQueries({ 
        queryKey: cacheKeys.quizAttempts(submissionData.quizId, submissionData.userId) 
      })
      
      // Snapshot previous value
      const previousAttempts = queryClient.getQueryData(
        cacheKeys.quizAttempts(submissionData.quizId, submissionData.userId)
      )
      
      // Create optimistic attempt
      const optimisticAttempt = {
        id: `optimistic-${Date.now()}`,
        quizId: submissionData.quizId,
        userId: submissionData.userId,
        answers: submissionData.answers,
        timeSpent: submissionData.timeSpent,
        score: calculateEstimatedScore(submissionData.answers), // Estimate score
        status: 'completed',
        submittedAt: new Date().toISOString(),
        isOptimistic: true, // Mark as optimistic
      }
      
      // Optimistically update attempts cache
      queryClient.setQueryData(
        cacheKeys.quizAttempts(submissionData.quizId, submissionData.userId),
        (old: any) => old ? [...old, optimisticAttempt] : [optimisticAttempt]
      )
      
      // Optimistically update user progress
      queryClient.setQueryData(
        cacheKeys.userProgress(submissionData.userId),
        (old: any) => {
          if (!old) return old
          return {
            ...old,
            completedQuizzes: [...(old.completedQuizzes || []), submissionData.quizId],
            totalScore: (old.totalScore || 0) + optimisticAttempt.score,
            lastActivity: new Date().toISOString(),
          }
        }
      )
      
      logger.info('Optimistic quiz submission applied', { 
        quizId: submissionData.quizId,
        estimatedScore: optimisticAttempt.score 
      })
      
      return { previousAttempts, optimisticAttempt }
    },
    
    onError: (err, submissionData, context) => {
      setIsOptimistic(false)
      
      // Revert optimistic updates
      if (context?.previousAttempts) {
        queryClient.setQueryData(
          cacheKeys.quizAttempts(submissionData.quizId, submissionData.userId),
          context.previousAttempts
        )
      }
      
      // Revert user progress
      queryClient.invalidateQueries({ 
        queryKey: cacheKeys.userProgress(submissionData.userId) 
      })
      
      logger.error('Quiz submission failed, reverted optimistic updates', { 
        error: err, 
        quizId: submissionData.quizId 
      })
    },
    
    onSuccess: (data, submissionData, context) => {
      setIsOptimistic(false)
      
      // Replace optimistic attempt with real data
      queryClient.setQueryData(
        cacheKeys.quizAttempts(submissionData.quizId, submissionData.userId),
        (old: any) => {
          if (!old) return [data]
          return old.map((attempt: any) => 
            attempt.id === context?.optimisticAttempt?.id ? data : attempt
          )
        }
      )
      
      logger.info('Quiz submission confirmed, updated with real data', { 
        quizId: submissionData.quizId,
        actualScore: data.score 
      })
    },
    
    onSettled: () => {
      setIsOptimistic(false)
    },
  })
}

// Helper function to estimate quiz score optimistically
function calculateEstimatedScore(answers: Record<string, string | number | boolean | string[] | number[]>): number {
  // Simple estimation - in real app, you might have more sophisticated logic
  const totalQuestions = Object.keys(answers).length
  const answeredQuestions = Object.values(answers).filter(answer => 
    answer !== null && answer !== undefined && answer !== ''
  ).length
  
  // Estimate 70-85% correct for completed answers
  const estimatedCorrect = Math.round(answeredQuestions * 0.75)
  return Math.round((estimatedCorrect / totalQuestions) * 100)
}

// ==============================================
// PROGRESSIVE LOADING STATES
// ==============================================

export function useProgressiveLoading<T>(
  data: T | undefined,
  isLoading: boolean,
  hasError: boolean
) {
  const [showSkeleton, setShowSkeleton] = useState(true)
  const [fadeIn, setFadeIn] = useState(false)
  
  useEffect(() => {
    if (data && !isLoading) {
      // Delay hiding skeleton slightly for smooth transition
      const timer = setTimeout(() => {
        setShowSkeleton(false)
        setFadeIn(true)
      }, 100)
      
      return () => clearTimeout(timer)
    } else if (isLoading) {
      setShowSkeleton(true)
      setFadeIn(false)
    }
  }, [data, isLoading])
  
  return {
    showSkeleton: showSkeleton && isLoading,
    showContent: !!data && !isLoading,
    showError: hasError && !isLoading,
    fadeIn,
    isEmpty: !data && !isLoading && !hasError,
  }
}

// ==============================================
// BACKGROUND SYNC WITH VISUAL FEEDBACK
// ==============================================

export function useBackgroundSyncStatus() {
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle')
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)
  const [pendingChanges, setPendingChanges] = useState(0)
  const statusTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  const startSync = useCallback(() => {
    setSyncStatus('syncing')
  }, [])
  
  const completeSync = useCallback((success: boolean) => {
    setSyncStatus(success ? 'success' : 'error')
    if (success) {
      setLastSyncTime(new Date())
      setPendingChanges(0)
    }
    
    // Clear any existing timeout
    if (statusTimeoutRef.current) {
      clearTimeout(statusTimeoutRef.current)
    }
    
    // Reset to idle after showing status
    statusTimeoutRef.current = setTimeout(() => setSyncStatus('idle'), 2000)
  }, [])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (statusTimeoutRef.current) {
        clearTimeout(statusTimeoutRef.current)
      }
    }
  }, [])
  
  const addPendingChange = useCallback(() => {
    setPendingChanges(prev => prev + 1)
  }, [])
  
  return {
    syncStatus,
    lastSyncTime,
    pendingChanges,
    startSync,
    completeSync,
    addPendingChange,
    isSyncing: syncStatus === 'syncing',
    hasPendingChanges: pendingChanges > 0,
  }
}

// ==============================================
// SMART RETRY WITH EXPONENTIAL BACKOFF
// ==============================================

export function useSmartRetry<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number
    baseDelay?: number
    maxDelay?: number
    onRetry?: (attempt: number, error: Error) => void
    onMaxRetriesReached?: (error: Error) => void
  } = {}
) {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    onRetry,
    onMaxRetriesReached,
  } = options
  
  const [isRetrying, setIsRetrying] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [lastError, setLastError] = useState<Error | null>(null)
  
  const executeWithRetry = useCallback(async (): Promise<T> => {
    let attempt = 0
    
    while (attempt <= maxRetries) {
      try {
        setIsRetrying(attempt > 0)
        setRetryCount(attempt)
        
        const result = await operation()
        
        // Success - reset states
        setIsRetrying(false)
        setRetryCount(0)
        setLastError(null)
        
        return result
      } catch (error) {
        const err = error as Error
        setLastError(err)
        
        if (attempt === maxRetries) {
          // Max retries reached
          setIsRetrying(false)
          onMaxRetriesReached?.(err)
          throw err
        }
        
        // Calculate delay with exponential backoff + jitter
        const delay = Math.min(
          baseDelay * Math.pow(2, attempt) + Math.random() * 1000,
          maxDelay
        )
        
        onRetry?.(attempt + 1, err)
        
        // Wait before next retry
        await new Promise(resolve => setTimeout(resolve, delay))
        attempt++
      }
    }
    
    throw lastError
  }, [operation, maxRetries, baseDelay, maxDelay, onRetry, onMaxRetriesReached, lastError])
  
  return {
    executeWithRetry,
    isRetrying,
    retryCount,
    lastError,
    canRetry: retryCount < maxRetries,
  }
}

// ==============================================
// OPTIMISTIC LIST OPERATIONS
// ==============================================

export function useOptimisticList<T extends { id: string }>(
  queryKey: readonly string[],
  initialData: T[] = []
) {
  const queryClient = useQueryClient()
  
  const addItemOptimistically = useCallback((item: T) => {
    queryClient.setQueryData(queryKey, (old: T[] = []) => {
      return [{ ...item, isOptimistic: true } as T, ...old]
    })
  }, [queryClient, queryKey])
  
  const updateItemOptimistically = useCallback((id: string, updates: Partial<T>) => {
    queryClient.setQueryData(queryKey, (old: T[] = []) => {
      return old.map(item => 
        item.id === id 
          ? { ...item, ...updates, isOptimistic: true } as T
          : item
      )
    })
  }, [queryClient, queryKey])
  
  const removeItemOptimistically = useCallback((id: string) => {
    queryClient.setQueryData(queryKey, (old: T[] = []) => {
      return old.filter(item => item.id !== id)
    })
  }, [queryClient, queryKey])
  
  const revertOptimisticChanges = useCallback(() => {
    queryClient.invalidateQueries({ queryKey })
  }, [queryClient, queryKey])
  
  return {
    addItemOptimistically,
    updateItemOptimistically,
    removeItemOptimistically,
    revertOptimisticChanges,
  }
}

// ==============================================
// NETWORK-AWARE OPERATIONS
// ==============================================

export function useNetworkAwareOperations() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [connectionType, setConnectionType] = useState<string>('unknown')
  const [queuedOperations, setQueuedOperations] = useState<Array<() => Promise<any>>>([])
  
  const executeQueuedOperations = useCallback(async () => {
    if (queuedOperations.length === 0) return
    
    logger.info('Executing queued operations', { count: queuedOperations.length })
    
    for (const operation of queuedOperations) {
      try {
        await operation()
      } catch (error) {
        logger.error('Queued operation failed', { error })
      }
    }
    
    setQueuedOperations([])
  }, [queuedOperations])
  
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      // Execute queued operations when back online
      executeQueuedOperations()
    }
    
    const handleOffline = () => setIsOnline(false)
    
    const handleConnectionChange = () => {
      const connection = (navigator as any).connection
      if (connection) {
        setConnectionType(connection.effectiveType || 'unknown')
      }
    }
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // Listen for connection changes
    const connection = (navigator as any).connection
    if (connection) {
      connection.addEventListener('change', handleConnectionChange)
      handleConnectionChange() // Get initial value
    }
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      connection?.removeEventListener('change', handleConnectionChange)
    }
  }, [executeQueuedOperations])
  
  const queueOperation = useCallback((operation: () => Promise<any>) => {
    if (isOnline) {
      // Execute immediately if online
      return operation()
    } else {
      // Queue for later if offline
      setQueuedOperations(prev => [...prev, operation])
      return Promise.resolve()
    }
  }, [isOnline])
  
  return {
    isOnline,
    connectionType,
    isSlowConnection: connectionType === 'slow-2g' || connectionType === '2g',
    queuedOperationsCount: queuedOperations.length,
    queueOperation,
    executeQueuedOperations,
  }
}