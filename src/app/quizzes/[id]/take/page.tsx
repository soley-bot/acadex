'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getQuizQuestions, submitQuizAttempt } from '@/lib/database'
import { useAuth } from '@/contexts/AuthContext'

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
      router.push('/login')
      return
    }

    const fetchQuizQuestions = async () => {
      try {
        setLoading(true)
        const { data, error: fetchError } = await getQuizQuestions(params.id as string)
        
        if (fetchError) {
          setError('Failed to load quiz questions')
          console.error('Error fetching quiz questions:', fetchError)
        } else {
          setQuestions(data.questions || [])
          setQuiz(data.quiz)
          setTimeLeft(data.quiz.duration_minutes * 60) // Convert to seconds
        }
      } catch (err) {
        console.error('Error fetching quiz questions:', err)
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
        console.error('Error submitting quiz:', submitError)
      } else {
        // Redirect to results page
        router.push(`/quizzes/${params.id}/results/${data.id}`)
      }
    } catch (err) {
      console.error('Error submitting quiz:', err)
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
      <div className="min-h-screen bg-white">
        <div className="flex items-center justify-center py-20 pt-24">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (error || !quiz || questions.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 py-20 pt-24 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Unable to Load Quiz</h1>
          <p className="text-gray-600 mb-8">{error || 'The quiz questions could not be loaded.'}</p>
          <button
            onClick={() => router.push('/quizzes')}
            className="bg-brand text-brand-foreground px-6 py-3 rounded-lg hover:bg-brand/90 transition-colors"
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    )
  }

  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 py-20 pt-24 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{quiz.title}</h1>
          <p className="text-gray-600 mb-8">You have {quiz.duration_minutes} minutes to complete this quiz</p>
          <button
            onClick={() => {
              setQuizStarted(true)
              setStartTime(new Date())
            }}
            className="bg-brand text-brand-foreground px-8 py-4 rounded-lg font-semibold text-lg hover:bg-brand/90 transition-colors"
          >
            Start Quiz
          </button>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Quiz Header */}
      <div className="bg-white border-b pt-16">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <span className="text-lg font-inter tracking-tight">
                  <span className="font-light text-black">ACAD</span>
                  <span className="font-bold text-[#ff5757]">EX</span>
                </span>
              </Link>
              <span className="text-gray-300">|</span>
              <h1 className="text-xl font-bold text-gray-900">{quiz.title}</h1>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-lg font-mono font-bold text-brand">
                {formatTime(timeLeft)}
              </div>
              <div className="text-sm text-gray-600">
                Question {currentQuestionIndex + 1} of {questions.length}
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gray-900 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Current Question */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          {currentQuestion ? (
            <>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                {currentQuestion.question}
              </h2>
              <div className="space-y-4">
                {currentQuestion?.options?.map((option, index) => (
                  <label
                    key={index}
                    className={`flex items-start gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                      answers[currentQuestion?.id ?? ''] === index
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion?.id ?? ''}`}
                      value={index}
                      checked={answers[currentQuestion?.id ?? ''] === index}
                      onChange={() => currentQuestion && handleAnswerSelect(currentQuestion.id, index)}
                      className="mt-0.5 text-blue-600"
                    />
                    <span className="text-gray-900">{option}</span>
                  </label>
                ))}
              </div>
            </>
          ) : (
            <div className="text-gray-500">No question found.</div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <div className="flex items-center gap-4">
            {currentQuestionIndex === questions.length - 1 ? (
              <button
                onClick={handleSubmitQuiz}
                disabled={submitting}
                className="px-8 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit Quiz'}
              </button>
            ) : (
              <button
                onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                className="px-6 py-3 bg-brand text-brand-foreground rounded-lg font-medium hover:bg-brand/90 transition-colors"
              >
                Next
              </button>
            )}
          </div>
        </div>

        {/* Question Navigator */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Question Navigator</h3>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-10 h-10 rounded-lg font-medium text-sm transition-colors ${
                  index === currentQuestionIndex
                    ? 'bg-brand text-brand-foreground'
                    : answers[questions[index]?.id ?? ''] !== undefined
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-brand rounded"></div>
              <span className="text-gray-600">Current</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
              <span className="text-gray-600">Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
              <span className="text-gray-600">Unanswered</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
