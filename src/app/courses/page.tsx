'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { courseAPI } from '@/lib/database'
import { Pagination } from '@/components/ui/Pagination'

interface Course {
  id: string
  title: string
  description: string
  instructor_id: string
  instructor_name: string
  category: string
  level: string
  price: number
  duration: string
  image_url?: string
  rating: number
  student_count: number
  is_published: boolean
  created_at: string
  updated_at: string
}

interface PaginationData {
  page: number
  limit: number
  total: number
  totalPages: number
  hasMore: boolean
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
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
  const [selectedLevel, setSelectedLevel] = useState<string>('all')

  const fetchCourses = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const filters = {
        page: currentPage,
        limit: 9,
        ...(selectedCategory !== 'all' && { category: selectedCategory }),
        ...(selectedLevel !== 'all' && { level: selectedLevel })
      }

      const { data, error, pagination: paginationData } = await courseAPI.getCourses(filters)
      
      if (error) {
        console.error('Error loading courses:', error)
        setError('Failed to load courses')
      } else {
        setCourses(data || [])
        setPagination(paginationData)
      }
    } catch (err) {
      console.error('Error fetching courses:', err)
      setError('Failed to load courses')
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, selectedCategory, selectedLevel])

  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const getLevelBadgeColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-700 border-green-200'
      case 'intermediate': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'advanced': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-muted text-muted-foreground border'
    }
  }

  const formatLevel = (level: string) => {
    return level.charAt(0).toUpperCase() + level.slice(1)
  }

  if (isLoading && currentPage === 1) {
    return (
      <div className="min-h-screen bg-background">
        <section className="relative pt-24 pb-16 px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
              Master English
              <span className="block text-primary mt-2">Step by Step</span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground">Loading English courses...</p>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
            Master English
            <span className="block text-primary mt-2">Step by Step</span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground">
            Discover comprehensive English courses designed by certified language instructors.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Filters */}
          <div className="mb-12 space-y-6">
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
              <div>
                <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-2">English Courses</h2>
                <p className="text-sm md:text-base text-muted-foreground">
                  Showing {((currentPage - 1) * pagination.limit + 1)} - {Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total} courses
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="min-w-[160px]">
                  <label htmlFor="category" className="block text-sm font-medium mb-2">Category</label>
                  <select
                    id="category"
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="all">All Categories</option>
                    <option value="Development">Development</option>
                    <option value="Design">Design</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Cloud Computing">Cloud Computing</option>
                    <option value="Mobile">Mobile</option>
                  </select>
                </div>

                <div className="min-w-[160px]">
                  <label htmlFor="level" className="block text-sm font-medium mb-2">Level</label>
                  <select
                    id="level"
                    value={selectedLevel}
                    onChange={(e) => {
                      setSelectedLevel(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
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
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-8">
              <p className="font-medium">Error loading courses</p>
              <p className="text-sm mt-1">{error}</p>
              <button 
                onClick={fetchCourses}
                className="mt-2 text-sm underline hover:no-underline"
              >
                Try again
              </button>
            </div>
          )}

          {/* Courses Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="card p-6 animate-pulse">
                  <div className="h-48 bg-muted rounded-lg mb-4"></div>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <div className="h-5 w-16 bg-muted rounded-full"></div>
                      <div className="h-5 w-20 bg-muted rounded-full"></div>
                    </div>
                    <div className="h-6 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              ))
            ) : courses.length > 0 ? (
              courses.map((course) => (
                <div key={course.id} className="group">
                  <div className="card hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full">
                    <div className="relative h-48 bg-muted overflow-hidden rounded-t-lg">
                      {course.image_url ? (
                        <Image
                          src={course.image_url}
                          alt={course.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                          <div className="text-4xl font-bold text-primary/40">
                            {course.title.charAt(0).toUpperCase()}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full border border-primary/20">
                          {course.category}
                        </span>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getLevelBadgeColor(course.level)}`}>
                          {formatLevel(course.level)}
                        </span>
                      </div>

                      <h3 className="text-xl font-semibold tracking-tight mb-3">
                        {course.title}
                      </h3>

                      <p className="text-muted-foreground mb-4 line-clamp-2 leading-relaxed flex-1">
                        {course.description}
                      </p>

                      <div className="text-sm text-muted-foreground mb-4">
                        <p className="font-medium">Instructor: {course.instructor_name}</p>
                      </div>

                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{course.duration}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span>{course.student_count} students</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-auto">
                        <div className="text-2xl font-bold text-primary">
                          ${course.price}
                        </div>
                        <Link 
                          href={`/courses/${course.id}`}
                          className="btn-default"
                        >
                          View Course
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-20">
                <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-8">
                  <svg className="w-12 h-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold tracking-tight mb-4">No Courses Available</h3>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  {selectedCategory !== 'all' || selectedLevel !== 'all' 
                    ? 'No courses found matching your selected filters. Try adjusting your search criteria.'
                    : 'We\'re working on adding more courses. Check back soon for new content!'
                  }
                </p>
                {(selectedCategory !== 'all' || selectedLevel !== 'all') && (
                  <button 
                    onClick={() => {
                      setSelectedCategory('all')
                      setSelectedLevel('all')
                      setCurrentPage(1)
                    }}
                    className="btn-outline"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Pagination */}
          {!isLoading && courses.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.total}
              itemsPerPage={pagination.limit}
              onPageChange={handlePageChange}
              isLoading={isLoading}
            />
          )}
        </div>
      </section>
    </div>
  )
}
