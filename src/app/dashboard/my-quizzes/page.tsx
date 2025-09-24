'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { quizAPI } from '@/lib/api'
const { getUserQuizAttempts } = quizAPI
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StudentSidebar } from '@/components/student/StudentSidebar'
import Link from 'next/link'
import { 
  Brain, 
  Play, 
  Clock, 
  Target,
  TrendingUp,
  Award,
  CheckCircle,
  Search,
  Calendar
} from 'lucide-react'
import type { QuizAttempt, QuizSummary } from '@/types/dashboard'

// Keep AvailableQuiz as local interface since it's UI-specific
interface AvailableQuiz {
  id: string
  title: string
  description: string
  category: string
  difficulty: string
  questionCount: number
  timeLimit: string
  attempts: number
  bestScore?: number
}

export default function MyQuizzesPage() {
  const { user } = useAuth()
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([])
  const [availableQuizzes, setAvailableQuizzes] = useState<AvailableQuiz[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'attempts' | 'available'>('attempts')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (user) {
      fetchQuizData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const fetchQuizData = async () => {
    if (!user?.id) return
    
    try {
      setLoading(true)
      setError(null) // Clear any previous errors
      
      // Fetch user's quiz attempts with better error handling
      const attemptsResponse = await getUserQuizAttempts(user.id, { limit: 10 })
      
      // Transform attempts data first so we can use it later
      let transformedAttempts: any[] = []
      
      if (attemptsResponse.error) {
        setError('Failed to load quiz attempts. Please try again.')
      } else {
        // Transform the data to match our interface - using real database values
        const attemptsData = Array.isArray(attemptsResponse.data) 
          ? attemptsResponse.data 
          : attemptsResponse.data?.data || []
        transformedAttempts = attemptsData.map((attempt: any) => {
          // Calculate percentage with proper bounds (0-100)
          let calculatedPercentage = attempt.percentage || 0
          
          // If percentage is greater than 100, recalculate it properly
          if (calculatedPercentage > 100) {
            calculatedPercentage = attempt.total_questions > 0 
              ? Math.round((attempt.score / attempt.total_questions) * 100)
              : 0
          }
          
          // Ensure percentage is between 0 and 100
          calculatedPercentage = Math.min(Math.max(calculatedPercentage, 0), 100)
          
          return {
            id: attempt.id,
            quiz_id: attempt.quiz_id || 'unknown',
            user_id: attempt.user_id || user.id,
            quiz_title: attempt.quiz_title,
            category: attempt.category || 'General',
            difficulty: attempt.difficulty || 'Intermediate',
            score: attempt.score || 0,
            total_questions: attempt.total_questions || 0,
            percentage: calculatedPercentage,
            completed_at: attempt.completed_at,
            time_taken_minutes: attempt.time_taken_minutes || 15,
            created_at: attempt.completed_at,
            timeSpent: `${attempt.time_taken_minutes || 15} min`
          }
        }) || []

        setQuizAttempts(transformedAttempts)
      }

      // Fetch available quizzes
      const quizzesResponse = await quizAPI.getQuizzes({ 
        limit: 20 
      })
      
      if (quizzesResponse.error) {
        setError('Failed to load available quizzes. Please try again.')
      } else {
        // Transform the data to match our interface
        const transformedQuizzes: AvailableQuiz[] = quizzesResponse.data?.data?.map((quiz: any) => {
          // Check if user has attempted this quiz
          const userAttempts = transformedAttempts.filter(attempt => attempt.quiz_id === quiz.id)
          const bestScore = userAttempts.length > 0 
            ? Math.max(...userAttempts.map(a => a.percentage))
            : undefined

          return {
            id: quiz.id,
            title: quiz.title,
            description: quiz.description || 'Test your knowledge with this quiz.',
            category: quiz.category || 'General',
            difficulty: quiz.difficulty || 'Intermediate',
            questionCount: quiz.total_questions || 20,
            timeLimit: `${quiz.duration_minutes || 20} min`,
            attempts: userAttempts.length,
            bestScore
          }
        }) || []

        setAvailableQuizzes(transformedQuizzes)
      }

    } catch (error) {
      setError('Failed to load quiz data. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (percentage: number) => {
    if (percentage >= 85) return 'text-green-600'
    if (percentage >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBadgeColor = (percentage: number) => {
    if (percentage >= 85) return 'bg-green-100 text-green-800'
    if (percentage >= 70) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
          <StudentSidebar />
        </div>

        {/* Mobile Sidebar */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)}>
            <div className="fixed inset-y-0 left-0 w-64 bg-sidebar" onClick={e => e.stopPropagation()}>
              <StudentSidebar onMobileClose={() => setSidebarOpen(false)} />
            </div>
          </div>
        )}

        <div className="flex-1 lg:ml-64">
          {/* Mobile header */}
          <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-base sm:text-lg font-semibold text-gray-900">My Quizzes</h1>
            <div className="w-10"></div>
          </div>

          <div className="p-4 md:p-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <StudentSidebar />
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)}>
          <div className="fixed inset-y-0 left-0 w-64 bg-sidebar" onClick={e => e.stopPropagation()}>
            <StudentSidebar onMobileClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}
      
      <div className="flex-1 lg:ml-64">
        {/* Mobile header */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-base sm:text-lg font-semibold text-gray-900">My Quizzes</h1>
          <div className="w-10"></div>
        </div>

        <div className="p-4 md:p-8">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">My Quizzes</h1>
            <p className="text-gray-600">Track your quiz attempts and discover new challenges</p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-5 h-5 text-red-400">⚠️</div>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                  <button 
                    onClick={() => {
                      setError(null)
                      fetchQuizData()
                    }}
                    className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <div className="flex space-x-6 md:space-x-8">
              <button
                onClick={() => setActiveTab('attempts')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'attempts'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Attempts ({quizAttempts.length})
              </button>
              <button
                onClick={() => setActiveTab('available')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'available'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Available Quizzes ({availableQuizzes.length})
              </button>
            </div>
          </div>

          {/* Quiz Attempts Tab */}
          {activeTab === 'attempts' && (
            <div className="space-y-4">
              {quizAttempts.length > 0 ? (
                quizAttempts.map((attempt) => (
                  <Card key={attempt.id} variant="base">
                    <CardContent className="p-4 md:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2">
                            <h3 className="text-base md:text-lg font-semibold text-gray-900">{attempt.quiz_title}</h3>
                            <Badge className={getDifficultyColor(attempt.difficulty)}>
                              {attempt.difficulty}
                            </Badge>
                            <Badge variant="outline">{attempt.category}</Badge>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-3 md:gap-6 text-xs md:text-sm text-gray-600 mb-3">
                            <div className="flex items-center gap-1">
                              <Target className="h-3 md:h-4 w-3 md:w-4" />
                              <span>{attempt.score}/{attempt.total_questions} correct</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 md:h-4 w-3 md:w-4" />
                              <span>{attempt.timeSpent}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 md:h-4 w-3 md:w-4" />
                              <span>{attempt.completed_at ? new Date(attempt.completed_at).toLocaleDateString() : 'In Progress'}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-4">
                          <Badge className={getScoreBadgeColor(attempt.percentage)}>
                            {attempt.percentage}%
                          </Badge>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/quizzes/${attempt.quiz_id}/results/${attempt.id}`} className="flex items-center justify-center">
                              <span className="hidden sm:inline">View Details</span>
                              <span className="sm:hidden">Details</span>
                            </Link>
                          </Button>
                          <Button variant="default" size="sm" asChild>
                            <Link href={`/quizzes/${attempt.quiz_id}/take`} className="flex items-center justify-center">
                              Retake
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card variant="base">
                  <CardContent className="p-12 text-center">
                    <Brain className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Quiz Attempts Yet</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      Start taking quizzes to track your progress and improve your skills.
                    </p>
                    <Button variant="default" size="lg" asChild>
                      <Link href="/quizzes">Take Your First Quiz</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Available Quizzes Tab */}
          {activeTab === 'available' && (
            <div className="space-y-4">
              {availableQuizzes.map((quiz) => (
                <Card key={quiz.id} variant="base">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2">
                          <h3 className="text-base md:text-lg font-semibold text-gray-900">{quiz.title}</h3>
                          <Badge className={getDifficultyColor(quiz.difficulty)}>
                            {quiz.difficulty}
                          </Badge>
                          <Badge variant="outline">{quiz.category}</Badge>
                          {quiz.attempts > 0 && (
                            <Badge className="bg-blue-100 text-blue-800">
                              {quiz.attempts} attempt{quiz.attempts > 1 ? 's' : ''}
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-gray-600 mb-3 text-sm md:text-base">{quiz.description}</p>
                        
                        <div className="flex flex-wrap items-center gap-3 md:gap-6 text-xs md:text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Target className="h-3 md:h-4 w-3 md:w-4" />
                            <span>{quiz.questionCount} questions</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 md:h-4 w-3 md:w-4" />
                            <span>{quiz.timeLimit}</span>
                          </div>
                          {quiz.bestScore && (
                            <div className="flex items-center gap-1">
                              <Award className="h-3 md:h-4 w-3 md:w-4" />
                              <span>Best: {quiz.bestScore}%</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center sm:items-start">
                        <Button variant="default" size="sm" asChild>
                          <Link href={`/quizzes/${quiz.id}/take`} className="flex items-center gap-2">
                            <Play className="h-4 w-4" />
                            <span className="hidden sm:inline">{quiz.attempts > 0 ? 'Retake Quiz' : 'Start Quiz'}</span>
                            <span className="sm:hidden">{quiz.attempts > 0 ? 'Retake' : 'Start'}</span>
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}