// Dashboard Layout Component
// Provides consistent layout structure for all dashboard pages

'use client'

import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StudentSidebar } from '@/components/student/StudentSidebar'
import type { DashboardLayoutProps } from '@/types/dashboard'

export function DashboardLayout({ 
  children, 
  title, 
  description,
  show_back_button = false,
  actions 
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar - Fixed positioning */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <StudentSidebar />
      </div>

      {/* Mobile Sidebar - Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" 
          onClick={() => setSidebarOpen(false)}
        >
          <div 
            className="fixed inset-y-0 left-0 w-64 bg-sidebar" 
            onClick={e => e.stopPropagation()}
          >
            <StudentSidebar onMobileClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}
      
      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64">
        <MobileHeader 
          title={title}
          onMenuClick={() => setSidebarOpen(true)}
        />
        
        <div className="p-4 sm:p-6 md:p-8">
          <DashboardHeader 
            title={title}
            description={description}
            showBackButton={show_back_button}
            actions={actions}
          />
          {children}
        </div>
      </main>
    </div>
  )
}

// ==============================================
// MOBILE HEADER COMPONENT
// ==============================================

interface MobileHeaderProps {
  title: string
  onMenuClick: () => void
}

function MobileHeader({ title, onMenuClick }: MobileHeaderProps) {
  return (
    <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <button
        onClick={onMenuClick}
        className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        aria-label="Open menu"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <h1 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
        {title}
      </h1>
      <div className="w-10"></div>
    </div>
  )
}

// ==============================================
// DASHBOARD HEADER COMPONENT  
// ==============================================

interface DashboardHeaderProps {
  title: string
  description?: string
  showBackButton?: boolean
  actions?: React.ReactNode
}

function DashboardHeader({ 
  title, 
  description, 
  showBackButton = false, 
  actions 
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
      <div className="flex-1">
        {showBackButton && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="mb-3 p-0 h-auto hover:bg-transparent"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        )}
        
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          {title}
        </h1>
        
        {description && (
          <p className="text-gray-600 text-sm sm:text-base">
            {description}
          </p>
        )}
      </div>
      
      {actions && (
        <div className="flex-shrink-0">
          {actions}
        </div>
      )}
    </div>
  )
}
