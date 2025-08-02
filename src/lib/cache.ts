import { logger } from '@/lib/logger'

/**
 * Advanced Cache Management System
 * Implements best practices for React/Next.js applications
 */

import { useState, useEffect, useCallback, useRef } from 'react'

// ==============================================
// 1. CACHE CONFIGURATION
// ==============================================

interface CacheConfig {
  ttl: number // Time to live in milliseconds
  maxSize: number // Maximum number of entries
  staleTime: number // Time before data is considered stale
  gcInterval: number // Garbage collection interval
}

const DEFAULT_CACHE_CONFIG: CacheConfig = {
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 100,
  staleTime: 30 * 1000, // 30 seconds
  gcInterval: 60 * 1000, // 1 minute
}

// ==============================================
// 2. CACHE ENTRY INTERFACE
// ==============================================

interface CacheEntry<T> {
  data: T
  timestamp: number
  lastAccessed: number
  key: string
  tags: string[]
  isStale: boolean
}

// ==============================================
// 3. ADVANCED CACHE CLASS
// ==============================================

class AdvancedCache {
  private cache = new Map<string, CacheEntry<any>>()
  private config: CacheConfig
  private gcTimer: NodeJS.Timeout | null = null
  private subscribers = new Map<string, Set<() => void>>()

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CACHE_CONFIG, ...config }
    this.startGarbageCollection()
  }

  // Get data from cache
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }

    // Check if expired
    if (this.isExpired(entry)) {
      this.delete(key)
      return null
    }

    // Update last accessed time
    entry.lastAccessed = Date.now()
    entry.isStale = this.isStale(entry)
    
    return entry.data
  }

  // Set data in cache
  set<T>(key: string, data: T, tags: string[] = [], customTtl?: number): void {
    // Check size limit
    if (this.cache.size >= this.config.maxSize) {
      this.evictLeastRecentlyUsed()
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      lastAccessed: Date.now(),
      key,
      tags,
      isStale: false
    }

    this.cache.set(key, entry)
    this.notifySubscribers(key)
  }

  // Delete specific key
  delete(key: string): boolean {
    const deleted = this.cache.delete(key)
    if (deleted) {
      this.notifySubscribers(key)
    }
    return deleted
  }

  // Clear cache by tags
  invalidateByTags(tags: string[]): void {
    const keysToDelete: string[] = []
    
    this.cache.forEach((entry, key) => {
      if (entry.tags.some(tag => tags.includes(tag))) {
        keysToDelete.push(key)
      }
    })

    keysToDelete.forEach(key => this.delete(key))
  }

  // Clear all cache
  clear(): void {
    this.cache.clear()
    this.subscribers.forEach((subscribers, key) => {
      subscribers.forEach(callback => callback())
    })
  }

  // Get cache statistics
  getStats() {
    const entries = Array.from(this.cache.values())
    const now = Date.now()
    
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      expired: entries.filter(entry => this.isExpired(entry)).length,
      stale: entries.filter(entry => this.isStale(entry)).length,
      fresh: entries.filter(entry => !this.isStale(entry) && !this.isExpired(entry)).length,
      oldestEntry: Math.min(...entries.map(entry => now - entry.timestamp)),
      memoryUsage: this.estimateMemoryUsage()
    }
  }

  // Subscribe to cache changes
  subscribe(key: string, callback: () => void): () => void {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set())
    }
    
    this.subscribers.get(key)!.add(callback)
    
    // Return unsubscribe function
    return () => {
      this.subscribers.get(key)?.delete(callback)
      if (this.subscribers.get(key)?.size === 0) {
        this.subscribers.delete(key)
      }
    }
  }

  // Private methods
  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > this.config.ttl
  }

  private isStale(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > this.config.staleTime
  }

  private evictLeastRecentlyUsed(): void {
    let oldestKey: string | null = null
    let oldestTime = Date.now()

    this.cache.forEach((entry, key) => {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed
        oldestKey = key
      }
    })

    if (oldestKey) {
      this.delete(oldestKey)
    }
  }

  private startGarbageCollection(): void {
    this.gcTimer = setInterval(() => {
      const expiredKeys: string[] = []
      
      this.cache.forEach((entry, key) => {
        if (this.isExpired(entry)) {
          expiredKeys.push(key)
        }
      })

      expiredKeys.forEach(key => this.delete(key))
    }, this.config.gcInterval)
  }

  private notifySubscribers(key: string): void {
    this.subscribers.get(key)?.forEach(callback => callback())
  }

  private estimateMemoryUsage(): number {
    // Rough estimation of memory usage
    let size = 0
    this.cache.forEach((entry) => {
      size += JSON.stringify(entry.data).length * 2 // Rough estimation
    })
    return size
  }

  // Cleanup
  destroy(): void {
    if (this.gcTimer) {
      clearInterval(this.gcTimer)
    }
    this.clear()
  }
}

