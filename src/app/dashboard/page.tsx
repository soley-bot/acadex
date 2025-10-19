'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useStudentDashboard } from '@/hooks/api'
import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { StatCard, StatCardPresets } from '@/components/ui/stat-card'
import {
  BookOpen,
  GraduationCap,
  Brain,
  Trophy,
  TrendingUp,
  Clock,
  Target,
  PlayCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react'
import { formatDate } from '@/lib/date-utils'

export default function StudentDashboard() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  // CRITICAL: Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      console.log('[Dashboard] No user found, redirecting to auth...')
      router.refresh() // Refresh server components before redirect
      router.push('/auth?tab=signin&redirect=/dashboard')
    }
  }, [authLoading, user, router])

  // React Query hook to fetch dashboard data
  const {
    data: dashboardData,
    isLoading: loading,
    error: dashboardError,
    refetch: refetchDashboard
  } = useStudentDashboard(user?.id || null)

  // Extract data from React Query response with fallbacks
  const stats = dashboardData?.stats || {
    totalCourses: 0,
    completedCourses: 0,
    totalQuizzes: 0,
    averageScore: 0,
    studyHours: 0,
    streak: 0
  }

  const recentCourses = dashboardData?.recentCourses || []
  const recentQuizzes = dashboardData?.recentQuizzes || []

  if (loading || authLoading) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="text-center !p-6 sm:!p-8 md:!p-10 lg:!p-12 max-w-md mx-auto border-2 border-primary/20 shadow-xl">
            <div className="animate-spin rounded-full h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 border-4 border-primary/20 border-t-primary mx-auto mb-4 sm:mb-5 md:mb-6"></div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              {authLoading ? 'Checking authentication...' : 'Loading dashboard...'}
            </h3>
            <p className="text-sm sm:text-base text-gray-600">
              {authLoading ? 'Please wait...' : 'Gathering your learning progress'}
            </p>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  // Error state with retry option
  if (dashboardError) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="max-w-md mx-auto text-center py-12">
          <div className="mb-8">
            <div className="text-6xl mb-4">😞</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Oops! Something went wrong</h2>
            <p className="text-gray-600 mb-6">
              We couldn&apos;t load your dashboard data. This might be a temporary issue.
            </p>
          </div>

          <div className="space-y-4">
            <Button onClick={() => refetchDashboard()} className="w-full">
              Try Again
            </Button>
            <Button variant="outline" onClick={() => router.push('/')} className="w-full">
              Go to Home
            </Button>
          </div>

          {/* Technical details for development */}
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-8 p-4 bg-gray-50 rounded-lg text-left">
              <summary className="cursor-pointer font-medium">Error Details</summary>
              <pre className="mt-2 text-sm text-red-600 whitespace-pre-wrap">
                {dashboardError?.message || 'Unknown error'}
              </pre>
            </details>
          )}
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Dashboard">
      {/* Welcome Header */}
      <div className="mb-4 sm:mb-6 lg:mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
            Welcome back, {user?.name?.split(' ')[0] || 'Student'}!
          </h1>
        </div>
        <p className="text-sm sm:text-base lg:text-lg text-gray-600">Let&apos;s continue your learning journey</p>
      </div>

        <div className="grid gap-4 sm:gap-5 lg:gap-6 grid-cols-1 xl:grid-cols-3">

          {/* Main Column */}
          <div className="xl:col-span-2 flex flex-col gap-4 sm:gap-5 lg:gap-6">

            {/* Stats Overview - Modern Gradient Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <StatCard
                label="Active Courses"
                value={stats.totalCourses}
                icon={BookOpen}
                variant="gradient"
                {...StatCardPresets.courses.gradient}
              />
              <StatCard
                label="Completed"
                value={stats.completedCourses}
                icon={GraduationCap}
                variant="gradient"
                {...StatCardPresets.completed.gradient}
              />
              <StatCard
                label="Quiz Attempts"
                value={stats.totalQuizzes}
                icon={Brain}
                variant="gradient"
                {...StatCardPresets.quizzes.gradient}
              />
              <StatCard
                label="Avg Score"
                value={`${stats.averageScore}%`}
                icon={Trophy}
                variant="gradient"
                {...StatCardPresets.score.gradient}
              />
            </div>

            {/* My Courses Section */}
            <Card className="border-2 border-gray-100 shadow-lg">
              <CardContent className="!p-3 sm:!p-4 md:!p-5 lg:!p-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">My Courses</h3>
                  </div>
                  <Link href="/dashboard/my-courses">
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 text-xs sm:text-sm">
                      View All <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                    </Button>
                  </Link>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  {recentCourses.length > 0 ? (
                    recentCourses.slice(0, 3).map((course) => (
                      <div key={course.id} className="p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg sm:rounded-xl border border-gray-200 hover:border-primary/30 hover:shadow-md transition-all">
                        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                          <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm sm:text-base text-gray-900 truncate">{course.title}</h4>
                            <p className="text-xs sm:text-sm text-gray-500">{course.category}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Progress value={course.progress} className="flex-1 h-1.5 sm:h-2" />
                          <span className="text-xs sm:text-sm font-semibold text-primary whitespace-nowrap">{course.progress}%</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 sm:py-8 md:py-10 lg:py-12">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                        <BookOpen className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-blue-600" />
                      </div>
                      <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No courses yet</h4>
                      <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">Start your learning journey today</p>
                      <Button asChild size="sm" className="sm:text-base">
                        <Link href="/courses">Browse Courses</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Quiz Results */}
            <Card className="border-2 border-gray-100 shadow-lg">
              <CardContent className="!p-3 sm:!p-4 md:!p-5 lg:!p-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">Recent Quiz Results</h3>
                  </div>
                  <Link href="/dashboard/my-quizzes">
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 text-xs sm:text-sm">
                      View All <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                    </Button>
                  </Link>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  {recentQuizzes.length > 0 ? (
                    recentQuizzes.slice(0, 3).map((quiz) => (
                      <div key={quiz.id} className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg sm:rounded-xl border border-gray-200 hover:border-primary/30 hover:shadow-md transition-all">
                        <div className="flex-1 min-w-0 mr-2 sm:mr-3">
                          <h4 className="font-semibold text-sm sm:text-base text-gray-900 mb-1 truncate">{quiz.title}</h4>
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600">
                            <span>{quiz.score}/{quiz.totalQuestions} correct</span>
                            <span className="hidden sm:inline">•</span>
                            <span className="hidden sm:inline">{formatDate(quiz.completedAt)}</span>
                          </div>
                        </div>
                        <div className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg font-bold text-xs sm:text-sm whitespace-nowrap ${
                          quiz.percentage >= 85 ? 'bg-green-100 text-green-700' :
                          quiz.percentage >= 70 ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {quiz.percentage}%
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 sm:py-8 md:py-10 lg:py-12">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                        <Brain className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-purple-600" />
                      </div>
                      <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Test Your Knowledge!</h4>
                      <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">Challenge yourself with interactive quizzes</p>
                      <Button asChild size="sm" className="sm:text-base">
                        <Link href="/quizzes">Try Your First Quiz</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Column */}
          <div className="xl:col-span-1 flex flex-col gap-4 sm:gap-5 lg:gap-6">
            {/* Study Assistant Card */}
            <Card className="border-2 border-primary/20 shadow-xl bg-gradient-to-br from-primary/5 to-secondary/5">
              <CardContent className="!p-3 sm:!p-4 md:!p-5 lg:!p-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">Study Assistant</h3>
                </div>

                {stats.totalCourses === 0 ? (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">Start by exploring our courses or test your knowledge with interactive quizzes.</p>
                    <div className="space-y-2">
                      <Button size="sm" asChild className="w-full">
                        <Link href="/courses">Browse Courses</Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild className="w-full">
                        <Link href="/quizzes">Try a Quiz</Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-white rounded-lg border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-2">Today&apos;s Goal</h4>
                      <p className="text-sm text-gray-600 mb-3">Complete 2 lessons and 1 quiz</p>
                      <Progress value={60} className="mb-2" />
                      <p className="text-xs text-gray-500">60% Complete</p>
                    </div>

                    <div className="p-4 bg-white rounded-lg border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-2">This Week</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>Study hours: {stats.studyHours}</p>
                        <p>Quizzes completed: {stats.totalQuizzes}</p>
                        <p>Average score: {stats.averageScore}%</p>
                      </div>
                    </div>

                    <Button className="w-full" asChild>
                      <Link href="/dashboard/my-courses" className="flex items-center justify-center gap-2">
                        Continue Learning
                        <PlayCircle className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats Card */}
            <Card className="border-2 border-gray-100 shadow-lg">
              <CardContent className="!p-3 sm:!p-4 md:!p-5 lg:!p-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">Quick Stats</h3>
                </div>

                <div className="space-y-3">
                  <Link href="/dashboard/my-courses" className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Active Courses</span>
                      <span className="text-lg font-bold text-primary">{stats.totalCourses}</span>
                    </div>
                  </Link>

                  <Link href="/dashboard/progress" className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">View Progress</span>
                      <Target className="w-5 h-5 text-primary" />
                    </div>
                  </Link>

                  <Link href="/dashboard/my-quizzes" className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Quiz History</span>
                      <Brain className="w-5 h-5 text-primary" />
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
    </DashboardLayout>
  )
}
