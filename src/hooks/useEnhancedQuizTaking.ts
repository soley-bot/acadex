/**
 * Enhanced Quiz Taking Hook
 * Combines data fetching, state management, auto-save, and network awareness
 */

'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getQuizQuestions, submitQuizAttempt } from '@/lib/database'
import { useAuth } from '@/contexts/AuthContext'
import { QuizQuestion, Quiz } from '@/lib/supabase'
import { logger } from '@/lib/logger'
import { 
  useQuizAutoSave, 
  useNetworkStatus, 
  useQuizCache, 
  useUserPreferences 
} from '@/hooks/useClientStorage'

export interface EnhancedQuestion extends QuizQuestion {
  media_url?: string
  media_type?: 'image' | 'audio' | 'video'
}

interface QuizTakingState {
  // Data
  quiz: Quiz | null
  questions: EnhancedQuestion[]
  
  // Current state
  currentQuestionIndex: number
  answers: Record<string, any>
  quizStarted: boolean
  startTime: Date | null
  timeLeft: number
  
  // Status
  loading: boolean
  error: string | null
  submitting: boolean
  
  // Auto-save & offline features
  isAutoSaving: boolean
  hasUnsavedChanges: boolean
  lastSaved: Date | null
  isOnline: boolean
  
  // Progress
  quizAttemptId: string
}

interface QuizTakingActions {
  // Navigation
  goToQuestion: (index: number) => void
  goNext: () => void
  goPrevious: () => void
  
  // Answers
  handleAnswerChange: (questionId: string, answer: any) => void
  
  // Quiz control
  startQuiz: () => void
  submitQuiz: () => Promise<void>
  saveProgress: () => Promise<void>
  
  // Utility
  exitQuiz: () => void
}

export function useEnhancedQuizTaking(quizId?: string): [QuizTakingState, QuizTakingActions] {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  
  // Use provided quizId or fall back to params
  const resolvedQuizId = quizId || params.id as string
  
  // Core state
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [questions, setQuestions] = useState<EnhancedQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quizStarted, setQuizStarted] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [submitting, setSubmitting] = useState(false)
  const [quizAttemptId, setQuizAttemptId] = useState<string>('')

  // Enhanced features
  const { isOnline } = useNetworkStatus()
  const { preferences } = useUserPreferences()
  const { cachedData } = useQuizCache(params.id as string)
  
  // Auto-save functionality
  const {
    updateProgress,
    saveNow,
    clearProgress,
    isAutoSaving,
    lastSaved,
    hasUnsavedChanges
  } = useQuizAutoSave({
    quizId: params.id as string,
    userId: user?.id || '',
    enabled: !!(preferences?.autoSave && quizStarted && user),
    intervalSeconds: 0, // Manual saving
    onSave: (progress) => logger.info('Quiz progress saved:', progress),
    onRestore: (progress) => logger.info('Quiz progress restored:', progress),
    onError: (error) => logger.error('Auto-save error:', error)
  })

  // Generate unique quiz attempt ID when quiz starts
  useEffect(() => {
    if (quizStarted && !quizAttemptId) {
      const attemptId = `attempt_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
      setQuizAttemptId(attemptId)
    }
  }, [quizStarted, quizAttemptId])

  // Submit handler (defined before timer)
  const handleSubmit = useCallback(async () => {
    if (submitting || !quiz || !user) return

    try {
      setSubmitting(true)
      
      const result = await submitQuizAttempt({
        quiz_id: quiz.id,
        user_id: user.id,
        answers,
        time_taken_seconds: startTime ? Math.floor((Date.now() - startTime.getTime()) / 1000) : 0,
        created_at: new Date().toISOString(),
        total_questions: questions.length,
        score: 0, // Will be calculated by backend
        attempt_number: 1,
        passed: false // Will be determined by backend
      })

      if (result.data && !result.error) {
        // Clear auto-save data
        clearProgress()
        
        // Navigate to results
        router.push(`/quizzes/${quiz.id}/results/${result.data.id}`)
      } else {
        setError(result.error || 'Failed to submit quiz')
      }
    } catch (err) {
      logger.error('Error submitting quiz:', err)
      setError('Failed to submit quiz')
    } finally {
      setSubmitting(false)
    }
  }, [submitting, quiz, user, answers, startTime, clearProgress, router, questions.length])

  // Timer logic
  useEffect(() => {
    if (!quizStarted || !startTime || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Auto-submit when time runs out
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [quizStarted, startTime, timeLeft, handleSubmit])

  // Load quiz data
  useEffect(() => {
    const loadQuiz = async () => {
      if (!resolvedQuizId || !user) return
      
      try {
        setLoading(true)
        setError(null)
        
        // Fetch from server
        const result = await getQuizQuestions(resolvedQuizId as string)
        
        if (result.data && !result.error) {
          const { quiz: quizData, questions: questionsData } = result.data
          setQuiz(quizData)
          setQuestions(questionsData)
          
          // Set timer if quiz has time limit
          if (quizData.time_limit_minutes) {
            setTimeLeft(quizData.time_limit_minutes * 60) // Convert minutes to seconds
          }
        } else {
          const errorMsg = result.error || 'Failed to load quiz';
          setError(errorMsg);
        }
      } catch (err) {
        logger.error('Error loading quiz:', err)
        setError('Failed to load quiz')
      } finally {
        setLoading(false)
      }
    }

    loadQuiz()
  }, [resolvedQuizId, user])

  // Actions
  const handleAnswerChange = useCallback((questionId: string, answer: any) => {
    setAnswers(prev => {
      const newAnswers = { ...prev, [questionId]: answer }
      
      // Save progress immediately when answer changes
      updateProgress({
        answers: newAnswers,
        currentQuestionIndex,
        attemptId: quizAttemptId,
      })
      
      return newAnswers
    })
  }, [currentQuestionIndex, quizAttemptId, updateProgress])

  const goToQuestion = useCallback((index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index)
    }
  }, [questions.length])

  const goNext = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }, [currentQuestionIndex, questions.length])

  const goPrevious = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }, [currentQuestionIndex])

  const startQuiz = useCallback(() => {
    setQuizStarted(true)
    setStartTime(new Date())
  }, [])

  const saveProgress = useCallback(async () => {
    if (!quizStarted) return
    await saveNow()
  }, [quizStarted, saveNow])

  const exitQuiz = useCallback(() => {
    if (hasUnsavedChanges) {
      const shouldSave = window.confirm('You have unsaved progress. Save before exiting?')
      if (shouldSave) {
        saveProgress()
      }
    }
    router.push('/quizzes')
  }, [hasUnsavedChanges, saveProgress, router])

  // State object
  const state: QuizTakingState = {
    quiz,
    questions,
    currentQuestionIndex,
    answers,
    quizStarted,
    startTime,
    timeLeft,
    loading,
    error,
    submitting,
    isAutoSaving,
    hasUnsavedChanges,
    lastSaved,
    isOnline,
    quizAttemptId,
  }

  // Actions object
  const actions: QuizTakingActions = {
    goToQuestion,
    goNext,
    goPrevious,
    handleAnswerChange,
    startQuiz,
    submitQuiz: handleSubmit,
    saveProgress,
    exitQuiz
  }

  return [state, actions]
}