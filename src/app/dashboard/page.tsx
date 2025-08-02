'use client'

import { logger } from '@/lib/logger'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getUserProgress, getUserCourses, getUserQuizAttempts } from '@/lib/database'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Typography } from '@/components/ui/Typography'
import { Container, Section, Grid } from '@/components/ui/Layout'
import Icon from '@/components/ui/Icon'

interface UserProgress {
  courses_enrolled: number
  courses_completed: number
  quizzes_taken: number
  average_score: number
}

interface UserCourse {
  id: string
  title: string
  progress_percentage: number
  last_accessed: string
}

interface QuizAttempt {
  id: string
  quiz_title: string
  score: number
  completed_at: string
  time_taken_minutes: number
}

export default function Dashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<UserProgress | null>(null)
  const [courses, setCourses] = useState<UserCourse[]>([])
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([])

  useEffect(() => {
    async function loadDashboardData() {
      if (!user) {
        router.push('/auth/login')
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        logger.debug('Loading dashboard data for user:', user.id)
        
        const [progressData, coursesData, attemptsData] = await Promise.all([
          getUserProgress(user.id),
          getUserCourses(user.id),
          getUserQuizAttempts(user.id, 10) // Get last 10 attempts
        ])

        logger.debug('Dashboard data loaded:', { progressData, coursesData, attemptsData })

        setProgress(progressData.data)
        setCourses(coursesData.data || [])
        setQuizAttempts(attemptsData.data || [])
      } catch (err) {
        logger.error('Error loading dashboard data:', err)
        setError('Failed to load dashboard data. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [user, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
        
        <Container className="pt-28 pb-12">
          <div className="mb-12 text-center">
            <Typography variant="display-lg" color="gradient" as="h1" className="mb-4">Dashboard</Typography>
            <Typography variant="lead">Loading your learning progress...</Typography>
          </div>
          <Grid cols={4} className="mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-6 sm:p-8 rounded-3xl backdrop-blur-lg bg-white/80 border border-white/20 shadow-2xl">
                <div className="text-3xl font-bold text-gray-400">--</div>
                <Typography variant="body-sm" color="muted" className="mt-2">Loading...</Typography>
                <Typography variant="caption">Please wait...</Typography>
              </div>
            ))}
          </Grid>
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-200 border-t-red-600 mx-auto"></div>
          </div>
        </Container>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
        
        <Container size="sm" className="pt-32">
          <div className="p-8 sm:p-12 rounded-3xl backdrop-blur-lg bg-white/80 border border-white/20 shadow-2xl text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-red-500 to-pink-500 rounded-full mb-6 shadow-lg">
              <span className="text-white text-3xl font-bold">!</span>
            </div>
            <Typography variant="h1" color="gradient" className="mb-6">Something went wrong</Typography>
            <Typography variant="lead" className="mb-12">{error}</Typography>
            <button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold text-base sm:text-lg transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105"
            >
              Try Again
            </button>
          </div>
        </Container>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>
      
      <Container className="pt-28 pb-12">
        {/* Header */}
        <div className="mb-12 text-center p-8 sm:p-12 rounded-3xl backdrop-blur-lg bg-white/80 border border-white/20 shadow-2xl">
          <div className="inline-block p-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl mb-6">
            <Icon name="chart" size={32} color="white" />
          </div>
          <Typography variant="display-lg" color="gradient" as="h1" className="mb-4">Dashboard</Typography>
          <Typography variant="lead">Welcome back, {(user as any)?.user_metadata?.full_name || user?.email}</Typography>
        </div>

        {/* Stats Overview */}
        <Grid cols={4} className="mb-12">
          {[
            {
              title: 'Total Courses',
              value: progress?.courses_enrolled || '0',
              description: 'Enrolled courses',
              gradient: 'from-red-500 to-pink-500',
              icon: 'book'
            },
            {
              title: 'Completed',
              value: progress?.courses_completed || '0',
              description: 'Courses finished',
              gradient: 'from-green-500 to-emerald-500',
              icon: 'check'
            },
            {
              title: 'Quiz Attempts',
              value: progress?.quizzes_taken || '0',
              description: 'Total quiz attempts',
              gradient: 'from-blue-500 to-indigo-500',
              icon: 'target'
            },
            {
              title: 'Avg Score',
              value: progress?.average_score ? `${Math.round(progress.average_score)}%` : '0%',
              description: 'Quiz performance',
              gradient: 'from-purple-500 to-violet-500',
              icon: 'star'
            }
          ].map((stat, index) => (
            <div key={index} className="p-8 rounded-3xl backdrop-blur-lg bg-white/80 border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between mb-6">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${stat.gradient} flex items-center justify-center shadow-lg`}>
                  <Icon name={stat.icon as any} size={24} color="white" />
                </div>
                <div className={`text-4xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                  {stat.value}
                </div>
              </div>
              <Typography variant="h5" color="primary">{stat.title}</Typography>
              <Typography variant="body-sm" color="muted">{stat.description}</Typography>
            </div>
          ))}
        </Grid>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Current Courses */}
          <div className="rounded-3xl backdrop-blur-lg bg-white/80 border border-white/20 shadow-2xl overflow-hidden">
            <div className="p-8 bg-gradient-to-r from-red-600 to-orange-600">
              <Typography variant="h2" color="white" className="flex items-center gap-3">
                <Icon name="book" size={24} color="white" />
                Current Courses
              </Typography>
              <Typography variant="body-md" className="text-red-100 mt-2">Your enrolled courses and progress</Typography>
            </div>
            <div className="p-8">
              {courses.length > 0 ? (
                <div className="space-y-6">
                  {courses.slice(0, 5).map((course) => (
                    <div key={course.id} className="p-6 rounded-2xl backdrop-blur-sm bg-gradient-to-r from-white/60 to-gray-50/60 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-102">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-4">
                            <div className="w-4 h-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-full mr-4 shadow-sm"></div>
                            <p className="text-lg font-bold text-gray-800">{course.title}</p>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 mb-3 overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-red-500 to-orange-500 h-3 rounded-full transition-all duration-500 shadow-sm" 
                              style={{ width: `${course.progress_percentage}%` }}
                            />
                          </div>
                          <p className="text-sm text-gray-600 font-medium">
                            {course.progress_percentage}% complete
                          </p>
                        </div>
                        <Link
                          href={`/courses/${course.id}/study`}
                          className="ml-6 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          Continue
                        </Link>
                      </div>
                    </div>
                  ))}
                  {courses.length > 5 && (
                    <Link
                      href="/courses"
                      className="block text-center text-red-600 hover:text-orange-600 text-base font-bold pt-4 transition-colors"
                    >
                      View all courses →
                    </Link>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full mb-6 shadow-lg">
                    <Icon name="book" size={32} color="muted" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">No courses yet</h3>
                  <p className="text-gray-600 mb-8 text-lg leading-relaxed">Start your learning journey by enrolling in a course</p>
                  <Link
                    href="/courses"
                    className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105 inline-block"
                  >
                    Browse Courses
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent Quiz Results */}
          <div className="rounded-3xl backdrop-blur-lg bg-white/80 border border-white/20 shadow-2xl overflow-hidden">
            <div className="p-8 bg-gradient-to-r from-red-600 to-orange-600">
              <Typography variant="h2" color="white" className="flex items-center gap-3">
                <Icon name="target" size={24} color="white" />
                Recent Quiz Results
              </Typography>
              <Typography variant="body-md" className="text-red-100 mt-2">Your latest quiz performances</Typography>
            </div>
            <div className="p-8">
              {quizAttempts.length > 0 ? (
                <div className="space-y-6">
                  {quizAttempts.slice(0, 5).map((attempt) => (
                    <div key={attempt.id} className="p-6 rounded-2xl backdrop-blur-sm bg-gradient-to-r from-white/60 to-gray-50/60 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-102">
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded-full mr-4 shadow-sm ${
                          attempt.score >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 
                          attempt.score >= 60 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-gradient-to-r from-red-500 to-pink-500'
                        }`}></div>
                        <div className="flex-1">
                          <p className="text-lg font-bold text-gray-800">{attempt.quiz_title}</p>
                          <p className="text-sm text-gray-600 font-medium">
                            {new Date(attempt.completed_at).toLocaleDateString()} • {attempt.time_taken_minutes} min
                          </p>
                        </div>
                        <div className={`text-2xl font-bold ${
                          attempt.score >= 80 ? 'bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent' : 
                          attempt.score >= 60 ? 'bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent' : 'bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent'
                        }`}>
                          {attempt.score}%
                        </div>
                      </div>
                    </div>
                  ))}
                  {quizAttempts.length > 5 && (
                    <Link
                      href="/dashboard/results"
                      className="block text-center text-red-600 hover:text-orange-600 text-base font-bold pt-4 transition-colors"
                    >
                      View all results →
                    </Link>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full mb-6 shadow-lg">
                    <Icon name="target" size={32} color="muted" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">No quizzes taken yet</h3>
                  <p className="text-gray-600 mb-8 text-lg leading-relaxed">Test your knowledge with our interactive quizzes</p>
                  <Link
                    href="/quizzes"
                    className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105 inline-block"
                  >
                    Take a Quiz
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-12">
          <div className="rounded-3xl backdrop-blur-lg bg-white/80 border border-white/20 shadow-2xl overflow-hidden">
            <div className="p-8 bg-gradient-to-r from-red-600 to-orange-600">
              <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                <Icon name="lightning" size={24} color="white" />
                Quick Actions
              </h2>
              <p className="text-red-100 mt-2 text-lg">Common learning activities</p>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link
                  href="/courses"
                  className="flex items-center p-8 rounded-2xl backdrop-blur-sm bg-gradient-to-r from-white/60 to-gray-50/60 border-2 border-white/30 hover:border-red-300 hover:bg-gradient-to-r hover:from-red-50/80 hover:to-orange-50/80 transition-all duration-300 group shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl flex items-center justify-center mr-6 group-hover:from-red-700 group-hover:to-orange-700 transition-all duration-300 shadow-lg">
                    <Icon name="book" size={24} color="white" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-800 text-xl mb-1">Browse Courses</div>
                    <div className="text-sm text-gray-600 font-medium">Discover new learning opportunities</div>
                  </div>
                </Link>
                
                <Link
                  href="/quizzes"
                  className="flex items-center p-8 rounded-2xl backdrop-blur-sm bg-gradient-to-r from-white/60 to-gray-50/60 border-2 border-white/30 hover:border-red-300 hover:bg-gradient-to-r hover:from-red-50/80 hover:to-orange-50/80 transition-all duration-300 group shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl flex items-center justify-center mr-6 group-hover:from-red-700 group-hover:to-orange-700 transition-all duration-300 shadow-lg">
                    <Icon name="target" size={24} color="white" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-800 text-xl mb-1">Take a Quiz</div>
                    <div className="text-sm text-gray-600 font-medium">Test your knowledge and skills</div>
                  </div>
                </Link>
                
                <Link
                  href="/profile"
                  className="flex items-center p-8 rounded-2xl backdrop-blur-sm bg-gradient-to-r from-white/60 to-gray-50/60 border-2 border-white/30 hover:border-red-300 hover:bg-gradient-to-r hover:from-red-50/80 hover:to-orange-50/80 transition-all duration-300 group shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl flex items-center justify-center mr-6 group-hover:from-red-700 group-hover:to-orange-700 transition-all duration-300 shadow-lg">
                    <Icon name="user" size={24} color="white" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-800 text-xl mb-1">Update Profile</div>
                    <div className="text-sm text-gray-600 font-medium">Manage your account settings</div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}
