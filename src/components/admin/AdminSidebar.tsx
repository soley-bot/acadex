'use client'

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
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  const handleLinkClick = () => {
    if (onMobileClose) {
      onMobileClose()
    }
  }

  return (
    <div className="w-64 bg-white/95 backdrop-blur-sm border-r border-gray-200 shadow-lg flex flex-col h-full">
      {/* Mobile close button */}
      {onMobileClose && (
        <div className="lg:hidden flex justify-end p-4">
          <button
            onClick={onMobileClose}
            className="p-2 rounded-md hover:bg-gray-100 text-gray-600"
            aria-label="Close menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-sm text-gray-600 mt-1">Acadex Learning Platform</p>
      </div>

      {/* User Info */}
      {user && (
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
              {user.avatar_url ? (
                <Image src={user.avatar_url} alt={user.name} width={40} height={40} className="w-10 h-10 rounded-full" />
              ) : (
                <span className="text-white font-semibold">{user.name?.charAt(0)?.toUpperCase()}</span>
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-600 capitalize">{user.role}</p>
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
                    ? 'bg-red-100 text-red-700 border border-red-200 shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                {item.title}
              </Link>
            )
          })}
        </div>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button 
          onClick={handleSignOut}
          className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 bg-white transition-colors duration-200 shadow-sm"
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}
