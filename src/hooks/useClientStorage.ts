/**
 * React Hooks for Client-Side Storage & Auto-Save
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { clientStorage, QuizProgress, UserPreferences } from '@/lib/clientStorage'

// ========================================
// QUIZ AUTO-SAVE HOOK
// ========================================

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
        attemptId: progressRef.current.attemptId || '',
        answers: progressRef.current.answers || {},
        currentQuestionIndex: progressRef.current.currentQuestionIndex || 0,
        startTime: progressRef.current.startTime || new Date().toISOString(),
        timeLeft: progressRef.current.timeLeft || 0,
        lastSaved: new Date().toISOString()
      }

      clientStorage.saveQuizProgress(progress)
      setLastSaved(new Date())
      setHasUnsavedChanges(false)
      onSave?.(progress)
    } catch (error) {
      console.error('Manual save failed:', error)
      onError?.(error as Error)
    } finally {
      setIsAutoSaving(false)
    }
  }, [enabled, quizId, userId, onSave, onError])

  // Restore saved progress
  const restoreProgress = useCallback(() => {
    if (!enabled) return null

    try {
      const saved = clientStorage.getQuizProgress(quizId, userId)
      if (saved) {
        progressRef.current = saved
        onRestore?.(saved)
        return saved
      }
    } catch (error) {
      console.error('Failed to restore progress:', error)
      onError?.(error as Error)
    }
    return null
  }, [enabled, quizId, userId, onRestore, onError])

  // Clear saved progress
  const clearProgress = useCallback(() => {
    clientStorage.clearQuizProgress(quizId, userId)
    clientStorage.stopAutoSave(quizId, userId)
    progressRef.current = {}
    setHasUnsavedChanges(false)
    setLastSaved(null)
  }, [quizId, userId])

  // Start/stop auto-save
  useEffect(() => {
    if (!enabled) return

    clientStorage.startAutoSave(
      quizId,
      userId,
      () => progressRef.current,
      intervalSeconds
    )

    return () => {
      clientStorage.stopAutoSave(quizId, userId)
    }
  }, [enabled, quizId, userId, intervalSeconds])

  // Save before page unload
  useEffect(() => {
    if (!enabled) return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        clientStorage.saveQuizProgress({
          quizId,
          userId,
          attemptId: progressRef.current.attemptId || '',
          answers: progressRef.current.answers || {},
          currentQuestionIndex: progressRef.current.currentQuestionIndex || 0,
          startTime: progressRef.current.startTime || new Date().toISOString(),
          timeLeft: progressRef.current.timeLeft || 0,
          lastSaved: new Date().toISOString()
        })
        
        // Show confirmation dialog
        e.preventDefault()
        e.returnValue = 'You have unsaved progress. Are you sure you want to leave?'
        return 'You have unsaved progress. Are you sure you want to leave?'
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [enabled, hasUnsavedChanges, quizId, userId])

  return {
    updateProgress,
    saveNow,
    restoreProgress,
    clearProgress,
    isAutoSaving,
    lastSaved,
    hasUnsavedChanges
  }
}

// ========================================
// NETWORK STATUS HOOK
// ========================================

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [wasOffline, setWasOffline] = useState(false)

  useEffect(() => {
    setIsOnline(navigator.onLine)

    const cleanup = clientStorage.onNetworkChange((online) => {
      if (!online) {
        setWasOffline(true)
      }
      setIsOnline(online)
    })

    return cleanup
  }, [])

  return { isOnline, wasOffline, isReconnecting: wasOffline && isOnline }
}

// ========================================
// USER PREFERENCES HOOK
// ========================================

export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>(
    clientStorage.getUserPreferences()
  )

  const updatePreferences = useCallback((updates: Partial<UserPreferences>) => {
    const newPreferences = { ...preferences, ...updates }
    setPreferences(newPreferences)
    clientStorage.saveUserPreferences(updates)
  }, [preferences])

  const resetPreferences = useCallback(() => {
    localStorage.removeItem('user_preferences')
    const defaultPrefs = clientStorage.getUserPreferences()
    setPreferences(defaultPrefs)
  }, [])

  return { preferences, updatePreferences, resetPreferences }
}

// ========================================
// QUIZ CACHING HOOK
// ========================================

export function useQuizCache(quizId: string) {
  const [cachedData, setCachedData] = useState<{ quiz: any; questions: any[] } | null>(null)
  const [isLoadingFromCache, setIsLoadingFromCache] = useState(true)

  // Try to load from cache first
  useEffect(() => {
    const cached = clientStorage.getCachedQuizData(quizId)
    setCachedData(cached)
    setIsLoadingFromCache(false)
  }, [quizId])

  // Cache new data
  const cacheQuizData = useCallback((quiz: any, questions: any[], ttlMinutes = 30) => {
    clientStorage.cacheQuizData(quizId, quiz, questions, ttlMinutes)
    setCachedData({ quiz, questions })
  }, [quizId])

  return { cachedData, cacheQuizData, isLoadingFromCache }
}

// ========================================
// PERSISTENT STATE HOOK (for form inputs, etc.)
// ========================================

export function usePersistentState<T>(
  key: string,
  defaultValue: T,
  storage: 'local' | 'session' = 'local'
): [T, (value: T | ((prev: T) => T)) => void] {
  const storageObject = storage === 'local' ? localStorage : sessionStorage

  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined') return defaultValue

    try {
      const stored = storageObject.getItem(key)
      return stored ? JSON.parse(stored) : defaultValue
    } catch {
      return defaultValue
    }
  })

  const updateState = useCallback((value: T | ((prev: T) => T)) => {
    setState(prevState => {
      const newValue = typeof value === 'function' ? (value as (prev: T) => T)(prevState) : value
      
      try {
        storageObject.setItem(key, JSON.stringify(newValue))
      } catch (error) {
        console.warn(`Failed to persist state for key "${key}":`, error)
      }
      
      return newValue
    })
  }, [key, storageObject])

  return [state, updateState]
}

// ========================================
// DEBOUNCED SAVE HOOK
// ========================================

export function useDebouncedSave<T>(
  value: T,
  saveFunction: (value: T) => void | Promise<void>,
  delay: number = 1000,
  enabled: boolean = true
) {
  const timeoutRef = useRef<NodeJS.Timeout>()
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  useEffect(() => {
    if (!enabled) return

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set new timeout
    timeoutRef.current = setTimeout(async () => {
      try {
        setIsSaving(true)
        await saveFunction(value)
        setLastSaved(new Date())
      } catch (error) {
        console.error('Debounced save failed:', error)
      } finally {
        setIsSaving(false)
      }
    }, delay)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [value, saveFunction, delay, enabled])

  return { isSaving, lastSaved }
}