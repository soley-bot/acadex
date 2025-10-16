'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, CheckCircle, BarChart3, Lightbulb, Check, Edit, RefreshCw, BookOpen, Clock, Target, Award } from 'lucide-react'
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
  const { user } = useAuth()
  const [results, setResults] = useState<QuizResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      router.push(`/auth?tab=signin&redirect=/quizzes/${params.id}/results/${params.resultId}`)
      return
    }

    const fetchResults = async () => {
      try {
        setLoading(true)

        // Fetch from the new quiz-attempts API
        const response = await fetch(`/api/quiz-attempts/${params.resultId}`)

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Failed to fetch results`)
        }

        const data = await response.json()

        if (!data.success || !data.data) {
          throw new Error(data.error || 'Failed to load quiz results')
        }

        setResults(data.data)
      } catch (err) {
        logger.error('Error fetching quiz results:', err)
        setError(err instanceof Error ? err.message : 'Failed to load quiz results')
      } finally {
        setLoading(false)
      }
    }

    if (params.resultId) {
      fetchResults()
    }
  }, [params.id, params.resultId, user, router])

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-warning'
    return 'text-destructive'
  }

  const getScoreMessage = (score: number) => {
    if (score >= 90) return { message: 'Excellent work! You mastered this topic!' }
    if (score >= 80) return { message: 'Great job! You have a solid understanding!' }
    if (score >= 70) return { message: 'Good work! Keep practicing to improve!' }
    if (score >= 60) return { message: 'Not bad! Review the topics and try again!' }
    return { message: 'Keep learning! Practice makes perfect!' }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 relative overflow-hidden">
        <div className="max-w-2xl mx-auto px-4 flex items-center justify-center py-20">
          <Card variant="elevated" className="text-center p-12">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary mx-auto mb-6"></div>
            <p className="text-lg text-muted-foreground font-medium">Loading results...</p>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-8 sm:pb-12">
        
        {/* Contextual Back Navigation */}
        <div className="mb-4 sm:mb-6">
          <ContextualBackButton
            href="/quizzes"
            label="Back to All Quizzes"
          />
        </div>

        {/* Results Header - Mobile Optimized */}
        <Card variant="elevated" className="text-center p-4 sm:p-6 md:p-8 mb-6 sm:mb-8">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-success rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <CheckCircle className="w-6 w-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2 sm:mb-3">Quiz Complete!</h1>
          <h3 className="text-lg sm:text-xl md:text-2xl font-medium text-muted-foreground mb-6 sm:mb-8 px-2">{results.quiz_title}</h3>
          
          <div className={`text-4xl sm:text-5xl md:text-6xl font-bold mb-3 sm:mb-4 ${getScoreColor(percentageScore)}`}>
            {percentageScore}%
          </div>
          <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 px-2">{scoreMessage.message}</p>
          
          {/* Mobile-Optimized Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 max-w-4xl mx-auto">
            <Card variant="default" className="text-center p-3 sm:p-4 md:p-6">
              <div className="flex flex-col items-center mb-2">
                <Target className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-success mb-1" />
                <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-success">
                  {results.correct_answers}
                </div>
              </div>
              <div className="text-xs sm:text-sm text-gray-600 font-medium uppercase tracking-wide">
                Correct
              </div>
            </Card>
            
            <Card variant="default" className="text-center p-3 sm:p-4 md:p-6">
              <div className="flex flex-col items-center mb-2">
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-700 mb-1" />
                <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
                  {results.total_questions}
                </div>
              </div>
              <div className="text-xs sm:text-sm text-gray-600 font-medium uppercase tracking-wide">
                Total
              </div>
            </Card>
            
            <Card variant="default" className="text-center p-3 sm:p-4 md:p-6">
              <div className="flex flex-col items-center mb-2">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-primary mb-1" />
                <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-primary">
                  {results.time_taken_minutes}
                </div>
              </div>
              <div className="text-xs sm:text-sm text-gray-600 font-medium uppercase tracking-wide">
                Minutes
              </div>
            </Card>
            
            <Card variant="default" className="text-center p-3 sm:p-4 md:p-6">
              <div className="flex flex-col items-center mb-2">
                <Award className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-secondary mb-1" />
                <div className={`text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold ${getScoreColor(percentageScore)}`}>
                  {percentageScore}%
                </div>
              </div>
              <div className="text-xs sm:text-sm text-gray-600 font-medium uppercase tracking-wide">
                Score
              </div>
            </Card>
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

        {/* Tips for Improvement */}
        <Card variant="elevated" className="p-8 text-center">
          <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Lightbulb className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-medium text-foreground mb-4">Tips for Improvement</h3>
          <p className="text-base text-muted-foreground mb-8">Enhance your learning journey with these proven strategies</p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="text-left">
              <h4 className="text-xl font-medium text-secondary mb-4">Learning Strategies</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                  <Check className="w-4 h-4 text-success" />
                  <span className="text-muted-foreground">Review explanations carefully</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                  <Edit className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">Take detailed notes</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                  <RefreshCw className="w-4 h-4 text-secondary" />
                  <span className="text-muted-foreground">Practice regularly</span>
                </div>
              </div>
            </div>
            
            <div className="text-left">
              <h4 className="text-xl font-medium text-secondary mb-4">Growth Actions</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                  <BookOpen className="w-4 h-4 text-warning" />
                  <span className="text-muted-foreground">Explore related courses</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span className="text-muted-foreground">Join study communities</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">Create study schedule</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Mobile-Optimized Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mt-6 sm:mt-8">
            <Link
              href="/courses"
              className="bg-primary hover:bg-secondary text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 transform hover:scale-105 text-center touch-manipulation min-h-[44px] flex items-center justify-center"
            >
              Browse Courses
            </Link>
            <Link
              href="/quizzes"
              className="bg-secondary hover:bg-primary text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 transform hover:scale-105 text-center touch-manipulation min-h-[44px] flex items-center justify-center"
            >
              More Quizzes
            </Link>
          </div>
        </Card>

      </div>
    </div>
  )
}
