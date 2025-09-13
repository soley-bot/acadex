'use client'

import { useState, memo, useCallback, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useUserProgress } from '@/hooks/useUserProgress'
import { Brain, Clock, Users, Play, CheckCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getQuizImage } from '@/lib/imageMapping'

interface Quiz {
  id: string
  title: string
  description: string
  category: string
  difficulty: string
  duration_minutes: number
  total_questions: number
  image_url?: string | null
  is_published: boolean
  created_at: string
}

interface QuizListCardProps {
  quiz: Quiz
  showProgress?: boolean
}

export const QuizListCard = memo<QuizListCardProps>(({ quiz, showProgress = true }) => {
  const { user } = useAuth()
  const router = useRouter()
  const { hasAttempted, getQuizAttempt, quickActions } = useUserProgress()
  const [actionLoading, setActionLoading] = useState(false)
  
  // Memoized computed values
  const attempted = useMemo(() => hasAttempted(quiz.id), [hasAttempted, quiz.id])
  const lastAttempt = useMemo(() => getQuizAttempt(quiz.id), [getQuizAttempt, quiz.id])
  const quizImage = useMemo(() => getQuizImage({
    category: quiz.category,
    title: quiz.title,
    image_url: quiz.image_url
  }), [quiz.category, quiz.title, quiz.image_url])

  const handleQuickStart = useCallback(async () => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    setActionLoading(true)
    
    try {
      const result = await quickActions.quickStartQuiz(quiz.id, user.id)
      if (!result.success) {
        router.push(`/quizzes/${quiz.id}/take`)
      }
    } catch (error) {
      console.error('Quick start failed:', error)
      router.push(`/quizzes/${quiz.id}/take`)
    } finally {
      setActionLoading(false)
    }
  }, [user, router, quiz.id, quickActions])

  const getDifficultyColor = useCallback((difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
      case 'easy':
        return 'bg-success/10 text-success border-success/20'
      case 'intermediate':
      case 'medium':
        return 'bg-warning/10 text-warning border-warning/20'
      case 'advanced':
      case 'hard':
        return 'bg-destructive/10 text-destructive border-destructive/20'
      default:
        return 'bg-muted text-muted-foreground border-border'
    }
  }, [])

  const getActionButtonText = useCallback(() => {
    if (actionLoading) return 'Starting...'
    if (!user) return 'Start Quiz'
    if (attempted) {
      if (lastAttempt?.completed_at) return 'Retake'
      return 'Continue'
    }
    return 'Start Quiz'
  }, [actionLoading, user, attempted, lastAttempt])

  const getScoreDisplay = useCallback(() => {
    if (!lastAttempt?.completed_at || !lastAttempt?.score) return null
    
    const percentage = Math.round(lastAttempt.score)
    const scoreColor = percentage >= 70 ? 'text-success' : 'text-primary'
    
    return (
      <div className={`text-sm font-semibold ${scoreColor} flex items-center gap-1`}>
        <CheckCircle className="w-4 h-4" />
        {percentage}%
      </div>
    )
  }, [lastAttempt])

  return (
    <Card className="hover:shadow-md transition-all duration-200 h-full overflow-hidden border border-subtle bg-surface-primary shadow-md hover:shadow-lg">
      <div className="h-full flex flex-col">
        {/* Quiz Image - Top Position for All Screens */}
        <div className="relative w-full h-40 sm:h-48 bg-muted overflow-hidden">
          {quiz.image_url ? (
            <Image
              src={quiz.image_url}
              alt={quiz.title}
              fill
              className="object-cover transition-transform duration-300 hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <Image
              src={quizImage.src}
              alt={quizImage.alt}
              fill
              className="object-cover transition-transform duration-300 hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          )}
        </div>

        {/* Card Content - Below Image */}
        <CardContent className="p-4 flex-1 flex flex-col">
          {/* Title and Status Row */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="font-semibold text-foreground text-lg sm:text-xl line-clamp-2 leading-tight flex-1">
              {quiz.title}
            </h3>
            {showProgress && user && attempted && (
              <div className="flex-shrink-0">
                {lastAttempt?.completed_at ? (
                  <span className="px-2 py-1 bg-success text-white text-xs font-semibold rounded-md flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Done
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-warning text-black text-xs font-semibold rounded-md">
                    In Progress
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Description */}
          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 mb-3 flex-1">
            {quiz.description}
          </p>

          {/* Quiz Meta - Stack on Mobile */}
          <div className="mb-3">
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
              <div className="flex items-center gap-1">
                <Brain className="w-4 h-4" />
                <span>{quiz.total_questions}q</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{quiz.duration_minutes}m</span>
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded-md border ${getDifficultyColor(quiz.difficulty)}`}>
                {quiz.difficulty}
              </span>
            </div>
            <div>
              <span className="text-xs px-2 py-1 bg-muted/50 rounded-md">
                {quiz.category}
              </span>
            </div>
          </div>

          {/* Score Display for Completed Quizzes */}
          {showProgress && user && getScoreDisplay() && (
            <div className="mb-3">
              {getScoreDisplay()}
            </div>
          )}

          {/* Action Button - Bottom */}
          <Button
            onClick={handleQuickStart}
            disabled={actionLoading}
            className="w-full bg-primary hover:bg-secondary text-white px-4 py-2.5 text-sm font-medium mt-auto"
          >
            <span className="flex items-center justify-center gap-2">
              {actionLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              {getActionButtonText()}
            </span>
          </Button>
        </CardContent>
      </div>
    </Card>
  )
})

QuizListCard.displayName = 'QuizListCard'
