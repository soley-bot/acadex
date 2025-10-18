'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { SAFE_REDIRECTS } from '@/lib/redirect-security'

interface AdminRouteProps {
  children: React.ReactNode
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not logged in - redirect to login with current path
        router.push(`${SAFE_REDIRECTS.LOGIN}&redirectTo=${encodeURIComponent(pathname)}`)
        return
      }
      
      if (user.role !== 'admin') {
        // Not an admin - redirect to dashboard with error
        router.push(`${SAFE_REDIRECTS.DASHBOARD}?error=unauthorized`)
        return
      }
    }
  }, [user, loading, router, pathname])

  // Show loading spinner while checking auth (more subtle to prevent flashing)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying access...</p>
        </div>
      </div>
    )
  }

  // Show nothing while redirecting (prevent flash)
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // User is admin - show admin content
  return <>{children}</>
}

