import { useState, useEffect, useCallback, useRef } from 'react'
import { Quiz } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

// Simple UUID generator for quiz attempts
const generateId = () => {
  return 'quiz-attempt-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
}

interface Question {
  id: string
  question: string
  options: any[]
  correct_answer: string | number | number[]
  explanation?: string
  question_type: 'multiple_choice' | 'single_choice' | 'true_false' | 'fill_blank' | 'essay' | 'matching' | 'ordering'
  points?: number
  media_url?: string
  media_type?: 'image' | 'audio' | 'video'
}

interface UseQuizProgressReturn {
  answers: Record<string, any>
  currentQuestionIndex: number
  timeLeft: number
  quizStarted: boolean
  quizAttemptId: string | null
  startQuiz: () => void
  handleAnswerChange: (questionId: string, answer: any) => void
  handleQuestionNavigation: (index: number) => void
  handleNextQuestion: () => void
  handlePreviousQuestion: () => void
  resetQuiz: () => void
}

export function useQuizProgress(
  quiz: Quiz | null,
  questions: Question[]
): UseQuizProgressReturn {
  const { user } = useAuth()
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [quizStarted, setQuizStarted] = useState(false)
  const [quizAttemptId, setQuizAttemptId] = useState<string | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize timer when quiz starts
  useEffect(() => {
    if (!quizStarted || !quiz?.duration_minutes) return

    setTimeLeft(quiz.duration_minutes * 60)

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Auto-submit when time runs out
          if (timerRef.current) {
            clearInterval(timerRef.current)
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [quizStarted, quiz?.duration_minutes])

  // Auto-save answers (debounced)
  useEffect(() => {
    if (!quizStarted || !quizAttemptId || Object.keys(answers).length === 0) return

    const saveTimeout = setTimeout(() => {
      // Auto-save implementation would go here
      // For now, we'll just store in localStorage as backup
      localStorage.setItem(`quiz-${quiz?.id}-answers`, JSON.stringify(answers))
    }, 2000)

    return () => clearTimeout(saveTimeout)
  }, [answers, quizStarted, quizAttemptId, quiz?.id])

  // Load saved answers from localStorage
  useEffect(() => {
    if (!quiz?.id || quizStarted) return

    const savedAnswers = localStorage.getItem(`quiz-${quiz.id}-answers`)
    if (savedAnswers) {
      try {
        const parsed = JSON.parse(savedAnswers)
        setAnswers(parsed)
      } catch (error) {
        console.warn('Failed to parse saved answers:', error)
      }
    }
  }, [quiz?.id, quizStarted])

  const startQuiz = useCallback(() => {
    if (!quiz || !user) return

    setQuizStarted(true)
    setQuizAttemptId(generateId())
    setCurrentQuestionIndex(0)

    // Clear any existing saved answers
    localStorage.removeItem(`quiz-${quiz.id}-answers`)
  }, [quiz, user])

  const handleAnswerChange = useCallback((questionId: string, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }, [])

  const handleQuestionNavigation = useCallback((index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index)
    }
  }, [questions.length])

  const handleNextQuestion = useCallback(() => {
    setCurrentQuestionIndex(prev => Math.min(prev + 1, questions.length - 1))
  }, [questions.length])

  const handlePreviousQuestion = useCallback(() => {
    setCurrentQuestionIndex(prev => Math.max(prev - 1, 0))
  }, [])

  const resetQuiz = useCallback(() => {
    setQuizStarted(false)
    setAnswers({})
    setCurrentQuestionIndex(0)
    setTimeLeft(0)
    setQuizAttemptId(null)
    
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    // Clear saved answers
    if (quiz?.id) {
      localStorage.removeItem(`quiz-${quiz.id}-answers`)
    }
  }, [quiz?.id])

  return {
    answers,
    currentQuestionIndex,
    timeLeft,
    quizStarted,
    quizAttemptId,
    startQuiz,
    handleAnswerChange,
    handleQuestionNavigation,
    handleNextQuestion,
    handlePreviousQuestion,
    resetQuiz
  }
}