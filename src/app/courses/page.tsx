'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase, Course } from '@/lib/supabase'
import { getCourses } from '@/lib/database-operations'

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
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedLevel, setSelectedLevel] = useState<string>('all')

  // Get unique categories from courses
  const [categories, setCategories] = useState<string[]>([])

  const fetchCourses = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const filters = {
        is_published: true,
        ...(selectedCategory !== 'all' && { category: selectedCategory }),
        ...(selectedLevel !== 'all' && { level: selectedLevel })
      }

      const data = await getCourses(filters)
      setCourses(data || [])
      
      // Extract unique categories
      const uniqueCategories = Array.from(new Set(data?.map(course => course.category) || []))
      setCategories(uniqueCategories)
      
    } catch (err) {
      console.error('Error fetching courses:', err)
      setError('Failed to load courses')
    } finally {
      setIsLoading(false)
    }
  }, [selectedCategory, selectedLevel])

  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  const getLevelBadgeColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-700 border-green-200'
      case 'intermediate': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'advanced': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-600 border-gray-200'
    }
  }

  const formatLevel = (level: string) => {
    return level.charAt(0).toUpperCase() + level.slice(1)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <section className="relative pt-24 pb-16 px-6 lg:px-8 overflow-hidden">
          <div className="relative max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight mb-6 text-black">
              Master New Skills
              <span className="block text-red-600 mt-2">Step by Step</span>
            </h1>
            <p className="text-base md:text-lg text-gray-600">Loading courses...</p>
            <div className="mt-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-6 lg:px-8 overflow-hidden bg-white">
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-gray-100 text-black px-4 py-2 rounded-full text-sm font-medium mb-8 border border-gray-200">
            <span className="w-2 h-2 bg-red-600 rounded-full"></span>
            Course Catalog
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6 text-black">
            Master New Skills
            <span className="block text-red-600 mt-2">Step by Step</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
            Discover comprehensive courses designed by expert instructors to accelerate your learning journey.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          {/* Filters */}
          <div className="mb-12 space-y-6">
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
              <div>
                <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-3 text-black">Available Courses</h2>
                <p className="text-base md:text-lg text-gray-600">
                  Showing {courses.length} course{courses.length !== 1 ? 's' : ''}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="min-w-[160px]">
                  <label htmlFor="category" className="block text-sm font-bold mb-2 text-black">Category</label>
                  <select
                    id="category"
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value)
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-black font-medium focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div className="min-w-[160px]">
                  <label htmlFor="level" className="block text-sm font-bold mb-2 text-black">Level</label>
                  <select
                    id="level"
                    value={selectedLevel}
                    onChange={(e) => {
                      setSelectedLevel(e.target.value)
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-black font-medium focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
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
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-8 shadow-sm">
              <p className="font-bold">Error loading courses</p>
              <p className="text-sm mt-1">{error}</p>
              <button 
                onClick={fetchCourses}
                className="mt-3 text-sm underline hover:no-underline font-medium"
              >
                Try again
              </button>
            </div>
          )}

          {/* Courses Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8 animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-xl mb-6"></div>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                      <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                    </div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                    <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))
            ) : courses.length > 0 ? (
              courses.map((course) => (
                <div key={course.id} className="group">
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full overflow-hidden">
                    <div className="relative h-48 bg-gray-100 overflow-hidden">
                      {course.image_url ? (
                        <Image
                          src={course.image_url}
                          alt={course.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <div className="text-4xl font-black text-gray-400">
                            {course.title.charAt(0).toUpperCase()}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-8 flex-1 flex flex-col">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full">
                          {course.category}
                        </span>
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                          course.level?.toLowerCase() === 'beginner' ? 'bg-green-100 text-green-800' :
                          course.level?.toLowerCase() === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {formatLevel(course.level)}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold tracking-tight mb-3 text-black">
                        {course.title}
                      </h3>

                      <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed flex-1">
                        {course.description}
                      </p>

                      <div className="text-sm text-gray-500 mb-4">
                        <p className="font-medium">Instructor: {course.instructor_name}</p>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{course.duration}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span>{course.student_count} students</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-auto">
                        <div className="text-2xl font-black text-black">
                          ${course.price}
                        </div>
                        <Link 
                          href={`/courses/${course.id}`}
                          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold transition-colors"
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
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold tracking-tight mb-4 text-black">No Courses Available</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
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
                    }}
                    className="border-2 border-black text-black hover:bg-black hover:text-white px-6 py-3 rounded-lg font-bold transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
