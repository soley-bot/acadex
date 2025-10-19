'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { createSupabaseClient } from '@/lib/supabase'
import type { User } from '@/lib/supabase'
import { logger } from '@/lib/logger'

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  retry: () => void
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, name?: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Utility: Promise with timeout
function withTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    )
  ])
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [supabase] = useState(() => createSupabaseClient())

  const fetchUserProfile = async (userId: string): Promise<User | null> => {
    try {
      const profilePromise = supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      const result: any = await withTimeout(
        profilePromise,
        5000, // 5 second timeout
        'User profile fetch timed out'
      )

      if (result.error) {
        logger.error('[Auth] Failed to fetch user profile:', result.error)
        return null
      }

      return result.data as User | null
    } catch (err: any) {
      logger.error('[Auth] User profile fetch error:', err.message)
      return null
    }
  }

  const initializeAuth = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get session with timeout
      const sessionPromise = supabase.auth.getSession()
      const result: any = await withTimeout(
        sessionPromise,
        8000, // 8 second timeout
        'Auth session check timed out'
      )

      if (result.error) {
        throw result.error
      }

      const session = result.data?.session || null

      if (session?.user) {
        logger.debug('[Auth] Session found, fetching user profile')
        const userData = await fetchUserProfile(session.user.id)
        setUser(userData)
      } else {
        logger.debug('[Auth] No active session')
        setUser(null)
      }

      setLoading(false)
    } catch (err: any) {
      logger.error('[Auth] Initialization error:', err.message)
      setError(err.message || 'Failed to initialize authentication')
      setLoading(false)

      // Auto-retry once after 2 seconds
      if (retryCount === 0) {
        logger.info('[Auth] Auto-retrying in 2 seconds...')
        setTimeout(() => {
          setRetryCount(1)
        }, 2000)
      }
    }
  }

  useEffect(() => {
    initializeAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryCount])

  useEffect(() => {
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: string, session: Session | null) => {
        if (session?.user) {
          const userData = await fetchUserProfile(session.user.id)
          setUser(userData)
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signUp = async (email: string, password: string, name?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }
    })
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return { error: { message: 'Not authenticated' } }

    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)

    if (!error) setUser({ ...user, ...updates })
    return { error }
  }

  const retry = () => {
    logger.info('[Auth] Manual retry triggered')
    setRetryCount(prev => prev + 1)
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, retry, signIn, signUp, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
