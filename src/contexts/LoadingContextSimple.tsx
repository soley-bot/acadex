/**
 * SIMPLIFIED LOADING CONTEXT
 * Basic loading management with auto-refresh detection
 */

'use client'

import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'

interface LoadingState {
  id: string
  isLoading: boolean
  message?: string
  startTime: number
}

interface LoadingContextType {
  loadingStates: Map<string, LoadingState>
  isGlobalLoading: boolean
  startLoading: (id: string, message?: string) => void
  stopLoading: (id: string) => void
  isLoading: (id: string) => boolean
  clearAllLoading: () => void
  autoRefreshEnabled: boolean
  enableAutoRefresh: (enabled: boolean) => void
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [loadingStates, setLoadingStates] = useState<Map<string, LoadingState>>(new Map())
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true)
  const autoRefreshTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Calculate global loading state
  const isGlobalLoading = Array.from(loadingStates.values()).some(state => state.isLoading)

  // Auto-refresh detection
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
        const shouldRefresh = window.confirm(
          'The page is taking longer than expected to load. Would you like to refresh?'
        )

        if (shouldRefresh) {
          setLoadingStates(new Map())
          window.location.reload()
        }
      }
    }, 8000)

    return () => {
      if (autoRefreshTimeoutRef.current) {
        clearTimeout(autoRefreshTimeoutRef.current)
      }
    }
  }, [isGlobalLoading, autoRefreshEnabled, loadingStates])

  const startLoading = useCallback((id: string, message?: string) => {
    setLoadingStates(prev => {
      const newStates = new Map(prev)
      newStates.set(id, {
        id,
        isLoading: true,
        message,
        startTime: Date.now()
      })
      return newStates
    })
  }, [])

  const stopLoading = useCallback((id: string) => {
    setLoadingStates(prev => {
      const newStates = new Map(prev)
      newStates.delete(id)
      return newStates
    })
  }, [])

  const isLoading = useCallback((id: string) => {
    return loadingStates.get(id)?.isLoading || false
  }, [loadingStates])

  const clearAllLoading = useCallback(() => {
    setLoadingStates(new Map())
  }, [])

  const enableAutoRefresh = useCallback((enabled: boolean) => {
    setAutoRefreshEnabled(enabled)
  }, [])

  const value: LoadingContextType = {
    loadingStates,
    isGlobalLoading,
    startLoading,
    stopLoading,
    isLoading,
    clearAllLoading,
    autoRefreshEnabled,
    enableAutoRefresh
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
 * SIMPLIFIED LOADING HOOK for components
 */
export function useSimpleLoading(id?: string) {
  const loading = useLoading()
  const componentId = useRef(id || `component-${Math.random().toString(36).substr(2, 9)}`)
  
  return {
    isLoading: loading.isLoading(componentId.current),
    startLoading: (message?: string) => 
      loading.startLoading(componentId.current, message),
    stopLoading: () => loading.stopLoading(componentId.current)
  }
}

/**
 * GLOBAL LOADING INDICATOR Component
 */
export function GlobalLoadingIndicator() {
  const { isGlobalLoading, loadingStates } = useLoading()

  if (!isGlobalLoading) return null

  const activeStates = Array.from(loadingStates.values()).filter(s => s.isLoading)
  const currentMessage = activeStates[0]?.message || 'Loading...'

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-primary/90 text-white p-2 text-center text-sm">
      <div className="flex items-center justify-center gap-2">
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
        <span>{currentMessage}</span>
      </div>
    </div>
  )
}