// ==============================================
// 4. CACHE INSTANCES
// ==============================================

// Global cache instances for different data types
export const courseCache = new AdvancedCache({
  ttl: 10 * 60 * 1000, // 10 minutes for courses
  maxSize: 50,
  staleTime: 2 * 60 * 1000, // 2 minutes
})

export const quizCache = new AdvancedCache({
  ttl: 5 * 60 * 1000, // 5 minutes for quizzes
  maxSize: 100,
  staleTime: 1 * 60 * 1000, // 1 minute
})

export const userCache = new AdvancedCache({
  ttl: 15 * 60 * 1000, // 15 minutes for user data
  maxSize: 200,
  staleTime: 5 * 60 * 1000, // 5 minutes
})

// ==============================================
// 5. REACT HOOKS FOR CACHE MANAGEMENT
// ==============================================

/**
 * Hook for cached data fetching with automatic revalidation
 */
export function useCachedQuery<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    tags?: string[]
    cache?: AdvancedCache
    enabled?: boolean
    staleWhileRevalidate?: boolean
  } = {}
) {
  const {
    tags = [],
    cache = courseCache,
    enabled = true,
    staleWhileRevalidate = true
  } = options

  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [isStale, setIsStale] = useState(false)
  
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!enabled) return

    // Try to get from cache first
    const cachedData = cache.get<T>(key)
    
    if (cachedData && !forceRefresh) {
      setData(cachedData)
      setError(null)
      
      // Check if stale and background refresh if needed
      const entry = (cache as any).cache.get(key)
      if (entry && entry.isStale && staleWhileRevalidate) {
        setIsStale(true)
        // Background refresh
        try {
          const freshData = await fetcherRef.current()
          cache.set(key, freshData, tags)
          setData(freshData)
          setIsStale(false)
        } catch (err) {
          logger.warn('Background refresh failed:', err)
        }
      }
      return cachedData
    }

    // No cache or force refresh - fetch fresh data
    setIsLoading(true)
    setError(null)
    
    try {
      const freshData = await fetcherRef.current()
      cache.set(key, freshData, tags)
      setData(freshData)
      setIsStale(false)
      return freshData
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Fetch failed')
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [key, enabled, tags, cache, staleWhileRevalidate])

  // Subscribe to cache changes
  useEffect(() => {
    const unsubscribe = cache.subscribe(key, () => {
      const freshData = cache.get<T>(key)
      if (freshData) {
        setData(freshData)
        setIsStale(false)
      }
    })

    return unsubscribe
  }, [key, cache])

  // Initial fetch
  useEffect(() => {
    fetchData()
  }, [fetchData])

  const mutate = useCallback(async (newData?: T | ((current: T | null) => T)) => {
    if (newData !== undefined) {
      const finalData = typeof newData === 'function' 
        ? (newData as (current: T | null) => T)(data)
        : newData
      
      cache.set(key, finalData, tags)
      setData(finalData)
      setIsStale(false)
    } else {
      // Revalidate
      await fetchData(true)
    }
  }, [key, data, tags, cache, fetchData])

  const invalidate = useCallback(() => {
    cache.delete(key)
    setData(null)
    setError(null)
    setIsStale(false)
  }, [key, cache])

  return {
    data,
    isLoading,
    error,
    isStale,
    mutate,
    invalidate,
    refetch: () => fetchData(true)
  }
}

/**
 * Hook for cache mutations with optimistic updates
 */
