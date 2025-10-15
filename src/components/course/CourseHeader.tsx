'use client'

import { Menu, X } from 'lucide-react'
import { Course } from '@/lib/supabase'

interface CourseHeaderProps {
  course: Course
  progress: number
  onToggleSidebar: () => void
  isSidebarOpen: boolean
}

export function CourseHeader({ course, progress, onToggleSidebar, isSidebarOpen }: CourseHeaderProps) {
  return (
    <header className="bg-background border-b border-border shadow-sm sticky top-0 z-30">
      <div className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3">
        {/* Mobile-First Row Layout */}
        <div className="flex flex-col gap-2 sm:gap-0">
          {/* Top Row: Menu + Breadcrumbs + Info Button */}
          <div className="flex items-center justify-between gap-2">
            {/* Left Section */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              {/* Mobile Menu Button */}
              <button
                onClick={onToggleSidebar}
                className="lg:hidden p-1.5 sm:p-2 hover:bg-muted rounded-lg transition-colors flex-shrink-0"
                aria-label="Toggle course navigation"
              >
                {isSidebarOpen ? (
                  <X size={18} className="text-foreground" />
                ) : (
                  <Menu size={18} className="text-foreground" />
                )}
              </button>

              {/* Course Title - Simple and clean */}
              <div className="flex-1 min-w-0">
                <h1 className="text-sm sm:text-base font-semibold text-foreground truncate">
                  {course.title}
                </h1>
              </div>
            </div>
          </div>

          {/* Bottom Row: Progress Bar - Only on mobile */}
          <div className="flex sm:hidden items-center gap-2">
            <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0">
              {Math.round(progress)}%
            </div>
          </div>

          {/* Desktop Layout - Progress only */}
          <div className="hidden sm:flex items-center justify-end gap-3">
            <div className="w-40 lg:w-48 h-2 bg-muted rounded-full overflow-hidden" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100} aria-label="Course progress">
              <div
                className="h-full bg-primary transition-all duration-500 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-medium">
              {Math.round(progress)}%
            </div>
          </div>
        </div>

      </div>
    </header>
  )
}

