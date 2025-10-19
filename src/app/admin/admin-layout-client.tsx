'use client'

import { useState } from 'react'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminErrorBoundary } from '@/components/admin/AdminErrorBoundary'

interface AdminLayoutClientProps {
  children: React.ReactNode
}

export default function AdminLayoutClient({ children }: AdminLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <AdminErrorBoundary>
      <div className="flex h-screen bg-gray-50">
        {/* Subtle background pattern */}
        <div className="fixed inset-0 section-background pointer-events-none" />
        <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl opacity-30 pointer-events-none" />
        <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl opacity-20 pointer-events-none" />
        
        {/* Mobile menu button */}
        <div className="lg:hidden fixed top-4 left-4 z-50">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="glass btn btn-ghost p-3"
            aria-label={sidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={sidebarOpen}
            aria-controls="admin-sidebar"
          >
            <svg className="w-6 h-6 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-background/50 backdrop-blur-sm z-40"
            onClick={() => setSidebarOpen(false)}
            role="button"
            tabIndex={0}
            aria-label="Close navigation menu"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setSidebarOpen(false)
              }
            }}
          />
        )}

        {/* Sidebar */}
        <aside
          id="admin-sidebar"
          className={`
            fixed lg:static inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
          aria-label="Admin navigation"
        >
          <AdminSidebar onMobileClose={() => setSidebarOpen(false)} />
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto lg:ml-0 relative" role="main">
          <div className="lg:hidden h-16" aria-hidden="true" /> {/* Spacer for mobile menu button */}
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </AdminErrorBoundary>
  )
}
