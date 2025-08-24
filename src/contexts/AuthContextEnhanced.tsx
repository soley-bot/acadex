/**
 * Enhanced AuthContext with optimizations
 * Integrates smart caching, optimized loading, and performance improvements
 */

'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { User } from '@/lib/supabase'
import { userAPI } from '@/lib/database'
import { AuthSecurity, authRateLimiter } from '@/lib/auth-security'
import { SecurityAudit } from '@/lib/security-audit'
import { logger } from '@/lib/logger'
import { cacheUtils, withCache } from '@/lib/smartCache'
import { useOptimizedLoading } from '@/hooks/useOptimizedLoading'

interface AuthContextType {
  user: User | null
  supabaseUser: SupabaseUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, name?: string, options?: { provider?: string }) => Promise<{ error: any }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<{ error: any }>
  updateUser: (updatedUser: any) => void
  // Enhanced security methods
  isAdmin: () => boolean
  isStudent: () => boolean
  canAccessRoute: (route: string) => { canAccess: boolean; reason?: string; redirectTo?: string }
  checkRateLimit: (identifier: string) => { isBlocked: boolean; remainingCooldown: number }
  // Password reset methods
  resetPassword: (email: string) => Promise<{ error: any }>
  updatePassword: (password: string) => Promise<{ error: any }>
  // Performance enhancements
  refreshUser: () => Promise<void>
  preloadUserData: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Cached user operations
