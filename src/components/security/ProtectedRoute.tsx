/**
 * Enhanced Route Protection Component
 * Provides secure role-based route protection for Student/Admin system
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { AuthSecurity } from '@/lib/auth-security'
import { logger } from '@/lib/logger'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiresAuth?: boolean
  allowedRoles?: ('student' | 'instructor' | 'admin')[]
  fallback?: React.ReactNode
  redirectTo?: string
}

export function ProtectedRoute({ 
  children, 
  requiresAuth = true,
  allowedRoles = ['student', 'admin'],
  fallback,
  redirectTo 
}: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)
  const [accessDenied, setAccessDenied] = useState(false)

  useEffect(() => {
    if (loading) return

    // Get automatic route protection based on current path
    const routeAccess = AuthSecurity.canAccessRoute(user, pathname)

    if (!routeAccess.canAccess) {
      setAccessDenied(true)
      
      // Log security event
      AuthSecurity.auditSecurityEvent('route_access_denied', user, {
        route: pathname,
        reason: routeAccess.reason
      })

      // Redirect after a brief delay to show the access denied message
      const redirectPath = redirectTo || routeAccess.redirectTo || '/auth/login'
      
      setTimeout(() => {
        logger.security('Redirecting unauthorized user', {
          from: pathname,
          to: redirectPath,
          userRole: user?.role
        })
        router.push(redirectPath)
      }, 2000)

      return
    }

    // Additional manual checks (for custom usage)
    if (requiresAuth && !AuthSecurity.isAuthenticated(user)) {
      setAccessDenied(true)
      const redirectPath = redirectTo || '/auth/login'
      
      setTimeout(() => {
        router.push(redirectPath)
      }, 2000)
      return
    }

    if (user && !allowedRoles.includes(user.role)) {
      setAccessDenied(true)
      const redirectPath = redirectTo || (user.role === 'admin' ? '/admin' : '/dashboard')
      
      setTimeout(() => {
        router.push(redirectPath)
      }, 2000)
      return
    }

    // Access granted
    AuthSecurity.auditSecurityEvent('route_access_granted', user, {
      route: pathname
    })
    
    setIsChecking(false)
    setAccessDenied(false)
  }, [user, loading, pathname, requiresAuth, allowedRoles, redirectTo, router])

  // Show loading state
  if (loading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Verifying access...</p>
        </div>
      </div>
    )
  }

  // Show access denied state
  if (accessDenied) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md mx-auto text-center bg-white p-8 rounded-xl shadow-lg border border-gray-200">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            {!user 
              ? "You need to sign in to access this page."
              : "You don't have permission to access this area."
            }
          </p>
          
          <div className="text-sm text-gray-500 mb-6">
            {user?.role && (
              <p>Current role: <span className="font-medium capitalize">{user.role}</span></p>
            )}
            <p>Redirecting you to the appropriate page...</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => router.back()}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={() => router.push(user?.role === 'admin' ? '/admin' : '/dashboard')}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              {user?.role === 'admin' ? 'Admin Dashboard' : 'Dashboard'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Access granted - render children
  return <>{children}</>
}

// Convenience components for specific role protection
export function AdminOnlyRoute({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <ProtectedRoute 
      requiresAuth={true} 
      allowedRoles={['admin']} 
      fallback={fallback}
    >
      {children}
    </ProtectedRoute>
  )
}

export function AuthenticatedRoute({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <ProtectedRoute 
      requiresAuth={true} 
      allowedRoles={['student', 'admin']} 
      fallback={fallback}
    >
      {children}
    </ProtectedRoute>
  )
}

// Hook for checking permissions in components
export function useRoutePermissions() {
  const { user } = useAuth()
  const pathname = usePathname()

  const permissions = {
    isAuthenticated: AuthSecurity.isAuthenticated(user),
    isAdmin: AuthSecurity.isAdmin(user),
    isStudent: AuthSecurity.isStudent(user),
    canAccessRoute: (route?: string) => AuthSecurity.canAccessRoute(user, route || pathname),
    currentRoute: pathname,
    user
  }

  return permissions
}
