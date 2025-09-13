'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { useStudentDashboard } from '@/hooks/useOptimizedAPI'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { StudentSidebar } from '@/components/student/StudentSidebar'
import { 
  BookOpen, 
  GraduationCap, 
  Brain, 
  Trophy,
  TrendingUp,
  Clock,
  Target,
  PlayCircle
} from 'lucide-react'

export default function StudentDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sessionTest, setSessionTest] = useState<any>(null)

  // Test session independently
  useEffect(() => {
    const testSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        console.log('Direct session test:', {
          hasSession: !!session,
          userId: session?.user?.id,
          userEmail: session?.user?.email,
          accessToken: session?.access_token ? 'Present' : 'Missing',
          error
        })
        setSessionTest({
          hasSession: !!session,
          userId: session?.user?.id,
          userEmail: session?.user?.email,
          accessToken: session?.access_token ? 'Present' : 'Missing',
          error: error?.message
        })
      } catch (error) {
        console.error('Session test failed:', error)
        setSessionTest({ error: (error as Error).message })
      }
    }
    testSession()
  }, [])
  
  // Debug authentication
  console.log('Auth Debug:', {
    user,
    userExists: !!user,
    userId: user?.id,
    userRole: user?.role,
    userEmail: user?.email,
    sessionTest
  })
  
  // React Query hook to fetch dashboard data
  const { 
    data: dashboardData, 
    isLoading: loading, 
    error: dashboardError,
    refetch: refetchDashboard
  } = useStudentDashboard(user?.id || null)

  // Debug logging
  console.log('Dashboard Debug:', {
    userId: user?.id,
    loading,
    error: dashboardError,
    hasData: !!dashboardData,
    data: dashboardData
  })

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

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500'
    if (percentage >= 60) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString()
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
            <h1 className="text-base sm:text-lg font-semibold text-gray-900">Dashboard</h1>
            <div className="w-10"></div>
          </div>

          <div className="p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state with retry option
  if (dashboardError) {
    return (
      <div className="min-h-screen bg-background flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
          <StudentSidebar />
        </div>

        <div className="flex-1 lg:ml-64">
          <div className="p-6">
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
        {/* Mobile header - optimized layout */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-base sm:text-lg font-semibold text-gray-900">Dashboard</h1>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {user?.name?.charAt(0).toUpperCase() || 'S'}
            </span>
          </div>
        </div>        <div className="p-4 sm:p-6 md:p-8">
          {/* Header - mobile optimized */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.name || 'Student'}! 👋
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              {stats.totalCourses > 0 
                ? "Continue your learning journey and track your progress"
                : "Ready to start your learning adventure? Let's get you set up!"
              }
            </p>
            
            {/* First-time user guidance - mobile optimized */}
            {stats.totalCourses === 0 && (
              <div className="mt-4 sm:mt-6 p-4 sm:p-5 md:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                <div className="flex items-start gap-3 sm:gap-4">
                  <GraduationCap className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-blue-900 mb-2 text-base sm:text-lg">New to Acadex?</h3>
                    <p className="text-blue-700 text-sm sm:text-base mb-4 leading-relaxed">
                      Start by exploring our courses or test your knowledge with interactive quizzes.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-3">
                      <Button size="sm" asChild className="flex-1 sm:flex-initial">
                        <Link href="/courses" className="text-center">Browse Courses</Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild className="flex-1 sm:flex-initial">
                        <Link href="/quizzes" className="text-center">Try a Quiz</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Stats Grid - Mobile optimized with better design */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
            <Card variant="base" className="hover:shadow-lg transition-all duration-200">
              <CardContent className="p-3 sm:p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">Total Courses</p>
                    <p className="text-lg sm:text-xl md:text-3xl font-bold text-gray-900">{stats.totalCourses}</p>
                  </div>
                  <div className="bg-blue-50 p-2 sm:p-3 rounded-lg sm:rounded-xl flex-shrink-0 ml-2">
                    <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card variant="base" className="hover:shadow-lg transition-all duration-200">
              <CardContent className="p-3 sm:p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">Completed</p>
                    <p className="text-lg sm:text-xl md:text-3xl font-bold text-gray-900">{stats.completedCourses}</p>
                  </div>
                  <div className="bg-yellow-50 p-2 sm:p-3 rounded-lg sm:rounded-xl flex-shrink-0 ml-2">
                    <Trophy className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-yellow-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card variant="base" className="hover:shadow-lg transition-all duration-200">
              <CardContent className="p-3 sm:p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">Quiz Average</p>
                    <p className="text-lg sm:text-xl md:text-3xl font-bold text-gray-900">{stats.averageScore}%</p>
                  </div>
                  <div className="bg-green-50 p-2 sm:p-3 rounded-lg sm:rounded-xl flex-shrink-0 ml-2">
                    <Target className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card variant="base" className="hover:shadow-lg transition-all duration-200">
              <CardContent className="p-3 sm:p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">Current Streak</p>
                    <p className="text-lg sm:text-xl md:text-3xl font-bold text-gray-900">{stats.streak}</p>
                    <p className="text-xs text-gray-500">days</p>
                  </div>
                  <div className="bg-blue-50 p-2 sm:p-3 rounded-lg sm:rounded-xl flex-shrink-0 ml-2">
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Mobile responsive with better spacing */}
          <div className="space-y-6 sm:space-y-8">
            
            {/* Current Courses */}
            <Card variant="base">
              <CardHeader className="p-4 sm:p-5 md:p-6 pb-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />
                    Current Courses
                  </CardTitle>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/my-courses" className="whitespace-nowrap">View All</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 md:p-6 pt-4">
                <div className="space-y-4 sm:space-y-4">
                  {recentCourses.length > 0 ? (
                    recentCourses.map((course) => (
                      <div key={course.id} className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:border-primary/30 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 mb-2 truncate text-sm sm:text-base">{course.title}</h4>
                            <div className="flex items-center gap-3 mb-3">
                              <Progress value={course.progress} className="flex-1" />
                              <span className="text-xs sm:text-sm font-medium text-gray-600 min-w-[3rem]">
                                {course.progress}%
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-500">
                              <span className="bg-gray-100 px-2 py-1 rounded">{course.category}</span>
                              {course.duration && (
                                <>
                                  <span>•</span>
                                  <span>{course.duration}</span>
                                </>
                              )}
                              <span>•</span>
                              <span>Last accessed: {formatDate(course.lastAccessed)}</span>
                            </div>
                          </div>
                          <Button size="sm" asChild className="flex-shrink-0 w-full sm:w-auto">
                            <Link href={`/courses/${course.id}`}>Continue</Link>
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 sm:py-12">
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2 text-base sm:text-lg">Start Learning Today!</h3>
                      <p className="text-gray-600 mb-4 max-w-sm mx-auto text-sm sm:text-base">
                        Discover expert-led courses designed to boost your English skills and career prospects.
                      </p>
                      <Button className="w-full sm:w-auto" asChild>
                        <Link href="/courses">Browse All Courses</Link>
                      </Button>
                      <p className="text-xs text-gray-500 mt-2">🌟 Join 1,000+ students already learning</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Quiz Results */}
            <Card variant="base">
              <CardHeader className="p-4 sm:p-5 md:p-6 pb-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Brain className="h-5 w-5 sm:h-6 sm:w-6" />
                    Recent Quiz Results
                  </CardTitle>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/my-quizzes" className="whitespace-nowrap">View All</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 md:p-6 pt-4">
                <div className="space-y-4 sm:space-y-4">
                  {recentQuizzes.length > 0 ? (
                    recentQuizzes.map((quiz) => (
                      <div key={quiz.id} className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:border-primary/30 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <h4 className="font-semibold text-gray-900 truncate text-sm sm:text-base">{quiz.title}</h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                quiz.percentage >= 85 ? 'bg-green-100 text-green-800' :
                                quiz.percentage >= 70 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {quiz.percentage}%
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Target className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span>{quiz.score}/{quiz.totalQuestions} correct</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span>{formatDate(quiz.completedAt)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" asChild className="flex-1 sm:flex-initial">
                              <Link href={`/quizzes/${quiz.quizId}/results/${quiz.id}`} className="text-center">
                                <span className="hidden sm:inline">View Details</span>
                                <span className="sm:hidden">Details</span>
                              </Link>
                            </Button>
                            <Button size="sm" asChild className="flex-1 sm:flex-initial">
                              <Link href={`/quizzes/${quiz.quizId}/take`}>Retake</Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 sm:py-12">
                      <div className="bg-gradient-to-br from-purple-50 to-pink-100 rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-4">
                        <Brain className="h-8 w-8 sm:h-10 sm:w-10 text-purple-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2 text-base sm:text-lg">Test Your Knowledge!</h3>
                      <p className="text-gray-600 mb-4 max-w-sm mx-auto text-sm sm:text-base">
                        Challenge yourself with interactive quizzes and track your progress as you improve.
                      </p>
                      <Button className="w-full sm:w-auto" asChild>
                        <Link href="/quizzes">Try Your First Quiz</Link>
                      </Button>
                      <p className="text-xs text-gray-500 mt-2">🎯 Perfect for testing your current level</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions - Mobile responsive with better spacing */}
          <div className="mt-6 sm:mt-8">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Explore More</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <Button variant="outline" asChild className="h-auto p-4 sm:p-5 md:p-6 flex flex-col items-center gap-2 sm:gap-3">
                <Link href="/courses" className="text-center">
                  <BookOpen className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" />
                  <span className="text-sm sm:text-base font-semibold">Browse All Courses</span>
                </Link>
              </Button>
              <Button variant="outline" asChild className="h-auto p-4 sm:p-5 md:p-6 flex flex-col items-center gap-2 sm:gap-3">
                <Link href="/quizzes" className="text-center">
                  <Brain className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" />
                  <span className="text-sm sm:text-base font-semibold">Explore All Quizzes</span>
                </Link>
              </Button>
              <Button variant="outline" asChild className="h-auto p-4 sm:p-5 md:p-6 flex flex-col items-center gap-2 sm:gap-3 sm:col-span-2 lg:col-span-1">
                <Link href="/progress" className="text-center">
                  <TrendingUp className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" />
                  <span className="text-sm sm:text-base font-semibold">View Detailed Progress</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
