'use client'

import { ClientSideManager } from '@/components/ClientSideManager'

interface ClientWrapperProps {
  children: React.ReactNode
}

export function ClientWrapper({ children }: ClientWrapperProps) {
  return (
    <ClientSideManager>
      {children}
    </ClientSideManager>
  )
}
