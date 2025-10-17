'use client'

import { logger } from '@/lib/logger'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { courseAPI } from '@/lib/api'
import type { Course } from '@/lib/supabase'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Container, Section, Grid, Flex } from '@/components/ui/Layout'
import { BlobBackground } from '@/components/ui/BlobBackground'
import { Users, Star, BookOpen } from 'lucide-react'

// Static fallback courses for better performance
const STATIC_COURSES: Course[] = [
  {
    id: 'static-1',
    title: 'Full Stack Web Development',
    description: 'Learn to build modern web applications with React, Node.js, and databases from scratch.',
    category: 'Programming',
    level: 'intermediate',
    duration: '16 weeks',
    price: 199.99,
    instructor_id: 'instructor-1',
    instructor_name: 'Sarah Chen',
    status: 'published',
    is_free: false,
    is_published: true,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    student_count: 4200,
    rating: 4.9,
    image_url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop'
  },
  {
    id: 'static-2',
    title: 'Data Science with Python',
    description: 'Master data analysis, machine learning, and visualization with Python and popular libraries.',
    category: 'Data Science',
    level: 'beginner',
    duration: '12 weeks',
    price: 149.99,
    instructor_id: 'instructor-2',
    instructor_name: 'Dr. Michael Rodriguez',
    status: 'published',
    is_free: false,
    is_published: true,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    student_count: 3800,
    rating: 4.8,
    image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop'
  },
  {
    id: 'static-3',
    title: 'Digital Marketing Mastery',
    description: 'Complete guide to SEO, social media marketing, content creation, and paid advertising.',
    category: 'Marketing',
    level: 'beginner',
    duration: '10 weeks',
    price: 99.99,
    instructor_id: 'instructor-3',
    instructor_name: 'Emma Thompson',
    status: 'published',
    is_free: false,
    is_published: true,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    student_count: 2900,
    rating: 4.7,
    image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop'
  }
]

export default function PopularCourses() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load courses from database
  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true)
        logger.debug('Loading courses from database...')
        const { data, error } = await courseAPI.getPopularCourses(6)
        
        logger.debug('Database response:', { data, error })
        
        if (error) {
          logger.error('Error loading courses', { error: error?.message || 'Unknown error' })
          setCourses([])
          setError('Failed to load courses')
        } else if (data && data.length > 0) {
          logger.debug(`Loaded ${data.length} courses from database`)
          setCourses(data)
          setError(null)
        } else {
          logger.debug('No courses found in database')
          setCourses([])
          setError(null)
        }
      } catch (error: any) {
        logger.error('Error loading courses', { error: error?.message || 'Unknown error' })
        setCourses([])
        setError('Failed to load courses')
      } finally {
        setLoading(false)
      }
    }

    loadCourses()
  }, [])

  // Loading state
  if (loading) {
    return (
      <Section 
        className="relative overflow-hidden py-16 md:py-20 lg:py-24"
        background="accent"
      >
        {/* Standardized Animated Background */}
        <BlobBackground variant="default" />

        <Container size="xl" className="relative">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full shadow-lg mb-8">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              <span className="font-medium">Featured Courses</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-8 tracking-tight">
              Popular Learning
              <span className="block text-primary mt-4">Courses</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Join thousands of learners advancing their skills with our expert-designed courses across various subjects and disciplines.
            </p>
          </div>

          {/* Loading Grid - Professional Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[...Array(3)].map((_, i) => (
              <Card key={i} variant="elevated">
                <div className="h-48 bg-gray-200 animate-pulse rounded-t-2xl"></div>
                <CardContent className="p-6">
                  <div className="h-6 bg-gray-200 animate-pulse rounded mb-3"></div>
                  <div className="h-4 bg-gray-200 animate-pulse rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 animate-pulse rounded mb-4 w-3/4"></div>
                  <div className="h-4 bg-gray-200 animate-pulse rounded mb-6 w-1/2"></div>
                  <div className="flex justify-between items-center">
                    <div className="h-8 bg-gray-200 animate-pulse rounded w-16"></div>
                    <div className="h-10 bg-gray-200 animate-pulse rounded w-24"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </Section>
    )
  }

  return (
    <Section 
      className="relative overflow-hidden py-16 md:py-20 lg:py-24"
      background="accent"
    >
      {/* Standardized Animated Background */}
      <BlobBackground variant="default" />

      <Container size="xl" className="relative">
        {/* Section Header - Professional Typography */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full shadow-lg mb-8">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            <span className="font-medium">Featured Courses</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-8 tracking-tight">
            Popular Learning
            <span className="block text-primary mt-4">Courses</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Join thousands of learners advancing their skills with our expert-designed courses across various subjects and disciplines.
          </p>
        </div>

        {/* Courses Grid - Professional Card System */}
        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {courses.map((course) => (
              <Card key={course.id} variant="elevated" className="group hover:shadow-2xl transition-all duration-300 overflow-hidden hover:-translate-y-2">
                {/* Course Image */}
                <div className="h-48 relative overflow-hidden">
                  <Image
                    src={course.image_url || '/images/course-placeholder.jpg'}
                    alt={course.title}
                    width={400}
                    height={300}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full text-sm font-bold shadow-lg text-gray-800">
                    {course.level}
                  </div>
                  {/* Category overlay */}
                  <div className="absolute bottom-4 left-4 px-4 py-2 bg-primary text-white text-sm font-bold rounded-full shadow-lg">
                    {course.category}
                  </div>
                </div>

                <CardContent className="p-8">
                  {/* Title */}
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-primary transition-colors leading-tight">
                    {course.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 mb-6 line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>

                  {/* Instructor */}
                  <p className="text-gray-600 mb-6 font-medium">
                    by {course.instructor_name}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mb-8 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <div className="flex text-primary">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                      <span className="font-bold">{course.rating}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span className="font-bold">{course.student_count.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Price & CTA */}
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">
                      {course.is_free ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        <>
                          <span className="text-gray-500 text-xl font-normal">$</span>{course.price}
                        </>
                      )}
                    </div>
                    <Link 
                      href={`/courses/${course.id}/study`}
                      className="bg-primary hover:bg-secondary text-white hover:text-black px-6 py-3 rounded-lg font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-2"
                    >
                      <span>Start Learning</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Card variant="elevated" className="max-w-md mx-auto">
              <CardContent className="p-12">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">No Courses Available</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  We&apos;re working on adding more courses. Check back soon for new content!
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </Container>
    </Section>
  )
}

