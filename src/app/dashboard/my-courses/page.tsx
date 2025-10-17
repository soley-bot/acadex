'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { enrollmentAPI } from '@/lib/api'
import type { EnrolledCourse } from '@/types/dashboard'
import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
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
        return
      }

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
        total_lessons: 20,
        completed_lessons: Math.round((enrollment.progress || 0) / 100 * 20),
        next_lesson: enrollment.progress < 100 ? {
          id: 'next-lesson',
          title: 'Continue Learning'
        } : undefined
      })) || []

      setEnrolledCourses(transformedCourses)
    } catch (error: any) {
      // Error handling
    } finally {
      setLoading(false)
    }
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
      <DashboardLayout title="My Courses">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="My Courses">
      <>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">My Courses</h1>
            <p className="text-gray-600">Continue your learning journey</p>
          </div>
          <Button variant="secondary" className="w-full sm:w-auto" asChild>
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
              <Card key={course.id} variant="default">
                <CardContent className="p-4 sm:p-5 lg:p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
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
                      <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm text-gray-500 mb-4">
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
                    <Button variant="secondary" size="sm" asChild>
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
          <Card variant="default">
            <CardContent className="!p-6 sm:!p-8 md:!p-10 lg:!p-12 text-center">
              <BookOpen className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No Courses Enrolled</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 max-w-md mx-auto">
                You haven&apos;t enrolled in any courses yet. Browse our course catalog to start your learning journey.
              </p>
              <Button variant="secondary" size="lg" asChild>
                <Link href="/courses" className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Browse Course Catalog
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </>
    </DashboardLayout>
  )
}
