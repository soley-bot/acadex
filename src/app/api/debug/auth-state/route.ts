/**
 * Quick Debug API Route to Test Authentication State
 * This will help us understand why admin APIs are returning 401
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 DEBUG: Testing authentication state...')
    
    // Test 1: Check cookies
    const cookies = request.cookies.getAll()
    console.log('📍 Available cookies:', cookies.map(c => ({ 
      name: c.name, 
      hasValue: !!c.value,
      length: c.value?.length || 0 
    })))

    // Test 2: Create Supabase client (same as API routes)
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (name: string) => request.cookies.get(name)?.value,
          set: () => {},
          remove: () => {}
        }
      }
    )

    // Test 3: Try to get user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    console.log('🔐 Auth result:', {
      hasUser: !!user,
      userEmail: user?.email,
      authError: authError?.message
    })

    // Test 4: If user exists, check role
    let userRole = null
    if (user) {
      // Check role using AuthSecurity
      const { AuthSecurity } = await import('@/lib/auth-security')
      userRole = AuthSecurity.determineRole(user.email!)
      
      console.log('👤 User role determination:', {
        email: user.email,
        determinedRole: userRole
      })
    }

    // Test 5: Check environment variables
    const envCheck = {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    }

    return NextResponse.json({
      success: true,
      debug: {
        cookieCount: cookies.length,
        authCookies: cookies.filter(c => 
          c.name.includes('auth') || 
          c.name.includes('supabase') ||
          c.name.includes('sb-')
        ).map(c => c.name),
        user: user ? {
          id: user.id,
          email: user.email,
          determinedRole: userRole
        } : null,
        authError: authError?.message,
        environment: envCheck
      }
    })

  } catch (error: any) {
    console.error('❌ Debug API error:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
