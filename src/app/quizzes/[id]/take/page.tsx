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
  const [showExitConfirm, setShowExitConfirm] = useState(false)

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

  // ✅ MISSING FUNCTION: Handle answer changes for all question types
  const handleAnswerChange = useCallback((questionId: string, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }, [])

  // ✅ MISSING FUNCTION: Handle answer selection for multiple choice/true-false
  const handleAnswerSelect = useCallback((questionId: string, selectedIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: selectedIndex
    }))
  }, [])

  // ✅ MISSING HELPER: Get current question (must be declared before functions that use it)
  const currentQuestion = questions[currentQuestionIndex]

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    if (!params.id) return

    const fetchQuizQuestions = async () => {
      try {
        setLoading(true)
        const { data, error: fetchError } = await getQuizQuestions(params.id as string)
        
        if (fetchError) {
          setError('Failed to load quiz questions')
          logger.error('Error fetching quiz questions:', fetchError)
        } else {
          setQuestions(data.questions || [])
          setQuiz(data.quiz)
          setTimeLeft(data.quiz.duration_minutes * 60) // Convert to seconds
        }
      } catch (err) {
        logger.error('Error fetching quiz questions:', err)
        setError('Failed to load quiz questions')
      } finally {
        setLoading(false)
      }
    }

    fetchQuizQuestions()
  }, [params.id, user, router])

  const handleSubmitQuiz = useCallback(async () => {
    if (submitting) return

    try {
      setSubmitting(true)
      // Calculate time taken in seconds
      const endTime = new Date()
      const timeTakenSeconds = startTime ? Math.round((endTime.getTime() - startTime.getTime()) / 1000) : 0
      const { data, error: submitError } = await submitQuizAttempt({
        quiz_id: params.id as string,
        user_id: user!.id,
        answers,
        time_taken_seconds: timeTakenSeconds
      })
      if (submitError) {
        setError('Failed to submit quiz')
        logger.error('Error submitting quiz:', submitError)
      } else {
        // Redirect to results page
        router.push(`/quizzes/${params.id}/results/${data.id}`)
      }
    } catch (err) {
      logger.error('Error submitting quiz:', err)
      setError('Failed to submit quiz')
    } finally {
      setSubmitting(false)
    }
  }, [submitting, params.id, user, answers, router, startTime])

  // Timer effect
  useEffect(() => {
    if (!quizStarted || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmitQuiz()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [quizStarted, timeLeft, handleSubmitQuiz])

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

  const getProgressPercentage = () => {
    const answeredQuestions = Object.keys(answers).length
    return (answeredQuestions / questions.length) * 100
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-4">
          <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center p-4">
            <Card variant="glass" className="max-w-md w-full">
              <div className="p-8 text-center">
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
                  className="w-full bg-primary hover:bg-secondary text-white hover:text-black px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
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
              className="w-full bg-primary hover:bg-secondary text-white hover:text-black px-6 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
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
      <div className="max-w-3xl mx-auto px-4 py-3 relative">
        {/* Back Navigation */}
        <div className="mb-3">
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

        {/* Progress Bar - Optimized Spacing */}
        <div className="mb-6 bg-white/90 backdrop-blur-lg rounded-xl p-4 shadow-lg border border-white/20">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
            <span className="font-semibold">Question {currentQuestionIndex + 1} of {questions.length}</span>
            <div className="flex items-center gap-3">
              <span className="font-medium">{Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% Complete</span>
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
          <div className="w-full bg-muted/60 rounded-full h-3 shadow-inner">
            <div 
              className="bg-primary h-3 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Main Quiz Content - Optimized Spacing */}
        <div className="bg-white/95 rounded-xl p-5 shadow-lg border border-white/20">
          {currentQuestion ? (
            <>
              {/* Question - Compact Typography */}
              <div className="mb-6">
                <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg p-4 mb-4">
                  <h2 className="text-xl font-semibold text-foreground leading-relaxed">
                    {currentQuestion.question}
                  </h2>
                </div>
              </div>
              
              {/* Answer Options - Compact Spacing */}
              <div className="space-y-2 mb-5">
                {/* Multiple Choice / Single Choice */}
                {(currentQuestion.question_type === 'multiple_choice' || currentQuestion.question_type === 'single_choice') && Array.isArray(currentQuestion.options) && (
                  <>
                    {(currentQuestion.options as string[]).map((option, index) => (
                      <label
                        key={index}
                        className={`flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                          answers[currentQuestion?.id ?? ''] === index
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 bg-white hover:border-red-300 hover:bg-red-25'
                        }`}
                      >
                        <div className={`flex items-center justify-center w-5 h-5 rounded-full border-2 transition-all ${
                          answers[currentQuestion?.id ?? ''] === index
                            ? 'border-primary bg-primary/50'
                            : 'border-gray-400 bg-white'
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
                          onChange={() => currentQuestion && handleAnswerSelect(currentQuestion.id, index)}
                          className="sr-only"
                        />
                        <span className="text-base text-gray-800 flex-1">
                          {option}
                        </span>
                      </label>
                    ))}
                  </>
                )}

                {/* True/False */}
                {currentQuestion.question_type === 'true_false' && (
                  <>
                    {['True', 'False'].map((option, index) => (
                      <label
                        key={index}
                        className={`flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                          answers[currentQuestion?.id ?? ''] === index
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 bg-white hover:border-red-300 hover:bg-red-25'
                        }`}
                      >
                        <div className={`flex items-center justify-center w-5 h-5 rounded-full border-2 transition-all ${
                          answers[currentQuestion?.id ?? ''] === index
                            ? 'border-primary bg-primary/50'
                            : 'border-gray-400 bg-white'
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
                          onChange={() => currentQuestion && handleAnswerSelect(currentQuestion.id, index)}
                          className="sr-only"
                        />
                        <span className="text-base text-gray-800 flex-1 font-medium">
                          {option}
                        </span>
                      </label>
                    ))}
                  </>
                )}

                {/* Fill in the Blank */}
                {currentQuestion.question_type === 'fill_blank' && (
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Type your answer here..."
                      value={answers[currentQuestion?.id ?? ''] || ''}
                      onChange={(e) => currentQuestion && handleAnswerChange(currentQuestion.id, e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none transition-all text-base"
                    />
                  </div>
                )}

                {/* Essay */}
                {currentQuestion.question_type === 'essay' && (
                  <div className="space-y-3">
                    <textarea
                      placeholder="Write your essay answer here..."
                      value={answers[currentQuestion?.id ?? ''] || ''}
                      onChange={(e) => currentQuestion && handleAnswerChange(currentQuestion.id, e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none transition-all text-base resize-vertical min-h-28"
                      rows={3}
                    />
                    <p className="text-xs text-gray-500">Take your time to provide a detailed answer.</p>
                  </div>
                )}

                {/* Matching - Interactive Drag & Drop Style */}
                {currentQuestion.question_type === 'matching' && Array.isArray(currentQuestion.options) && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 mb-4">
                      <strong>Instructions:</strong> Click on items from the right column to match them with items on the left.
                    </p>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                      {/* Left Column - Items to match */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-800 text-sm border-b border-gray-300 pb-2">Items to Match:</h4>
                        {(currentQuestion.options as Array<{left: string; right: string}>).map((pair, index) => {
                          const currentAnswer = answers[currentQuestion?.id ?? ''] || {};
                          const isMatched = currentAnswer[index] !== undefined;
                          const matchedWith = currentAnswer[index];
                          
                          return (
                            <div 
                              key={index} 
                              className={`p-3 border-2 rounded-lg transition-all ${
                                isMatched 
                                  ? 'border-green-400 bg-green-50' 
                                  : 'border-blue-200 bg-blue-50'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-800">
                                  {index + 1}. {pair.left}
                                </span>
                                {isMatched && (
                                  <span className="text-xs text-green-600 font-medium">
                                    → {String.fromCharCode(65 + matchedWith)}
                                  </span>
                                )}
                              </div>
                              {isMatched && (
                                <div className="mt-2 text-xs text-green-700 bg-green-100 p-2 rounded">
                                  Matched with: {(currentQuestion.options as Array<{left: string; right: string}>)[matchedWith]?.right}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Right Column - Answer options */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-800 text-sm border-b border-gray-300 pb-2">Match Options:</h4>
                        {(currentQuestion.options as Array<{left: string; right: string}>).map((pair, rightIndex) => {
                          const currentAnswer = answers[currentQuestion?.id ?? ''] || {};
                          const isUsed = Object.values(currentAnswer).includes(rightIndex);
                          
                          return (
                            <button
                              key={rightIndex}
                              onClick={() => {
                                if (!currentQuestion) return;
                                const newAnswer = { ...(answers[currentQuestion.id] || {}) };
                                
                                // Find if this right option is already used
                                const usedByIndex = Object.keys(newAnswer).find(key => newAnswer[key] === rightIndex);
                                if (usedByIndex) {
                                  // Remove the existing match
                                  delete newAnswer[usedByIndex];
                                } else {
                                  // Find the next unmatched left item
                                  const nextUnmatched = (currentQuestion.options as Array<{left: string; right: string}>)
                                    .findIndex((_, leftIndex) => newAnswer[leftIndex] === undefined);
                                  
                                  if (nextUnmatched !== -1) {
                                    newAnswer[nextUnmatched] = rightIndex;
                                  }
                                }
                                
                                handleAnswerChange(currentQuestion.id, newAnswer);
                              }}
                              className={`w-full text-left p-3 border-2 rounded-lg transition-all ${
                                isUsed
                                  ? 'border-green-400 bg-green-100 text-green-800'
                                  : 'border-gray-300 bg-white hover:border-primary hover:bg-primary/5'
                              }`}
                            >
                              <span className="text-sm font-medium">
                                {String.fromCharCode(65 + rightIndex)}. {pair.right}
                              </span>
                              {isUsed && (
                                <span className="text-xs text-green-600 ml-2">✓ Used</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
                      💡 Click options from the right to match them with items on the left in order.
                    </p>
                  </div>
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
                            <p className="text-sm text-gray-600 mb-4">
                              <strong>Instructions:</strong> Click words to add/remove, drag blue words to reorder.
                            </p>
                            
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
                            
                            <p className="text-xs text-gray-500 bg-yellow-50 p-2 rounded">
                              💡 Click gray words to add them, click blue words to remove them, drag blue words to reorder.
                            </p>
                          </>
                        );
                      } else {
                        // List Ordering with Drag & Drop
                        return (
                          <>
                            <p className="text-sm text-gray-600 mb-4">
                              <strong>Instructions:</strong> Drag items to arrange them in the correct order.
                            </p>
                            
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
                            
                            <p className="text-xs text-gray-500 bg-yellow-50 p-2 rounded">
                              💡 Drag items within the ordered list to rearrange, or click to add/remove them.
                            </p>
                          </>
                        );
                      }
                    })()}
                  </div>
                )}
              </div>

              {/* Navigation - Compact Design */}
              <div className="flex items-center justify-between gap-2 sm:gap-3 pt-3 border-t border-gray-200">
                {/* Previous Button */}
                <button
                  onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="px-2 sm:px-4 py-2 bg-muted/40 text-gray-700 rounded-lg font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted/60"
                >
                  <span className="hidden sm:inline">← Previous</span>
                  <span className="sm:hidden">←</span>
                </button>

                {/* Question Navigator Dots - Mobile: Show only nearby questions */}
                <div className="flex items-center gap-1 overflow-hidden">
                  {/* Mobile view: Show current +/- 2 questions */}
                  <div className="flex sm:hidden items-center gap-1">
                    {questions.slice(
                      Math.max(0, currentQuestionIndex - 2),
                      Math.min(questions.length, currentQuestionIndex + 3)
                    ).map((_, relativeIndex) => {
                      const actualIndex = Math.max(0, currentQuestionIndex - 2) + relativeIndex;
                      return (
                        <button
                          key={actualIndex}
                          onClick={() => setCurrentQuestionIndex(actualIndex)}
                          className={`w-6 h-6 rounded-full text-xs font-medium transition-all flex-shrink-0 ${
                            actualIndex === currentQuestionIndex
                              ? 'bg-primary text-white'
                              : answers[questions[actualIndex]?.id ?? ''] !== undefined
                              ? 'bg-green-100 text-green-700 border border-green-300'
                              : 'bg-muted/40 text-gray-600'
                          }`}
                        >
                          {actualIndex + 1}
                        </button>
                      )
                    })}
                    {/* Show dots if there are more questions */}
                    {currentQuestionIndex + 3 < questions.length && (
                      <span className="text-gray-400 text-xs px-1">...</span>
                    )}
                  </div>

                  {/* Desktop view: Show all questions */}
                  <div className="hidden sm:flex items-center gap-1 overflow-x-auto max-w-xs">
                    {questions.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentQuestionIndex(index)}
                        className={`w-6 h-6 rounded-full text-xs font-medium transition-all flex-shrink-0 ${
                          index === currentQuestionIndex
                            ? 'bg-primary text-white'
                            : answers[questions[index]?.id ?? ''] !== undefined
                            ? 'bg-green-100 text-green-700 border border-green-300'
                            : 'bg-muted/40 text-gray-600 hover:bg-muted/60'
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Next/Submit Button */}
                {currentQuestionIndex === questions.length - 1 ? (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={submitting}
                    className="px-2 sm:px-4 py-2 bg-primary hover:bg-secondary text-white hover:text-black rounded-lg font-medium text-sm transition-all disabled:opacity-50 flex items-center gap-1 sm:gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span className="hidden sm:inline">Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 text-white" />
                        <span className="hidden sm:inline">Submit</span>
                        <span className="sm:hidden">Submit</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                    className="px-2 sm:px-4 py-2 bg-primary hover:bg-secondary text-white hover:text-black rounded-lg font-medium text-sm transition-all"
                  >
                    <span className="hidden sm:inline">Next →</span>
                    <span className="sm:hidden">→</span>
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
