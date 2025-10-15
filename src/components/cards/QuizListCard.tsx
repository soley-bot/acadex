'use client'

import { memo, useCallback, useMemo } from 'react'
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
  total_questions?: number // Made optional to support both admin and public quiz types
  image_url?: string | null
  is_published: boolean
  created_at: string
  // Optional statistics from public API
  question_count?: number
  attempts_count?: number
  average_score?: number
  // Reading quiz fields
  reading_passage?: string
  passage_title?: string
  word_count?: number
  estimated_read_time?: number
}

interface QuizListCardProps {
  quiz: Quiz
  showProgress?: boolean
}

export const QuizListCard = memo<QuizListCardProps>(({ quiz, showProgress = true }) => {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { hasAttempted, getQuizAttempt } = useUserProgress()
  
  // Memoized computed values
  const attempted = useMemo(() => hasAttempted(quiz.id), [hasAttempted, quiz.id])
  const lastAttempt = useMemo(() => getQuizAttempt(quiz.id), [getQuizAttempt, quiz.id])
  const quizImage = useMemo(() => getQuizImage({
    category: quiz.category,
    title: quiz.title,
    image_url: quiz.image_url
  }), [quiz.category, quiz.title, quiz.image_url])

  const handleQuickStart = useCallback(async () => {
    // Wait for auth to finish loading before making navigation decisions
    if (authLoading) {
      return
    }

    if (!user) {
      router.push('/auth/login')
      return
    }

    // Direct navigation to quiz taking page - no complex logic needed
    router.push(`/quizzes/${quiz.id}/take`)
  }, [user, authLoading, router, quiz.id])

  const getDifficultyColor = useCallback((difficulty: string) => {
    if (!difficulty) return 'bg-gray-100 text-gray-600 border-gray-200' // Handle null/undefined
    
    switch (difficulty.toLowerCase()) {
      case 'beginner':
      case 'easy':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'intermediate':
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'advanced':
      case 'hard':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'expert':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200'
    }
  }, [])

  const getActionButtonText = useCallback(() => {
    if (authLoading) return 'Loading...'
    if (!user) return 'Start Quiz'
    if (attempted) {
      if (lastAttempt?.completed_at) return 'Retake'
      return 'Continue'
    }
    return 'Start Quiz'
  }, [user, authLoading, attempted, lastAttempt])

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
    <Card className="group bg-white hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 h-full overflow-hidden border border-gray-100 shadow-lg">
      <div className="h-full flex flex-col">
        {/* Quiz Image - Top Position for All Screens */}
        <div className="relative w-full h-40 sm:h-48 bg-muted overflow-hidden">
          {quiz.image_url ? (
            <Image
              src={quiz.image_url}
              alt={quiz.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <Image
              src={quizImage.src}
              alt={quizImage.alt}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          )}
        </div>

        {/* Card Content - Below Image */}
        <CardContent className="p-3.5 flex-1 flex flex-col">
          {/* Title and Status Row */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="font-semibold text-foreground text-lg sm:text-xl line-clamp-2 leading-tight flex-1 group-hover:text-primary transition-colors">
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
          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 mb-2.5 flex-1">
            {quiz.description}
          </p>

          {/* Quiz Meta - Stack on Mobile */}
          <div className="mb-2.5">
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-1.5">
              <div className="flex items-center gap-1">
                <Brain className="w-4 h-4" />
                <span>{quiz.total_questions || quiz.question_count || 'N/A'}q</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{quiz.duration_minutes || 0}m</span>
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded-md border ${getDifficultyColor(quiz.difficulty)}`}>
                {quiz.difficulty || 'Unknown'}
              </span>
            </div>
            <div>
              <span className="text-xs px-2 py-1 bg-muted/50 rounded-md">
                {quiz.category || 'General'}
              </span>
            </div>
          </div>

          {/* Score Display for Completed Quizzes */}
          {showProgress && user && getScoreDisplay() && (
            <div className="mb-2">
              {getScoreDisplay()}
            </div>
          )}

          {/* Action Button - Bottom */}
          <Button
            onClick={handleQuickStart}
            disabled={authLoading}
            className="w-full bg-primary hover:bg-secondary text-white px-4 py-2.5 text-sm font-medium mt-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="flex items-center justify-center gap-2">
              <Play className="w-4 h-4" />
              {getActionButtonText()}
            </span>
          </Button>
        </CardContent>
      </div>
    </Card>
  )
})

QuizListCard.displayName = 'QuizListCard'

