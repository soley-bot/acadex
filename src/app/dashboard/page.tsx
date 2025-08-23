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
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-20 lg:py-24">
          {/* Header Skeleton */}
          <div className="mb-6 md:mb-16">
            <div className="h-8 sm:h-10 bg-muted animate-pulse rounded-lg mb-1 sm:mb-2 w-32 sm:w-48"></div>
            <div className="h-4 sm:h-6 bg-muted animate-pulse rounded-lg w-48 sm:w-64"></div>
          </div>
          
          {/* Clean Stats Skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 md:mb-16">
            {[1,2,3,4].map(i => (
              <Card key={i} variant="base">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-muted animate-pulse rounded-lg"></div>
                    <div className="h-6 sm:h-8 bg-muted animate-pulse rounded w-12 sm:w-16"></div>
                  </div>
                  <div className="space-y-1">
                    <div className="h-4 bg-muted animate-pulse rounded w-20 sm:w-24"></div>
                    <div className="h-3 bg-muted animate-pulse rounded w-16 sm:w-20"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Content Skeleton */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-8">
            {[1,2].map(i => (
              <Card key={i} variant="base">
                <CardHeader>
                  <div className="h-4 sm:h-6 bg-muted animate-pulse rounded w-24 sm:w-32 mb-1 sm:mb-2"></div>
                  <div className="h-3 sm:h-4 bg-muted animate-pulse rounded w-32 sm:w-48 hidden sm:block"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 sm:space-y-4">
                    {[1,2,3].map(j => (
                      <div key={j} className="h-16 sm:h-20 bg-muted animate-pulse rounded"></div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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
              className="bg-primary hover:bg-secondary text-white hover:text-black"
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
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-20 lg:py-24">
        {/* Header - Compact Mobile Design */}
        <div className="mb-6 md:mb-16">
          <h1 className="text-2xl sm:text-4xl font-bold text-foreground mb-1 sm:mb-2">Dashboard</h1>
          <p className="text-sm sm:text-lg text-muted-foreground">
            Welcome back, {user?.name || user?.email}
          </p>
        </div>

        {/* Clean Stats Grid - Professional Mobile Layout */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 md:mb-16">
          {statsCards.map((stat, index) => (
            <Card key={index} variant="base" className="overflow-hidden">
              <CardContent className="p-4 sm:p-6">
                {/* Icon and Value Row */}
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                    <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.color}`} />
                  </div>
                  <div className="text-right">
                    <div className="text-xl sm:text-2xl font-bold text-foreground">
                      {stat.value}
                    </div>
                  </div>
                </div>
                
                {/* Title and Subtitle */}
                <div className="space-y-1">
                  <h3 className="text-sm sm:text-base font-medium text-foreground">
                    {stat.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {stat.subtitle}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Grid - Compact Mobile Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-8 mb-8 md:mb-16">
          {/* Current Courses */}
          <Card variant="base" className="h-fit">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-xl">
                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                Current Courses
              </CardTitle>
              <CardDescription className="text-xs sm:text-base hidden sm:block">Your enrolled courses and progress</CardDescription>
            </CardHeader>
            <CardContent>
              {courses.length > 0 ? (
                <div className="space-y-4 sm:space-y-6">
                  {courses.slice(0, 5).map((course) => (
                    <Card key={course.id} variant="interactive" className="p-4 sm:p-6 hover:shadow-md transition-all duration-200 border border-border hover:border-primary/30">
                      <div className="space-y-3">
                        {/* Course Title and Progress */}
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium text-foreground text-sm sm:text-base leading-tight flex-1 mr-3">
                            {course.title}
                          </h4>
                          <span className="text-sm font-semibold text-primary bg-primary/10 px-2 py-1 rounded-md flex-shrink-0">
                            {course.progress_percentage}%
                          </span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="space-y-2">
                          <Progress value={course.progress_percentage} className="h-2" />
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">
                              {course.progress_percentage > 0 ? 'In Progress' : 'Not Started'}
                            </span>
                            <span className="text-xs text-muted-foreground hidden sm:inline">
                              Last: {new Date(course.last_accessed).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        
                        {/* Continue Button */}
                        <Link href={`/courses/${course.id}/study`} className="block">
                          <Button 
                            size="sm"
                            className="w-full h-9 sm:h-10 bg-primary hover:bg-primary/90 text-white text-sm font-medium"
                          >
                            {course.progress_percentage > 0 ? 'Continue Learning' : 'Start Course'}
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  ))}
                  {courses.length > 5 && (
                    <div className="text-center pt-4">
                      <Link href="/courses">
                        <Button variant="outline" className="w-full sm:w-auto border-primary text-primary hover:bg-primary hover:text-white">
                          View All Courses
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 sm:py-12">
                  <div className="relative">
                    <BookOpen className="h-10 w-10 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                    <Sparkles className="h-4 w-4 sm:h-6 sm:w-6 text-secondary absolute -top-1 -right-1 animate-pulse" />
                  </div>
                  <h3 className="text-base sm:text-xl font-semibold text-foreground mb-2">Ready to Start Learning?</h3>
                  <p className="text-muted-foreground mb-4 sm:mb-6 text-xs sm:text-base px-2">
                    Join thousands of learners and start your English mastery journey today
                  </p>
                  <div className="flex flex-col gap-2 sm:gap-3 justify-center items-center">
                    <Link href="/courses" className="w-full">
                      <Button className="w-full h-9 sm:h-12 bg-primary hover:bg-secondary text-white hover:text-black text-xs sm:text-base">
                        Browse Courses
                        <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
                      </Button>
                    </Link>
                    <Link href="/quizzes" className="w-full">
                      <Button variant="outline" className="w-full h-9 sm:h-12 border-primary text-primary hover:bg-primary hover:text-white text-xs sm:text-base">
                        Try a Quiz First
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Quiz Results */}
          <Card variant="base" className="h-fit">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-xl">
                <Target className="h-4 w-4 sm:h-5 sm:w-5 text-secondary" />
                Recent Quiz Results
              </CardTitle>
              <CardDescription className="text-xs sm:text-base hidden sm:block">Your latest quiz performances</CardDescription>
            </CardHeader>
            <CardContent>
              {quizAttempts.length > 0 ? (
                <div className="space-y-4 sm:space-y-6">
                  {quizAttempts.slice(0, 5).map((attempt) => {
                    const { scoreColor } = getQuizScoreColor(attempt.score)
                    
                    return (
                      <Card key={attempt.id} variant="interactive" className="p-4 sm:p-6 hover:shadow-md transition-all duration-200 border border-border hover:border-secondary/30">
                        <div className="space-y-3">
                          {/* Quiz Title and Score */}
                          <div className="flex items-start justify-between">
                            <h4 className="font-medium text-foreground text-sm sm:text-base leading-tight flex-1 mr-3">
                              {attempt.quiz_title}
                            </h4>
                            <span className={`text-sm font-semibold px-2 py-1 rounded-md flex-shrink-0 ${
                              attempt.score >= 80 ? 'text-green-700 bg-green-100' : 
                              attempt.score >= 60 ? 'text-yellow-700 bg-yellow-100' : 
                              'text-red-700 bg-red-100'
                            }`}>
                              {attempt.score}%
                            </span>
                          </div>
                          
                          {/* Quiz Details */}
                          <div className="flex items-center gap-4 text-xs sm:text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{new Date(attempt.completed_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span>{attempt.time_taken_minutes} min</span>
                            </div>
                          </div>
                          
                          {/* Performance Indicator */}
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Performance</span>
                            <span className={`font-medium ${
                              attempt.score >= 80 ? 'text-green-600' : 
                              attempt.score >= 60 ? 'text-yellow-600' : 
                              'text-red-600'
                            }`}>
                              {attempt.score >= 80 ? 'Excellent' : 
                               attempt.score >= 60 ? 'Good' : 'Needs Improvement'}
                            </span>
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                  {quizAttempts.length > 5 && (
                    <div className="text-center pt-4">
                      <Link href="/dashboard/results">
                        <Button variant="outline" className="w-full sm:w-auto border-secondary text-secondary hover:bg-secondary hover:text-black">
                          View All Results
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 sm:py-12">
                  <div className="relative">
                    <Target className="h-10 w-10 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                    <Sparkles className="h-4 w-4 sm:h-6 sm:w-6 text-secondary absolute -top-1 -right-1 animate-pulse" />
                  </div>
                  <h3 className="text-base sm:text-xl font-semibold text-foreground mb-2">Test Your Skills!</h3>
                  <p className="text-muted-foreground mb-4 sm:mb-6 text-xs sm:text-base px-2">
                    Challenge yourself with interactive quizzes and track your progress
                  </p>
                  <div className="flex flex-col gap-2 sm:gap-3 justify-center items-center">
                    <Link href="/quizzes" className="w-full">
                      <Button className="w-full h-9 sm:h-12 bg-primary hover:bg-secondary text-white hover:text-black text-xs sm:text-base">
                        Take Your First Quiz
                        <Brain className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
                      </Button>
                    </Link>
                    <Link href="/courses" className="w-full">
                      <Button variant="outline" className="w-full h-9 sm:h-12 border-secondary text-secondary hover:bg-secondary hover:text-black text-xs sm:text-base">
                        Learn First
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions - Compact Mobile Touch Targets */}
        <Card variant="base">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-xl">
              <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Quick Actions
            </CardTitle>
            <CardDescription className="text-xs sm:text-base hidden sm:block">Common learning activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              <Link href="/courses" className="block">
                <Card variant="interactive" className="p-4 sm:p-8 text-center hover:border-primary transition-all duration-300 hover:shadow-lg bg-gradient-to-br from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/20 aspect-square sm:min-h-[140px] flex flex-col justify-center">
                  <BookOpen className="h-6 w-6 sm:h-12 sm:w-12 text-primary mx-auto mb-2 sm:mb-4" />
                  <h3 className="font-semibold text-foreground mb-1 sm:mb-2 text-xs sm:text-lg">Browse Courses</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed hidden sm:block">Discover new learning opportunities</p>
                </Card>
              </Link>
              
              <Link href="/quizzes" className="block">
                <Card variant="interactive" className="p-4 sm:p-8 text-center hover:border-secondary transition-all duration-300 hover:shadow-lg bg-gradient-to-br from-secondary/5 to-secondary/10 hover:from-secondary/10 hover:to-secondary/20 aspect-square sm:min-h-[140px] flex flex-col justify-center">
                  <Target className="h-6 w-6 sm:h-12 sm:w-12 text-secondary mx-auto mb-2 sm:mb-4" />
                  <h3 className="font-semibold text-foreground mb-1 sm:mb-2 text-xs sm:text-lg">Take a Quiz</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed hidden sm:block">Test your knowledge and skills</p>
                </Card>
              </Link>
              
              <Link href="/profile" className="block col-span-2 sm:col-span-2 lg:col-span-1">
                <Card variant="interactive" className="p-4 sm:p-8 text-center hover:border-primary transition-all duration-300 hover:shadow-lg bg-gradient-to-br from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/20 aspect-square sm:min-h-[140px] flex flex-col justify-center">
                  <User className="h-6 w-6 sm:h-12 sm:w-12 text-primary mx-auto mb-2 sm:mb-4" />
                  <h3 className="font-semibold text-foreground mb-1 sm:mb-2 text-xs sm:text-lg">Update Profile</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed hidden sm:block">Manage your account settings</p>
                </Card>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
