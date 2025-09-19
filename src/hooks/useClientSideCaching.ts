/**
 * Client-Side Caching Hooks
 * Week 2 Day 3: Persistent storage and offline capabilities
 */

'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CacheManager, OfflineStorage, cacheSynchronizer } from '@/lib/persistent-storage'
import { indexedDB, STORES } from '@/lib/indexeddb'
import { logger } from '@/lib/logger'
import { useToast } from './use-toast'

// ==============================================
// PERSISTENT STORAGE HOOKS
// ==============================================

export function usePersistentStorage() {
  const [isSupported, setIsSupported] = useState(false)
  const [storageStats, setStorageStats] = useState<{
    totalQuizzes: number
    totalQuestions: number
    totalProgress: number
    totalAttempts: number
    storageUsed: number
    storageQuota: number
  } | null>(null)

  const updateStorageStats = useCallback(async () => {
    try {
      const stats = await OfflineStorage.getStorageStats()
      setStorageStats(stats)
    } catch (error) {
      logger.error('Failed to get storage stats', { error })
    }
  }, [])

  useEffect(() => {
    // Check IndexedDB support
    const supported = typeof window !== 'undefined' && 'indexedDB' in window
    setIsSupported(supported)

    if (supported) {
      updateStorageStats()
    }
  }, [updateStorageStats])

  const clearAllStorage = useCallback(async () => {
    try {
      await CacheManager.clearAllCaches()
      await updateStorageStats()
      logger.info('All storage cleared')
    } catch (error) {
      logger.error('Failed to clear storage', { error })
      throw error
    }
  }, [updateStorageStats])

  return {
    isSupported,
    storageStats,
    updateStorageStats,
    clearAllStorage,
  }
}

// ==============================================
// OFFLINE QUIZ HOOKS
// ==============================================

export function useOfflineQuiz(quizId: string) {
  const { toast } = useToast()
  const [isAvailableOffline, setIsAvailableOffline] = useState(false)
  const [isStoringOffline, setIsStoringOffline] = useState(false)

  const checkOfflineAvailability = useCallback(async () => {
    try {
      const available = await OfflineStorage.isQuizAvailableOffline(quizId)
      setIsAvailableOffline(available)
    } catch (error) {
      logger.error('Failed to check offline availability', { error, quizId })
    }
  }, [quizId])

  // Check offline availability
  useEffect(() => {
    if (quizId) {
      checkOfflineAvailability()
    }
  }, [quizId, checkOfflineAvailability])

  // Store quiz for offline access
  const storeForOffline = useCallback(async () => {
    if (!quizId) return

    setIsStoringOffline(true)
    try {
      await OfflineStorage.storeQuizForOffline(quizId)
      setIsAvailableOffline(true)
      
      toast({
        title: "Quiz Stored Offline",
        description: "Quiz is now available for offline access",
        variant: "default",
      })
    } catch (error) {
      logger.error('Failed to store quiz offline', { error, quizId })
      
      toast({
        title: "Storage Failed",
        description: "Failed to store quiz for offline access",
        variant: "destructive",
      })
    } finally {
      setIsStoringOffline(false)
    }
  }, [quizId, toast])

  // Get offline quiz data
  const getOfflineData = useCallback(async () => {
    if (!quizId) return null
    return OfflineStorage.getOfflineQuiz(quizId)
  }, [quizId])

  return {
    isAvailableOffline,
    isStoringOffline,
    storeForOffline,
    getOfflineData,
    checkOfflineAvailability,
  }
}

// ==============================================
// PERSISTENT QUIZ PROGRESS HOOKS
// ==============================================

export function usePersistentQuizProgress(userId: string, quizId: string) {
  const { toast } = useToast()

  // Save progress with persistence
  const saveProgress = useCallback(async (progressData: any) => {
    if (!userId || !quizId) return

    try {
      // Always save to IndexedDB first (works offline)
      await OfflineStorage.saveProgressOffline(userId, quizId, progressData)

      // Try to sync to server if online
      if (navigator.onLine) {
        try {
          const response = await fetch('/api/quiz-progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              quizId,
              userId,
              answers: progressData.answers,
              currentQuestion: progressData.currentQuestion
            })
          })

          if (response.ok) {
            // Mark as synced
            await CacheManager.cacheUserProgress(userId, quizId, {
              ...progressData,
              synced_at: Date.now(),
              pending_sync: false
            })
          }
        } catch (syncError) {
          logger.warn('Failed to sync progress to server', { syncError })
          // Progress is still saved locally
        }
      }
    } catch (error) {
      logger.error('Failed to save progress', { error, userId, quizId })
      throw error
    }
  }, [userId, quizId])

  // Load progress from cache
  const loadProgress = useCallback(async () => {
    if (!userId || !quizId) return null

    try {
      return await CacheManager.getCachedUserProgress(userId, quizId)
    } catch (error) {
      logger.error('Failed to load progress', { error, userId, quizId })
      return null
    }
  }, [userId, quizId])

  return {
    saveProgress,
    loadProgress,
  }
}

// ==============================================
// OFFLINE QUIZ SUBMISSION HOOKS
// ==============================================

