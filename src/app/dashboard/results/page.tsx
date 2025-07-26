'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Brain, ArrowLeft, Clock, Award, TrendingUp } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { getUserQuizAttempts } from '@/lib/database'

interface QuizAttempt {
  id: string
  quiz_title: string
  score: number
  time_taken_seconds: number
  completed_at: string
  total_questions: number
  correct_answers: number
}

export default function AllResultsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    const fetchAllResults = async () => {
      try {
        setLoading(true)
        const { data, error: fetchError } = await getUserQuizAttempts(user.id)
        
        if (fetchError) {
          setError('Failed to load quiz results')
          console.error('Error fetching quiz attempts:', fetchError)
        } else {
          setQuizAttempts(data || [])
        }
      } catch (err) {
        console.error('Error fetching quiz attempts:', err)
        setError('Failed to load quiz results')
      } finally {
        setLoading(false)
      }
    }

    fetchAllResults()
  }, [user, router])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getAverageScore = () => {
    if (quizAttempts.length === 0) return 0
    const totalScore = quizAttempts.reduce((sum, attempt) => sum + attempt.score, 0)
    return Math.round(totalScore / quizAttempts.length)
  }

  const getTotalQuizzes = () => {
    return quizAttempts.length
  }

  const getBestScore = () => {
    if (quizAttempts.length === 0) return 0
    return Math.max(...quizAttempts.map(attempt => attempt.score))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center py-20 pt-24">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">All Quiz Results</h1>
          <p className="text-gray-600 mt-1">Complete overview of your quiz performance</p>
        </div>

        {error && (
          <div className="bg-white border rounded-lg shadow-sm mb-8">
            <div className="p-6">
              <div className="text-center">
                <Brain className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Results</h3>
                <p className="text-gray-600 mb-6">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-black transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {!error && (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white border rounded-lg shadow-sm">
                <div className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Brain className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Total Quizzes</p>
                      <p className="text-xl font-bold text-gray-900">{getTotalQuizzes()}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border rounded-lg shadow-sm">
                <div className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Average Score</p>
                      <p className="text-xl font-bold text-gray-900">{getAverageScore()}%</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border rounded-lg shadow-sm">
                <div className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Award className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Best Score</p>
                      <p className="text-xl font-bold text-gray-900">{getBestScore()}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Results List */}
            <div className="bg-white border rounded-lg shadow-sm">
              <div className="px-4 py-2 border-b">
                <h2 className="text-base font-medium text-gray-900 flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  Quiz Results
                </h2>
              </div>
              <div className="p-3">
                {quizAttempts.length > 0 ? (
                  <div className="space-y-1">
                    {quizAttempts.map((attempt) => (
                      <div
                        key={attempt.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 mb-0.5 truncate">
                            {attempt.quiz_title}
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-gray-600">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{formatTime(attempt.time_taken_seconds)}</span>
                            </div>
                            <span>{formatDate(attempt.completed_at)}</span>
                            <span>
                              {attempt.correct_answers}/{attempt.total_questions} correct
                            </span>
                          </div>
                        </div>
                        <div className={`px-2 py-0.5 rounded text-xs font-medium ml-2 ${getScoreColor(attempt.score)}`}>
                          {attempt.score}%
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Brain className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                    <h3 className="text-sm font-medium text-gray-900 mb-1">No Quiz Results Yet</h3>
                    <p className="text-xs text-gray-600 mb-3">You haven&apos;t taken any quizzes yet. Start your learning journey!</p>
                    <Link
                      href="/quizzes"
                      className="bg-gray-900 text-white px-3 py-1.5 rounded text-xs hover:bg-black transition-colors inline-block"
                    >
                      Browse Quizzes
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
