'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, Target, CheckCircle, AlertCircle, Play } from 'lucide-react'
import { QuizAttempt } from '@/types/dashboard'
import { cn } from '@/lib/utils'
import { UnifiedCard } from '@/components/ui/CardVariants'
import Link from 'next/link'

interface OptimizedQuizCardProps {
  quiz: QuizAttempt
  className?: string
  showDetails?: boolean
  compact?: boolean
  onClick?: (quiz: QuizAttempt) => void
}

export function OptimizedQuizCard({
  quiz,
  className,
  showDetails = true,
  compact = false,
  onClick
}: OptimizedQuizCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400'
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'default'
    if (score >= 60) return 'secondary'
    return 'destructive'
  }

  const getStatusIcon = (status: string, score?: number | null) => {
    if (status === 'completed') {
      if (score && score >= 80) return <CheckCircle className="h-4 w-4 text-green-500" />
      if (score && score >= 60) return <Target className="h-4 w-4 text-yellow-500" />
      return <AlertCircle className="h-4 w-4 text-red-500" />
    }
    return <Play className="h-4 w-4 text-blue-500" />
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault()
      onClick(quiz)
    }
  }

  const cardContent = (
    <UnifiedCard
      variant={onClick ? "interactive" : "elevated"}
      size={compact ? "sm" : "md"}
      className={cn(
        "h-full",
        onClick && "cursor-pointer",
        className
      )}
    >
      {/* Header Section */}
      <div className={cn("mb-4", compact && "mb-3")}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className={cn(
              "font-semibold text-gray-900 dark:text-white line-clamp-2 leading-tight",
              compact ? "text-sm" : "text-base sm:text-lg"
            )}>
              {quiz.quiz_title}
            </h3>
            {!compact && quiz.course_title && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">
                {quiz.course_title}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            {getStatusIcon(quiz.status, quiz.score)}
            {quiz.score !== null && (
              <Badge 
                className="text-xs font-medium"
                variant={getScoreBadgeVariant(quiz.score)}
              >
                {quiz.score}%
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Quiz Details - Simplified mobile layout */}
      {showDetails && (
        <div className={cn("mb-4", compact && "mb-3")}>
          {/* Mobile: Stack vertically, Desktop: 2 columns max */}
          <div className={cn(
            "grid gap-3",
            compact ? "grid-cols-1 gap-2 text-xs" : "grid-cols-1 sm:grid-cols-2 text-sm"
          )}>
            {/* Primary info - always show */}
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Questions:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {quiz.total_questions || 'N/A'}
              </span>
            </div>
            
            {quiz.duration && (
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Duration:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatDuration(parseInt(quiz.duration))}
                </span>
              </div>
            )}
          </div>

          {/* Secondary info - only show if not compact and quiz is completed */}
          {!compact && quiz.status === 'completed' && (
            <div className={cn(
              "grid gap-3 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700",
              "grid-cols-1 sm:grid-cols-2 text-sm"
            )}>
              {quiz.correct_answers !== null && quiz.total_questions && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Correct:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {quiz.correct_answers} / {quiz.total_questions}
                  </span>
                </div>
              )}
              
              {quiz.completed_at && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Completed:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {new Date(quiz.completed_at).toLocaleDateString(undefined, { 
                      month: 'short', 
                      day: 'numeric',
                      year: '2-digit'
                    })}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Footer with status and actions */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Badge variant="outline" className={cn("capitalize flex-shrink-0", compact && "text-xs")}>
            {quiz.status.replace('_', ' ')}
          </Badge>
          {quiz.attempt_number > 1 && (
            <span className={cn(
              "text-gray-500 flex-shrink-0",
              compact ? "text-xs" : "text-sm"
            )}>
              #{quiz.attempt_number}
            </span>
          )}
        </div>

        {!compact && !onClick && (
          <Button 
            variant={quiz.status === 'completed' ? 'outline' : 'default'}
            size="sm"
            className="h-9 px-4 flex-shrink-0"
            asChild
          >
            <Link href={`/quiz/${quiz.quiz_id}`}>
              {quiz.status === 'completed' ? 'Review' : 'Continue'}
            </Link>
          </Button>
        )}
      </div>
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
    <Link href={`/quiz/${quiz.quiz_id}`} className="block">
      {cardContent}
    </Link>
  )
}