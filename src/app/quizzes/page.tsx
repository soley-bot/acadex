'use client'

import { logger } from '@/lib/logger'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Brain } from 'lucide-react'
import { quizAPI } from '@/lib/database'
import { Pagination } from '@/components/ui/Pagination'
import { Typography, DisplayXL, H1, H2, H3, BodyLG, BodyMD } from '@/components/ui/Typography'
import { Container, Section, Grid } from '@/components/ui/Layout'
import { EnhancedQuizCard } from '@/components/cards/EnhancedQuizCard'

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
          return 'text-green-700 bg-green-100/80 border-green-200'
        case 'intermediate':
          return 'text-yellow-700 bg-yellow-100/80 border-yellow-200'
        case 'advanced':
          return 'text-red-700 bg-red-100/80 border-red-200'
        default:
          return 'text-gray-600 bg-gray-100 border-gray-200'
      }
    }
  }, [])

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
              Quiz Practice
            </div>
            <H1 className="mb-8 text-center">
              Practice What You Know,
              <span className="block text-red-600 mt-4">Without the Stress</span>
            </H1>
            <BodyLG color="muted" className="mb-12 text-center">Loading quizzes...</BodyLG>
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
            Quiz Practice
          </div>
          <H1 className="mb-8 text-center">
            Practice What You Know,
            <span className="block text-red-600 mt-4">Without the Stress</span>
          </H1>
          <BodyLG className="max-w-3xl mx-auto text-center" color="muted">
            Try simple quizzes to test your understanding, build confidence, and see what you&apos;re ready to learn next. No grades. Just learning.
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
                <H2 className="mb-3">Try a Quiz</H2>
                <BodyLG color="muted">
                  More quizzes coming soon — we&apos;re starting with the basics and improving each week.
                </BodyLG>
                <BodyLG color="muted" className="mt-2">
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
            
            {/* Filter microcopy */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-4 shadow-xl border border-white/20">
              <BodyMD color="muted" className="text-center">
                Use these filters to find quizzes that match your current level or topic.
              </BodyMD>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 lg:p-8 shadow-xl border border-white/20">
              <BodyMD className="font-bold text-red-800">Error loading quizzes</BodyMD>
              <BodyMD className="text-sm mt-1 text-red-600">{error}</BodyMD>
              <button 
                onClick={fetchQuizzes}
                className="mt-3 text-sm underline hover:no-underline font-medium text-red-700 transition-all duration-200"
              >
                Try again
              </button>
            </div>
          )}

          {/* Small library message */}
          {!isLoading && quizzes.length > 0 && quizzes.length <= 3 && (
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 lg:p-8 shadow-xl border border-white/20 text-center mb-8">
              <BodyMD className="font-medium text-gray-700 mb-2">
                Not many quizzes yet? That&apos;s okay — we&apos;re building more each week.
              </BodyMD>
              <BodyMD color="muted">
                Want to request a topic? <Link href="/contact" className="text-red-600 hover:text-red-700 underline font-medium">Send us a message</Link>.
              </BodyMD>
            </div>
          )}

          {/* Quizzes Grid */}
          <Grid cols={1} className="md:grid-cols-2 lg:grid-cols-3 mb-12">
            {isLoading && currentPage !== 1 ? (
              // Loading skeleton cards for pagination
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300">
                  <div className="h-48 bg-gradient-to-br from-gray-200/80 to-gray-300/80 animate-pulse backdrop-blur-sm"></div>
                  <div className="p-6 space-y-4 bg-white/50 backdrop-blur-sm">
                    <div className="flex gap-2">
                      <div className="h-6 w-16 bg-gradient-to-r from-gray-200/80 to-gray-300/80 animate-pulse rounded-full backdrop-blur-sm"></div>
                      <div className="h-6 w-20 bg-gradient-to-r from-gray-200/80 to-gray-300/80 animate-pulse rounded-full backdrop-blur-sm"></div>
                    </div>
                    <div className="h-8 bg-gradient-to-r from-gray-200/80 to-gray-300/80 animate-pulse rounded-lg backdrop-blur-sm"></div>
                    <div className="h-5 bg-gradient-to-r from-gray-200/80 to-gray-300/80 animate-pulse rounded w-3/4 backdrop-blur-sm"></div>
                    <div className="h-5 bg-gradient-to-r from-gray-200/80 to-gray-300/80 animate-pulse rounded w-1/2 backdrop-blur-sm"></div>
                    <div className="flex justify-between items-center pt-4">
                      <div className="h-8 w-16 bg-gradient-to-r from-gray-200/80 to-gray-300/80 animate-pulse rounded backdrop-blur-sm"></div>
                      <div className="h-10 w-24 bg-gradient-to-r from-gray-200/80 to-gray-300/80 animate-pulse rounded-xl backdrop-blur-sm"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : quizzes.length > 0 ? (
              quizzes.map((quiz) => (
                <EnhancedQuizCard key={quiz.id} quiz={quiz} showProgress={true} />
              ))
            ) : (
              // Empty State
              <div className="col-span-full text-center py-12">
                <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20 max-w-md mx-auto">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Brain className="text-red-600 h-8 w-8" />
                  </div>
                  <H3 className="mb-4">No quizzes found</H3>
                  <BodyMD color="muted" className="mb-6">
                    We don&apos;t have any quizzes matching your current filters yet.
                  </BodyMD>
                  <button
                    onClick={() => {
                      setSelectedCategory('all')
                      setSelectedDifficulty('all')
                    }}
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            )}
          </Grid>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={pagination.totalPages}
                totalItems={pagination.total}
                itemsPerPage={pagination.limit}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </Container>
      </Section>
    </div>
  )
}
