'use client'

import Image from 'next/image'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getQuizQuestions, submitQuizAttempt } from '@/lib/database'
import { useAuth } from '@/contexts/AuthContext'
import { QuizQuestion, Quiz } from '@/lib/supabase'
import { H1, BodyLG } from '@/components/ui/Typography'
import { Container } from '@/components/ui/Layout'
import Icon from '@/components/ui/Icon'
import { logger } from '@/lib/logger'
import {
  Clock, ChevronLeft, ChevronRight, Flag, CheckCircle2, 
  AlertTriangle, Grid3X3, X, Eye, EyeOff, Volume2, 
  VolumeX, Pause, Play, RotateCcw, Save, Send, User
} from 'lucide-react'

interface Question {
  id: string
  question: string
  options: string[]
  correct_answer: number
  explanation?: string
  question_type: 'multiple_choice' | 'single_choice' | 'true_false' | 'fill_blank' | 'essay'
  points?: number
  media_url?: string
  media_type?: 'image' | 'audio' | 'video'
}

interface QuizState {
  answers: Record<string, any>
  flaggedQuestions: Set<string>
  timeSpent: Record<string, number> // seconds spent on each question
  visitedQuestions: Set<string>
  lastSaveTime: Date | null
}

export default function EnhancedTakeQuizPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [quizState, setQuizState] = useState<QuizState>({
    answers: {},
    flaggedQuestions: new Set(),
    timeSpent: {},
    visitedQuestions: new Set(),
    lastSaveTime: null
  })
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quizStarted, setQuizStarted] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [submitting, setSubmitting] = useState(false)
  const [autoSaving, setAutoSaving] = useState(false)
  const [showNavigator, setShowNavigator] = useState(false)
  const [reviewMode, setReviewMode] = useState(false)
  const [focusMode, setFocusMode] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)

  // Refs for timers and auto-save
  const timerRef = useRef<NodeJS.Timeout>()
  const autoSaveTimer = useRef<NodeJS.Timeout>()
  const questionStartTime = useRef<Date | null>(null)

  // Auto-save functionality
  const autoSave = useCallback(async () => {
    if (!user || !quiz || !quizStarted) return

    try {
      setAutoSaving(true)
      
      // Save to localStorage as backup
      const saveData = {
        ...quizState,
        flaggedQuestions: Array.from(quizState.flaggedQuestions),
        visitedQuestions: Array.from(quizState.visitedQuestions),
        currentQuestionIndex,
        timestamp: new Date().toISOString()
      }
      
      localStorage.setItem(`quiz-progress-${quiz.id}`, JSON.stringify(saveData))
      
      setQuizState(prev => ({
        ...prev,
        lastSaveTime: new Date()
      }))
    } catch (error) {
      logger.error('Auto-save failed:', error)
    } finally {
      setAutoSaving(false)
    }
  }, [user, quiz, quizStarted, quizState, currentQuestionIndex])

  // Set up auto-save timer
  useEffect(() => {
    if (quizStarted && Object.keys(quizState.answers).length > 0) {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current)
      }
      autoSaveTimer.current = setTimeout(autoSave, 10000) // Auto-save every 10 seconds
    }

    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current)
      }
    }
  }, [quizStarted, quizState.answers, autoSave])

  // Track time spent on current question
  useEffect(() => {
    if (quizStarted && questions.length > 0) {
      questionStartTime.current = new Date()
      
      return () => {
        if (questionStartTime.current) {
          const timeSpent = (new Date().getTime() - questionStartTime.current.getTime()) / 1000
          const questionId = questions[currentQuestionIndex]?.id
          if (questionId) {
            setQuizState(prev => ({
              ...prev,
              timeSpent: {
                ...prev.timeSpent,
                [questionId]: (prev.timeSpent[questionId] || 0) + timeSpent
              }
            }))
          }
        }
      }
    }
  }, [currentQuestionIndex, quizStarted, questions])

  // Load quiz and questions
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
          
          // Check for saved progress
          const savedProgress = localStorage.getItem(`quiz-progress-${data.quiz.id}`)
          if (savedProgress) {
            try {
              const progress = JSON.parse(savedProgress)
              setQuizState({
                ...progress,
                flaggedQuestions: new Set(progress.flaggedQuestions || []),
                visitedQuestions: new Set(progress.visitedQuestions || []),
                lastSaveTime: progress.lastSaveTime ? new Date(progress.lastSaveTime) : null
              })
              setCurrentQuestionIndex(progress.currentQuestionIndex || 0)
            } catch (err) {
              logger.error('Error loading saved progress:', err)
            }
          }
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

  // Start quiz
  const handleStartQuiz = () => {
    setQuizStarted(true)
    setStartTime(new Date())
    setQuizState(prev => ({
      ...prev,
      visitedQuestions: new Set(questions[0]?.id ? [questions[0].id] : [])
    }))
  }

  // Navigate between questions
  const navigateToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index)
      setQuizState(prev => {
        const questionId = questions[index]?.id
        if (!questionId) return prev
        
        return {
          ...prev,
          visitedQuestions: new Set([...prev.visitedQuestions, questionId])
        }
      })
    }
  }

  // Handle answer selection
  const handleAnswerChange = (questionId: string, answer: any) => {
    setQuizState(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionId]: answer
      }
    }))
  }

  // Toggle flag on question
  const toggleFlag = (questionId: string) => {
    setQuizState(prev => {
      const newFlagged = new Set(prev.flaggedQuestions)
      if (newFlagged.has(questionId)) {
        newFlagged.delete(questionId)
      } else {
        newFlagged.add(questionId)
      }
      return {
        ...prev,
        flaggedQuestions: newFlagged
      }
    })
  }

  // Submit quiz
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
        answers: quizState.answers,
        time_taken_seconds: timeTakenSeconds
      })
      
      if (submitError) {
        setError('Failed to submit quiz')
        logger.error('Error submitting quiz:', submitError)
      } else {
        // Clear saved progress
        localStorage.removeItem(`quiz-progress-${quiz?.id}`)
        
        // Redirect to results page
        router.push(`/quizzes/${params.id}/results/${data.id}`)
      }
    } catch (err) {
      logger.error('Error submitting quiz:', err)
      setError('Failed to submit quiz')
    } finally {
      setSubmitting(false)
    }
  }, [submitting, params.id, user, quizState.answers, router, startTime, quiz?.id])

  // Handle time up
  const handleTimeUp = useCallback(() => {
    if (soundEnabled) {
      // Play notification sound
      const audio = new Audio('/sounds/time-up.mp3')
      audio.play().catch(console.error)
    }
    handleSubmitQuiz()
  }, [soundEnabled, handleSubmitQuiz])

  // Timer functionality
  useEffect(() => {
    if (quizStarted && timeLeft > 0 && !reviewMode) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimeUp()
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
    }
  }, [quizStarted, timeLeft, reviewMode, handleTimeUp])

  // Format time display
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // Get timer color based on remaining time
  const getTimerColor = (): string => {
    if (!quiz) return 'text-gray-600'
    const totalTime = quiz.duration_minutes * 60
    const percentage = (timeLeft / totalTime) * 100
    
    if (percentage <= 10) return 'text-red-600'
    if (percentage <= 25) return 'text-amber-600'
    return 'text-gray-600'
  }

  // Calculate progress
  const progress = {
    answered: Object.keys(quizState.answers).length,
    total: questions.length,
    percentage: questions.length > 0 ? (Object.keys(quizState.answers).length / questions.length) * 100 : 0
  }

  if (loading) {
    return (
      <Container className="py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Loading quiz...</p>
          </div>
        </div>
      </Container>
    )
  }

  if (error) {
    return (
      <Container className="py-8">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Quiz</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/quizzes')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Quizzes
          </button>
        </div>
      </Container>
    )
  }

  if (!quiz || questions.length === 0) {
    return (
      <Container className="py-8">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Quiz Not Found</h1>
          <p className="text-gray-600 mb-4">The quiz you&apos;re looking for doesn&apos;t exist or has no questions.</p>
          <button
            onClick={() => router.push('/quizzes')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Quizzes
          </button>
        </div>
      </Container>
    )
  }

  // Pre-quiz start screen
  if (!quizStarted) {
    return (
      <Container className="py-8 max-w-4xl">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <H1 className="mb-4">{quiz.title}</H1>
            <BodyLG className="text-gray-600 mb-6">{quiz.description}</BodyLG>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Quiz Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Questions:</span>
                  <span className="font-medium">{questions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time Limit:</span>
                  <span className="font-medium">{quiz.duration_minutes} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Passing Score:</span>
                  <span className="font-medium">{quiz.passing_score || 70}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-medium capitalize">{quiz.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Difficulty:</span>
                  <span className="font-medium capitalize">{quiz.difficulty}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
                            <h3 className="font-semibold text-gray-900">Instructions</h3>
              <div className="text-sm text-gray-600 space-y-2">
                <>
                  <p>• Read each question carefully before selecting your answer</p>
                  <p>• You can navigate between questions using the sidebar</p>
                  <p>• Flag questions you want to review later</p>
                  <p>• Your progress is automatically saved</p>
                  {quiz.duration_minutes > 0 && (
                    <p>• You have {quiz.duration_minutes} minutes to complete this quiz</p>
                  )}
                </>
              </div>
            </div>
          </div>

          {quizState.lastSaveTime && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-blue-800">
                <Save className="h-4 w-4" />
                <span className="text-sm font-medium">Previous Progress Found</span>
              </div>
              <p className="text-sm text-blue-700 mt-1">
                You can continue from where you left off (saved {quizState.lastSaveTime.toLocaleString()})
              </p>
            </div>
          )}

          <div className="text-center">
            <button
              onClick={handleStartQuiz}
              className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              {quizState.lastSaveTime ? 'Continue Quiz' : 'Start Quiz'}
            </button>
          </div>
        </div>
      </Container>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const isAnswered = currentQuestion && quizState.answers[currentQuestion.id] !== undefined
  const isFlagged = currentQuestion && quizState.flaggedQuestions.has(currentQuestion.id)

  return (
    <div className={`min-h-screen bg-gray-50 ${focusMode ? 'bg-gray-900' : ''}`}>
      {/* Header */}
      <div className={`bg-white border-b border-gray-200 sticky top-0 z-40 ${focusMode ? 'bg-gray-800 border-gray-700' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className={`text-lg font-semibold ${focusMode ? 'text-white' : 'text-gray-900'}`}>
                {quiz.title}
              </h1>
              {!focusMode && (
                <div className="text-sm text-gray-500">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              {/* Auto-save status */}
              {autoSaving && (
                <div className="flex items-center gap-2 text-blue-600 text-sm">
                  <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-300 border-t-blue-600"></div>
                  Saving...
                </div>
              )}

              {/* Settings */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`p-2 rounded-lg transition-colors ${focusMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                  title={soundEnabled ? 'Disable sound' : 'Enable sound'}
                >
                  {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => setFocusMode(!focusMode)}
                  className={`p-2 rounded-lg transition-colors ${focusMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                  title={focusMode ? 'Exit focus mode' : 'Enter focus mode'}
                >
                  {focusMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Timer */}
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${focusMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <Clock className={`h-4 w-4 ${getTimerColor()}`} />
                <span className={`font-mono text-sm font-medium ${getTimerColor()}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>

              {/* Navigator toggle */}
              {!focusMode && (
                <button
                  onClick={() => setShowNavigator(!showNavigator)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Question navigator"
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="pb-2">
            <div className={`w-full bg-gray-200 rounded-full h-1 ${focusMode ? 'bg-gray-700' : ''}`}>
              <div
                className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Question Navigator Sidebar */}
          {showNavigator && !focusMode && (
            <div className="w-80 bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-fit sticky top-28">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Questions</h3>
                <button
                  onClick={() => setShowNavigator(false)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-5 gap-2 mb-6">
                {questions.map((question, index) => {
                  const isAnswered = quizState.answers[question.id] !== undefined
                  const isFlagged = quizState.flaggedQuestions.has(question.id)
                  const isVisited = quizState.visitedQuestions.has(question.id)
                  const isCurrent = index === currentQuestionIndex

                  return (
                    <button
                      key={question.id}
                      onClick={() => navigateToQuestion(index)}
                      className={`
                        relative w-10 h-10 rounded-lg text-xs font-medium transition-all
                        ${isCurrent 
                          ? 'bg-blue-600 text-white ring-2 ring-blue-300' 
                          : isAnswered
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : isVisited
                          ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }
                      `}
                      title={`Question ${index + 1}${isFlagged ? ' (Flagged)' : ''}`}
                    >
                      {index + 1}
                      {isFlagged && (
                        <Flag className="absolute -top-1 -right-1 h-3 w-3 text-red-500 fill-current" />
                      )}
                    </button>
                  )
                })}
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
                  <span>Answered ({progress.answered})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-amber-100 border border-amber-200 rounded"></div>
                  <span>Visited ({quizState.visitedQuestions.size})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded"></div>
                  <span>Not visited</span>
                </div>
                {quizState.flaggedQuestions.size > 0 && (
                  <div className="flex items-center gap-2">
                    <Flag className="h-3 w-3 text-red-500" />
                    <span>Flagged ({quizState.flaggedQuestions.size})</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 max-w-4xl">
            <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-8 ${focusMode ? 'bg-gray-800 border-gray-600' : ''}`}>
              {currentQuestion && (
                <div className="space-y-6">
                  {/* Question Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 text-sm font-medium rounded-full ${focusMode ? 'bg-blue-900 text-blue-300' : ''}`}>
                          {currentQuestionIndex + 1}
                        </span>
                        <div className="flex items-center gap-2">
                          {currentQuestion.points && (
                            <span className={`text-sm font-medium px-2 py-1 bg-gray-100 rounded-full ${focusMode ? 'bg-gray-700 text-gray-300' : 'text-gray-600'}`}>
                              {currentQuestion.points} {currentQuestion.points === 1 ? 'point' : 'points'}
                            </span>
                          )}
                          <button
                            onClick={() => toggleFlag(currentQuestion.id)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isFlagged 
                                ? 'text-red-500 bg-red-50 hover:bg-red-100' 
                                : focusMode
                                ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
                                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                            }`}
                            title={isFlagged ? 'Remove flag' : 'Flag for review'}
                          >
                            <Flag className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div 
                        className={`text-lg leading-relaxed ${focusMode ? 'text-white' : 'text-gray-900'}`}
                        dangerouslySetInnerHTML={{ __html: currentQuestion.question }}
                      />
                    </div>
                  </div>

                  {/* Media Content */}
                  {currentQuestion.media_url && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      {currentQuestion.media_type === 'image' && (
                        <Image
                          src={currentQuestion.media_url}
                          alt="Question media"
                          width={800}
                          height={600}
                          className="max-w-full h-auto rounded"
                        />
                      )}
                      {currentQuestion.media_type === 'audio' && (
                        <audio controls className="w-full">
                          <source src={currentQuestion.media_url} />
                          Your browser does not support the audio element.
                        </audio>
                      )}
                      {currentQuestion.media_type === 'video' && (
                        <video controls className="w-full max-w-2xl">
                          <source src={currentQuestion.media_url} />
                          Your browser does not support the video element.
                        </video>
                      )}
                    </div>
                  )}

                  {/* Answer Options */}
                  <div className="space-y-3">
                    {currentQuestion.question_type === 'fill_blank' && (
                      <div>
                        <input
                          type="text"
                          value={quizState.answers[currentQuestion.id] || ''}
                          onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                          className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${focusMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                          placeholder="Enter your answer..."
                        />
                      </div>
                    )}

                    {currentQuestion.question_type === 'essay' && (
                      <div>
                        <textarea
                          value={quizState.answers[currentQuestion.id] || ''}
                          onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                          rows={6}
                          className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y ${focusMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                          placeholder="Write your answer here..."
                        />
                      </div>
                    )}

                    {['multiple_choice', 'single_choice', 'true_false'].includes(currentQuestion.question_type) && (
                      <div className="space-y-2">
                        {currentQuestion.options.map((option, optionIndex) => {
                          const isSelected = currentQuestion.question_type === 'multiple_choice'
                            ? Array.isArray(quizState.answers[currentQuestion.id]) && 
                              quizState.answers[currentQuestion.id].includes(optionIndex)
                            : quizState.answers[currentQuestion.id] === optionIndex

                          return (
                            <label
                              key={optionIndex}
                              className={`
                                flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-all
                                ${isSelected 
                                  ? focusMode
                                    ? 'border-blue-500 bg-blue-900/20'
                                    : 'border-blue-300 bg-blue-50' 
                                  : focusMode
                                  ? 'border-gray-600 hover:border-gray-500 hover:bg-gray-700/50'
                                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }
                              `}
                            >
                              <input
                                type={currentQuestion.question_type === 'multiple_choice' ? 'checkbox' : 'radio'}
                                name={`question_${currentQuestion.id}`}
                                checked={isSelected}
                                onChange={() => {
                                  if (currentQuestion.question_type === 'multiple_choice') {
                                    const currentAnswers = Array.isArray(quizState.answers[currentQuestion.id]) 
                                      ? quizState.answers[currentQuestion.id] : []
                                    const newAnswers = currentAnswers.includes(optionIndex)
                                      ? currentAnswers.filter((i: number) => i !== optionIndex)
                                      : [...currentAnswers, optionIndex]
                                    handleAnswerChange(currentQuestion.id, newAnswers)
                                  } else {
                                    handleAnswerChange(currentQuestion.id, optionIndex)
                                  }
                                }}
                                className="mt-0.5 h-4 w-4 text-blue-600 focus:ring-blue-500"
                              />
                              <span className={`flex-1 ${focusMode ? 'text-white' : 'text-gray-900'}`}>
                                {option}
                              </span>
                            </label>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={() => navigateToQuestion(currentQuestionIndex - 1)}
                disabled={currentQuestionIndex === 0}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
                  ${currentQuestionIndex === 0 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : focusMode
                    ? 'text-gray-300 hover:bg-gray-700'
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>

              <div className="flex items-center gap-4">
                {!reviewMode && (
                  <button
                    onClick={() => setReviewMode(true)}
                    className={`flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors ${focusMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'text-gray-700'}`}
                  >
                    <Eye className="h-4 w-4" />
                    Review Answers
                  </button>
                )}

                {reviewMode && (
                  <button
                    onClick={() => setReviewMode(false)}
                    className={`flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors ${focusMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'text-gray-700'}`}
                  >
                    <X className="h-4 w-4" />
                    Exit Review
                  </button>
                )}

                <button
                  onClick={handleSubmitQuiz}
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-300 border-t-white"></div>
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Submit Quiz
                </button>
              </div>

              <button
                onClick={() => navigateToQuestion(currentQuestionIndex + 1)}
                disabled={currentQuestionIndex === questions.length - 1}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
                  ${currentQuestionIndex === questions.length - 1 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : focusMode
                    ? 'text-gray-300 hover:bg-gray-700'
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
