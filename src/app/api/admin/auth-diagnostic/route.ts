// Create a diagnostic API route to check authentication
// This will help us see exactly what's happening with the auth flow

import { NextRequest, NextResponse } from 'next/server'
import { createAuthenticatedClient, verifyAuthentication } from '@/lib/api-auth'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    logger.info('🔍 Auth diagnostic started')
    
    // Check what cookies are available
    const cookies = request.cookies.getAll()
    console.log('📋 Available cookies:', cookies.map(c => ({ name: c.name, hasValue: !!c.value })))
    
    // Check Authorization header
    const authHeader = request.headers.get('authorization')
    console.log('🔐 Auth header:', authHeader ? 'Present' : 'Missing')
    
    // Try to create authenticated client
    const supabase = createAuthenticatedClient(request)
    
    // Test getUser
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    console.log('👤 getUser result:', { 
      hasUser: !!user, 
      userId: user?.id, 
      email: user?.email,
      error: userError?.message 
    })
    
    if (!user) {
      return NextResponse.json({
        success: false,
        step: 'getUser',
        error: userError?.message || 'No user found',
        cookies: cookies.map(c => ({ name: c.name, hasValue: !!c.value })),
        authHeader: !!authHeader
      })
    }
    
    // Try to verify authentication
    const authUser = await verifyAuthentication(supabase)
    console.log('✅ Verified user:', { 
      id: authUser.id, 
      email: authUser.email, 
      role: authUser.role 
    })
    
    return NextResponse.json({
      success: true,
      user: {
        id: authUser.id,
        email: authUser.email,
        role: authUser.role
      },
      cookies: cookies.map(c => ({ name: c.name, hasValue: !!c.value })),
      authHeader: !!authHeader
    })
    
  } catch (error: any) {
    logger.error('Auth diagnostic failed', { error: error?.message || 'Unknown error' })
    
    return NextResponse.json({
      success: false,
      error: error.message,
      step: 'verification'
    }, { status: 401 })
  }
}
