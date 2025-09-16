'use client'

import { logger } from '@/lib/logger'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import { 
  Home, 
  BookOpen, 
  Brain, 
  TrendingUp, 
  User, 
  Settings,
  X
} from 'lucide-react'

const sidebarItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home
  },
  {
    title: 'My Courses',
    href: '/dashboard/my-courses',
    icon: BookOpen
  },
  {
    title: 'My Quizzes',
    href: '/dashboard/my-quizzes',
    icon: Brain
  },
  {
    title: 'Progress',
    href: '/progress',
    icon: TrendingUp
  },
  {
    title: 'Profile',
    href: '/profile',
    icon: User
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Settings
  }
]

export function StudentSidebar({ onMobileClose }: { onMobileClose?: () => void }) {
  const pathname = usePathname()
  const { user, signOut } = useAuth()

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
    <div className="w-64 glass flex flex-col h-full shadow-xl">
      {/* Mobile close button */}
      {onMobileClose && (
        <div className="lg:hidden flex justify-end p-4">
          <button
            onClick={onMobileClose}
            className="btn btn-ghost btn-sm"
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="p-6 border-b border-border">
        <h1 className="text-xl lg:text-2xl font-bold text-foreground">Acadex</h1>
        <p className="text-sm text-muted-foreground mt-1">Learning Dashboard</p>
      </div>

      {/* User Info */}
      {user && (
        <div className="px-6 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              {user.avatar_url ? (
                <Image 
                  src={user.avatar_url} 
                  alt={user.name} 
                  width={40} 
                  height={40} 
                  className="w-10 h-10 rounded-full object-cover" 
                />
              ) : (
                <span className="text-white font-semibold text-lg">
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-foreground">{user.name || 'User'}</p>
              <p className="text-xs text-muted-foreground capitalize">Student</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="mt-6 flex-1">
        <div className="px-3 space-y-2">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleLinkClick}
                className={cn(
                  'group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.title}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Sign Out Button */}
      <div className="p-4 border-t border-border">
        <button 
          onClick={handleSignOut}
          className="btn btn-default w-full flex items-center justify-center"
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}
