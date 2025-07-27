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
    <div className="w-64 bg-white shadow-lg flex flex-col h-full">
      {/* Mobile close button */}
      {onMobileClose && (
        <div className="lg:hidden flex justify-end p-4">
          <button
            onClick={onMobileClose}
            className="p-2 rounded-md hover:bg-gray-100"
            aria-label="Close menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <div className="p-6">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-sm text-gray-600">Acadex Learning Platform</p>
      </div>

      {/* User Info */}
      {user && (
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              {user.avatar_url ? (
                <Image src={user.avatar_url} alt={user.name} width={40} height={40} className="w-10 h-10 rounded-full" />
              ) : (
                <span className="text-white font-semibold">{user.name?.charAt(0)?.toUpperCase()}</span>
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user.role}</p>
            </div>
          </div>
        </div>
      )}

      <nav className="mt-6 flex-1">
        <div className="px-3">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleLinkClick}
                className={cn(
                  'group flex items-center px-3 py-3 lg:py-2 text-sm font-medium rounded-md mb-1',
                  isActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
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
          className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 bg-transparent transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}
