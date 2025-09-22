"use client"

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Course } from '@/lib/supabase'
import { useOptimizedCourses, useOptimizedCategories } from '@/hooks/useCourseQueries'
import { Pagination } from '@/components/ui/Pagination'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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

export default function CoursesPage() {
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
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="text-center pt-16">
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

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Professional Learning Environment */}
      <div className="bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]"></div>
        
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-20 lg:py-24 relative">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Content */}
            <div className="text-center lg:text-left space-y-6 md:space-y-8">
              <div className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full text-sm font-semibold shadow-lg">
                <BookOpen className="w-4 h-4" />
                Our Courses
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground">
                Start Small.
                <span className="block text-primary font-extrabold mt-2">Learn What Matters.</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Acadex is still growing — but we&apos;ve created a few courses to help you build real skills in English, communication, and study habits.
                <br />
                <span className="font-medium text-foreground">No pressure. Learn at your own pace.</span>
              </p>
            </div>

            {/* Hero Image */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-white p-2">
                <Image
                  src="/images/hero/learning-together.jpg"
                  alt="Students learning together in collaborative environment"
                  width={600}
                  height={400}
                  className="object-cover w-full h-[400px] rounded-xl"
                  priority
                  quality={90}
                />
                {/* Image Overlay with Learning Stats */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-success rounded-full"></div>
                        <span className="font-medium text-foreground">Active learners</span>
                      </div>
                      <span className="font-bold text-secondary">Learning now</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating elements for visual interest */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-secondary/10 rounded-full blur-xl"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-primary/10 rounded-full blur-2xl"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - White Background with Sections */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
          {/* Filters Section */}
          <div className="space-y-8">
            <Card variant="elevated" className="p-6 shadow-sm bg-white">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div className="space-y-3">
                  <h2 className="text-2xl font-semibold text-foreground">Courses You Can Start Today</h2>
                  <p className="text-lg text-muted-foreground">
                    Showing <span className="font-semibold text-secondary">{courses.length}</span> of <span className="font-semibold text-primary">{pagination.total}</span> course{pagination.total !== 1 ? 's' : ''} 
                    {pagination.totalPages > 1 && ` (page ${pagination.page} of ${pagination.totalPages})`}
                  </p>
                </div>
              </div>
            
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="min-w-[160px]">
                  <label htmlFor="category" className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                    <Filter className="h-4 w-4 text-secondary" />
                    Category
                  </label>
                  <select 
                    id="category"
                    value={selectedCategory} 
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full px-4 py-3 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="all">All Categories</option>
                    {categoriesLoading ? (
                      <option disabled>Loading...</option>
                    ) : (
                      categories.map((category: string) => (
                        <option key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="min-w-[160px]">
                  <label htmlFor="level" className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-secondary" />
                    Level
                  </label>
                  <select 
                    id="level"
                    value={selectedLevel} 
                    onChange={(e) => handleLevelChange(e.target.value)}
                    className="w-full px-4 py-3 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="all">All Levels</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>
              
              {/* Helpful microcopy */}
              <div className="mt-6 pt-6 border-t border-border/50">
                <p className="text-sm text-muted-foreground text-center flex items-center justify-center gap-2">
                  <MessageCircle className="h-4 w-4 text-primary" />
                  Use the filters to explore — but don&apos;t worry, you don&apos;t need to follow a perfect path. Just start where you feel curious.
                </p>
              </div>
            </div>
            </Card>

        {/* Error State */}
        {error && (
          <Card variant="elevated" className="mb-8">
            <CardContent className="p-6">
              <p className="font-medium text-destructive mb-1">Error loading courses</p>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <Button 
                variant="outline"
                onClick={() => refetchCourses()}
                className="text-sm"
              >
                Try again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Small library message */}
        {!isLoading && courses.length > 0 && courses.length <= 3 && (
          <Card variant="elevated" className="mb-8">
            <CardContent className="p-6 text-center">
              <p className="font-medium text-secondary mb-2">
                We&apos;re just getting started — more lessons are being written and tested every week.
              </p>
              <p className="text-secondary">
                If you&apos;d like to request a course or topic, feel free to <Link href="/contact" className="underline hover:no-underline font-medium">contact us</Link>.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {isLoading && courses.length === 0 ? (
              // Enhanced loading skeleton cards
              Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} variant="glass" className="overflow-hidden group hover:shadow-xl transition-all duration-300">
                  <div className="h-48 bg-gradient-to-br from-primary/10 via-muted/30 to-secondary/10 animate-pulse relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  </div>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex gap-2">
                      <div className="h-6 w-16 bg-gradient-to-r from-primary/20 to-secondary/20 animate-pulse rounded-full"></div>
                      <div className="h-6 w-20 bg-gradient-to-r from-secondary/20 to-primary/20 animate-pulse rounded-full"></div>
                    </div>
                    <div className="h-8 bg-gradient-to-r from-muted/50 to-muted/30 animate-pulse rounded-lg"></div>
                    <div className="h-5 bg-gradient-to-r from-muted/40 to-muted/20 animate-pulse rounded w-3/4"></div>
                    <div className="h-5 bg-gradient-to-r from-muted/30 to-muted/10 animate-pulse rounded w-1/2"></div>
                    <div className="flex justify-between items-center pt-4">
                      <div className="h-8 w-16 bg-gradient-to-r from-primary/20 to-secondary/20 animate-pulse rounded"></div>
                      <div className="h-10 w-24 bg-gradient-to-r from-secondary/20 to-primary/20 animate-pulse rounded-lg"></div>
                    </div>
                  </CardContent>
                </Card>
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
                <Card variant="glass" className="max-w-md mx-auto backdrop-blur-lg border-white/20 shadow-xl">
                  <CardContent className="p-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <BookOpen className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-4">No Courses Available</h3>
                    <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed mb-6">
                      We&apos;re working on adding more courses. Check back soon for new content!
                    </p>
                    <div className="flex justify-center">
                      <span className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                        <Target className="h-4 w-4" />
                        Coming Soon
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center">
            <Card variant="glass">
              <CardContent className="p-4">
                <Pagination
                  currentPage={pagination.page}
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
  </div>
  )
}
