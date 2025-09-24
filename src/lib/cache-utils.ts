/**
 * Cache Utilities (Non-React)
 * Extracted from useConsolidatedCaching.ts for use in server-side code
 */

import { logger } from '@/lib/logger'

// ==============================================
// SMART CACHE (Non-React)
// ==============================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccess: number;
}

class SmartCache {
  private memoryCache = new Map<string, CacheEntry<any>>();
  private maxSize = 100;
  private defaultTTL = 5 * 60 * 1000;

  get<T>(key: string): T | null {
    const entry = this.memoryCache.get(key);
    
    if (!entry) {
      return null;
    }

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.memoryCache.delete(key);
      return null;
    }

    entry.accessCount++;
    entry.lastAccess = Date.now();
    
    return entry.data;
  }

  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    if (this.memoryCache.size >= this.maxSize) {
      this.evictLeastUsed();
    }

    this.memoryCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      accessCount: 0,
      lastAccess: Date.now()
    });
  }

  has(key: string): boolean {
    const entry = this.memoryCache.get(key);
    if (!entry) return false;
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.memoryCache.delete(key);
      return false;
    }
    
    return true;
  }

  delete(key: string): boolean {
    return this.memoryCache.delete(key);
  }

  clear(): void {
    this.memoryCache.clear();
  }

  private evictLeastUsed(): void {
    let leastUsed = { key: '', accessCount: Infinity };
    
    for (const [key, entry] of this.memoryCache) {
      if (entry.accessCount < leastUsed.accessCount) {
        leastUsed = { key, accessCount: entry.accessCount };
      }
    }
    
    if (leastUsed.key) {
      this.memoryCache.delete(leastUsed.key);
    }
  }
}

const globalCache = new SmartCache();

// Cache utilities for different data types
export const cacheUtils = {
  session: {
    get: (key: string) => globalCache.get(`session:${key}`),
    set: (key: string, data: any, ttl?: number) => globalCache.set(`session:${key}`, data, ttl || 30 * 60 * 1000),
    delete: (key: string) => globalCache.delete(`session:${key}`)
  },
  api: {
    get: (endpoint: string) => globalCache.get(`api:${endpoint}`),
    set: (endpoint: string, data: any, ttl?: number) => globalCache.set(`api:${endpoint}`, data, ttl || 2 * 60 * 1000),
    delete: (endpoint: string) => globalCache.delete(`api:${endpoint}`)
  },
  get: <T>(key: string): T | null => globalCache.get<T>(key),
  set: <T>(key: string, data: T, ttl?: number) => globalCache.set(key, data, ttl),
  has: (key: string) => globalCache.has(key),
  delete: (key: string) => globalCache.delete(key),
  clear: () => globalCache.clear()
};

// Cache wrapper for async functions
export function withCache<T extends any[], R>(
  key: string | ((...args: T) => string),
  fn: (...args: T) => Promise<R>,
  ttl?: number
) {
  return async (...args: T): Promise<R> => {
    const cacheKey = typeof key === 'string' ? key : key(...args);
    
    const cached = cacheUtils.get<R>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    try {
      const result = await fn(...args);
      cacheUtils.set(cacheKey, result, ttl);
      return result;
    } catch (error) {
      throw error;
    }
  };
}