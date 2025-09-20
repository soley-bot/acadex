'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getQuizQuestions, submitQuizAttempt } from '@/lib/database'
import { useAuth } from '@/contexts/AuthContext'
import { QuizQuestion, Quiz } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Target, Move, Check, ArrowLeft, GripVertical } from 'lucide-react'
import { logger } from '@/lib/logger'
import Header from '@/components/Header'
import { Footer } from '@/components/Footer'
import { MatchingQuestion } from '@/components/student/quiz/MatchingQuestion'
import { MobileNavBarMinimal } from '@/components/mobile/MobileNavBar'
import SimpleSplitQuizLayout from '@/components/quiz/layouts/SimpleSplitQuizLayout'
import { 
  QuizStatusBar, 
  ProgressRestoreNotification 
} from '@/components/student/quiz/QuizStatusBar'
import { 
  useQuizAutoSave, 
  useNetworkStatus, 
  useQuizCache, 
  useUserPreferences 
} from '@/hooks/useClientStorage'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// Sortable Item Component for Drag & Drop
interface SortableItemProps {
  id: string
  children: React.ReactNode
  isDragOverlay?: boolean
}

function SortableItem({ id, children, isDragOverlay = false }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`touch-none ${isDragOverlay ? 'z-50' : ''}`}
      {...attributes}
    >
      <div className="flex items-center gap-3 p-4 bg-white border-2 border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all">
        <div
          {...listeners}
          className="flex items-center justify-center w-8 h-8 text-gray-400 hover:text-primary cursor-grab active:cursor-grabbing touch-manipulation"
          style={{ touchAction: 'none' }}
        >
          <GripVertical className="w-5 h-5" />
        </div>
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  )
}

interface Question {
  id: string
  question: string
  options: string[] | Array<{left: string; right: string}>
  correct_answer: number | string | number[]
  explanation?: string
  question_type: 'multiple_choice' | 'single_choice' | 'true_false' | 'fill_blank' | 'essay' | 'matching' | 'ordering'
  points?: number
  media_url?: string
  media_type?: 'image' | 'audio' | 'video'
}

