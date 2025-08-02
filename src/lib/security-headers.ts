/**
 * Security Headers Middleware
 * Implements comprehensive security headers for the application
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function securityHeaders(request: NextRequest) {
  const response = NextResponse.next()

  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://checkout.stripe.com https://maps.googleapis.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    "media-src 'self' blob: https:",
    "connect-src 'self' https://*.supabase.co https://api.stripe.com",
    "frame-src 'self' https://js.stripe.com https://checkout.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; ')

  // Security headers
  response.headers.set('Content-Security-Policy', csp)
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  // HSTS (HTTP Strict Transport Security)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    )
  }

  // Permissions Policy
  response.headers.set(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=()'
  )

  // Remove potentially revealing headers
  response.headers.delete('X-Powered-By')
  response.headers.delete('Server')

  return response
}

/**
 * CORS headers for API routes
 */
export function corsHeaders(origin?: string) {
  const allowedOrigins = [
    'http://localhost:3000',
    'https://acadex.vercel.app',
    process.env.NEXT_PUBLIC_SITE_URL
  ].filter(Boolean)

  const isAllowedOrigin = origin && allowedOrigins.includes(origin)

  return {
    'Access-Control-Allow-Origin': isAllowedOrigin ? origin : 'null',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'true'
  }
}

/**
 * Apply CORS headers to response
 */
export function withCORS(response: NextResponse, origin?: string) {
  const headers = corsHeaders(origin)
  
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  return response
}
