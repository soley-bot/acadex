'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { quizAPI } from '@/lib/database'
import { Pagination } from '@/components/ui/Pagination'

interface Quiz {
  id: string
  title: string
  description: string
  category: string
  difficulty: string
  duration_minutes: number
  is_published: boolean
  created_at: string
  total_questions: number
}

interface PaginationData {
  page: number
  limit: number
  total: number
  totalPages: number
  hasMore: boolean
}

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 9,
    total: 0,
    totalPages: 0,
    hasMore: false
  })
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')

  const fetchQuizzes = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const filters = {
        page: currentPage,
        limit: 9,
        ...(selectedCategory !== 'all' && { category: selectedCategory }),
        ...(selectedDifficulty !== 'all' && { difficulty: selectedDifficulty })
      }

      const { data, error, pagination: paginationData } = await quizAPI.getQuizzes(filters)
      
      if (error) {
        throw error
      }
      
      setQuizzes(data || [])
      setPagination(paginationData)
    } catch (err) {
      console.error('Failed to fetch quizzes:', err)
      setError('Failed to load quizzes. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, selectedCategory, selectedDifficulty])

  useEffect(() => {
    fetchQuizzes()
  }, [fetchQuizzes])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setCurrentPage(1)
  }

  const handleDifficultyChange = (difficulty: string) => {
    setSelectedDifficulty(difficulty)
    setCurrentPage(1)
  }

  const getDifficultyColor = useMemo(() => {
    return (difficulty: string) => {
      switch (difficulty.toLowerCase()) {
        case 'beginner':
          return 'text-success bg-success/10 border-success/20'
        case 'intermediate':
          return 'text-warning bg-warning/10 border-warning/20'
        case 'advanced':
          return 'text-destructive bg-destructive/10 border-destructive/20'
        default:
          return 'text-gray-600 bg-gray-100 border-gray-200'
      }
    }
  }, [])

  // Removed icon mapping - using clean text-only design

  if (isLoading && currentPage === 1) {
    return (
      <div className="min-h-screen bg-white">
        <section className="relative pt-24 pb-16 px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 bg-white"></div>
          
          <div className="relative max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight mb-6 text-black">
              Test Your
              <span className="block text-red-600 mt-2">Knowledge</span>
            </h1>
            <p className="text-base md:text-lg text-gray-600">Loading quizzes...</p>
            <div className="mt-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="text-center py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-gray-100 text-black px-4 py-2 rounded-full text-sm font-medium mb-8 border border-gray-200">
            <span className="w-2 h-2 bg-red-600 rounded-full"></span>
            Quiz Platform
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-black mb-6 leading-tight">
            Test Your Knowledge
            <span className="block text-red-600 mt-2">Challenge Yourself</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
            Comprehensive quizzes across multiple subjects to assess and improve your skills
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          {/* Filters */}
          <div className="mb-12 space-y-6">
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
              <div>
                <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-3 text-black">Available Quizzes</h2>
                <p className="text-base md:text-lg text-gray-600">
                  Showing {((currentPage - 1) * pagination.limit + 1)} - {Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total} quizzes
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="min-w-[180px]">
                  <label htmlFor="category" className="block text-sm font-bold mb-2 text-black">Category</label>
                  <select
                    id="category"
                    value={selectedCategory}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-black font-medium focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
                  >
                    <option value="all">All Categories</option>
                    <option value="Grammar">Grammar</option>
                    <option value="Vocabulary">Vocabulary</option>
                    <option value="Pronunciation">Pronunciation</option>
                    <option value="Speaking">Speaking</option>
                    <option value="Business English">Business English</option>
                    <option value="Writing">Writing</option>
                    <option value="Literature">Literature</option>
                    <option value="Test Preparation">Test Preparation</option>
                    <option value="Reading">Reading</option>
                    <option value="Listening">Listening</option>
                  </select>
                </div>
                
                <div className="min-w-[180px]">
                  <label htmlFor="difficulty" className="block text-sm font-bold mb-2 text-black">Difficulty</label>
                  <select
                    id="difficulty"
                    value={selectedDifficulty}
                    onChange={(e) => handleDifficultyChange(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-black font-medium focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
                  >
                    <option value="all">All Levels</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md mx-auto shadow-sm">
                <div className="text-red-600 mb-3 text-lg font-bold">Error</div>
                <p className="text-red-700 mb-6 text-base">{error}</p>
                <button 
                  onClick={fetchQuizzes}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Loading quizzes...</p>
            </div>
          )}

          {/* Quizzes Grid */}
          {!isLoading && !error && (
            <>
              {quizzes.length === 0 ? (
                <div className="text-center py-16">
                  <h3 className="text-2xl font-bold mb-4 text-black">No quizzes found</h3>
                  <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
                    Try adjusting your filters or check back later for new quizzes.
                  </p>
                  <button 
                    onClick={() => {
                      setSelectedCategory('all')
                      setSelectedDifficulty('all')
                      setCurrentPage(1)
                    }}
                    className="border-2 border-black text-black hover:bg-black hover:text-white px-6 py-3 rounded-lg font-bold transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                  {quizzes.map((quiz, index) => (
                    <div key={quiz.id} className="bg-white border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group hover:-translate-y-1" style={{ animationDelay: `${index * 100}ms` }}>
                      {/* Header with category and difficulty */}
                      <div className="bg-black p-6 text-white">
                        <div className="flex items-center gap-2 mb-4">
                          <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full">
                            {quiz.category}
                          </span>
                          <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                            quiz.difficulty.toLowerCase() === 'beginner' ? 'bg-green-100 text-green-800' :
                            quiz.difficulty.toLowerCase() === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {quiz.difficulty}
                          </span>
                        </div>

                        <h3 className="text-xl font-bold text-white leading-tight group-hover:text-red-300 transition-colors">
                          {quiz.title}
                        </h3>
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <p className="text-gray-600 mb-6 line-clamp-2 leading-relaxed">
                          {quiz.description}
                        </p>

                        <div className="flex items-center justify-between text-sm text-gray-500 mb-6 bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                            <span className="font-medium">{quiz.duration_minutes} min</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-black rounded-full"></div>
                            <span className="font-medium">{quiz.total_questions} questions</span>
                          </div>
                        </div>

                        <Link 
                          href={`/quizzes/${quiz.id}/take`}
                          className="block w-full text-center bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold transition-colors group-hover:shadow-lg"
                        >
                          Start Quiz
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={pagination.totalPages}
                  totalItems={pagination.total}
                  itemsPerPage={pagination.limit}
                  onPageChange={handlePageChange}
                  isLoading={isLoading}
                />
              )}
            </>
          )}
        </div>
      </section>
    </div>
  )
}
