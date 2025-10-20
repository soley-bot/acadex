'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { createSupabaseClient } from '@/lib/supabase'
import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatCard, StatCardPresets } from '@/components/ui/stat-card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Target, Trophy, TrendingUp, Award } from 'lucide-react'
import { getScoreBadgeClasses, calculatePercentage } from '@/lib/score-utils'

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

  // CRITICAL: Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      console.log('[Progress] No user found, redirecting to auth...')
      router.refresh() // Refresh server components before redirect
      router.push('/auth?tab=signin&redirect=/dashboard/progress')
    }
  }, [authLoading, user, router])

  useEffect(() => {
    if (!authLoading && user) {
      fetchProgressData()
    }
  }, [user, authLoading]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchProgressData = async () => {
    if (!user?.id) return

    const supabaseClient = supabase

    try {
      console.log('[Progress] Fetching progress data...')
      setLoading(true)

      // Fetch ALL quiz attempts for accurate average score calculation
      // Also fetch recent 5 for display
      const [enrollmentsResult, allQuizAttemptsResult, recentQuizAttemptsResult] = await Promise.all([
        supabaseClient
          .from('enrollments')
          .select('*')
          .eq('user_id', user.id),
        supabaseClient
          .from('quiz_attempts')
          .select('score, quiz_id, completed_at')
          .eq('user_id', user.id)
          .not('completed_at', 'is', null), // Only completed attempts for average
        supabaseClient
          .from('quiz_attempts')
          .select('*')
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false })
          .limit(5)
      ])

      if (enrollmentsResult.error) throw enrollmentsResult.error
      if (allQuizAttemptsResult.error) throw allQuizAttemptsResult.error
      if (recentQuizAttemptsResult.error) throw recentQuizAttemptsResult.error

      const enrollments = enrollmentsResult.data || []
      const allQuizAttempts = allQuizAttemptsResult.data || []
      const quizAttempts = recentQuizAttemptsResult.data || []

      const coursePromises = enrollments.map(async (enrollment: any) => {
        const [courseResult, totalLessonsResult] = await Promise.all([
          supabaseClient
            .from('courses')
            .select('id, title, duration')
            .eq('id', enrollment.course_id)
            .single(),
          supabaseClient
            .from('course_lessons')
            .select('id')
            .eq('course_id', enrollment.course_id)
        ])

        const course = courseResult.data
        const totalLessons = totalLessonsResult.data || []
        const lessonIds = totalLessons.map((lesson: any) => lesson.id)

        // Get completed lessons for this specific course
        let completedLessons: any[] = []
        if (lessonIds.length > 0) {
          const { data } = await supabaseClient
            .from('lesson_progress')
            .select('lesson_id')
            .eq('user_id', user.id)
            .in('lesson_id', lessonIds)
            .eq('completed', true)

          completedLessons = data || []
        }

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

      // Process quiz attempts for display (recent 5)
      const quizPromises = quizAttempts.map(async (attempt: any) => {
        // Get quiz details and count questions
        const [quizResult, questionsResult] = await Promise.all([
          supabaseClient
            .from('quizzes')
            .select('title, total_questions')
            .eq('id', attempt.quiz_id)
            .single(),
          supabaseClient
            .from('quiz_questions')
            .select('id', { count: 'exact', head: true })
            .eq('quiz_id', attempt.quiz_id)
        ])

        const quiz = quizResult.data
        if (quiz) {
          // Use total_questions from attempt if available, otherwise from quiz table, or count from questions
          const totalQuestions = attempt.total_questions || quiz.total_questions || questionsResult.count || 0
          const percentage = calculatePercentage(attempt.score ?? 0, totalQuestions)

          return {
            id: attempt.id,
            quiz_title: quiz.title,
            score: attempt.score ?? 0,
            total_questions: totalQuestions,
            completed_at: attempt.completed_at,
            percentage
          }
        }
        return null
      })

      // Process ALL quiz attempts for accurate average score
      const allQuizPromises = allQuizAttempts.map(async (attempt: any) => {
        // If attempt already has total_questions, use that
        if (attempt.total_questions) {
          const percentage = calculatePercentage(attempt.score ?? 0, attempt.total_questions)
          return percentage
        }

        // Otherwise fetch quiz details
        const [quizResult, questionsResult] = await Promise.all([
          supabaseClient
            .from('quizzes')
            .select('total_questions')
            .eq('id', attempt.quiz_id)
            .single(),
          supabaseClient
            .from('quiz_questions')
            .select('id', { count: 'exact', head: true })
            .eq('quiz_id', attempt.quiz_id)
        ])

        const quiz = quizResult.data
        if (quiz) {
          const totalQuestions = quiz.total_questions || questionsResult.count || 0
          const percentage = calculatePercentage(attempt.score ?? 0, totalQuestions)
          return percentage
        }
        return null
      })

      const [progressData, recentQuizData, allQuizPercentages] = await Promise.all([
        Promise.all(coursePromises),
        Promise.all(quizPromises),
        Promise.all(allQuizPromises)
      ])

      const validProgressData = progressData.filter((p): p is CourseProgress => p !== null)
      const validQuizData = recentQuizData.filter((q): q is QuizAttempt => q !== null)
      const validPercentages = allQuizPercentages.filter((p): p is number => p !== null)

      console.log('[Progress] Processed data:', {
        courses: validProgressData.length,
        recentQuizzes: validQuizData.length,
        totalQuizAttempts: validPercentages.length
      })

      setCourseProgress(validProgressData)
      setRecentQuizzes(validQuizData)

      const totalEnrolled = validProgressData.length
      const completed = validProgressData.filter(course => course.progress_percentage >= 100).length
      const totalLessonsCompleted = validProgressData.reduce((sum: number, course) => sum + course.lessons_completed, 0)

      // Calculate average score from ALL completed quiz attempts, not just recent 5
      const averageScore = validPercentages.length > 0
        ? Math.round(validPercentages.reduce((sum: number, percentage: number) => sum + percentage, 0) / validPercentages.length)
        : 0

      setStats({
        total_courses_enrolled: totalEnrolled,
        courses_completed: completed,
        total_lessons_completed: totalLessonsCompleted,
        average_score: averageScore,
        total_study_time: 0,
        streak_days: 0
      })

    } catch (error: any) {
      console.error('[Progress] Error fetching progress data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Removed - now using standardized getScoreBadgeClasses from score-utils

  if (loading || authLoading) {
    return (
      <DashboardLayout title="Progress">
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
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Progress">
      <>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Learning Progress</h1>
          <p className="text-gray-600">Track your achievements and continue your learning journey</p>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              label="Courses Enrolled"
              value={stats.total_courses_enrolled}
              icon={BookOpen}
              variant="default"
              iconColor="text-primary"
            />
            <StatCard
              label="Courses Completed"
              value={stats.courses_completed}
              icon={Trophy}
              variant="default"
              iconColor="text-yellow-500"
            />
            <StatCard
              label="Lessons Completed"
              value={stats.total_lessons_completed}
              icon={Target}
              variant="default"
              iconColor="text-green-500"
            />
            <StatCard
              label="Average Quiz Score"
              value={`${stats.average_score}%`}
              description="Across all attempts"
              icon={TrendingUp}
              variant="default"
              iconColor="text-blue-500"
            />
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
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <h4 className="font-medium text-gray-900 flex-1 truncate">{quiz.quiz_title}</h4>
                        <Badge className={getScoreBadgeClasses(quiz.percentage)}>
                          {quiz.percentage}%
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>{quiz.score}/{quiz.total_questions} correct answers</span>
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
      </>
    </DashboardLayout>
  )
}
