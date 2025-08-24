/**
 * OPTIMIZED Next.js Middleware
 * Eliminates duplicate auth checks, improves caching, and streamlines redirects
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { securityHeaders, withCORS } from './src/lib/security-headers'
import { AuthSecurity } from './src/lib/auth-security'

// Enhanced rate limiting store with TTL cleanup
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Auth result cache to avoid duplicate checks within same request cycle
const authCache = new Map<string, { user: any; role: string; timestamp: number }>()
const AUTH_CACHE_TTL = 5000 // 5 seconds

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const origin = request.headers.get('origin')
  const startTime = Date.now()

  // Apply security headers to all responses
  let response = securityHeaders(request)

  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return withCORS(new NextResponse(null, { status: 200 }), origin || undefined)
  }

  // API routes security
  if (pathname.startsWith('/api/')) {
    const clientIP = getClientIP(request)
    const rateLimitResult = checkRateLimit(clientIP, 100, 60000)

    if (!rateLimitResult.allowed) {
      return withCORS(
        NextResponse.json(
          { error: 'Too many requests', resetTime: rateLimitResult.resetTime },
          { status: 429 }
        ),
        origin || undefined
      )
    }
    response = withCORS(response, origin || undefined)
  }

  // UNIFIED AUTH CHECK - Handles both admin and protected routes
  const authResult = await getAuthResult(request, pathname)
  
  if (authResult.requiresRedirect) {
    console.log('Middleware redirect:', {
      pathname,
      redirectTo: authResult.redirectTo,
      reason: authResult.reason,
      duration: Date.now() - startTime + 'ms'
    })
    return NextResponse.redirect(new URL(authResult.redirectTo, request.url))
  }

  // Add performance headers
  response.headers.set('X-Middleware-Duration', (Date.now() - startTime).toString())
  
  return response
}

/**
 * UNIFIED AUTH RESULT - Single auth check for all routes
 */
async function getAuthResult(request: NextRequest, pathname: string) {
  const cacheKey = `${pathname}:${request.cookies.toString()}`
  const now = Date.now()
  
  // Check auth cache first
  const cached = authCache.get(cacheKey)
  if (cached && (now - cached.timestamp) < AUTH_CACHE_TTL) {
    return determineRouteAccess(pathname, cached.user, cached.role)
  }

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (name: string) => request.cookies.get(name)?.value,
          set: () => {}, // Not needed in middleware
          remove: () => {} // Not needed in middleware
        }
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    const userRole = user ? AuthSecurity.determineRole(user.email || '') : null

    // Cache the auth result
    authCache.set(cacheKey, { user, role: userRole, timestamp: now })
    
    // Cleanup old cache entries
    if (authCache.size > 100) {
      for (const [key, value] of authCache.entries()) {
        if ((now - value.timestamp) > AUTH_CACHE_TTL) {
          authCache.delete(key)
        }
      }
    }

    return determineRouteAccess(pathname, user, userRole)

  } catch (error) {
    console.error('Middleware auth error:', error)
    return {
      requiresRedirect: isProtectedRoute(pathname),
      redirectTo: `/auth/login?redirectTo=${encodeURIComponent(pathname)}`,
      reason: 'auth_error'
    }
  }
}

/**
 * ROUTE ACCESS DETERMINATION - Single source of truth
 */
function determineRouteAccess(pathname: string, user: any, userRole: string | null) {
  // Admin routes
  if (pathname.startsWith('/admin')) {
    if (!user) {
      return {
        requiresRedirect: true,
        redirectTo: `/auth/login?redirectTo=${encodeURIComponent(pathname)}`,
        reason: 'no_user'
      }
    }
    if (userRole !== 'admin') {
      return {
        requiresRedirect: true,
        redirectTo: '/unauthorized',
        reason: 'not_admin'
      }
    }
    return { requiresRedirect: false }
  }

  // Protected routes
  if (isProtectedRoute(pathname)) {
    if (!user) {
      return {
        requiresRedirect: true,
        redirectTo: `/auth/login?redirectTo=${encodeURIComponent(pathname)}`,
        reason: 'no_user'
      }
    }
    return { requiresRedirect: false }
  }

  return { requiresRedirect: false }
}

/**
 * PROTECTED ROUTES CHECK - Optimized pattern matching
 */
function isProtectedRoute(pathname: string): boolean {
  const protectedPatterns = [
    /^\/dashboard/,
    /^\/courses\/[^/]+\/study/,
    /^\/profile/,
    /^\/progress/
  ]
  
  return protectedPatterns.some(pattern => pattern.test(pathname))
}

/**
 * OPTIMIZED RATE LIMITING
 */
function checkRateLimit(key: string, maxRequests: number, windowMs: number) {
  const now = Date.now()
  const record = rateLimitStore.get(key)

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs })
    return { allowed: true }
  }

  if (record.count >= maxRequests) {
    return { allowed: false, resetTime: record.resetTime }
  }

  record.count++
  return { allowed: true }
}

/**
 * CLIENT IP EXTRACTION
 */
function getClientIP(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwardedFor) {
    const firstIP = forwardedFor.split(',')[0]?.trim()
    if (firstIP) return firstIP
  }
  
  return realIP || 'unknown'
}

// Cleanup intervals
setInterval(() => {
  const now = Date.now()
  // Clean rate limit store
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key)
    }
  }
  // Clean auth cache
  for (const [key, value] of authCache.entries()) {
    if ((now - value.timestamp) > AUTH_CACHE_TTL) {
      authCache.delete(key)
    }
  }
}, 5 * 60 * 1000) // Every 5 minutes

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/|images/|svgicon/|Icons8/).*)',
  ],
}
