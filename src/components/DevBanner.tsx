'use client'

import { useAuth } from '@/contexts/AuthContext'

export default function DevBanner() {
  const { user } = useAuth()

  // Only show in development
  if (process.env.NODE_ENV !== 'development') return null
  
  // Only show for admin users
  if (!user || user.role !== 'admin') return null

  return (
    <div className="bg-yellow-500 text-black text-center py-2 text-sm font-medium">
      🔧 DEV MODE: You are logged in as ADMIN ({user.email})
    </div>
  )
}
