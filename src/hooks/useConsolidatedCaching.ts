/**
 * Consolidated Caching Utilities
 * Combines the essential functions from multiple caching hooks
 * Includes smartCache functionality for useSmartRedirect
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect, useCallback, useRef } from 'react'
import { clientStorage, QuizProgress, UserPreferences } from '@/lib/clientStorage'
import { logger } from '@/lib/logger'

// Re-export cache utilities from lib for convenience
export { cacheUtils, withCache } from '@/lib/cache-utils'

// ==============================================
// CACHE KEYS (from useAdvancedCaching.ts)
// ==============================================

export const cacheKeys = {
  // Hierarchical cache keys for precise invalidation
  all: ['acadex'] as const,
  
  // User-related caches
  users: () => [...cacheKeys.all, 'users'] as const,
  user: (id: string) => [...cacheKeys.users(), id] as const,
  userProfile: (id: string) => [...cacheKeys.user(id), 'profile'] as const,
  userProgress: (id: string) => [...cacheKeys.user(id), 'progress'] as const,
  userQuizzes: (id: string) => [...cacheKeys.user(id), 'quizzes'] as const,
  
  // Quiz-related caches  
  quizzes: () => [...cacheKeys.all, 'quizzes'] as const,
  quiz: (id: string) => [...cacheKeys.quizzes(), id] as const,
  quizQuestions: (id: string) => [...cacheKeys.quiz(id), 'questions'] as const,
  quizAttempts: (quizId: string, userId?: string) => 
    userId 
      ? [...cacheKeys.quiz(quizId), 'attempts', userId] as const
      : [...cacheKeys.quiz(quizId), 'attempts'] as const,
  
  // Course-related caches
  courses: () => [...cacheKeys.all, 'courses'] as const,
  course: (id: string) => [...cacheKeys.courses(), id] as const,
  courseQuizzes: (id: string) => [...cacheKeys.course(id), 'quizzes'] as const,
  
  // Admin caches with fine-grained control
  admin: () => [...cacheKeys.all, 'admin'] as const,
  adminDashboard: () => [...cacheKeys.admin(), 'dashboard'] as const,
  adminUsers: (page?: number) => 
    page ? [...cacheKeys.admin(), 'users', page] as const : [...cacheKeys.admin(), 'users'] as const,
  adminQuizzes: (page?: number, filters?: Record<string, any>) => 
    filters ? [...cacheKeys.admin(), 'quizzes', page, filters] as const : [...cacheKeys.admin(), 'quizzes', page] as const,
  adminCourses: (page?: number, filters?: Record<string, any>) => 
    filters ? [...cacheKeys.admin(), 'courses', page, filters] as const : [...cacheKeys.admin(), 'courses', page] as const,
    
  // Analytics caches
  analytics: () => [...cacheKeys.all, 'analytics'] as const,
}

// ==============================================
// QUIZ AUTO-SAVE (from useClientStorage.ts)
// ==============================================

export interface UseQuizAutoSaveOptions {
  quizId: string
  userId: string
  enabled?: boolean
  intervalSeconds?: number
  onSave?: (progress: QuizProgress) => void
  onRestore?: (progress: QuizProgress) => void
  onError?: (error: Error) => void
}

export function useQuizAutoSave(options: UseQuizAutoSaveOptions) {
  const {
    quizId,
    userId,
    enabled = true,
    intervalSeconds = 30,
    onSave,
    onRestore,
    onError
  } = options

  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const progressRef = useRef<Partial<QuizProgress>>({})

  // Update progress data without triggering re-renders
  const updateProgress = useCallback((data: Partial<QuizProgress>) => {
    progressRef.current = { ...progressRef.current, ...data }
    setHasUnsavedChanges(true)
  }, [])

  // Manual save function
  const saveNow = useCallback(async () => {
    if (!enabled || !progressRef.current) return

    try {
      setIsAutoSaving(true)
      const progress: QuizProgress = {
        quizId,
        userId,
        attemptId: progressRef.current.attemptId || `attempt-${Date.now()}`,
        answers: progressRef.current.answers || {},
        currentQuestionIndex: progressRef.current.currentQuestionIndex || 0,
        startTime: progressRef.current.startTime || new Date().toISOString(),
        timeLeft: progressRef.current.timeLeft || 0,
        lastSaved: new Date().toISOString()
      }

      await clientStorage.saveQuizProgress(progress)
      setLastSaved(new Date())
      setHasUnsavedChanges(false)
      onSave?.(progress)
    } catch (error) {
      logger.error('Auto-save failed', { error, quizId, userId })
      onError?.(error as Error)
    } finally {
      setIsAutoSaving(false)
    }
  }, [enabled, quizId, userId, onSave, onError])

  // Auto-save interval
  useEffect(() => {
    if (!enabled || !hasUnsavedChanges) return

    const interval = setInterval(saveNow, intervalSeconds * 1000)
    return () => clearInterval(interval)
  }, [enabled, hasUnsavedChanges, saveNow, intervalSeconds])

  // Restore progress on mount
  useEffect(() => {
    if (!enabled) return

    const restoreProgress = async () => {
      try {
        const progress = await clientStorage.getQuizProgress(quizId, userId)
        if (progress) {
          progressRef.current = progress
          onRestore?.(progress)
        }
      } catch (error) {
        logger.error('Failed to restore progress', { error, quizId, userId })
        onError?.(error as Error)
      }
    }

    restoreProgress()
  }, [enabled, quizId, userId, onRestore, onError])

  return {
    isAutoSaving,
    lastSaved,
    hasUnsavedChanges,
    updateProgress,
    saveNow
  }
}

// ==============================================
// BACKGROUND SYNC (from useAdvancedCaching.ts)
// ==============================================

export function useBackgroundSync() {
  const queryClient = useQueryClient()
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle')

  const syncData = useCallback(async () => {
    setSyncStatus('syncing')
    try {
      // Invalidate all caches to trigger fresh data fetch
      await queryClient.invalidateQueries({ queryKey: cacheKeys.all })
      setSyncStatus('idle')
      logger.info('Background sync completed')
    } catch (error) {
      setSyncStatus('error')
      logger.error('Background sync failed', { error })
    }
  }, [queryClient])

  // Sync on window focus
  useEffect(() => {
    const handleFocus = () => {
      if (document.hidden === false) {
        syncData()
      }
    }

    document.addEventListener('visibilitychange', handleFocus)
    return () => document.removeEventListener('visibilitychange', handleFocus)
  }, [syncData])

  return {
    syncStatus,
    syncData
  }
}

// ==============================================
// QUIZ CACHE (from useClientStorage.ts)
// ==============================================

export function useQuizCache(quizId: string) {
  const [cachedData, setCachedData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const getCachedQuiz = useCallback(async () => {
    if (!quizId) return null

    try {
      setIsLoading(true)
      const cached = await clientStorage.getCachedQuizData(quizId)
      setCachedData(cached)
      return cached
    } catch (error) {
      logger.error('Failed to get cached quiz', { error, quizId })
      return null
    } finally {
      setIsLoading(false)
    }
  }, [quizId])

  const cacheQuiz = useCallback(async (quizData: any) => {
    try {
      clientStorage.cacheQuizData(quizId, quizData.quiz, quizData.questions)
      setCachedData(quizData)
    } catch (error) {
      logger.error('Failed to cache quiz', { error, quizId })
    }
  }, [quizId])

  useEffect(() => {
    getCachedQuiz()
  }, [getCachedQuiz])

  return {
    cachedData,
    isLoading,
    getCachedQuiz,
    cacheQuiz
  }
}

// ==============================================
// USER PREFERENCES (from useClientStorage.ts)
// ==============================================

export function useUserPreferences(userId: string) {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const loadPreferences = useCallback(async () => {
    if (!userId) return

    try {
      setIsLoading(true)
      const prefs = clientStorage.getUserPreferences()
      setPreferences(prefs)
    } catch (error) {
      logger.error('Failed to load preferences', { error, userId })
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  const updatePreferences = useCallback(async (updates: Partial<UserPreferences>) => {
    if (!userId || !preferences) return

    try {
      const updated = { ...preferences, ...updates }
      clientStorage.saveUserPreferences(updated)
      setPreferences(updated)
    } catch (error) {
      logger.error('Failed to update preferences', { error, userId })
    }
  }, [userId, preferences])

  useEffect(() => {
    loadPreferences()
  }, [loadPreferences])

  return {
    preferences,
    isLoading,
    updatePreferences,
    reload: loadPreferences
  }
}

// ==============================================
// NETWORK STATUS (from useClientStorage.ts)
// ==============================================

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true)
  const [connectionType, setConnectionType] = useState<'slow' | 'fast' | 'unknown'>('unknown')

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Detect connection speed
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      const updateConnectionType = () => {
        if (connection.effectiveType === '4g') {
          setConnectionType('fast')
        } else if (connection.effectiveType === '3g' || connection.effectiveType === '2g') {
          setConnectionType('slow')
        } else {
          setConnectionType('unknown')
        }
      }
      
      updateConnectionType()
      connection.addEventListener('change', updateConnectionType)
      
      return () => {
        window.removeEventListener('online', handleOnline)
        window.removeEventListener('offline', handleOffline)
        connection.removeEventListener('change', updateConnectionType)
      }
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return {
    isOnline,
    connectionType,
    isSlowConnection: connectionType === 'slow'
  }
}