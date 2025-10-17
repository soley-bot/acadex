'use client'

import { logger } from '@/lib/logger'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import { LogOut, X, ChevronRight, type LucideIcon } from 'lucide-react'

// ==============================================
// TYPES
// ==============================================

export interface NavigationItem {
  title: string
  href: string
  icon?: LucideIcon
}

export interface SidebarTheme {
  container: string
  header: {
    wrapper: string
    icon: string
    title: string
    subtitle: string
  }
  userCard: {
    wrapper: string
    avatar: string
    name: string
    role: string
  }
  navigation: {
    wrapper: string
    item: {
      base: string
      active: string
      inactive: string
    }
    icon: string
  }
  signOut: {
    wrapper: string
    button: string
  }
  mobileClose: string
}

export interface BaseSidebarProps {
  title: string
  subtitle: string
  navigationItems: NavigationItem[]
  theme: 'gradient' | 'glass'
  headerIcon?: React.ReactNode
  showUserProfile?: boolean
  onUserProfileClick?: () => void
  onMobileClose?: () => void
  requireAdminRole?: boolean
  customUserCard?: React.ReactNode
}

// ==============================================
// THEME DEFINITIONS
// ==============================================

const themes: Record<'gradient' | 'glass', SidebarTheme> = {
  gradient: {
    container: 'w-64 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col h-full shadow-2xl',
    header: {
      wrapper: 'p-6 border-b border-white/10 bg-gradient-to-r from-primary/20 to-secondary/20',
      icon: 'w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg',
      title: 'text-xl font-bold text-white',
      subtitle: 'text-xs text-gray-300'
    },
    userCard: {
      wrapper: 'w-full bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200 group',
      avatar: 'w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center ring-2 ring-white/20 group-hover:ring-white/30 transition-all',
      name: 'text-sm font-semibold text-white truncate',
      role: 'text-xs text-gray-400 capitalize'
    },
    navigation: {
      wrapper: 'flex-1 px-3 py-2',
      item: {
        base: 'group flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200',
        active: 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/20',
        inactive: 'text-gray-400 hover:text-white hover:bg-white/5'
      },
      icon: 'w-5 h-5 transition-transform duration-200'
    },
    signOut: {
      wrapper: 'p-4 border-t border-white/10',
      button: 'flex items-center justify-center gap-2 w-full px-4 py-3 text-sm font-medium text-white bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-200 hover:shadow-lg'
    },
    mobileClose: 'p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors'
  },
  glass: {
    container: 'w-64 glass flex flex-col h-full',
    header: {
      wrapper: 'p-6 border-b border-border',
      icon: 'w-10 h-10 bg-primary rounded-full flex items-center justify-center',
      title: 'text-xl lg:text-2xl font-bold text-foreground',
      subtitle: 'text-sm text-muted-foreground mt-1'
    },
    userCard: {
      wrapper: 'px-6 py-4 border-b border-border bg-muted/30',
      avatar: 'w-10 h-10 bg-primary rounded-full flex items-center justify-center',
      name: 'text-sm font-medium text-foreground',
      role: 'text-xs text-muted-foreground capitalize'
    },
    navigation: {
      wrapper: 'mt-6 flex-1 px-3',
      item: {
        base: 'group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200',
        active: 'bg-primary text-primary-foreground shadow-sm',
        inactive: 'text-muted-foreground hover:bg-muted hover:text-foreground'
      },
      icon: 'w-5 h-5 transition-transform duration-200'
    },
    signOut: {
      wrapper: 'p-4 border-t border-border',
      button: 'btn btn-default w-full'
    },
    mobileClose: 'btn btn-ghost btn-sm'
  }
}

// ==============================================
// MAIN COMPONENT
// ==============================================

