/**
 * SIMPLIFIED MIDDLEWARE - Essential functionality only
 * No memory leaks, no complex caching, no global state
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Create response early so we can modify cookies
  let response = NextResponse.next()

  // Skip middleware for static files and public routes
  if (pathname.startsWith('/_next/') ||
      pathname.startsWith('/api/') ||
      pathname.includes('.') ||
      pathname === '/favicon.ico' ||
      pathname === '/robots.txt' ||
      pathname === '/sitemap.xml' ||
      pathname.startsWith('/auth/') ||
      pathname.startsWith('/admin/import')) {  // Let AdminRoute component handle import auth
    return response
  }

  // Only handle auth for protected routes
  if (isProtectedRoute(pathname)) {
    const authResult = await checkAuth(request, response)

    if (authResult.requiresRedirect && authResult.redirectTo) {
      return NextResponse.redirect(new URL(authResult.redirectTo, request.url))
    }

    // Use the response from checkAuth which may have updated cookies
    if (authResult.response) {
      response = authResult.response
    }
  }

  // Add basic security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  return response
}

/**
 * Simple auth check with proper cookie handling
 * Returns response object to allow middleware to update cookies
 */
async function checkAuth(request: NextRequest, response: NextResponse) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (name: string) => request.cookies.get(name)?.value,
          set: (name: string, value: string, options: any) => {
            // Update both request and response cookies for proper token management
            request.cookies.set({ name, value, ...options })
            response.cookies.set({ name, value, ...options })
          },
          remove: (name: string, options: any) => {
            request.cookies.set({ name, value: '', ...options })
            response.cookies.set({ name, value: '', ...options })
          }
        }
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      // Include original URL in redirect parameter
      const redirectPath = request.nextUrl.pathname + request.nextUrl.search
      return {
        requiresRedirect: true,
        redirectTo: `/auth?tab=signin&redirect=${encodeURIComponent(redirectPath)}`,
        response
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
          redirectTo: '/unauthorized',
          response
        }
      }
    }

    return { requiresRedirect: false, response }
  } catch (error) {
    console.error('Auth check failed:', error)
    const redirectPath = request.nextUrl.pathname + request.nextUrl.search
    return {
      requiresRedirect: true,
      redirectTo: `/auth?tab=signin&redirect=${encodeURIComponent(redirectPath)}`,
      response
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
    /^\/courses\/[^/]+\/study/,
    /^\/quizzes\/[^/]+\/take/,        // Quiz taking requires auth
    /^\/quizzes\/[^/]+\/results/      // Quiz results requires auth
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