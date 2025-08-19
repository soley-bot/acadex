// Lightweight API optimization utilities
import { NextRequest, NextResponse } from 'next/server'
import { logger } from './logger'

// Request caching for API routes
class APICache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()
  private maxSize = 500

  set(key: string, data: any, ttl: number = 300000) { // 5 min default
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  get(key: string) {
    const entry = this.cache.get(key)
    if (!entry) return null

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  invalidate(pattern: string) {
    const keysToDelete = Array.from(this.cache.keys()).filter(key => 
      key.includes(pattern)
    )
    keysToDelete.forEach(key => this.cache.delete(key))
  }

  clear() {
    this.cache.clear()
  }
}

const apiCache = new APICache()

// Performance middleware
export function withPerformanceTracking(handler: Function) {
  return async (req: NextRequest, ...args: any[]) => {
    const startTime = performance.now()
    const path = new URL(req.url).pathname

    try {
      const response = await handler(req, ...args)
      const duration = performance.now() - startTime

      logger.info('API request completed', {
        path,
        method: req.method,
        duration: `${duration.toFixed(2)}ms`,
        status: response.status || 200,
      })

      // Add performance headers
      if (response instanceof NextResponse) {
        response.headers.set('X-Response-Time', `${duration.toFixed(2)}ms`)
        response.headers.set('X-Cache', 'MISS')
      }

      return response
    } catch (error) {
      const duration = performance.now() - startTime
      logger.error('API request failed', {
        path,
        method: req.method,
        duration: `${duration.toFixed(2)}ms`,
        error: error instanceof Error ? error.message : 'Unknown error',
      })

      throw error
    }
  }
}

// Caching middleware
export function withCaching(options: {
  ttl?: number
  keyGenerator?: (req: NextRequest) => string
  shouldCache?: (req: NextRequest, response: any) => boolean
} = {}) {
  const { 
    ttl = 300000, // 5 minutes
    keyGenerator = (req) => `${req.method}:${req.url}`,
    shouldCache = (req, response) => req.method === 'GET' && response?.status === 200
  } = options

  return function(handler: Function) {
    return withPerformanceTracking(async (req: NextRequest, ...args: any[]) => {
      const cacheKey = keyGenerator(req)

      // Try cache first for GET requests
      if (req.method === 'GET') {
        const cached = apiCache.get(cacheKey)
        if (cached) {
          logger.debug('Cache hit', { path: new URL(req.url).pathname })
          const response = NextResponse.json(cached)
          response.headers.set('X-Cache', 'HIT')
          return response
        }
      }

      // Execute handler
      const response = await handler(req, ...args)

      // Cache successful responses
      if (shouldCache(req, response)) {
        try {
          const responseData = await response.json()
          apiCache.set(cacheKey, responseData, ttl)
        } catch (error) {
          // Response might not be JSON, skip caching
          logger.debug('Response not cacheable', { path: new URL(req.url).pathname })
        }
      }

      return response
    })
  }
}

// Response helpers
export const ApiResponse = {
  success: <T>(data: T, meta?: any) => {
    return NextResponse.json({
      success: true,
      data,
      meta,
      timestamp: new Date().toISOString(),
    })
  },

  error: (message: string, code: number = 400, details?: any) => {
    return NextResponse.json({
      success: false,
      error: {
        message,
        code,
        details,
      },
      timestamp: new Date().toISOString(),
    }, { status: code })
  },
}

// Export cache instance for manual management
export { apiCache }
