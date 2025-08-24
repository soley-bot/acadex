'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useUserProgress } from '@/hooks/useUserProgress'
import Icon from '@/components/ui/Icon'
import { UnifiedCard } from '@/components/ui/CardVariants'
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

interface EnhancedQuizCardProps {
  quiz: Quiz
  showProgress?: boolean
}

export function EnhancedQuizCard({ quiz, showProgress = true }: EnhancedQuizCardProps) {
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
        // Go directly to quiz taking page
        router.push(`/quizzes/${quiz.id}/take`)
      }
    } catch (error) {
      console.error('Quick start failed:', error)
      // Go directly to quiz taking page
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
      if (lastAttempt?.completed_at) return 'Retake Quiz'
      return 'Continue Quiz'
    }
    return 'Start Quiz'
  }

  const getActionButtonStyle = () => {
    // All buttons should follow the same primary->secondary pattern
    return 'bg-primary hover:bg-secondary text-white hover:text-black'
  }

  const getScoreDisplay = () => {
    if (!lastAttempt?.completed_at || !lastAttempt?.score) return null
    
    // Score is already stored as percentage in database
    const percentage = Math.round(lastAttempt.score)
    const scoreColor = percentage >= 70 ? 'text-success' : 'text-primary'
    
    return (
      <div className={`text-sm font-semibold ${scoreColor}`}>
        Last Score: {percentage}%
      </div>
    )
  }

  return (
    <UnifiedCard variant="interactive" size="md" className="overflow-hidden">
      {/* Quiz Image */}
      <div className="relative h-48 bg-muted/40">
        {(() => {
          const quizImage = getQuizImage(quiz)
          return quiz.image_url ? (
            <Image
              src={quiz.image_url}
              alt={quiz.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <Image
              src={quizImage.src}
              alt={quizImage.alt}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          )
        })()}
        
        {/* Difficulty Badge Overlay */}
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 text-xs font-semibold rounded-full border backdrop-blur-sm ${getDifficultyColor(quiz.difficulty)}`}>
            {quiz.difficulty}
          </span>
        </div>

        {/* Attempt Status Badge */}
        {showProgress && user && attempted && (
          <div className="absolute top-12 right-4">
            {lastAttempt?.completed_at ? (
              <span className="px-2 py-1 bg-success text-white text-xs font-semibold rounded-md flex items-center gap-1 backdrop-blur-sm">
                <Icon name="check" size={12} color="white" />
                Completed
              </span>
            ) : (
              <span className="px-2 py-1 bg-warning text-black text-xs font-semibold rounded-md backdrop-blur-sm">
                In Progress
              </span>
            )}
          </div>
        )}
      </div>

      {/* Quiz Header */}
      <div className="relative bg-gradient-to-br from-primary to-primary/90 text-white p-6">
        {/* Quiz Icon */}
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
          <Icon name="target" size={32} color="white" />
        </div>

        {/* Quiz Title */}
        <h3 className="text-xl font-bold mb-2 text-white">
          {quiz.title}
        </h3>

        {/* Quiz Category */}
        <div className="flex items-center gap-2 text-white/80 text-sm">
          <Icon name="folder" size={14} color="current" />
          <span>{quiz.category}</span>
        </div>
      </div>

      {/* Quiz Content */}
      <div className="p-6">
        {/* Quiz Description */}
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {quiz.description}
        </p>

        {/* Quiz Meta Information */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Icon name="file" size={14} color="current" />
            <span>{quiz.total_questions} questions</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Icon name="clock" size={14} color="current" />
            <span>{quiz.duration_minutes} min</span>
          </div>
        </div>

        {/* Score Display for Completed Quizzes */}
        {showProgress && user && getScoreDisplay() && (
          <div className="mb-4 p-3 bg-muted rounded-lg">
            {getScoreDisplay()}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {/* Primary Action - Quick Start */}
          <button
            onClick={handleQuickStart}
            disabled={actionLoading}
            className={`w-full px-4 py-3 rounded-lg font-semibold text-center transition-all duration-200 ${getActionButtonStyle()} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <span className="flex items-center justify-center gap-2">
              {actionLoading ? (
                <Icon name="loading" size={16} color="current" className="animate-spin" />
              ) : (
                <Icon name="play" size={16} color="current" />
              )}
              {getActionButtonText()}
            </span>
          </button>
        </div>
      </div>
    </UnifiedCard>
  )
}
