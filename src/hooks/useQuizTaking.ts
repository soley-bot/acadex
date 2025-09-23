/**
 * Optimized hook for quiz taking functionality
 */

'use client'

import { useQuery, useMutation } from '@tanstack/react-query'
import { logger } from '@/lib/logger'

export interface PublicQuizForTaking {
  id: string
  title: string
  description: string
  category: string
  difficulty: string
  duration_minutes: number
  total_questions: number
  passing_score: number
  max_attempts: number
  image_url?: string
  instructions?: string
  tags?: string[]
  // Reading quiz fields
  reading_passage?: string
  passage_title?: string
  passage_source?: string
  passage_audio_url?: string
  word_count?: number
  estimated_read_time?: number
}

export interface QuizQuestionForTaking {
  id: string
  question: string
  question_type: string
  options: string[] | Array<{left: string; right: string}>
  explanation?: string
  order_index: number
  points: number
  difficulty_level: string
  image_url?: string
  audio_url?: string
  video_url?: string
  time_limit_seconds?: number
}

export interface QuizWithQuestions {
  quiz: PublicQuizForTaking
  questions: QuizQuestionForTaking[]
}

/**
 * Fetch quiz with questions for taking
 */
export function useQuizForTaking(quizId: string) {
  return useQuery({
    queryKey: ['quiz-for-taking', quizId],
    queryFn: async (): Promise<QuizWithQuestions> => {
      if (!quizId) {
        throw new Error('Quiz ID is required')
      }
      
      logger.debug(`🎯 Fetching quiz for taking: ${quizId}`)
      
      const response = await fetch(`/api/quizzes/${quizId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        if (response.status === 404) {
          throw new Error('Quiz not found or not published')
        }
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch quiz')
      }

      return {
        quiz: data.quiz,
        questions: data.questions || []
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - quiz content doesn't change frequently
    gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache longer for quiz taking
    retry: (failureCount, error) => {
      if (error.message.includes('not found') || error.message.includes('404')) {
        return false // Don't retry for 404s
      }
      return failureCount < 2
    },
    enabled: !!quizId, // Only run if we have a quiz ID
  })
}

/**
 * Submit quiz attempt
 */
export function useSubmitQuizAttempt() {
  return useMutation({
    mutationFn: async (attemptData: {
      quiz_id: string
      user_id: string
      answers: Record<string, any>
      time_taken_seconds?: number
    }) => {
      logger.debug('📤 Submitting quiz attempt', { 
        quizId: attemptData.quiz_id,
        answersCount: Object.keys(attemptData.answers).length
      })
      
      const response = await fetch('/api/quiz-attempts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(attemptData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to submit quiz attempt')
      }

      const data = await response.json()
      return data
    },
    retry: 1, // Only retry once for quiz submissions
  })
}