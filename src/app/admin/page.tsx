'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { logger } from '@/lib/logger'
import Icon from '@/components/ui/Icon'

interface DashboardStats {
  totalUsers: number
  totalCourses: number
  totalQuizzes: number
  totalAttempts: number
  totalRevenue: number
  publishedCourses: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalCourses: 0,
    totalQuizzes: 0,
    totalAttempts: 0,
    totalRevenue: 0,
    publishedCourses: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      logger.info('Fetching dashboard statistics', { component: 'AdminDashboard' })

      // Fetch all stats in parallel with timeout
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout after 15 seconds')), 15000)
      )

      const dataPromise = Promise.all([
        supabase.from('users').select('id').limit(1000),
        supabase.from('courses').select('id, price, is_published').limit(1000),
        supabase.from('quizzes').select('id').limit(1000),
        supabase.from('quiz_attempts').select('id').limit(1000)
      ])

      const [usersResult, coursesResult, quizzesResult, attemptsResult] = await Promise.race([
        dataPromise,
        timeout
      ]) as any[]

      // Handle potential errors in results
      if (usersResult.error) throw usersResult.error
      if (coursesResult.error) throw coursesResult.error
      if (quizzesResult.error) throw quizzesResult.error
      if (attemptsResult.error) throw attemptsResult.error

      const users = usersResult.data || []
      const courses = coursesResult.data || []
      const quizzes = quizzesResult.data || []
      const attempts = attemptsResult.data || []

      // Calculate revenue from courses
      const totalRevenue = courses.reduce((sum: number, course: any) => sum + (Number(course.price) || 0), 0)
      const publishedCourses = courses.filter((course: any) => course.is_published).length

      const newStats = {
        totalUsers: users.length,
        totalCourses: courses.length,
        totalQuizzes: quizzes.length,
        totalAttempts: attempts.length,
        totalRevenue,
        publishedCourses
      }

      setStats(newStats)
      logger.info('Dashboard statistics loaded successfully', newStats)

    } catch (err: any) {
      logger.error('Dashboard stats error:', err)
      setError(err.message || 'Failed to load dashboard statistics')
      logger.error('Failed to fetch dashboard stats', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboardStats()
  }, [fetchDashboardStats])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
              <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-blue-100 opacity-25 mx-auto"></div>
            </div>
            <p className="text-gray-600 font-medium">Loading dashboard...</p>
            <p className="text-sm text-gray-500 mt-2">Gathering latest statistics</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-secondary/10">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center bg-white p-8 rounded-2xl shadow-xl border border-gray-200 max-w-md mx-auto">
            <div className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="warning" size={24} color="error" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Dashboard</h3>
            <p className="text-primary mb-4 text-sm">{error}</p>
            <button 
              onClick={fetchDashboardStats}
              className="bg-primary hover:bg-primary/90 text-secondary px-6 py-3 rounded-lg font-medium transition-colors duration-200 shadow-md hover:shadow-lg"
            >
            </button>
          </div>
        </div>
      </div>
    )
  }

  const dashboardCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      description: 'Registered learners',
      icon: 'users',
      color: 'text-secondary',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Total Courses',
      value: stats.totalCourses.toLocaleString(),
      description: 'Educational content',
      icon: 'book',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Published Courses',
      value: stats.publishedCourses.toLocaleString(),
      description: 'Active learning paths',
      icon: 'check-circle',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      title: 'Total Quizzes',
      value: stats.totalQuizzes.toLocaleString(),
      description: 'Assessment tools',
      icon: 'help',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Quiz Attempts',
      value: stats.totalAttempts.toLocaleString(),
      description: 'Learning assessments',
      icon: 'edit',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      description: 'Platform earnings',
      icon: 'dollar',
      color: 'text-primary',
      bgColor: 'bg-primary/5'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header */}
      <div className="mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 text-lg">
            Welcome back! Here&apos;s what&apos;s happening on your platform.
          </p>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {dashboardCards.map((stat) => (
          <Card key={stat.title} className="bg-white border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-600 mb-2">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.description}</p>
                </div>
                <div className={`${stat.bgColor} p-4 rounded-xl ml-4 flex-shrink-0`}>
                  <Icon 
                    name={stat.icon as any} 
                    size={28} 
                    color="current"
                    className={`${stat.color}`}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-white border-gray-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-gray-900 font-bold flex items-center">
              <Icon name="activity" size={20} color="primary" className="mr-2" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest platform activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center p-3 rounded-lg bg-blue-50 border border-blue-100">
                <div className="w-3 h-3 bg-secondary rounded-full mr-4"></div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">New user registered</p>
                  <p className="text-xs text-gray-500">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center p-3 rounded-lg bg-green-50 border border-green-100">
                <div className="w-3 h-3 bg-green-600 rounded-full mr-4"></div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">Course published</p>
                  <p className="text-xs text-gray-500">1 hour ago</p>
                </div>
              </div>
              <div className="flex items-center p-3 rounded-lg bg-purple-50 border border-purple-100">
                <div className="w-3 h-3 bg-purple-600 rounded-full mr-4"></div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">Quiz completed</p>
                  <p className="text-xs text-gray-500">3 hours ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-gray-900 font-bold flex items-center">
              <Icon name="lightning" size={20} color="primary" className="mr-2" />
              Quick Actions
            </CardTitle>
            <CardDescription>Commonly used admin functions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <button className="w-full text-left p-4 rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:bg-primary/10 transition-all duration-200 group">
                <div className="flex items-center">
                  <div className="bg-secondary/10 p-2 rounded-lg mr-3 group-hover:bg-primary/20 transition-colors">
                    <Icon name="user" size={20} color="current" className="text-secondary" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Add New User</div>
                    <div className="text-sm text-gray-500">Create a new user account</div>
                  </div>
                </div>
              </button>
              
              <button className="w-full text-left p-4 rounded-xl border-2 border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200 group">
                <div className="flex items-center">
                  <div className="bg-green-100 p-2 rounded-lg mr-3 group-hover:bg-green-200 transition-colors">
                    <Icon name="add" size={20} color="current" className="text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Create Course</div>
                    <div className="text-sm text-gray-500">Add a new course to the platform</div>
                  </div>
                </div>
              </button>
              
              <button className="w-full text-left p-4 rounded-xl border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 group">
                <div className="flex items-center">
                  <div className="bg-purple-100 p-2 rounded-lg mr-3 group-hover:bg-purple-200 transition-colors">
                    <Icon name="help" size={20} color="current" className="text-purple-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Create Quiz</div>
                    <div className="text-sm text-gray-500">Design a new quiz</div>
                  </div>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}