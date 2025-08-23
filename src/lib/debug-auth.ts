/**
 * TEMPORARY: Simplified Admin Auth for Debugging
 * This bypasses the complex auth flow to test if APIs work
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export function withDebugAdminAuth(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    console.log('🔍 DEBUG: Bypassing admin auth for testing...')
    
    // For debugging - bypass auth completely
    return await handler(request)
  }
}

export function createDebugServiceClient() {
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
