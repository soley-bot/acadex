'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, TrendingUp, Users, BookOpen, Brain, DollarSign, Download, RefreshCw } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { adminCache } from '@/lib/admin-cache'

interface AnalyticsData {
  totalUsers: number
  totalCourses: number
  totalQuizzes: number
  courseEnrollments: number
  totalRevenue: number
  newUsersThisMonth: number
}

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalUsers: 0,
    totalCourses: 0,
    totalQuizzes: 0,
    courseEnrollments: 0,
    totalRevenue: 0,
    newUsersThisMonth: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTimeRange, setSelectedTimeRange] = useState('30 days')

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Check cache first
      const cachedData = adminCache.get<AnalyticsData>('admin:analytics')
      if (cachedData) {
        setAnalytics(cachedData)
        setLoading(false)
        return
      }

      // Fetch analytics data from multiple tables with optimized queries
      const [usersResult, coursesResult, quizzesResult, enrollmentsResult, attemptsResult] = await Promise.all([
        supabase.from('users').select('id, created_at'),
        supabase.from('courses').select('id, price, created_at'),
        supabase.from('quizzes').select('id, created_at'),
        supabase.from('enrollments').select('id, enrolled_at'),
        supabase.from('quiz_attempts').select('id, completed_at')
      ])

      // Handle individual query errors gracefully
      const users = usersResult.data || []
      const courses = coursesResult.data || []
      const quizzes = quizzesResult.data || []
      const enrollments = enrollmentsResult.data || []
      const attempts = attemptsResult.data || []

      // Log any errors but don't fail completely
      if (usersResult.error) console.warn('Users query error:', usersResult.error)
      if (coursesResult.error) console.warn('Courses query error:', coursesResult.error)
      if (quizzesResult.error) console.warn('Quizzes query error:', quizzesResult.error)
      if (enrollmentsResult.error) console.warn('Enrollments query error:', enrollmentsResult.error)
      if (attemptsResult.error) console.warn('Attempts query error:', attemptsResult.error)

      // Calculate this month's new additions
      const now = new Date()
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      
      const newUsersThisMonth = users.filter(user => 
        new Date(user.created_at) >= thisMonth
      ).length

      // Calculate total revenue from course prices (note: this is potential revenue, not actual payments)
      const totalRevenue = courses.reduce((sum, course) => sum + (Number(course.price) || 0), 0)

      const analyticsData = {
        totalUsers: users.length,
        totalCourses: courses.length,
        totalQuizzes: quizzes.length,
        courseEnrollments: enrollments.length,
        totalRevenue,
        newUsersThisMonth
      }

      // Cache the results
      adminCache.set('admin:analytics', analyticsData, 5 * 60 * 1000) // 5 minutes cache
      setAnalytics(analyticsData)
    } catch (err) {
      console.error('Error fetching analytics:', err)
      setError('Failed to load analytics data. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  const timeRanges = ['7 days', '30 days', '3 months', '6 months', '1 year']

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center bg-white p-8 rounded-xl shadow-lg border border-gray-200">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-700 font-medium">Loading analytics...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg border border-gray-200 max-w-md mx-auto">
          <p className="text-red-600 mb-4 font-bold">{error}</p>
          <button 
            onClick={fetchAnalytics}
            className="text-red-600 hover:text-red-700 underline font-bold bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">Track your platform performance and user engagement</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                adminCache.invalidate('admin:analytics')
                fetchAnalytics()
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg flex items-center gap-2 transition-colors font-bold shadow-md hover:shadow-lg"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <select 
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
            >
              {timeRanges.map((range) => (
                <option key={range} value={range}>{range}</option>
              ))}
            </select>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalUsers}</div>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +{analytics.newUsersThisMonth} this month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalCourses}</div>
            <p className="text-xs text-gray-500">Published courses</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quizzes</CardTitle>
            <Brain className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalQuizzes}</div>
            <p className="text-xs text-gray-500">Interactive assessments</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrollments</CardTitle>
            <TrendingUp className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.courseEnrollments}</div>
            <p className="text-xs text-gray-500">Course enrollments</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue and Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Total revenue from course sales</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">${analytics.totalRevenue.toLocaleString()}</div>
            <p className="text-sm text-gray-500">From {analytics.totalCourses} courses</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Platform Growth</CardTitle>
            <CardDescription>User and content metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Users this month</span>
                <span className="font-medium">+{analytics.newUsersThisMonth}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Avg. enrollments per course</span>
                <span className="font-medium">
                  {analytics.totalCourses > 0 ? Math.round(analytics.courseEnrollments / analytics.totalCourses) : 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart Placeholders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>User registrations over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Chart visualization coming soon</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Course Performance</CardTitle>
            <CardDescription>Enrollment trends and engagement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Performance metrics coming soon</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
