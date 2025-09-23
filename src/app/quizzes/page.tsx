'use client'

import { logger } from '@/lib/logger'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Brain, Loader2, Filter, RefreshCcw, BookCheck, Search } from 'lucide-react'
import { Pagination } from '@/components/ui/Pagination'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { QuizListCard } from '@/components/cards/QuizListCard'
import { getHeroImage } from '@/lib/imageMapping'
import { quizDifficulties } from '@/lib/quizConstants'
import { Badge } from '@/components/ui/badge'
import { TextInput } from '@/components/ui/FormInputs'
import { usePublicQuizzes, usePublicQuizCategories } from '@/hooks/usePublicQuizzes'
// Temporarily disabled to isolate layout issue
// import { useMemoryMonitor } from '@/lib/memory-optimization'
// import { useEnhancedWebVitals } from '@/lib/safe-web-vitals'
import { useDebounce } from '@/lib/performance'

interface PaginationData {
  page: number
  limit: number
  total: number
  totalPages: number
  hasMore: boolean
}

export default function QuizzesPageWithReactQuery() {
  // Temporarily disabled performance monitoring to isolate layout issue
  // const memoryStats = useMemoryMonitor('QuizzesPage')
  // useEnhancedWebVitals((report) => {
  //   if (process.env.NODE_ENV === 'development' && report.metric === 'LCP') {
  //     console.info(`✅ Quizzes Page Performance: ${report.metric} = ${report.value.toFixed(0)}ms`)
  //   }
  // })

  // Filter and pagination state
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const itemsPerPage = 9

  // Optimized search with reduced debounce (safe optimization)
  const optimizedSearchTerm = useDebounce(searchTerm, 150) // Reduced from 300ms to 150ms

  // Memoized filters for React Query (using optimized search with fallback)
  const filters = useMemo(() => ({
    search: (optimizedSearchTerm || searchTerm).trim(), // Fallback to original if optimization fails
    category: selectedCategory,
    difficulty: selectedDifficulty,
    published: true, // Only show published quizzes on public page
    page: currentPage,
    limit: itemsPerPage
  }), [optimizedSearchTerm, searchTerm, selectedCategory, selectedDifficulty, currentPage])

  // Optimized React Query hooks - using dedicated public API endpoints!
  const { 
    data: quizData, 
    isLoading, 
    error,
    refetch
  } = usePublicQuizzes(filters)
  
  // Extract categories from current quiz data (no separate API call)
  const categories = usePublicQuizCategories(quizData?.quizzes || [])

  // Extract data with fallbacks from optimized API
  const quizzes = quizData?.quizzes || []
  const totalQuizzes = quizData?.pagination?.total || 0
  const totalPages = quizData?.pagination?.totalPages || 1
  const categoriesLoading = false // Categories derive from quizzes, so no separate loading state

  // Pagination helpers
  const pagination: PaginationData = {
    page: currentPage,
    limit: itemsPerPage,
    total: totalQuizzes,
    totalPages,
    hasMore: currentPage < totalPages
  }

  // Event handlers (using optimized search)
  const handleSearchChange = (value: string) => {
    setSearchTerm(value) // The debounced version will automatically update
    setCurrentPage(1) // Reset to first page on search
  }

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value === 'all' ? '' : value)
    setCurrentPage(1)
  }

  const handleDifficultyChange = (value: string) => {
    setSelectedDifficulty(value === 'all' ? '' : value)
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('')
    setSelectedDifficulty('')
    setCurrentPage(1)
  }

  const hasActiveFilters = searchTerm || selectedCategory || selectedDifficulty

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - IELTS Focused */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-slate-50 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]"></div>
        
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-20 lg:py-24 relative">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Content */}
            <div className="text-center lg:text-left space-y-6 md:space-y-8">
              <div className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full text-sm font-semibold shadow-lg">
                <BookCheck className="w-4 h-4" />
                Expert-Verified Practice
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900">
                Master the IELTS Skills That Matter,
                <span className="block text-primary font-extrabold mt-2">One Quiz at a Time.</span>
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Stop practicing your mistakes. Our targeted quizzes help you isolate and fix the common errors in grammar and vocabulary that are holding back your score. 
                <span className="font-medium text-gray-900"> Start learning smarter, not just harder.</span>
              </p>
            </div>

            {/* Hero Image */}
            <div className="relative order-first lg:order-last">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-white p-2">
                <Image
                  src="/images/hero/online-learning.jpg"
                  alt="A student focused on IELTS preparation using the Acadex platform"
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
                        <span className="font-medium text-gray-900">IELTS Skill Practice</span>
                      </div>
                      <span className="font-bold text-secondary">Boost Your Score</span>
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
      </section>

      {/* Filters Section - Compact Layout */}
      <section className="py-3 md:py-4 border-b bg-gradient-to-r from-background/95 via-background to-background/95 backdrop-blur-md sticky top-0 z-40 shadow-sm border-border/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Search and Filter Controls - Compact Single Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Bar - More compact */}
            <div className="relative flex-1 min-w-0 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search topics..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 h-9 text-sm border-border/40 focus:border-primary/60 focus:ring-1 focus:ring-primary/30 bg-background/80 backdrop-blur-sm"
              />
            </div>

            {/* Filter Controls - Compact */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="gap-2 text-xs h-9 px-3"
              >
                <Filter className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Filters</span>
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                    {[searchTerm, selectedCategory, selectedDifficulty].filter(Boolean).length}
                  </Badge>
                )}
              </Button>

              {/* Compact Refresh Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
                className="gap-2 text-xs h-9 px-3"
              >
                <RefreshCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{isLoading ? 'Updating...' : 'Refresh'}</span>
              </Button>
            </div>
          </div>

          {/* Advanced Filters - Compact */}
          {showAdvancedFilters && (
              <div className="pt-3 border-t space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-900 mb-1">
                      Category
                    </label>
                    <select
                      value={selectedCategory || 'all'}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className="w-full h-8 text-sm px-3 py-1 border-2 border-gray-300 rounded-md 
                        focus:ring-2 focus:ring-primary/30 focus:border-primary/60 
                        bg-white text-gray-900
                        hover:border-gray-400
                        transition-colors duration-200
                        cursor-pointer"
                    >
                      <option value="all">All Categories</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat} className="py-1">
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-900 mb-1">
                      Difficulty
                    </label>
                    <select
                      value={selectedDifficulty || 'all'}
                      onChange={(e) => handleDifficultyChange(e.target.value)}
                      className="w-full h-8 text-sm px-3 py-1 border-2 border-gray-300 rounded-md 
                        focus:ring-2 focus:ring-primary/30 focus:border-primary/60 
                        bg-white text-gray-900
                        hover:border-gray-400
                        transition-colors duration-200
                        cursor-pointer"
                    >
                      <option value="all">All Difficulties</option>
                      {quizDifficulties.map(diff => (
                        <option key={diff} value={diff} className="py-1">
                          {diff.charAt(0).toUpperCase() + diff.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Results Count - Compact */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs text-gray-600 pt-2">
              <div className="flex items-center gap-2">
                <span>
                  {quizzes.length} of {totalQuizzes} quizzes
                  {hasActiveFilters && ' (filtered)'}
                </span>
              </div>
              {isLoading && (
                <div className="flex items-center gap-1 text-primary">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Loading...</span>
                </div>
              )}
            </div>
          </div>
      </section>

      {/* Content Section - Compact Layout */}
      <section className="py-4 md:py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Loading State - Compact Cards */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="p-4">
                  <div className="animate-pulse">
                    <div className="h-3 bg-gray-200 rounded w-3/4 mb-3"></div>
                    <div className="h-2 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-2 bg-gray-200 rounded w-2/3 mb-3"></div>
                    <div className="flex gap-2 mb-3 md:mb-4">
                      <div className="h-5 md:h-6 bg-gray-200 rounded w-12 md:w-16"></div>
                      <div className="h-5 md:h-6 bg-gray-200 rounded w-16 md:w-20"></div>
                    </div>
                    <div className="h-8 md:h-10 bg-gray-200 rounded w-full"></div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Error State - Mobile Optimized */}
          {error && !isLoading && (
            <Card className="p-6 md:p-8 text-center mx-4 md:mx-auto max-w-md">
              <div className="text-red-500">
                <Brain className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 md:mb-4 opacity-50" />
                <h3 className="text-base md:text-lg font-semibold mb-2">Failed to Load Quizzes</h3>
                <p className="text-sm md:text-base text-gray-600 mb-4 leading-relaxed">
                  {error instanceof Error ? error.message : 'Something went wrong while loading the quizzes.'}
                </p>
                <Button onClick={() => refetch()} className="gap-2 w-full md:w-auto">
                  <RefreshCcw className="w-4 h-4" />
                  Try Again
                </Button>
              </div>
            </Card>
          )}

          {/* Empty State - Mobile Optimized */}
          {!isLoading && !error && quizzes.length === 0 && (
            <Card className="p-6 md:p-8 text-center mx-4 md:mx-auto max-w-md">
              <Brain className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 md:mb-4 text-gray-400" />
              <h3 className="text-base md:text-lg font-semibold mb-2">No Quizzes Found</h3>
              <p className="text-sm md:text-base text-gray-600 mb-4 leading-relaxed">
                {hasActiveFilters 
                  ? "No quizzes match your current filters. Try adjusting your search criteria."
                  : "There are no published quizzes available at the moment."
                }
              </p>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters} className="w-full md:w-auto">
                  Clear All Filters
                </Button>
              )}
            </Card>
          )}

          {/* Quiz Grid - Compact Layout */}
          {!isLoading && !error && quizzes.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {quizzes.map((quiz) => (
                <QuizListCard
                  key={quiz.id}
                  quiz={quiz}
                />
              ))}
            </div>
          )}

          {/* Pagination - Compact */}
          {!isLoading && !error && totalPages > 1 && (
            <div className="mt-6 md:mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalQuizzes}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                isLoading={isLoading}
              />
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

