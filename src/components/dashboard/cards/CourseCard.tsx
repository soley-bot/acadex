'use client'

import React from 'react'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, Users, BookOpen } from 'lucide-react'
import { EnrolledCourse } from '@/types/dashboard'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'

interface CourseCardProps {
  course: EnrolledCourse
  className?: string
  showProgress?: boolean
  compact?: boolean
  onClick?: (course: EnrolledCourse) => void
}

export function CourseCard({
  course,
  className,
  showProgress = true,
  compact = false,
  onClick
}: CourseCardProps) {
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
    <Card className={cn(
      "transition-all duration-200 hover:shadow-lg hover:scale-[1.02] overflow-hidden",
      compact ? "h-auto" : "h-full",
      onClick && "cursor-pointer",
      className
    )}>
      {!compact && course.image_url && (
        <div className="relative h-48 w-full">
          <Image
            src={course.image_url}
            alt={course.title}
            fill
            className="object-cover"
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
      
      <CardHeader className={cn("pb-2", compact && "pb-1")}>
        <div className="flex items-start justify-between">
          <h3 className={cn(
            "font-semibold text-gray-900 dark:text-white line-clamp-2",
            compact ? "text-sm" : "text-lg"
          )}>
            {course.title}
          </h3>
          {compact && course.difficulty && (
            <Badge variant={
              course.difficulty === 'Beginner' ? 'secondary' :
              course.difficulty === 'Intermediate' ? 'default' :
              'destructive'
            }>
              {course.difficulty}
            </Badge>
          )}
        </div>
        {!compact && course.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
            {course.description}
          </p>
        )}
      </CardHeader>

      <CardContent className={cn("space-y-4", compact && "space-y-2")}>
        {/* Course Stats */}
        <div className={cn(
          "flex items-center justify-between text-sm text-gray-500",
          compact && "text-xs"
        )}>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <BookOpen className="h-4 w-4" />
              <span>{course.total_lessons} lessons</span>
            </div>
            {course.total_students && (
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{course.total_students.toLocaleString()}</span>
              </div>
            )}
            {course.estimated_duration && (
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{course.estimated_duration}</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {showProgress && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Progress</span>
              <span className="font-medium text-gray-900 dark:text-white">
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
            <p className="text-xs text-gray-500">
              {course.completed_lessons} of {course.total_lessons} lessons completed
            </p>
          </div>
        )}

        {/* Action Button */}
        {!compact && !onClick && (
          <Button asChild className="w-full">
            <Link href={`/courses/${course.id}`}>
              {progressPercentage > 0 ? 'Continue Learning' : 'Start Course'}
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  )

  if (onClick) {
    return (
      <div onClick={handleClick} className="cursor-pointer">
        {cardContent}
      </div>
    )
  }

  return (
    <Link href={`/courses/${course.id}`}>
      {cardContent}
    </Link>
  )
}