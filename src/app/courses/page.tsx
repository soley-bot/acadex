"use client"

import { logger } from '@/lib/logger'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase, Course } from '@/lib/supabase'
import { getCourses } from '@/lib/database-operations'
import { Typography, DisplayLG, H1, H2, H3, BodyLG, BodyMD } from '@/components/ui/Typography'
import { Container, Section, Grid, Flex } from '@/components/ui/Layout'
import Icon from '@/components/ui/Icon'

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedLevel, setSelectedLevel] = useState<string>('all')
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
      <Section 
        className="relative min-h-screen flex items-center justify-center"
        background="gradient"
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
        
        <Container size="xl" className="relative text-center">
          <H1 className="mb-6">
            Master New Skills
            <span className="block text-red-600 mt-2">Step by Step</span>
          </H1>
          <BodyLG color="muted" className="mb-8">Loading courses...</BodyLG>
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-200 border-t-red-600"></div>
          </div>
        </Container>
      </Section>
    )
  }

  return (
    <Section 
      className="relative min-h-screen"
      background="gradient"
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Hero Section */}
      <Container size="xl" className="relative py-16 md:py-24">
        <div className="text-center pt-16 md:pt-20">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-3 py-1.5 lg:px-4 lg:py-2 rounded-full text-xs lg:text-sm font-medium mb-6 lg:mb-8 shadow-lg">
            <span className="w-2 h-2 bg-white rounded-full"></span>
            Our Courses
          </div>
          <H1 className="mb-6 lg:mb-8">
            Start Small.
            <span className="block text-red-600 mt-2">Learn What Matters.</span>
          </H1>
          <BodyLG 
            color="muted" 
            className="leading-relaxed max-w-3xl mx-auto"
          >
            Acadex is still growing — but we&apos;ve created a few courses to help you build real skills in English, communication, and study habits.
            <br />
            No pressure. Learn at your own pace.
          </BodyLG>
        </div>
      </Container>

      {/* Main Content */}
      <Container size="xl" className="relative py-12 md:py-20">
        {/* Filters */}
        <div className="mb-12 space-y-6">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 lg:p-8 shadow-xl border border-white/20">
            <Flex direction="col" className="lg:flex-row" gap="lg" align="start" justify="between">
              <div>
                <H2 className="mb-3">Courses You Can Start Today</H2>
                <BodyLG color="muted">
                  Showing {courses.length} course{courses.length !== 1 ? 's' : ''} — more coming soon!
                </BodyLG>
              </div>
              
              <Flex direction="col" gap="md" className="sm:flex-row">
                <div className="min-w-[160px]">
                  <BodyMD className="font-bold mb-2">Category</BodyMD>
                  <select
                    id="category"
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value)
                    }}
                    className="w-full px-4 py-3 border border-white/30 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white/80 backdrop-blur-sm text-gray-700 shadow-lg transition-all duration-200 hover:shadow-xl"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div className="min-w-[160px]">
                  <BodyMD className="font-bold mb-2">Level</BodyMD>
                  <select
                    id="level"
                    value={selectedLevel}
                    onChange={(e) => {
                      setSelectedLevel(e.target.value)
                    }}
                    className="w-full px-4 py-3 border border-white/30 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white/80 backdrop-blur-sm text-gray-700 shadow-lg transition-all duration-200 hover:shadow-xl"
                  >
                    <option value="all">All Levels</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </Flex>
            </Flex>
            
            {/* Helpful microcopy */}
            <div className="mt-4 pt-4 border-t border-white/20">
              <BodyMD color="muted" className="text-center">
                Use the filters to explore — but don&apos;t worry, you don&apos;t need to follow a perfect path. Just start where you feel curious.
              </BodyMD>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-2xl p-6 mb-8 shadow-lg">
            <BodyMD className="font-bold text-red-800">Error loading courses</BodyMD>
            <BodyMD className="text-sm mt-1 text-red-600">{error}</BodyMD>
            <button 
              onClick={fetchCourses}
              className="mt-3 text-sm underline hover:no-underline font-medium text-red-700 transition-all duration-200"
            >
              Try again
            </button>
          </div>
        )}

        {/* Small library message */}
        {!isLoading && courses.length > 0 && courses.length <= 3 && (
          <div className="bg-blue-50/80 backdrop-blur-sm border border-blue-200 rounded-2xl p-6 mb-8 shadow-lg text-center">
            <BodyMD className="font-medium text-blue-800 mb-2">
              We&apos;re just getting started — more lessons are being written and tested every week.
            </BodyMD>
            <BodyMD className="text-blue-600">
              If you&apos;d like to request a course or topic, feel free to <Link href="/contact" className="underline hover:no-underline font-medium">contact us</Link>.
            </BodyMD>
          </div>
        )}

        {/* Courses Grid */}
        <Grid cols={1} className="md:grid-cols-2 lg:grid-cols-3 mb-12">
            {isLoading && courses.length === 0 ? (
              // Loading skeleton cards
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
            ) : courses.length > 0 ? (
              courses.map((course) => (
                <div key={course.id} className="group">
                  <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:scale-[1.02] hover:-translate-y-2">
                    
                    {/* Course Image */}
                    <div className="relative h-48 bg-gradient-to-br from-gray-100/80 to-gray-200/80 overflow-hidden">
                      {course.image_url ? (
                        <Image
                          src={course.image_url}
                          alt={course.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-red-100/80 via-orange-100/80 to-pink-100/80 backdrop-blur-sm flex items-center justify-center">
                          <div className="text-4xl font-bold text-red-500 group-hover:scale-110 transition-transform duration-300">
                            {course.title.charAt(0).toUpperCase()}
                          </div>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      {/* Floating Rating Badge */}
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-lg rounded-full px-3 py-1.5 shadow-lg border border-white/20">
                        <div className="flex items-center gap-1">
                          <Icon name="star" size={14} color="warning" />
                          <span className="text-sm font-bold text-gray-700">{course.rating}</span>
                        </div>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-6 bg-white/60 backdrop-blur-lg">
                      {/* Category and Level Badges */}
                      <div className="flex gap-2 mb-4">
                        <div className="inline-flex items-center px-3 py-1.5 rounded-full text-xs lg:text-sm font-medium bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg backdrop-blur-sm">
                          {course.category || 'Grammar'}
                        </div>
                        <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs lg:text-sm font-medium shadow-lg backdrop-blur-sm ${
                          course.level.toLowerCase() === 'beginner' ? 'bg-gradient-to-r from-green-600 to-green-700 text-white' :
                          course.level.toLowerCase() === 'intermediate' ? 'bg-gradient-to-r from-yellow-600 to-yellow-700 text-white' :
                          'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                        }`}>
                          {formatLevel(course.level)}
                        </div>
                      </div>

                      {/* Title */}
                      <H3 className="mb-3 leading-tight group-hover:text-red-600 transition-colors duration-200">
                        {course.title}
                      </H3>

                      {/* Description */}
                      <BodyMD color="muted" className="mb-4 line-clamp-2 leading-relaxed">
                        {course.description}
                      </BodyMD>

                      {/* Instructor */}
                      <div className="flex items-center gap-3 mb-4 p-3 bg-white/50 backdrop-blur-sm rounded-xl border border-white/20">
                        <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-red-700 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
                          {course.instructor_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <BodyMD className="font-medium">
                            {course.instructor_name}
                          </BodyMD>
                          <BodyMD color="muted" className="text-xs">Instructor</BodyMD>
                        </div>
                      </div>

                      {/* Duration and Students */}
                      <Flex gap="md" className="text-sm text-gray-600 mb-6">
                        <div className="flex items-center gap-1 bg-white/50 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20">
                          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <BodyMD className="font-medium">{course.duration}</BodyMD>
                        </div>
                        <div className="flex items-center gap-1 bg-white/50 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20">
                          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <BodyMD className="font-medium">{course.student_count}</BodyMD>
                        </div>
                      </Flex>

                      {/* Price and Button */}
                      <Flex align="center" justify="between" className="pt-4 border-t border-white/20">
                        <Typography variant="display-sm" className="font-bold">
                          ${course.price}
                        </Typography>
                        <Link href={`/courses/${course.id}`}>
                          <button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-xl font-bold transition-all duration-200 transform hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-xl text-sm lg:text-base backdrop-blur-sm">
                            View Course
                          </button>
                        </Link>
                      </Flex>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-20">
                <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-12 shadow-xl border border-white/20 max-w-md mx-auto">
                  <div className="w-20 h-20 bg-gradient-to-r from-red-600 to-red-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <H3 className="mb-4">No Courses Available</H3>
                  <BodyLG color="muted" className="max-w-md mx-auto leading-relaxed">
                    We&apos;re working on adding more courses. Check back soon for new content!
                  </BodyLG>
                </div>
              </div>
            )}
        </Grid>
      </Container>
    </Section>
  )
}
