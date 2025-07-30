'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import SvgIcon from '@/components/ui/SvgIcon'

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

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch all stats in parallel
      const [usersResult, coursesResult, quizzesResult, attemptsResult] = await Promise.all([
        supabase.from('users').select('id'),
        supabase.from('courses').select('id, price, is_published'),
        supabase.from('quizzes').select('id'),
        supabase.from('quiz_attempts').select('id')
      ])

      const users = usersResult.data || []
      const courses = coursesResult.data || []
      const quizzes = quizzesResult.data || []
      const attempts = attemptsResult.data || []

      // Calculate revenue from courses
      const totalRevenue = courses.reduce((sum, course) => sum + (Number(course.price) || 0), 0)
      const publishedCourses = courses.filter(course => course.is_published).length

      setStats({
        totalUsers: users.length,
        totalCourses: courses.length,
        totalQuizzes: quizzes.length,
        totalAttempts: attempts.length,
        totalRevenue,
        publishedCourses
      })

    } catch (err) {
      console.error('Error fetching dashboard stats:', err)
      setError('Failed to load dashboard statistics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <div className="text-center py-12 bg-white rounded-lg shadow-lg mx-6">
          <p className="text-red-600 mb-2 font-bold">{error}</p>
          <button 
            onClick={fetchDashboardStats}
            className="text-red-600 hover:text-red-700 underline font-bold bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  const dashboardCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      description: 'Registered users on the platform',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      icon: 'contacts'
    },
    {
      title: 'Total Courses',
      value: stats.totalCourses.toLocaleString(),
      description: `${stats.publishedCourses} published courses`,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      icon: 'briefcase'
    },
    {
      title: 'Total Quizzes',
      value: stats.totalQuizzes.toLocaleString(),
      description: 'Available quizzes',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      icon: 'cursor'
    },
    {
      title: 'Quiz Attempts',
      value: stats.totalAttempts.toLocaleString(),
      description: 'Total quiz attempts',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      icon: 'checkmark'
    }
  ]

  return (
    <div className="min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome to the admin dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {dashboardCards.map((stat) => (
          <Card key={stat.title} className="bg-white border-gray-200 hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.description}</p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-full ml-4 flex-shrink-0`}>
                  <SvgIcon 
                    icon={stat.icon} 
                    size={24} 
                    className={`${stat.color}`}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-white border-gray-200 shadow-md">
          <CardHeader>
            <CardTitle className="text-gray-900 font-bold">Recent Activity</CardTitle>
            <CardDescription>Latest platform activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-red-600 rounded-full mr-3"></div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900">New user registered</p>
                  <p className="text-xs text-gray-500">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-red-600 rounded-full mr-3"></div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900">Course published</p>
                  <p className="text-xs text-gray-500">1 hour ago</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-red-600 rounded-full mr-3"></div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900">Quiz completed</p>
                  <p className="text-xs text-gray-500">3 hours ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200 shadow-md">
          <CardHeader>
            <CardTitle className="text-gray-900 font-bold">Quick Actions</CardTitle>
            <CardDescription>Commonly used admin functions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <button className="w-full text-left p-3 rounded-lg border-2 border-gray-800 hover:bg-gray-50 transition-colors">
                <div className="font-bold text-black">Add New User</div>
                <div className="text-sm text-gray-500">Create a new user account</div>
              </button>
              <button className="w-full text-left p-3 rounded-lg border-2 border-gray-800 hover:bg-gray-50 transition-colors">
                <div className="font-bold text-black">Create Course</div>
                <div className="text-sm text-gray-500">Add a new course to the platform</div>
              </button>
              <button className="w-full text-left p-3 rounded-lg border-2 border-gray-800 hover:bg-gray-50 transition-colors">
                <div className="font-bold text-black">Create Quiz</div>
                <div className="text-sm text-gray-500">Design a new quiz</div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