export function BaseSidebar({
  title,
  subtitle,
  navigationItems,
  theme: themeType,
  headerIcon,
  showUserProfile = false,
  onUserProfileClick,
  onMobileClose,
  requireAdminRole = false,
  customUserCard
}: BaseSidebarProps) {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const theme = themes[themeType]

  // Admin role check
  if (requireAdminRole && (!user || user.role !== 'admin')) {
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
    } catch (error: any) {
      logger.error('Sign out error', { error: error?.message || 'Unknown error' })
    }
  }

  const handleLinkClick = () => {
    if (onMobileClose) {
      onMobileClose()
    }
  }

  return (
    <div className={theme.container}>
      {/* Mobile close button */}
      {onMobileClose && (
        <div className="lg:hidden flex justify-end p-4">
          <button
            onClick={onMobileClose}
            className={theme.mobileClose}
            aria-label="Close menu"
          >
            {themeType === 'gradient' ? (
              <X className="w-6 h-6" />
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </button>
        </div>
      )}

      {/* Header */}
      <div className={theme.header.wrapper}>
        <div className="flex items-center gap-3">
          {headerIcon && (
            <div className={theme.header.icon}>
              {headerIcon}
            </div>
          )}
          <div>
            <h1 className={theme.header.title}>{title}</h1>
            <p className={theme.header.subtitle}>{subtitle}</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      {user && (
        <div className={themeType === 'gradient' ? 'px-4 py-6' : ''}>
          {customUserCard ? (
            customUserCard
          ) : showUserProfile && onUserProfileClick ? (
            <button
              onClick={onUserProfileClick}
              className={theme.userCard.wrapper}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className={theme.userCard.avatar}>
                    {user.avatar_url ? (
                      <Image
                        src={user.avatar_url}
                        alt={user.name}
                        width={themeType === 'gradient' ? 48 : 40}
                        height={themeType === 'gradient' ? 48 : 40}
                        className={cn(
                          "rounded-full object-cover",
                          themeType === 'gradient' ? 'w-12 h-12' : 'w-10 h-10'
                        )}
                      />
                    ) : (
                      <span className={cn(
                        "text-white font-bold",
                        themeType === 'gradient' ? 'text-lg' : 'font-semibold'
                      )}>
                        {user.name?.charAt(0)?.toUpperCase()}
                      </span>
                    )}
                  </div>
                  {themeType === 'gradient' && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className={theme.userCard.name}>{user.name}</p>
                  <p className={theme.userCard.role}>{user.role || 'User'}</p>
                </div>
                {themeType === 'gradient' && (
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                )}
              </div>
            </button>
          ) : (
            <div className={theme.userCard.wrapper}>
              <div className="flex items-center">
                <div className={theme.userCard.avatar}>
                  {user.avatar_url ? (
                    <Image
                      src={user.avatar_url}
                      alt={user.name}
                      width={themeType === 'gradient' ? 48 : 40}
                      height={themeType === 'gradient' ? 48 : 40}
                      className={cn(
                        "rounded-full object-cover",
                        themeType === 'gradient' ? 'w-12 h-12' : 'w-10 h-10'
                      )}
                    />
                  ) : (
                    <span className="text-white font-semibold">
                      {user.name?.charAt(0)?.toUpperCase()}
                    </span>
                  )}
                </div>
                <div className={themeType === 'gradient' ? 'flex-1 min-w-0 ml-3' : 'ml-3'}>
                  <p className={theme.userCard.name}>{user.name}</p>
                  <p className={theme.userCard.role}>{user.role || 'User'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className={theme.navigation.wrapper}>
        <div className={themeType === 'gradient' ? 'space-y-1' : 'space-y-2'}>
          {navigationItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleLinkClick}
                className={cn(
                  theme.navigation.item.base,
                  isActive ? theme.navigation.item.active : theme.navigation.item.inactive
                )}
              >
                {Icon && (
                  <Icon className={cn(
                    theme.navigation.icon,
                    isActive && themeType === 'gradient' ? "scale-110" : "group-hover:scale-110"
                  )} />
                )}
                <span>{item.title}</span>
                {isActive && themeType === 'gradient' && (
                  <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full"></div>
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Sign out button */}
      <div className={theme.signOut.wrapper}>
        <button
          onClick={handleSignOut}
          className={theme.signOut.button}
        >
          {themeType === 'gradient' && <LogOut className="w-4 h-4" />}
          Sign Out
        </button>
      </div>
    </div>
  )
}
