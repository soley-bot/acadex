'use client'

import { useEffect, useState } from 'react'

interface ClientSideManagerProps {
  children: React.ReactNode
}

export function ClientSideManager({ children }: ClientSideManagerProps) {
  const [isInitialized, setIsInitialized] = useState(false)
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    let mounted = true
    let timeoutId: NodeJS.Timeout

    const initializeClientSideFeatures = async () => {
      try {
        console.log('Initializing simplified client-side features...')

        // Simple online/offline detection only
        const handleOnline = () => setIsOnline(true)
        const handleOffline = () => setIsOnline(false)
        
        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)
        setIsOnline(navigator.onLine)

        // Skip heavy initializations that might be causing issues:
        // - IndexedDB initialization
        // - Service worker registration  
        // - React Query persistence
        // - Background sync

        if (mounted) {
          setIsInitialized(true)
          console.log('Simplified client-side features initialized successfully')
        }

        // Cleanup function
        return () => {
          window.removeEventListener('online', handleOnline)
          window.removeEventListener('offline', handleOffline)
        }

      } catch (error) {
        console.error('Error initializing client-side features:', error)
        if (mounted) {
          setIsInitialized(true) // Still allow the app to work
        }
      }
    }

    // Force initialization after 1 second max to prevent hanging
    timeoutId = setTimeout(() => {
      if (!isInitialized && mounted) {
        console.log('Force-initializing after timeout')
        setIsInitialized(true)
      }
    }, 1000)

    initializeClientSideFeatures()

    return () => {
      mounted = false
      clearTimeout(timeoutId)
    }
  }, [isInitialized])

  // Minimal loading state - much shorter timeout
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {children}
      
      {/* Connection Status Indicator */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white px-4 py-2 text-center text-sm z-50">
          <span className="mr-2">⚠️</span>
          You&apos;re offline. Some features may be limited.
          <span className="ml-2">📱</span>
        </div>
      )}
    </>
  )
}

export default ClientSideManager