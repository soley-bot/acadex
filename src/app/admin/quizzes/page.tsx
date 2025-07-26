'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Brain, Plus, Search, Filter, Users, Play, Clock, TrendingUp, Loader2, RefreshCw } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { adminCache } from '@/lib/admin-cache'

interface Quiz {
  id: string
  title: string
  description: string
  course_id?: string
  difficulty: 'easy' | 'medium' | 'hard'
  time_limit: number
  is_active: boolean
  created_at: string
  updated_at: string
  question_count?: number
  attempts?: number
  avg_score?: number
  course_title?: string
}

export default function AdminQuizzes() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')

  const fetchQuizzes = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Check cache first
      const cachedData = adminCache.get<Quiz[]>('admin:quizzes')
      if (cachedData) {
        console.log('Using cached quiz data:', cachedData.length, 'quizzes')
        setQuizzes(cachedData)
        setLoading(false)
        return
      }

      console.log('No cached data found, fetching from database...')

      // First, test if the table exists with a simple query
      console.log('Testing basic table access...')
      const { data: testData, error: testError } = await supabase
        .from('quizzes')
        .select('count')
        .limit(1)

      if (testError) {
        console.error('Table access test failed:', {
          message: testError.message,
          details: testError.details,
          hint: testError.hint,
          code: testError.code
        })
        
        if (testError.code === '42P01') {
          throw new Error('The "quizzes" table does not exist. Please set up the database first.')
        } else {
          throw new Error(`Database access error: ${testError.message}`)
        }
      }

      console.log('Table access test passed, fetching full data...')

      // Use the simplest possible query first
      console.log('Attempting to fetch quizzes with minimal query...')
      const { data: quizzesData, error: quizzesError } = await supabase
        .from('quizzes')
        .select('*')
        .limit(10)

      if (quizzesError) {
        console.error('Quizzes query error details:', {
          message: quizzesError.message,
          details: quizzesError.details,
          hint: quizzesError.hint,
          code: quizzesError.code,
          statusCode: quizzesError.statusCode
        })
        throw new Error(`Database error: ${quizzesError.message} (Code: ${quizzesError.code})`)
      }

      console.log('Quizzes data fetched:', quizzesData)

      // Then fetch course information separately to avoid join issues
      const courseIds = [...new Set(quizzesData?.map(q => q.course_id).filter(Boolean) || [])]
      let coursesMap: Record<string, string> = {}
      
      if (courseIds.length > 0) {
        const { data: coursesData, error: coursesError } = await supabase
          .from('courses')
          .select('id, title')
          .in('id', courseIds)
        
        if (coursesError) {
          console.warn('Courses query error:', coursesError)
        } else if (coursesData) {
          coursesMap = coursesData.reduce((acc, course) => {
            acc[course.id] = course.title
            return acc
          }, {} as Record<string, string>)
        }
      }

      // Fetch question counts for each quiz from the correct table
      const { data: questionCounts, error: questionsError } = await supabase
        .from('quiz_questions')
        .select('quiz_id')
        
      if (questionsError) {
        console.warn('Could not fetch question counts:', questionsError)
      }

      // Group questions by quiz_id to count them
      const questionCountMap: Record<string, number> = {}
      if (questionCounts) {
        questionCounts.forEach(q => {
          questionCountMap[q.quiz_id] = (questionCountMap[q.quiz_id] || 0) + 1
        })
      }

      // Transform data and add mock stats for now
      const quizzesWithStats = quizzesData.map(quiz => ({
        ...quiz,
        question_count: questionCountMap[quiz.id] || 0,
        course_title: quiz.course_id ? coursesMap[quiz.course_id] : undefined,
        attempts: Math.floor(Math.random() * 500) + 50, // Mock data for now
        avg_score: Math.floor(Math.random() * 30) + 65 // Mock data for now
      }))

      // Cache the result with shorter cache time for admin pages
      adminCache.set('admin:quizzes', quizzesWithStats, 60 * 1000) // 1 minute cache
      setQuizzes(quizzesWithStats)
    } catch (err) {
      console.error('Error fetching quizzes:', err)
      setError(`Failed to load quizzes: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    let timeoutId: NodeJS.Timeout
    
    const loadQuizzes = async () => {
      if (isMounted) {
        // Clear any stale cache on fresh mount to prevent stuck loading states
        const cacheAge = adminCache.getCacheAge('admin:quizzes')
        if (cacheAge && cacheAge > 30000) { // If cache is older than 30 seconds, clear it
          console.log('Clearing stale cache data')
          adminCache.invalidate('admin:quizzes')
        }
        
        // Set a timeout to prevent infinite loading
        timeoutId = setTimeout(() => {
          if (isMounted && loading) {
            console.warn('Quiz loading timeout - forcing end of loading state')
            setLoading(false)
            setError('Loading timeout - please try refreshing the page')
          }
        }, 10000) // 10 second timeout
        
        await fetchQuizzes()
        
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
      }
    }
    
    loadQuizzes()
    
    return () => {
      isMounted = false
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [fetchQuizzes, loading])

  // Filter quizzes based on search and difficulty
  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quiz.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quiz.course_title?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || quiz.course_title?.toLowerCase().includes(selectedCategory.toLowerCase())
    const matchesDifficulty = selectedDifficulty === 'all' || quiz.difficulty === selectedDifficulty
    return matchesSearch && matchesCategory && matchesDifficulty
  })

  // Calculate statistics
  const quizStats = {
    total: quizzes.length,
    published: quizzes.filter(q => q.is_active).length,
    draft: quizzes.filter(q => !q.is_active).length,
    totalAttempts: quizzes.reduce((sum, q) => sum + (q.attempts || 0), 0)
  }

  // Get unique categories and difficulties
  const categories = ['all', ...Array.from(new Set(quizzes.map(q => q.course_title).filter(Boolean)))]
  const difficulties = ['all', 'easy', 'medium', 'hard']

  const getStatusBadge = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800' 
      : 'bg-gray-100 text-gray-800'
  }

  const getDifficultyBadge = (difficulty: string) => {
    const colors = {
      easy: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      hard: 'bg-red-100 text-red-800'
    }
    return colors[difficulty as keyof typeof colors] || colors.easy
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading quizzes...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-center">
          <p className="text-red-600 mb-2">{error}</p>
          <button 
            onClick={fetchQuizzes}
            className="mt-2 text-red-600 hover:text-red-700 underline"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quiz Management</h1>
            <p className="text-gray-600">Create and manage interactive quizzes</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                console.log('Manual refresh triggered')
                adminCache.invalidate('admin:quizzes')
                fetchQuizzes()
              }}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg flex items-center gap-2 transition-colors"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
              <Plus className="h-4 w-4" />
              Create Quiz
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quizzes</CardTitle>
            <Brain className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quizStats.total}</div>
            <p className="text-xs text-gray-500">All quizzes on platform</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Play className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quizStats.published}</div>
            <p className="text-xs text-gray-500">Active quizzes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <Clock className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quizStats.draft}</div>
            <p className="text-xs text-gray-500">Inactive quizzes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Attempts</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quizStats.totalAttempts}</div>
            <p className="text-xs text-gray-500">Quiz attempts</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search quizzes..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category === 'all' ? 'All Categories' : category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Unknown'}
            </option>
          ))}
        </select>
        <select
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
        >
          {difficulties.map(difficulty => (
            <option key={difficulty} value={difficulty}>
              {difficulty === 'all' ? 'All Difficulties' : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Quizzes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredQuizzes.map((quiz) => (
          <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{quiz.title}</CardTitle>
                  <CardDescription className="mt-1">{quiz.description}</CardDescription>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(quiz.is_active)}`}>
                  {quiz.is_active ? 'active' : 'inactive'}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Questions:</span>
                  <span className="font-medium">{quiz.question_count}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Attempts:</span>
                  <span className="font-medium">{quiz.attempts}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Avg Score:</span>
                  <span className="font-medium">{quiz.avg_score}%</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Duration:</span>
                  <span className="font-medium">{quiz.time_limit ? `${quiz.time_limit} min` : 'Unlimited'}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Course:</span>
                  <span className="font-medium capitalize">{quiz.course_title || 'No course'}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Difficulty:</span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyBadge(quiz.difficulty)}`}>
                    {quiz.difficulty}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Created:</span>
                  <span className="font-medium">{formatDate(quiz.created_at)}</span>
                </div>

                <div className="flex gap-2 pt-2">
                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm transition-colors">
                    Edit
                  </button>
                  <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm transition-colors">
                    View
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredQuizzes.length === 0 && !loading && (
        <Card className="mt-8 border-2 border-dashed border-gray-300">
          <CardContent className="p-8">
            <div className="text-center">
              <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No quizzes found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || selectedCategory !== 'all' || selectedDifficulty !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Start creating interactive quizzes for your students'
                }
              </p>
              {!searchTerm && selectedCategory === 'all' && selectedDifficulty === 'all' && (
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors">
                  Create Quiz
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}