// Simple cache utility for admin data
interface CacheItem<T> {
  data: T
  timestamp: number
  expires: number
}

class AdminCache {
  private cache = new Map<string, CacheItem<any>>()
  private defaultTTL = 5 * 60 * 1000 // 5 minutes

  set<T>(key: string, data: T, ttl?: number): void {
    const expires = Date.now() + (ttl || this.defaultTTL)
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expires
    })
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() > item.expires) {
      this.cache.delete(key)
      return null
    }

    return item.data as T
  }

  getCacheAge(key: string): number | null {
    const item = this.cache.get(key)
    if (!item) return null
    
    return Date.now() - item.timestamp
  }

  invalidate(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  // Cache keys for different data types
  static keys = {
    users: 'admin:users',
    courses: 'admin:courses', 
    quizzes: 'admin:quizzes',
    analytics: 'admin:analytics'
  } as const
}

export const adminCache = new AdminCache()
