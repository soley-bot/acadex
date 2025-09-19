/**
 * Service Worker for Offline Capabilities
 * Week 2 Day 3: Advanced caching and offline functionality
 */

// Cache names
const STATIC_CACHE = 'acadex-static-v1'
const DYNAMIC_CACHE = 'acadex-dynamic-v1'
const API_CACHE = 'acadex-api-v1'

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/dashboard',
  '/quizzes',
  '/courses',
  '/offline.html', // Fallback page
  '/manifest.json',
  // Add more critical paths
]

// API endpoints to cache
const CACHEABLE_APIS = [
  '/api/quizzes',
  '/api/courses',
  '/api/quiz-categories',
]

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('Service Worker: Caching static files')
      return cache.addAll(STATIC_FILES)
    }).catch((error) => {
      console.error('Service Worker: Failed to cache static files', error)
    })
  )
  
  // Force activation
  self.skipWaiting()
})

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...')
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (
            cacheName !== STATIC_CACHE &&
            cacheName !== DYNAMIC_CACHE &&
            cacheName !== API_CACHE
          ) {
            console.log('Service Worker: Deleting old cache', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  
  // Take control of all pages
  return self.clients.claim()
})

// Fetch event - handle requests
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Skip non-GET requests
  if (request.method !== 'GET') return
  
  // Handle different types of requests
  if (url.pathname.startsWith('/api/')) {
    // API requests - network first with cache fallback
    event.respondWith(handleAPIRequest(request))
  } else if (url.pathname.includes('.')) {
    // Static assets - cache first
    event.respondWith(handleStaticRequest(request))
  } else {
    // Pages - network first with cache fallback
    event.respondWith(handlePageRequest(request))
  }
})

// Handle API requests with network first strategy
async function handleAPIRequest(request) {
  const url = new URL(request.url)
  const shouldCache = CACHEABLE_APIS.some(api => url.pathname.startsWith(api))
  
  if (!shouldCache) {
    // Don't cache this API, just fetch
    return fetch(request)
  }
  
  try {
    // Try network first
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      // Cache successful response with error handling
      try {
        const cache = await caches.open(API_CACHE)
        await cache.put(request, networkResponse.clone())
      } catch (cacheError) {
        console.warn('Service Worker: Failed to cache API response', cacheError)
      }
      return networkResponse
    }
    
    throw new Error(`Network response not ok: ${networkResponse.status}`)
  } catch (error) {
    console.log('Service Worker: Network failed, trying cache for API', request.url)
    
    // Try cache as fallback
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return offline response for API
    return new Response(
      JSON.stringify({
        error: 'Offline',
        message: 'This data is not available offline',
        cached: false
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

// Handle static asset requests with cache first strategy
async function handleStaticRequest(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Try network and cache
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      try {
        const cache = await caches.open(DYNAMIC_CACHE)
        await cache.put(request, networkResponse.clone())
      } catch (cacheError) {
        console.warn('Service Worker: Failed to cache static asset', cacheError)
      }
    }
    
    return networkResponse
  } catch (error) {
    console.log('Service Worker: Failed to fetch static asset', request.url)
    
    // Return a fallback for critical assets
    if (request.url.includes('.js') || request.url.includes('.css')) {
      return new Response('/* Offline fallback */', {
        headers: { 'Content-Type': 'text/css' }
      })
    }
    
    return new Response('Offline', { status: 503 })
  }
}

// Handle page requests with network first strategy
async function handlePageRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      // Cache successful response with error handling
      try {
        const cache = await caches.open(DYNAMIC_CACHE)
        await cache.put(request, networkResponse.clone())
      } catch (cacheError) {
        console.warn('Service Worker: Failed to cache page response', cacheError)
      }
      return networkResponse
    }
    
    throw new Error(`Network response not ok: ${networkResponse.status}`)
  } catch (error) {
    console.log('Service Worker: Network failed, trying cache for page', request.url)
    
    // Try cache as fallback
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return offline page as ultimate fallback
    const offlinePage = await caches.match('/offline.html')
    return offlinePage || new Response('You are offline', {
      status: 503,
      headers: { 'Content-Type': 'text/html' }
    })
  }
}

// Handle background sync
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered', event.tag)
  
  if (event.tag === 'quiz-progress-sync') {
    event.waitUntil(syncQuizProgress())
  } else if (event.tag === 'quiz-submission-sync') {
    event.waitUntil(syncQuizSubmissions())
  }
})

// Sync quiz progress in background
async function syncQuizProgress() {
  try {
    console.log('Service Worker: Syncing quiz progress...')
    
    // This would integrate with IndexedDB to sync pending progress
    // For now, just log the intent
    console.log('Service Worker: Quiz progress sync completed')
  } catch (error) {
    console.error('Service Worker: Quiz progress sync failed', error)
    throw error
  }
}

// Sync quiz submissions in background
async function syncQuizSubmissions() {
  try {
    console.log('Service Worker: Syncing quiz submissions...')
    
    // This would integrate with IndexedDB to sync pending submissions
    // For now, just log the intent
    console.log('Service Worker: Quiz submissions sync completed')
  } catch (error) {
    console.error('Service Worker: Quiz submissions sync failed', error)
    throw error
  }
}

// Handle push notifications (future enhancement)
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push message received')
  
  const options = {
    body: event.data ? event.data.text() : 'New update available',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: 'acadex-notification',
    actions: [
      { action: 'view', title: 'View' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  }
  
  event.waitUntil(
    self.registration.showNotification('Acadex', options)
  )
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked', event.action)
  
  event.notification.close()
  
  if (event.action === 'view') {
    // Open the app
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received', event.data)
  
  if (event.data && event.data.type === 'CACHE_UPDATE') {
    // Handle cache updates from main thread
    handleCacheUpdate(event.data.payload)
  } else if (event.data && event.data.type === 'SYNC_REQUEST') {
    // Handle sync requests
    handleSyncRequest(event.data.payload)
  }
})

async function handleCacheUpdate(payload) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE)
    await cache.put(payload.url, new Response(JSON.stringify(payload.data)))
    console.log('Service Worker: Cache updated', payload.url)
  } catch (error) {
    console.error('Service Worker: Cache update failed', error)
  }
}

async function handleSyncRequest(payload) {
  try {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      const registration = await self.registration
      await registration.sync.register(payload.tag)
      console.log('Service Worker: Sync registered', payload.tag)
    }
  } catch (error) {
    console.error('Service Worker: Sync registration failed', error)
  }
}