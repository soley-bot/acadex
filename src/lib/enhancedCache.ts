/**
 * ENHANCED CACHE STRATEGY
 * Multi-layer caching with intelligent invalidation and preloading
 */

'use client'

import { logger } from '@/lib/logger'

// Cache layers configuration
const CACHE_CONFIG = {
  memory: {
    maxSize: 100,
    ttl: 5 * 60 * 1000 // 5 minutes
  },
  session: {
    maxSize: 50,
    ttl: 30 * 60 * 1000 // 30 minutes
  },
  local: {
    maxSize: 20,
    ttl: 24 * 60 * 60 * 1000 // 24 hours
  },
  network: {
    staleWhileRevalidate: 60 * 1000, // 1 minute
    maxAge: 5 * 60 * 1000 // 5 minutes
  }
}

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
  tags: string[]
  accessCount: number
  lastAccessed: number
}

interface CacheOptions {
  ttl?: number
  tags?: string[]
  layer?: 'memory' | 'session' | 'local' | 'all'
  staleWhileRevalidate?: boolean
}

class EnhancedCache {
  private memoryCache = new Map<string, CacheEntry<any>>()
  private cleanupInterval: NodeJS.Timeout

  constructor() {
    // Start cleanup interval
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 2 * 60 * 1000) // Every 2 minutes
  }

  // GET from cache with layer fallback
  get<T>(key: string, options: CacheOptions = {}): T | null {
    const { layer = 'all' } = options
    const now = Date.now()

    // Try memory cache first
    if (layer === 'memory' || layer === 'all') {
      const entry = this.memoryCache.get(key)
      if (entry && this.isValid(entry, now)) {
        entry.accessCount++
        entry.lastAccessed = now
        logger.debug('Cache hit (memory)', { key })
        return entry.data
      }
    }

    // Try session storage
    if ((layer === 'session' || layer === 'all') && typeof window !== 'undefined') {
      const sessionData = this.getFromSessionStorage(key)
      if (sessionData && this.isValid(sessionData, now)) {
        // Promote to memory cache
        this.setInMemory(key, sessionData)
        logger.debug('Cache hit (session)', { key })
        return sessionData.data
      }
    }

    // Try local storage
    if ((layer === 'local' || layer === 'all') && typeof window !== 'undefined') {
      const localData = this.getFromLocalStorage(key)
      if (localData && this.isValid(localData, now)) {
        // Promote to memory and session cache
        this.setInMemory(key, localData)
        this.setInSessionStorage(key, localData)
        logger.debug('Cache hit (local)', { key })
        return localData.data
      }
    }

    logger.debug('Cache miss', { key })
    return null
  }

  // SET with intelligent layering
  set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const {
      ttl = CACHE_CONFIG.memory.ttl,
      tags = [],
      layer = 'all'
    } = options

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      tags,
      accessCount: 1,
      lastAccessed: Date.now()
    }

    // Set in appropriate layers
    if (layer === 'memory' || layer === 'all') {
      this.setInMemory(key, entry)
    }

    if ((layer === 'session' || layer === 'all') && typeof window !== 'undefined') {
      this.setInSessionStorage(key, entry)
    }

    if ((layer === 'local' || layer === 'all') && typeof window !== 'undefined') {
      this.setInLocalStorage(key, entry)
    }

    logger.debug('Cache set', { key, layer, ttl })
  }

  // INVALIDATE by key or tags
  invalidate(keyOrTags: string | string[]): void {
    const isTag = Array.isArray(keyOrTags)
    const targets = isTag ? keyOrTags : [keyOrTags]

    if (isTag) {
      // Invalidate by tags
      this.invalidateByTags(targets)
    } else {
      // Invalidate specific key
      this.invalidateKey(keyOrTags)
    }

    logger.debug('Cache invalidated', { targets, isTag })
  }

  // GET OR SET pattern with stale-while-revalidate
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const { staleWhileRevalidate = false } = options
    
    // Try to get from cache first
    const cached = this.get<T>(key, options)
    
    if (cached) {
      // If stale-while-revalidate is enabled, refresh in background
      if (staleWhileRevalidate) {
        this.refreshInBackground(key, fetcher, options)
      }
      return cached
    }

    // Cache miss - fetch data
    const data = await fetcher()
    this.set(key, data, options)
    return data
  }

  // PRELOAD data for better UX
  async preload<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<void> {
    try {
      // Only preload if not already cached
      if (this.get(key, options) === null) {
        const data = await fetcher()
        this.set(key, data, options)
        logger.debug('Data preloaded', { key })
      }
    } catch (error) {
      logger.warn('Preload failed', { key, error })
    }
  }

  // BATCH operations for better performance
  setBatch<T>(entries: Array<{ key: string; data: T; options?: CacheOptions }>): void {
    entries.forEach(({ key, data, options }) => {
      this.set(key, data, options)
    })
  }

  getBatch<T>(keys: string[], options: CacheOptions = {}): Array<{ key: string; data: T | null }> {
    return keys.map(key => ({
      key,
      data: this.get<T>(key, options)
    }))
  }

  // MEMORY CACHE helpers
  private setInMemory<T>(key: string, entry: CacheEntry<T>): void {
    // Enforce size limit with LRU eviction
    if (this.memoryCache.size >= CACHE_CONFIG.memory.maxSize) {
      this.evictLRU()
    }
    this.memoryCache.set(key, entry)
  }

  private evictLRU(): void {
    let oldestKey = ''
    let oldestTime = Date.now()

    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.memoryCache.delete(oldestKey)
      logger.debug('LRU eviction', { key: oldestKey })
    }
  }

  // SESSION STORAGE helpers
  private getFromSessionStorage<T>(key: string): CacheEntry<T> | null {
    try {
      const stored = sessionStorage.getItem(`cache:${key}`)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  }

  private setInSessionStorage<T>(key: string, entry: CacheEntry<T>): void {
    try {
      sessionStorage.setItem(`cache:${key}`, JSON.stringify(entry))
    } catch (error) {
      // Storage full - clean up old entries
      this.cleanupSessionStorage()
      try {
        sessionStorage.setItem(`cache:${key}`, JSON.stringify(entry))
      } catch {
        logger.warn('Session storage full, skipping cache')
      }
    }
  }

  // LOCAL STORAGE helpers
  private getFromLocalStorage<T>(key: string): CacheEntry<T> | null {
    try {
      const stored = localStorage.getItem(`cache:${key}`)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  }

  private setInLocalStorage<T>(key: string, entry: CacheEntry<T>): void {
    try {
      localStorage.setItem(`cache:${key}`, JSON.stringify(entry))
    } catch (error) {
      // Storage full - clean up old entries
      this.cleanupLocalStorage()
      try {
        localStorage.setItem(`cache:${key}`, JSON.stringify(entry))
      } catch {
        logger.warn('Local storage full, skipping cache')
      }
    }
  }

  // VALIDATION
  private isValid<T>(entry: CacheEntry<T>, now: number): boolean {
    return (now - entry.timestamp) < entry.ttl
  }

  // INVALIDATION helpers
  private invalidateKey(key: string): void {
    this.memoryCache.delete(key)
    
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(`cache:${key}`)
      localStorage.removeItem(`cache:${key}`)
    }
  }

  private invalidateByTags(tags: string[]): void {
    // Memory cache
    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.tags.some(tag => tags.includes(tag))) {
        this.memoryCache.delete(key)
      }
    }

    // Session and local storage
    if (typeof window !== 'undefined') {
      this.cleanupStorageByTags(sessionStorage, tags)
      this.cleanupStorageByTags(localStorage, tags)
    }
  }

  private cleanupStorageByTags(storage: Storage, tags: string[]): void {
    const keysToRemove: string[] = []
    
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i)
      if (key?.startsWith('cache:')) {
        try {
          const entry = JSON.parse(storage.getItem(key) || '{}')
          if (entry.tags?.some((tag: string) => tags.includes(tag))) {
            keysToRemove.push(key)
          }
        } catch {
          // Invalid entry - remove it
          keysToRemove.push(key)
        }
      }
    }

    keysToRemove.forEach(key => storage.removeItem(key))
  }

  // BACKGROUND REFRESH
  private async refreshInBackground<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions
  ): Promise<void> {
    try {
      const data = await fetcher()
      this.set(key, data, options)
      logger.debug('Background refresh completed', { key })
    } catch (error) {
      logger.warn('Background refresh failed', { key, error })
    }
  }

  // CLEANUP methods
  private cleanup(): void {
    const now = Date.now()
    
    // Clean memory cache
    for (const [key, entry] of this.memoryCache.entries()) {
      if (!this.isValid(entry, now)) {
        this.memoryCache.delete(key)
      }
    }

    // Clean storage caches
    if (typeof window !== 'undefined') {
      this.cleanupSessionStorage()
      this.cleanupLocalStorage()
    }
  }

  private cleanupSessionStorage(): void {
    this.cleanupStorage(sessionStorage, CACHE_CONFIG.session.maxSize)
  }

  private cleanupLocalStorage(): void {
    this.cleanupStorage(localStorage, CACHE_CONFIG.local.maxSize)
  }

  private cleanupStorage(storage: Storage, maxSize: number): void {
    const cacheKeys: Array<{ key: string; entry: CacheEntry<any> }> = []
    const now = Date.now()

    // Collect all cache entries
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i)
      if (key?.startsWith('cache:')) {
        try {
          const entry = JSON.parse(storage.getItem(key) || '{}')
          if (this.isValid(entry, now)) {
            cacheKeys.push({ key, entry })
          } else {
            storage.removeItem(key) // Remove expired
          }
        } catch {
          storage.removeItem(key) // Remove invalid
        }
      }
    }

    // If still over limit, remove oldest entries
    if (cacheKeys.length > maxSize) {
      cacheKeys
        .sort((a, b) => a.entry.lastAccessed - b.entry.lastAccessed)
        .slice(0, cacheKeys.length - maxSize)
        .forEach(({ key }) => storage.removeItem(key))
    }
  }

  // CLEAR all caches
  clear(): void {
    this.memoryCache.clear()
    
    if (typeof window !== 'undefined') {
      // Clear only cache entries
      const sessionKeys = []
      const localKeys = []
      
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i)
        if (key?.startsWith('cache:')) sessionKeys.push(key)
      }
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith('cache:')) localKeys.push(key)
      }
      
      sessionKeys.forEach(key => sessionStorage.removeItem(key))
      localKeys.forEach(key => localStorage.removeItem(key))
    }

    logger.debug('All caches cleared')
  }

  // STATS for monitoring
  getStats() {
    const memorySize = this.memoryCache.size
    let sessionSize = 0
    let localSize = 0

    if (typeof window !== 'undefined') {
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i)
        if (key?.startsWith('cache:')) sessionSize++
      }
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith('cache:')) localSize++
      }
    }

    return {
      memory: { size: memorySize, limit: CACHE_CONFIG.memory.maxSize },
      session: { size: sessionSize, limit: CACHE_CONFIG.session.maxSize },
      local: { size: localSize, limit: CACHE_CONFIG.local.maxSize }
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
  }
}

