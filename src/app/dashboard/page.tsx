'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { getUserProgress, getUserCourses, getUserQuizAttempts } from '@/lib/database'
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

interface DashboardStats {
  totalCourses: number
  completedCourses: number
  totalQuizzes: number
  averageScore: number
  studyHours: number
  currentStreak: number
}

interface RecentCourse {
  id: string
  title: string
  progress: number
  lastAccessed: string
  duration: string
  category: string
}

interface RecentQuiz {
  id: string
  title: string
  score: number
  totalQuestions: number
  completedAt: string
  percentage: number
}

export default function StudentDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalCourses: 0,
    completedCourses: 0,
    totalQuizzes: 0,
    averageScore: 0,
    studyHours: 0,
    currentStreak: 0
  })
  const [recentCourses, setRecentCourses] = useState<RecentCourse[]>([])
  const [recentQuizzes, setRecentQuizzes] = useState<RecentQuiz[]>([])

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchDashboardData = async () => {
    if (!user?.id) return
    
    try {
      setLoading(true)
      
      console.log('Fetching dashboard data for user:', user.id)
      
      // Fetch real data from database
      const [progressResult, coursesResult, quizAttemptsResult] = await Promise.all([
        getUserProgress(user.id),
        getUserCourses(user.id),
        getUserQuizAttempts(user.id, 5) // Get last 5 quiz attempts
      ])

      console.log('Progress result:', progressResult)
      console.log('Courses result:', coursesResult)
      console.log('Quiz attempts result:', quizAttemptsResult)

      if (progressResult.error) {
        console.error('Error fetching progress:', {
          error: progressResult.error,
          message: progressResult.error?.message,
          code: progressResult.error?.code,
          type: typeof progressResult.error
        })
      } else {
        console.log('Setting stats:', progressResult.data)
        setStats({
          totalCourses: progressResult.data.courses_enrolled,
          completedCourses: progressResult.data.courses_completed,
          totalQuizzes: progressResult.data.quizzes_taken,
          averageScore: progressResult.data.average_score,
          studyHours: 0, // This would need additional tracking
          currentStreak: 0 // This would need additional tracking
        })
      }

      if (coursesResult.error) {
        console.error('Error fetching courses:', coursesResult.error)
      } else {
        // Transform the data to match our interface
        const transformedCourses = coursesResult.data?.map((course: any) => ({
          id: course.id,
          title: course.title,
          progress: course.progress_percentage,
          lastAccessed: new Date(course.last_accessed).toLocaleDateString(),
          duration: '4 weeks', // This would come from course data
          category: 'General' // This would come from course data
        })) || []
        setRecentCourses(transformedCourses)
      }

      if (quizAttemptsResult.error) {
        console.error('Error fetching quiz attempts:', quizAttemptsResult.error)
      } else {
        // Transform the data to match our interface - now using real database values with proper percentage bounds
        const transformedQuizzes = quizAttemptsResult.data?.map((attempt: any) => {
          // Calculate percentage with proper bounds (0-100)
          let calculatedPercentage = attempt.percentage || 0
          
          // If percentage is greater than 100, recalculate it properly
          if (calculatedPercentage > 100) {
            calculatedPercentage = attempt.total_questions > 0 
              ? Math.round((attempt.score / attempt.total_questions) * 100)
              : 0
          }
          
          // Ensure percentage is between 0 and 100
          calculatedPercentage = Math.min(Math.max(calculatedPercentage, 0), 100)
          
          return {
            id: attempt.id,
            title: attempt.quiz_title,
            score: attempt.score || 0,
            totalQuestions: attempt.total_questions || 0,
            completedAt: new Date(attempt.completed_at).toLocaleDateString(),
            percentage: calculatedPercentage
          }
        }) || []
        setRecentQuizzes(transformedQuizzes)
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

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
          <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
          <div className="w-10"></div>
        </div>

        <div className="p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.name || 'Student'}!
            </h1>
            <p className="text-gray-600">Continue your learning journey and track your progress</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card variant="base">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Courses</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalCourses}</p>
                  </div>
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card variant="base">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.completedCourses}</p>
                  </div>
                  <Trophy className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card variant="base">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Quiz Average</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.averageScore}%</p>
                  </div>
                  <Target className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card variant="base">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Current Streak</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.currentStreak} days</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Current Courses */}
            <Card variant="base">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Current Courses
                </CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/my-courses">View All</Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentCourses.length > 0 ? (
                    recentCourses.map((course) => (
                      <div key={course.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{course.title}</h4>
                          <span className="text-sm text-gray-500">{course.lastAccessed}</span>
                        </div>
                        <div className="flex items-center gap-3 mb-2">
                          <Progress value={course.progress} className="flex-1" />
                          <span className="text-sm font-medium text-gray-600 min-w-[3rem]">
                            {course.progress}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>{course.category}</span>
                          <span>{course.duration}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-600">No courses enrolled yet</p>
                      <Button variant="default" size="sm" className="mt-3" asChild>
                        <Link href="/dashboard/my-courses">Browse Courses</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Quiz Results */}
            <Card variant="base">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Recent Quiz Results
                </CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/my-quizzes">View All</Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentQuizzes.length > 0 ? (
                    recentQuizzes.map((quiz) => (
                      <div key={quiz.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{quiz.title}</h4>
                          <span className={`text-sm font-semibold ${getScoreColor(quiz.percentage)}`}>
                            {quiz.percentage}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>{quiz.score}/{quiz.totalQuestions} correct</span>
                          <span>{quiz.completedAt}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Brain className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-600">No quiz attempts yet</p>
                      <Button variant="default" size="sm" className="mt-3" asChild>
                        <Link href="/dashboard/my-quizzes">Explore Quizzes</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Explore More</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" size="lg" className="h-auto p-6" asChild>
                <Link href="/courses" className="flex flex-col items-center gap-2">
                  <BookOpen className="h-8 w-8" />
                  <span>Browse All Courses</span>
                </Link>
              </Button>
              
              <Button variant="outline" size="lg" className="h-auto p-6" asChild>
                <Link href="/quizzes" className="flex flex-col items-center gap-2">
                  <Brain className="h-8 w-8" />
                  <span>Explore All Quizzes</span>
                </Link>
              </Button>
              
              <Button variant="outline" size="lg" className="h-auto p-6" asChild>
                <Link href="/progress" className="flex flex-col items-center gap-2">
                  <TrendingUp className="h-8 w-8" />
                  <span>View Detailed Progress</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
