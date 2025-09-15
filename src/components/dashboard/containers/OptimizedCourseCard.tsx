'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, Users, BookOpen } from 'lucide-react'
import { EnrolledCourse } from '@/types/dashboard'
import { cn } from '@/lib/utils'
import { UnifiedCard } from '@/components/ui/CardVariants'
import Image from 'next/image'
import Link from 'next/link'

interface OptimizedCourseCardProps {
  course: EnrolledCourse
  className?: string
  showProgress?: boolean
  compact?: boolean
  onClick?: (course: EnrolledCourse) => void
}

export function OptimizedCourseCard({
  course,
  className,
  showProgress = true,
  compact = false,
  onClick
}: OptimizedCourseCardProps) {
  const progressPercentage = course.total_lessons > 0 
    ? Math.round((course.completed_lessons / course.total_lessons) * 100)
    : 0

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500'
    if (percentage >= 50) return 'bg-blue-500'
    if (percentage >= 20) return 'bg-yellow-500'
    return 'bg-gray-300'
  }

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault()
      onClick(course)
    }
  }

  const cardContent = (
    <UnifiedCard
      variant={onClick ? "interactive" : "elevated"}
      size={compact ? "sm" : "md"}
      className={cn(
        "h-full overflow-hidden",
        onClick && "cursor-pointer",
        className
      )}
    >
      {/* Course Image - Only for non-compact */}
      {!compact && course.image_url && (
        <div className="relative h-32 sm:h-40 md:h-48 w-full -m-4 sm:-m-6 mb-4 sm:mb-6">
          <Image
            src={course.image_url}
            alt={course.title}
            fill
            className="object-cover rounded-t-xl"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {course.difficulty && (
            <div className="absolute top-2 right-2">
              <Badge variant={
                course.difficulty === 'Beginner' ? 'secondary' :
                course.difficulty === 'Intermediate' ? 'default' :
                'destructive'
              }>
                {course.difficulty}
              </Badge>
            </div>
          )}
        </div>
      )}

      {/* Header Section */}
      <div className={cn("mb-3", compact && "mb-2")}>
        <div className="flex items-start justify-between gap-2">
          <h3 className={cn(
            "font-semibold text-gray-900 dark:text-white line-clamp-2 leading-tight",
            compact ? "text-sm" : "text-base sm:text-lg"
          )}>
            {course.title}
          </h3>
          {compact && course.difficulty && (
            <Badge 
              className="text-xs flex-shrink-0"
              variant={
                course.difficulty === 'Beginner' ? 'secondary' :
                course.difficulty === 'Intermediate' ? 'default' :
                'destructive'
              }
            >
              {course.difficulty}
            </Badge>
          )}
        </div>
        
        {!compact && course.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-2">
            {course.description}
          </p>
        )}
      </div>

      {/* Course Stats - Responsive layout */}
      <div className={cn(
        "text-gray-500 mb-3",
        compact ? "text-xs mb-2" : "text-sm"
      )}>
        <div className={cn(
          "flex flex-wrap gap-3",
          compact && "gap-2"
        )}>
          <div className="flex items-center gap-1">
            <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="whitespace-nowrap">{course.total_lessons} lessons</span>
          </div>
          
          {course.total_students && (
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="whitespace-nowrap">{course.total_students.toLocaleString()}</span>
            </div>
          )}
          
          {course.estimated_duration && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="whitespace-nowrap">{course.estimated_duration}</span>
            </div>
          )}
        </div>
      </div>

      {/* Progress Section - More compact on mobile */}
      {showProgress && (
        <div className={cn("space-y-2", compact && "space-y-1")}>
          <div className="flex items-center justify-between">
            <span className={cn(
              "text-gray-600 dark:text-gray-400 font-medium",
              compact ? "text-xs" : "text-sm"
            )}>
              Progress
            </span>
            <span className={cn(
              "font-bold text-gray-900 dark:text-white",
              compact ? "text-xs" : "text-sm"
            )}>
              {progressPercentage}%
            </span>
          </div>
          
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                getProgressColor(progressPercentage)
              )}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          
          <p className={cn(
            "text-gray-500",
            compact ? "text-xs" : "text-sm"
          )}>
            {course.completed_lessons} of {course.total_lessons} completed
          </p>
        </div>
      )}

      {/* Action Button - Mobile optimized */}
      {!compact && !onClick && (
        <div className="mt-4">
          <Button asChild className="w-full h-9 sm:h-10">
            <Link href={`/courses/${course.id}`}>
              {progressPercentage > 0 ? 'Continue Learning' : 'Start Course'}
            </Link>
          </Button>
        </div>
      )}
    </UnifiedCard>
  )

  if (onClick) {
    return (
      <div onClick={handleClick}>
        {cardContent}
      </div>
    )
  }

  return (
    <Link href={`/courses/${course.id}`} className="block">
      {cardContent}
    </Link>
  )
}