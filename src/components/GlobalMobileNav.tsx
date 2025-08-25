'use client'

import { usePathname } from 'next/navigation'
import { MobileBottomNavBar } from '@/components/mobile/MobileNavBar'

export function GlobalMobileNav() {
  const pathname = usePathname()
  
  // Don't show on admin routes - they have their own navigation
  if (pathname.startsWith('/admin')) {
    return null
  }
  
  // Don't show on auth pages - they should be focused
  if (pathname.startsWith('/auth/')) {
    return null
  }

  // Don't show on create-admin or database setup pages
  if (pathname.startsWith('/create-admin') || pathname.startsWith('/database-setup')) {
    return null
  }

  return <MobileBottomNavBar />
}
