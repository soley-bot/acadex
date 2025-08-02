'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { User } from '@/lib/supabase'
import { userAPI } from '@/lib/database'
import { AuthSecurity, authRateLimiter } from '@/lib/auth-security'
import { SecurityAudit } from '@/lib/security-audit'
import { logger } from '@/lib/logger'

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
  canAccessRoute: (route: string) => boolean
  checkRateLimit: (identifier: string) => { isBlocked: boolean; remainingCooldown: number }
  // Password reset methods
  resetPassword: (email: string) => Promise<{ error: any }>
  updatePassword: (password: string) => Promise<{ error: any }>
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
      try {
        // Set a timeout for initial session check
        const sessionPromise = supabase.auth.getSession()
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session timeout')), 5000)
        )

        const { data: { session } } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as any

        if (!mounted) return

        if (session?.user) {
          setSupabaseUser(session.user)
          
          // Try to get user profile with timeout
          try {
            const userPromise = userAPI.getCurrentUser()
            const userTimeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('User fetch timeout')), 3000)
            )
            
            const userResult = await Promise.race([
              userPromise,
              userTimeoutPromise
            ]) as any

            if (userResult?.data && mounted) {
              setUser(userResult.data)
            }
          } catch (userError) {
            console.warn('Failed to fetch user profile, using basic session data')
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
              
              setUser(AuthSecurity.sanitizeUser(secureUser))
              AuthSecurity.auditSecurityEvent('fallback_session_created', secureUser)
            }
          }
        }
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

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        if (session?.user) {
          setSupabaseUser(session.user)
          
          // Only fetch profile if not initializing to avoid double calls
          if (!initializing) {
            try {
              const userResult = await userAPI.getCurrentUser()
              if (userResult?.data && mounted) {
                setUser(userResult.data)
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
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
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

  const updateUser = (updatedUser: any) => {
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
      {loading ? (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your session...</p>
          </div>
        </div>
      ) : (
        children
      )}
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
