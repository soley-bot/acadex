// Service Worker Registration and Management Utility
// Handles service worker lifecycle, updates, and notifications

interface ServiceWorkerConfig {
  swUrl?: string
  scope?: string
  updateCheckInterval?: number
  skipWaiting?: boolean
  enableNotifications?: boolean
}

interface ServiceWorkerState {
  isSupported: boolean
  isRegistered: boolean
  isControlling: boolean
  hasUpdate: boolean
  isOnline: boolean
}

class ServiceWorkerManager {
  private config: ServiceWorkerConfig
  private registration: ServiceWorkerRegistration | null = null
  private updateCheckTimer: NodeJS.Timeout | null = null
  private stateCallbacks: Set<(state: ServiceWorkerState) => void> = new Set()

  constructor(config: ServiceWorkerConfig = {}) {
    this.config = {
      swUrl: '/sw.js',
      scope: '/',
      updateCheckInterval: 60000, // 1 minute
      skipWaiting: false,
      enableNotifications: true,
      ...config
    }
    
    // Only initialize in browser environment
    if (typeof window !== 'undefined') {
      // Initialization will happen on first method call
    }
  }

  // Register service worker
  async register(): Promise<boolean> {
    if (typeof window === 'undefined' || !this.isSupported()) {
      console.log('Service Worker not supported or not in browser environment')
      return false
    }

    try {
      this.registration = await navigator.serviceWorker.register(
        this.config.swUrl!,
        { scope: this.config.scope }
      )

      console.log('Service Worker registered:', this.registration.scope)

      // Setup event listeners
      this.setupEventListeners()

      // Start periodic update checks
      this.startUpdateChecks()

      // Request notification permission if enabled
      if (this.config.enableNotifications) {
        await this.requestNotificationPermission()
      }

      this.notifyStateChange()
      return true
    } catch (error) {
      console.error('Service Worker registration failed:', error)
      return false
    }
  }

