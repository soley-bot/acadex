// Debug Middleware Test
// Save this in a separate file to test middleware behavior

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { AuthSecurity } from './src/lib/auth-security'

export async function debugMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  console.log('🔍 Debug Middleware - Path:', pathname)
  console.log('🔍 Cookies:', Object.fromEntries(
    Array.from(request.cookies.entries()).map(([name, cookie]) => [name, cookie.value])
  ))
  
  if (pathname.startsWith('/admin')) {
    try {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get: (name: string) => {
              const value = request.cookies.get(name)?.value
              console.log(`🔍 Cookie get: ${name} = ${value ? 'exists' : 'missing'}`)
              return value
            }
          }
        }
      )

      console.log('🔍 Attempting to get user...')
      const { data: { user }, error } = await supabase.auth.getUser()
      
      console.log('🔍 User result:', { 
        hasUser: !!user, 
        email: user?.email, 
        error: error?.message 
      })

      if (!user) {
        console.log('🔍 No user found, redirecting to login')
        const loginUrl = new URL('/auth/login', request.url)
        loginUrl.searchParams.set('redirectTo', pathname)
        return NextResponse.redirect(loginUrl)
      }

      // Check admin role
      const userRole = AuthSecurity.determineRole(user.email || '')
      console.log('🔍 Determined role:', userRole, 'for email:', user.email)
      
      if (userRole !== 'admin') {
        console.log('🔍 Not admin, redirecting to unauthorized')
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }
      
      console.log('🔍 Admin access granted, proceeding')

    } catch (error) {
      console.error('🔍 Middleware error:', error)
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }
  
  return NextResponse.next()
}
