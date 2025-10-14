'use client'

import { useState } from 'react'
import { Menu, X, Home, BookOpen, ArrowLeft, Users, Clock, Award } from 'lucide-react'
import Link from 'next/link'
import { Course } from '@/lib/supabase'

interface CourseHeaderProps {
  course: Course
  progress: number
  onToggleSidebar: () => void
  isSidebarOpen: boolean
}

export function CourseHeader({ course, progress, onToggleSidebar, isSidebarOpen }: CourseHeaderProps) {
  const [showCourseInfo, setShowCourseInfo] = useState(false)

  return (
    <header className="bg-background border-b border-border shadow-sm sticky top-0 z-30">
      <div className="px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors"
              aria-label="Toggle course navigation"
            >
              {isSidebarOpen ? (
                <X size={20} className="text-foreground" />
              ) : (
                <Menu size={20} className="text-foreground" />
              )}
            </button>

            {/* Breadcrumb Navigation - Smart: icon-only on mobile, gap-3 */}
            <nav className="flex items-center gap-3 text-sm">
              <Link 
                href="/dashboard" 
                className="flex items-center gap-0 sm:gap-1 text-muted-foreground hover:text-primary transition-colors"
                aria-label="Dashboard"
              >
                <Home size={18} className="sm:w-4 sm:h-4" />
                <span className="sr-only sm:not-sr-only sm:inline">Dashboard</span>
              </Link>
              <span className="hidden sm:inline text-muted-foreground">/</span>
              <Link 
                href="/courses" 
                className="flex items-center gap-0 sm:gap-1 text-muted-foreground hover:text-primary transition-colors"
                aria-label="Courses"
              >
                <BookOpen size={18} className="sm:w-4 sm:h-4" />
                <span className="sr-only sm:not-sr-only sm:inline">Courses</span>
              </Link>
              <span className="hidden sm:inline text-muted-foreground">/</span>
              <button
                onClick={() => setShowCourseInfo(!showCourseInfo)}
                className="text-foreground font-medium hover:text-primary transition-colors max-w-[120px] sm:max-w-[200px] md:max-w-[300px] truncate"
              >
                {course.title}
              </button>
            </nav>
          </div>

          {/* Center Section - Course Title (Desktop) */}
          <div className="hidden lg:block flex-1 mx-8">
            <h1 className="text-lg font-semibold text-foreground truncate text-center">
              {course.title}
            </h1>
          </div>

          {/* Right Section - Progress */}
          <div className="flex items-center gap-4">
            {/* Progress Indicator - Smart: hide label on mobile, larger bar, text-sm badge */}
            <div className="flex items-center gap-3">
              <div className="hidden md:block text-sm text-muted-foreground">
                Progress: {Math.round(progress)}%
              </div>
              
              {/* Progress Bar - Smart: bigger on mobile */}
              <div className="w-32 sm:w-40 md:w-48 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-500 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
              
              {/* Progress Badge - Smart: text-sm, py-1.5 */}
              <div className="bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-medium">
                {Math.round(progress)}%
              </div>
            </div>

            {/* Course Info Toggle (Mobile) */}
            <button
              onClick={() => setShowCourseInfo(!showCourseInfo)}
              className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors"
              aria-label="Course information"
            >
              <BookOpen size={20} className="text-foreground" />
            </button>
          </div>
        </div>

        {/* Course Info Dropdown */}
        {showCourseInfo && (
          <div className="mt-4 p-4 bg-muted/30 rounded-lg border border-border">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-primary" />
                <div>
                  <div className="text-sm font-medium text-foreground">Instructor</div>
                  <div className="text-sm text-muted-foreground">{course.instructor_name || 'Acadex Team'}</div>
                </div>
              </div>
              
              {course.duration && (
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-primary" />
                  <div>
                    <div className="text-sm font-medium text-foreground">Duration</div>
                    <div className="text-sm text-muted-foreground">{course.duration}</div>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Award size={16} className="text-primary" />
                <div>
                  <div className="text-sm font-medium text-foreground">Level</div>
                  <div className="text-sm text-muted-foreground capitalize">{course.level || 'Beginner'}</div>
                </div>
              </div>
            </div>
            
            {course.description && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {course.description}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}

