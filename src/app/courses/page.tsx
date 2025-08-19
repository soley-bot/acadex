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
import { EnhancedCourseCard } from '@/components/cards/EnhancedCourseCard'

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
                <EnhancedCourseCard key={course.id} course={course} showProgress={true} />
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