export function useCacheMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: {
    onSuccess?: (data: TData, variables: TVariables) => void
    onError?: (error: Error, variables: TVariables) => void
    invalidateTags?: string[]
    cache?: AdvancedCache
  } = {}
) {
  const {
    onSuccess,
    onError,
    invalidateTags = [],
    cache = courseCache
  } = options

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const mutate = useCallback(async (variables: TVariables) => {
    logger.debug('🔄 [CACHE_MUTATION] === STARTING MUTATION ===')
    logger.debug('🔄 [CACHE_MUTATION] Started at:', new Date().toISOString())
    logger.debug('🔄 [CACHE_MUTATION] Variables:', JSON.stringify(variables, null, 2))
    logger.debug('🔄 [CACHE_MUTATION] Setting isLoading to true...')
    
    setIsLoading(true)
    setError(null)

    try {
      logger.debug('🚀 [CACHE_MUTATION] Calling mutationFn...')
      const data = await mutationFn(variables)
      logger.debug('✅ [CACHE_MUTATION] mutationFn completed successfully')
      logger.debug('✅ [CACHE_MUTATION] Returned data:', JSON.stringify(data, null, 2))
      
      // Invalidate related cache entries
      if (invalidateTags.length > 0) {
        logger.debug('🗑️ [CACHE_MUTATION] Invalidating cache tags:', invalidateTags)
        cache.invalidateByTags(invalidateTags)
        logger.debug('🗑️ [CACHE_MUTATION] Cache invalidated successfully')
      }

      logger.debug('🔧 [CACHE_MUTATION] Setting isLoading to false...')
      setIsLoading(false) // Reset loading state before success callback
      logger.debug('🔧 [CACHE_MUTATION] isLoading set to false')
      
      logger.debug('🎉 [CACHE_MUTATION] Calling onSuccess callback...')
      onSuccess?.(data, variables)
      logger.debug('🎉 [CACHE_MUTATION] onSuccess callback completed')
      
      logger.debug('🎉 [CACHE_MUTATION] === MUTATION SUCCESS ===')
      return data
    } catch (err) {
      logger.error('💥 [CACHE_MUTATION] === MUTATION ERROR ===')
      logger.error('💥 [CACHE_MUTATION] Error occurred at:', new Date().toISOString())
      logger.error('💥 [CACHE_MUTATION] Error details:', err)
      
      const error = err instanceof Error ? err : new Error('Mutation failed')
      logger.error('💥 [CACHE_MUTATION] Processed error:', error.message)
      
      logger.debug('🔧 [CACHE_MUTATION] Setting isLoading to false after error...')
      setIsLoading(false) // Reset loading state before error handling
      logger.debug('🔧 [CACHE_MUTATION] isLoading set to false after error')
      
      logger.debug('🔧 [CACHE_MUTATION] Setting error state...')
      setError(error)
      logger.debug('🔧 [CACHE_MUTATION] Error state set')
      
      logger.debug('💥 [CACHE_MUTATION] Calling onError callback...')
      onError?.(error, variables)
      logger.debug('💥 [CACHE_MUTATION] onError callback completed')
      
      logger.error('💥 [CACHE_MUTATION] Re-throwing error...')
      throw error
    }
  }, [mutationFn, onSuccess, onError, invalidateTags, cache])

  return {
    mutate,
    isLoading,
    error
  }
}

/**
 * Hook for cache statistics and management
 */
export function useCacheStats(cache: AdvancedCache = courseCache) {
  const [stats, setStats] = useState(cache.getStats())

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(cache.getStats())
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [cache])

  const clearCache = useCallback(() => {
    cache.clear()
    setStats(cache.getStats())
  }, [cache])

  const invalidateByTags = useCallback((tags: string[]) => {
    cache.invalidateByTags(tags)
    setStats(cache.getStats())
  }, [cache])

  return {
    stats,
    clearCache,
    invalidateByTags
  }
}

// ==============================================
// 6. CACHE DEBUGGING UTILITIES
// ==============================================

export const cacheDebug = {
  logStats: (cache: AdvancedCache = courseCache) => {
    console.group('🗄️ Cache Statistics')
    const stats = cache.getStats()
    Object.entries(stats).forEach(([key, value]) => {
      logger.debug(`${key}:`, value)
    })
    console.groupEnd()
  },

  visualize: (cache: AdvancedCache = courseCache) => {
    const entries = Array.from((cache as any).cache.entries()) as [any, any][]
    console.table(
      entries.map(([key, entry]) => ({
        key,
        age: `${Math.round((Date.now() - entry.timestamp) / 1000)}s`,
        stale: entry.isStale,
        tags: entry.tags.join(', '),
        size: JSON.stringify(entry.data).length
      }))
    )
  }
}

// ==============================================
// 7. CLEANUP ON APP UNMOUNT
// ==============================================

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    courseCache.destroy()
    quizCache.destroy()
    userCache.destroy()
  })
}
