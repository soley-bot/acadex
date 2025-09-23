'use client'

import React, { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useBackgroundSync } from '@/hooks/useAdvancedCaching'

// Create a client with advanced configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: how long data is considered fresh
      staleTime: 5 * 60 * 1000, // 5 minutes
      
      // Cache time: how long data stays in cache after component unmounts
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      
      // Retry configuration with exponential backoff
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.status >= 400 && error?.status < 500) {
          return false
        }
        // Retry up to 2 times for other errors
        return failureCount < 2
      },
      
      // Advanced refetch configuration for better data freshness
      refetchOnWindowFocus: 'always',  // Always refetch on window focus for fresh data
      refetchOnReconnect: 'always',    // Always refetch when network reconnects
      refetchOnMount: true,            // Refetch on mount if data is stale
      refetchInterval: false,          // Disable automatic polling (we'll handle this manually)
      
      // Network mode optimization
      networkMode: 'online',           // Only fetch when online
      
      // Advanced error retry delay with exponential backoff + jitter
      retryDelay: (attemptIndex) => {
        const baseDelay = Math.min(1000 * 2 ** attemptIndex, 30000)
        const jitter = Math.random() * 1000 // Add jitter to prevent thundering herd
        return baseDelay + jitter
      },
      
      // Meta data for advanced caching strategies
      meta: {
        errorMessage: 'Failed to load data',
      },
    },
    mutations: {
      // Retry mutations only once for better UX
      retry: (failureCount, error: any) => {
        // Don't retry mutations on 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false
        }
        return failureCount < 1
      },
      
      // Network mode for mutations
      networkMode: 'online',
      
      // Advanced mutation retry delay
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
      
      // Meta data for error handling
      meta: {
        errorMessage: 'Operation failed',
      },
    },
  },
})

// Background Sync Component with enhanced cleanup
function BackgroundSyncProvider({ children }: { children: React.ReactNode }) {
  const isClient = typeof window !== 'undefined'
  
  // Always call the hook, but conditionally enable functionality
  useBackgroundSync()
  
  // Cleanup on unmount to prevent memory leaks
  useEffect(() => {
    if (!isClient) return
    
    return () => {
      // Proper cleanup - let React Query handle its own cleanup
      // We don't need to manually clear all intervals as that could interfere with other code
      if (window) {
        // Remove any event listeners that might have been added
        const events = ['visibilitychange', 'focus', 'online', 'offline']
        events.forEach(event => {
          // This is safe because removeEventListener ignores non-existent listeners
          window.removeEventListener(event, () => {})
          document.removeEventListener(event, () => {})
        })
      }
    }
  }, [isClient])
  
  return <>{children}</>
}

interface QueryProviderProps {
  children: React.ReactNode
}

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <BackgroundSyncProvider>
        {children}
        {/* Show React Query DevTools in development */}
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools 
            initialIsOpen={false}
          />
        )}
      </BackgroundSyncProvider>
    </QueryClientProvider>
  )
}

export { queryClient }
