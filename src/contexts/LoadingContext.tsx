/**
 * SMART LOADING STATE MANAGER
 * Centralized loading states with intelligent caching and UX optimization
 */

'use client'

import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import { logger } from '@/lib/logger'

interface LoadingState {
  id: string
  isLoading: boolean
  progress?: number
  message?: string
  startTime: number
  timeout?: number
}

interface LoadingContextType {
  loadingStates: Map<string, LoadingState>
  isGlobalLoading: boolean
  startLoading: (id: string, options?: { 
    message?: string
    timeout?: number
    progress?: number 
  }) => void
  updateLoading: (id: string, updates: { 
    progress?: number
    message?: string 
  }) => void
  stopLoading: (id: string) => void
  isLoading: (id: string) => boolean
  getLoadingState: (id: string) => LoadingState | undefined
  clearAllLoading: () => void
  // Smart loading patterns
  withLoading: <T>(id: string, promise: Promise<T>, options?: {
    minDuration?: number
    timeout?: number
    retries?: number
  }) => Promise<T>
  // Auto-refresh detection
  enableAutoRefresh: (enabled: boolean) => void
  autoRefreshEnabled: boolean
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [loadingStates, setLoadingStates] = useState<Map<string, LoadingState>>(new Map())
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true)
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map())
  const autoRefreshTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Calculate global loading state
  const isGlobalLoading = Array.from(loadingStates.values()).some(state => state.isLoading)

  // AUTO-REFRESH SYSTEM - Detects slow loading and offers refresh
  useEffect(() => {
    if (!autoRefreshEnabled || !isGlobalLoading) {
      if (autoRefreshTimeoutRef.current) {
        clearTimeout(autoRefreshTimeoutRef.current)
        autoRefreshTimeoutRef.current = null
      }
      return
    }

    // Start auto-refresh detection for slow operations
    autoRefreshTimeoutRef.current = setTimeout(() => {
      const slowOperations = Array.from(loadingStates.values())
        .filter(state => state.isLoading && (Date.now() - state.startTime) > 8000)

      if (slowOperations.length > 0) {
        logger.warn('Slow loading detected, triggering auto-refresh option')
        showAutoRefreshDialog()
      }
    }, 8000) // 8 second detection

    return () => {
      if (autoRefreshTimeoutRef.current) {
        clearTimeout(autoRefreshTimeoutRef.current)
      }
    }
  }, [isGlobalLoading, autoRefreshEnabled, loadingStates])

  const showAutoRefreshDialog = useCallback(() => {
    if (typeof window === 'undefined') return

    const shouldRefresh = window.confirm(
      'The page is taking longer than expected to load. Would you like to refresh?'
    )

    if (shouldRefresh) {
      // Clear all loading states before refresh
      setLoadingStates(new Map())
      timeoutsRef.current.clear()
      
      // Trigger refresh
      window.location.reload()
    }
  }, [])

  const startLoading = useCallback((id: string, options: {
    message?: string
    timeout?: number
    progress?: number
  } = {}) => {
    const startTime = Date.now()
    
    setLoadingStates(prev => {
      const newStates = new Map(prev)
      newStates.set(id, {
        id,
        isLoading: true,
        progress: options.progress || 0,
        message: options.message,
        startTime,
        timeout: options.timeout
      })
      return newStates
    })

    // Set timeout if specified
    if (options.timeout) {
      const timeoutId = setTimeout(() => {
        logger.warn(`Loading timeout for ${id}`)
        stopLoading(id)
      }, options.timeout)
      
      timeoutsRef.current.set(id, timeoutId)
    }

    logger.debug(`Loading started: ${id}`, { message: options.message })
  }, [])

  const updateLoading = useCallback((id: string, updates: {
    progress?: number
    message?: string
  }) => {
    setLoadingStates(prev => {
      const current = prev.get(id)
      if (!current || !current.isLoading) return prev

      const newStates = new Map(prev)
      newStates.set(id, {
        ...current,
        ...updates
      })
      return newStates
    })
  }, [])

  const stopLoading = useCallback((id: string) => {
    setLoadingStates(prev => {
      const newStates = new Map(prev)
      const state = newStates.get(id)
      
      if (state) {
        const duration = Date.now() - state.startTime
        logger.debug(`Loading completed: ${id}`, { duration })
        newStates.delete(id)
      }
      
      return newStates
    })

    // Clear timeout if exists
    const timeoutId = timeoutsRef.current.get(id)
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutsRef.current.delete(id)
    }
  }, [])

  const isLoading = useCallback((id: string) => {
    return loadingStates.get(id)?.isLoading || false
  }, [loadingStates])

  const getLoadingState = useCallback((id: string) => {
    return loadingStates.get(id)
  }, [loadingStates])

  const clearAllLoading = useCallback(() => {
    setLoadingStates(new Map())
    
    // Clear all timeouts
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout))
    timeoutsRef.current.clear()
    
    logger.debug('All loading states cleared')
  }, [])

  // SMART LOADING WRAPPER with retry logic and minimum duration
  const withLoading = useCallback(async <T>(
    id: string, 
    promise: Promise<T>, 
    options: {
      minDuration?: number
      timeout?: number
      retries?: number
    } = {}
  ): Promise<T> => {
    const {
      minDuration = 300, // Minimum 300ms to avoid flashing
      timeout = 30000, // 30 second timeout
      retries = 1
    } = options

    let attempt = 0
    const maxAttempts = retries + 1

    while (attempt < maxAttempts) {
      const startTime = Date.now()
      startLoading(id, { timeout })

      try {
        // Race the promise against timeout
        const result = await Promise.race([
          promise,
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Operation timeout')), timeout)
          )
        ])

        // Ensure minimum duration for UX
        const elapsed = Date.now() - startTime
        if (elapsed < minDuration) {
          await new Promise(resolve => setTimeout(resolve, minDuration - elapsed))
        }

        stopLoading(id)
        return result

      } catch (error: any) {
        attempt++
        
        if (attempt >= maxAttempts) {
          stopLoading(id)
          throw error
        }

        // Exponential backoff for retries
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000)
        logger.warn(`Operation failed, retrying in ${delay}ms`, { id, attempt, error: error.message })
        
        updateLoading(id, { 
          message: `Retrying... (${attempt}/${retries})` 
        })
        
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    throw new Error('All retry attempts failed')
  }, [startLoading, stopLoading, updateLoading])

  const enableAutoRefresh = useCallback((enabled: boolean) => {
    setAutoRefreshEnabled(enabled)
    logger.debug('Auto-refresh', enabled ? 'enabled' : 'disabled')
  }, [])

  const value: LoadingContextType = {
    loadingStates,
    isGlobalLoading,
    startLoading,
    updateLoading,
    stopLoading,
    isLoading,
    getLoadingState,
    clearAllLoading,
    withLoading,
    enableAutoRefresh,
    autoRefreshEnabled
  }

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  )
}

