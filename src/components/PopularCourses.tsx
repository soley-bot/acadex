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
    title: 'IELTS Complete Preparation Course',
    description: 'Comprehensive IELTS preparation covering all four skills: Reading, Writing, Listening, and Speaking.',
    category: 'IELTS',
    level: 'intermediate',
    duration: '12 weeks',
    price: 149.99,
    instructor_id: 'instructor-1',
    instructor_name: 'Dr. Emily Watson',
    is_published: true,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    student_count: 2850,
    rating: 4.9,
    image_url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop'
  },
  {
    id: 'static-2',
    title: 'English Grammar Mastery',
    description: 'Master all English grammar rules from basics to advanced with practical exercises and examples.',
    category: 'Grammar',
    level: 'beginner',
    duration: '8 weeks',
    price: 79.99,
    instructor_id: 'instructor-2',
    instructor_name: 'James Richardson',
    is_published: true,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    student_count: 3200,
    rating: 4.8,
    image_url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop'
  },
  {
    id: 'static-3',
    title: 'Advanced Vocabulary Builder',
    description: 'Expand your vocabulary with 3000+ essential English words, idioms, and phrases.',
    category: 'Vocabulary',
    level: 'intermediate',
    duration: '10 weeks',
    price: 99.99,
    instructor_id: 'instructor-3',
    instructor_name: 'Sarah Collins',
    is_published: true,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    student_count: 1920,
    rating: 4.7,
    image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop'
  }
]

export default function PopularCourses() {
  const [courses, setCourses] = useState<Course[]>(STATIC_COURSES)
  const [loading, setLoading] = useState(false)

  // Optional: Load dynamic courses in the background
  useEffect(() => {
    const loadCourses = async () => {
      try {
        const { data, error } = await courseAPI.getPopularCourses(6)
        if (!error && data && data.length > 0) {
          setCourses(data)
        }
      } catch (error) {
        console.error('Error loading courses:', error)
        // Keep static courses as fallback
      }
    }

    // Delay the API call to improve initial page load
    const timer = setTimeout(loadCourses, 1500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <section className="py-20 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-brand/10 text-brand px-3 py-1.5 rounded-full text-sm font-medium mb-4 border border-brand/20">
            <span className="w-2 h-2 bg-brand rounded-full"></span>
            Featured Courses
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-4">
            Popular English Learning Courses
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of students mastering English with our expert-designed courses for IELTS, grammar, and vocabulary.
          </p>
        </div>

        {/* Courses Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="card hover:shadow-lg transition-shadow duration-300">
              {/* Course Image */}
              <div className="h-48 relative rounded-t-lg overflow-hidden">
                <CourseImage
                  src={course.image_url}
                  alt={course.title}
                  size="medium"
                  className="w-full h-full"
                />
                <div className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium border">
                  {course.level}
                </div>
                {/* Category overlay */}
                <div className="absolute bottom-3 left-3 px-3 py-1 bg-primary/90 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                  {course.category}
                </div>
              </div>

              <div className="p-6">
                {/* Title */}
                <h3 className="text-xl font-semibold tracking-tight mb-3">
                  {course.title}
                </h3>

                {/* Description */}
                <p className="text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
                  {course.description}
                </p>

                {/* Instructor */}
                <p className="text-sm text-muted-foreground mb-6 font-medium">
                  by {course.instructor_name}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-6 mb-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="flex text-yellow-500">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="font-medium">{course.rating}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    <span>{course.student_count.toLocaleString()}</span>
                  </div>
                </div>

                {/* Price & CTA */}
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold tracking-tight">
                    <span className="text-lg text-muted-foreground font-normal">$</span>{course.price}
                  </div>
                  <Link 
                    href={`/courses/${course.id}`}
                    className="btn-default"
                  >
                    <span>Enroll Now</span>
                    <SvgIcon icon="angleRight" size={16} className="ml-2" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
