'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, CheckCircle, BarChart3, Lightbulb, Check, Edit, RefreshCw, BookOpen, Clock, Target, Award, TrendingUp, Brain, Star, Zap } from 'lucide-react'
import { CollapsibleSection } from '@/components/quiz/display/CollapsibleSection'
import { ContextualBackButton } from '@/components/navigation/ContextualBackButton'
import { ResultsExplanation } from '@/components/quiz/display/ResultsExplanation'
import { logger } from '@/lib/logger'

interface QuizResult {
  id: string
  quiz_title: string
  score: number
  total_questions: number
  correct_answers: number
  time_taken_minutes: number
  completed_at: string
  answers: Array<{
    question: string
    user_answer: string
    correct_answer: string
    is_correct: boolean
    explanation?: string
  }>
}

export default function QuizResultsPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [results, setResults] = useState<QuizResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [animatedScore, setAnimatedScore] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const scoreAnimationRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // CRITICAL: Wait for auth to complete before checking user
    if (authLoading) {
      logger.info('[Results] Waiting for auth to complete...')
      return
    }

    // Check if user is logged in
    if (!user) {
      logger.info('[Results] No user found, redirecting to auth...')
      router.push(`/auth?tab=signin&redirect=/quizzes/${params.id}/results/${params.resultId}`)
      return
    }

    const fetchResults = async () => {
      try {
        logger.info('[Results] Fetching results for attempt:', { resultId: params.resultId })
        setLoading(true)

        // Fetch from the new quiz-attempts API
        const response = await fetch(`/api/quiz-attempts/${params.resultId}`)

        if (!response.ok) {
          // Handle 401/403 specifically - means auth issue
          if (response.status === 401 || response.status === 403) {
            logger.warn('[Results] Auth error, redirecting...')
            router.push(`/auth?tab=signin&redirect=/quizzes/${params.id}/results/${params.resultId}`)
            return
          }
          throw new Error(`HTTP ${response.status}: Failed to fetch results`)
        }

        const data = await response.json()

        if (!data.success || !data.data) {
          throw new Error(data.error || 'Failed to load quiz results')
        }

        logger.info('[Results] Results loaded successfully')
        setResults(data.data)
      } catch (err: any) {
        logger.error('Error fetching quiz results', { error: err?.message || 'Unknown error' })
        setError(err instanceof Error ? err.message : 'Failed to load quiz results')
      } finally {
        setLoading(false)
      }
    }

    if (params.resultId) {
      fetchResults()
    } else {
      setError('Invalid result ID')
      setLoading(false)
    }
  }, [params.id, params.resultId, user, authLoading, router])

  // Animate score when results are loaded
  useEffect(() => {
    if (results) {
      const targetScore = Math.round((results.correct_answers / results.total_questions) * 100)
      const duration = 2000 // 2 seconds
      const steps = 60
      const increment = targetScore / steps
      let currentStep = 0

      scoreAnimationRef.current = setInterval(() => {
        currentStep++
        if (currentStep >= steps) {
          setAnimatedScore(targetScore)
          if (scoreAnimationRef.current) {
            clearInterval(scoreAnimationRef.current)
          }
          // Show confetti for good scores
          if (targetScore >= 70) {
            setShowConfetti(true)
            setTimeout(() => setShowConfetti(false), 3000)
          }
        } else {
          setAnimatedScore(Math.min(Math.round(increment * currentStep), targetScore))
        }
      }, duration / steps)

      return () => {
        if (scoreAnimationRef.current) {
          clearInterval(scoreAnimationRef.current)
        }
      }
    }
  }, [results])

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-warning'
    return 'text-destructive'
  }

  const getScoreGradient = (score: number) => {
    if (score >= 90) return 'from-emerald-500 to-green-600'
    if (score >= 80) return 'from-green-500 to-emerald-600'
    if (score >= 70) return 'from-blue-500 to-cyan-600'
    if (score >= 60) return 'from-yellow-500 to-orange-500'
    return 'from-red-500 to-orange-600'
  }

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { icon: Star, label: 'Outstanding', color: 'text-yellow-500', bg: 'bg-yellow-50' }
    if (score >= 80) return { icon: Award, label: 'Excellent', color: 'text-green-600', bg: 'bg-green-50' }
    if (score >= 70) return { icon: TrendingUp, label: 'Good Job', color: 'text-blue-600', bg: 'bg-blue-50' }
    if (score >= 60) return { icon: Brain, label: 'Keep Learning', color: 'text-orange-600', bg: 'bg-orange-50' }
    return { icon: Zap, label: 'Keep Trying', color: 'text-red-600', bg: 'bg-red-50' }
  }

  const getScoreMessage = (score: number) => {
    if (score >= 90) return { message: 'Excellent work! You mastered this topic!', emoji: '🎉' }
    if (score >= 80) return { message: 'Great job! You have a solid understanding!', emoji: '🌟' }
    if (score >= 70) return { message: 'Good work! Keep practicing to improve!', emoji: '👍' }
    if (score >= 60) return { message: 'Not bad! Review the topics and try again!', emoji: '📚' }
    return { message: 'Keep learning! Practice makes perfect!', emoji: '💪' }
  }

  // Circular progress calculation
  const getCircularProgress = (score: number) => {
    const radius = 70
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (score / 100) * circumference
    return { radius, circumference, offset }
  }

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 relative overflow-hidden">
        <div className="max-w-2xl mx-auto px-4 flex items-center justify-center py-20">
          <Card variant="elevated" className="text-center p-12">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary mx-auto mb-6"></div>
            <p className="text-lg text-muted-foreground font-medium">
              {authLoading ? 'Checking authentication...' : 'Loading results...'}
            </p>
          </Card>
        </div>
      </div>
    )
  }

  if (error || !results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 relative overflow-hidden">
        <div className="max-w-2xl mx-auto px-4 py-8">
          
          {/* Contextual Back Navigation for Error State */}
          <div className="mb-4 sm:mb-6">
            <ContextualBackButton
              href="/quizzes"
              label="Back to All Quizzes"
            />
          </div>

          <div className="text-center">
            <Card variant="elevated" className="text-center p-12">
              <div className="w-16 h-16 bg-destructive rounded-2xl flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-semibold text-foreground mb-6">Results Not Found</h2>
              <p className="text-lg text-muted-foreground mb-8">{error || 'The quiz results could not be found.'}</p>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  const scoreMessage = getScoreMessage(Math.round((results.correct_answers / results.total_questions) * 100))
  const percentageScore = Math.round((results.correct_answers / results.total_questions) * 100)
  const scoreBadge = getScoreBadge(percentageScore)
  const circularProgress = getCircularProgress(animatedScore)
  const BadgeIcon = scoreBadge.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 relative overflow-hidden">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="absolute inset-0">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 3}s`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-8 sm:pb-12">

        {/* Contextual Back Navigation */}
        <div className="mb-4 sm:mb-6">
          <ContextualBackButton
            href="/quizzes"
            label="Back to All Quizzes"
          />
        </div>

        {/* Results Header - Modern Design with Circular Progress */}
        <Card variant="elevated" className="text-center p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 overflow-hidden relative">
          {/* Animated Background Gradient */}
          <div className={`absolute inset-0 bg-gradient-to-br ${getScoreGradient(percentageScore)} opacity-5`} />

          <div className="relative z-10">
            {/* Achievement Badge */}
            <div className={`inline-flex items-center gap-2 ${scoreBadge.bg} ${scoreBadge.color} px-4 py-2 rounded-full mb-6 font-semibold text-sm`}>
              <BadgeIcon className="w-5 h-5" />
              <span>{scoreBadge.label}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2 sm:mb-3">
              Quiz Complete! {scoreMessage.emoji}
            </h1>
            <h3 className="text-lg sm:text-xl md:text-2xl font-medium text-muted-foreground mb-6 sm:mb-8 px-2">
              {results.quiz_title}
            </h3>

            {/* Circular Progress Ring */}
            <div className="flex justify-center mb-6">
              <div className="relative w-48 h-48 sm:w-56 sm:h-56">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                  {/* Background circle */}
                  <circle
                    cx="80"
                    cy="80"
                    r={circularProgress.radius}
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-gray-200"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="80"
                    cy="80"
                    r={circularProgress.radius}
                    stroke="url(#scoreGradient)"
                    strokeWidth="12"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circularProgress.circumference}
                    strokeDashoffset={circularProgress.offset}
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" className={percentageScore >= 80 ? 'text-green-500' : percentageScore >= 60 ? 'text-yellow-500' : 'text-red-500'} stopColor="currentColor" />
                      <stop offset="100%" className={percentageScore >= 80 ? 'text-emerald-600' : percentageScore >= 60 ? 'text-orange-500' : 'text-orange-600'} stopColor="currentColor" />
                    </linearGradient>
                  </defs>
                </svg>
                {/* Score Text in Center */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className={`text-5xl sm:text-6xl font-bold ${getScoreColor(percentageScore)}`}>
                    {animatedScore}%
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">Your Score</div>
                </div>
              </div>
            </div>

            <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 px-2 font-medium">
              {scoreMessage.message}
            </p>

            {/* Mobile-Optimized Stats Grid with Hover Effects */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 max-w-4xl mx-auto">
              <Card variant="default" className="text-center p-3 sm:p-4 md:p-6 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer border-2 hover:border-green-300">
                <div className="flex flex-col items-center mb-2">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                    <Target className="w-5 h-5 sm:w-6 sm:h-6 text-success" />
                  </div>
                  <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-success">
                    {results.correct_answers}
                  </div>
                </div>
                <div className="text-xs sm:text-sm text-gray-600 font-medium uppercase tracking-wide">
                  Correct
                </div>
              </Card>

              <Card variant="default" className="text-center p-3 sm:p-4 md:p-6 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer border-2 hover:border-gray-300">
                <div className="flex flex-col items-center mb-2">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                    <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                  </div>
                  <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
                    {results.total_questions}
                  </div>
                </div>
                <div className="text-xs sm:text-sm text-gray-600 font-medium uppercase tracking-wide">
                  Total
                </div>
              </Card>

              <Card variant="default" className="text-center p-3 sm:p-4 md:p-6 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer border-2 hover:border-primary/30">
                <div className="flex flex-col items-center mb-2">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                    <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </div>
                  <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-primary">
                    {results.time_taken_minutes}
                  </div>
                </div>
                <div className="text-xs sm:text-sm text-gray-600 font-medium uppercase tracking-wide">
                  Minutes
                </div>
              </Card>

              <Card variant="default" className="text-center p-3 sm:p-4 md:p-6 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer border-2 hover:border-secondary/30">
                <div className="flex flex-col items-center mb-2">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-secondary/10 rounded-full flex items-center justify-center mb-2">
                    <Award className="w-5 h-5 sm:w-6 sm:h-6 text-secondary" />
                  </div>
                  <div className={`text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold ${getScoreColor(percentageScore)}`}>
                    {percentageScore}%
                  </div>
                </div>
                <div className="text-xs sm:text-sm text-gray-600 font-medium uppercase tracking-wide">
                  Score
                </div>
              </Card>
            </div>
          </div>
        </Card>

        {/* Mobile-Optimized Detailed Results */}
        <Card variant="elevated" className="mb-6 sm:mb-8">
          <CardHeader className="bg-secondary/10 p-3 sm:p-4 md:p-6">
            <CardTitle className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg md:text-xl">
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
              <span>Question by Question Review</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="space-y-2 sm:space-y-3 md:space-y-4">
              {results.answers.map((answer, index) => (
                <CollapsibleSection
                  key={index}
                  title={`Question ${index + 1} ${answer.is_correct ? '✓' : '✗'}`}
                  defaultOpen={false}
                  className={`${
                    answer.is_correct 
                      ? 'border-green-300 bg-green-50/30' 
                      : 'border-red-300 bg-red-50/30'
                  }`}
                  icon={answer.is_correct ? (
                    <CheckCircle className="w-4 h-4 text-success" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                  )}
                >
                  <ResultsExplanation
                    question={answer.question}
                    userAnswer={answer.user_answer}
                    correctAnswer={answer.correct_answer}
                    isCorrect={answer.is_correct}
                    explanation={answer.explanation}
                    questionNumber={index + 1}
                  />
                </CollapsibleSection>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tips for Improvement - Enhanced Interactive Design */}
        <Card variant="elevated" className="p-6 sm:p-8 text-center overflow-hidden relative">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 opacity-50" />

          <div className="relative z-10">
            <div className="w-16 h-16 bg-gradient-to-br from-secondary to-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Lightbulb className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">Tips for Improvement</h3>
            <p className="text-base text-muted-foreground mb-8">Enhance your learning journey with these proven strategies</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto mb-8">
              <div className="text-left">
                <h4 className="text-xl font-semibold text-secondary mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Learning Strategies
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-4 bg-white/80 rounded-xl shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300 border border-gray-100">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-success" />
                    </div>
                    <span className="text-muted-foreground font-medium">Review explanations carefully</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-white/80 rounded-xl shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300 border border-gray-100">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Edit className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-muted-foreground font-medium">Take detailed notes</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-white/80 rounded-xl shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300 border border-gray-100">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <RefreshCw className="w-4 h-4 text-secondary" />
                    </div>
                    <span className="text-muted-foreground font-medium">Practice regularly</span>
                  </div>
                </div>
              </div>

              <div className="text-left">
                <h4 className="text-xl font-semibold text-secondary mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Growth Actions
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-4 bg-white/80 rounded-xl shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300 border border-gray-100">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-4 h-4 text-warning" />
                    </div>
                    <span className="text-muted-foreground font-medium">Explore related courses</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-white/80 rounded-xl shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300 border border-gray-100">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-success" />
                    </div>
                    <span className="text-muted-foreground font-medium">Join study communities</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-white/80 rounded-xl shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300 border border-gray-100">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <BarChart3 className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-muted-foreground font-medium">Create study schedule</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile-Optimized Action Buttons with Enhanced Styling */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link
                href="/courses"
                className="group bg-gradient-to-r from-primary to-secondary hover:from-secondary hover:to-primary text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 transform hover:scale-105 hover:shadow-xl text-center touch-manipulation min-h-[44px] flex items-center justify-center gap-2"
              >
                <BookOpen className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                Browse Courses
              </Link>
              <Link
                href="/quizzes"
                className="group bg-gradient-to-r from-secondary to-primary hover:from-primary hover:to-secondary text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 transform hover:scale-105 hover:shadow-xl text-center touch-manipulation min-h-[44px] flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform" />
                More Quizzes
              </Link>
            </div>
          </div>
        </Card>

      </div>
    </div>
  )
}
