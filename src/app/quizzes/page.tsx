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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { QuizListCard } from '@/components/cards/QuizListCard'
import { getHeroImage } from '@/lib/imageMapping'
import { quizDifficulties } from '@/lib/quiz-constants-unified'
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
    <>
      {/* Hero Section - Full-bleed */}
      <section className="relative min-h-[70vh] lg:min-h-[80vh]">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero/online-learning.jpg"
            alt="A student focused on IELTS preparation using the Acadex platform"
            fill
            priority
            quality={90}
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        </div>

        {/* Content */}
        <div className="container mx-auto px-6 sm:px-8 lg:px-12 max-w-7xl relative z-10 min-h-[70vh] lg:min-h-[80vh] flex items-center">
          <div className="max-w-3xl py-20 lg:py-32">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-full shadow-lg mb-6">
              <BookCheck className="w-4 h-4" />
              <span className="font-medium">Expert-Verified Practice</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 drop-shadow-2xl">
              Master the IELTS Skills That Matter,
              <span className="block text-blue-300 mt-2">One Quiz at a Time.</span>
            </h1>

            <p className="text-lg text-white/95 leading-relaxed drop-shadow-lg">
              Stop practicing your mistakes. Our targeted quizzes help you isolate and fix the common errors in grammar and vocabulary that are holding back your score. 
              <span className="font-semibold"> Start learning smarter, not just harder.</span>
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="bg-gradient-to-br from-slate-50 via-white to-blue-50 py-12 md:py-16 lg:py-20">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12 max-w-7xl space-y-12">
          {/* Header with Icon */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg shrink-0">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Quizzes You Can Start Today</h2>
              <p className="text-gray-600 mt-1">
                Showing {quizzes.length} of {totalQuizzes} quizzes{hasActiveFilters && ' (filtered)'}
              </p>
            </div>
          </div>

          {/* Filters - Horizontal Layout */}
          <div className="flex flex-col md:flex-row md:items-end gap-4 pb-8 border-b border-gray-200">
            {/* Category Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <Select
                value={selectedCategory || 'all'}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Difficulty Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level
              </label>
              <Select
                value={selectedDifficulty || 'all'}
                onValueChange={handleDifficultyChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Difficulties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  {quizDifficulties.map(diff => (
                    <SelectItem key={diff} value={diff}>
                      {diff.charAt(0).toUpperCase() + diff.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search Bar */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Quizzes
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search by topic..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg 
                    focus:ring-2 focus:ring-primary/30 focus:border-primary/60 
                    bg-white"
                />
              </div>
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Active filters applied
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="gap-2"
              >
                <RefreshCcw className="w-4 h-4" />
                Clear Filters
              </Button>
            </div>
          )}
          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
                    <div className="flex gap-2 mb-4">
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                      <div className="h-6 bg-gray-200 rounded w-24"></div>
                    </div>
                    <div className="h-10 bg-gray-200 rounded w-full"></div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="border-l-4 border-red-500 bg-red-50 p-6 rounded-r-lg">
              <div className="flex items-start gap-4">
                <Brain className="w-8 h-8 text-red-500 shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-900 mb-2">Failed to Load Quizzes</h3>
                  <p className="text-red-700 mb-4">
                    {error instanceof Error ? error.message : 'Something went wrong while loading the quizzes.'}
                  </p>
                  <Button onClick={() => refetch()} variant="outline" className="gap-2">
                    <RefreshCcw className="w-4 h-4" />
                    Try Again
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && quizzes.length === 0 && (
            <div className="text-center py-12">
              <Brain className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Quizzes Found</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {hasActiveFilters 
                  ? "No quizzes match your current filters. Try adjusting your search criteria."
                  : "There are no published quizzes available at the moment."
                }
              </p>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters} className="gap-2">
                  <RefreshCcw className="w-4 h-4" />
                  Clear All Filters
                </Button>
              )}
            </div>
          )}

          {/* Quiz Grid */}
          {!isLoading && !error && quizzes.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {quizzes.map((quiz) => (
                <QuizListCard
                  key={quiz.id}
                  quiz={quiz}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!isLoading && !error && totalPages > 1 && (
            <div className="flex justify-center pt-8 border-t border-gray-200">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      </section>
    </>
  )
}


