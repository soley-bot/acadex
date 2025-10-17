'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { createSupabaseClient } from '@/lib/supabase'
import { Loader2, BookOpen, Clock, Users, Award, CheckCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'

/**
 * Course Detail Page
 * Shows course overview, modules, and enrollment options
 * Redirects to study page if already enrolled
 */
export default function CourseDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const courseId = params.id as string
  
  const [course, setCourse] = useState<any>(null)
  const [modules, setModules] = useState<any[]>([])
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)

  const loadCourse = async () => {
    try {
      setLoading(true)

      const supabase = createSupabaseClient()
      // Fetch course details
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single()

      if (courseError) throw courseError
      setCourse(courseData)

      // Fetch modules
      const { data: modulesData } = await supabase
        .from('course_modules')
        .select('*, course_lessons(*)')
        .eq('course_id', courseId)
        .order('order_index')

      setModules(modulesData || [])

      // Check enrollment if user is logged in
      if (user) {
        // Check if admin
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single()

        if ((userData as any)?.role === 'admin') {
          // Admin can access directly
          router.replace(`/courses/${courseId}/study`)
          return
        }

        // Check enrollment
        const { data: enrollment } = await supabase
          .from('enrollments')
          .select('id')
          .eq('user_id', user.id)
          .eq('course_id', courseId)
          .single()

        if (enrollment) {
          // Already enrolled, redirect to study
          router.replace(`/courses/${courseId}/study`)
          return
        }
      }

      setLoading(false)
    } catch (error: any) {
      console.error('Error loading course:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCourse()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, user])

  const handleEnroll = async () => {
    if (!user) {
      router.push(`/auth?tab=signin&redirect=/courses/${courseId}`)
      return
    }

    try {
      setEnrolling(true)

      const supabase = createSupabaseClient()
      // Create enrollment
      const { error } = await supabase
        .from('enrollments')
        .insert({
          user_id: user.id,
          course_id: courseId,
          progress: 0,
          enrolled_at: new Date().toISOString()
        } as any)

      if (error) throw error

      // Redirect to study page
      router.push(`/courses/${courseId}/study`)
    } catch (error: any) {
      console.error('Error enrolling:', error)
      alert(error.message || 'Failed to enroll. Please try again.')
      setEnrolling(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading course...</p>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Course Not Found</h2>
          <Link href="/courses" className="text-primary hover:underline">
            Browse All Courses
          </Link>
        </div>
      </div>
    )
  }

  const totalLessons = modules.reduce((sum, mod) => sum + (mod.course_lessons?.length || 0), 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href="/courses" className="text-primary hover:underline mb-4 inline-block">
            ← Back to Courses
          </Link>
          <h1 className="text-4xl font-bold text-foreground mb-4">{course.title}</h1>
          <p className="text-xl text-muted-foreground">{course.description}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Course Stats */}
            <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <BookOpen className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Modules</p>
                  <p className="text-lg font-bold">{modules.length}</p>
                </div>
                <div className="text-center">
                  <Award className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Lessons</p>
                  <p className="text-lg font-bold">{totalLessons}</p>
                </div>
                <div className="text-center">
                  <Clock className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="text-lg font-bold">{course.duration || 'Self-paced'}</p>
                </div>
                <div className="text-center">
                  <Users className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Students</p>
                  <p className="text-lg font-bold">{course.student_count || 0}</p>
                </div>
              </div>
            </div>

            {/* Course Modules */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-2xl font-bold mb-6">Course Content</h2>
              <div className="space-y-4">
                {modules.map((module, index) => (
                  <div key={module.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-primary font-bold text-sm">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">{module.title}</h3>
                        {module.description && (
                          <p className="text-sm text-muted-foreground mb-3">{module.description}</p>
                        )}
                        <div className="space-y-2">
                          {module.course_lessons?.map((lesson: any, lessonIndex: number) => (
                            <div key={lesson.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                              <CheckCircle className="w-4 h-4" />
                              <span>{lessonIndex + 1}. {lesson.title}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-20">
              <div className="mb-6">
                <p className="text-3xl font-bold text-foreground mb-2">
                  {course.is_free || course.price === 0 ? 'Free' : `$${course.price}`}
                </p>
                {course.original_price && course.original_price > course.price && (
                  <p className="text-sm text-muted-foreground line-through">
                    ${course.original_price}
                  </p>
                )}
              </div>

              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-4 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {enrolling ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Enrolling...
                  </>
                ) : (
                  <>
                    Enroll Now
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <div className="mt-6 space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Full lifetime access</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Certificate of completion</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Progress tracking</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
