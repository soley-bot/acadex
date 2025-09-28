/**
 * SIMPLIFIED MIDDLEWARE - Essential functionality only
 * No memory leaks, no complex caching, no global state
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for static files and public routes
  if (pathname.startsWith('/_next/') ||
      pathname.startsWith('/api/') ||
      pathname.includes('.') ||
      pathname === '/favicon.ico' ||
      pathname === '/robots.txt' ||
      pathname === '/sitemap.xml' ||
      pathname.startsWith('/auth/')) {
    return NextResponse.next()
  }

  // Only handle auth for protected routes
  if (isProtectedRoute(pathname)) {
    const authResult = await checkAuth(request)
    
    if (authResult.requiresRedirect && authResult.redirectTo) {
      return NextResponse.redirect(new URL(authResult.redirectTo, request.url))
    }
  }

  // Add basic security headers
  const response = NextResponse.next()
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  return response
}

/**
 * Simple auth check without caching
 */
async function checkAuth(request: NextRequest) {
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
    
    if (!user) {
      return {
        requiresRedirect: true,
        redirectTo: '/auth/login'
      }
    }

    // Check admin routes
    if (request.nextUrl.pathname.startsWith('/admin')) {
      const { data: userRecord } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()
      
      if (userRecord?.role !== 'admin') {
        return {
          requiresRedirect: true,
          redirectTo: '/unauthorized'
        }
      }
    }

    return { requiresRedirect: false }
  } catch (error) {
    console.error('Auth check failed:', error)
    return {
      requiresRedirect: true,
      redirectTo: '/auth/login'
    }
  }
}

/**
 * Check if route requires authentication
 */
function isProtectedRoute(pathname: string): boolean {
  const protectedPatterns = [
    /^\/dashboard/,
    /^\/admin/,
    /^\/profile/,
    /^\/progress/,
    /^\/courses\/[^/]+\/study/
  ]
  
  return protectedPatterns.some(pattern => pattern.test(pathname))
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, robots.txt, sitemap.xml (SEO files)
     * - file extensions (images, fonts, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.[a-zA-Z0-9]+$).*)',
  ],
}