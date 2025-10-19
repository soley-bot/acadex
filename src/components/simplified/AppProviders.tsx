// Simplified App Providers - Consolidates all context providers
'use client'

import { ReactNode } from 'react'
import { AuthProvider } from '@/contexts/AuthContext'
import { QueryProvider } from '@/providers/QueryProvider'
import { User } from '@/lib/supabase'

interface AppProvidersProps {
  children: ReactNode
  serverUser?: User | null
}

export function AppProviders({ children, serverUser }: AppProvidersProps) {
  return (
    <QueryProvider>
      <AuthProvider serverUser={serverUser}>
        {children}
      </AuthProvider>
    </QueryProvider>
  )
}