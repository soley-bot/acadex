'use client'

import { logger } from '@/lib/logger'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { supabase, Course } from '@/lib/supabase'
import { enrollUserInCourse } from '@/lib/database-operations'
import { useAuth } from '@/contexts/AuthContext'

export default function CoursePage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEnrolled, setIsEnrolled] = useState(false)

  useEffect(() => {
    // Reset state when navigating to different course
    setCourse(null)
    setError(null)
    setIsEnrolled(false)
    
    const fetchCourse = async () => {
      try {
        setLoading(true)
        
        // Add cache-busting timestamp to prevent stale data
        const timestamp = Date.now()
        const { data, error: fetchError } = await supabase
          .from('courses')
          .select('*')
          .eq('id', params.id)
          .eq('is_published', true)
          .single()
        
        if (fetchError) {
          setError('Course not found or not published')
          logger.error('Error fetching course:', fetchError)
        } else {
          setCourse(data)
        }
      } catch (err) {
        logger.error('Error fetching course:', err)
        setError('Failed to load course')
      } finally {
        setLoading(false)
      }
    }

    const checkEnrollmentStatus = async () => {
      if (!user || !params.id) return
      
      try {
        // Force fresh data by adding timestamp
        const { data, error } = await supabase
          .from('enrollments')
          .select('id')
          .eq('user_id', user.id)
          .eq('course_id', params.id)
          .single()
        
        if (data && !error) {
          setIsEnrolled(true)
        } else {
          setIsEnrolled(false)
        }
      } catch (err) {
        logger.error('Error checking enrollment status:', err)
        setIsEnrolled(false)
      }
    }

    if (params.id) {
      fetchCourse()
      if (user) {
        checkEnrollmentStatus()
      }
    }
  }, [params.id, user])

  const handleEnroll = async () => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    try {
      setEnrolling(true)
      setError(null)
      
      await enrollUserInCourse(user.id, course!.id)
      setIsEnrolled(true)
      // Redirect to course study page
      router.push(`/courses/${course!.id}/study`)
      
    } catch (err: any) {
      logger.error('Error enrolling in course:', err)
      if (err.message?.includes('already enrolled')) {
        setError('You are already enrolled in this course!')
        setIsEnrolled(true)
      } else {
        setError('Failed to enroll in course. Please try again.')
      }
    } finally {
      setEnrolling(false)
    }
  }

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800'
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800'
      case 'advanced':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex items-center justify-center py-20 pt-24">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading course...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 py-20 pt-24 text-center">
          <h1 className="text-3xl font-black text-black mb-4">Course Not Found</h1>
          <p className="text-gray-600 mb-8 text-lg">{error || 'The course you are looking for does not exist.'}</p>
          <button
            onClick={() => router.push('/courses')}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors"
          >
            Back to Courses
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      
      <div className="max-w-6xl mx-auto px-6 py-8 pt-24">
        {/* Course Header */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-12">
          {/* Course Content */}
          <div className="lg:col-span-2">
            {course.image_url && (
              <Image
                src={course.image_url}
                alt={course.title}
                width={800}
                height={300}
                className="w-full h-64 object-cover rounded-2xl mb-8 shadow-lg"
              />
            )}
            
            <div className="flex items-center gap-4 mb-6">
              <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                course.level.toLowerCase() === 'beginner' ? 'bg-green-100 text-green-800' :
                course.level.toLowerCase() === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {course.level}
              </span>
              <span className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-full">{course.category}</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-black mb-6">{course.title}</h1>
            
            <div className="flex items-center gap-8 mb-8 text-gray-600">
              <div className="flex items-center gap-2">
                <span>⭐</span>
                <span className="font-bold">{course.rating}</span>
              </div>
              <div className="font-bold">{course.student_count} students</div>
              <div className="flex items-center gap-2">
                <span>⏱️</span>
                <span className="font-bold">{course.duration}</span>
              </div>
            </div>

            <p className="text-xl text-gray-700 mb-12 leading-relaxed">{course.description}</p>

            {/* What You'll Learn Section */}
            {course.learning_objectives && course.learning_objectives.length > 0 && (
              <div className="bg-gray-50 rounded-2xl p-8 mb-8 border border-gray-200">
                <h2 className="text-2xl font-black text-black mb-6">What you&apos;ll learn</h2>
                <ul className="space-y-4 text-gray-700">
                  {course.learning_objectives.map((objective, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-green-600 mt-1 text-lg">✓</span>
                      <span className="font-medium">{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Course Prerequisites */}
            {course.prerequisites && course.prerequisites.length > 0 && (
              <div className="bg-blue-50 rounded-2xl p-8 mb-8 border border-blue-200">
                <h2 className="text-2xl font-black text-black mb-6">Prerequisites</h2>
                <ul className="space-y-4 text-gray-700">
                  {course.prerequisites.map((prerequisite, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-blue-600 mt-1 text-lg">•</span>
                      <span className="font-medium">{prerequisite}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Course Tags */}
            {course.tags && course.tags.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-black mb-4">Tags</h3>
                <div className="flex flex-wrap gap-3">
                  {course.tags.map((tag, index) => (
                    <span key={index} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full text-sm font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Instructor */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-black text-black mb-6">Instructor</h2>
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center text-white text-2xl font-black">
                  {course.instructor_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-black">{course.instructor_name}</h3>
                  <p className="text-gray-600 font-medium">Expert {course.category} Instructor</p>
                </div>
              </div>
            </div>
          </div>

          {/* Enrollment Card */}
          <div className="lg:col-span-1">
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 sticky top-8 shadow-xl">
              <div className="text-4xl font-black text-black mb-8">
                ${course.price}
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                  <p className="text-red-800 text-sm font-medium">{error}</p>
                </div>
              )}
              
              {isEnrolled ? (
                <div className="space-y-6 mb-8">
                  <div className="bg-green-100 text-green-800 px-6 py-4 rounded-xl text-center font-bold border border-green-200">
                    ✅ You are enrolled in this course
                  </div>
                  <Link
                    href={`/courses/${course.id}/study`}
                    className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-lg font-bold text-lg transition-colors text-center block shadow-lg hover:shadow-xl"
                  >
                    Continue Learning
                  </Link>
                </div>
              ) : (
                <div className="mb-8">
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-lg font-bold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4 shadow-lg hover:shadow-xl"
                  >
                    {enrolling ? 'Enrolling...' : 'Enroll Now'}
                  </button>
                  {!user && (
                    <p className="text-sm text-gray-600 text-center">
                      <Link href="/login" className="text-red-600 hover:text-red-700 font-bold">
                        Sign in
                      </Link>
                      {' '}to enroll in this course
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-6 text-sm text-gray-600 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-4">
                  <span className="text-xl">🎯</span>
                  <span className="font-medium">{course.level} level</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xl">⏱️</span>
                  <span className="font-medium">{course.duration} total</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xl">👥</span>
                  <span className="font-medium">{course.student_count} students enrolled</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xl">📱</span>
                  <span className="font-medium">Access on mobile and desktop</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xl">🏆</span>
                  <span className="font-medium">Certificate of completion</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
