'use client'

import { logger } from '@/lib/logger'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getUserProgress, getUserCourses, getUserQuizAttempts } from '@/lib/database'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  BookOpen, 
  CheckCircle, 
  Target, 
  Star, 
  TrendingUp,
  Clock,
  Award,
  ArrowRight,
  AlertCircle,
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
          getUserQuizAttempts(user.id, 10)
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Loading Dashboard</h2>
          <p className="text-muted-foreground">Please wait while we load your data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button 
              onClick={() => window.location.reload()}
              className="bg-primary hover:bg-secondary text-black hover:text-white"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-lg text-muted-foreground">
            Welcome back, {user?.name || user?.email}
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: 'Total Courses',
              value: progress?.courses_enrolled || '0',
              description: 'Enrolled courses',
              icon: BookOpen,
              color: 'text-primary'
            },
            {
              title: 'Completed',
              value: progress?.courses_completed || '0', 
              description: 'Courses finished',
              icon: CheckCircle,
              color: 'text-success'
            },
            {
              title: 'Quiz Attempts',
              value: progress?.quizzes_taken || '0',
              description: 'Total attempts',
              icon: Target,
              color: 'text-secondary'
            },
            {
              title: 'Average Score',
              value: progress?.average_score ? `${Math.round(progress.average_score)}%` : '0%',
              description: 'Quiz performance',
              icon: Star,
              color: 'text-warning'
            }
          ].map((stat, index) => (
            <Card key={index} variant="elevated">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  <div className="text-3xl font-bold text-foreground">
                    {stat.value}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-foreground mt-4">{stat.title}</h3>
                <p className="text-sm text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Current Courses */}
          <Card variant="base">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Current Courses
              </CardTitle>
              <CardDescription>Your enrolled courses and progress</CardDescription>
            </CardHeader>
            <CardContent>
              {courses.length > 0 ? (
                <div className="space-y-4">
                  {courses.slice(0, 5).map((course) => (
                    <Card key={course.id} variant="interactive" className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 mr-4">
                          <h4 className="font-semibold text-foreground mb-2">{course.title}</h4>
                          <div className="flex items-center gap-2 mb-2">
                            <Progress value={course.progress_percentage} className="flex-1" />
                            <span className="text-sm font-medium text-muted-foreground">
                              {course.progress_percentage}%
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Last accessed: {new Date(course.last_accessed).toLocaleDateString()}
                          </p>
                        </div>
                        <Link href={`/courses/${course.id}/study`}>
                          <Button 
                            size="sm"
                            className="bg-primary hover:bg-secondary text-black hover:text-white"
                          >
                            Continue
                            <ArrowRight className="h-4 w-4 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  ))}
                  {courses.length > 5 && (
                    <div className="text-center pt-4">
                      <Link href="/courses">
                        <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-black">
                          View All Courses
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No courses yet</h3>
                  <p className="text-muted-foreground mb-4">Start your learning journey by enrolling in a course</p>
                  <Link href="/courses">
                    <Button className="bg-primary hover:bg-secondary text-black hover:text-white">
                      Browse Courses
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Quiz Results */}
          <Card variant="base">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-secondary" />
                Recent Quiz Results
              </CardTitle>
              <CardDescription>Your latest quiz performances</CardDescription>
            </CardHeader>
            <CardContent>
              {quizAttempts.length > 0 ? (
                <div className="space-y-4">
                  {quizAttempts.slice(0, 5).map((attempt) => {
                    const scoreColor = attempt.score >= 80 ? 'text-success' : 
                                     attempt.score >= 60 ? 'text-warning' : 'text-destructive'
                    
                    return (
                      <Card key={attempt.id} variant="interactive" className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-foreground">{attempt.quiz_title}</h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>{new Date(attempt.completed_at).toLocaleDateString()}</span>
                              <span>•</span>
                              <span>{attempt.time_taken_minutes} min</span>
                            </div>
                          </div>
                          <div className={`text-2xl font-bold ${scoreColor}`}>
                            {attempt.score}%
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                  {quizAttempts.length > 5 && (
                    <div className="text-center pt-4">
                      <Link href="/dashboard/results">
                        <Button variant="outline" className="border-secondary text-secondary hover:bg-secondary hover:text-white">
                          View All Results
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No quizzes taken yet</h3>
                  <p className="text-muted-foreground mb-4">Test your knowledge with our interactive quizzes</p>
                  <Link href="/quizzes">
                    <Button className="bg-primary hover:bg-secondary text-black hover:text-white">
                      Take a Quiz
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card variant="base">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common learning activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/courses">
                <Card variant="interactive" className="p-6 text-center hover:border-primary">
                  <BookOpen className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground mb-1">Browse Courses</h3>
                  <p className="text-sm text-muted-foreground">Discover new learning opportunities</p>
                </Card>
              </Link>
              
              <Link href="/quizzes">
                <Card variant="interactive" className="p-6 text-center hover:border-secondary">
                  <Target className="h-8 w-8 text-secondary mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground mb-1">Take a Quiz</h3>
                  <p className="text-sm text-muted-foreground">Test your knowledge and skills</p>
                </Card>
              </Link>
              
              <Link href="/profile">
                <Card variant="interactive" className="p-6 text-center hover:border-warning">
                  <Award className="h-8 w-8 text-warning mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground mb-1">Update Profile</h3>
                  <p className="text-sm text-muted-foreground">Manage your account settings</p>
                </Card>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