// Global cache instance
export const enhancedCache = new EnhancedCache()

// React hook for cache operations
export function useEnhancedCache() {
  return {
    get: <T>(key: string, options?: CacheOptions) => enhancedCache.get<T>(key, options),
    set: <T>(key: string, data: T, options?: CacheOptions) => enhancedCache.set(key, data, options),
    invalidate: (keyOrTags: string | string[]) => enhancedCache.invalidate(keyOrTags),
    getOrSet: <T>(key: string, fetcher: () => Promise<T>, options?: CacheOptions) => 
      enhancedCache.getOrSet(key, fetcher, options),
    preload: <T>(key: string, fetcher: () => Promise<T>, options?: CacheOptions) => 
      enhancedCache.preload(key, fetcher, options),
    clear: () => enhancedCache.clear(),
    getStats: () => enhancedCache.getStats()
  }
}

// Cache tags for organized invalidation
export const CACHE_TAGS = {
  USER: 'user',
  COURSES: 'courses',
  QUIZZES: 'quizzes',
  DASHBOARD: 'dashboard',
  ADMIN: 'admin',
  AUTH: 'auth'
} as const

// Helper functions for common cache patterns
export const cacheHelpers = {
  // User-specific cache key
  userKey: (userId: string, suffix: string) => `user:${userId}:${suffix}`,
  
  // Course-specific cache key
  courseKey: (courseId: string, suffix: string) => `course:${courseId}:${suffix}`,
  
  // Quiz-specific cache key
  quizKey: (quizId: string, suffix: string) => `quiz:${quizId}:${suffix}`,
  
  // Invalidate user-related data
  invalidateUser: (userId: string) => {
    enhancedCache.invalidate([CACHE_TAGS.USER, `user:${userId}`])
  },
  
  // Invalidate course-related data
  invalidateCourse: (courseId: string) => {
    enhancedCache.invalidate([CACHE_TAGS.COURSES, `course:${courseId}`])
  }
}
