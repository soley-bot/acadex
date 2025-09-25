'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { H1, H2, H3, BodyLG, BodyMD } from '@/components/ui/Typography'
import { Container, Section, Grid } from '@/components/ui/Layout'
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
  const router = useRouter()
  
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

      // Use COUNT queries for much better performance
      const [usersCount, coursesData, quizzesCount, attemptsCount] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('courses').select('price, is_published'),
        supabase.from('quizzes').select('*', { count: 'exact', head: true }),
        supabase.from('quiz_attempts').select('*', { count: 'exact', head: true })
      ])

      // Handle potential errors
      if (usersCount.error) throw usersCount.error
      if (coursesData.error) throw coursesData.error
      if (quizzesCount.error) throw quizzesCount.error
      if (attemptsCount.error) throw attemptsCount.error

      // Calculate revenue and published courses from actual data
      const courses = coursesData.data || []
      const totalRevenue = courses.reduce((sum: number, course: any) => sum + (Number(course.price) || 0), 0)
      const publishedCourses = courses.filter((course: any) => course.is_published).length

      const newStats = {
        totalUsers: usersCount.count || 0,
        totalCourses: courses.length,
        totalQuizzes: quizzesCount.count || 0,
        totalAttempts: attemptsCount.count || 0,
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
      <Section className="min-h-screen relative overflow-hidden" background="accent">
        <Container className="flex items-center justify-center min-h-screen">
          <Card variant="elevated" className="text-center p-12">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary mx-auto mb-6"></div>
            <BodyLG className="text-gray-700 font-medium">Loading dashboard...</BodyLG>
            <BodyMD className="text-gray-500 mt-2">Gathering latest statistics</BodyMD>
          </Card>
        </Container>
      </Section>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-secondary/10">
        <div className="flex items-center justify-center min-h-screen">
          <div className="alert-error text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="warning" size={24} color="error" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Unable to Load Dashboard</h3>
            <p className="text-sm mb-4">{error}</p>
            <button 
              onClick={fetchDashboardStats}
              className="btn btn-default"
            >
              Try Again
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
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      title: 'Total Courses',
      value: stats.totalCourses.toLocaleString(),
      description: 'Educational content',
      icon: 'book',
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      title: 'Published Courses',
      value: stats.publishedCourses.toLocaleString(),
      description: 'Active learning paths',
      icon: 'check-circle',
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      title: 'Total Quizzes',
      value: stats.totalQuizzes.toLocaleString(),
      description: 'Assessment tools',
      icon: 'help',
      color: 'text-secondary',
      bgColor: 'bg-secondary/10'
    },
    {
      title: 'Quiz Attempts',
      value: stats.totalAttempts.toLocaleString(),
      description: 'Learning assessments',
      icon: 'edit',
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      description: 'Platform earnings',
      icon: 'dollar',
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    }
  ]

  return (
    <Section className="min-h-screen relative overflow-hidden" background="accent">
      <Container className="py-8">
        {/* Header */}
        <Card variant="elevated" className="mb-8 text-center">
          <CardContent className="p-8">
            <div className="inline-block p-4 bg-primary rounded-2xl mb-6">
              <Icon name="chart" size={32} color="current" />
            </div>
            <H1 className="text-gray-900 mb-3">Welcome back, admin</H1>
            <BodyLG className="text-gray-700">Here&apos;s what&apos;s happening on your platform</BodyLG>
          </CardContent>
        </Card>

        {/* Statistics Grid */}
        <Grid cols={4} className="mb-8">
          {dashboardCards.map((stat) => (
            <Card key={stat.title} variant="default" className="text-center p-6 hover:shadow-lg transition-all duration-300">
              <div className={`inline-block p-3 ${stat.bgColor} rounded-xl mb-4`}>
                <Icon name={stat.icon as any} size={24} className={stat.color} />
              </div>
              <div className="text-3xl font-bold text-foreground mb-2">{stat.value}</div>
              <BodyLG className="text-foreground mb-1">{stat.title}</BodyLG>
              <BodyMD className="text-muted-foreground">{stat.description}</BodyMD>
            </Card>
          ))}
        </Grid>

        {/* Additional Dashboard Content */}
        <Grid cols={2}>
          <Card variant="default" className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-bold flex items-center">
                <Icon name="activity" size={20} color="primary" className="mr-2" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest platform activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center p-3 rounded-lg bg-secondary/10">
                  <div className="w-3 h-3 bg-secondary rounded-full mr-4"></div>
                  <div className="flex-1">
                    <BodyMD className="text-foreground font-semibold">New user registered</BodyMD>
                    <BodyMD className="text-muted-foreground text-xs">2 minutes ago</BodyMD>
                  </div>
                </div>
                <div className="flex items-center p-3 rounded-lg bg-success/10">
                  <div className="w-3 h-3 bg-success rounded-full mr-4"></div>
                  <div className="flex-1">
                    <BodyMD className="text-foreground font-semibold">Course published</BodyMD>
                    <BodyMD className="text-muted-foreground text-xs">1 hour ago</BodyMD>
                  </div>
                </div>
                <div className="flex items-center p-3 rounded-lg bg-primary/10">
                  <div className="w-3 h-3 bg-primary rounded-full mr-4"></div>
                  <div className="flex-1">
                    <BodyMD className="text-foreground font-semibold">Quiz completed</BodyMD>
                    <BodyMD className="text-muted-foreground text-xs">3 hours ago</BodyMD>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

        <Card variant="elevated" size="lg" className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-bold flex items-center">
              <Icon name="lightning" size={20} color="primary" className="mr-2" />
              Quick Actions
            </CardTitle>
            <CardDescription>Commonly used admin functions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <button 
                onClick={() => router.push('/admin/users')}
                className="w-full text-left p-4 card-interactive"
              >
                <div className="flex items-center">
                  <div className="bg-secondary/10 p-2 rounded-lg mr-3 group-hover:bg-primary/20 transition-colors">
                    <Icon name="user" size={20} color="current" className="text-secondary" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">Manage Users</div>
                    <div className="text-sm text-muted-foreground">View and manage user accounts</div>
                  </div>
                </div>
              </button>
              
              <button 
                onClick={() => router.push('/admin/courses/create')}
                className="w-full text-left p-4 card-interactive"
              >
                <div className="flex items-center">
                  <div className="bg-success/10 p-2 rounded-lg mr-3 group-hover:bg-success/20 transition-colors">
                    <Icon name="add" size={20} color="current" className="text-success" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">Create Course</div>
                    <div className="text-sm text-muted-foreground">Add a new course to the platform</div>
                  </div>
                </div>
              </button>
              
              <button 
                onClick={() => router.push('/admin/quizzes')}
                className="w-full text-left p-4 card-interactive"
              >
                <div className="flex items-center">
                  <div className="bg-secondary/10 p-2 rounded-lg mr-3 group-hover:bg-secondary/20 transition-colors">
                    <Icon name="help" size={20} color="current" className="text-secondary" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">Manage Quizzes</div>
                    <div className="text-sm text-muted-foreground">Create and manage quiz assessments</div>
                  </div>
                </div>
              </button>
              
              <button 
                onClick={() => router.push('/admin/security-audit')}
                className="w-full text-left p-4 card-interactive"
              >
                <div className="flex items-center">
                  <div className="bg-red-100 p-2 rounded-lg mr-3 group-hover:bg-red-200 transition-colors">
                    <Icon name="shield" size={20} color="current" className="text-red-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">Security Audit</div>
                    <div className="text-sm text-muted-foreground">Comprehensive security assessment</div>
                  </div>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
        </Grid>
      </Container>
    </Section>
  )
}
