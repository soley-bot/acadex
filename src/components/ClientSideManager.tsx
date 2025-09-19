'use client'

import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { serviceWorkerManager } from '@/lib/service-worker'
import { createIndexedDBPersister } from '@/lib/persistent-storage'
import { indexedDB } from '@/lib/indexeddb'

interface ClientSideManagerProps {
  children: React.ReactNode
}

export function ClientSideManager({ children }: ClientSideManagerProps) {
  const [isInitialized, setIsInitialized] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [serviceWorkerStatus, setServiceWorkerStatus] = useState<string>('initializing')
  const queryClient = useQueryClient()

  useEffect(() => {
    let mounted = true

    const initializeClientSideFeatures = async () => {
      try {
        console.log('Initializing client-side features...')

        // Initialize IndexedDB
        console.log('Initializing IndexedDB...')
        await indexedDB.getDB()
        console.log('IndexedDB initialized successfully')

        // Setup React Query persistence  
        console.log('Setting up React Query persistence...')
        const persister = createIndexedDBPersister()
        console.log('React Query persistence setup complete')

        // Register service worker in production
        if (process.env.NODE_ENV === 'production') {
          console.log('Registering service worker...')
          const registered = await serviceWorkerManager.register()
          
          if (registered) {
            console.log('Service worker registered successfully')
            setServiceWorkerStatus('registered')
          } else {
            console.warn('Service worker registration failed')
            setServiceWorkerStatus('failed')
          }
        } else {
          console.log('Service worker registration skipped in development')
          setServiceWorkerStatus('skipped')
        }

        // Setup online/offline detection
        const handleOnline = () => setIsOnline(true)
        const handleOffline = () => setIsOnline(false)
        
        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)
        setIsOnline(navigator.onLine)

        // Subscribe to service worker state changes
        const unsubscribe = serviceWorkerManager.onStateChange((state) => {
          console.log('Service worker state changed:', state)
          
          if (state.hasUpdate) {
            console.log('Service worker update available')
            // You could show a notification to the user here
            showUpdateNotification()
          }
        })

        // Setup background sync on connection restoration
        if (navigator.onLine) {
          await triggerInitialSync()
        }

        if (mounted) {
          setIsInitialized(true)
          console.log('Client-side features initialized successfully')
        }

        // Cleanup function
        return () => {
          window.removeEventListener('online', handleOnline)
          window.removeEventListener('offline', handleOffline)
          unsubscribe()
        }

      } catch (error) {
        console.error('Error initializing client-side features:', error)
        if (mounted) {
          setIsInitialized(true) // Still allow the app to work
          setServiceWorkerStatus('error')
        }
      }
    }

    initializeClientSideFeatures()

    return () => {
      mounted = false
    }
  }, [queryClient])

  const showUpdateNotification = () => {
    // Show a toast or banner to inform the user about the update
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('App Update Available', {
        body: 'A new version of Acadex is available. Refresh to update.',
        icon: '/icon-192x192.png',
        badge: '/icon-96x96.png',
        tag: 'app-update'
      })
    }
  }

  const triggerInitialSync = async () => {
    try {
      // Trigger background sync for any pending data
      await serviceWorkerManager.triggerSync('quiz-progress-sync')
      await serviceWorkerManager.triggerSync('quiz-submission-sync')
      await serviceWorkerManager.triggerSync('background-sync')
    } catch (error) {
      console.warn('Failed to trigger initial sync:', error)
    }
  }

  // Show loading state while initializing (optional)
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing app features...</p>
          <p className="text-sm text-gray-500 mt-2">Service Worker: {serviceWorkerStatus}</p>
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
          <p className="text-gray-600">You&apos;re offline. Some features may be limited.</p>
          <span className="ml-2">📱</span>
        </div>
      )}

      {/* Service Worker Update Banner */}
      <ServiceWorkerUpdateBanner />
    </>
  )
}

// Component to handle service worker updates
function ServiceWorkerUpdateBanner() {
  const [showUpdateBanner, setShowUpdateBanner] = useState(false)

  useEffect(() => {
    const unsubscribe = serviceWorkerManager.onStateChange((state) => {
      setShowUpdateBanner(state.hasUpdate)
    })

    return unsubscribe
  }, [])

  const handleUpdate = async () => {
    try {
      await serviceWorkerManager.applyUpdate()
      // The page will reload automatically after the update
      window.location.reload()
    } catch (error) {
      console.error('Failed to apply service worker update:', error)
    }
  }

  const handleDismiss = () => {
    setShowUpdateBanner(false)
  }

  if (!showUpdateBanner) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-blue-600 text-white rounded-lg shadow-lg p-4 z-50">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">Update Available</p>
          <p className="text-sm text-blue-100 mt-1">
            A new version of Acadex is ready to install.
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleUpdate}
              className="text-xs bg-white text-blue-600 px-3 py-1 rounded font-medium hover:bg-blue-50 transition-colors"
            >
              Update Now
            </button>
            <button
              onClick={handleDismiss}
              className="text-xs text-blue-100 hover:text-white transition-colors"
            >
              Later
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-blue-100 hover:text-white"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  )
}