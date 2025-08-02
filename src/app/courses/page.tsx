"use client"

import { logger } from '@/lib/logger'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase, Course } from '@/lib/supabase'
import { getCourses } from '@/lib/database-operations'
import { Button } from '@/components/ui/button'
import { LinkButton } from '@/components/ui/LinkButton'
import { Container, Section } from '@/components/ui/Layout'
import { ElevatedCard } from '@/components/ui/ElevatedCard'
import { SectionHeading, HeroHeading, Badge } from '@/components/ui/Typography'

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
      logger.error('Error fetching courses:', err)
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
      case 'beginner': return 'badge-success'
      case 'intermediate': return 'badge-warning'
      case 'advanced': return 'badge-error'
      default: return 'badge-neutral'
    }
  }

  const formatLevel = (level: string) => {
    return level.charAt(0).toUpperCase() + level.slice(1)
  }

  if (isLoading) {
    return (
      <div className="content-wrapper">
        <section className="hero-section">
          <div className="section-container text-center">
            <h1 className="heading-hero mb-6">
              Master New Skills
              <span className="block text-primary mt-2">Step by Step</span>
            </h1>
            <p className="text-body-lg">Loading courses...</p>
            <div className="mt-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
            {/* Hero Section */}
      <Section variant="muted" spacing="lg">
        <Container className="text-center pt-16 md:pt-20">
          <Badge className="mb-8">
            <span className="w-2 h-2 bg-red-600 rounded-full"></span>
            Our Courses
          </Badge>
          <HeroHeading className="mb-8">
            Discover Your Perfect
            <span className="block text-red-600 mt-2">Learning Path</span>
          </HeroHeading>
          <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
            Explore our comprehensive collection of courses designed to help you achieve your goals.
          </p>
        </Container>
      </Section>

      {/* Main Content */}
      <Section>
        <Container>
          {/* Filters */}
          <div className="mb-12 space-y-6">
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
              <div>
                <SectionHeading className="mb-3">Available Courses</SectionHeading>
                <p className="text-lg text-gray-600">
                  Showing {courses.length} course{courses.length !== 1 ? 's' : ''}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="min-w-[160px]">
                  <label htmlFor="category" className="block text-sm font-bold mb-2 text-gray-900">Category</label>
                  <select
                    id="category"
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value)
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white text-gray-900"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div className="min-w-[160px]">
                  <label htmlFor="level" className="block text-sm font-bold mb-2 text-gray-900">Level</label>
                  <select
                    id="level"
                    value={selectedLevel}
                    onChange={(e) => {
                      setSelectedLevel(e.target.value)
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white text-gray-900"
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
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
              <p className="font-bold text-red-800">Error loading courses</p>
              <p className="text-sm mt-1 text-red-600">{error}</p>
              <button 
                onClick={fetchCourses}
                className="mt-3 text-sm underline hover:no-underline font-medium text-red-700"
              >
                Try again
              </button>
            </div>
          )}

          {/* Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <ElevatedCard key={index}>
                  <div className="h-48 bg-gray-200 animate-pulse mb-6"></div>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <div className="h-6 w-16 bg-gray-200 animate-pulse rounded-full"></div>
                      <div className="h-6 w-20 bg-gray-200 animate-pulse rounded-full"></div>
                    </div>
                    <div className="h-8 bg-gray-200 animate-pulse rounded"></div>
                    <div className="h-5 bg-gray-200 animate-pulse rounded w-3/4"></div>
                    <div className="h-5 bg-gray-200 animate-pulse rounded w-1/2"></div>
                  </div>
                </ElevatedCard>
              ))
            ) : courses.length > 0 ? (
              courses.map((course) => (
                <div key={course.id} className="group">
                  <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                    
                    {/* Course Image */}
                    <div className="relative h-48 bg-gray-100">
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

                    {/* Content Section */}
                    <div className="p-6 bg-white">
                      {/* Category and Level Badges */}
                      <div className="flex gap-2 mb-3">
                        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-500 hover:bg-red-600 text-white">
                          {course.category || 'Grammar'}
                        </div>
                        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-500 hover:bg-green-600 text-white">
                          {formatLevel(course.level)}
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight">
                        {course.title}
                      </h3>

                      {/* Description */}
                      <p className="text-gray-600 mb-4 line-clamp-2 text-sm leading-relaxed">
                        {course.description}
                      </p>

                      {/* Instructor */}
                      <p className="text-gray-700 font-medium mb-4">
                        Instructor: {course.instructor_name}
                      </p>

                      {/* Duration and Students */}
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{course.duration}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 515.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 919.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span>{course.student_count} students</span>
                        </div>
                      </div>

                      {/* Price and Button */}
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold text-gray-900">
                          ${course.price}
                        </div>
                        <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200">
                          View Course
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-20">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">No Courses Available</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  We&apos;re working on adding more courses. Check back soon for new content!
                </p>
              </div>
            )}
          </div>
        </Container>
      </Section>
    </div>
  )
}
