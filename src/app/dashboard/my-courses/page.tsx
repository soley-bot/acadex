'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { enrollmentAPI } from '@/lib/database'
import type { EnrolledCourse } from '@/types/dashboard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { StudentSidebar } from '@/components/student/StudentSidebar'
import Link from 'next/link'
import { 
  BookOpen, 
  Play, 
  Clock, 
  Trophy,
  ExternalLink,
  Search
} from 'lucide-react'

export default function MyCoursesPage() {
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchEnrolledCourses()
    }
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchEnrolledCourses = async () => {
    if (!user?.id) return
    
    try {
      setLoading(true)
      
      const { data, error } = await enrollmentAPI.getUserEnrollments(user.id)
      
      if (error) {
        // Error fetching enrolled courses
        return
      }

      // Transform the data to match our interface
      const transformedCourses: EnrolledCourse[] = data?.map((enrollment: any) => ({
        id: enrollment.course_id,
        course_id: enrollment.course_id,
        title: enrollment.courses.title,
        description: enrollment.courses.description || '',
        category: enrollment.courses.category || 'General',
        difficulty: enrollment.courses.level || 'Beginner',
        duration: enrollment.courses.duration || '4 weeks',
        progress_percentage: enrollment.progress || 0,
        last_accessed: new Date(enrollment.last_accessed || enrollment.enrolled_at).toLocaleDateString(),
        enrolled_at: enrollment.enrolled_at,
        created_at: enrollment.enrolled_at,
        total_lessons: 20, // This would need to come from course modules/lessons
        completed_lessons: Math.round((enrollment.progress || 0) / 100 * 20),
        next_lesson: enrollment.progress < 100 ? {
          id: 'next-lesson',
          title: 'Continue Learning'
        } : undefined
      })) || []

      setEnrolledCourses(transformedCourses)
    } catch (error) {
      // Error fetching enrolled courses
    } finally {
      setLoading(false)
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500'
    if (progress >= 50) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
          <StudentSidebar />
        </div>

        {/* Mobile Sidebar */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)}>
            <div className="fixed inset-y-0 left-0 w-64 bg-sidebar" onClick={e => e.stopPropagation()}>
              <StudentSidebar onMobileClose={() => setSidebarOpen(false)} />
            </div>
          </div>
        )}

        <div className="flex-1 lg:ml-64">
          <div className="p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <StudentSidebar />
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)}>
          <div className="fixed inset-y-0 left-0 w-64 bg-sidebar" onClick={e => e.stopPropagation()}>
            <StudentSidebar onMobileClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 lg:ml-64">
        {/* Mobile header */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-base sm:text-lg font-semibold text-gray-900">My Courses</h1>
          <div className="w-10"></div>
        </div>

        <div className="p-4 md:p-6">
          {/* Header */}
                    {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">My Courses</h1>
              <p className="text-gray-600">Continue your learning journey</p>
            </div>
            <Button variant="default" className="w-full sm:w-auto" asChild>
              <Link href="/courses" className="flex items-center justify-center gap-2">
                <Search className="h-4 w-4" />
                Browse More Courses
              </Link>
            </Button>
          </div>

          {/* Enrolled Courses */}
          {enrolledCourses.length > 0 ? (
            <div className="space-y-6">
              {enrolledCourses.map((course) => (
                <Card key={course.id} variant="base">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">{course.title}</h3>
                          <Badge className={getDifficultyColor(course.difficulty)}>
                            {course.difficulty}
                          </Badge>
                          <Badge variant="outline">{course.category}</Badge>
                        </div>
                        <p className="text-gray-600 mb-3">{course.description}</p>
                        
                        {/* Progress Section */}
                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-600">Progress</span>
                              <span className="text-sm font-semibold text-gray-900">
                                {course.progress_percentage}% ({course.completed_lessons}/{course.total_lessons} lessons)
                              </span>
                            </div>
                            <Progress value={course.progress_percentage} className="h-2" />
                          </div>
                        </div>

                        {/* Course Stats */}
                        <div className="flex items-center gap-6 text-sm text-gray-500 mb-4">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{course.duration}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4" />
                            <span>{course.total_lessons} lessons</span>
                          </div>
                          <span>Last accessed: {course.last_accessed}</span>
                        </div>

                        {/* Next Lesson */}
                        {course.next_lesson && (
                          <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            <p className="text-sm font-medium text-gray-900 mb-1">Next Lesson:</p>
                            <p className="text-sm text-gray-600">{course.next_lesson.title}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <Button variant="default" size="sm" asChild>
                        <Link href={`/courses/${course.id}/study`} className="flex items-center justify-center gap-2">
                          <Play className="h-4 w-4" />
                          Continue Learning
                        </Link>
                      </Button>
                      
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/courses/${course.id}`} className="flex items-center justify-center gap-2">
                          <ExternalLink className="h-4 w-4" />
                          <span className="hidden sm:inline">Course Details</span>
                          <span className="sm:hidden">Details</span>
                        </Link>
                      </Button>

                      {course.progress_percentage === 100 && (
                        <Badge className="bg-green-100 text-green-800 flex items-center justify-center gap-1 sm:self-start">
                          <Trophy className="h-3 w-3" />
                          Completed
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card variant="base">
              <CardContent className="p-12 text-center">
                <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Courses Enrolled</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  You haven&apos;t enrolled in any courses yet. Browse our course catalog to start your learning journey.
                </p>
                <Button variant="default" size="lg" asChild>
                  <Link href="/courses" className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Browse Course Catalog
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
