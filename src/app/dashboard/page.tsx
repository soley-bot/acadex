'use client'

import { logger } from '@/lib/logger'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getUserProgress, getUserCourses, getUserQuizAttempts } from '@/lib/database'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Container, Section } from '@/components/ui/Layout'
import { 
  BookOpen, 
  GraduationCap, 
  Brain, 
  Medal, 
  Zap,
  Clock,
  User,
  ArrowRight,
  AlertCircle,
  Loader2,
  Target,
  TrendingUp,
  Sparkles
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

  // Memoized dashboard loading function for performance
  const loadDashboardData = useCallback(async () => {
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
  }, [user, router])

  // Memoized statistics calculations for performance
  const statsCards = useMemo(() => [
    {
      title: 'Total Courses',
      value: progress?.courses_enrolled || '0',
      subtitle: 'Enrolled',
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Completed',
      value: progress?.courses_completed || '0',
      subtitle: 'Finished',
      icon: GraduationCap,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Quiz Score',
      value: progress?.average_score ? `${Math.round(progress.average_score)}%` : '0%',
      subtitle: `${progress?.quizzes_taken || 0} attempts`,
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Progress',
      value: (progress?.courses_enrolled && progress?.courses_completed) ? 
        `${Math.round((progress.courses_completed / progress.courses_enrolled) * 100)}%` : '0%',
      subtitle: 'Overall',
      icon: TrendingUp,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    }
  ], [progress])

  // Memoized quiz score calculation for performance
  const getQuizScoreColor = useCallback((score: number) => ({
    scoreColor: score >= 80 ? 'text-success' : 
                score >= 60 ? 'text-warning' : 'text-destructive',
    scoreBg: score >= 80 ? 'bg-success/10' : 
             score >= 60 ? 'bg-warning/10' : 'bg-destructive/10'
  }), [])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Section spacing="md">
          <Container>
            {/* Header Skeleton */}
            <div className="mb-8">
              <div className="h-8 sm:h-10 lg:h-12 bg-muted animate-pulse rounded-lg mb-2 w-32 sm:w-48"></div>
              <div className="h-4 sm:h-6 bg-muted animate-pulse rounded-lg w-48 sm:w-64"></div>
            </div>
            
            {/* Stats Skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
              {[1,2,3,4].map(i => (
                <Card key={i} variant="base">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-muted animate-pulse rounded-lg flex-shrink-0"></div>
                        <div className="h-4 bg-muted animate-pulse rounded w-16"></div>
                      </div>
                      <div className="h-8 bg-muted animate-pulse rounded w-12"></div>
                      <div className="h-3 bg-muted animate-pulse rounded w-14"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Content Skeleton */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {[1,2].map(i => (
                <Card key={i} variant="base">
                  <CardHeader>
                    <div className="h-6 bg-muted animate-pulse rounded w-32 mb-2"></div>
                    <div className="h-4 bg-muted animate-pulse rounded w-48"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[1,2,3].map(j => (
                        <div key={j} className="h-20 bg-muted animate-pulse rounded"></div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Container>
        </Section>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Container>
          <Card variant="elevated" className="w-full max-w-md mx-auto">
            <CardContent className="pt-8 pb-8 text-center">
              <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Something went wrong</h2>
              <p className="text-base text-muted-foreground mb-8">{error}</p>
              <Button 
                onClick={() => window.location.reload()}
                className="bg-primary hover:bg-secondary text-white hover:text-black px-8 py-3"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        </Container>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Section spacing="md">
        <Container>
          {/* Header - Optimized Typography */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-lg text-muted-foreground">
              Welcome back, {user?.name || user?.email}
            </p>
          </div>

          {/* Standalone Stats - No Container */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsCards.map((stat, index) => (
              <div key={index} className="flex items-center gap-3">
                {/* Icon */}
                <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center flex-shrink-0`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                
                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="text-2xl font-bold text-foreground leading-none">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {stat.title}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Main Content Grid - Optimized Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
            {/* Current Courses */}
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-6 w-6 text-primary" />
                  <h2 className="text-xl font-semibold text-gray-800">Current Courses</h2>
                </div>
                <Link href="/courses">
                  <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-white">
                    View All
                  </Button>
                </Link>
              </div>
              
              {/* Course List */}
              {courses.length > 0 ? (
                <div className="space-y-3">
                  {courses.slice(0, 5).map((course) => (
                    <div key={course.id} className="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-primary/30 transition-all duration-200 bg-white shadow-sm">
                      {/* Course Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900 text-base truncate">
                            {course.title}
                          </h4>
                          <span className="text-sm font-semibold text-primary bg-primary/10 px-2 py-1 rounded-md ml-3 flex-shrink-0">
                            {course.progress_percentage}%
                          </span>
                        </div>
                        <Progress value={course.progress_percentage} className="h-2" />
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Link href={`/courses/${course.id}/study`}>
                          <Button 
                            size="sm"
                            className="bg-primary hover:bg-secondary text-white hover:text-black px-3 py-1 text-xs h-8"
                          >
                            {course.progress_percentage > 0 ? 'Continue' : 'Start'}
                          </Button>
                        </Link>
                        <Link href={`/courses/${course.id}`}>
                          <Button 
                            variant="outline"
                            size="sm"
                            className="border-primary text-primary hover:bg-primary hover:text-white px-3 py-1 text-xs h-8"
                          >
                            Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                  {courses.length > 5 && (
                    <div className="text-center pt-4">
                      <Link href="/courses">
                        <Button variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-white">
                          View All {courses.length} Courses
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 sm:py-12 bg-white rounded-lg border border-border">
                  <div className="relative">
                    <BookOpen className="h-10 w-10 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                  </div>
                  <h3 className="text-base sm:text-xl font-semibold text-foreground mb-2">Ready to Start Learning?</h3>
                  <p className="text-muted-foreground mb-4 sm:mb-6 text-xs sm:text-base px-2">
                    Join thousands of learners and start your English mastery journey today
                  </p>
                  <div className="flex flex-row gap-3 justify-center items-center">
                    <Link href="/courses">
                      <Button className="h-9 sm:h-10 bg-primary hover:bg-secondary text-white hover:text-black text-xs sm:text-base px-4">
                        Browse Courses
                        <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
                      </Button>
                    </Link>
                    <Link href="/quizzes">
                      <Button variant="outline" className="h-9 sm:h-10 border-primary text-primary hover:bg-primary hover:text-white text-xs sm:text-base px-4">
                        Try a Quiz
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>

          {/* Recent Quiz Results */}
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-secondary" />
                <h2 className="text-lg font-semibold text-gray-900">Recent Quiz Results</h2>
              </div>
              <Link href="/dashboard/results">
                <Button variant="outline" size="sm" className="border-secondary text-secondary hover:bg-secondary hover:text-black text-sm">
                  View All
                </Button>
              </Link>
            </div>
            
            {/* Quiz Results List */}
            {quizAttempts.length > 0 ? (
              <div className="space-y-3">
                {quizAttempts.slice(0, 5).map((attempt) => (
                  <div key={attempt.id} className="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-secondary/30 transition-all duration-200 bg-white shadow-sm">
                    {/* Quiz Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 text-base truncate">
                          {attempt.quiz_title}
                        </h4>
                        <span className={`text-sm font-semibold px-2 py-1 rounded-md ml-3 flex-shrink-0 ${
                          attempt.score >= 80 ? 'text-green-700 bg-green-100' : 
                          attempt.score >= 60 ? 'text-yellow-700 bg-yellow-100' : 
                          'text-red-700 bg-red-100'
                        }`}>
                          {attempt.score}%
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(attempt.completed_at).toLocaleDateString()}</span>
                        </div>
                        <span>{attempt.time_taken_minutes} min</span>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Link href="/quizzes">
                        <Button 
                          size="sm"
                          className="bg-secondary hover:bg-primary text-black hover:text-white px-3 py-1 text-xs h-8"
                        >
                          Retake
                        </Button>
                      </Link>
                      <Link href={`/dashboard/results/${attempt.id}`}>
                        <Button 
                          variant="outline"
                          size="sm"
                          className="border-secondary text-secondary hover:bg-secondary hover:text-black px-3 py-1 text-xs h-8"
                        >
                          Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
                {quizAttempts.length > 5 && (
                  <div className="text-center pt-4">
                    <Link href="/dashboard/results">
                      <Button variant="outline" className="border-2 border-secondary text-secondary hover:bg-secondary hover:text-black">
                        View All Results
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
              ) : (
                <div className="text-center py-6 sm:py-12 bg-white rounded-lg border border-border">
                  <div className="relative">
                    <Target className="h-10 w-10 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                  </div>
                  <h3 className="text-base sm:text-xl font-semibold text-foreground mb-2">Test Your Skills!</h3>
                  <p className="text-muted-foreground mb-4 sm:mb-6 text-xs sm:text-base px-2">
                    Challenge yourself with interactive quizzes and track your progress
                  </p>
                  <div className="flex flex-row gap-3 justify-center items-center">
                    <Link href="/quizzes">
                      <Button className="h-9 sm:h-10 bg-primary hover:bg-secondary text-white hover:text-black text-xs sm:text-base px-4">
                        Take Your First Quiz
                        <Brain className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
                      </Button>
                    </Link>
                    <Link href="/courses">
                      <Button variant="outline" className="h-9 sm:h-10 border-secondary text-secondary hover:bg-secondary hover:text-black text-xs sm:text-base px-4">
                        Learn First
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          </div>
          
          {/* Actions Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/courses" className="block">
              <div className="p-4 text-center rounded-lg border border-border hover:border-primary/30 transition-all duration-200 bg-white shadow-sm hover:shadow-md">
                <BookOpen className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-medium text-gray-900 text-sm mb-1">Browse Courses</h3>
                <p className="text-xs text-muted-foreground">Discover new learning opportunities</p>
              </div>
            </Link>
            
            <Link href="/quizzes" className="block">
              <div className="p-4 text-center rounded-lg border border-border hover:border-secondary/30 transition-all duration-200 bg-white shadow-sm hover:shadow-md">
                <Target className="h-8 w-8 text-secondary mx-auto mb-3" />
                <h3 className="font-medium text-gray-900 text-sm mb-1">Take a Quiz</h3>
                <p className="text-xs text-muted-foreground">Test your knowledge and skills</p>
              </div>
            </Link>
            
            <Link href="/profile" className="block col-span-2 lg:col-span-1">
              <div className="p-4 text-center rounded-lg border border-border hover:border-primary/30 transition-all duration-200 bg-white shadow-sm hover:shadow-md">
                <User className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-medium text-gray-900 text-sm mb-1">Update Profile</h3>
                <p className="text-xs text-muted-foreground">Manage your account settings</p>
              </div>
            </Link>
          </div>
        </div>
        </Container>
      </Section>
    </div>
  )
}
