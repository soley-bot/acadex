'use client'

import { logger } from '@/lib/logger'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

const sidebarItems = [
  {
    title: 'Dashboard',
    href: '/admin'
  },
  {
    title: 'Users',
    href: '/admin/users'
  },
  {
    title: 'Courses',
    href: '/admin/courses'
  },
  {
    title: 'Enrollments',
    href: '/admin/enrollments'
  },
  {
    title: 'Quizzes',
    href: '/admin/quizzes'
  },
  {
    title: 'Analytics',
    href: '/admin/analytics'
  },
  {
    title: 'Settings',
    href: '/admin/settings'
  }
]

export function AdminSidebar({ onMobileClose }: { onMobileClose?: () => void }) {
  const pathname = usePathname()
  const { user, signOut, isAdmin } = useAuth()

  // CRITICAL SECURITY: Block access for non-admin users
  if (!user || !isAdmin()) {
    return (
      <div className="w-64 glass flex flex-col h-full items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-red-600 mb-2">Access Denied</h2>
          <p className="text-sm text-gray-600">Admin privileges required</p>
        </div>
      </div>
    )
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      logger.error('Sign out error:', error)
    }
  }

  const handleLinkClick = () => {
    if (onMobileClose) {
      onMobileClose()
    }
  }

  return (
    <div className="w-64 glass flex flex-col h-full">
      {/* Mobile close button */}
      {onMobileClose && (
        <div className="lg:hidden flex justify-end p-4">
          <button
            onClick={onMobileClose}
            className="btn btn-ghost btn-sm"
            aria-label="Close menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <div className="p-6 border-b border-border">
        <h1 className="text-xl lg:text-2xl font-bold text-foreground">Admin Panel</h1>
        <p className="text-sm text-muted-foreground mt-1">Acadex Learning Platform</p>
      </div>

      {/* User Info */}
      {user && (
        <div className="px-6 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              {user.avatar_url ? (
                <Image src={user.avatar_url} alt={user.name} width={40} height={40} className="w-10 h-10 rounded-full" />
              ) : (
                <span className="text-white font-semibold">{user.name?.charAt(0)?.toUpperCase()}</span>
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-foreground">{user.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
            </div>
          </div>
        </div>
      )}

      <nav className="mt-6 flex-1">
        <div className="px-3 space-y-2">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleLinkClick}
                className={cn(
                  'group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {item.title}
              </Link>
            )
          })}
        </div>
      </nav>

      <div className="p-4 border-t border-border">
        <button 
          onClick={handleSignOut}
          className="btn btn-default w-full"
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}
