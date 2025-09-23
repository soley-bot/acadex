'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { User } from '@/lib/supabase'
import { userAPI } from '@/lib/database'
import { AuthSecurity, authRateLimiter } from '@/lib/auth-security'
import { SecurityAudit } from '@/lib/security-audit'
import { logger } from '@/lib/logger'

// Safe error type for authentication responses
interface AuthError {
  message: string
  code?: string
}

interface AuthContextType {
  user: User | null
  supabaseUser: SupabaseUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUp: (email: string, password: string, name?: string, options?: { provider?: string }) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<{ error: AuthError | null }>
  updateUser: (updatedUser: User) => void
  // Enhanced security methods
  isAdmin: () => boolean
  isStudent: () => boolean
  canAccessRoute: (route: string) => boolean
  checkRateLimit: (identifier: string) => { isBlocked: boolean; remainingCooldown: number }
  // Password reset methods
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
  updatePassword: (password: string) => Promise<{ error: AuthError | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    let mounted = true

    // Get initial session with timeout
    const initializeAuth = async () => {
      console.log('AuthContext: Starting auth initialization...')
      try {
        // Get session with better error handling
        const { data: { session }, error } = await supabase.auth.getSession()
        
        console.log('AuthContext: Got session:', {
          hasSession: !!session,
          hasUser: !!session?.user,
          userId: session?.user?.id,
          userEmail: session?.user?.email,
          error
        })
        
        if (error) {
          logger.error('Auth session error:', error)
          setUser(null)
          setSupabaseUser(null)
          return
        }

        if (!mounted) return

        if (session?.user) {
          setSupabaseUser(session.user)
          
          // Try to get user profile
          try {
            console.log('AuthContext: Fetching user profile...')
            const userResult = await userAPI.getCurrentUser()
            console.log('AuthContext: User API result:', userResult)

            if (userResult?.data && mounted) {
              console.log('AuthContext: Setting user from API:', userResult.data)
              setUser(userResult.data)
            } else if (mounted) {
              // No user profile found, create fallback user
              console.log('AuthContext: Creating fallback user...')
              const userRole = AuthSecurity.determineRole(session.user.email!)
              const secureUser = {
                id: session.user.id,
                email: session.user.email!,
                name: session.user.user_metadata?.name || session.user.email!.split('@')[0],
                role: userRole,
                created_at: session.user.created_at,
                updated_at: session.user.updated_at || session.user.created_at
              }
              
              console.log('AuthContext: Setting fallback user:', secureUser)
              setUser(AuthSecurity.sanitizeUser(secureUser))
              AuthSecurity.auditSecurityEvent('fallback_session_created', secureUser)
            }
          } catch (userError) {
            console.log('AuthContext: User profile fetch failed, using session data:', userError)
            logger.warn('Failed to fetch user profile, using basic session data:', userError)
            // Fallback to basic user data from session with enhanced role determination
            if (mounted) {
              const userRole = AuthSecurity.determineRole(session.user.email!)
              const secureUser = {
                id: session.user.id,
                email: session.user.email!,
                name: session.user.user_metadata?.name || session.user.email!.split('@')[0],
                role: userRole,
                created_at: session.user.created_at,
                updated_at: session.user.updated_at || session.user.created_at
              }
              
              console.log('AuthContext: Setting session fallback user:', secureUser)
              setUser(AuthSecurity.sanitizeUser(secureUser))
              AuthSecurity.auditSecurityEvent('fallback_session_created', secureUser)
            }
          }
        } else {
          // No session
          console.log('AuthContext: No session found')
          setUser(null)
          setSupabaseUser(null)
        }
      } catch (error) {
        console.warn('Session initialization failed:', error)
      } finally {
        if (mounted) {
          console.log('AuthContext: Initialization complete, setting loading false')
          setLoading(false)
          setInitializing(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: { user: SupabaseUser } | null) => {
        if (!mounted) return

        if (session?.user) {
          setSupabaseUser(session.user)
          
          // Only fetch profile if not initializing to avoid double calls
          if (!initializing) {
            try {
              const userResult = await userAPI.getCurrentUser()
              if (userResult?.data && mounted) {
                setUser(userResult.data)
              } else if (mounted) {
                // No user profile found, create fallback user
                const userRole = AuthSecurity.determineRole(session.user.email!)
                const secureUser = {
                  id: session.user.id,
                  email: session.user.email!,
                  name: session.user.user_metadata?.name || session.user.email!.split('@')[0],
                  role: userRole,
                  created_at: session.user.created_at,
                  updated_at: session.user.updated_at || session.user.created_at
                }
                
                setUser(AuthSecurity.sanitizeUser(secureUser))
                logger.debug('Auth state change fallback', { event, userId: secureUser.id })
              }
            } catch (error) {
              // Fallback to session data if profile fetch fails with enhanced security
              if (mounted) {
                const userRole = AuthSecurity.determineRole(session.user.email!)
                const secureUser = {
                  id: session.user.id,
                  email: session.user.email!,
                  name: session.user.user_metadata?.name || session.user.email!.split('@')[0],
                  role: userRole,
                  created_at: session.user.created_at,
                  updated_at: session.user.updated_at || session.user.created_at
                }
                
                setUser(AuthSecurity.sanitizeUser(secureUser))
                logger.debug('Auth state change fallback', { event, userId: secureUser.id })
              }
            }
          }
        } else {
          setUser(null)
          setSupabaseUser(null)
        }
        
        if (mounted) {
          setLoading(false)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [initializing])

  // Remove the separate getInitialSession function as it's now inline

  const signIn = async (email: string, password: string) => {
    const identifier = email.toLowerCase().trim()
    
    // Check rate limiting first
    if (authRateLimiter.isBlocked(identifier)) {
      const remainingCooldown = authRateLimiter.getRemainingCooldown(identifier)
      SecurityAudit.auth.loginBlocked(identifier)
      
      return { 
        error: `Too many failed attempts. Please try again in ${Math.ceil(remainingCooldown / 60000)} minutes.` 
      }
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: identifier,
      password
    })

    // Record attempt for rate limiting
    authRateLimiter.recordAttempt(identifier, !error)
    
    if (error) {
      SecurityAudit.auth.loginFailed(identifier, error.message)
    } else if (user) {
      SecurityAudit.auth.loginSuccess(user)
    }
    
    return { error }
  }

  const signUp = async (email: string, password: string, name: string = '', options?: { provider?: string }) => {
    // Handle OAuth providers
    if (options?.provider === 'google') {
      const redirectUrl = process.env.NODE_ENV === 'production' 
        ? 'https://acadex.academy/dashboard'
        : 'http://localhost:3000/dashboard'
        
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      })
      return { error }
    }

    // Handle email/password signup
    const identifier = email.toLowerCase().trim()
    
    // Validate password strength for email/password signup
    const passwordValidation = AuthSecurity.validatePassword(password)
    if (!passwordValidation.isValid) {
      return { 
        error: `Password requirements not met: ${passwordValidation.errors.join(', ')}` 
      }
    }

    const { error } = await supabase.auth.signUp({
      email: identifier,
      password,
      options: {
        data: { name: name.trim() },
        emailRedirectTo: undefined // Disable email confirmation
      }
    })

    if (error) {
      // Note: For signup, we don't have user object yet, so we use email for audit
      logger.error('Signup failed', { identifier, error: error.message })
    }
    
    return { error }
  }

  const signOut = async () => {
    try {
      if (user) {
        // Log the sign out event
        logger.info('User signing out', { userId: user.id, userEmail: user.email })
        SecurityAudit.auth.logout(user)
      }
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Error during sign out:', error)
      // Still attempt to sign out from Supabase even if logging fails
      try {
        await supabase.auth.signOut()
      } catch (supabaseError) {
        console.error('Supabase sign out error:', supabaseError)
      }
    }
  }

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return { error: 'No user logged in' }
    
    const { data, error } = await userAPI.updateProfile(user.id, updates)
    if (data) {
      setUser(data)
    }
    return { error }
  }

  const updateUser = (updatedUser: User) => {
    const sanitizedUser = AuthSecurity.sanitizeUser(updatedUser)
    setUser(sanitizedUser)
  }

  // Password reset methods
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      return { error }
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Failed to send reset email' }
    }
  }

  const updatePassword = async (password: string) => {
    try {
      // Validate password strength
      const passwordValidation = AuthSecurity.validatePassword(password)
      if (!passwordValidation.isValid) {
        return { 
          error: `Password requirements not met: ${passwordValidation.errors.join(', ')}` 
        }
      }

      const { error } = await supabase.auth.updateUser({ password })
      return { error }
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Failed to update password' }
    }
  }

  // Enhanced security methods
  const isAdmin = () => AuthSecurity.isAdmin(user)
  const isStudent = () => AuthSecurity.isStudent(user)
  const canAccessRoute = (route: string) => AuthSecurity.canAccessRoute(user, route).canAccess
  const checkRateLimit = (identifier: string) => ({
    isBlocked: authRateLimiter.isBlocked(identifier),
    remainingCooldown: authRateLimiter.getRemainingCooldown(identifier)
  })

  const value = {
    user,
    supabaseUser,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    updateUser,
    // Enhanced security methods
    isAdmin,
    isStudent,
    canAccessRoute,
    checkRateLimit,
    // Password reset methods
    resetPassword,
    updatePassword
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
