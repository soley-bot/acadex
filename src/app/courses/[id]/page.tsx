'use client'

import { logger } from '@/lib/logger'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { supabase, Course } from '@/lib/supabase'
import { enrollUserInCourse } from '@/lib/database-operations'
import { useAuth } from '@/contexts/AuthContext'
import { Typography, DisplayLG, H1, H2, H3, BodyLG, BodyMD } from '@/components/ui/Typography'
import { Container, Section, Grid, Flex } from '@/components/ui/Layout'
import Icon from '@/components/ui/Icon'

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
      <Section 
        className="min-h-screen relative overflow-hidden"
        background="gradient"
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
        
        <Container size="lg" className="relative flex items-center justify-center py-20 pt-24">
          <div className="text-center bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <BodyLG color="muted" className="font-medium">Loading course...</BodyLG>
          </div>
        </Container>
      </Section>
    )
  }

  if (error || !course) {
    return (
      <Section 
        className="min-h-screen relative overflow-hidden"
        background="gradient"
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
        
        <Container size="lg" className="relative py-20 pt-24 text-center">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-12 shadow-xl border border-white/20">
            <div className="w-16 h-16 bg-gradient-to-r from-red-600 to-red-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Icon name="close" size={32} color="white" />
            </div>
            <H1 className="mb-4">Course Not Found</H1>
            <BodyLG color="muted" className="mb-8 leading-relaxed">{error || 'The course you are looking for does not exist.'}</BodyLG>
            <button
              onClick={() => router.push('/courses')}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
            >
              Back to Courses
            </button>
          </div>
        </Container>
      </Section>
    )
  }

  return (
    <Section 
      className="min-h-screen relative overflow-hidden"
      background="gradient"
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-6000"></div>
      </div>
      
      <Container size="xl" className="relative py-8 pt-24">
        {/* Course Header */}
        <Grid cols={1} className="lg:grid-cols-3 mb-12">
          {/* Course Content */}
          <div className="lg:col-span-2">
            {course.image_url && (
              <div className="relative mb-8">
                <Image
                  src={course.image_url}
                  alt={course.title}
                  width={800}
                  height={300}
                  className="w-full h-64 object-cover rounded-2xl shadow-xl border border-white/20"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-2xl"></div>
              </div>
            )}
            
            <Flex gap="md" className="mb-6">
              <span className={`px-4 py-2 rounded-full text-sm font-bold backdrop-blur-sm border border-white/20 shadow-lg ${
                course.level.toLowerCase() === 'beginner' ? 'bg-green-100/80 text-green-800' :
                course.level.toLowerCase() === 'intermediate' ? 'bg-yellow-100/80 text-yellow-800' :
                'bg-red-100/80 text-red-800'
              }`}>
                {course.level}
              </span>
              <span className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-bold rounded-full shadow-lg">
                {course.category}
              </span>
            </Flex>

            <H1 className="mb-6 leading-tight">{course.title}</H1>
            
            <Grid cols={2} className="md:grid-cols-3 mb-8">
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-xl px-4 py-3 shadow-lg border border-white/20 min-h-[60px]">
                <Icon name="star" size={20} color="warning" />
                <div>
                  <BodyMD className="font-bold">{course.rating}</BodyMD>
                  <BodyMD color="muted" className="text-xs">Rating</BodyMD>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-xl px-4 py-3 shadow-lg border border-white/20 min-h-[60px]">
                <Icon name="users" size={20} color="primary" />
                <div>
                  <BodyMD className="font-bold">{course.student_count}</BodyMD>
                  <BodyMD color="muted" className="text-xs">Students</BodyMD>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-xl px-4 py-3 shadow-lg border border-white/20 min-h-[60px] col-span-2 md:col-span-1">
                <Icon name="clock" size={20} color="muted" />
                <div>
                  <BodyMD className="font-bold">{course.duration}</BodyMD>
                  <BodyMD color="muted" className="text-xs">Duration</BodyMD>
                </div>
              </div>
            </Grid>

            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20 mb-8">
              <BodyLG className="leading-relaxed">{course.description}</BodyLG>
            </div>

            {/* What You'll Learn Section */}
            {course.learning_objectives && course.learning_objectives.length > 0 && (
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 mb-8 shadow-xl border border-white/20">
                <H2 className="mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 bg-gradient-to-r from-green-600 to-green-700 rounded-full flex items-center justify-center">
                    <Icon name="check" size={16} color="white" />
                  </span>
                  What you&apos;ll learn
                </H2>
                <ul className="space-y-4">
                  {course.learning_objectives.map((objective, index) => (
                    <li key={index} className="flex items-start gap-3 p-3 bg-green-50/80 backdrop-blur-sm rounded-xl border border-green-200/50">
                      <Icon name="check" size={16} color="success" className="mt-1" />
                      <BodyMD className="font-medium">{objective}</BodyMD>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Course Prerequisites */}
            {course.prerequisites && course.prerequisites.length > 0 && (
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 mb-8 shadow-xl border border-white/20">
                <H2 className="mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
                    <Icon name="file" size={16} color="white" />
                  </span>
                  Prerequisites
                </H2>
                <ul className="space-y-4">
                  {course.prerequisites.map((prerequisite, index) => (
                    <li key={index} className="flex items-start gap-3 p-3 bg-blue-50/80 backdrop-blur-sm rounded-xl border border-blue-200/50">
                      <span className="text-blue-600 mt-1 text-lg font-bold">•</span>
                      <BodyMD className="font-medium">{prerequisite}</BodyMD>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Course Tags */}
            {course.tags && course.tags.length > 0 && (
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 mb-8 shadow-xl border border-white/20">
                <H3 className="mb-4 flex items-center gap-2">
                  <Icon name="bookmark" size={20} color="muted" />
                  Tags
                </H3>
                <Flex gap="sm" className="flex-wrap">
                  {course.tags.map((tag, index) => (
                    <span key={index} className="px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-full text-sm font-medium shadow-lg border border-gray-300/50 hover:shadow-xl transition-all duration-200">
                      {tag}
                    </span>
                  ))}
                </Flex>
              </div>
            )}

            {/* Instructor */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20">
              <H2 className="mb-6 flex items-center gap-3">
                <Icon name="user" size={24} color="muted" />
                Instructor
              </H2>
              <Flex align="center" gap="lg">
                <div className="w-20 h-20 bg-gradient-to-r from-red-600 to-red-700 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {course.instructor_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <H3>{course.instructor_name}</H3>
                  <BodyMD color="muted" className="font-medium">Expert {course.category} Instructor</BodyMD>
                </div>
              </Flex>
            </div>
          </div>

          {/* Enrollment Card */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 sticky top-8 shadow-xl border border-white/20">
              <div className="text-center mb-8">
                <Typography variant="display-md" className="font-bold mb-2">
                  ${course.price}
                </Typography>
                <BodyMD color="muted" className="font-medium">Complete Course Access</BodyMD>
              </div>
              
              {error && (
                <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl p-4 mb-6 shadow-lg">
                  <BodyMD color="error" className="font-medium">{error}</BodyMD>
                </div>
              )}
              
              {isEnrolled ? (
                <div className="space-y-6 mb-8">
                  <div className="bg-green-100/80 backdrop-blur-sm text-green-800 px-6 py-4 rounded-xl text-center font-bold border border-green-200 shadow-lg flex items-center justify-center gap-2">
                    <Icon name="check" size={20} color="success" />
                    You are enrolled in this course
                  </div>
                  <Link
                    href={`/courses/${course.id}/study`}
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-4 rounded-xl font-bold text-lg transition-all duration-200 transform hover:-translate-y-1 text-center block shadow-lg hover:shadow-xl"
                  >
                    Continue Learning
                  </Link>
                </div>
              ) : (
                <div className="mb-8">
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-4 rounded-xl font-bold text-lg transition-all duration-200 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mb-4 shadow-lg hover:shadow-xl"
                  >
                    {enrolling ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Enrolling...
                      </div>
                    ) : (
                      'Enroll Now'
                    )}
                  </button>
                  {!user && (
                    <BodyMD color="muted" className="text-center">
                      <Link href="/auth/login" className="text-red-600 hover:text-red-700 font-bold">
                        Sign in
                      </Link>
                      {' '}to enroll in this course
                    </BodyMD>
                  )}
                </div>
              )}

              <div className="space-y-4 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-4 p-3 bg-gray-50/80 backdrop-blur-sm rounded-xl border border-gray-200/50">
                  <Icon name="target" size={20} color="primary" />
                  <BodyMD className="font-medium">{course.level} level</BodyMD>
                </div>
                <div className="flex items-center gap-4 p-3 bg-gray-50/80 backdrop-blur-sm rounded-xl border border-gray-200/50">
                  <Icon name="clock" size={20} color="muted" />
                  <BodyMD className="font-medium">{course.duration} total</BodyMD>
                </div>
                <div className="flex items-center gap-4 p-3 bg-gray-50/80 backdrop-blur-sm rounded-xl border border-gray-200/50">
                  <Icon name="users" size={20} color="primary" />
                  <BodyMD className="font-medium">{course.student_count} students enrolled</BodyMD>
                </div>
                <div className="flex items-center gap-4 p-3 bg-gray-50/80 backdrop-blur-sm rounded-xl border border-gray-200/50">
                  <Icon name="mobile" size={20} color="muted" />
                  <BodyMD className="font-medium">Access on mobile and desktop</BodyMD>
                </div>
                <div className="flex items-center gap-4 p-3 bg-gray-50/80 backdrop-blur-sm rounded-xl border border-gray-200/50">
                  <Icon name="trophy" size={20} color="warning" />
                  <BodyMD className="font-medium">Certificate of completion</BodyMD>
                </div>
              </div>
            </div>
          </div>
        </Grid>
      </Container>
    </Section>
  )
}
