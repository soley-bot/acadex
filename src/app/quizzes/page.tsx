'use client'

import { logger } from '@/lib/logger'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { quizAPI } from '@/lib/database'
import { Pagination } from '@/components/ui/Pagination'
import { Typography, H1, H2, H3, BodyLG, BodyMD } from '@/components/ui/Typography'
import { Container, Section, Grid } from '@/components/ui/Layout'

interface Quiz {
  id: string
  title: string
  description: string
  category: string
  difficulty: string
  duration_minutes: number
  image_url?: string | null
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

  const formatDifficulty = (difficulty: string) => {
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
  }

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
      logger.error('Failed to fetch quizzes:', err)
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
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-64 h-64 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob"></div>
          <div className="absolute bottom-20 left-20 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob animation-delay-2000"></div>
        </div>
        
        <Section spacing="lg" className="pt-24 px-6 lg:px-8 overflow-hidden">
          <Container size="md" className="text-center">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-full text-sm lg:text-base font-medium mb-8 shadow-lg">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              Quiz Platform
            </div>
            <H1 className="mb-8 text-center">
              Test Your
              <span className="block text-red-600 mt-4">Knowledge</span>
            </H1>
            <BodyLG className="mb-12 text-center">Loading quizzes...</BodyLG>
            <div className="mt-8">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-200 border-t-red-600 mx-auto"></div>
            </div>
          </Container>
        </Section>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-6000"></div>
      </div>

      {/* Hero Section */}
      <Section spacing="lg" className="text-center px-6">
        <Container size="md">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-full text-sm lg:text-base font-medium mb-8 shadow-lg">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            Quiz Platform
          </div>
          <H1 className="mb-8 text-center">
            Test Your Knowledge
            <span className="block text-red-600 mt-4">Challenge Yourself</span>
          </H1>
          <BodyLG className="max-w-3xl mx-auto text-center" color="muted">
            Comprehensive quizzes across multiple subjects to assess and improve your skills
          </BodyLG>
        </Container>
      </Section>

      {/* Main Content */}
      <Section spacing="lg" className="px-6 lg:px-8">
        <Container size="xl">
          {/* Filters */}
          <div className="mb-12 space-y-6">
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
              <div className="w-full lg:w-auto">
                <H2 className="mb-3">Available Quizzes</H2>
                <BodyLG color="muted">
                  Showing {((currentPage - 1) * pagination.limit + 1)} - {Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total} quizzes
                </BodyLG>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                <div className="min-w-[180px] w-full sm:w-auto">
                  <label htmlFor="category" className="block mb-2 text-sm text-gray-500 font-medium">
                    Category
                  </label>
                  <select
                    id="category"
                    value={selectedCategory}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full px-4 py-3 border border-white/20 rounded-xl bg-white/80 backdrop-blur-lg text-gray-600 font-medium focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 shadow-lg"
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
                
                <div className="min-w-[180px] w-full sm:w-auto">
                  <label htmlFor="difficulty" className="block mb-2 text-sm text-gray-500 font-medium">
                    Difficulty
                  </label>
                  <select
                    id="difficulty"
                    value={selectedDifficulty}
                    onChange={(e) => handleDifficultyChange(e.target.value)}
                    className="w-full px-4 py-3 border border-white/20 rounded-xl bg-white/80 backdrop-blur-lg text-gray-600 font-medium focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 shadow-lg"
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
              <div className="bg-white/80 backdrop-blur-lg border border-red-200 rounded-2xl p-8 max-w-md mx-auto shadow-xl">
                <H3 color="error" className="mb-3">Error</H3>
                <BodyLG color="error" className="mb-6">{error}</BodyLG>
                <button 
                  onClick={fetchQuizzes}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-200 border-t-red-600 mx-auto mb-4"></div>
              <BodyLG color="muted">Loading quizzes...</BodyLG>
            </div>
          )}

          {/* Quizzes Grid */}
          {!isLoading && !error && (
            <>
              {quizzes.length === 0 ? (
                <div className="text-center py-16">
                  <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-12 max-w-md mx-auto shadow-xl border border-white/20">
                    <div className="w-20 h-20 bg-gradient-to-r from-red-600 to-red-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <H3 className="mb-4">No quizzes found</H3>
                    <BodyLG color="muted" className="mb-8">
                      Try adjusting your filters or check back later for new quizzes.
                    </BodyLG>
                    <button 
                      onClick={() => {
                        setSelectedCategory('all')
                        setSelectedDifficulty('all')
                        setCurrentPage(1)
                      }}
                      className="border-2 border-red-600 text-red-600 bg-white hover:bg-red-600 hover:text-white px-6 py-3 rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              ) : (
                <Grid cols={3} className="mb-12">
                  {quizzes.map((quiz, index) => (
                    <div key={quiz.id} className="group">
                      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-white/20 hover:-translate-y-2">
                        
                        {/* Quiz Image */}
                        <div className="relative h-48 bg-gradient-to-br from-red-100 to-orange-100">
                          {quiz.image_url ? (
                            <Image
                              src={quiz.image_url}
                              alt={quiz.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-red-200 to-orange-200 flex items-center justify-center">
                              <div className="text-4xl font-black text-red-600">
                                {quiz.title.charAt(0).toUpperCase()}
                              </div>
                            </div>
                          )}
                          
                          {/* Difficulty Badge */}
                          <div className="absolute top-4 right-4">
                            <div className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-bold shadow-lg backdrop-blur-sm ${
                              quiz.difficulty.toLowerCase() === 'beginner' ? 'bg-green-500/90 text-white' :
                              quiz.difficulty.toLowerCase() === 'intermediate' ? 'bg-yellow-500/90 text-white' :
                              'bg-red-500/90 text-white'
                            }`}>
                              {formatDifficulty(quiz.difficulty)}
                            </div>
                          </div>
                        </div>

                        {/* Content Section */}
                        <div className="p-6">
                          {/* Category Badge */}
                          <div className="mb-4">
                            <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg">
                              {quiz.category}
                            </div>
                          </div>

                          {/* Title */}
                          <H3 className="mb-3 leading-tight group-hover:text-red-600 transition-colors">
                            {quiz.title}
                          </H3>

                          {/* Description */}
                          <BodyLG color="muted" className="mb-4 line-clamp-2 leading-relaxed">
                            {quiz.description}
                          </BodyLG>

                          {/* Quiz Stats */}
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                              <span className="font-medium">{quiz.duration_minutes} min</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </div>
                              <span className="font-medium">{quiz.total_questions} questions</span>
                            </div>
                          </div>

                          {/* Action Button */}
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="text-lg font-bold text-red-600">
                              Free Quiz
                            </div>
                            <Link 
                              href={`/quizzes/${quiz.id}/take`}
                              className="w-full sm:w-auto text-center bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                            >
                              Start Quiz
                              <span className="ml-2">→</span>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </Grid>
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
        </Container>
      </Section>
    </div>
  )
}