  // Check if service workers are supported
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'serviceWorker' in navigator
  }

  // Get current state
  getState(): ServiceWorkerState {
    if (typeof window === 'undefined') {
      return {
        isSupported: false,
        isRegistered: false,
        isControlling: false,
        hasUpdate: false,
        isOnline: false
      }
    }
    
    return {
      isSupported: this.isSupported(),
      isRegistered: !!this.registration,
      isControlling: !!navigator.serviceWorker.controller,
      hasUpdate: !!(this.registration?.waiting),
      isOnline: navigator.onLine
    }
  }

  // Subscribe to state changes
  onStateChange(callback: (state: ServiceWorkerState) => void): () => void {
    this.stateCallbacks.add(callback)
    // Immediately call with current state
    callback(this.getState())
    
    // Return unsubscribe function
    return () => {
      this.stateCallbacks.delete(callback)
    }
  }

  // Apply waiting service worker update
  async applyUpdate(): Promise<void> {
    if (!this.registration?.waiting) {
      console.log('No service worker update available')
      return
    }

    // Tell the waiting service worker to skip waiting
    this.registration.waiting.postMessage({ type: 'SKIP_WAITING' })

    // Wait for the new service worker to take control
    return new Promise((resolve) => {
      const handleControllerChange = () => {
        navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange)
        resolve()
      }
      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange)
    })
  }

  // Send message to service worker
  async sendMessage(message: any): Promise<any> {
    const controller = navigator.serviceWorker.controller
    if (!controller) {
      throw new Error('No active service worker')
    }

    return new Promise((resolve, reject) => {
      const messageChannel = new MessageChannel()
      
      messageChannel.port1.onmessage = (event) => {
        if (event.data.error) {
          reject(new Error(event.data.error))
        } else {
          resolve(event.data)
        }
      }

      controller.postMessage(message, [messageChannel.port2])
    })
  }

  // Clear all caches
  async clearCaches(): Promise<void> {
    try {
      await this.sendMessage({ type: 'CLEAR_CACHES' })
      console.log('All caches cleared')
    } catch (error) {
      console.error('Failed to clear caches:', error)
    }
  }

  // Get cache statistics
  async getCacheStats(): Promise<any> {
    try {
      return await this.sendMessage({ type: 'GET_CACHE_STATS' })
    } catch (error) {
      console.error('Failed to get cache stats:', error)
      return null
    }
  }

  // Trigger background sync
  async triggerSync(tag: string): Promise<void> {
    if (!this.registration) {
      throw new Error('Service worker not registered')
    }

    if ('sync' in this.registration) {
      await (this.registration as any).sync.register(tag)
      console.log(`Background sync registered: ${tag}`)
    } else {
      console.warn('Background sync not supported')
    }
  }

  // Unregister service worker
  async unregister(): Promise<boolean> {
    if (this.registration) {
      const result = await this.registration.unregister()
      this.cleanup()
      return result
    }
    return false
  }

  // Private methods

  private setupEventListeners(): void {
    if (typeof window === 'undefined' || !this.registration) return

    // Handle service worker updates
    this.registration.addEventListener('updatefound', () => {
      const newWorker = this.registration!.installing
      if (!newWorker) return

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New service worker is available
          console.log('New service worker available')
          this.notifyStateChange()
          
          if (this.config.skipWaiting) {
            this.applyUpdate()
          }
        }
      })
    })

    // Handle controller changes
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('Service worker controller changed')
      this.notifyStateChange()
    })

    // Handle online/offline status
    window.addEventListener('online', () => {
      console.log('Connection restored')
      this.notifyStateChange()
      this.triggerSync('background-sync').catch(console.error)
    })

    window.addEventListener('offline', () => {
      console.log('Connection lost')
      this.notifyStateChange()
    })

    // Handle messages from service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      this.handleServiceWorkerMessage(event.data)
    })
  }

  private handleServiceWorkerMessage(message: any): void {
    console.log('Message from service worker:', message)

    switch (message.type) {
      case 'CACHE_UPDATED':
        console.log('Cache updated:', message.data)
        break
      case 'SYNC_COMPLETED':
        console.log('Background sync completed:', message.data)
        break
      case 'NOTIFICATION':
        this.showNotification(message.data)
        break
    }
  }

  private async showNotification(data: { title: string; options?: NotificationOptions }): Promise<void> {
    if (!this.config.enableNotifications) return

    const permission = await this.requestNotificationPermission()
    if (permission !== 'granted') return

    if (this.registration) {
      const notificationOptions: NotificationOptions = {
        icon: '/icon-192x192.png',
        badge: '/icon-96x96.png',
        data: { url: '/' },
        ...data.options
      }

      await this.registration.showNotification(data.title, notificationOptions)
    }
  }

  private async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied'
    }

    if (Notification.permission === 'granted') {
      return 'granted'
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      return permission
    }

    return Notification.permission
  }

  private startUpdateChecks(): void {
    if (this.config.updateCheckInterval && this.config.updateCheckInterval > 0) {
      this.updateCheckTimer = setInterval(() => {
        this.checkForUpdates()
      }, this.config.updateCheckInterval)
    }
  }

  private async checkForUpdates(): Promise<void> {
    if (this.registration) {
      try {
        await this.registration.update()
      } catch (error) {
        console.error('Service worker update check failed:', error)
      }
    }
  }

  private notifyStateChange(): void {
    const state = this.getState()
    this.stateCallbacks.forEach(callback => {
      try {
        callback(state)
      } catch (error) {
        console.error('State callback error:', error)
      }
    })
  }

  private cleanup(): void {
    if (this.updateCheckTimer) {
      clearInterval(this.updateCheckTimer)
      this.updateCheckTimer = null
    }
    this.stateCallbacks.clear()
    this.registration = null
  }
}

// Create and export singleton instance
let _serviceWorkerManager: ServiceWorkerManager | null = null

export const serviceWorkerManager = typeof window !== 'undefined' 
  ? (_serviceWorkerManager || (_serviceWorkerManager = new ServiceWorkerManager()))
  : ({
      register: async () => false,
      isSupported: () => false,
      getState: () => ({ isSupported: false, isRegistered: false, isControlling: false, hasUpdate: false, isOnline: false }),
      onStateChange: () => () => {},
      applyUpdate: async () => {},
      sendMessage: async () => null,
      clearCaches: async () => {},
      getCacheStats: async () => null,
      triggerSync: async () => {},
      unregister: async () => false
    } as unknown as ServiceWorkerManager)

// Export types for TypeScript users
export type { ServiceWorkerConfig, ServiceWorkerState }

// Export class for custom configurations
export { ServiceWorkerManager }