export default function TakeQuizPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quizStarted, setQuizStarted] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [submitting, setSubmitting] = useState(false)
  const [lastSubmitTime, setLastSubmitTime] = useState(0)
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [quizAttemptId, setQuizAttemptId] = useState<string>('')
  const [showProgressRestore, setShowProgressRestore] = useState(false)
  const [savedProgress, setSavedProgress] = useState<any>(null)

  // Helper function to detect reading quiz
  const isReadingQuiz = useMemo(() => {
    return !!(quiz?.reading_passage?.trim())
  }, [quiz?.reading_passage])

  // Client-side features
  const { isOnline, isReconnecting } = useNetworkStatus()
  const { preferences } = useUserPreferences()
  const { cachedData, cacheQuizData } = useQuizCache(params.id as string)
  
  // Auto-save functionality - now button-based instead of interval-based
  const {
    updateProgress,
    saveNow,
    restoreProgress,
    clearProgress,
    isAutoSaving,
    lastSaved,
    hasUnsavedChanges
  } = useQuizAutoSave({
    quizId: params.id as string,
    userId: user?.id || '',
    enabled: !!(preferences.autoSave && quizStarted && user),
    intervalSeconds: 0, // Disable interval-based saving, use button-based saving instead
    onSave: (progress) => {
      console.log('Quiz progress saved on navigation/answer:', progress)
    },
    onRestore: (progress) => {
      console.log('Quiz progress restored:', progress)
    },
    onError: (error) => {
      console.error('Auto-save error:', error)
    }
  })

  // Generate unique quiz attempt ID when quiz starts
  useEffect(() => {
    if (quizStarted && !quizAttemptId) {
      const attemptId = `attempt_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
      setQuizAttemptId(attemptId)
    }
  }, [quizStarted, quizAttemptId])

  // Drag & Drop sensors (must be at component level)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150, // 150ms delay before drag starts on touch
        tolerance: 8, // Allow 8px movement during delay
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // ✅ MODIFIED: Handle answer changes - now only saves on answer change, not continuously
  const handleAnswerChange = useCallback((questionId: string, answer: any) => {
    setAnswers(prev => {
      const newAnswers = {
        ...prev,
        [questionId]: answer
      }
      
      // Save progress immediately when answer changes
      updateProgress({
        answers: newAnswers,
        currentQuestionIndex,
        attemptId: quizAttemptId,
        startTime: startTime?.toISOString(),
        timeLeft
      })
      
      return newAnswers
    })
  }, [updateProgress, currentQuestionIndex, quizAttemptId, startTime, timeLeft])

  // ✅ MISSING FUNCTION: Handle answer selection for multiple choice/true-false
  const handleAnswerSelect = useCallback((questionId: string, selectedIndex: number) => {
    setAnswers(prev => {
      const newAnswers = {
        ...prev,
        [questionId]: selectedIndex
      }
      
      // Update auto-save progress
      updateProgress({
        answers: newAnswers,
        currentQuestionIndex,
        attemptId: quizAttemptId,
        startTime: startTime?.toISOString(),
        timeLeft
      })
      
      return newAnswers
    })
  }, [updateProgress, currentQuestionIndex, quizAttemptId, startTime, timeLeft])

  // ✅ NAVIGATION HANDLERS: Navigation with auto-save
  const handleNextQuestion = useCallback(async () => {
    // Save progress before moving to next question
    try {
      await saveNow()
    } catch (error) {
      console.warn('Failed to save progress before next question:', error)
    }
    setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))
  }, [saveNow, questions.length])

  const handlePreviousQuestion = useCallback(async () => {
    // Save progress before moving to previous question
    try {
      await saveNow()
    } catch (error) {
      console.warn('Failed to save progress before previous question:', error)
    }
    setCurrentQuestionIndex(prev => Math.max(0, prev - 1))
  }, [saveNow])

  const handleQuestionNavigation = useCallback(async (index: number) => {
    // Save progress before navigating to specific question
    try {
      await saveNow()
    } catch (error) {
      console.warn('Failed to save progress before question navigation:', error)
    }
    setCurrentQuestionIndex(index)
  }, [saveNow])

  // ✅ OPTIMIZED: Memoized current question and progress calculations
  const currentQuestion = useMemo(() => questions[currentQuestionIndex], [questions, currentQuestionIndex])
  
  const progressStats = useMemo(() => {
    const answeredQuestions = Object.keys(answers).length
    const progressPercentage = questions.length > 0 ? (answeredQuestions / questions.length) * 100 : 0
    const currentProgress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0
    
    return {
      answeredCount: answeredQuestions,
      totalQuestions: questions.length,
      progressPercentage,
      currentProgress
    }
  }, [answers, questions.length, currentQuestionIndex])

  const isQuizComplete = useMemo(() => {
    return progressStats.answeredCount === questions.length && questions.length > 0
  }, [progressStats.answeredCount, questions.length])

  // Fetch quiz questions (only run once per quiz ID)
  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    if (!params.id) return

    let isMounted = true

    const fetchQuizQuestions = async () => {
      try {
        if (isMounted) setLoading(true)
        
        const { data, error: fetchError } = await getQuizQuestions(params.id as string)
        
        if (!isMounted) return // Component unmounted
        
        if (fetchError) {
          setError('Failed to load quiz questions')
          logger.error('Error fetching quiz questions:', fetchError)
        } else {
          setQuestions(data.questions || [])
          setQuiz(data.quiz)
          setTimeLeft(data.quiz.duration_minutes * 60) // Convert to seconds
          
          // Cache the quiz data for offline use
          cacheQuizData(data.quiz, data.questions || [], 60) // Cache for 1 hour
        }
      } catch (err) {
        if (!isMounted) return
        logger.error('Error fetching quiz questions:', err)
        setError('Failed to load quiz questions')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchQuizQuestions()

    return () => {
      isMounted = false
    }
  }, [params.id, user, router, cacheQuizData])

  // Check for saved progress after quiz loads (separate effect)
  useEffect(() => {
    if (quiz && !quizStarted && !showProgressRestore) {
      const savedProgress = restoreProgress()
      if (savedProgress) {
        setSavedProgress(savedProgress)
        setShowProgressRestore(true)
      }
    }
  }, [quiz, quizStarted, showProgressRestore, restoreProgress])

  // Progress restore handlers
  const handleRestoreProgress = useCallback(() => {
    if (savedProgress) {
      setAnswers(savedProgress.answers || {})
      setCurrentQuestionIndex(savedProgress.currentQuestionIndex || 0)
      setTimeLeft(savedProgress.timeLeft || (quiz?.duration_minutes ? quiz.duration_minutes * 60 : 0))
      setQuizStarted(true)
      setStartTime(savedProgress.startTime ? new Date(savedProgress.startTime) : new Date())
      setQuizAttemptId(savedProgress.attemptId || `attempt_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`)
      setShowProgressRestore(false)
    }
  }, [savedProgress, quiz])

  const handleDiscardProgress = useCallback(() => {
    clearProgress()
    setShowProgressRestore(false)
    setSavedProgress(null)
  }, [clearProgress])

  const handleSubmitQuiz = useCallback(async () => {
    // Prevent multiple submissions with multiple checks
    if (submitting) {
      console.log('Submit already in progress, ignoring duplicate click')
      return
    }

    // Additional debounce protection
    const now = Date.now()
    if (now - lastSubmitTime < 1000) {
      console.log('Submit attempt too soon, debouncing')
      return
    }
    setLastSubmitTime(now)

    try {
      setSubmitting(true)
      setError(null) // Clear any previous errors
      
      // Save progress one final time before submission with timeout
      try {
        await Promise.race([
          saveNow(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Save timeout')), 5000))
        ])
      } catch (saveError) {
        console.warn('Save before submit failed, continuing with submission:', saveError)
      }
      
      // Calculate time taken in seconds
      const endTime = new Date()
      const timeTakenSeconds = startTime ? Math.round((endTime.getTime() - startTime.getTime()) / 1000) : 0
      
      // Calculate basic metrics for submission
      const totalQuestions = questions.length
      const answeredCount = Object.keys(answers).length
      
      // Retry submission up to 3 times
      let submitResult = null
      let lastError = null
      
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          console.log(`Quiz submission attempt ${attempt}/3`)
          submitResult = await submitQuizAttempt({
            quiz_id: params.id as string,
            user_id: user!.id,
            answers,
            time_taken_seconds: timeTakenSeconds,
            created_at: new Date().toISOString(),
            total_questions: totalQuestions,
            score: 0, // Will be calculated by backend
            attempt_number: 1, // TODO: Track actual attempt number
            passed: false // Will be determined by backend
          })
          
          if (submitResult.error) {
            lastError = submitResult.error
            if (attempt < 3) {
              console.log(`Submission attempt ${attempt} failed, retrying:`, submitResult.error)
              // Wait before retry (exponential backoff)
              await new Promise(resolve => setTimeout(resolve, attempt * 1000))
              continue
            }
          } else {
            // Successful submission
            break
          }
        } catch (err) {
          lastError = err
          if (attempt < 3) {
            console.log(`Submission attempt ${attempt} failed with exception, retrying:`, err)
            await new Promise(resolve => setTimeout(resolve, attempt * 1000))
            continue
          }
        }
      }
      
      if (submitResult?.error || lastError) {
        const errorMessage = submitResult?.error?.message || 
                            (lastError instanceof Error ? lastError.message : 'Unknown error')
        setError(`Failed to submit quiz: ${errorMessage}. Please try again.`)
        logger.error('Error submitting quiz after retries:', lastError || submitResult?.error)
        return
      }
      
      if (submitResult?.data) {
        // Clear saved progress after successful submission
        try {
          clearProgress()
        } catch (clearError) {
          console.warn('Failed to clear progress after submission:', clearError)
        }
        
        // Redirect to results page
        router.push(`/quizzes/${params.id}/results/${submitResult.data.id}`)
      } else {
        setError('Submission failed: No data returned. Please try again.')
      }
    } catch (err) {
      logger.error('Unexpected error during quiz submission:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }, [submitting, lastSubmitTime, params.id, user, answers, router, startTime, saveNow, clearProgress, questions.length])

  // Timer effect - Enhanced to prevent conflicts
  useEffect(() => {
    if (!quizStarted || timeLeft <= 0 || submitting) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1 && !submitting) {
          console.log('Time expired, auto-submitting quiz')
          // Use a timeout to ensure state has updated
          setTimeout(() => {
            if (!submitting) {
              handleSubmitQuiz()
            }
          }, 100)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [quizStarted, timeLeft, handleSubmitQuiz, submitting])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const handleExitQuiz = () => {
    if (Object.keys(answers).length > 0) {
      setShowExitConfirm(true)
    } else {
      router.push('/quizzes')
    }
  }

  const confirmExit = () => {
    router.push('/quizzes')
  }

  // ✅ OPTIMIZATION: Keyboard navigation for power users
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Only handle keyboard shortcuts if not typing in input/textarea
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return
      }

      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'Enter':
            event.preventDefault()
            if (currentQuestionIndex === questions.length - 1) {
              handleSubmitQuiz()
            } else {
              handleNextQuestion()
            }
            break
          case 'ArrowLeft':
            event.preventDefault()
            if (currentQuestionIndex > 0) {
              handlePreviousQuestion()
            }
            break
          case 'ArrowRight':
            event.preventDefault()
            if (currentQuestionIndex < questions.length - 1) {
              handleNextQuestion()
            }
            break
        }
      }
    }

    if (quizStarted && !submitting) {
      window.addEventListener('keydown', handleKeyPress)
      return () => window.removeEventListener('keydown', handleKeyPress)
    }
  }, [quizStarted, submitting, currentQuestionIndex, questions.length, handleSubmitQuiz, handleNextQuestion, handlePreviousQuestion])

  // Loading state - simplified condition to reduce flickering
  if (loading && !quiz) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-4">
          <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center p-4">
            <Card variant="glass" className="max-w-lg w-full overflow-hidden">
              <div className="bg-card border-b border-border p-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Loading Quiz</h3>
                <p className="text-muted-foreground text-sm">Preparing your quiz questions...</p>
              </div>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !quiz || questions.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-4">
          <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center p-4">
            <Card variant="glass" className="max-w-md w-full overflow-hidden">
              <div className="bg-card border-b border-border p-6 text-center">
                <div className="w-16 h-16 bg-destructive rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">Unable to Load Quiz</h3>
                <p className="text-muted-foreground text-sm">{error || 'The quiz questions could not be loaded.'}</p>
              </div>
              <div className="p-6">
                <button
                  onClick={() => router.push('/quizzes')}
                  className="w-full bg-primary hover:bg-secondary text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Quizzes
                </button>
              </div>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!quizStarted) {
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

    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-4">
          {/* Progress Restore Notification */}
          {showProgressRestore && savedProgress && (
            <div className="container mx-auto px-4 max-w-4xl mb-4">
              <ProgressRestoreNotification
                onRestore={handleRestoreProgress}
                onDiscard={handleDiscardProgress}
                lastSaved={new Date(savedProgress.lastSaved)}
              />
            </div>
          )}

          {/* Quiz Status Bar - Only show when quiz is started */}
          {quizStarted && (
            <QuizStatusBar
              isAutoSaving={isAutoSaving}
              lastSaved={lastSaved}
              hasUnsavedChanges={hasUnsavedChanges}
              isOnline={isOnline}
              isReconnecting={isReconnecting}
              currentQuestion={currentQuestionIndex + 1}
              totalQuestions={questions.length}
              timeLeft={timeLeft}
            />
          )}

          <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center p-4">
            <Card variant="glass" className="max-w-lg w-full overflow-hidden">
          {/* Header with Icon and Title */}
          <div className="relative bg-card border-b border-border p-6">
            {/* Difficulty Badge - Top left for better balance */}
            {quiz.difficulty && (
              <div className="mb-4">
                <span className={`px-3 py-1 text-xs font-semibold rounded-md border ${getDifficultyColor(quiz.difficulty)}`}>
                  {quiz.difficulty}
                </span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-foreground">{quiz.title}</h2>
                {quiz.category && (
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
                    <span className="w-1 h-1 bg-muted-foreground rounded-full"></span>
                    <span>{quiz.category}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Description */}
            {quiz.description && (
              <p className="text-muted-foreground text-sm mb-6 leading-relaxed">{quiz.description}</p>
            )}

            {/* Quiz Meta Information - Professional Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-muted/30 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm mb-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Questions</span>
                </div>
                <div className="text-2xl font-bold text-foreground">{questions.length}</div>
              </div>
              <div className="bg-muted/30 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm mb-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Time Limit</span>
                </div>
                <div className="text-2xl font-bold text-foreground">{quiz.duration_minutes}<span className="text-sm font-normal text-muted-foreground ml-1">min</span></div>
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={() => {
                setQuizStarted(true)
                setStartTime(new Date())
              }}
              className="w-full bg-primary hover:bg-secondary text-white px-6 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Start Quiz
            </button>
          </div>
        </Card>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Active quiz session - no global navigation for cognitive load reduction
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 relative overflow-hidden">
      {/* Mobile Navigation - Only visible on mobile screens */}
      <MobileNavBarMinimal 
        backHref="/quizzes"
        showHome={true}
        homeHref="/dashboard"
      />

      <div className="max-w-3xl mx-auto px-4 py-3 relative">
        {/* Submission Error Banner */}
        {error && (
          <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-destructive mb-1">Submission Failed</h4>
                <p className="text-sm text-destructive/80">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="mt-2 text-xs text-destructive/60 hover:text-destructive underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Desktop Back Navigation - Hidden on mobile */}
        <div className="mb-3 hidden md:block">
          <button
            onClick={handleExitQuiz}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 bg-white/60 hover:bg-white/80 px-3 py-1 rounded-lg border border-white/30"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Quizzes
          </button>
        </div>

        {/* Compact Header */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-foreground mb-1">{quiz?.title || 'Quiz'}</h1>
          {quiz?.description && (
            <p className="text-sm text-muted-foreground bg-white/80 backdrop-blur-sm px-3 py-1 rounded-lg inline-block border border-white/20">
              {quiz.description}
            </p>
          )}
        </div>

        {/* Progress Bar - Mobile Enhanced & Optimized */}
        <div className="mb-6 bg-white/90 backdrop-blur-lg rounded-xl p-3 sm:p-4 shadow-lg border border-white/20">
          {/* Mobile: Compact single-line layout */}
          <div className="flex sm:hidden items-center justify-between text-sm mb-2">
            <span className="text-xs font-semibold text-gray-700">
              {currentQuestionIndex + 1}/{progressStats.totalQuestions}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-600">{Math.round(progressStats.currentProgress)}%</span>
              {timeLeft > 0 && (
                <span className={`text-xs font-bold px-2 py-1 rounded-md border ${
                  timeLeft <= 60 ? 'bg-destructive text-destructive-foreground border-destructive' : 
                  timeLeft <= 300 ? 'bg-warning text-warning-foreground border-warning' : 
                  'bg-muted text-muted-foreground border-border'
                }`}>
                  {formatTime(timeLeft)}
                </span>
              )}
            </div>
          </div>

          {/* Desktop: Full two-line layout */}
          <div className="hidden sm:flex items-center justify-between text-sm text-gray-600 mb-3">
            <span className="font-semibold">Question {currentQuestionIndex + 1} of {progressStats.totalQuestions}</span>
            <div className="flex items-center gap-3">
              <span className="font-medium">{Math.round(progressStats.currentProgress)}% Complete</span>
              {progressStats.answeredCount > 0 && (
                <span className="text-xs text-green-600 font-medium">
                  {progressStats.answeredCount} answered
                </span>
              )}
              {timeLeft > 0 && (
                <span className={`font-bold px-2 py-1 rounded-md text-xs border ${
                  timeLeft <= 60 ? 'bg-destructive text-destructive-foreground border-destructive' : 
                  timeLeft <= 300 ? 'bg-warning text-warning-foreground border-warning' : 
                  'bg-muted text-muted-foreground border-border'
                }`}>
                  {formatTime(timeLeft)}
                </span>
              )}
            </div>
          </div>

          {/* Progress bar - consistent on all devices */}
          <div className="w-full bg-muted/60 rounded-full h-2 sm:h-3 shadow-inner">
            <div 
              className="bg-primary h-2 sm:h-3 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${progressStats.currentProgress}%` }}
            ></div>
          </div>
        </div>

        {/* Main Quiz Content - Enhanced Mobile-First UI/UX */}
        <div className="bg-white/95 rounded-xl p-4 sm:p-6 shadow-lg border border-white/20">
          {currentQuestion ? (
            <>
              {/* Question Header - Improved Typography & Spacing */}
              <div className="mb-5 sm:mb-6">
                <div className="bg-gradient-to-r from-primary/8 to-secondary/8 rounded-lg p-3 sm:p-4 border border-primary/10">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="text-xs sm:text-sm font-medium text-primary/70 uppercase tracking-wide">
                      Question {currentQuestionIndex + 1} of {questions.length}
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {currentQuestion.question_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-semibold text-foreground leading-relaxed">
                    {currentQuestion.question}
                  </h2>
                </div>
              </div>
              
              {/* Answer Options - Mobile-Optimized Spacing */}
              <div className="space-y-3 mb-6">
                {/* Multiple Choice / Single Choice - Enhanced Mobile UI */}
                {(currentQuestion.question_type === 'multiple_choice' || currentQuestion.question_type === 'single_choice') && Array.isArray(currentQuestion.options) && (
                  <>
                    {(currentQuestion.options as string[]).map((option, index) => (
                      <label
                        key={index}
                        className={`group flex items-start gap-3 sm:gap-4 p-3 sm:p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 min-h-[48px] touch-manipulation ${
                          answers[currentQuestion?.id ?? ''] === index
                            ? 'border-primary bg-primary/8 shadow-sm'
                            : 'border-gray-200 bg-white hover:border-primary/50 hover:bg-primary/5 hover:shadow-sm'
                        }`}
                        style={{ touchAction: 'manipulation' }}
                      >
                        {/* Custom Radio Button - Properly Sized */}
                        <div className={`flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 transition-all flex-shrink-0 mt-0.5 ${
                          answers[currentQuestion?.id ?? ''] === index
                            ? 'border-primary bg-primary'
                            : 'border-gray-400 bg-white group-hover:border-primary/50'
                        }`}>
                          {answers[currentQuestion?.id ?? ''] === index && (
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <input
                          type="radio"
                          name={`question-${currentQuestion?.id ?? ''}`}
                          value={index}
                          checked={answers[currentQuestion?.id ?? ''] === index}
                          onChange={() => currentQuestion && handleAnswerChange(currentQuestion.id, index)}
                          className="sr-only"
                        />
                        {/* Option Text - Better Typography */}
                        <span className="text-sm sm:text-base text-gray-800 flex-1 leading-relaxed group-hover:text-gray-900">
                          {option}
                        </span>
                      </label>
                    ))}
                  </>
                )}

                {/* True/False - Enhanced Mobile UI */}
                {currentQuestion.question_type === 'true_false' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {['True', 'False'].map((option, index) => (
                      <label
                        key={index}
                        className={`group flex items-center justify-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 min-h-[56px] touch-manipulation ${
                          answers[currentQuestion?.id ?? ''] === index
                            ? 'border-primary bg-primary/8 shadow-sm'
                            : 'border-gray-200 bg-white hover:border-primary/50 hover:bg-primary/5 hover:shadow-sm'
                        }`}
                        style={{ touchAction: 'manipulation' }}
                      >
                        {/* Custom Radio Button */}
                        <div className={`flex items-center justify-center w-5 h-5 rounded-full border-2 transition-all ${
                          answers[currentQuestion?.id ?? ''] === index
                            ? 'border-primary bg-primary'
                            : 'border-gray-400 bg-white group-hover:border-primary/50'
                        }`}>
                          {answers[currentQuestion?.id ?? ''] === index && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <input
                          type="radio"
                          name={`question-${currentQuestion?.id ?? ''}`}
                          value={index}
                          checked={answers[currentQuestion?.id ?? ''] === index}
                          onChange={() => currentQuestion && handleAnswerChange(currentQuestion.id, index)}
                          className="sr-only"
                        />
                        <span className="text-base sm:text-lg text-gray-800 font-medium group-hover:text-gray-900">
                          {option}
                        </span>
                      </label>
                    ))}
                  </div>
                )}

                {/* Fill in the Blank - Mobile Enhanced */}
                {currentQuestion.question_type === 'fill_blank' && (
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Type your answer here..."
                      value={answers[currentQuestion?.id ?? ''] || ''}
                      onChange={(e) => currentQuestion && handleAnswerChange(currentQuestion.id, e.target.value)}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all text-base bg-white shadow-sm hover:shadow-md touch-manipulation"
                      style={{ 
                        minHeight: '52px', // Touch-friendly height
                        fontSize: '16px', // Prevent zoom on iOS
                        touchAction: 'manipulation'
                      }}
                      autoComplete="off"
                      spellCheck="true"
                      autoCapitalize="sentences"
                    />
                    <div className="flex items-center gap-2 text-xs text-gray-500 bg-blue-50 p-2 rounded-lg">
                      <span className="text-blue-500">💡</span>
                      <span>Your answer will be auto-saved as you type</span>
                    </div>
                  </div>
                )}

                {/* Essay - Mobile Enhanced */}
                {currentQuestion.question_type === 'essay' && (
                  <div className="space-y-4">
                    <textarea
                      placeholder="Write your essay answer here..."
                      value={answers[currentQuestion?.id ?? ''] || ''}
                      onChange={(e) => currentQuestion && handleAnswerChange(currentQuestion.id, e.target.value)}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all text-base resize-none bg-white shadow-sm hover:shadow-md touch-manipulation"
                      rows={6}
                      style={{ 
                        minHeight: '140px', // Adequate space for writing
                        fontSize: '16px', // Prevent zoom on iOS
                        touchAction: 'manipulation',
                        lineHeight: '1.6'
                      }}
                      autoComplete="off"
                      spellCheck="true"
                      autoCapitalize="sentences"
                    />
                    <div className="flex items-center justify-between text-xs bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-gray-600">
                        <span className="text-blue-500">💡</span>
                        <span>Take your time to provide a detailed answer</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500 font-mono">
                        <span>Words: {(answers[currentQuestion?.id ?? ''] || '').split(' ').filter((word: string) => word.length > 0).length}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Matching - Modern Connected Lines Interface */}
                {currentQuestion.question_type === 'matching' && Array.isArray(currentQuestion.options) && quizAttemptId && (
                  <MatchingQuestion
                    question={{
                      id: currentQuestion.id,
                      question: currentQuestion.question,
                      options: currentQuestion.options as Array<{left: string; right: string}>
                    }}
                    userAnswer={answers[currentQuestion.id] || {}}
                    onAnswerChange={handleAnswerChange}
                    quizAttemptId={quizAttemptId}
                    isSubmitted={submitting}
                  />
                )}

                {/* Ordering - Modern Drag & Drop Interface */}
                {currentQuestion.question_type === 'ordering' && Array.isArray(currentQuestion.options) && (
                  <div className="space-y-4">
                    {(() => {
                      // Detect if this is sentence ordering (short words) vs list ordering
                      const avgWordLength = (currentQuestion.options as string[]).reduce((sum, word) => sum + word.length, 0) / currentQuestion.options.length;
                      const isSentenceOrdering = avgWordLength < 8 && (currentQuestion.options as string[]).length <= 8;
                      
                      // Get current order from answers
                      const currentAnswer = answers[currentQuestion?.id ?? ''] || {};
                      
                      // Convert answer format to sortable array
                      const sortedItems = Array.from({ length: currentQuestion.options.length }, (_, position) => {
                        const itemIndex = Object.keys(currentAnswer).find(
                          idx => currentAnswer[idx] === position + 1
                        );
                        return itemIndex ? {
                          id: `item-${itemIndex}`,
                          content: (currentQuestion.options as string[])[parseInt(itemIndex)],
                          originalIndex: parseInt(itemIndex)
                        } : null;
                      }).filter(Boolean) as Array<{id: string; content: string; originalIndex: number}>;
                      
                      // Get unplaced items
                      const placedIndices = new Set(sortedItems.map(item => item.originalIndex));
                      const unplacedItems = (currentQuestion.options as string[])
                        .map((content, index) => ({ 
                          id: `item-${index}`, 
                          content, 
                          originalIndex: index 
                        }))
                        .filter(item => !placedIndices.has(item.originalIndex));

                      const handleDragEnd = (event: DragEndEvent) => {
                        const { active, over } = event;
                        
                        if (!over || !currentQuestion) return;

                        const activeId = active.id as string;
                        const overId = over.id as string;

                        // Handle drag within sorted area
                        if (activeId !== overId && sortedItems.find(item => item.id === activeId)) {
                          const oldIndex = sortedItems.findIndex(item => item.id === activeId);
                          const newIndex = sortedItems.findIndex(item => item.id === overId);
                          
                          const newSortedItems = arrayMove(sortedItems, oldIndex, newIndex);
                          
                          // Convert back to answer format
                          const newAnswer: Record<string, number> = {};
                          newSortedItems.forEach((item, position) => {
                            newAnswer[item.originalIndex] = position + 1;
                          });
                          
                          handleAnswerChange(currentQuestion.id, newAnswer);
                        }
                      };

                      const addToOrder = (item: {id: string; content: string; originalIndex: number}) => {
                        if (!currentQuestion) return;
                        const newAnswer = { ...currentAnswer };
                        newAnswer[item.originalIndex] = sortedItems.length + 1;
                        handleAnswerChange(currentQuestion.id, newAnswer);
                      };

                      const removeFromOrder = (item: {id: string; content: string; originalIndex: number}) => {
                        if (!currentQuestion) return;
                        const newAnswer = { ...currentAnswer };
                        const removedPosition = newAnswer[item.originalIndex];
                        delete newAnswer[item.originalIndex];
                        
                        // Shift other items down
                        Object.keys(newAnswer).forEach(key => {
                          if (newAnswer[key] > removedPosition) {
                            newAnswer[key]--;
                          }
                        });
                        
                        handleAnswerChange(currentQuestion.id, newAnswer);
                      };
                      
                      if (isSentenceOrdering) {
                        // Clean Word Pill Component - Click to toggle, Drag to reorder
                        const WordPill = ({ 
                          item, 
                          isInSentence = false, 
                          onClick 
                        }: { 
                          item: {id: string; content: string; originalIndex: number};
                          isInSentence?: boolean;
                          onClick: () => void;
                        }) => {
                          const {
                            attributes,
                            listeners,
                            setNodeRef,
                            transform,
                            transition,
                            isDragging,
                          } = useSortable({ 
                            id: item.id,
                            disabled: !isInSentence // Only allow dragging within sentence
                          });

                          const style = {
                            transform: CSS.Transform.toString(transform),
                            transition,
                            opacity: isDragging ? 0.5 : 1,
                          };

                          return (
                            <button
                              ref={setNodeRef}
                              onClick={onClick}
                              className={`
                                px-4 py-2 rounded-full font-medium min-h-[44px] 
                                touch-manipulation cursor-pointer select-none
                                transition-all duration-200 
                                ${isInSentence 
                                  ? 'bg-primary hover:bg-secondary text-white hover:text-black active:bg-secondary active:text-black' 
                                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 active:bg-gray-300'
                                }
                                ${isDragging ? 'shadow-lg scale-105 z-50' : 'hover:scale-102 active:scale-95'}
                                ${isInSentence ? 'hover:shadow-md touch-action-none' : ''}
                              `}
                              {...(isInSentence ? { 
                                ...attributes, 
                                ...listeners,
                                style: { 
                                  ...style, 
                                  touchAction: 'none' // Prevent browser touch behaviors
                                }
                              } : { style })}
                              aria-label={isInSentence ? `${item.content} - click to remove or drag to reorder` : `${item.content} - click to add`}
                            >
                              {item.content}
                            </button>
                          );
                        };

                        return (
                          <>
                            {/* Sentence Building Area */}
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border-2 border-blue-200">
                              <h4 className="font-semibold text-sm text-gray-800 mb-3">Build your sentence:</h4>
                              
                              <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                              >
                                <SortableContext 
                                  items={sortedItems.map(item => item.id)} 
                                  strategy={horizontalListSortingStrategy}
                                >
                                  <div className="min-h-[80px] border-2 border-dashed border-blue-300 rounded-lg p-4 flex flex-wrap gap-2 items-center bg-white">
                                    {sortedItems.length === 0 ? (
                                      <div className="text-center text-gray-400 py-4 w-full">
                                        Click words below to build your sentence
                                      </div>
                                    ) : (
                                      sortedItems.map((item) => (
                                        <WordPill 
                                          key={item.id} 
                                          item={item}
                                          isInSentence={true}
                                          onClick={() => removeFromOrder(item)}
                                        />
                                      ))
                                    )}
                                  </div>
                                </SortableContext>
                              </DndContext>
                              
                              {/* Sentence Preview */}
                              {sortedItems.length > 0 && (
                                <div className="mt-3 p-3 bg-blue-100 rounded-lg">
                                  <span className="text-sm font-medium text-blue-800">Preview: </span>
                                  <span className="text-base text-blue-900">
                                    &ldquo;{sortedItems.map(item => item.content).join(' ')}&rdquo;
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            {/* Available Words */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <h4 className="font-semibold text-sm text-gray-800 mb-3">Available words:</h4>
                              <div className="flex flex-wrap gap-2">
                                {unplacedItems.map((item) => (
                                  <WordPill
                                    key={item.id}
                                    item={item}
                                    isInSentence={false}
                                    onClick={() => addToOrder(item)}
                                  />
                                ))}
                              </div>
                            </div>
                          </>
                        );
                      } else {
                        // List Ordering with Drag & Drop
                        return (
                          <>
                            <DndContext 
                              sensors={sensors}
                              collisionDetection={closestCenter}
                              onDragEnd={handleDragEnd}
                            >
                              {/* Current Order Display */}
                              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                                <h4 className="font-semibold text-sm text-gray-800 mb-3">Your Current Order:</h4>
                                
                                {sortedItems.length > 0 ? (
                                  <SortableContext 
                                    items={sortedItems.map(item => item.id)}
                                    strategy={verticalListSortingStrategy}
                                  >
                                    <div className="space-y-2">
                                      {sortedItems.map((item, index) => (
                                        <SortableItem key={item.id} id={item.id}>
                                          <div className="flex items-center gap-3">
                                            <div className="flex items-center justify-center w-8 h-8 bg-primary text-white text-sm font-bold rounded-full">
                                              {index + 1}
                                            </div>
                                            <span className="flex-1 text-base">{item.content}</span>
                                            <button
                                              onClick={() => removeFromOrder(item)}
                                              className="text-red-500 hover:text-red-700 p-1"
                                            >
                                              ✕
                                            </button>
                                          </div>
                                        </SortableItem>
                                      ))}
                                    </div>
                                  </SortableContext>
                                ) : (
                                  <div className="text-gray-400 italic text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                                    Drag items here to create your ordered list
                                  </div>
                                )}
                              </div>
                            </DndContext>
                            
                            {/* Available Items */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <h4 className="font-semibold text-sm text-gray-800 mb-3">Available Items:</h4>
                              <div className="grid grid-cols-1 gap-2">
                                {unplacedItems.map((item) => (
                                  <button
                                    key={item.id}
                                    onClick={() => addToOrder(item)}
                                    className="w-full text-left p-3 border-2 border-gray-300 bg-white rounded-lg transition-all hover:border-primary hover:bg-primary/5 touch-manipulation"
                                    style={{ minHeight: '44px' }}
                                  >
                                    <span className="text-sm">{item.content}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          </>
                        );
                      }
                    })()}
                  </div>
                )}
              </div>

              {/* Navigation - Enhanced Mobile Design */}
              <div className="flex items-center justify-between gap-3 sm:gap-4 pt-5 sm:pt-6 border-t border-gray-200">
                {/* Previous Button - Mobile optimized */}
                <button
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="px-4 sm:px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm sm:text-base transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-200 active:scale-95 touch-manipulation min-h-[48px] flex-shrink-0 border border-gray-200"
                  style={{ touchAction: 'manipulation' }}
                >
                  <span className="hidden sm:inline">← Previous</span>
                  <span className="sm:hidden text-lg">←</span>
                </button>

                {/* Question Navigator - Enhanced Mobile Experience */}
                <div className="flex-1 flex items-center justify-center px-2">
                  {/* Mobile: Compact progress indicator */}
                  <div className="sm:hidden flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-primary/10 rounded-full px-3 py-2 border border-primary/20">
                      <span className="text-sm font-semibold text-primary">
                        {currentQuestionIndex + 1}
                      </span>
                      <span className="text-xs text-primary/70">of</span>
                      <span className="text-sm font-medium text-primary/80">
                        {questions.length}
                      </span>
                    </div>
                    <div className="w-20 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300 rounded-full"
                        style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Desktop: Full question dots */}
                  <div className="hidden sm:flex items-center gap-1.5 max-w-md overflow-x-auto scrollbar-hide">
                    {questions.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuestionNavigation(index)}
                        className={`w-9 h-9 rounded-full text-sm font-semibold transition-all duration-200 flex-shrink-0 hover:scale-110 active:scale-95 touch-manipulation border-2 ${
                          index === currentQuestionIndex
                            ? 'bg-primary text-white shadow-lg border-primary'
                            : answers[questions[index]?.id ?? ''] !== undefined
                            ? 'bg-green-50 text-green-700 border-green-300 shadow-sm hover:bg-green-100'
                            : 'bg-gray-50 text-gray-600 border-gray-300 hover:bg-gray-100 hover:border-gray-400'
                        }`}
                        style={{ touchAction: 'manipulation' }}
                        aria-label={`Go to question ${index + 1}`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit Button - Enhanced Protection & Feedback */}
                {currentQuestionIndex === questions.length - 1 ? (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={submitting}
                    className={`px-5 sm:px-8 py-3.5 rounded-xl font-semibold text-sm sm:text-base transition-all duration-200 min-h-[52px] flex-shrink-0 border-2 ${
                      submitting 
                        ? 'bg-gray-400 border-gray-400 cursor-not-allowed opacity-75' 
                        : 'bg-green-500 border-green-500 hover:bg-green-600 hover:border-green-600 hover:shadow-lg active:scale-95 touch-manipulation'
                    } text-white shadow-md`}
                    style={{ touchAction: 'manipulation' }}
                    aria-label={submitting ? 'Submitting quiz, please wait' : 'Submit quiz'}
                  >
                    {submitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span className="hidden sm:inline">Submitting...</span>
                        <span className="sm:hidden">⏳</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="hidden sm:inline">Submit Quiz</span>
                        <span className="sm:hidden">Submit</span>
                      </div>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="px-5 sm:px-8 py-3.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold text-sm sm:text-base transition-all duration-200 active:scale-95 touch-manipulation min-h-[52px] flex-shrink-0 shadow-md hover:shadow-lg border-2 border-primary hover:border-primary/90"
                    style={{ touchAction: 'manipulation' }}
                  >
                    <span className="hidden sm:inline">Next →</span>
                    <span className="sm:hidden text-lg">→</span>
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="text-muted-foreground text-center py-8">No question found.</div>
          )}
        </div>
      </div>

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card variant="glass" className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <AlertTriangle className="w-5 h-5 text-warning" />
                Leave Quiz?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                You have answered {Object.keys(answers).length} out of {questions.length} questions. 
                If you leave now, your progress will be lost.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowExitConfirm(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted/50 transition-colors"
                >
                  Stay
                </button>
                <button
                  onClick={confirmExit}
                  className="flex-1 px-4 py-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-lg transition-colors"
                >
                  Leave Quiz
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
