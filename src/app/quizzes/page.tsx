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
          return 'text-green-700 bg-green-50 border-green-200'
        case 'intermediate':
          return 'text-yellow-700 bg-yellow-50 border-yellow-200'
        case 'advanced':
          return 'text-red-700 bg-red-50 border-red-200'
        default:
          return 'text-gray-700 bg-gray-50 border-gray-200'
      }
    }
  }, [])

  // Removed icon mapping - using clean text-only design

  if (isLoading && currentPage === 1) {
    return (
      <div className="min-h-screen bg-background">
        <section className="relative pt-24 pb-16 px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-secondary/5"></div>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl"></div>
          
          <div className="relative max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
              Test Your
              <span className="block text-primary mt-2">English Skills</span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground">Loading English quizzes...</p>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-secondary/5"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
            Test Your
            <span className="block text-primary mt-2">English Skills</span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground">
            Challenge yourself with interactive English quizzes covering grammar, vocabulary, and more.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 px-6 lg:px-8 border-t">
        <div className="max-w-7xl mx-auto">
          {/* Filters */}
          <div className="mb-12 space-y-6">
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
              <div>
                <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-2">English Quizzes</h2>
                <p className="text-sm md:text-base text-muted-foreground">
                  Showing {((currentPage - 1) * pagination.limit + 1)} - {Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total} quizzes
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="min-w-[160px]">
                  <label htmlFor="category" className="block text-sm font-medium mb-2">Category</label>
                  <select
                    id="category"
                    value={selectedCategory}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="input"
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
                
                <div className="min-w-[160px]">
                  <label htmlFor="difficulty" className="block text-sm font-medium mb-2">Difficulty</label>
                  <select
                    id="difficulty"
                    value={selectedDifficulty}
                    onChange={(e) => handleDifficultyChange(e.target.value)}
                    className="input"
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
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                <div className="text-red-800 mb-2">Error</div>
                <p className="text-red-700 mb-4">{error}</p>
                <button 
                  onClick={fetchQuizzes}
                  className="btn-default"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading quizzes...</p>
            </div>
          )}

          {/* Quizzes Grid */}
          {!isLoading && !error && (
            <>
              {quizzes.length === 0 ? (
                <div className="text-center py-12">
                  <h3 className="text-xl font-semibold mb-2">No quizzes found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your filters or check back later for new quizzes.
                  </p>
                  <button 
                    onClick={() => {
                      setSelectedCategory('all')
                      setSelectedDifficulty('all')
                      setCurrentPage(1)
                    }}
                    className="btn-outline"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                  {quizzes.map((quiz, index) => (
                    <div key={quiz.id} className="card group hover:shadow-lg transition-all duration-200 overflow-hidden animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                      <div className="p-8">
                        <div className="flex items-center gap-2 mb-4">
                          <span className="px-3 py-1 bg-brand/10 text-brand text-xs font-semibold rounded-full border border-brand/20">
                            {quiz.category}
                          </span>
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getDifficultyColor(quiz.difficulty)}`}>
                            {quiz.difficulty}
                          </span>
                        </div>

                        <h3 className="text-xl font-semibold tracking-tight mb-3">
                          {quiz.title}
                        </h3>

                        <p className="text-muted-foreground mb-6 line-clamp-2 leading-relaxed">
                          {quiz.description}
                        </p>

                        <div className="flex items-center justify-between text-sm text-muted-foreground mb-6">
                          <div className="flex items-center gap-2">
                            <span>{quiz.duration_minutes} min</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span>{quiz.total_questions} questions</span>
                          </div>
                        </div>

                        <Link 
                          href={`/quizzes/${quiz.id}/take`}
                          className="btn-default w-full"
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
