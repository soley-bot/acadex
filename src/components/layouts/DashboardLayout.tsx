'use client'

import { ReactNode, useState } from 'react'
import { StudentSidebar } from '@/components/student/StudentSidebar'
import { Menu } from 'lucide-react'

interface DashboardLayoutProps {
  children: ReactNode
  title?: string
  headerAction?: ReactNode
}

/**
 * DashboardLayout - Clean layout component for student dashboard pages
 * 
 * Layout Structure:
 * - Fixed sidebar on desktop (lg:), overlay on mobile
 * - Responsive padding that scales with viewport
 * - Max-width constraint for optimal readability
 * - Proper z-index layering for mobile menu
 */
export function DashboardLayout({ children, title, headerAction }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50">
      {/* Fixed Desktop Sidebar - Hidden on mobile */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-64">
        <StudentSidebar />
      </aside>

      {/* Mobile Sidebar Overlay - Only visible when menu is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          
          {/* Sidebar Panel */}
          <aside
            className="absolute inset-y-0 left-0 w-64 bg-sidebar"
            onClick={e => e.stopPropagation()}
          >
            <StudentSidebar onMobileClose={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main Content Area - Offset by sidebar width on desktop */}
      <div className="lg:pl-64">
        {/* Mobile Header - Sticky at top on mobile only */}
        <header className="sticky top-0 z-40 lg:hidden bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            {title && (
              <h1 className="text-base font-semibold text-gray-900 truncate">
                {title}
              </h1>
            )}
            
            <div className="w-10 flex items-center justify-end">
              {headerAction}
            </div>
          </div>
        </header>

        {/* Main Content - Clean padding structure */}
        <main className="min-h-screen p-4 sm:p-6 lg:p-8">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
