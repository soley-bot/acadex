// Simplified App Providers - Consolidates all context providers
'use client'

import { ReactNode } from 'react'
import { AuthProvider } from '@/contexts/AuthContext'
import { SoundProvider } from '@/contexts/SoundContext'
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
        <SoundProvider>{children}</SoundProvider>
      </AuthProvider>
    </QueryProvider>
  )
}