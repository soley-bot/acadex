import { useState, useEffect, useCallback, useRef } from 'react'
import { Quiz } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

// Secure UUID generator for quiz attempts
const generateSecureId = () => {
  // Use crypto.getRandomValues for better security
  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
    const array = new Uint8Array(16)
    window.crypto.getRandomValues(array)
    return 'quiz-attempt-' + Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }
  
  // Fallback for server-side or unsupported browsers
  return 'quiz-attempt-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
}

// Safe localStorage operations
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window === 'undefined') return null
      return localStorage.getItem(key)
    } catch (error) {
      console.warn('Failed to read from localStorage:', error)
      return null
    }
  },
  
  setItem: (key: string, value: string): boolean => {
    try {
      if (typeof window === 'undefined') return false
      localStorage.setItem(key, value)
      return true
    } catch (error) {
      console.warn('Failed to write to localStorage:', error)
      return false
    }
  },
  
  removeItem: (key: string): boolean => {
    try {
      if (typeof window === 'undefined') return false
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error)
      return false
    }
  }
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
  const isMountedRef = useRef(true)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [])

  // Initialize timer when quiz starts with proper cleanup
  useEffect(() => {
    if (!quizStarted || !quiz?.duration_minutes || !isMountedRef.current) return

    setTimeLeft(quiz.duration_minutes * 60)

    timerRef.current = setInterval(() => {
      if (!isMountedRef.current) {
        if (timerRef.current) {
          clearInterval(timerRef.current)
          timerRef.current = null
        }
        return
      }
      
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Auto-submit when time runs out
          if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [quizStarted, quiz?.duration_minutes])

  // Auto-save answers with enhanced error handling
  useEffect(() => {
    if (!quizStarted || !quizAttemptId || Object.keys(answers).length === 0 || !quiz?.id) return

    const saveTimeout = setTimeout(() => {
      if (!isMountedRef.current) return
      
      // Auto-save implementation with error handling
      const saved = safeLocalStorage.setItem(
        `quiz-${quiz.id}-answers`, 
        JSON.stringify({
          answers,
          timestamp: Date.now(),
          attemptId: quizAttemptId
        })
      )
      
      if (!saved) {
        console.warn('Failed to auto-save quiz progress')
      }
    }, 2000)

    return () => clearTimeout(saveTimeout)
  }, [answers, quizStarted, quizAttemptId, quiz?.id])

  // Load saved answers from localStorage with validation
  useEffect(() => {
    if (!quiz?.id || quizStarted) return

    const savedData = safeLocalStorage.getItem(`quiz-${quiz.id}-answers`)
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        
        // Validate saved data structure
        if (parsed && typeof parsed === 'object' && parsed.answers) {
          // Check if saved data is not too old (24 hours)
          const isRecent = parsed.timestamp && (Date.now() - parsed.timestamp) < 24 * 60 * 60 * 1000
          
          if (isRecent && isMountedRef.current) {
            setAnswers(parsed.answers)
          } else {
            // Clean up old data
            safeLocalStorage.removeItem(`quiz-${quiz.id}-answers`)
          }
        }
      } catch (error) {
        console.warn('Failed to parse saved quiz answers:', error)
        safeLocalStorage.removeItem(`quiz-${quiz.id}-answers`)
      }
    }
  }, [quiz?.id, quizStarted])

  const startQuiz = useCallback(() => {
    if (!quiz || !user || !isMountedRef.current) return

    setQuizStarted(true)
    setQuizAttemptId(generateSecureId())
    setCurrentQuestionIndex(0)

    // Clear any existing saved answers
    safeLocalStorage.removeItem(`quiz-${quiz.id}-answers`)
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