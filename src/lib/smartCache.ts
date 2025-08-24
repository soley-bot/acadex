/**
 * Simplified but powerful caching system for Acadex
 * Focuses on performance with smart invalidation
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccess: number;
}

class SmartCache {
  private memoryCache = new Map<string, CacheEntry<any>>();
  private maxSize = 100; // Maximum number of entries
  private defaultTTL = 5 * 60 * 1000; // 5 minutes default

  // Get from cache with automatic cleanup
  get<T>(key: string): T | null {
    const entry = this.memoryCache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.memoryCache.delete(key);
      return null;
    }

    // Update access info
    entry.accessCount++;
    entry.lastAccess = Date.now();
    
    return entry.data;
  }

  // Set cache entry with smart eviction
  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    // Clean up if at max size
    if (this.memoryCache.size >= this.maxSize) {
      this.evictLeastUsed();
    }

    this.memoryCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      accessCount: 1,
      lastAccess: Date.now()
    });
  }

  // Check if key exists and is valid
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  // Remove specific key
  delete(key: string): boolean {
    return this.memoryCache.delete(key);
  }

  // Clear all cache
  clear(): void {
    this.memoryCache.clear();
  }

  // Evict least recently used items
  private evictLeastUsed(): void {
    let oldestEntry: string | null = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.lastAccess < oldestTime) {
        oldestTime = entry.lastAccess;
        oldestEntry = key;
      }
    }

    if (oldestEntry) {
      this.memoryCache.delete(oldestEntry);
    }
  }

  // Get cache statistics
  getStats() {
    const entries = Array.from(this.memoryCache.values());
    return {
      size: this.memoryCache.size,
      totalAccess: entries.reduce((sum, entry) => sum + entry.accessCount, 0),
      avgAccess: entries.length > 0 ? entries.reduce((sum, entry) => sum + entry.accessCount, 0) / entries.length : 0
    };
  }
}

// Global cache instance
const globalCache = new SmartCache();

// Cache utilities for different data types
export const cacheUtils = {
  // User data caching
  user: {
    get: (userId: string) => globalCache.get(`user:${userId}`),
    set: (userId: string, data: any) => globalCache.set(`user:${userId}`, data, 10 * 60 * 1000), // 10 minutes
    delete: (userId: string) => globalCache.delete(`user:${userId}`)
  },

  // Course data caching
  course: {
    get: (courseId: string) => globalCache.get(`course:${courseId}`),
    set: (courseId: string, data: any) => globalCache.set(`course:${courseId}`, data, 15 * 60 * 1000), // 15 minutes
    delete: (courseId: string) => globalCache.delete(`course:${courseId}`),
    list: () => globalCache.get('courses:list'),
    setList: (data: any) => globalCache.set('courses:list', data, 5 * 60 * 1000) // 5 minutes
  },

  // Quiz data caching
  quiz: {
    get: (quizId: string) => globalCache.get(`quiz:${quizId}`),
    set: (quizId: string, data: any) => globalCache.set(`quiz:${quizId}`, data, 10 * 60 * 1000),
    delete: (quizId: string) => globalCache.delete(`quiz:${quizId}`)
  },

  // Session data caching
  session: {
    get: (key: string) => globalCache.get(`session:${key}`),
    set: (key: string, data: any, ttl?: number) => globalCache.set(`session:${key}`, data, ttl || 30 * 60 * 1000), // 30 minutes
    delete: (key: string) => globalCache.delete(`session:${key}`)
  },

  // API response caching
  api: {
    get: (endpoint: string) => globalCache.get(`api:${endpoint}`),
    set: (endpoint: string, data: any, ttl?: number) => globalCache.set(`api:${endpoint}`, data, ttl || 2 * 60 * 1000), // 2 minutes
    delete: (endpoint: string) => globalCache.delete(`api:${endpoint}`)
  },

  // Generic cache operations
  get: <T>(key: string): T | null => globalCache.get<T>(key),
  set: <T>(key: string, data: T, ttl?: number) => globalCache.set(key, data, ttl),
  has: (key: string) => globalCache.has(key),
  delete: (key: string) => globalCache.delete(key),
  clear: () => globalCache.clear(),
  stats: () => globalCache.getStats()
};

// Cache wrapper for async functions
export function withCache<T extends any[], R>(
  key: string | ((...args: T) => string),
  fn: (...args: T) => Promise<R>,
  ttl?: number
) {
  return async (...args: T): Promise<R> => {
    const cacheKey = typeof key === 'string' ? key : key(...args);
    
    // Try to get from cache first
    const cached = cacheUtils.get<R>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    // Execute function and cache result
    try {
      const result = await fn(...args);
      cacheUtils.set(cacheKey, result, ttl);
      return result;
    } catch (error) {
      // Don't cache errors
      throw error;
    }
  };
}

// Invalidate related cache entries
export function invalidateCache(pattern: string): void {
  const keysToDelete: string[] = [];
  
  // This is a simple pattern matching - could be enhanced with regex
  for (const [key] of globalCache['memoryCache'].entries()) {
    if (key.includes(pattern)) {
      keysToDelete.push(key);
    }
  }
  
  keysToDelete.forEach(key => globalCache.delete(key));
}

// Preload cache for common operations
export async function preloadCache() {
  try {
    // Could preload common data here
    console.log('Cache preloading initiated');
  } catch (error) {
    console.warn('Cache preloading failed:', error);
  }
}
