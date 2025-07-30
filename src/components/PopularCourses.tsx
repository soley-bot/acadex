'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { courseAPI } from '@/lib/database'
import type { Course } from '@/lib/supabase'
import { CourseImage } from '@/components/OptimizedImage'
import SvgIcon from '@/components/ui/SvgIcon'

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
        console.log('Loading courses from database...')
        const { data, error } = await courseAPI.getPopularCourses(6)
        
        console.log('Database response:', { data, error })
        
        if (error) {
          console.error('Error loading courses:', error)
          console.log('Falling back to static courses due to database error')
          setCourses(STATIC_COURSES)
          setError(null) // Clear error when using fallback
        } else if (data && data.length > 0) {
          console.log(`Loaded ${data.length} courses from database`)
          setCourses(data)
          setError(null)
        } else {
          console.log('No courses found in database, using static fallback')
          setCourses(STATIC_COURSES)
          setError(null) // Clear error when using fallback
        }
      } catch (error) {
        console.error('Error loading courses:', error)
        console.log('Falling back to static courses due to exception')
        setCourses(STATIC_COURSES)
        setError(null) // Clear error when using fallback
      } finally {
        setLoading(false)
      }
    }

    loadCourses()
  }, [])

  // Loading state
  if (loading) {
    return (
      <section className="py-24 px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gray-100 text-black px-4 py-2 rounded-full text-sm font-medium mb-6 border border-gray-200">
              <span className="w-2 h-2 bg-red-600 rounded-full"></span>
              Featured Courses
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6 text-black">
              Popular Learning
              <span className="block text-red-600 mt-2">Courses</span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto font-light leading-relaxed">
              Join thousands of learners advancing their skills with our expert-designed courses across various subjects and disciplines.
            </p>
          </div>

          {/* Loading Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card">
                <div className="h-48 bg-gray-200 animate-pulse rounded-t-lg"></div>
                <div className="p-6">
                  <div className="h-6 bg-gray-200 animate-pulse rounded mb-3"></div>
                  <div className="h-4 bg-gray-200 animate-pulse rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 animate-pulse rounded mb-4 w-3/4"></div>
                  <div className="h-4 bg-gray-200 animate-pulse rounded mb-6 w-1/2"></div>
                  <div className="flex justify-between items-center">
                    <div className="h-8 bg-gray-200 animate-pulse rounded w-16"></div>
                    <div className="h-10 bg-gray-200 animate-pulse rounded w-24"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-24 px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gray-100 text-black px-4 py-2 rounded-full text-sm font-medium mb-6 border border-gray-200">
            <span className="w-2 h-2 bg-red-600 rounded-full"></span>
            Featured Courses
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6 text-black">
            Popular Learning
            <span className="block text-red-600 mt-2">Courses</span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto font-light leading-relaxed">
            Join thousands of learners advancing their skills with our expert-designed courses across various subjects and disciplines.
          </p>
        </div>

        {/* Courses Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <div key={course.id} className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 overflow-hidden hover:-translate-y-2">
              {/* Course Image */}
              <div className="h-48 relative overflow-hidden">
                <CourseImage
                  src={course.image_url}
                  alt={course.title}
                  size="medium"
                  className="w-full h-full group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-full text-sm font-bold border shadow-lg">
                  {course.level}
                </div>
                {/* Category overlay */}
                <div className="absolute bottom-4 left-4 px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-full shadow-lg">
                  {course.category}
                </div>
              </div>

              <div className="p-8">
                {/* Title */}
                <h3 className="text-2xl font-bold text-black mb-3 group-hover:text-red-600 transition-colors leading-tight">
                  {course.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 mb-6 line-clamp-2 leading-relaxed text-lg">
                  {course.description}
                </p>

                {/* Instructor */}
                <p className="text-sm text-gray-500 mb-6 font-medium">
                  by {course.instructor_name}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-6 mb-8 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <div className="flex text-red-500">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="font-bold text-black">{course.rating}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    <span className="font-bold text-black">{course.student_count.toLocaleString()}</span>
                  </div>
                </div>

                {/* Price & CTA */}
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-black text-black">
                    {course.is_free ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      <>
                        <span className="text-gray-400 text-xl font-normal">$</span>{course.price}
                      </>
                    )}
                  </div>
                  <Link 
                    href={`/courses/${course.id}`}
                    className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    <span>Enroll Now</span>
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
            ))
          }
        </div>
      </div>
    </section>
  )
}
