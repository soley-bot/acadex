// Lightweight API optimization utilities
import { NextRequest, NextResponse } from 'next/server'
import { logger } from './logger'

// Simple request caching for API routes
class SimpleAPICache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()
  private maxSize = 100

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

  clear() {
    this.cache.clear()
  }
}

const apiCache = new SimpleAPICache()

// Simple performance tracking
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

// Simple response helpers
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
