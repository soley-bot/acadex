/**
 * BEST PRACTICE: Simplified Auth Context
 * - Only listens to auth state changes
 * - No database calls (use Server Components for that)
 * - Server provides initial user data
 * - Client just tracks auth state
 * - Uses new Supabase SSR client pattern
 */
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import type { User } from '@/lib/supabase'
import { logger } from '@/lib/logger'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, name?: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({
  children,
  serverUser
}: {
  children: React.ReactNode
  serverUser?: User | null
}) {
  const [user, setUser] = useState<User | null>(serverUser || null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Listen to auth state changes only - no database calls!
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          // Only update user if session user ID changed or we don't have a user
          // This preserves the full user profile from server (including role)
          if (!user || user.id !== session.user.id) {
            // If we have serverUser with matching ID, use it (has full profile from DB)
            if (serverUser && serverUser.id === session.user.id) {
              setUser(serverUser)
            } else {
              // Fallback: minimal user from session metadata
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                name: session.user.user_metadata?.name ||
                      session.user.user_metadata?.full_name ||
                      session.user.email?.split('@')[0] ||
                      'User',
                avatar_url: session.user.user_metadata?.avatar_url || null,
                role: session.user.user_metadata?.role || 'student', // Try to get role from metadata
                created_at: session.user.created_at,
                updated_at: new Date().toISOString()
              })
            }
          }
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase, user, serverUser])

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        logger.error('[Auth] Sign in error:', error)
        return { error }
      }

      // Refresh server components to reflect new auth state
      router.refresh()

      // Auth state change will update user
      return { error: null }
    } catch (error: any) {
      logger.error('[Auth] Sign in failed:', error)
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      })

      if (error) {
        logger.error('[Auth] Sign up error:', error)
        return { error }
      }

      // Refresh server components to reflect new auth state
      router.refresh()

      // Auth state change will update user
      return { error: null }
    } catch (error: any) {
      logger.error('[Auth] Sign up failed:', error)
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      await supabase.auth.signOut()
      setUser(null)

      // Refresh server components to reflect signed out state
      router.refresh()
    } catch (error: any) {
      logger.error('[Auth] Sign out failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
