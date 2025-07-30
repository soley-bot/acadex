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
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading quiz...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !quiz || questions.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-2xl mx-auto py-20 pt-24 text-center px-6">
          <h1 className="text-3xl font-black text-black mb-4">Unable to Load Quiz</h1>
          <p className="text-lg text-gray-600 mb-8">{error || 'The quiz questions could not be loaded.'}</p>
          <button
            onClick={() => router.push('/quizzes')}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold transition-colors"
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
        <div className="max-w-2xl mx-auto py-20 pt-24 text-center px-6">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-12">
            <h1 className="text-4xl font-black text-black mb-6">{quiz.title}</h1>
            <p className="text-xl text-gray-600 mb-8">You have <span className="font-bold text-red-600">{quiz.duration_minutes} minutes</span> to complete this quiz</p>
            <button
              onClick={() => {
                setQuizStarted(true)
                setStartTime(new Date())
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Start Quiz
            </button>
          </div>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-white">
      
      {/* Quiz Header */}
      <div className="bg-black border-b border-gray-200 pt-16 shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                <h1 className="text-xl font-bold text-white">{quiz.title}</h1>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-lg font-mono font-bold text-red-600 bg-red-50 px-4 py-2 rounded-lg border border-red-200">
                {formatTime(timeLeft)}
              </div>
              <div className="text-sm text-gray-300 bg-gray-800 px-4 py-2 rounded-lg">
                Question {currentQuestionIndex + 1} of {questions.length}
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-xs text-gray-300 mb-2">
              <span>Progress</span>
              <span>{Math.round(getProgressPercentage())}% Complete</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-3 border border-gray-700">
              <div 
                className="bg-red-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Current Question */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-8 mb-8">
          {currentQuestion ? (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {currentQuestionIndex + 1}
                </div>
                <span className="text-sm font-medium text-gray-500">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
              </div>
              
              <h2 className="text-2xl font-bold text-black mb-8 leading-relaxed">
                {currentQuestion.question}
              </h2>
              
              <div className="space-y-4">
                {currentQuestion?.options?.map((option, index) => (
                  <label
                    key={index}
                    className={`group flex items-start gap-4 p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                      answers[currentQuestion?.id ?? ''] === index
                        ? 'border-red-600 bg-red-50 shadow-md'
                        : 'border-gray-200 hover:border-red-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`relative flex items-center justify-center w-5 h-5 rounded-full border-2 transition-all ${
                      answers[currentQuestion?.id ?? ''] === index
                        ? 'border-red-600 bg-red-600'
                        : 'border-gray-400 group-hover:border-red-600'
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
                    <span className="text-lg text-black leading-relaxed flex-1 font-medium">
                      {option}
                    </span>
                  </label>
                ))}
              </div>
            </>
          ) : (
            <div className="text-gray-600 text-lg">No question found.</div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
            className="border-2 border-black text-black hover:bg-black hover:text-white px-6 py-3 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-black"
          >
            Previous
          </button>

          <div className="flex items-center gap-4">
            {currentQuestionIndex === questions.length - 1 ? (
              <button
                onClick={handleSubmitQuiz}
                disabled={submitting}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {submitting ? 'Submitting...' : 'Submit Quiz'}
              </button>
            ) : (
              <button
                onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-bold transition-colors"
              >
                Next
              </button>
            )}
          </div>
        </div>

        {/* Question Navigator */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-8">
          <h3 className="text-xl font-bold text-black mb-6 flex items-center gap-3">
            <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            Question Navigator
          </h3>
          <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-3">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-12 h-12 rounded-lg font-bold text-sm transition-all duration-200 border-2 ${
                  index === currentQuestionIndex
                    ? 'bg-red-600 text-white shadow-lg transform scale-105 border-red-600 z-10 relative'
                    : answers[questions[index]?.id ?? ''] !== undefined
                    ? 'bg-green-50 text-green-700 border-green-300 hover:bg-green-100 hover:border-green-400'
                    : 'bg-gray-50 text-gray-600 border-gray-300 hover:bg-gray-100 hover:text-black hover:border-gray-400'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-8 mt-6 text-sm bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-red-600 rounded-lg shadow-sm flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <span className="text-gray-700 font-medium">Current</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-green-50 border-2 border-green-300 rounded-lg"></div>
              <span className="text-gray-700 font-medium">Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gray-50 border-2 border-gray-300 rounded-lg"></div>
              <span className="text-gray-700 font-medium">Unanswered</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
