'use client'

import { createContext, useContext } from 'react'

interface AuthContextType {
  user: null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  isAdmin: () => boolean
  isStudent: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // No hooks - just static values for now
  const value: AuthContextType = {
    user: null,
    loading: false,
    signIn: async () => {},
    signOut: async () => {},
    isAdmin: () => false,
    isStudent: () => false
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}