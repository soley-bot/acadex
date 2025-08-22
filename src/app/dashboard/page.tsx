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
  GraduationCap, 
  Brain, 
  Medal, 
  Zap,
  Clock,
  User,
  ArrowRight,
  AlertCircle,
  Loader2,
  Target
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
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-20 lg:py-24">
        {/* Header - Professional Typography */}
        <div className="mb-12 md:mb-16">
          <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-lg text-muted-foreground">
            Welcome back, {user?.name || user?.email}
          </p>
        </div>

        {/* Stats Overview - Mobile-First Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 mb-12 md:mb-16">
          {[
            {
              title: 'Total Courses',
              value: progress?.courses_enrolled || '0',
              description: 'Enrolled courses',
              icon: BookOpen,
              color: 'text-primary',
              bgColor: 'bg-primary/10'
            },
            {
              title: 'Completed',
              value: progress?.courses_completed || '0', 
              description: 'Courses finished',
              icon: GraduationCap,
              color: 'text-success',
              bgColor: 'bg-success/10'
            },
            {
              title: 'Quiz Attempts',
              value: progress?.quizzes_taken || '0',
              description: 'Total attempts',
              icon: Brain,
              color: 'text-primary',
              bgColor: 'bg-primary/10'
            },
            {
              title: 'Average Score',
              value: progress?.average_score ? `${Math.round(progress.average_score)}%` : '0%',
              description: 'Quiz performance',
              icon: Medal,
              color: 'text-secondary',
              bgColor: 'bg-secondary/10'
            }
          ].map((stat, index) => (
            <Card key={index} variant="elevated" className="transform hover:scale-105 transition-all duration-300 overflow-hidden min-h-[120px] sm:min-h-[140px]">
              <CardContent className="p-4 sm:p-6 relative h-full">
                <div className={`absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 ${stat.bgColor} rounded-full -mr-8 sm:-mr-10 -mt-8 sm:-mt-10 opacity-60`}></div>
                <div className="relative h-full flex flex-col justify-between">
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <stat.icon className={`h-6 w-6 sm:h-8 sm:w-8 ${stat.color} flex-shrink-0`} />
                    <div className="text-2xl sm:text-3xl font-bold text-foreground text-right">
                      {stat.value}
                    </div>
                  </div>
                  <div className="mt-auto">
                    <h3 className="text-base sm:text-lg font-semibold text-foreground leading-tight">{stat.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">{stat.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Grid - Mobile-Optimized Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8 mb-12 md:mb-16">
          {/* Current Courses */}
          <Card variant="base" className="h-fit">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <BookOpen className="h-5 w-5 text-primary" />
                Current Courses
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">Your enrolled courses and progress</CardDescription>
            </CardHeader>
            <CardContent>
              {courses.length > 0 ? (
                <div className="space-y-4 sm:space-y-6">
                  {courses.slice(0, 5).map((course) => (
                    <Card key={course.id} variant="interactive" className="p-4 sm:p-6 hover:shadow-lg transition-all duration-300 min-h-[100px] sm:min-h-[120px]">
                      <div className="flex flex-col gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground mb-3 text-sm sm:text-base leading-tight line-clamp-2">{course.title}</h4>
                          <div className="flex items-center gap-3 mb-3">
                            <Progress value={course.progress_percentage} className="flex-1 h-2 sm:h-3" />
                            <span className="text-sm sm:text-base font-medium text-muted-foreground min-w-[3rem] text-right">
                              {course.progress_percentage}%
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Last accessed: {new Date(course.last_accessed).toLocaleDateString()}
                          </p>
                        </div>
                        <Link href={`/courses/${course.id}/study`} className="w-full">
                          <Button 
                            size="sm"
                            className="w-full h-11 sm:h-12 bg-primary hover:bg-secondary text-white hover:text-black text-sm sm:text-base"
                          >
                            Continue Learning
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  ))}
                  {courses.length > 5 && (
                    <div className="text-center pt-4 sm:pt-6">
                      <Link href="/courses">
                        <Button variant="outline" className="w-full sm:w-auto h-11 sm:h-12 border-primary text-primary hover:bg-primary hover:text-white">
                          View All Courses
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <BookOpen className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">No courses yet</h3>
                  <p className="text-muted-foreground mb-6 text-sm sm:text-base">Start your learning journey by enrolling in a course</p>
                  <Link href="/courses">
                    <Button className="w-full sm:w-auto h-11 sm:h-12 bg-primary hover:bg-secondary text-white hover:text-black">
                      Browse Courses
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Quiz Results */}
          <Card variant="base" className="h-fit">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Target className="h-5 w-5 text-secondary" />
                Recent Quiz Results
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">Your latest quiz performances</CardDescription>
            </CardHeader>
            <CardContent>
              {quizAttempts.length > 0 ? (
                <div className="space-y-4 sm:space-y-6">
                  {quizAttempts.slice(0, 5).map((attempt) => {
                    const scoreColor = attempt.score >= 80 ? 'text-success' : 
                                     attempt.score >= 60 ? 'text-warning' : 'text-destructive'
                    const scoreBg = attempt.score >= 80 ? 'bg-success/10' : 
                                  attempt.score >= 60 ? 'bg-warning/10' : 'bg-destructive/10'
                    
                    return (
                      <Card key={attempt.id} variant="interactive" className="p-4 sm:p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-l-transparent hover:border-l-primary min-h-[80px] sm:min-h-[100px]">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-foreground text-sm sm:text-base leading-tight line-clamp-2 mb-2">{attempt.quiz_title}</h4>
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                              <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                              <span className="truncate">{new Date(attempt.completed_at).toLocaleDateString()}</span>
                              <span>•</span>
                              <span className="whitespace-nowrap">{attempt.time_taken_minutes} min</span>
                            </div>
                          </div>
                          <div className={`text-xl sm:text-2xl font-bold ${scoreColor} ${scoreBg} px-3 py-2 rounded-lg text-center min-w-[80px] sm:min-w-[90px]`}>
                            {attempt.score}%
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                  {quizAttempts.length > 5 && (
                    <div className="text-center pt-4 sm:pt-6">
                      <Link href="/dashboard/results">
                        <Button variant="outline" className="w-full sm:w-auto h-11 sm:h-12 border-secondary text-secondary hover:bg-secondary hover:text-black">
                          View All Results
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <Target className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">No quizzes taken yet</h3>
                  <p className="text-muted-foreground mb-6 text-sm sm:text-base">Test your knowledge with our interactive quizzes</p>
                  <Link href="/quizzes">
                    <Button className="w-full sm:w-auto h-11 sm:h-12 bg-primary hover:bg-secondary text-white hover:text-black">
                      Take a Quiz
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions - Mobile-Optimized Touch Targets */}
        <Card variant="base">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Zap className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">Common learning activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <Link href="/courses" className="block">
                <Card variant="interactive" className="p-6 sm:p-8 text-center hover:border-primary transition-all duration-300 hover:shadow-lg bg-gradient-to-br from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/20 min-h-[120px] sm:min-h-[140px] flex flex-col justify-center">
                  <BookOpen className="h-10 w-10 sm:h-12 sm:w-12 text-primary mx-auto mb-3 sm:mb-4" />
                  <h3 className="font-semibold text-foreground mb-2 text-base sm:text-lg">Browse Courses</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">Discover new learning opportunities</p>
                </Card>
              </Link>
              
              <Link href="/quizzes" className="block">
                <Card variant="interactive" className="p-6 sm:p-8 text-center hover:border-secondary transition-all duration-300 hover:shadow-lg bg-gradient-to-br from-secondary/5 to-secondary/10 hover:from-secondary/10 hover:to-secondary/20 min-h-[120px] sm:min-h-[140px] flex flex-col justify-center">
                  <Target className="h-10 w-10 sm:h-12 sm:w-12 text-secondary mx-auto mb-3 sm:mb-4" />
                  <h3 className="font-semibold text-foreground mb-2 text-base sm:text-lg">Take a Quiz</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">Test your knowledge and skills</p>
                </Card>
              </Link>
              
              <Link href="/profile" className="block sm:col-span-2 lg:col-span-1">
                <Card variant="interactive" className="p-6 sm:p-8 text-center hover:border-primary transition-all duration-300 hover:shadow-lg bg-gradient-to-br from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/20 min-h-[120px] sm:min-h-[140px] flex flex-col justify-center">
                  <User className="h-10 w-10 sm:h-12 sm:w-12 text-primary mx-auto mb-3 sm:mb-4" />
                  <h3 className="font-semibold text-foreground mb-2 text-base sm:text-lg">Update Profile</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">Manage your account settings</p>
                </Card>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
