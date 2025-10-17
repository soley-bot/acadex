import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'

/**
 * Auth Callback Handler
 * Handles OAuth redirects from Google, Facebook, etc.
 * Exchanges authorization code for session
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/dashboard'
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  // Handle OAuth errors
  if (error) {
    console.error('[Auth Callback] OAuth error:', error, errorDescription)
    return NextResponse.redirect(
      new URL(
        `/auth?tab=signin&error=${encodeURIComponent(errorDescription || error)}`,
        request.url
      )
    )
  }

  // Exchange code for session
  if (code) {
    try {
      const cookieStore = await cookies()
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value
            },
            set(name: string, value: string, options: any) {
              try {
                cookieStore.set({ name, value, ...options })
              } catch (error: any) {
                // Handle cookie setting errors in middleware
                console.error('[Auth Callback] Cookie set error:', error)
              }
            },
            remove(name: string, options: any) {
              try {
                cookieStore.delete({ name, ...options })
              } catch (error: any) {
                // Handle cookie removal errors
                console.error('[Auth Callback] Cookie remove error:', error)
              }
            },
          },
        }
      )

      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

      if (exchangeError) {
        console.error('[Auth Callback] Code exchange failed:', exchangeError)
        return NextResponse.redirect(
          new URL(
            `/auth?tab=signin&error=${encodeURIComponent(exchangeError.message)}`,
            request.url
          )
        )
      }

      if (data.user) {
        console.log('[Auth Callback] Successfully authenticated user:', data.user.id)
        
        // Check if user profile exists in database
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single()

        // If no profile exists, this might be first-time OAuth sign in
        if (profileError && profileError.code === 'PGRST116') {
          console.log('[Auth Callback] New OAuth user, profile will be created by trigger')
        }
      }

      // Successful authentication - redirect to intended destination
      return NextResponse.redirect(new URL(next, request.url))
    } catch (error: any) {
      console.error('[Auth Callback] Unexpected error:', error)
      return NextResponse.redirect(
        new URL(
          `/auth?tab=signin&error=${encodeURIComponent('Authentication failed. Please try again.')}`,
          request.url
        )
      )
    }
  }

  // No code parameter - redirect to auth page
  console.warn('[Auth Callback] No code parameter found in callback')
  return NextResponse.redirect(
    new URL(
      '/auth?tab=signin&error=Authentication failed. Please try again.',
      request.url
    )
  )
}
