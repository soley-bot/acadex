'use client'

import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react'
import { User as SupabaseUser, AuthChangeEvent, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { User } from '@/lib/supabase'
import { logger } from '@/lib/logger'

// Simplified error type
interface AuthError {
  message: string
  code?: string
}

// Simplified context type - only essential methods
interface AuthContextType {
  user: User | null
  supabaseUser: SupabaseUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUp: (email: string, password: string, name?: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<{ error: AuthError | null }>
  isAdmin: () => boolean
  isStudent: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Use refs to track state and avoid closure issues
  const userRef = useRef<User | null>(null)
  const loadingRef = useRef(loading)

  // Update refs when state changes
  useEffect(() => {
    userRef.current = user
  }, [user])

  useEffect(() => {
    loadingRef.current = loading
  }, [loading])

  // Helper to fetch user profile with error handling
  const fetchUserProfile = async (userId: string): Promise<User | null> => {
    try {
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error) {
        logger.error('Failed to fetch user profile:', error)
        return null
      }
      
      return profile
    } catch (error) {
      logger.error('Unexpected error fetching profile:', error)
      return null
    }
  }

  // Debounced profile fetch to prevent race conditions
  const profileFetchTimeoutRef = useRef<NodeJS.Timeout>()

  const debouncedFetchProfile = useCallback(async (userId: string, immediate = false) => {
    if (profileFetchTimeoutRef.current) {
      clearTimeout(profileFetchTimeoutRef.current)
    }

    const fetchAndUpdate = async () => {
      const profile = await fetchUserProfile(userId)
      if (profile) {
        setUser(profile)
        userRef.current = profile
        console.log('[Auth] Profile fetched and updated')
      }
    }

    if (immediate) {
      await fetchAndUpdate()
    } else {
      profileFetchTimeoutRef.current = setTimeout(fetchAndUpdate, 300)
    }
  }, [])

  // Initialize auth and set up listeners
  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          logger.error('Failed to get session:', error)
        }

        if (mounted && session?.user) {
          setSupabaseUser(session.user)
          const profile = await fetchUserProfile(session.user.id)
          if (mounted && profile) {
            setUser(profile)
            userRef.current = profile
            console.log('[Auth] Initial session loaded, user profile set')
          }
        }
      } catch (error) {
        logger.error('Auth initialization failed:', error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth changes with comprehensive event handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log('[Auth] State changed:', event)

        try {
          if (!mounted) {
            console.log('[Auth] Component unmounted, skipping state update')
            return
          }

          // Handle each event type explicitly
          switch (event) {
            case 'SIGNED_IN':
              // User just signed in - fetch profile immediately
              console.log('[Auth] User signed in')
              if (session?.user) {
                setSupabaseUser(session.user)
                await debouncedFetchProfile(session.user.id, true)
              }
              break

            case 'SIGNED_OUT':
              // User signed out - clear all state immediately
              console.log('[Auth] User signed out - clearing state')
              setUser(null)
              setSupabaseUser(null)
              userRef.current = null
              // Clear any cached data
              if (typeof window !== 'undefined') {
                try {
                  localStorage.removeItem('user_profile_cache')
                } catch (e) {
                  console.warn('[Auth] Failed to clear cache:', e)
                }
              }
              break

            case 'USER_UPDATED':
              // User data changed - refresh profile
              console.log('[Auth] User data updated')
              if (session?.user) {
                setSupabaseUser(session.user)
                await debouncedFetchProfile(session.user.id, true)
              }
              break

            case 'TOKEN_REFRESHED':
              // Token refreshed - update session but don't re-fetch profile
              console.log('[Auth] Token refreshed')
              if (session?.user) {
                setSupabaseUser(session.user)
                // Only fetch profile if we don't have one
                if (!userRef.current) {
                  await debouncedFetchProfile(session.user.id)
                }
              }
              break

            case 'INITIAL_SESSION':
              // Initial session detected - fetch profile if missing
              console.log('[Auth] Initial session detected')
              if (session?.user) {
                setSupabaseUser(session.user)
                if (!userRef.current) {
                  await debouncedFetchProfile(session.user.id)
                } else {
                  console.log('[Auth] Profile already exists, skipping fetch')
                }
              }
              break

            case 'PASSWORD_RECOVERY':
              // Password recovery initiated
              console.log('[Auth] Password recovery initiated')
              break

            default:
              console.log('[Auth] Unhandled auth event:', event)
          }
        } finally {
          // ALWAYS set loading to false, even if there are errors
          if (mounted) {
            setLoading(false)
            console.log('[Auth] Loading complete')
          }
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
      if (profileFetchTimeoutRef.current) {
        clearTimeout(profileFetchTimeoutRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Cross-tab session synchronization
  // Listen for auth changes in other tabs via localStorage events
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleStorageChange = async (e: StorageEvent) => {
      // Listen for changes to the auth token across tabs
      if (e.key === 'acadex-auth-token' || e.key === null) {
        console.log('[Auth] Storage changed in another tab - syncing session')

        try {
          const { data: { session }, error } = await supabase.auth.getSession()

          if (error) {
            logger.error('Cross-tab session sync failed:', error)
            return
          }

          if (session?.user) {
            // Another tab signed in - update this tab
            console.log('[Auth] Detected sign-in from another tab')
            setSupabaseUser(session.user)

            // Fetch profile if we don't have it or it's different
            if (!userRef.current || userRef.current.id !== session.user.id) {
              const profile = await fetchUserProfile(session.user.id)
              if (profile) {
                setUser(profile)
                userRef.current = profile
              }
            }
          } else {
            // Another tab signed out - clear this tab
            console.log('[Auth] Detected sign-out from another tab')
            setUser(null)
            setSupabaseUser(null)
            userRef.current = null
          }
        } catch (error) {
          logger.error('Storage sync error:', error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only set up once, uses refs for latest values

  // Recover session when app becomes visible (mobile support)
  // Using refs to avoid recreating listener on every user/loading change
  useEffect(() => {
    // Only set up once
    if (typeof document === 'undefined') return

    const handleVisibilityChange = async () => {
      // Skip if document not visible or still initializing
      if (document.visibilityState !== 'visible' || loadingRef.current) {
        return
      }

      console.log('[Auth] App visible - checking session...')

      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          logger.error('Session check failed:', error)
          return
        }

        // Only refresh if we have a session but no current user state
        if (session?.user && !userRef.current) {
          console.log('[Auth] Session exists but user missing - refreshing')
          const profile = await fetchUserProfile(session.user.id)
          if (profile) {
            setUser(profile)
            setSupabaseUser(session.user)
            userRef.current = profile
          }
        }
      } catch (error) {
        logger.error('Visibility change check failed:', error)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only set up once, use refs for current values

  // Simplified sign in
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { error: { message: error.message, code: error.message } }
      }

      return { error: null }
    } catch (error: any) {
      return { error: { message: error.message || 'Sign in failed' } }
    }
  }

  // Simplified sign up
  const signUp = async (email: string, password: string, name?: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      })

      if (error) {
        return { error: { message: error.message, code: error.message } }
      }

      return { error: null }
    } catch (error: any) {
      return { error: { message: error.message || 'Sign up failed' } }
    }
  }

  // Simple sign out
  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSupabaseUser(null)
  }

  // Simple profile update
  const updateProfile = async (updates: Partial<User>) => {
    if (!user) {
      return { error: { message: 'Not authenticated' } }
    }

    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)

      if (error) {
        return { error: { message: error.message } }
      }

      setUser({ ...user, ...updates })
      return { error: null }
    } catch (error: any) {
      return { error: { message: error.message || 'Update failed' } }
    }
  }

  // Simple role checks
  const isAdmin = () => user?.role === 'admin'
  const isStudent = () => user?.role === 'student' || user?.role === null

  const value: AuthContextType = {
    user,
    supabaseUser,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    isAdmin,
    isStudent,
  }

  return (
    <AuthContext.Provider value={value}>
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