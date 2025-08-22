'use client'

import { logger } from '@/lib/logger'
import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Brain, Loader2, Filter } from 'lucide-react'
import { quizAPI } from '@/lib/database'
import { Pagination } from '@/components/ui/Pagination'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EnhancedQuizCard } from '@/components/cards/EnhancedQuizCard'
import { getHeroImage } from '@/lib/imageMapping'
import { quizCategories, quizDifficulties, getCategoryInfo } from '@/lib/quizConstants'

// Quiz list item type - subset of full Quiz with required display fields
interface QuizListItem {
  id: string
  title: string
  description: string
  category: string
  difficulty: string
  duration_minutes: number
  total_questions: number
  is_published: boolean
  created_at: string
  // Optional fields for card display
  image_url?: string | null
  passing_score?: number
  max_attempts?: number
  time_limit_minutes?: number | null
  updated_at?: string
}

interface PaginationData {
  page: number
  limit: number
  total: number
  totalPages: number
  hasMore: boolean
}

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<QuizListItem[]>([])
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
  const [availableCategories, setAvailableCategories] = useState<string[]>([])

  const formatDifficulty = (difficulty: string) => {
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
  }

  const fetchAvailableCategories = useCallback(async () => {
    try {
      const { data: quizzesData, error } = await quizAPI.getQuizzes({ limit: 1000 }) // Get all to extract categories
      if (error) throw error
      
      // Extract unique categories from database quizzes
      const dbCategories = [...new Set(quizzesData?.map((q: QuizListItem) => q.category).filter(Boolean) || [])] as string[]
      
      // Combine with predefined categories, prioritizing database categories
      const combinedCategories = [...new Set([...dbCategories, ...quizCategories])] as string[]
      setAvailableCategories(combinedCategories.sort())
    } catch (err) {
      logger.error('Failed to fetch categories:', err)
      // Fallback to predefined categories
      setAvailableCategories([...quizCategories])
    }
  }, [])

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
    fetchAvailableCategories()
  }, [fetchAvailableCategories])

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
          return 'text-muted-foreground bg-muted/10 border-border'
      }
    }
  }, [])

  if (isLoading && currentPage === 1) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-24">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full text-sm font-semibold mb-8 shadow-lg">
              <Brain className="w-4 h-4 animate-pulse" />
              Quiz Practice
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-8">
              Practice What You Know,
              <span className="block text-secondary font-extrabold mt-4">Without the Stress</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-12">Loading quizzes...</p>
            <div className="flex justify-center">
              <div className="relative">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <div className="absolute inset-0 h-12 w-12 animate-ping rounded-full bg-secondary/20"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Professional Quiz Environment */}
      <div className="bg-gradient-to-br from-blue-50 via-white to-slate-50 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]"></div>
        
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-20 lg:py-24 relative">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Content */}
            <div className="text-center lg:text-left space-y-6 md:space-y-8">
              <div className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full text-sm font-semibold shadow-lg">
                <Brain className="w-4 h-4" />
                Quiz Practice
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground">
                Practice What You Know,
                <span className="block text-secondary font-extrabold mt-2">Without the Stress</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Try simple quizzes to test your understanding, build confidence, and see what you&apos;re ready to learn next. 
                <span className="font-medium text-foreground">No grades. Just learning.</span>
              </p>
            </div>

            {/* Hero Image */}
            <div className="relative order-first lg:order-last">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-white p-2">
                <Image
                  src="/images/hero/online-learning.jpg"
                  alt="Online learning and quiz practice setup"
                  width={600}
                  height={400}
                  className="object-cover w-full h-[400px] rounded-xl"
                  priority
                  quality={90}
                />
                {/* Image Overlay with Quiz Stats */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="font-medium text-foreground">Quiz practice</span>
                      </div>
                      <span className="font-bold text-secondary">Test your skills</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating elements for visual interest */}
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-primary/10 rounded-full blur-xl"></div>
              <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-secondary/10 rounded-full blur-xl"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - White Background */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
          {/* Filters */}
          <div className="space-y-8">
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            <div className="flex items-start gap-4 w-full lg:w-auto">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold text-foreground">Try a Quiz</h2>
                <p className="text-muted-foreground">
                  More quizzes coming soon — we&apos;re starting with the basics and improving each week.
                </p>
                <p className="text-sm text-muted-foreground">
                  Showing <span className="font-semibold text-primary">{((currentPage - 1) * pagination.limit + 1)}</span> - <span className="font-semibold text-secondary">{Math.min(currentPage * pagination.limit, pagination.total)}</span> of <span className="font-semibold text-foreground">{pagination.total}</span> quizzes
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <div className="min-w-[180px] w-full sm:w-auto">
                <label htmlFor="category" className="block mb-2 text-sm font-medium text-foreground flex items-center gap-2">
                  <Filter className="h-4 w-4 text-primary" />
                  Category
                </label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                >
                  <option value="all">All Categories</option>
                  {availableCategories.map((category) => {
                    const categoryInfo = getCategoryInfo(category)
                    return (
                      <option key={category} value={category}>
                        {categoryInfo.icon} {categoryInfo.label}
                      </option>
                    )
                  })}
                </select>
              </div>
              
              <div className="min-w-[180px] w-full sm:w-auto">
                <label htmlFor="difficulty" className="block mb-2 text-sm font-medium text-foreground flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary" />
                  Difficulty
                </label>
                <select
                  id="difficulty"
                  value={selectedDifficulty}
                  onChange={(e) => handleDifficultyChange(e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                >
                  <option value="all">All Levels</option>
                  {quizDifficulties.map((difficulty) => (
                    <option key={difficulty} value={difficulty}>
                      {formatDifficulty(difficulty)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          {/* Filter microcopy */}
          <Card variant="elevated" className="p-4 border-border shadow-sm bg-background">
            <p className="text-sm text-muted-foreground text-center flex items-center justify-center gap-2">
              <Filter className="h-4 w-4 text-primary" />
              Use these filters to find quizzes that match your current level or topic.
            </p>
          </Card>
        </div>

        {/* Error State */}
        {error && (
          <Card variant="elevated" className="mb-8">
            <CardContent className="p-6">
              <p className="font-medium text-destructive mb-1">Error loading quizzes</p>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <Button 
                variant="outline"
                onClick={fetchQuizzes}
                className="text-sm"
              >
                Try again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Small library message */}
        {!isLoading && quizzes.length > 0 && quizzes.length <= 3 && (
          <Card variant="glass" className="text-center mb-8">
            <CardContent className="p-6">
              <p className="font-medium text-foreground mb-2">
                Not many quizzes yet? That&apos;s okay — we&apos;re building more each week.
              </p>
              <p className="text-muted-foreground">
                Want to request a topic? <Link href="/contact" className="text-primary hover:text-primary/80 underline font-medium">Send us a message</Link>.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Quizzes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {isLoading && currentPage !== 1 ? (
            // Enhanced loading skeleton cards for pagination
            Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} variant="elevated" className="overflow-hidden group">
                <div className="h-48 bg-muted animate-pulse relative">
                </div>
                <CardContent className="p-6 space-y-4">
                  <div className="flex gap-2">
                    <div className="h-6 w-16 bg-muted animate-pulse rounded-full"></div>
                    <div className="h-6 w-20 bg-muted animate-pulse rounded-full"></div>
                  </div>
                  <div className="h-8 bg-muted animate-pulse rounded-lg"></div>
                  <div className="h-5 bg-muted animate-pulse rounded w-3/4"></div>
                  <div className="h-5 bg-muted animate-pulse rounded w-1/2"></div>
                  <div className="flex justify-between items-center pt-4">
                    <div className="h-8 w-16 bg-muted animate-pulse rounded"></div>
                    <div className="h-10 w-24 bg-muted animate-pulse rounded-lg"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : quizzes.length > 0 ? (
            quizzes.map((quiz) => (
              <EnhancedQuizCard 
                key={quiz.id}
                quiz={{
                  id: quiz.id,
                  title: quiz.title,
                  description: quiz.description,
                  category: quiz.category,
                  difficulty: quiz.difficulty,
                  total_questions: quiz.total_questions,
                  duration_minutes: quiz.duration_minutes,
                  image_url: quiz.image_url,
                  is_published: true,
                  created_at: quiz.created_at || new Date().toISOString()
                }}
              />
            ))
          ) : (
            // Enhanced Empty State
            <div className="col-span-full text-center py-12">
              <Card variant="elevated" className="max-w-md mx-auto border-border shadow-sm bg-background">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Brain className="text-white h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">No quizzes found</h3>
                  <p className="text-muted-foreground mb-6">
                    We don&apos;t have any quizzes matching your current filters yet.
                  </p>
                  <Button
                    onClick={() => {
                      setSelectedCategory('all')
                      setSelectedDifficulty('all')
                    }}
                    className="bg-primary hover:bg-secondary text-white hover:text-black"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center">
            <Card variant="elevated">
              <CardContent className="p-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={pagination.totalPages}
                  totalItems={pagination.total}
                  itemsPerPage={pagination.limit}
                  onPageChange={handlePageChange}
                />
              </CardContent>
            </Card>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
