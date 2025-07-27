'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard,
  Users,
  BookOpen,
  Brain,
  BarChart3,
  Settings,
  LogOut,
  User
} from 'lucide-react'

const sidebarItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    iconSrc: '/Icons8/icons8-home-50.png'
  },
  {
    title: 'Users',
    href: '/admin/users',
    iconSrc: '/Icons8/icons8-contacts-50.png'
  },
  {
    title: 'Courses',
    href: '/admin/courses',
    iconSrc: '/Icons8/icons8-document-50.png'
  },
  {
    title: 'Quizzes',
    href: '/admin/quizzes',
    iconSrc: '/Icons8/icons8-puzzle-50.png'
  },
  {
    title: 'Analytics',
    href: '/admin/analytics',
    iconSrc: '/Icons8/icons8-services-50.png'
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    iconSrc: '/Icons8/icons8-settings-50.png'
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
                <Image 
                  src="/Icons8/icons8-user-50.png" 
                  alt="User" 
                  width={24} 
                  height={24} 
                  className="w-6 h-6" 
                />
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
                <Image 
                  src={item.iconSrc} 
                  alt={item.title}
                  width={22}
                  height={22}
                  className={`mr-3 h-[22px] w-[22px] ${isActive ? 'opacity-100' : 'opacity-60'}`} 
                />
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
          <Image 
            src="/Icons8/icons8-open-lock-50.png" 
            alt="Sign Out" 
            width={18} 
            height={18} 
            className="mr-2 h-[18px] w-[18px]" 
          />
          Sign Out
        </button>
      </div>
    </div>
  )
}
