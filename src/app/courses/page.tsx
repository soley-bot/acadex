"use client"

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Course } from '@/lib/supabase'
import { useOptimizedCourses, useOptimizedCategories } from '@/hooks/useCourseQueries'
import { Pagination } from '@/components/ui/Pagination'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CourseCard } from '@/components/cards/CourseCard'
import { 
  BookOpen, 
  Filter, 
  Loader2, 
  ArrowLeft,
  Target,
  GraduationCap,
  MessageCircle
} from 'lucide-react'
// Temporarily disabled to isolate layout issue
// import { useMemoryMonitor } from '@/lib/memory-optimization'
// import { useEnhancedWebVitals } from '@/lib/safe-web-vitals'

export default function CoursesPage() {
  // Temporarily disabled to isolate layout issue
  // const memoryStats = useMemoryMonitor('CoursesPage')
  // useEnhancedWebVitals((report) => {
  //   if (process.env.NODE_ENV === 'development' && report.metric === 'LCP') {
  //     console.info(`📚 Courses Performance: ${report.value.toFixed(0)}ms`)
  //   }
  // })

  const [currentPage, setCurrentPage] = useState(1)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedLevel, setSelectedLevel] = useState<string>('all')

  // React Query hooks
  const { 
    data: coursesData, 
    isLoading: coursesLoading, 
    error: coursesError,
    refetch: refetchCourses 
  } = useOptimizedCourses({
    page: currentPage,
    limit: 9,
    ...(selectedCategory !== 'all' && { category: selectedCategory }),
    ...(selectedLevel !== 'all' && { level: selectedLevel })
  })

  const { 
    data: categories = [], 
    isLoading: categoriesLoading 
  } = useOptimizedCategories()

  // Extract data from React Query response
  const courses = coursesData?.data || []
  const pagination = coursesData?.pagination || {
    page: 1,
    limit: 9,
    total: 0,
    totalPages: 0,
    hasMore: false
  }

  const isLoading = coursesLoading
  const error = coursesError ? 'Failed to load courses' : null

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setCurrentPage(1)
  }

  const handleLevelChange = (level: string) => {
    setSelectedLevel(level)
    setCurrentPage(1)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-20">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Loading Courses
            </h1>
            <p className="text-lg text-muted-foreground mb-8">Please wait while we fetch the latest courses...</p>
            <div className="flex items-center justify-center">
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

  if (error || coursesError) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-20">
          <div className="text-center">
            <div className="mb-8">
              <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                Unable to Load Courses
              </h1>
              <p className="text-lg text-muted-foreground mb-4">
                {error || 'We encountered an error while fetching the courses. Please try again.'}
              </p>
              {coursesError && (
                <p className="text-sm text-muted-foreground mb-8 font-mono bg-muted p-4 rounded-lg inline-block">
                  Error: {coursesError instanceof Error ? coursesError.message : 'Unknown error'}
                </p>
              )}
              <div className="flex gap-4 justify-center mt-8">
                <Button onClick={() => refetchCourses()} className="gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Try Again
                </Button>
                <Link href="/dashboard">
                  <Button variant="outline" className="gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Hero Section - Full-Bleed Modern Design */}
      <section className="relative min-h-[70vh] lg:min-h-[80vh]">
        {/* Full-bleed background */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero/learning-together.jpg"
            alt="Students learning together in collaborative environment"
            fill
            className="object-cover"
            priority
            quality={90}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
        </div>

        {/* Content overlay */}
        <div className="container mx-auto px-6 sm:px-8 lg:px-12 max-w-7xl relative z-10 min-h-[70vh] lg:min-h-[80vh] flex items-center">
          <div className="max-w-3xl py-20 lg:py-32">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-full text-sm font-semibold shadow-lg mb-8">
              <BookOpen className="w-4 h-4" />
              <span>Our Courses</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 drop-shadow-2xl">
              Start Small.
              <span className="block mt-2">Learn What Matters.</span>
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-white/95 leading-relaxed mb-8 drop-shadow-lg">
              Acadex is still growing — but we&apos;ve created a few courses to help you build real skills in English, communication, and study habits.
            </p>
            
            <p className="text-lg md:text-xl text-white font-semibold drop-shadow-lg">
              No pressure. Learn at your own pace.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content - Clean Background */}
      <section className="bg-gradient-to-br from-slate-50 via-white to-blue-50 py-12 md:py-16 lg:py-20">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12 max-w-7xl space-y-12">
          
          {/* Header with Icon */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg">
              <Target className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Courses You Can Start Today</h2>
              <p className="text-lg text-gray-600 mt-1">
                Showing <span className="font-semibold text-secondary">{courses.length}</span> of <span className="font-semibold text-primary">{pagination.total}</span> course{pagination.total !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Filters Bar - Flat Design */}
          <div className="flex flex-col md:flex-row md:items-end gap-4 pb-8 border-b border-gray-200">
            <div className="flex-1 min-w-[200px]">
              <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Filter className="h-4 w-4 text-primary" />
                Category
              </label>
              <Select 
                value={selectedCategory} 
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categoriesLoading ? (
                    <SelectItem value="loading">Loading...</SelectItem>
                  ) : (
                    categories.map((category: string) => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label htmlFor="level" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-secondary" />
                Level
              </label>
              <Select 
                value={selectedLevel} 
                onValueChange={handleLevelChange}
              >
                <SelectTrigger id="level">
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[200px] md:max-w-md">
              <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center gap-3">
                <MessageCircle className="h-5 w-5 text-primary flex-shrink-0" />
                <p className="text-sm text-gray-700">
                  Just start where you feel curious
                </p>
              </div>
            </div>
          </div>

            {/* Error State - Flat Design */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6 flex items-start gap-4">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-red-900 mb-1">Error loading courses</p>
                <p className="text-red-700 text-sm mb-3">{error}</p>
                <Button 
                  onClick={() => refetchCourses()}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Try again
                </Button>
              </div>
            </div>
          )}

          {/* Small library message - Flat Design */}
          {!isLoading && courses.length > 0 && courses.length <= 3 && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-primary rounded-lg p-6 text-center">
              <p className="text-base font-semibold text-gray-900 mb-2">
                We&apos;re just getting started — more lessons are being written and tested every week.
              </p>
              <p className="text-gray-700 text-sm">
                If you&apos;d like to request a course or topic, feel free to <Link href="/contact" className="text-primary hover:text-secondary font-semibold underline">contact us</Link>.
              </p>
            </div>
          )}

          {/* Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {isLoading && courses.length === 0 ? (
              // Enhanced loading skeleton cards
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden group hover:shadow-2xl transition-all duration-300">
                  <div className="h-48 bg-gradient-to-br from-primary/10 via-gray-100 to-secondary/10 animate-pulse relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex gap-2">
                      <div className="h-6 w-16 bg-gradient-to-r from-primary/20 to-secondary/20 animate-pulse rounded-full"></div>
                      <div className="h-6 w-20 bg-gradient-to-r from-secondary/20 to-primary/20 animate-pulse rounded-full"></div>
                    </div>
                    <div className="h-8 bg-gray-200 animate-pulse rounded-lg"></div>
                    <div className="h-5 bg-gray-200 animate-pulse rounded w-3/4"></div>
                    <div className="h-5 bg-gray-200 animate-pulse rounded w-1/2"></div>
                    <div className="flex justify-between items-center pt-4">
                      <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                      <div className="h-10 w-24 bg-primary/20 animate-pulse rounded-lg"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : courses.length > 0 ? (
              courses.map((course: Course) => (
                <CourseCard 
                  key={course.id} 
                  course={course} 
                  priority={currentPage === 1} 
                />
              ))
            ) : (
              <div className="col-span-full text-center py-20">
                <div className="bg-white rounded-3xl shadow-2xl max-w-md mx-auto p-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <BookOpen className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">No Courses Available</h3>
                  <p className="text-lg text-gray-600 leading-relaxed mb-6">
                    We&apos;re working on adding more courses. Check back soon for new content!
                  </p>
                  <div className="flex justify-center">
                    <span className="inline-flex items-center gap-2 bg-primary/10 text-primary px-6 py-3 rounded-full text-sm font-semibold">
                      <Target className="h-4 w-4" />
                      Coming Soon
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Pagination - Flat Design */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center pt-8 border-t border-gray-200">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </section>
    </>
  )
}

