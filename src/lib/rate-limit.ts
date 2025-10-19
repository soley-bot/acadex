/**
 * Simple in-memory rate limiter for API routes
 * Uses LRU cache with sliding window algorithm
 *
 * For production with multiple instances, consider Redis-based rate limiting
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

class RateLimiter {
  private cache: Map<string, RateLimitEntry>
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    this.cache = new Map()

    // Clean up expired entries every minute
    this.cleanupInterval = setInterval(() => {
      const now = Date.now()
      for (const [key, entry] of this.cache.entries()) {
        if (entry.resetAt < now) {
          this.cache.delete(key)
        }
      }
    }, 60000)
  }

  /**
   * Check if a request should be rate limited
   * @param identifier - Unique identifier (IP address, user ID, etc.)
   * @param limit - Maximum number of requests allowed
   * @param windowMs - Time window in milliseconds
   * @returns Object with success status and remaining requests
   */
  check(
    identifier: string,
    limit: number,
    windowMs: number
  ): {
    success: boolean
    remaining: number
    resetAt: number
    retryAfter?: number
  } {
    const now = Date.now()
    const key = `${identifier}:${limit}:${windowMs}`
    const entry = this.cache.get(key)

    // No existing entry or expired entry
    if (!entry || entry.resetAt < now) {
      const resetAt = now + windowMs
      this.cache.set(key, { count: 1, resetAt })
      return {
        success: true,
        remaining: limit - 1,
        resetAt,
      }
    }

    // Within rate limit
    if (entry.count < limit) {
      entry.count++
      this.cache.set(key, entry)
      return {
        success: true,
        remaining: limit - entry.count,
        resetAt: entry.resetAt,
      }
    }

    // Rate limit exceeded
    return {
      success: false,
      remaining: 0,
      resetAt: entry.resetAt,
      retryAfter: Math.ceil((entry.resetAt - now) / 1000), // seconds
    }
  }

  /**
   * Reset rate limit for a specific identifier
   */
  reset(identifier: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(identifier)) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Clear all rate limit entries
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    this.cache.clear()
  }
}

// Singleton instance
const rateLimiter = new RateLimiter()

// Clean up on process exit
if (typeof process !== 'undefined') {
  process.on('beforeExit', () => {
    rateLimiter.destroy()
  })
}

export default rateLimiter

/**
 * Helper function to extract client identifier from request
 */
export function getClientIdentifier(request: Request): string {
  // Try to get IP from various headers (for proxies/load balancers)
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip') // Cloudflare

  // Use the first IP from x-forwarded-for if available
  const ip =
    cfConnectingIp ||
    realIp ||
    (forwardedFor ? forwardedFor.split(',')[0].trim() : null) ||
    'unknown'

  return ip
}

/**
 * Preset rate limit configurations
 */
export const RateLimitPresets = {
  // Very strict - for expensive operations
  strict: { limit: 10, windowMs: 60000 }, // 10 requests per minute

  // Standard - for normal API endpoints
  standard: { limit: 100, windowMs: 60000 }, // 100 requests per minute

  // Relaxed - for public endpoints
  relaxed: { limit: 300, windowMs: 60000 }, // 300 requests per minute

  // Generous - for frequently accessed data
  generous: { limit: 1000, windowMs: 60000 }, // 1000 requests per minute
} as const
