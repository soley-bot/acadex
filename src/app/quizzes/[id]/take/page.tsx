'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getQuizQuestions, submitQuizAttempt } from '@/lib/database'
import { useAuth } from '@/contexts/AuthContext'
import { QuizQuestion, Quiz } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Target, Move, Check } from 'lucide-react'
import { logger } from '@/lib/logger'
import Header from '@/components/Header'
import { Footer } from '@/components/Footer'

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

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }))
  }

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
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

  const currentQuestion = questions[currentQuestionIndex];

  // Active quiz session - no global navigation for cognitive load reduction
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 py-4 relative">
        {/* Compact Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-foreground mb-2">{quiz?.title || 'Quiz'}</h1>
          {quiz?.description && (
            <p className="text-base text-muted-foreground bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl inline-block border border-white/20">
              {quiz.description}
            </p>
          )}
        </div>

        {/* Progress Bar - Enhanced */}
        <div className="mb-8 bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
            <span className="font-semibold text-lg">Question {currentQuestionIndex + 1} of {questions.length}</span>
            <div className="flex items-center gap-4">
              <span className="font-medium">{Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% Complete</span>
              {timeLeft > 0 && (
                <span className={`font-bold px-3 py-1 rounded-lg border ${
                  timeLeft <= 60 ? 'bg-destructive text-destructive-foreground border-destructive' : 
                  timeLeft <= 300 ? 'bg-warning text-warning-foreground border-warning' : 
                  'bg-muted text-muted-foreground border-border'
                }`}>
                  {formatTime(timeLeft)}
                </span>
              )}
            </div>
          </div>
          <div className="w-full bg-muted/60 rounded-full h-4 shadow-inner">
            <div 
              className="bg-primary h-4 rounded-full transition-all duration-500 shadow-lg"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Main Quiz Content - Enhanced */}
        <div className="bg-white/95 rounded-2xl p-6 sm:p-8 shadow-xl border border-white/20">
          {currentQuestion ? (
            <>
              {/* Question - Enhanced Typography */}
              <div className="mb-8">
                <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl p-6 mb-6">
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground leading-relaxed">
                    {currentQuestion.question}
                  </h2>
                </div>
              </div>
              
              {/* Answer Options - Support All Question Types */}
              <div className="space-y-3 mb-6">
                {/* Multiple Choice / Single Choice */}
                {(currentQuestion.question_type === 'multiple_choice' || currentQuestion.question_type === 'single_choice') && Array.isArray(currentQuestion.options) && (
                  <>
                    {(currentQuestion.options as string[]).map((option, index) => (
                      <label
                        key={index}
                        className={`flex items-start gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
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
                        <span className="text-sm sm:text-base text-gray-800 flex-1">
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
                        className={`flex items-start gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
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
                        <span className="text-sm sm:text-base text-gray-800 flex-1 font-medium">
                          {option}
                        </span>
                      </label>
                    ))}
                  </>
                )}

                {/* Fill in the Blank */}
                {currentQuestion.question_type === 'fill_blank' && (
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Type your answer here..."
                      value={answers[currentQuestion?.id ?? ''] || ''}
                      onChange={(e) => currentQuestion && handleAnswerChange(currentQuestion.id, e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-all text-sm sm:text-base"
                    />
                  </div>
                )}

                {/* Essay */}
                {currentQuestion.question_type === 'essay' && (
                  <div className="space-y-4">
                    <textarea
                      placeholder="Write your essay answer here..."
                      value={answers[currentQuestion?.id ?? ''] || ''}
                      onChange={(e) => currentQuestion && handleAnswerChange(currentQuestion.id, e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-all text-sm sm:text-base resize-vertical min-h-32"
                      rows={4}
                    />
                    <p className="text-xs text-gray-500">Take your time to provide a detailed answer.</p>
                  </div>
                )}

                {/* Matching */}
                {currentQuestion.question_type === 'matching' && Array.isArray(currentQuestion.options) && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 mb-4">Match the items from the left column with the correct items from the right column:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-700 text-sm">Left Column:</h4>
                        {(currentQuestion.options as Array<{left: string; right: string}>).map((pair, index) => (
                          <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <span className="text-sm font-medium">{index + 1}. {pair.left}</span>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-700 text-sm">Right Column (Select matches):</h4>
                        {(currentQuestion.options as Array<{left: string; right: string}>).map((pair, index) => (
                          <label key={index} className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg cursor-pointer hover:bg-green-100">
                            <input
                              type="checkbox"
                              checked={(answers[currentQuestion?.id ?? ''] || []).includes(index)}
                              onChange={(e) => {
                                if (!currentQuestion) return;
                                const currentAnswers = answers[currentQuestion.id] || [];
                                if (e.target.checked) {
                                  handleAnswerChange(currentQuestion.id, [...currentAnswers, index]);
                                } else {
                                  handleAnswerChange(currentQuestion.id, currentAnswers.filter((i: number) => i !== index));
                                }
                              }}
                              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-red-500"
                            />
                            <span className="text-sm">{String.fromCharCode(65 + index)}. {pair.right}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Ordering */}
                {currentQuestion.question_type === 'ordering' && Array.isArray(currentQuestion.options) && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 mb-4">Drag and drop the items to arrange them in the correct order:</p>
                    <div className="space-y-2">
                      {(currentQuestion.options as string[]).map((option, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg cursor-move hover:bg-muted/40 transition-all"
                        >
                          <div className="flex items-center justify-center w-6 h-6 bg-gray-600 text-white text-xs font-bold rounded">
                            {index + 1}
                          </div>
                          <span className="text-sm flex-1">{option}</span>
                          <div className="text-gray-400">
                            <Move className="w-4 h-4" />
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">Note: Drag functionality will be enhanced in future updates.</p>
                  </div>
                )}
              </div>

              {/* Navigation - Always Visible */}
              <div className="flex items-center justify-between gap-2 sm:gap-3 pt-4 border-t border-gray-200">
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
    </div>
  )
}
