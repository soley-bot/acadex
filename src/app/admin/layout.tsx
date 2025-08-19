'use client'

import { useState } from 'react'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import AdminRoute from '@/components/AdminRoute'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <AdminRoute>
      <div className="flex h-screen bg-gray-50">
        {/* Subtle background pattern */}
        <div className="fixed inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100 pointer-events-none" />
        <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-30 pointer-events-none" />
        <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl opacity-20 pointer-events-none" />
        
        {/* Mobile menu button */}
        <div className="lg:hidden fixed top-4 left-4 z-50">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-gray-200 hover:bg-white transition-colors duration-200"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-gray-900 bg-opacity-50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <AdminSidebar onMobileClose={() => setSidebarOpen(false)} />
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto lg:ml-0 relative">
          <div className="lg:hidden h-16" /> {/* Spacer for mobile menu button */}
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </AdminRoute>
  )
}
