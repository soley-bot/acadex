'use client'

import { createContext, useContext, useEffect, useState, useRef } from 'react'
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
  
  // Use ref to track if we've fetched profile to avoid closure issues
  const userRef = useRef<User | null>(null)
  
  // Update ref when user changes
  useEffect(() => {
    userRef.current = user
  }, [user])

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

    // Listen for auth changes - optimized to reduce redundant calls
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log('[Auth] State changed:', event)

        // CRITICAL: Always set loading to false eventually, even if component unmounts
        // This ensures QuizListCard and other components don't get stuck in loading state
        try {
          if (!mounted) {
            console.log('[Auth] Component unmounted, skipping state update')
            return
          }

          if (session?.user) {
            setSupabaseUser(session.user)
            
            // Fetch profile on sign in and user updates
            if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
              const profile = await fetchUserProfile(session.user.id)
              if (profile && mounted) {
                setUser(profile)
                userRef.current = profile
                console.log('[Auth] Profile updated for', event)
              }
            } 
            // For INITIAL_SESSION and TOKEN_REFRESHED, fetch if we don't have profile yet
            else if (event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') {
              // Use ref to avoid closure issue
              if (!userRef.current) {
                console.log('[Auth] Fetching profile for existing session...')
                const profile = await fetchUserProfile(session.user.id)
                if (profile && mounted) {
                  setUser(profile)
                  userRef.current = profile
                  console.log('[Auth] Profile loaded from existing session')
                }
              } else {
                console.log('[Auth] Profile already exists, skipping fetch')
              }
            }
          } else {
            setUser(null)
            setSupabaseUser(null)
            userRef.current = null
            console.log('[Auth] User signed out')
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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Recover session when app becomes visible (mobile support)
  // Using refs to avoid recreating listener on every user/loading change
  useEffect(() => {
    // Only set up once
    if (typeof document === 'undefined') return

    const handleVisibilityChange = async () => {
      // Skip if document not visible or still initializing
      if (document.visibilityState !== 'visible' || loading) {
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
        if (session?.user && !user) {
          console.log('[Auth] Session exists but user missing - refreshing')
          const profile = await fetchUserProfile(session.user.id)
          if (profile) {
            setUser(profile)
            setSupabaseUser(session.user)
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
  }, []) // Only set up once, use refs for current values if needed

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