export function useOfflineQuizSubmission() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const submitQuiz = useMutation({
    mutationFn: async (submissionData: {
      userId: string
      quizId: string
      answers: Record<string, any>
      timeSpent: number
    }) => {
      const { userId, quizId, answers, timeSpent } = submissionData

      if (navigator.onLine) {
        // Try online submission first
        const response = await fetch('/api/quiz-submissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submissionData),
        })

        if (!response.ok) throw new Error('Online submission failed')
        return response.json()
      } else {
        // Submit offline
        const attemptId = await OfflineStorage.submitQuizOffline(
          userId, 
          quizId, 
          answers, 
          timeSpent
        )

        toast({
          title: "Submitted Offline",
          description: "Quiz will be synced when connection is restored",
          variant: "default",
        })

        return { id: attemptId, offline: true }
      }
    },

    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['quiz-attempts'] })
      queryClient.invalidateQueries({ queryKey: ['user-progress'] })

      if (!data.offline) {
        toast({
          title: "Quiz Submitted",
          description: "Your quiz has been submitted successfully",
          variant: "default",
        })
      }
    },

    onError: (error) => {
      logger.error('Quiz submission failed', { error })
      toast({
        title: "Submission Failed", 
        description: "Please check your connection and try again",
        variant: "destructive",
      })
    }
  })

  return {
    submitQuiz: submitQuiz.mutateAsync,
    isSubmitting: submitQuiz.isPending,
    error: submitQuiz.error,
  }
}

// ==============================================
// CACHE SYNCHRONIZATION HOOKS
// ==============================================

export function useCacheSynchronization() {
  const [syncStatus, setSyncStatus] = useState<{
    isOnline: boolean
    pendingProgressCount: number
    pendingAttemptCount: number
    cacheSize: number
  } | null>(null)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)
  const { toast } = useToast()

  // Update sync status
  const updateSyncStatus = useCallback(async () => {
    try {
      const status = await cacheSynchronizer.getSyncStatus()
      setSyncStatus(status)
    } catch (error) {
      logger.error('Failed to get sync status', { error })
    }
  }, [])

  // Manual force sync
  const forceSync = useCallback(async () => {
    try {
      await cacheSynchronizer.forcSync()
      setLastSyncTime(new Date())
      await updateSyncStatus()

      toast({
        title: "Sync Complete",
        description: "All changes have been synchronized",
        variant: "default",
      })
    } catch (error) {
      logger.error('Force sync failed', { error })
      
      toast({
        title: "Sync Failed",
        description: "Unable to sync changes. Check your connection.",
        variant: "destructive",
      })
    }
  }, [updateSyncStatus, toast])

  // Update status on mount and network changes
  useEffect(() => {
    updateSyncStatus()

    const handleOnline = () => updateSyncStatus()
    const handleOffline = () => updateSyncStatus()

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [updateSyncStatus])

  return {
    syncStatus,
    lastSyncTime,
    updateSyncStatus,
    forceSync,
    hasPendingChanges: (syncStatus?.pendingProgressCount || 0) + (syncStatus?.pendingAttemptCount || 0) > 0,
  }
}

// ==============================================
// ENHANCED QUIZ DATA WITH PERSISTENCE
// ==============================================

export function useEnhancedPersistentQuizData(quizId: string) {
  const { data: onlineData, isLoading, error } = useQuery({
    queryKey: ['quiz', quizId],
    queryFn: async () => {
      const response = await fetch(`/api/quizzes/${quizId}`)
      if (!response.ok) throw new Error('Failed to fetch quiz')
      return response.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!quizId && navigator.onLine,
  })

  const [cachedData, setCachedData] = useState<any>(null)
  const [isUsingCache, setIsUsingCache] = useState(false)

  const loadFromCache = useCallback(async () => {
    try {
      if (!quizId) return
      
      setIsUsingCache(true)
      const cached = await CacheManager.getCachedQuiz(quizId)
      
      if (cached) {
        setCachedData(cached)
        logger.info('Loaded quiz from cache', { quizId })
      } else {
        logger.warn('No cached data found', { quizId })
      }
    } catch (error) {
      logger.error('Failed to load from cache', { error, quizId })
    } finally {
      setIsUsingCache(false)
    }
  }, [quizId])

  // Load from cache when offline or on mount
  useEffect(() => {
    if (quizId && (!navigator.onLine || !onlineData)) {
      loadFromCache()
    }
  }, [quizId, onlineData, loadFromCache])

  // Cache online data when received
  useEffect(() => {
    if (onlineData && quizId) {
      CacheManager.cacheQuiz(onlineData)
        .catch((error: any) => logger.error('Failed to cache quiz', { error, quizId }))
    }
  }, [onlineData, quizId])

  // Return online data if available, otherwise cached data
  const data = useMemo(() => {
    return onlineData || cachedData
  }, [onlineData, cachedData])

  return {
    data,
    isLoading: isLoading && !cachedData,
    error: error && !cachedData ? error : null,
    isUsingCache,
    isOnline: navigator.onLine,
    refetch: loadFromCache,
  }
}

// ==============================================
// STORAGE CLEANUP HOOKS
// ==============================================

export function useStorageCleanup() {
  const cleanExpiredCache = useCallback(async () => {
    try {
      const deletedCount = await CacheManager.cleanExpired()
      logger.info('Cleaned expired cache entries', { count: deletedCount })
      return deletedCount
    } catch (error) {
      logger.error('Failed to clean expired cache', { error })
      throw error
    }
  }, [])

  const clearSpecificCache = useCallback(async (cacheKeys: string[]) => {
    try {
      for (const key of cacheKeys) {
        await indexedDB.delete(STORES.QUERY_CACHE, key)
      }
      logger.info('Cleared specific cache entries', { keys: cacheKeys })
    } catch (error) {
      logger.error('Failed to clear specific cache', { error, keys: cacheKeys })
      throw error
    }
  }, [])

  return {
    cleanExpiredCache,
    clearSpecificCache,
  }
}