const cachedUserOperations = {
  getCurrentUser: withCache(
    'current-user',
    async () => {
      const result = await userAPI.getCurrentUser()
      return result?.data || null
    },
    5 * 60 * 1000 // 5 minutes
  ),

  getUserProfile: withCache(
    (userId: string) => `user-profile:${userId}`,
    async (userId: string) => {
      // This would fetch user profile data
      const result = await userAPI.getCurrentUser()
      return result?.data || null
    },
    10 * 60 * 1000 // 10 minutes
  )
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [initializing, setInitializing] = useState(true)

  const authLoading = useOptimizedLoading({
    timeout: 8000,
    cacheKey: 'auth-session',
    enablePreemptiveLoading: true
  })

  // Enhanced user fetching with caching
  const fetchUserWithCache = useCallback(async (sessionUser: SupabaseUser) => {
    try {
      // Check cache first
      const cachedUser = cacheUtils.user.get(sessionUser.id) as User | null
      if (cachedUser) {
        setUser(cachedUser)
        return cachedUser
      }

      // Fetch from API
      const userResult = await cachedUserOperations.getCurrentUser()
      
      if (userResult) {
        const sanitizedUser = AuthSecurity.sanitizeUser(userResult)
        setUser(sanitizedUser)
        cacheUtils.user.set(sessionUser.id, sanitizedUser)
        return sanitizedUser
      } else {
        // Create fallback user
        const userRole = AuthSecurity.determineRole(sessionUser.email!)
        const fallbackUser = {
          id: sessionUser.id,
          email: sessionUser.email!,
          name: sessionUser.user_metadata?.name || sessionUser.email!.split('@')[0],
          role: userRole,
          created_at: sessionUser.created_at,
          updated_at: sessionUser.updated_at || sessionUser.created_at
        }
        
        const sanitizedUser = AuthSecurity.sanitizeUser(fallbackUser)
        setUser(sanitizedUser)
        cacheUtils.user.set(sessionUser.id, sanitizedUser)
        AuthSecurity.auditSecurityEvent('fallback_session_created', sanitizedUser)
        return sanitizedUser
      }
    } catch (error) {
      logger.warn('Failed to fetch user with cache:', error)
      throw error
    }
  }, [])

  // Initialize auth with optimizations
  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        await authLoading.startLoading(async () => {
          const { data: { session }, error } = await supabase.auth.getSession()
          
          if (error) {
            logger.error('Auth session error:', error)
            if (mounted) {
              setUser(null)
              setSupabaseUser(null)
            }
            return
          }

          if (!mounted) return

          if (session?.user) {
            setSupabaseUser(session.user)
            await fetchUserWithCache(session.user)
          } else {
            setUser(null)
            setSupabaseUser(null)
          }
        })
      } catch (error) {
        console.warn('Session initialization failed:', error)
      } finally {
        if (mounted) {
          setLoading(false)
          setInitializing(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth changes with optimizations
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: any, session: any) => {
        if (!mounted) return

        if (session?.user) {
          setSupabaseUser(session.user)
          
          // Only fetch profile if not initializing
          if (!initializing) {
            await fetchUserWithCache(session.user)
          }
        } else {
          setUser(null)
          setSupabaseUser(null)
          // Clear user cache on sign out
          if (user?.id) {
            cacheUtils.user.delete(user.id)
          }
        }
      }
    )

    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [authLoading, fetchUserWithCache, initializing, user?.id])

  // Enhanced sign in with caching
  const signIn = useCallback(async (email: string, password: string) => {
    const isBlocked = authRateLimiter.isBlocked(email)
    if (isBlocked) {
      const remainingCooldown = authRateLimiter.getRemainingCooldown(email)
      return { 
        error: { 
          message: `Too many sign-in attempts. Please try again in ${Math.ceil(remainingCooldown / 60000)} minutes.` 
        } 
      }
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      })

      if (error) {
        authRateLimiter.recordAttempt(email, false)
        AuthSecurity.auditSecurityEvent('failed_signin', null, { email, errorMessage: error.message })
        return { error }
      }

      if (data.user) {
        authRateLimiter.recordAttempt(email, true)
        AuthSecurity.auditSecurityEvent('successful_signin', null, { email })
        
        // Preload user data
        await fetchUserWithCache(data.user)
      }

      return { error: null }
    } catch (error) {
      authRateLimiter.recordAttempt(email, false)
      return { error }
    }
  }, [fetchUserWithCache])

  // Enhanced sign up
  const signUp = useCallback(async (email: string, password: string, name?: string, options?: { provider?: string }) => {
    try {
      const metadata: any = {}
      if (name) metadata.name = name
      if (options?.provider) metadata.provider = options.provider

      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          data: metadata
        }
      })

      if (error) {
        AuthSecurity.auditSecurityEvent('failed_signup', null, { email, errorMessage: error.message })
        return { error }
      }

      AuthSecurity.auditSecurityEvent('successful_signup', null, { email })
      return { error: null }
    } catch (error) {
      return { error }
    }
  }, [])

  // Enhanced sign out with cache cleanup
  const signOut = useCallback(async () => {
    try {
      // Clear user cache
      if (user?.id) {
        cacheUtils.user.delete(user.id)
      }
      
      // Clear session cache
      cacheUtils.session.delete('auth-session')
      
      await supabase.auth.signOut()
      
      setUser(null)
      setSupabaseUser(null)
      
      AuthSecurity.auditSecurityEvent('signout', user)
    } catch (error) {
      logger.error('Sign out error:', error)
    }
  }, [user])

  // Refresh user data
  const refreshUser = useCallback(async () => {
    if (supabaseUser) {
      // Clear cache and refetch
      cacheUtils.user.delete(supabaseUser.id)
      await fetchUserWithCache(supabaseUser)
    }
  }, [supabaseUser, fetchUserWithCache])

  // Preload user data
  const preloadUserData = useCallback(async () => {
    if (user?.id) {
      // Preload related data that might be needed
      try {
        await Promise.all([
          // Could preload courses, quizzes, etc.
          cachedUserOperations.getUserProfile(user.id)
        ])
      } catch (error) {
        logger.warn('Preload failed:', error)
      }
    }
  }, [user?.id])

  // Other methods remain the same but with optimizations
  const updateProfile = useCallback(async (updates: Partial<User>) => {
    if (!user) return { error: { message: 'No user logged in' } }

    try {
      const { data, error } = await userAPI.updateProfile(user.id, updates)
      
      if (error) return { error }
      
      if (data) {
        const updatedUser = { ...user, ...data }
        setUser(updatedUser)
        // Update cache
        cacheUtils.user.set(user.id, updatedUser)
      }
      
      return { error: null }
    } catch (error) {
      return { error }
    }
  }, [user])

  const updateUser = useCallback((updatedUser: any) => {
    setUser(updatedUser)
    if (updatedUser?.id) {
      cacheUtils.user.set(updatedUser.id, updatedUser)
    }
  }, [])

  // Security methods
  const isAdmin = useCallback(() => user?.role === 'admin', [user?.role])
  const isStudent = useCallback(() => user?.role === 'student', [user?.role])
  
  const canAccessRoute = useCallback((route: string) => {
    return AuthSecurity.canAccessRoute(user, route)
  }, [user])

  const checkRateLimit = useCallback((identifier: string) => {
    const isBlocked = authRateLimiter.isBlocked(identifier)
    const remainingCooldown = authRateLimiter.getRemainingCooldown(identifier)
    return { isBlocked, remainingCooldown }
  }, [])

  const resetPassword = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email)
      return { error }
    } catch (error) {
      return { error }
    }
  }, [])

  const updatePassword = useCallback(async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password })
      return { error }
    } catch (error) {
      return { error }
    }
  }, [])

  const value = {
    user,
    supabaseUser,
    loading: loading || authLoading.isLoading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    updateUser,
    isAdmin,
    isStudent,
    canAccessRoute,
    checkRateLimit,
    resetPassword,
    updatePassword,
    refreshUser,
    preloadUserData
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