export function useLoading() {
  const context = useContext(LoadingContext)
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider')
  }
  return context
}

/**
 * ENHANCED LOADING HOOK for components
 */
export function useSmartLoading(id?: string) {
  const loading = useLoading()
  const componentId = useRef(id || `component-${Math.random().toString(36).substr(2, 9)}`)
  
  return {
    isLoading: loading.isLoading(componentId.current),
    startLoading: (options?: Parameters<typeof loading.startLoading>[1]) => 
      loading.startLoading(componentId.current, options),
    updateLoading: (updates: Parameters<typeof loading.updateLoading>[1]) => 
      loading.updateLoading(componentId.current, updates),
    stopLoading: () => loading.stopLoading(componentId.current),
    withLoading: <T>(promise: Promise<T>, options?: Parameters<typeof loading.withLoading>[2]) =>
      loading.withLoading(componentId.current, promise, options)
  }
}

/**
 * GLOBAL LOADING INDICATOR Component
 */
export function GlobalLoadingIndicator() {
  const { isGlobalLoading, loadingStates } = useLoading()

  if (!isGlobalLoading) return null

  const activeStates = Array.from(loadingStates.values()).filter(s => s.isLoading)
  const hasProgress = activeStates.some(s => s.progress !== undefined)
  const avgProgress = hasProgress 
    ? activeStates.reduce((sum, s) => sum + (s.progress || 0), 0) / activeStates.length
    : undefined

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-primary/90 text-white p-2 text-center text-sm">
      <div className="flex items-center justify-center gap-2">
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
        <span>
          {activeStates[0]?.message || 'Loading...'}
        </span>
        {avgProgress !== undefined && (
          <span className="text-xs opacity-75">
            ({Math.round(avgProgress)}%)
          </span>
        )}
      </div>
      {hasProgress && (
        <div className="w-full bg-white/20 rounded-full h-1 mt-1">
          <div 
            className="bg-white h-1 rounded-full transition-all duration-300"
            style={{ width: `${avgProgress}%` }}
          />
        </div>
      )}
    </div>
  )
}
