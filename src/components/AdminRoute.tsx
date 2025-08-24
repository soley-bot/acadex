'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface AdminRouteProps {
  children: React.ReactNode
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not logged in - redirect to login
        router.push('/auth/login?redirectTo=/admin')
        return
      }
      
      if (user.role !== 'admin') {
        // Not an admin - redirect to dashboard with error
        router.push('/dashboard?error=unauthorized')
        return
      }
    }
  }, [user, loading, router])

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Show nothing while redirecting
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // User is admin - show admin content
  return <>{children}</>
}
