'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { useStudentDashboard } from '@/hooks/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { StudentSidebar } from '@/components/student/StudentSidebar'
import { BodyLG, BodyMD } from '@/components/ui/Typography'
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
import { formatDate } from '@/lib/date-utils'

export default function StudentDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex">
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

        <div className="flex-1 lg:ml-64 flex items-center justify-center">
          <Card variant="elevated" className="text-center p-12 max-w-md mx-auto">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary mx-auto mb-6"></div>
            <BodyLG className="text-gray-700 font-medium">Loading dashboard...</BodyLG>
            <BodyMD className="text-gray-500 mt-2">Gathering your learning progress</BodyMD>
          </Card>
        </div>
      </div>
    )
  }

  // Error state with retry option
  if (dashboardError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex">
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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex">
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
        {/* Clean Header */}
        <header className="bg-white border-b-2 border-slate-200">
          <div className="max-w-screen-xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Mobile hamburger menu */}
              <div className="lg:hidden">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 rounded-md text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
              
              <div className="flex-1 lg:flex-initial">
                <h1 className="text-xl font-semibold text-slate-700">
                  Welcome back, {user?.name || 'Student'}!
                </h1>
                <p className="text-sm text-slate-500">Let&apos;s have a great day of learning.</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <button className="text-slate-600 hover:text-slate-800">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 17H20L18.5951 15.5951C18.2141 15.2141 18 14.6973 18 14.1585V11C18 8.38757 16.3304 6.16509 14 5.34142V5C14 3.89543 13.1046 3 12 3C10.8954 3 10 3.89543 10 5V5.34142C7.66962 6.16509 6 8.38757 6 11V14.1585C6 14.6973 5.78595 15.2141 5.40493 15.5951L4 17H9M12 21C12.5523 21 13 20.5523 13 20H11C11 20.5523 11.4477 21 12 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <div className="w-10 h-10 bg-sky-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {user?.name?.charAt(0).toUpperCase() || 'S'}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="dashboard-main">
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
            
            {/* Main Column */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              
              {/* Stats Overview */}
              <div className="dashboard-section">
                <div className="dashboard-section-header">
                  <h3 className="dashboard-section-title flex items-center">
                    <TrendingUp className="w-6 h-6 mr-3 text-sky-500" />
                    Your Progress
                  </h3>
                </div>
                
                <div className="stats-grid">
                  {/* Active Courses */}
                  <div className="stat-card">
                    <div className="stat-card-header">
                      <h4 className="stat-card-title">Active Courses</h4>
                      <div className="stat-card-icon">
                        <BookOpen className="w-4 h-4 stat-card-icon-default" />
                      </div>
                    </div>
                    <div className="stat-card-value">{stats.totalCourses}</div>
                    <p className="stat-card-description">Currently enrolled</p>
                  </div>

                  {/* Completed Courses */}
                  <div className="stat-card">
                    <div className="stat-card-header">
                      <h4 className="stat-card-title">Completed Courses</h4>
                      <div className="stat-card-icon">
                        <GraduationCap className="w-4 h-4 stat-card-icon-success" />
                      </div>
                    </div>
                    <div className="stat-card-value">{stats.completedCourses}</div>
                    <p className="stat-card-description">Finished successfully</p>
                  </div>

                  {/* Total Quizzes */}
                  <div className="stat-card">
                    <div className="stat-card-header">
                      <h4 className="stat-card-title">Total Quizzes</h4>
                      <div className="stat-card-icon">
                        <Brain className="w-4 h-4 stat-card-icon-default" />
                      </div>
                    </div>
                    <div className="stat-card-value">{stats.totalQuizzes}</div>
                    <p className="stat-card-description">Attempted so far</p>
                  </div>

                  {/* Average Score */}
                  <div className="stat-card">
                    <div className="stat-card-header">
                      <h4 className="stat-card-title">Average Score</h4>
                      <div className="stat-card-icon">
                        <Trophy className="w-4 h-4 stat-card-icon-warning" />
                      </div>
                    </div>
                    <div className="stat-card-value">{stats.averageScore}%</div>
                    <p className="stat-card-description">Across all quizzes</p>
                  </div>
                </div>
              </div>

              {/* Current Courses */}
              <div className="dashboard-section">
                <div className="dashboard-section-header">
                  <h3 className="dashboard-section-title flex items-center">
                    <BookOpen className="w-6 h-6 mr-3 text-sky-500" />
                    My Courses
                  </h3>
                </div>
                <div className="space-y-4">
                  {recentCourses.length > 0 ? (
                    recentCourses.map((course) => (
                      <div key={course.id} className="content-card">
                        <div className="content-card-body">
                          <div className="flex items-center mb-3">
                            <div className="p-2 bg-sky-100 rounded-full mr-4 text-sky-600">
                              <BookOpen className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="content-card-title">{course.title}</h4>
                              <p className="content-card-description">{course.category}</p>
                            </div>
                          </div>
                          <div className="content-card-progress">
                            <div className="flex justify-between items-center mb-1">
                              <span className="content-card-progress-label">Progress</span>
                              <span className="text-xs font-semibold text-sky-600">{course.progress}%</span>
                            </div>
                            <div className="progress-bar">
                              <div className="progress-fill bg-sky-500" style={{ width: `${course.progress}%` }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">
                      <BookOpen className="empty-state-icon" />
                      <h4 className="empty-state-title">No courses yet</h4>
                      <p className="empty-state-description">Start your learning journey by enrolling in a course.</p>
                      <div className="empty-state-action">
                        <Link href="/courses">
                          <Button>Browse Courses</Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Quiz Results */}
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-semibold text-slate-700 mb-4 flex items-center">
                  <Brain className="w-6 h-6 mr-3 text-amber-500" />
                  Recent Quiz Results
                </h3>
                <div className="space-y-3">
                  {recentQuizzes.length > 0 ? (
                    recentQuizzes.map((quiz) => (
                      <div key={quiz.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                          <h4 className="text-sm font-semibold text-slate-800">{quiz.title}</h4>
                          <p className="text-xs text-slate-500">{quiz.score}/{quiz.totalQuestions} correct</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-xs font-medium ${
                            quiz.percentage >= 85 ? 'text-green-600' : 
                            quiz.percentage >= 70 ? 'text-amber-600' : 'text-red-600'
                          }`}>
                            {quiz.percentage}%
                          </p>
                          <p className="text-xs text-slate-500">{formatDate(quiz.completedAt)}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="bg-gradient-to-br from-purple-50 to-pink-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <Brain className="h-8 w-8 text-purple-600" />
                      </div>
                      <h3 className="font-semibold text-slate-800 mb-2">Test Your Knowledge!</h3>
                      <p className="text-slate-600 mb-4 max-w-sm mx-auto text-sm">
                        Challenge yourself with interactive quizzes and track your progress.
                      </p>
                      <Button className="w-full sm:w-auto" asChild>
                        <Link href="/quizzes">Try Your First Quiz</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Side Column */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-xl shadow-md sticky top-8">
                <h3 className="text-xl font-semibold text-slate-700 mb-4 flex items-center">
                  <Clock className="w-6 h-6 mr-3 text-sky-500" />
                  Study Assistant
                </h3>
                <div className="space-y-4">
                  {/* First-time user guidance */}
                  {stats.totalCourses === 0 ? (
                    <div className="p-4 bg-gradient-to-br from-sky-50 to-blue-50 rounded-lg">
                      <h4 className="text-sm font-semibold text-slate-800 mb-2">New to Acadex?</h4>
                      <p className="text-xs text-slate-600 mb-3">Start by exploring our courses or test your knowledge with interactive quizzes.</p>
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
                    <>
                      <div className="p-4 bg-gradient-to-br from-sky-50 to-blue-50 rounded-lg">
                        <h4 className="text-sm font-semibold text-slate-800 mb-2">Today&apos;s Goal</h4>
                        <p className="text-xs text-slate-600 mb-3">Complete 2 lessons and 1 quiz</p>
                        <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                          <div className="bg-sky-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                        </div>
                        <p className="text-xs text-slate-500">60% Complete</p>
                      </div>
                      
                      <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                        <h4 className="text-sm font-semibold text-slate-800 mb-2">This Week</h4>
                        <p className="text-xs text-slate-600 mb-1">Study hours: {stats.studyHours}</p>
                        <p className="text-xs text-slate-600 mb-1">Quizzes completed: {stats.totalQuizzes}</p>
                        <p className="text-xs text-slate-600">Average score: {stats.averageScore}%</p>
                      </div>
                    </>
                  )}

                  <button className="w-full bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center">
                    Continue Learning
                    <PlayCircle className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

