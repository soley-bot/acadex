/**
 * API Security Middleware
 * Provides secure API endpoint protection for Student/Admin system
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { AuthSecurity, type UserRole } from './auth-security'
import { logger } from './logger'
import type { User } from './supabase'

interface SecurityOptions {
  requiresAuth?: boolean
  allowedRoles?: UserRole[]
  rateLimit?: {
    requests: number
    windowMs: number
  }
  validateInput?: boolean
}

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export class APISecurityMiddleware {
  /**
   * Creates secure API route handler with protection
   */
  static protect(handler: Function, options: SecurityOptions = {}) {
    return async (req: NextRequest, context?: any) => {
      const startTime = Date.now()
      const clientIP = this.getClientIP(req)
      const userAgent = req.headers.get('user-agent') || 'unknown'
      const endpoint = req.nextUrl.pathname
      let user: User | null = null

      try {
        // Create Supabase client for server-side auth
        const supabase = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            cookies: {
              get: (name: string) => {
                const cookies = req.headers.get('cookie')
                if (!cookies) return undefined
                const match = cookies.match(new RegExp(`(^| )${name}=([^;]+)`))
                return match && match[2] ? decodeURIComponent(match[2]) : undefined
              }
            }
          }
        )

        // Get authenticated user
        const { data: { user: supabaseUser } } = await supabase.auth.getUser()

        if (supabaseUser) {
          // Get full user profile
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', supabaseUser.id)
            .single()

          user = profile || {
            id: supabaseUser.id,
            email: supabaseUser.email!,
            name: supabaseUser.user_metadata?.name || 'Unknown',
            role: AuthSecurity.determineRole(supabaseUser.email!),
            created_at: supabaseUser.created_at,
            updated_at: supabaseUser.updated_at || supabaseUser.created_at
          }
        }

        // Rate limiting check
        if (options.rateLimit) {
          const rateLimitResult = this.checkRateLimit(
            clientIP,
            options.rateLimit.requests,
            options.rateLimit.windowMs
          )

          if (!rateLimitResult.allowed) {
            logger.security('API rate limit exceeded', {
              endpoint,
              clientIP,
              userAgent,
              userId: user?.id,
              resetTime: rateLimitResult.resetTime
            })

            return NextResponse.json(
              { 
                error: 'Too many requests',
                resetTime: rateLimitResult.resetTime 
              },
              { status: 429 }
            )
          }
        }

        // Authentication check
        if (options.requiresAuth && !user) {
          logger.security('Unauthorized API access attempt', {
            endpoint,
            clientIP,
            userAgent
          })

          return NextResponse.json(
            { error: 'Authentication required' },
            { status: 401 }
          )
        }

        // Role-based authorization
        if (options.allowedRoles && user && !options.allowedRoles.includes(user.role)) {
          logger.security('Insufficient permissions for API access', {
            endpoint,
            clientIP,
            userAgent,
            userId: user.id,
            userRole: user.role,
            requiredRoles: options.allowedRoles
          })

          return NextResponse.json(
            { 
              error: 'Insufficient permissions',
              required: options.allowedRoles,
              current: user.role 
            },
            { status: 403 }
          )
        }

        // Input validation (basic)
        if (options.validateInput && req.method !== 'GET') {
          const contentType = req.headers.get('content-type')
          
          if (contentType?.includes('application/json')) {
            try {
              const body = await req.json()
              const validationResult = this.validateInput(body, endpoint)
              
              if (!validationResult.isValid) {
                logger.security('Invalid input detected', {
                  endpoint,
                  clientIP,
                  userId: user?.id,
                  errors: validationResult.errors
                })

                return NextResponse.json(
                  { 
                    error: 'Invalid input',
                    details: validationResult.errors 
                  },
                  { status: 400 }
                )
              }

              // Create new request with validated body
              const newReq = new NextRequest(req.url, {
                method: req.method,
                headers: req.headers,
                body: JSON.stringify(body)
              })
              
              // Add validated data to request
              ;(newReq as any).validatedBody = body
              req = newReq
            } catch (parseError) {
              return NextResponse.json(
                { error: 'Invalid JSON' },
                { status: 400 }
              )
            }
          }
        }

        // Log successful API access
        logger.apiCall(endpoint, req.method, {
          userId: user?.id,
          userRole: user?.role,
          clientIP,
          responseTime: Date.now() - startTime
        })

        // Add security context to request
        ;(req as any).securityContext = {
          user,
          clientIP,
          userAgent,
          startTime
        }

        // Call the original handler
        const response = await handler(req, context)
        
        // Log response
        logger.performance('api-request', Date.now() - startTime, 'ms')
        logger.debug('API request completed', {
          endpoint,
          method: req.method,
          userId: user?.id,
          status: response?.status || 200
        })

        return response

      } catch (error) {
        logger.error('API security middleware error', {
          endpoint,
          clientIP,
          error: error instanceof Error ? error.message : 'Unknown error',
          userId: user?.id
        })

        return NextResponse.json(
          { error: 'Internal server error' },
          { status: 500 }
        )
      }
    }
  }

  /**
   * Extract client IP address
   */
  private static getClientIP(req: NextRequest): string {
    const forwardedFor = req.headers.get('x-forwarded-for')
    const realIP = req.headers.get('x-real-ip')
    
    if (forwardedFor && forwardedFor.length > 0) {
      const firstIP = forwardedFor.split(',')[0]?.trim()
      if (firstIP) return firstIP
    }
    
    if (realIP && realIP.length > 0) {
      return realIP
    }
    
    return 'unknown'
  }

  /**
   * Rate limiting implementation
   */
  private static checkRateLimit(
    key: string,
    maxRequests: number,
    windowMs: number
  ): { allowed: boolean; resetTime?: number } {
    const now = Date.now()
    const record = rateLimitStore.get(key)

    if (!record || now > record.resetTime) {
      // Create new record or reset expired one
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + windowMs
      })
      return { allowed: true }
    }

    if (record.count >= maxRequests) {
      return { 
        allowed: false,
        resetTime: record.resetTime 
      }
    }

    // Increment count
    record.count++
    rateLimitStore.set(key, record)
    
    return { allowed: true }
  }

  /**
   * Basic input validation
   */
  private static validateInput(
    body: any,
    endpoint: string
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // Basic checks
    if (typeof body !== 'object' || body === null) {
      errors.push('Request body must be an object')
      return { isValid: false, errors }
    }

    // Check for common injection patterns
    const stringified = JSON.stringify(body).toLowerCase()
    
    const dangerousPatterns = [
      'script',
      'javascript:',
      'data:',
      'vbscript:',
      'onload',
      'onerror',
      'onclick',
      '<script',
      '</script>',
      'eval(',
      'function(',
      'constructor',
      '__proto__',
      'prototype'
    ]

    for (const pattern of dangerousPatterns) {
      if (stringified.includes(pattern)) {
        errors.push(`Potentially dangerous content detected: ${pattern}`)
      }
    }

    // Endpoint-specific validation
    if (endpoint.includes('/admin/') && !endpoint.includes('/api/admin/')) {
      errors.push('Invalid admin endpoint access')
    }

    // Size limits
    if (stringified.length > 1024 * 1024) { // 1MB limit
      errors.push('Request body too large')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Cleanup expired rate limit records
   */
  static cleanupRateLimit() {
    const now = Date.now()
    for (const [key, record] of rateLimitStore.entries()) {
      if (now > record.resetTime) {
        rateLimitStore.delete(key)
      }
    }
  }
}

// Cleanup interval for rate limiting (run every 5 minutes)
if (typeof globalThis !== 'undefined') {
  setInterval(() => {
    APISecurityMiddleware.cleanupRateLimit()
  }, 5 * 60 * 1000)
}

// Convenience functions for common use cases
export const requireAuth = (handler: Function) => 
  APISecurityMiddleware.protect(handler, { requiresAuth: true })

export const requireAdmin = (handler: Function) => 
  APISecurityMiddleware.protect(handler, { 
    requiresAuth: true, 
    allowedRoles: ['admin'] 
  })

export const withRateLimit = (handler: Function, requests = 60, windowMs = 60000) =>
  APISecurityMiddleware.protect(handler, { 
    rateLimit: { requests, windowMs }
  })

export const secureAPI = (handler: Function, options: SecurityOptions = {}) =>
  APISecurityMiddleware.protect(handler, {
    requiresAuth: true,
    validateInput: true,
    rateLimit: { requests: 60, windowMs: 60000 },
    ...options
  })
