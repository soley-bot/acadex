'use client'

import { useState } from 'react'
import {
  LayoutDashboard,
  BookOpen,
  Brain,
  TrendingUp,
  Settings,
  GraduationCap
} from 'lucide-react'
import { BaseSidebar } from '@/components/layout/BaseSidebar'
import { ProfileModal } from './ProfileModal'

// Modern navigation items with icons
const navigationItems = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'My Courses', href: '/dashboard/my-courses', icon: BookOpen },
  { title: 'My Quizzes', href: '/dashboard/my-quizzes', icon: Brain },
  { title: 'Progress', href: '/dashboard/progress', icon: TrendingUp },
  { title: 'Settings', href: '/dashboard/settings', icon: Settings }
]

export function StudentSidebar({ onMobileClose }: { onMobileClose?: () => void }) {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)

  return (
    <>
      <BaseSidebar
        title="Acadex"
        subtitle="Student Portal"
        navigationItems={navigationItems}
        theme="gradient"
        headerIcon={<GraduationCap className="w-6 h-6 text-white" />}
        showUserProfile
        onUserProfileClick={() => setIsProfileModalOpen(true)}
        onMobileClose={onMobileClose}
      />
      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
      />
    </>
  )
}
