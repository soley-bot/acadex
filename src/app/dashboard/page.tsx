'use client'

import { logger } from '@/lib/logger'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getUserProgress, getUserCourses, getUserQuizAttempts } from '@/lib/database'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

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
      <div className="min-h-screen bg-white pt-24">
        <div className="max-w-6xl mx-auto px-6 pb-12">
          <div className="mb-12">
            <h1 className="text-4xl font-black text-black mb-2">Dashboard</h1>
            <p className="text-gray-600 text-lg">Loading your learning progress...</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8">
                <div className="text-3xl font-black text-gray-300">--</div>
                <div className="text-sm font-bold text-gray-300 mt-2">Loading...</div>
                <div className="text-sm text-gray-300">Please wait...</div>
              </div>
            ))}
          </div>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white pt-24">
        <div className="max-w-6xl mx-auto px-6 pb-12">
          <div className="mb-12">
            <h1 className="text-4xl font-black text-black mb-2">Dashboard</h1>
            <p className="text-gray-600 text-lg">There was an error loading your dashboard</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-red-600 text-3xl font-bold">!</span>
              </div>
              <h3 className="text-2xl font-bold text-black mb-4">Something went wrong</h3>
              <p className="text-gray-600 mb-8 text-lg">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white pt-24">
      <div className="max-w-6xl mx-auto px-6 pb-12">
        <div className="mb-12">
          <h1 className="text-4xl font-black text-black mb-2">Dashboard</h1>
          <p className="text-gray-600 text-lg">Welcome back, {(user as any)?.user_metadata?.full_name || user?.email}</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            {
              title: 'Total Courses',
              value: progress?.courses_enrolled || '0',
              description: 'Enrolled courses',
              color: 'bg-red-600'
            },
            {
              title: 'Completed',
              value: progress?.courses_completed || '0',
              description: 'Courses finished',
              color: 'bg-green-600'
            },
            {
              title: 'Quiz Attempts',
              value: progress?.quizzes_taken || '0',
              description: 'Total quiz attempts',
              color: 'bg-blue-600'
            },
            {
              title: 'Avg Score',
              value: progress?.average_score ? `${Math.round(progress.average_score)}%` : '0%',
              description: 'Quiz performance',
              color: 'bg-purple-600'
            }
          ].map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-full ${stat.color} flex items-center justify-center`}>
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
                <div className="text-3xl font-black text-black">{stat.value}</div>
              </div>
              <div className="text-lg font-bold text-black">{stat.title}</div>
              <div className="text-sm text-gray-600 font-medium">{stat.description}</div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Current Courses */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg">
            <div className="p-8 border-b border-gray-200 bg-black rounded-t-2xl">
              <h2 className="text-2xl font-bold text-white">Current Courses</h2>
              <p className="text-gray-300 text-base">Your enrolled courses and progress</p>
            </div>
            <div className="p-8">
              {courses.length > 0 ? (
                <div className="space-y-6">
                  {courses.slice(0, 5).map((course) => (
                    <div key={course.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-red-600 rounded-full mr-4"></div>
                          <div className="flex-1">
                            <p className="text-base font-bold text-black">{course.title}</p>
                            <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
                              <div 
                                className="bg-red-600 h-3 rounded-full transition-all duration-500" 
                                style={{ width: `${course.progress_percentage}%` }}
                              />
                            </div>
                            <p className="text-sm text-gray-600 mt-2 font-medium">
                              {course.progress_percentage}% complete
                            </p>
                          </div>
                        </div>
                      </div>
                      <Link
                        href={`/courses/${course.id}/study`}
                        className="ml-6 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                      >
                        Continue
                      </Link>
                    </div>
                  ))}
                  {courses.length > 5 && (
                    <Link
                      href="/courses"
                      className="block text-center text-black hover:text-red-600 text-base font-bold pt-4 transition-colors"
                    >
                      View all courses →
                    </Link>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-gray-400 text-2xl">📚</span>
                  </div>
                  <h3 className="text-xl font-bold text-black mb-4">No courses yet</h3>
                  <p className="text-gray-600 mb-6 text-base">Start your learning journey by enrolling in a course</p>
                  <Link
                    href="/courses"
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold transition-colors"
                  >
                    Browse Courses
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent Quiz Results */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg">
            <div className="p-8 border-b border-gray-200 bg-black rounded-t-2xl">
              <h2 className="text-2xl font-bold text-white">Recent Quiz Results</h2>
              <p className="text-gray-300 text-base">Your latest quiz performances</p>
            </div>
            <div className="p-8">
              {quizAttempts.length > 0 ? (
                <div className="space-y-6">
                  {quizAttempts.slice(0, 5).map((attempt) => (
                    <div key={attempt.id} className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-4 ${
                        attempt.score >= 80 ? 'bg-green-500' : 
                        attempt.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-base font-bold text-black">{attempt.quiz_title}</p>
                        <p className="text-sm text-gray-600 font-medium">
                          {new Date(attempt.completed_at).toLocaleDateString()} • {attempt.time_taken_minutes} min
                        </p>
                      </div>
                      <div className={`text-lg font-black ${
                        attempt.score >= 80 ? 'text-green-600' : 
                        attempt.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {attempt.score}%
                      </div>
                    </div>
                  ))}
                  {quizAttempts.length > 5 && (
                    <Link
                      href="/dashboard/results"
                      className="block text-center text-black hover:text-red-600 text-base font-bold pt-4 transition-colors"
                    >
                      View all results →
                    </Link>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-gray-400 text-2xl">🧩</span>
                  </div>
                  <h3 className="text-xl font-bold text-black mb-4">No quizzes taken yet</h3>
                  <p className="text-gray-600 mb-6 text-base">Test your knowledge with our interactive quizzes</p>
                  <Link
                    href="/quizzes"
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold transition-colors"
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
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg">
            <div className="p-8 border-b border-gray-200 bg-black rounded-t-2xl">
              <h2 className="text-2xl font-bold text-white">Quick Actions</h2>
              <p className="text-gray-300 text-base">Common learning activities</p>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link
                  href="/courses"
                  className="flex items-center p-6 rounded-xl border-2 border-gray-200 hover:border-red-600 hover:bg-red-50 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center mr-6 group-hover:bg-red-700 transition-colors">
                    <span className="text-white text-xl">📚</span>
                  </div>
                  <div>
                    <div className="font-bold text-black text-lg">Browse Courses</div>
                    <div className="text-sm text-gray-600">Discover new learning opportunities</div>
                  </div>
                </Link>
                
                <Link
                  href="/quizzes"
                  className="flex items-center p-6 rounded-xl border-2 border-gray-200 hover:border-red-600 hover:bg-red-50 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center mr-6 group-hover:bg-red-700 transition-colors">
                    <span className="text-white text-xl">🧩</span>
                  </div>
                  <div>
                    <div className="font-bold text-black text-lg">Take a Quiz</div>
                    <div className="text-sm text-gray-600">Test your knowledge and skills</div>
                  </div>
                </Link>
                
                <Link
                  href="/profile"
                  className="flex items-center p-6 rounded-xl border-2 border-gray-200 hover:border-red-600 hover:bg-red-50 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center mr-6 group-hover:bg-red-700 transition-colors">
                    <span className="text-white text-xl">👤</span>
                  </div>
                  <div>
                    <div className="font-bold text-black text-lg">Update Profile</div>
                    <div className="text-sm text-gray-600">Manage your account settings</div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
