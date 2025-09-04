'use client'

import { useState } from 'react'
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

export function QuizListCard({ quiz, showProgress = true }: QuizListCardProps) {
  const { user } = useAuth()
  const router = useRouter()
  const { hasAttempted, getQuizAttempt, quickActions } = useUserProgress()
  const [actionLoading, setActionLoading] = useState(false)
  
  const attempted = hasAttempted(quiz.id)
  const lastAttempt = getQuizAttempt(quiz.id)

  const handleQuickStart = async () => {
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
  }

  const getDifficultyColor = (difficulty: string) => {
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
  }

  const getActionButtonText = () => {
    if (actionLoading) return 'Starting...'
    if (!user) return 'Start Quiz'
    if (attempted) {
      if (lastAttempt?.completed_at) return 'Retake'
      return 'Continue'
    }
    return 'Start Quiz'
  }

  const getScoreDisplay = () => {
    if (!lastAttempt?.completed_at || !lastAttempt?.score) return null
    
    const percentage = Math.round(lastAttempt.score)
    const scoreColor = percentage >= 70 ? 'text-success' : 'text-primary'
    
    return (
      <div className={`text-sm font-semibold ${scoreColor} flex items-center gap-1`}>
        <CheckCircle className="w-4 h-4" />
        {percentage}%
      </div>
    )
  }

  return (
    <Card variant="elevated" className="hover:shadow-md transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Quiz Image - Compact */}
          <div className="relative w-20 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
            {(() => {
              const quizImage = getQuizImage(quiz)
              return quiz.image_url ? (
                <Image
                  src={quiz.image_url}
                  alt={quiz.title}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              ) : (
                <Image
                  src={quizImage.src}
                  alt={quizImage.alt}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              )
            })()}
          </div>

          {/* Quiz Content - Flexible */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="font-semibold text-foreground text-lg line-clamp-1">
                {quiz.title}
              </h3>
              {showProgress && user && attempted && (
                <div>
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

            <p className="text-muted-foreground text-sm mb-3 line-clamp-1">
              {quiz.description}
            </p>

            {/* Quiz Meta - Horizontal Layout */}
            <div className="flex items-center gap-6 text-sm text-muted-foreground mb-3">
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
              <span className="text-xs px-2 py-1 bg-muted rounded-md">
                {quiz.category}
              </span>
            </div>

            {/* Score Display for Completed Quizzes */}
            {showProgress && user && getScoreDisplay() && (
              <div className="mb-2">
                {getScoreDisplay()}
              </div>
            )}
          </div>

          {/* Action Button - Fixed Width */}
          <div className="flex-shrink-0">
            <Button
              onClick={handleQuickStart}
              disabled={actionLoading}
              className="bg-primary hover:bg-secondary text-white hover:text-black px-4 py-2 text-sm"
            >
              <span className="flex items-center gap-1">
                {actionLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                {getActionButtonText()}
              </span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
