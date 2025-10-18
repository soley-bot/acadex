/**
 * Standardized API Authentication Utilities
 * Provides consistent auth patterns across all admin API routes
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { logger } from './logger'

export interface AuthenticatedUser {
  id: string
  email: string
  role: 'admin' | 'instructor' | 'student'
}

/**
 * Creates an authenticated Supabase client from request
 * Supports both cookie-based and Authorization header auth
 */
export async function createAuthenticatedClient(request: NextRequest) {
  // Try Authorization header first (for API clients)
  const authHeader = request.headers.get('authorization')
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        },
        auth: {
          persistSession: false
        },
        cookies: {
          get: () => undefined,
          set: () => {},
          remove: () => {}
        }
      }
    )
  }

  // Use Next.js cookies() - it's async in Next.js 15
  const cookieStore = await cookies()
  
  // Log available cookies for debugging
  const allCookies = cookieStore.getAll()
  logger.debug('[API Auth] Available cookies:', allCookies.map(c => ({ 
    name: c.name, 
    hasValue: !!c.value,
    valuePreview: c.value?.substring(0, 20) + '...'
  })))
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => {
          const value = cookieStore.get(name)?.value
          if (value) {
            logger.debug(`[API Auth] Cookie "${name}" found`)
          }
          return value
        },
        set: () => {}, // Not needed for API routes
        remove: () => {} // Not needed for API routes
      }
    }
  )
}

/**
 * Creates a service role client (use with extreme caution!)
 * Should ONLY be used after explicit admin authentication
 */
export function createServiceClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for admin operations')
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      cookies: {
        get: () => undefined,
        set: () => {},
        remove: () => {}
      }
    }
  )
}

/**
 * Verifies user authentication and returns user info
 */
export async function verifyAuthentication(supabase: any): Promise<AuthenticatedUser> {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  logger.debug('[API Auth] getUser result:', { 
    hasUser: !!user, 
    userId: user?.id,
    userEmail: user?.email,
    error: authError?.message 
  })
  
  if (authError || !user) {
    logger.warn('[API Auth] Authentication failed:', { error: authError?.message })
    throw new Error('Authentication required')
  }

  // Get user role from database (secure)
  const { data: userRecord, error: userError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userError) {
    logger.warn('User role lookup failed, using email-based determination', { 
      userId: user.id, 
      error: userError 
    })
    
    // Fallback to email-based role determination
    const { determineRole } = await import('./auth-helpers')
    const role = determineRole(user.email!)
    
    return {
      id: user.id,
      email: user.email!,
      role: role as 'admin' | 'instructor' | 'student'
    }
  }

  return {
    id: user.id,
    email: user.email!,
    role: userRecord.role
  }
}

/**
 * Verifies admin-level authentication
 */
export async function verifyAdminAuth(supabase: any): Promise<AuthenticatedUser> {
  const user = await verifyAuthentication(supabase)
  
  if (user.role !== 'admin') {
    throw new Error('Admin access required')
  }

  logger.info('Admin API access granted', {
    userId: user.id,
    email: user.email
  })

  return user
}

/**
 * Verifies instructor-level authentication (includes admin)
 */
export async function verifyInstructorAuth(supabase: any): Promise<AuthenticatedUser> {
  const user = await verifyAuthentication(supabase)
  
  if (user.role !== 'admin' && user.role !== 'instructor') {
    throw new Error('Instructor access required')
  }

  return user
}

/**
 * Higher-order function to wrap API routes with authentication
 * Usage: export const POST = withAdminAuth(async (request, user) => { ... })
 */
export function withAdminAuth(
  handler: (request: NextRequest, user: AuthenticatedUser) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    try {
      const supabase = await createAuthenticatedClient(request)
      const user = await verifyAdminAuth(supabase)
      
      return await handler(request, user)
    } catch (error: any) {
      logger.error('Admin API auth failed', { 
        path: request.nextUrl.pathname,
        error: error.message 
      })

      return NextResponse.json(
        { 
          error: error.message,
          code: 'AUTH_REQUIRED' 
        },
        { status: 401 }
      )
    }
  }
}

/**
 * Higher-order function to wrap API routes with instructor authentication
 */
export function withInstructorAuth(
  handler: (request: NextRequest, user: AuthenticatedUser) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    try {
      const supabase = await createAuthenticatedClient(request)
      const user = await verifyInstructorAuth(supabase)
      
      return await handler(request, user)
    } catch (error: any) {
      return NextResponse.json(
        { 
          error: error.message,
          code: 'AUTH_REQUIRED' 
        },
        { status: 401 }
      )
    }
  }
}

/**
 * Higher-order function to wrap API routes with basic authentication
 */
export function withAuth(
  handler: (request: NextRequest, user: AuthenticatedUser) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    try {
      const supabase = await createAuthenticatedClient(request)
      const user = await verifyAuthentication(supabase)
      
      return await handler(request, user)
    } catch (error: any) {
      return NextResponse.json(
        { 
          error: error.message,
          code: 'AUTH_REQUIRED' 
        },
        { status: 401 }
      )
    }
  }
}

/**
 * Utility for safe service role operations
 * Only use after explicit admin verification
 */
export async function withServiceRole<T>(
  adminUser: AuthenticatedUser,
  operation: (supabase: any) => Promise<T>
): Promise<T> {
  if (adminUser.role !== 'admin') {
    throw new Error('Service role operations require admin access')
  }

  logger.warn('Service role operation initiated', {
    adminUserId: adminUser.id,
    adminEmail: adminUser.email
  })

  const serviceClient = createServiceClient()
  return await operation(serviceClient)
}
