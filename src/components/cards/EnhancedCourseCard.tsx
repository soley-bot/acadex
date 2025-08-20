'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useUserProgress } from '@/hooks/useUserProgress'
import { Course } from '@/lib/supabase'
import Icon from '@/components/ui/Icon'
import { UnifiedCard } from '@/components/ui/CardVariants'

interface EnhancedCourseCardProps {
  course: Course
  showProgress?: boolean
}

export function EnhancedCourseCard({ course, showProgress = true }: EnhancedCourseCardProps) {
  const { user } = useAuth()
  const router = useRouter()
  const { isEnrolled, getCourseProgress, quickActions } = useUserProgress()
  const [actionLoading, setActionLoading] = useState(false)
  
  const enrolled = isEnrolled(course.id)
  const progress = getCourseProgress(course.id)

  const handleQuickAction = async () => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    setActionLoading(true)
    
    try {
      // Admin users can access any course directly without enrollment
      if (user.role === 'admin') {
        router.push(`/courses/${course.id}/study`)
        return
      }

      if (enrolled) {
        // Go directly to study page
        router.push(`/courses/${course.id}/study`)
      } else {
        // Quick enroll and study
        const result = await quickActions.quickEnrollAndStudy(course.id, user.id)
        if (!result.success) {
          // Go directly to study page
          router.push(`/courses/${course.id}/study`)
        }
      }
    } catch (error) {
      console.error('Quick action failed:', error)
      // Go directly to study page
      router.push(`/courses/${course.id}/study`)
    } finally {
      setActionLoading(false)
    }
  }

  const getActionButtonText = () => {
    if (actionLoading) return 'Loading...'
    if (!user) return 'Start Learning'
    
    // Admin users can access any course
    if (user.role === 'admin') {
      return 'Access Course'
    }
    
    if (enrolled) {
      if (progress?.completed_at) return 'Review Course'
      if (progress?.progress > 0) return `Continue (${Math.round(progress.progress)}%)`
      return 'Start Studying'
    }
    return course.price > 0 ? `Enroll - $${course.price}` : 'Enroll Free'
  }

  const getActionButtonStyle = () => {
    if (!user) return 'bg-primary text-black'
    if (enrolled) {
      if (progress?.completed_at) return 'bg-success hover:bg-success/90 text-white'
      return 'bg-primary text-black'
    }
    return 'bg-primary text-black'
  }

  return (
    <UnifiedCard variant="interactive" size="sm" className="group overflow-hidden">
      {/* Course Image */}
      <div className="relative h-48 overflow-hidden">
        {course.image_url ? (
          <Image
            src={course.image_url}
            alt={course.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Icon name="book" size={48} color="white" />
          </div>
        )}
        
        {/* Level Badge */}
        <div className="absolute top-3 left-3">
          <span className="px-2 py-1 bg-white/90 text-secondary text-xs font-semibold rounded-md">
            {course.level}
          </span>
        </div>

        {/* Enrollment Status Badge */}
        {showProgress && user && enrolled && (
          <div className="absolute top-3 right-3">
            {progress?.completed_at ? (
              <span className="px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded-md flex items-center gap-1">
                <Icon name="check" size={12} color="white" />
                Completed
              </span>
            ) : (
              <span className="px-2 py-1 bg-blue-500 text-white text-xs font-semibold rounded-md">
                {progress?.progress ? `${Math.round(progress.progress)}%` : 'Enrolled'}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Course Content */}
      <div className="p-6">
        {/* Course Title */}
        <h3 className="text-xl font-bold text-primary mb-2 group-hover:text-secondary transition-colors line-clamp-2">
          {course.title}
        </h3>

        {/* Course Description */}
        <p className="text-secondary text-sm mb-4 line-clamp-2">
          {course.description}
        </p>

        {/* Course Meta */}
        <div className="flex items-center justify-between mb-4 text-sm text-tertiary">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Icon name="user" size={14} color="current" />
              <span>{course.instructor_name}</span>
            </div>
            {course.duration && (
              <div className="flex items-center gap-1">
                <Icon name="clock" size={14} color="current" />
                <span>{course.duration}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            <Icon name="star" size={14} color="warning" />
            <span>{course.rating || 4.5}</span>
          </div>
        </div>

        {/* Student Count */}
        <div className="flex items-center gap-1 text-sm text-tertiary mb-4">
          <Icon name="users" size={14} color="current" />
          <span>{course.student_count} students</span>
        </div>

        {/* Progress Bar for Enrolled Users */}
        {showProgress && user && enrolled && progress?.progress > 0 && !progress?.completed_at && (
          <div className="mb-4">
            <div className="w-full bg-muted/60 rounded-full h-2">
              <div 
                className="bg-secondary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress.progress}%` }}
              ></div>
            </div>
            <p className="text-xs text-tertiary mt-1">{Math.round(progress.progress)}% complete</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {/* Primary Action - Enroll/Continue */}
          <button
            onClick={handleQuickAction}
            disabled={actionLoading}
            className={`w-full px-4 py-3 rounded-lg font-semibold text-center transition-all duration-200 ${getActionButtonStyle()} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <span className="flex items-center justify-center gap-2">
              {actionLoading ? (
                <Icon name="loading" size={16} color="current" className="animate-spin" />
              ) : enrolled ? (
                <Icon name="play" size={16} color="current" />
              ) : (
                <Icon name="add" size={16} color="current" />
              )}
              {getActionButtonText()}
            </span>
          </button>
        </div>
      </div>
    </UnifiedCard>
  )
}
