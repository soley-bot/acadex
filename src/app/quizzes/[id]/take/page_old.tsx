'use client'

import { logger } from '@/lib/logger'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getQuizQuestions, submitQuizAttempt } from '@/lib/database'
import { useAuth } from '@/contexts/AuthContext'
import { H1, H2, H3, H4, BodyLG, BodyMD } from '@/components/ui/Typography'
import Icon from '@/components/ui/Icon'
import { Container, Section, Grid, Flex } from '@/components/ui/Layout'

interface Question {
  id: string
  question: string
  options: string[]
  correct_answer: number
  explanation?: string
}

interface Quiz {
  id: string
  title: string
  duration_minutes: number
}

export default function TakeQuizPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [quizStarted, setQuizStarted] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }

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

    if (params.id) {
      fetchQuizQuestions()
    }
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

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }))
  }

  const getProgressPercentage = () => {
    const answeredQuestions = Object.keys(answers).length
    return (answeredQuestions / questions.length) * 100
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-secondary/10 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-warning/40 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-secondary/40 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="relative flex items-center justify-center py-20 pt-32">
          <div className="text-center p-8 sm:p-12 rounded-3xl backdrop-blur-lg bg-white/80 border border-white/20 shadow-2xl">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-200 border-t-red-600 mx-auto mb-6"></div>
            <BodyLG>Loading quiz...</BodyLG>
          </div>
        </div>
      </div>
    )
  }

  if (error || !quiz || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-secondary/10 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-warning/40 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-secondary/40 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
        
        <Container size="sm" className="py-12 sm:py-20 pt-20 sm:pt-24">
          <div className="p-8 sm:p-12 rounded-3xl backdrop-blur-lg bg-white/80 border border-white/20 shadow-2xl text-center">
            <H1 className="mb-4 sm:mb-6 text-primary">Unable to Load Quiz</H1>
            <BodyLG className="mb-6 sm:mb-8" color="muted">{error || 'The quiz questions could not be loaded.'}</BodyLG>
            <button
              onClick={() => router.push('/quizzes')}
              className="w-full sm:w-auto bg-gradient-to-r from-primary/5 via-white to-secondary/5 text-gray-900 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold text-base sm:text-lg transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105"
            >
              Back to Quizzes
            </button>
          </div>
        </Container>
      </div>
    )
  }

  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-secondary/10 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-warning/40 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-secondary/40 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
        
        <Container size="sm" className="py-12 sm:py-20 pt-20 sm:pt-24">
          <div className="p-8 sm:p-12 rounded-3xl backdrop-blur-lg bg-white/80 border border-white/20 shadow-2xl text-center">
            <div className="inline-block p-4 bg-gradient-to-r from-primary to-warning rounded-2xl mb-6">
              <Icon name="target" size={32} color="white" />
            </div>
            <H1 className="mb-4 sm:mb-6 text-primary">{quiz.title}</H1>
            <BodyLG className="mb-6 sm:mb-8" color="muted">
              You have <span className="font-bold bg-gradient-to-r from-primary/5 via-white to-secondary/5 bg-clip-text text-transparent">{quiz.duration_minutes} minutes</span> to complete this quiz
            </BodyLG>
            <button
              onClick={() => {
                setQuizStarted(true)
                setStartTime(new Date())
              }}
              className="w-full sm:w-auto bg-gradient-to-r from-primary/5 via-white to-secondary/5 text-gray-900 px-8 sm:px-12 py-4 rounded-2xl font-bold text-lg sm:text-xl transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105"
            >
              <span className="flex items-center gap-3 justify-center">
                <Icon name="rocket" size={24} color="white" />
                Start Quiz
              </span>
            </button>
          </div>
        </Container>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-secondary/10 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-warning/40 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-secondary/40 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>
      
      {/* Quiz Header */}
      <div className="relative pt-16 backdrop-blur-lg bg-white/80 border-b border-white/20 shadow-2xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gradient-to-r from-primary to-warning rounded-full animate-pulse"></div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-800 truncate">{quiz.title}</h1>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:gap-6 w-full sm:w-auto">
              <div className="text-base sm:text-lg font-mono font-bold text-gray-900 bg-gradient-to-r from-primary/5 via-white to-secondary/5 px-4 sm:px-6 py-3 rounded-2xl border border-gray-200 backdrop-blur-lg shadow-2xl flex-shrink-0">
                {formatTime(timeLeft)}
              </div>
              <div className="text-xs sm:text-sm text-gray-700 bg-white/60 backdrop-blur-lg px-3 sm:px-4 py-2 rounded-xl border border-white/30 whitespace-nowrap">
                Question {currentQuestionIndex + 1} of {questions.length}
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm text-gray-700 mb-3">
              <span className="font-medium">Progress</span>
              <span className="font-bold">{Math.round(getProgressPercentage())}% Complete</span>
            </div>
            <div className="w-full bg-white/40 backdrop-blur-sm rounded-full h-4 border border-white/30 shadow-inner">
              <div 
                className="bg-gradient-to-r from-primary to-warning h-4 rounded-full transition-all duration-500 shadow-lg"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Mobile Navigation Layout - Above Question Card */}
        <div className="flex flex-col gap-3 mb-4 sm:hidden">
          {/* Mini Question Navigator - Top */}
          <div className="p-3 rounded-xl backdrop-blur-lg bg-white/80 border border-white/20 shadow-md">
            <div className="grid grid-cols-8 gap-2">
              {questions.slice(0, 8).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`w-7 h-7 rounded-lg font-bold text-xs transition-all duration-300 border ${
                    index === currentQuestionIndex
                      ? 'bg-gradient-to-r from-primary to-warning text-gray-900 transform scale-110 border-primary z-10 relative shadow-lg'
                      : answers[questions[index]?.id ?? ''] !== undefined
                      ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-300'
                      : 'bg-white/60 text-gray-600 border-gray-300'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            {questions.length > 8 && (
              <div className="text-xs text-gray-600 text-center mt-2">
                Showing first 8 questions • {questions.length} total
              </div>
            )}
          </div>
          
          {/* Navigation Buttons - Below Navigator */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className="flex-1 backdrop-blur-lg bg-white/80 border-2 border-gray-300 text-gray-800 hover:bg-white hover:border-gray-400 px-3 py-2 rounded-xl font-medium text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg disabled:hover:bg-white/80 disabled:hover:border-gray-300"
            >
              ← Previous
            </button>

            {currentQuestionIndex === questions.length - 1 ? (
              <button
                onClick={handleSubmitQuiz}
                disabled={submitting}
                className="flex-1 bg-gradient-to-r from-primary/5 via-white to-secondary/5 text-gray-900 px-3 py-2 rounded-xl font-medium text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  'Submitting...'
                ) : (
                  <>
                    <Icon name="check" size={14} color="white" />
                    Submit
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                className="flex-1 bg-gradient-to-r from-primary/5 via-white to-secondary/5 text-secondary px-3 py-2 rounded-xl font-medium text-sm transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Next →
              </button>
            )}
          </div>
        </div>

        {/* Current Question */}
        <div className="p-4 sm:p-8 lg:p-10 mb-6 sm:mb-8 rounded-3xl backdrop-blur-lg bg-white/80 border border-white/20 shadow-2xl">
          {currentQuestion ? (
            <>
              <div className="flex items-center gap-3 mb-4 sm:mb-8">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-primary to-warning rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {currentQuestionIndex + 1}
                </div>
                <span className="text-sm sm:text-base font-medium text-gray-600 bg-white/60 px-4 py-2 rounded-full border border-gray-200">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
              </div>
              
              <h2 className="text-xl sm:text-3xl font-bold text-gray-800 mb-6 sm:mb-10 leading-relaxed">
                {currentQuestion.question}
              </h2>
              
              <div className="space-y-3 sm:space-y-6">
                {currentQuestion?.options?.map((option, index) => (
                  <label
                    key={index}
                    className={`group flex items-start gap-3 sm:gap-6 p-4 sm:p-8 border-2 rounded-2xl cursor-pointer transition-all duration-300 backdrop-blur-sm ${
                      answers[currentQuestion?.id ?? ''] === index
                        ? 'border-primary bg-gradient-to-r from-red-50/80 to-orange-50/80 shadow-xl scale-105'
                        : 'border-white/30 bg-white/40 hover:border-red-300 hover:bg-white/60 hover:shadow-lg hover:scale-102'
                    }`}
                  >
                    <div className={`relative flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 transition-all ${
                      answers[currentQuestion?.id ?? ''] === index
                        ? 'border-primary bg-gradient-to-r from-primary to-warning shadow-lg'
                        : 'border-gray-400 group-hover:border-primary bg-white'
                    }`}>
                      {answers[currentQuestion?.id ?? ''] === index && (
                        <div className="w-3 h-3 bg-white rounded-full shadow-sm"></div>
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
                    <span className="text-base sm:text-xl text-gray-800 leading-relaxed flex-1 font-medium">
                      {option}
                    </span>
                  </label>
                ))}
              </div>
            </>
          ) : (
            <div className="text-gray-600 text-lg text-center py-12">No question found.</div>
          )}
        </div>

        {/* Desktop Navigation */}
        <div className="hidden sm:flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
          <button
            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
            className="w-full sm:w-auto backdrop-blur-lg bg-white/80 border-2 border-gray-300 text-gray-800 hover:bg-white hover:border-gray-400 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl disabled:hover:bg-white/80 disabled:hover:border-gray-300 min-w-[140px]"
          >
            ← Previous
          </button>

          <div className="flex items-center gap-4 w-full sm:w-auto">
            {currentQuestionIndex === questions.length - 1 ? (
              <button
                onClick={handleSubmitQuiz}
                disabled={submitting}
                className="w-full sm:w-auto bg-gradient-to-r from-primary/5 via-white to-secondary/5 text-gray-900 px-10 py-4 rounded-2xl font-bold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl hover:shadow-3xl transform hover:scale-105 min-w-[140px] flex items-center justify-center gap-2"
              >
                {submitting ? (
                  'Submitting...'
                ) : (
                  <>
                    <Icon name="check" size={16} color="white" />
                    Submit Quiz
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                className="w-full sm:w-auto bg-gradient-to-r from-primary/5 via-white to-secondary/5 text-secondary px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105 min-w-[140px]"
              >
                Next →
              </button>
            )}
          </div>
        </div>

        {/* Question Navigator - Desktop Only */}
        <div className="hidden lg:block p-6 sm:p-8 lg:p-10 rounded-3xl backdrop-blur-lg bg-white/80 border border-white/20 shadow-2xl">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 sm:mb-8 flex items-center gap-3">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-primary to-warning rounded-xl flex items-center justify-center">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full"></div>
            </div>
            Question Navigator
          </h3>
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-3 sm:gap-4">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl font-bold text-sm sm:text-base transition-all duration-300 border-2 shadow-lg ${
                  index === currentQuestionIndex
                    ? 'bg-gradient-to-r from-primary to-warning text-gray-900 transform scale-110 border-primary z-10 relative shadow-2xl'
                    : answers[questions[index]?.id ?? ''] !== undefined
                    ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-300 hover:bg-gradient-to-r hover:from-green-200 hover:to-emerald-200 hover:border-green-400 hover:scale-105'
                    : 'bg-white/60 text-gray-600 border-gray-300 hover:bg-white hover:text-gray-800 hover:border-gray-400 hover:scale-105'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 mt-6 sm:mt-8 text-sm sm:text-base bg-gradient-to-r from-gray-50/80 to-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/30">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-r from-primary to-warning rounded-xl shadow-lg flex items-center justify-center">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full"></div>
              </div>
              <span className="text-gray-700 font-medium">Current</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-300 rounded-xl shadow-sm"></div>
              <span className="text-gray-700 font-medium">Answered</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 sm:w-7 sm:h-7 bg-white/60 border-2 border-gray-300 rounded-xl shadow-sm"></div>
              <span className="text-gray-700 font-medium">Unanswered</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
