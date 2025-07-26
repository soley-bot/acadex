'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { courseAPI, enrollmentAPI } from '@/lib/database'
import { useAuth } from '@/contexts/AuthContext'

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
    const fetchCourse = async () => {
      try {
        setLoading(true)
        const { data, error: fetchError } = await courseAPI.getCourse(params.id as string)
        
        if (fetchError) {
          setError('Failed to load course')
          console.error('Error fetching course:', fetchError)
        } else {
          setCourse(data)
        }
      } catch (err) {
        console.error('Error fetching course:', err)
        setError('Failed to load course')
      } finally {
        setLoading(false)
      }
    }

    const checkEnrollmentStatus = async () => {
      if (!user || !params.id) return
      
      try {
        const { enrolled, error } = await enrollmentAPI.isEnrolled(user.id, params.id as string)
        if (!error && enrolled) {
          setIsEnrolled(true)
        }
      } catch (err) {
        console.error('Error checking enrollment status:', err)
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
      router.push('/login')
      return
    }

    try {
      setEnrolling(true)
      setError(null)
      console.log('Enrolling user:', user.id, 'in course:', course!.id)
      const { error: enrollError } = await enrollmentAPI.enrollInCourse(user.id, course!.id)
      
      if (enrollError) {
        console.error('Enrollment error:', enrollError)
        // Check if error indicates already enrolled
        if (enrollError.message?.includes('already enrolled') || enrollError.code === '23505') {
          setError('You are already enrolled in this course!')
          setIsEnrolled(true)
        } else {
          setError('Failed to enroll in course. Please try again.')
        }
      } else {
        console.log('Enrollment successful')
        setIsEnrolled(true)
        // Redirect to course study page
        router.push(`/courses/${course!.id}/study`)
      }
    } catch (err) {
      console.error('Error enrolling in course:', err)
      setError('Failed to enroll in course. Please try again.')
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 py-20 pt-24 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h1>
          <p className="text-gray-600 mb-8">{error || 'The course you are looking for does not exist.'}</p>
          <button
            onClick={() => router.push('/courses')}
            className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-black transition-colors"
          >
            Back to Courses
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      
      <div className="max-w-6xl mx-auto px-4 py-8 pt-24">
        {/* Course Header */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Course Content */}
          <div className="lg:col-span-2">
            {course.image_url && (
              <Image
                src={course.image_url}
                alt={course.title}
                width={800}
                height={300}
                className="w-full h-64 object-cover rounded-lg mb-6"
              />
            )}
            
            <div className="flex items-center gap-4 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(course.level)}`}>
                {course.level}
              </span>
              <span className="text-gray-600">{course.category}</span>
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-4">{course.title}</h1>
            
            <div className="flex items-center gap-6 mb-6 text-gray-600">
              <div className="flex items-center gap-1">
                <span>⭐</span>
                <span>{course.rating}</span>
              </div>
              <div>{course.student_count} students</div>
              <div>⏱️ {course.duration}</div>
            </div>

            <p className="text-lg text-gray-700 mb-8 leading-relaxed">{course.description}</p>

            {/* Course Details */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">What you&apos;ll learn</h2>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Master the fundamentals of {course.category.toLowerCase()}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Build practical skills through hands-on exercises</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Get personalized feedback from experienced instructors</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Access to exclusive course materials and resources</span>
                </li>
              </ul>
            </div>

            {/* Instructor */}
            <div className="bg-white border rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Instructor</h2>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {course.instructor_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{course.instructor_name}</h3>
                  <p className="text-gray-600">Expert {course.category} Instructor</p>
                </div>
              </div>
            </div>
          </div>

          {/* Enrollment Card */}
          <div className="lg:col-span-1">
            <div className="bg-white border rounded-lg p-8 sticky top-8">
              <div className="text-3xl font-bold text-gray-900 mb-6">
                ${course.price}
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}
              
              {isEnrolled ? (
                <div className="space-y-4 mb-8">
                  <div className="bg-green-100 text-green-800 px-6 py-4 rounded-lg text-center font-medium">
                    ✅ You are enrolled in this course
                  </div>
                  <Link
                    href={`/courses/${course.id}/study`}
                    className="w-full bg-gray-900 text-white px-6 py-4 rounded-lg font-semibold hover:bg-black transition-colors text-center block"
                  >
                    Continue Learning
                  </Link>
                </div>
              ) : (
                <div className="mb-8">
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="w-full bg-gray-900 text-white px-6 py-4 rounded-lg font-semibold hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                  >
                    {enrolling ? 'Enrolling...' : 'Enroll Now'}
                  </button>
                  {!user && (
                    <p className="text-sm text-gray-600 text-center">
                      <Link href="/login" className="text-gray-900 hover:text-black font-medium">
                        Sign in
                      </Link>
                      {' '}to enroll in this course
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-4 text-sm text-gray-600 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <span className="text-lg">🎯</span>
                  <span>{course.level} level</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg">⏱️</span>
                  <span>{course.duration} total</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg">👥</span>
                  <span>{course.student_count} students enrolled</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg">📱</span>
                  <span>Access on mobile and desktop</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg">🏆</span>
                  <span>Certificate of completion</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
