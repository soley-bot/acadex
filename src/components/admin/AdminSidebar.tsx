'use client'

import { BaseSidebar } from '@/components/layout/BaseSidebar'

// Static navigation items - no recreation on renders
const navigationItems = [
  { title: 'Dashboard', href: '/admin' },
  { title: 'Users', href: '/admin/users' },
  { title: 'Courses', href: '/admin/courses' },
  { title: 'Enrollments', href: '/admin/enrollments' },
  { title: 'Quizzes', href: '/admin/quizzes' },
  { title: 'Analytics', href: '/admin/analytics' },
  { title: 'Settings', href: '/admin/settings' }
]

export function AdminSidebar({ onMobileClose }: { onMobileClose?: () => void }) {
  return (
    <BaseSidebar
      title="Admin Panel"
      subtitle="Acadex Learning Platform"
      navigationItems={navigationItems}
      theme="glass"
      requireAdminRole
      onMobileClose={onMobileClose}
    />
  )
}