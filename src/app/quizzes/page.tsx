'use client'

import { logger } from '@/lib/logger'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Brain, Loader2, Filter, RefreshCcw } from 'lucide-react'
import { Pagination } from '@/components/ui/Pagination'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EnhancedQuizCard } from '@/components/cards/EnhancedQuizCard'
import { QuizListCard } from '@/components/cards/QuizListCard'
import { getHeroImage } from '@/lib/imageMapping'
import { quizDifficulties } from '@/lib/quizConstants'
import { useQuizzes, useQuizCategories } from '@/hooks/useQuizQueries'
import { Badge } from '@/components/ui/badge'
import { TextInput, SelectInput } from '@/components/ui/FormInputs'

interface PaginationData {
  page: number
  limit: number
  total: number
  totalPages: number
  hasMore: boolean
}

export default function QuizzesPageWithReactQuery() {
  // Filter and pagination state
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const itemsPerPage = 9

  // Memoized filters for React Query
  const filters = useMemo(() => ({
    search: searchTerm.trim(),
    category: selectedCategory,
    difficulty: selectedDifficulty,
    published: true, // Only show published quizzes on public page
    page: currentPage,
    limit: itemsPerPage
  }), [searchTerm, selectedCategory, selectedDifficulty, currentPage])

  // React Query hooks - automatically handles loading, error, and caching!
  const { 
    data: quizData, 
    isLoading, 
    error,
    isStale,
    isFetching,
    refetch
  } = useQuizzes(filters)
  
  const categories = useQuizCategories()

  // Extract data with fallbacks
  const quizzes = quizData?.quizzes || []
  const totalQuizzes = quizData?.total || 0
  const totalPages = quizData?.totalPages || 1
  const categoriesLoading = false // Categories derive from quizzes, so no separate loading state

  // Pagination helpers
  const pagination: PaginationData = {
    page: currentPage,
    limit: itemsPerPage,
    total: totalQuizzes,
    totalPages,
    hasMore: currentPage < totalPages
  }

  // Event handlers
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
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
      {/* Hero Section - Mobile First */}
      <section className="relative py-12 md:py-16 lg:py-20 bg-gradient-to-br from-primary/5 via-white to-secondary/5">
        <div className="absolute inset-0 bg-grid-primary/[0.02] bg-[size:30px_30px] md:bg-[size:50px_50px]" />
        <div className="container mx-auto px-2 sm:px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium mb-4 md:mb-6">
              <Brain className="w-3 h-3 md:w-4 md:h-4" />
              Test Your Knowledge
            </div>
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight">
              Practice English Quizzes
            </h1>
            <p className="text-base md:text-xl text-gray-600 mb-6 md:mb-8 leading-relaxed px-2">
              Challenge yourself with our comprehensive collection of English language quizzes. 
              From grammar basics to advanced comprehension, find the perfect quiz for your level.
            </p>
            
            {/* Quick Stats - Mobile Optimized */}
            <div className="grid grid-cols-3 md:grid-cols-3 gap-3 md:gap-6 max-w-sm md:max-w-2xl mx-auto mb-6 md:mb-8">
              <Card variant="glass" className="p-3 md:p-4">
                <div className="text-lg md:text-2xl font-bold text-primary">{totalQuizzes}</div>
                <div className="text-xs md:text-sm text-gray-600">Available Quizzes</div>
              </Card>
              <Card variant="glass" className="p-3 md:p-4">
                <div className="text-lg md:text-2xl font-bold text-primary">{categories.length}</div>
                <div className="text-xs md:text-sm text-gray-600">Categories</div>
              </Card>
              <Card variant="glass" className="p-3 md:p-4">
                <div className="text-lg md:text-2xl font-bold text-primary">Free</div>
                <div className="text-xs md:text-sm text-gray-600">Practice Tests</div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section - Mobile First */}
      <section className="py-4 md:py-6 border-b bg-white/80 backdrop-blur-sm sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-2 sm:px-4">
          {/* Mobile-first search and filter toggle */}
          <div className="space-y-4">
            {/* Search Bar - Full width on mobile */}
            <div className="w-full">
              <TextInput
                placeholder="Search quizzes..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full text-base md:text-sm"
              />
            </div>

            {/* Filter Controls Row */}
            <div className="flex items-center justify-between gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="gap-2 text-sm"
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                    {[searchTerm, selectedCategory, selectedDifficulty].filter(Boolean).length}
                  </Badge>
                )}
              </Button>

              <div className="flex items-center gap-2">
                {/* Refresh Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetch()}
                  disabled={isFetching}
                  className="gap-2 text-sm"
                >
                  <RefreshCcw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">{isFetching ? 'Refreshing...' : 'Refresh'}</span>
                </Button>

                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-gray-600 hover:text-gray-900 text-sm"
                  >
                    <span className="hidden sm:inline">Clear</span>
                    <span className="sm:hidden">✕</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Advanced Filters - Mobile Optimized */}
            {showAdvancedFilters && (
              <div className="pt-4 border-t space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <SelectInput
                      value={selectedCategory || 'all'}
                      onChange={handleCategoryChange}
                      options={[
                        { value: 'all', label: 'All Categories' },
                        ...categories.map(cat => ({ value: cat, label: cat }))
                      ]}
                      placeholder="All Categories"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulty
                    </label>
                    <SelectInput
                      value={selectedDifficulty || 'all'}
                      onChange={handleDifficultyChange}
                      options={[
                        { value: 'all', label: 'All Difficulties' },
                        ...quizDifficulties.map(diff => ({ 
                          value: diff, 
                          label: diff.charAt(0).toUpperCase() + diff.slice(1) 
                        }))
                      ]}
                      placeholder="All Difficulties"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Results Count and Status - Mobile Friendly */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span>
                  {quizzes.length} of {totalQuizzes} quizzes
                  {hasActiveFilters && ' (filtered)'}
                </span>
                {isStale && (
                  <Badge variant="outline" className="text-xs">
                    Stale
                  </Badge>
                )}
              </div>
              {isFetching && (
                <div className="flex items-center gap-2 text-primary">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Content Section - Mobile First */}
      <section className="py-6 md:py-12">
        <div className="container mx-auto px-2 sm:px-4">
          {/* Loading State - Wider Cards on Mobile */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="p-4 md:p-6">
                  <div className="animate-pulse">
                    <div className="h-3 md:h-4 bg-gray-200 rounded w-3/4 mb-3 md:mb-4"></div>
                    <div className="h-2 md:h-3 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-2 md:h-3 bg-gray-200 rounded w-2/3 mb-3 md:mb-4"></div>
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

          {/* Quiz Grid - Wider Cards on Mobile */}
          {!isLoading && !error && quizzes.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-6">
              {quizzes.map((quiz) => (
                <QuizListCard
                  key={quiz.id}
                  quiz={quiz}
                />
              ))}
            </div>
          )}

          {/* Pagination - Mobile Friendly */}
          {!isLoading && !error && totalPages > 1 && (
            <div className="mt-8 md:mt-12 px-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalQuizzes}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                isLoading={isFetching}
              />
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
