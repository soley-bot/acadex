/**
 * Next.js Middleware with Security Enhancements
 * Implements comprehensive security for the Acadex platform
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { securityHeaders, withCORS } from './src/lib/security-headers'
import { AuthSecurity } from './src/lib/auth-security'

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const origin = request.headers.get('origin')

  // Apply security headers to all responses
  let response = securityHeaders(request)

  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return withCORS(new NextResponse(null, { status: 200 }), origin || undefined)
  }

  // API routes security
  if (pathname.startsWith('/api/')) {
    // Rate limiting for API routes
    const clientIP = getClientIP(request)
    const rateLimitResult = checkRateLimit(clientIP, 100, 60000) // 100 requests per minute

    if (!rateLimitResult.allowed) {
      return withCORS(
        NextResponse.json(
          { error: 'Too many requests', resetTime: rateLimitResult.resetTime },
          { status: 429 }
        ),
        origin || undefined
      )
    }

    // Apply CORS to API responses
    response = withCORS(response, origin || undefined)
  }

  // Admin route protection
  if (pathname.startsWith('/admin')) {
    try {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get: (name: string) => {
              return request.cookies.get(name)?.value
            },
            set: (name: string, value: string, options: any) => {
              // In middleware, we can't set cookies directly
              // This will be handled by the response
            },
            remove: (name: string, options: any) => {
              // In middleware, we can't remove cookies directly
              // This will be handled by the response
            }
          }
        }
      )

      const { data: { user } } = await supabase.auth.getUser()

      console.log('Middleware admin check:', {
        pathname,
        hasUser: !!user,
        userEmail: user?.email,
        timestamp: new Date().toISOString()
      })

      if (!user) {
        // Redirect to login with new auth path
        const loginUrl = new URL('/auth/login', request.url)
        loginUrl.searchParams.set('redirectTo', pathname)
        console.log('Middleware: Redirecting to login, no user found')
        return NextResponse.redirect(loginUrl)
      }

      // Check admin role
      const userRole = AuthSecurity.determineRole(user.email || '')
      
      console.log('Middleware role check:', {
        userEmail: user.email,
        determinedRole: userRole,
        isAdmin: userRole === 'admin'
      })
      
      if (userRole !== 'admin') {
        // Redirect to unauthorized page
        console.log('Middleware: Redirecting to unauthorized, not admin')
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }

      console.log('Middleware: Admin access granted, proceeding')

    } catch (error) {
      console.error('Middleware auth error:', error)
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/courses/*/study', '/profile']
  const isProtectedRoute = protectedRoutes.some(route => {
    if (route.includes('*')) {
      const pattern = route.replace('*', '[^/]+')
      return new RegExp(`^${pattern}`).test(pathname)
    }
    return pathname.startsWith(route)
  })

  if (isProtectedRoute) {
    try {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get: (name: string) => {
              return request.cookies.get(name)?.value
            }
          }
        }
      )

      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        const loginUrl = new URL('/auth/login', request.url)
        loginUrl.searchParams.set('redirectTo', pathname)
        return NextResponse.redirect(loginUrl)
      }

    } catch (error) {
      console.error('Middleware auth error:', error)
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return response
}

/**
 * Extract client IP address
 */
function getClientIP(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
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
function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; resetTime?: number } {
  const now = Date.now()
  const record = rateLimitStore.get(key)

  if (!record || now > record.resetTime) {
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

  record.count++
  rateLimitStore.set(key, record)
  
  return { allowed: true }
}

// Cleanup expired rate limit records
setInterval(() => {
  const now = Date.now()
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}, 5 * 60 * 1000) // Every 5 minutes

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/|images/|svgicon/|Icons8/).*)',
  ],
}
