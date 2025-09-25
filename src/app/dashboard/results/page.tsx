'use client'

import { logger } from '@/lib/logger'
import { Card, CardContent } from '@/components/ui/card'
import { Pagination } from '@/components/ui/Pagination'
import { 
  ArrowLeft,
  Target,
  TrendingUp,
  Award,
  Clock,
  Calendar,
  Loader2
} from 'lucide-react'
import { formatTime, formatDate } from '@/lib/date-utils'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { quizAPI } from '@/lib/api'
const { getUserQuizAttempts } = quizAPI

interface QuizAttempt {
  id: string
  quiz_title: string
  score: number
  completed_at: string
  time_taken_minutes: number
}

interface PaginationData {
  page: number
  limit: number
  total: number
  totalPages: number
  hasMore: boolean
}

export default function AllResultsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasMore: false
  })

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    const fetchAllResults = async () => {
      try {
        setLoading(true)
        const response = await getUserQuizAttempts(user.id, { limit: 10, page: currentPage })
        
        if (response.error) {
          setError('Failed to load quiz results')
          logger.error('Error fetching quiz attempts:', response.error)
        } else {
          const responseData = Array.isArray(response.data) ? response.data : response.data?.data || []
          const paginationData = Array.isArray(response.data) ? null : response.data?.pagination
          setQuizAttempts(responseData as QuizAttempt[])
          if (paginationData) {
            setPagination(paginationData)
          }
        }
      } catch (err) {
        logger.error('Error fetching quiz attempts:', err)
        setError('Failed to load quiz results')
      } finally {
        setLoading(false)
      }
    }

    fetchAllResults()
  }, [user, router, currentPage])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success bg-success/10'
    if (score >= 60) return 'text-warning bg-warning/10'
    return 'text-destructive bg-destructive/10'
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
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center py-20 pt-24">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-3 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-foreground">All Quiz Results</h1>
          <p className="text-muted-foreground mt-1">Complete overview of your quiz performance</p>
        </div>

        {error && (
          <Card variant="elevated" className="mb-8">
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-foreground mb-2">Unable to Load Results</h3>
                <p className="text-muted-foreground mb-6">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-primary hover:bg-secondary text-white hover:text-black px-4 py-2 rounded-lg transition-colors"
                >
                  Try Again
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {!error && (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card variant="elevated">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                      <Target className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Quizzes</p>
                      <p className="text-xl font-bold text-foreground">{getTotalQuizzes()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card variant="elevated">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Average Score</p>
                      <p className="text-xl font-bold text-foreground">{getAverageScore()}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card variant="elevated">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                      <Award className="h-5 w-5 text-warning" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Best Score</p>
                      <p className="text-xl font-bold text-foreground">{getBestScore()}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Results List */}
            <Card variant="elevated">
              <CardContent className="p-0">
                <div className="px-4 py-3 border-b border-border">
                  <h2 className="text-base font-medium text-foreground flex items-center gap-2">
                    Quiz Results
                  </h2>
                </div>
                <div className="p-4">
                  {quizAttempts.length > 0 ? (
                    <div className="space-y-2">
                      {quizAttempts.map((attempt) => (
                        <div
                          key={attempt.id}
                          className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-foreground mb-1 truncate">
                              {attempt.quiz_title}
                            </h3>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{attempt.time_taken_minutes} min</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{formatDate(attempt.completed_at)}</span>
                              </div>
                            </div>
                          </div>
                          <div className={`px-2 py-1 rounded text-xs font-medium ml-3 ${getScoreColor(attempt.score)}`}>
                            {attempt.score}%
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <h3 className="text-sm font-medium text-foreground mb-2">No Quiz Results Yet</h3>
                      <p className="text-xs text-muted-foreground mb-4">You haven&apos;t taken any quizzes yet. Start your learning journey!</p>
                      <Link
                        href="/quizzes"
                        className="bg-primary hover:bg-secondary text-white hover:text-black px-4 py-2 rounded-lg text-sm transition-colors inline-block"
                      >
                        Browse Quizzes
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <Card variant="glass">
                  <CardContent className="p-4">
                    <Pagination
                      currentPage={pagination.page}
                      totalPages={pagination.totalPages}
                      onPageChange={handlePageChange}
                    />
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
