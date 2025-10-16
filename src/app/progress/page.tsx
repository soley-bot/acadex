'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { createSupabaseClient } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StudentSidebar } from '@/components/student/StudentSidebar'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Target, Trophy, Clock, TrendingUp, Award } from 'lucide-react'
import { ContextualBackButton } from '@/components/navigation/ContextualBackButton'

interface CourseProgress {
  id: string
  title: string
  progress_percentage: number
  lessons_completed: number
  total_lessons: number
  last_accessed: string
  duration: string | null
}

interface QuizAttempt {
  id: string
  quiz_title: string
  score: number
  total_questions: number
  completed_at: string
  percentage: number
}

interface ProgressStats {
  total_courses_enrolled: number
  courses_completed: number
  total_lessons_completed: number
  average_score: number
  total_study_time: number
  streak_days: number
}

export default function ProgressPage() {
  const { user, loading: authLoading } = useAuth()
  const [supabase] = useState(() => createSupabaseClient())
  const router = useRouter()
  const [courseProgress, setCourseProgress] = useState<CourseProgress[]>([])
  const [recentQuizzes, setRecentQuizzes] = useState<QuizAttempt[]>([])
  const [stats, setStats] = useState<ProgressStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // CRITICAL: Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      console.log('[Progress] No user found, redirecting to auth...')
      router.push('/auth?tab=signin&redirect=/progress')
    }
  }, [authLoading, user, router])

  useEffect(() => {
    if (!authLoading && user) {
      fetchProgressData()
    }
  }, [user, authLoading]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchProgressData = async () => {
    if (!user?.id) return

    // Use supabase client
    const supabaseClient = supabase

    try {
      console.log('[Progress] Fetching progress data...')
      setLoading(true)

      // PERFORMANCE: Fetch enrollments and quiz attempts in parallel
      const [enrollmentsResult, quizAttemptsResult] = await Promise.all([
        supabaseClient
          .from('enrollments')
          .select('*')
          .eq('user_id', user.id),
        supabaseClient
          .from('quiz_attempts')
          .select('*')
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false })
          .limit(5)
      ])

      if (enrollmentsResult.error) throw enrollmentsResult.error
      if (quizAttemptsResult.error) throw quizAttemptsResult.error

      const enrollments = enrollmentsResult.data || []
      const quizAttempts = quizAttemptsResult.data || []

      // Process course progress - fetch all courses in parallel
      const coursePromises = enrollments.map(async (enrollment: any) => {
        // Fetch course details, lessons, and progress in parallel
        const [courseResult, totalLessonsResult, completedLessonsResult] = await Promise.all([
          supabaseClient
            .from('courses')
            .select('id, title, duration')
            .eq('id', enrollment.course_id)
            .single(),
          supabaseClient
            .from('course_lessons')
            .select('id')
            .eq('course_id', enrollment.course_id),
          supabaseClient
            .from('lesson_progress')
            .select('lesson_id')
            .eq('user_id', user.id)
            .eq('completed', true)
        ])

        const course = courseResult.data
        const totalLessons = totalLessonsResult.data || []
        const completedLessons = completedLessonsResult.data || []

        const totalLessonsCount = totalLessons.length
        const completedLessonsCount = completedLessons.length
        const progressPercentage = totalLessonsCount > 0 ? (completedLessonsCount / totalLessonsCount) * 100 : 0

        if (course) {
          return {
            id: enrollment.course_id,
            title: course.title,
            progress_percentage: Math.round(progressPercentage),
            lessons_completed: completedLessonsCount,
            total_lessons: totalLessonsCount,
            last_accessed: enrollment.last_accessed || enrollment.enrolled_at,
            duration: course.duration
          }
        }
        return null
      })

      // Process quiz attempts - fetch all quiz details in parallel
      const quizPromises = quizAttempts.map(async (attempt: any) => {
        const { data: quiz } = await supabaseClient
          .from('quizzes')
          .select('title, questions')
          .eq('id', attempt.quiz_id)
          .single()

        if (quiz) {
          const totalQuestions = Array.isArray(quiz.questions) ? quiz.questions.length : 0
          const percentage = totalQuestions > 0 ? Math.round((attempt.score / totalQuestions) * 100) : 0

          return {
            id: attempt.id,
            quiz_title: quiz.title,
            score: attempt.score,
            total_questions: totalQuestions,
            completed_at: attempt.completed_at,
            percentage
          }
        }
        return null
      })

      // Wait for all parallel operations to complete
      const [progressData, recentQuizData] = await Promise.all([
        Promise.all(coursePromises),
        Promise.all(quizPromises)
      ])

      // Filter out null values
      const validProgressData = progressData.filter((p): p is CourseProgress => p !== null)
      const validQuizData = recentQuizData.filter((q): q is QuizAttempt => q !== null)

      console.log('[Progress] Processed data:', {
        courses: validProgressData.length,
        quizzes: validQuizData.length
      })

      setCourseProgress(validProgressData)
      setRecentQuizzes(validQuizData)

      // Calculate stats
      const totalEnrolled = validProgressData.length
      const completed = validProgressData.filter(course => course.progress_percentage >= 100).length
      const totalLessonsCompleted = validProgressData.reduce((sum: number, course) => sum + course.lessons_completed, 0)
      const averageScore = validQuizData.length > 0
        ? Math.round(validQuizData.reduce((sum: number, quiz: QuizAttempt) => sum + quiz.percentage, 0) / validQuizData.length)
        : 0

      setStats({
        total_courses_enrolled: totalEnrolled,
        courses_completed: completed,
        total_lessons_completed: totalLessonsCompleted,
        average_score: averageScore,
        total_study_time: 0, // This would need tracking implementation
        streak_days: 0 // This would need tracking implementation
      })

    } catch (error) {
      console.error('[Progress] Error fetching progress data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500'
    if (percentage >= 50) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-100 text-green-800'
    if (percentage >= 60) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  if (loading || authLoading) {
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
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
              <p className="text-gray-600 mb-6">
                {authLoading ? 'Checking authentication...' : 'Loading progress data...'}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
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
          <h1 className="text-base sm:text-lg font-semibold text-gray-900">Progress</h1>
          <div className="w-10"></div>
        </div>

        <div className="p-6">
          
          {/* Mobile Contextual Back Navigation */}
          <div className="lg:hidden mb-4">
            <ContextualBackButton
              href="/dashboard"
              label="Back to Dashboard"
            />
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Learning Progress</h1>
            <p className="text-gray-600">Track your achievements and continue your learning journey</p>
          </div>

          {/* Stats Overview */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card variant="default">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Courses Enrolled</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.total_courses_enrolled}</p>
                    </div>
                    <BookOpen className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card variant="default">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Courses Completed</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.courses_completed}</p>
                    </div>
                    <Trophy className="h-8 w-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>

              <Card variant="default">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Lessons Completed</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.total_lessons_completed}</p>
                    </div>
                    <Target className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card variant="default">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Average Score</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.average_score}%</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Course Progress */}
            <Card variant="default">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Course Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {courseProgress.length > 0 ? (
                    courseProgress.map((course) => (
                      <div key={course.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{course.title}</h4>
                          <Badge variant="outline">
                            {course.lessons_completed}/{course.total_lessons} lessons
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3">
                          <Progress 
                            value={course.progress_percentage} 
                            className="flex-1"
                          />
                          <span className="text-sm font-medium text-gray-600 min-w-[3rem]">
                            {course.progress_percentage}%
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Last accessed: {new Date(course.last_accessed).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-600">No courses enrolled yet</p>
                      <p className="text-sm text-gray-500">Start learning to see your progress here</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Quiz Results */}
            <Card variant="default">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Recent Quiz Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentQuizzes.length > 0 ? (
                    recentQuizzes.map((quiz) => (
                      <div key={quiz.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{quiz.quiz_title}</h4>
                          <Badge className={getScoreColor(quiz.percentage)}>
                            {quiz.percentage}%
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>{quiz.score}/{quiz.total_questions} correct</span>
                          <span>{new Date(quiz.completed_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Target className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-600">No quiz attempts yet</p>
                      <p className="text-sm text-gray-500">Take a quiz to see your results here</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

