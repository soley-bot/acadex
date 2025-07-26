'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getUserProgress, getUserCourses, getUserQuizAttempts } from '@/lib/database'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  BookOpen, 
  CheckCircle, 
  Brain, 
  TrendingUp, 
  AlertCircle,
  Play,
  User,
  ExternalLink,
  Loader2
} from 'lucide-react'

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
        router.push('/login')
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        console.log('Loading dashboard data for user:', user.id)
        
        const [progressData, coursesData, attemptsData] = await Promise.all([
          getUserProgress(user.id),
          getUserCourses(user.id),
          getUserQuizAttempts(user.id, 10) // Get last 10 attempts
        ])

        console.log('Dashboard data loaded:', { progressData, coursesData, attemptsData })

        setProgress(progressData.data)
        setCourses(coursesData.data || [])
        setQuizAttempts(attemptsData.data || [])
      } catch (err) {
        console.error('Error loading dashboard data:', err)
        setError('Failed to load dashboard data. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [user, router])

  if (loading) {
    return (
      <div className="pt-24 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Loading your learning progress...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Loading...</CardTitle>
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">--</div>
                <p className="text-xs text-gray-600">Please wait...</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="pt-24 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">There was an error loading your dashboard</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-black transition-colors"
              >
                Try Again
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="pt-24 p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.user_metadata?.full_name || user?.email}</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          {
            title: 'Total Courses',
            value: progress?.courses_enrolled || '0',
            icon: <BookOpen className="w-6 h-6 text-blue-600" />,
            description: 'Enrolled courses'
          },
          {
            title: 'Completed',
            value: progress?.courses_completed || '0',
            icon: <CheckCircle className="w-6 h-6 text-green-600" />,
            description: 'Courses finished'
          },
          {
            title: 'Quiz Attempts',
            value: progress?.quizzes_taken || '0',
            icon: <Brain className="w-6 h-6 text-purple-600" />,
            description: 'Total quiz attempts'
          },
          {
            title: 'Avg Score',
            value: progress?.average_score ? `${Math.round(progress.average_score)}%` : '0%',
            icon: <TrendingUp className="w-6 h-6 text-orange-600" />,
            description: 'Quiz performance'
          }
        ].map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-gray-50 rounded-lg">
                  {stat.icon}
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm font-medium text-gray-900">{stat.title}</div>
              <div className="text-sm text-gray-600">{stat.description}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Courses */}
        <Card>
          <CardHeader>
            <CardTitle>Current Courses</CardTitle>
            <CardDescription>Your enrolled courses and progress</CardDescription>
          </CardHeader>
          <CardContent>
            {courses.length > 0 ? (
              <div className="space-y-4">
                {courses.slice(0, 5).map((course) => (
                  <div key={course.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{course.title}</p>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className="bg-gray-900 h-2 rounded-full" 
                              style={{ width: `${course.progress_percentage}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {course.progress_percentage}% complete
                          </p>
                        </div>
                      </div>
                    </div>
                    <Link
                      href={`/courses/${course.id}/study`}
                      className="ml-4 bg-gray-900 text-white px-3 py-1 rounded text-xs hover:bg-black transition-colors"
                    >
                      Continue
                    </Link>
                  </div>
                ))}
                {courses.length > 5 && (
                  <Link
                    href="/courses"
                    className="block text-center text-blue-600 hover:text-blue-700 text-sm font-medium pt-2"
                  >
                    View all courses →
                  </Link>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No courses yet</h3>
                <p className="text-gray-600 mb-4">Start your learning journey by enrolling in a course</p>
                <Link
                  href="/courses"
                  className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-black transition-colors"
                >
                  Browse Courses
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Quiz Results */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Quiz Results</CardTitle>
            <CardDescription>Your latest quiz performances</CardDescription>
          </CardHeader>
          <CardContent>
            {quizAttempts.length > 0 ? (
              <div className="space-y-4">
                {quizAttempts.slice(0, 5).map((attempt) => (
                  <div key={attempt.id} className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-3 ${
                      attempt.score >= 80 ? 'bg-green-500' : 
                      attempt.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{attempt.quiz_title}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(attempt.completed_at).toLocaleDateString()} • {attempt.time_taken_minutes} min
                      </p>
                    </div>
                    <div className={`text-sm font-bold ${
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
                    className="block text-center text-gray-900 hover:text-black text-sm font-medium pt-2"
                  >
                    View all results →
                  </Link>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No quizzes taken yet</h3>
                <p className="text-gray-600 mb-4">Test your knowledge with our interactive quizzes</p>
                <Link
                  href="/quizzes"
                  className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-black transition-colors"
                >
                  Take a Quiz
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common learning activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/courses"
                className="flex items-center p-4 rounded-lg border hover:bg-gray-50 transition-colors group"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-blue-200 transition-colors">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium">Browse Courses</div>
                  <div className="text-sm text-gray-500">Discover new learning opportunities</div>
                </div>
              </Link>
              
              <Link
                href="/quizzes"
                className="flex items-center p-4 rounded-lg border hover:bg-gray-50 transition-colors group"
              >
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-purple-200 transition-colors">
                  <Brain className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="font-medium">Take a Quiz</div>
                  <div className="text-sm text-gray-500">Test your knowledge and skills</div>
                </div>
              </Link>
              
              <Link
                href="/profile"
                className="flex items-center p-4 rounded-lg border hover:bg-gray-50 transition-colors group"
              >
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-green-200 transition-colors">
                  <User className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="font-medium">Update Profile</div>
                  <div className="text-sm text-gray-500">Manage your account settings</div>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
