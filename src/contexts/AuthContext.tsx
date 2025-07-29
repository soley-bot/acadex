'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { User } from '@/lib/supabase'
import { userAPI } from '@/lib/database'

interface AuthContextType {
  user: User | null
  supabaseUser: SupabaseUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<{ error: any }>
  updateUser: (updatedUser: any) => void
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
            // Fallback to basic user data from session
            if (mounted) {
              setUser({
                id: session.user.id,
                email: session.user.email!,
                name: session.user.user_metadata?.name || session.user.email!.split('@')[0],
                role: session.user.email === 'admin01@acadex.com' ? 'admin' : 'student',
                created_at: session.user.created_at,
                updated_at: session.user.updated_at || session.user.created_at
              })
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
              // Fallback to session data if profile fetch fails
              if (mounted) {
                setUser({
                  id: session.user.id,
                  email: session.user.email!,
                  name: session.user.user_metadata?.name || session.user.email!.split('@')[0],
                  role: session.user.email === 'admin01@acadex.com' ? 'admin' : 'student',
                  created_at: session.user.created_at,
                  updated_at: session.user.updated_at || session.user.created_at
                })
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
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { error }
  }

  const signUp = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: undefined // Disable email confirmation
      }
    })
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
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
    setUser(updatedUser)
  }

  const value = {
    user,
    supabaseUser,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    updateUser
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
