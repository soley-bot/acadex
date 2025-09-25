import { useAuth } from '@/contexts/AuthContext'

// Hook for checking user roles
export function useRole() {
  const { user } = useAuth()
  
  return {
    user,
    isAdmin: user?.role === 'admin',
    isInstructor: user?.role === 'instructor', 
    isStudent: user?.role === 'student',
    hasRole: (role: 'admin' | 'instructor' | 'student') => user?.role === role,
    hasAnyRole: (roles: Array<'admin' | 'instructor' | 'student'>) => 
      user ? roles.includes(user.role) : false
  }
}

// Component for role-based rendering
interface RoleGuardProps {
  allowedRoles: Array<'admin' | 'instructor' | 'student'>
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function RoleGuard({ allowedRoles, children, fallback = null }: RoleGuardProps) {
  const { hasAnyRole } = useRole()
  
  if (!hasAnyRole(allowedRoles)) {
    return <>{fallback}</>
  }
  
  return <>{children}</>
}

// Higher-order component for role-based page protection
export function withRoleProtection<T extends {}>(
  Component: React.ComponentType<T>,
  allowedRoles: Array<'admin' | 'instructor' | 'student'>,
  redirectPath = '/auth/login'
) {
  return function ProtectedComponent(props: T) {
    const { hasAnyRole, user } = useRole()
    
    if (!user) {
      // Redirect to login - this should be handled by the auth system
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      )
    }
    
    if (!hasAnyRole(allowedRoles)) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600">You don&apos;t have permission to access this page.</p>
          </div>
        </div>
      )
    }
    
    return <Component {...props} />
  }
}

