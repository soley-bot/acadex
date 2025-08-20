'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, TrendingUp, Users, BookOpen, Brain, DollarSign, Download, RefreshCw, Calendar, Filter } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { logger } from '@/lib/logger'
import { useErrorHandler } from '@/lib/errorHandler'
import { adminCache } from '@/lib/admin-cache'
import { useDebounce } from '@/lib/performance'

interface AnalyticsData {
  totalUsers: number
  totalCourses: number
  totalQuizzes: number
  courseEnrollments: number
  totalRevenue: number
  newUsersThisMonth: number
}

interface MetricCardProps {
  title: string
  value: string | number
  description: string
  icon: React.ReactNode
  trend?: string
  loading?: boolean
}

const MetricCard = ({ title, value, description, icon, trend, loading }: MetricCardProps) => (
  <Card className="transition-all duration-200 hover:shadow-md">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
      <div className="text-gray-400">
        {loading ? (
          <div className="w-4 h-4 bg-muted/60 animate-pulse rounded" />
        ) : (
          icon
        )}
      </div>
    </CardHeader>
    <CardContent>
      {loading ? (
        <>
          <div className="h-8 bg-muted/60 animate-pulse rounded mb-2" />
          <div className="h-4 w-24 bg-muted/60 animate-pulse rounded" />
        </>
      ) : (
        <>
          <div className="text-2xl sm:text-3xl font-bold mb-2">{value}</div>
          <p className="text-xs text-gray-500">{description}</p>
          {trend && (
            <p className="text-xs text-green-600 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              {trend}
            </p>
          )}
        </>
      )}
    </CardContent>
  </Card>
)

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
  const [refreshing, setRefreshing] = useState(false)

  const { handleError } = useErrorHandler()

  // Debounce time range changes to prevent excessive API calls
  const debouncedTimeRange = useDebounce(selectedTimeRange, 300)

  // Memoize formatted values for performance
  const formattedAnalytics = useMemo(() => ({
    totalRevenue: `$${analytics.totalRevenue.toLocaleString()}`,
    avgEnrollments: analytics.totalCourses > 0 
      ? Math.round(analytics.courseEnrollments / analytics.totalCourses) 
      : 0,
    growthRate: analytics.newUsersThisMonth > 0 
      ? `+${analytics.newUsersThisMonth} this month` 
      : 'No new users'
  }), [analytics])

  const fetchAnalytics = useCallback(async (forceRefresh = false) => {
    const startTime = performance.now()
    
    try {
      setLoading(true)
      setError(null)

      // Check cache first (unless forcing refresh)
      if (!forceRefresh) {
        const cachedData = adminCache.get<AnalyticsData>('admin:analytics')
        if (cachedData) {
          setAnalytics(cachedData)
          setLoading(false)
          logger.performance('analytics-cache-hit', performance.now() - startTime)
          return
        }
      }

      logger.apiCall('/admin/analytics', 'GET', { timeRange: debouncedTimeRange })

      // Optimized parallel queries with only necessary fields
      const [usersResult, coursesResult, quizzesResult, enrollmentsResult] = await Promise.all([
        supabase
          .from('users')
          .select('id, created_at')
          .order('created_at', { ascending: false }),
        supabase
          .from('courses')
          .select('id, price')
          .eq('is_published', true),
        supabase
          .from('quizzes')
          .select('id')
          .eq('is_published', true),
        supabase
          .from('enrollments')
          .select('id, course_id')
      ])

      // Handle individual query errors gracefully
      const users = usersResult.data || []
      const courses = coursesResult.data || []
      const quizzes = quizzesResult.data || []
      const enrollments = enrollmentsResult.data || []

      // Log any individual errors but don't fail completely
      if (usersResult.error) logger.warn('Users query error', { error: usersResult.error })
      if (coursesResult.error) logger.warn('Courses query error', { error: coursesResult.error })
      if (quizzesResult.error) logger.warn('Quizzes query error', { error: quizzesResult.error })
      if (enrollmentsResult.error) logger.warn('Enrollments query error', { error: enrollmentsResult.error })

      // Calculate this month's new users
      const now = new Date()
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      
      const newUsersThisMonth = users.filter((user: { created_at: string }) => 
        new Date(user.created_at) >= thisMonth
      ).length

      // Calculate total revenue from course prices
      const totalRevenue = courses.reduce((sum: number, course: { price: number }) => sum + (Number(course.price) || 0), 0)

      const analyticsData = {
        totalUsers: users.length,
        totalCourses: courses.length,
        totalQuizzes: quizzes.length,
        courseEnrollments: enrollments.length,
        totalRevenue,
        newUsersThisMonth
      }

      // Cache the results for 5 minutes
      adminCache.set('admin:analytics', analyticsData, 5 * 60 * 1000)
      setAnalytics(analyticsData)
      
      logger.performance('analytics-fetch', performance.now() - startTime)
      logger.info('Analytics data updated', { 
        totalUsers: analyticsData.totalUsers,
        totalCourses: analyticsData.totalCourses 
      })

    } catch (err) {
      const appError = handleError(err, { component: 'AdminAnalytics', action: 'fetchAnalytics' })
      setError(appError.message)
      logger.error('Failed to fetch analytics', { error: err })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [handleError, debouncedTimeRange])

  // Refresh handler with loading state
  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    await fetchAnalytics(true) // Force refresh
  }, [fetchAnalytics])

  // Effect to fetch data on mount and time range changes
  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  // Loading skeleton component
  if (loading && !refreshing) {
    return (
      <div className="container-mobile py-4 sm:py-8">
        <div className="animate-pulse">
          {/* Header skeleton */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <div>
              <div className="h-8 bg-muted/60 rounded w-48 mb-2" />
              <div className="h-4 bg-muted/60 rounded w-64" />
            </div>
            <div className="h-10 bg-muted/60 rounded w-32" />
          </div>
          
          {/* Cards skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <div className="h-4 bg-muted/60 rounded w-24 mb-4" />
                <div className="h-8 bg-muted/60 rounded w-16 mb-2" />
                <div className="h-3 bg-muted/60 rounded w-32" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg border border-gray-200 max-w-md mx-auto">
          <p className="text-primary mb-4 font-bold">{error}</p>
          <button 
            onClick={handleRefresh}
            className="text-primary hover:text-primary/80 underline font-bold bg-primary/5 hover:bg-destructive/20 px-4 py-2 rounded-lg transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container-mobile py-4 sm:py-8 space-y-6 sm:space-y-8">
      {/* Header Section - Mobile First */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor platform performance and growth</p>
        </div>
        
        {/* Action Controls - Responsive Stack */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
          {/* Time Range Selector */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500 sm:hidden" />
            <select 
              className="touch-target flex-1 sm:flex-none px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              disabled={loading}
            >
              {['7 days', '30 days', '3 months', '6 months', '1 year'].map((range) => (
                <option key={range} value={range}>{range}</option>
              ))}
            </select>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <button 
              onClick={handleRefresh}
              className="touch-target bg-primary text-black px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors font-medium shadow-sm text-sm min-w-[120px]"
              disabled={loading || refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            
            <button 
              className="touch-target bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors font-medium shadow-sm text-sm"
              onClick={() => logger.info('Export analytics clicked')}
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-primary/5 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Failed to load analytics</span>
          </div>
          <p className="text-primary text-sm mt-1">{error}</p>
          <button 
            onClick={handleRefresh}
            className="mt-3 text-red-700 underline text-sm font-medium"
          >
            Try again
          </button>
        </div>
      )}

      {/* Key Metrics - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <MetricCard
          title="Total Users"
          value={analytics.totalUsers.toLocaleString()}
          description="Registered users"
          icon={<Users className="h-4 w-4 text-secondary" />}
          trend={formattedAnalytics.growthRate}
          loading={loading}
        />
        
        <MetricCard
          title="Published Courses"
          value={analytics.totalCourses.toLocaleString()}
          description="Available courses"
          icon={<BookOpen className="h-4 w-4 text-green-600" />}
          loading={loading}
        />
        
        <MetricCard
          title="Interactive Quizzes"
          value={analytics.totalQuizzes.toLocaleString()}
          description="Assessment tools"
          icon={<Brain className="h-4 w-4 text-purple-600" />}
          loading={loading}
        />
        
        <MetricCard
          title="Total Enrollments"
          value={analytics.courseEnrollments.toLocaleString()}
          description="Student enrollments"
          icon={<TrendingUp className="h-4 w-4 text-orange-600" />}
          loading={loading}
        />
      </div>

      {/* Revenue and Performance - Responsive Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="transition-all duration-200 hover:shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Revenue Overview
            </CardTitle>
            <CardDescription>Total potential revenue from published courses</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse">
                <div className="h-10 bg-muted/60 rounded mb-2" />
                <div className="h-4 bg-muted/60 rounded w-48" />
              </div>
            ) : (
              <>
                <div className="text-3xl font-bold mb-2 text-green-600">
                  {formattedAnalytics.totalRevenue}
                </div>
                <p className="text-sm text-gray-500">
                  From {analytics.totalCourses} published courses
                </p>
                <div className="mt-4 text-sm text-gray-600">
                  Average per course: {analytics.totalCourses > 0 
                    ? `$${Math.round(analytics.totalRevenue / analytics.totalCourses).toLocaleString()}`
                    : '$0'
                  }
                </div>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card className="transition-all duration-200 hover:shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-secondary" />
              Platform Growth
            </CardTitle>
            <CardDescription>Engagement and growth metrics</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-4 bg-muted/60 rounded w-32" />
                    <div className="h-4 bg-muted/60 rounded w-16" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">New users this month</span>
                  <span className="font-semibold text-secondary">+{analytics.newUsersThisMonth}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Avg. enrollments per course</span>
                  <span className="font-semibold">{formattedAnalytics.avgEnrollments}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">User engagement rate</span>
                  <span className="font-semibold text-green-600">
                    {analytics.totalUsers > 0 
                      ? `${Math.round((analytics.courseEnrollments / analytics.totalUsers) * 100)}%`
                      : '0%'
                    }
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Chart Placeholders - Responsive */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <Card className="transition-all duration-200 hover:shadow-md">
          <CardHeader>
            <CardTitle>User Growth Trends</CardTitle>
            <CardDescription>User registrations and activity over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 sm:h-80 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Chart visualization coming soon</p>
                <p className="text-gray-400 text-sm mt-1">Interactive charts will be added in a future update</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="transition-all duration-200 hover:shadow-md">
          <CardHeader>
            <CardTitle>Course Performance</CardTitle>
            <CardDescription>Enrollment trends and course popularity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 sm:h-80 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Performance metrics coming soon</p>
                <p className="text-gray-400 text-sm mt-1">Detailed course analytics will be available soon</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
