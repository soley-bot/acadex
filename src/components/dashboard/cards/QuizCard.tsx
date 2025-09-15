'use client'

import React from 'react'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, Target, CheckCircle, AlertCircle } from 'lucide-react'
import { QuizAttempt } from '@/types/dashboard'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface QuizCardProps {
  quiz: QuizAttempt
  className?: string
  showDetails?: boolean
  compact?: boolean
  onClick?: (quiz: QuizAttempt) => void
}

export function QuizCard({
  quiz,
  className,
  showDetails = true,
  compact = false,
  onClick
}: QuizCardProps) {
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
    return <Clock className="h-4 w-4 text-gray-500" />
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
    <Card className={cn(
      "transition-all duration-200 hover:shadow-lg hover:scale-[1.02]",
      compact ? "h-auto" : "h-full",
      onClick && "cursor-pointer",
      className
    )}>
      <CardHeader className={cn("pb-2", compact && "pb-1")}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className={cn(
              "font-semibold text-gray-900 dark:text-white line-clamp-2",
              compact ? "text-sm" : "text-lg"
            )}>
              {quiz.quiz_title}
            </h3>
            {!compact && quiz.course_title && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {quiz.course_title}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2 ml-2">
            {getStatusIcon(quiz.status, quiz.score)}
            {quiz.score !== null && (
              <Badge variant={getScoreBadgeVariant(quiz.score)}>
                {quiz.score}%
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className={cn("space-y-3", compact && "space-y-2")}>
        {/* Quiz Stats */}
        {showDetails && (
          <div className={cn(
            "grid grid-cols-2 gap-4 text-sm",
            compact && "text-xs"
          )}>
            {quiz.total_questions && (
              <div>
                <span className="text-gray-500">Questions:</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {quiz.total_questions}
                </p>
              </div>
            )}
            {quiz.duration && (
              <div>
                <span className="text-gray-500">Duration:</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatDuration(parseInt(quiz.duration))}
                </p>
              </div>
            )}
            {quiz.correct_answers !== null && quiz.total_questions && (
              <div>
                <span className="text-gray-500">Correct:</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {quiz.correct_answers} / {quiz.total_questions}
                </p>
              </div>
            )}
            {quiz.completed_at && (
              <div>
                <span className="text-gray-500">Completed:</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {new Date(quiz.completed_at).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Score Display */}
        {quiz.score !== null && !compact && (
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Final Score
            </span>
            <span className={cn(
              "text-xl font-bold",
              getScoreColor(quiz.score)
            )}>
              {quiz.score}%
            </span>
          </div>
        )}

        {/* Status and Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="capitalize">
              {quiz.status}
            </Badge>
            {quiz.attempt_number > 1 && (
              <span className="text-xs text-gray-500">
                Attempt #{quiz.attempt_number}
              </span>
            )}
          </div>

          {!compact && !onClick && (
            <Button 
              variant={quiz.status === 'completed' ? 'outline' : 'default'}
              size="sm"
              asChild
            >
              <Link href={`/quiz/${quiz.quiz_id}`}>
                {quiz.status === 'completed' ? 'Review' : 'Continue'}
              </Link>
            </Button>
          )}
        </div>
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
    <Link href={`/quiz/${quiz.quiz_id}`}>
      {cardContent}
    </Link>
  )
}