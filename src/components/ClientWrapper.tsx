'use client'

import dynamic from 'next/dynamic'

const ClientSideManager = dynamic(
  () => import('@/components/ClientSideManager').then(mod => ({ default: mod.ClientSideManager })),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing app features...</p>
        </div>
      </div>
    )
  }
)

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