'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getQuizResults } from '@/lib/database'
import { useAuth } from '@/contexts/AuthContext'
import { H1, H2, H3, H4, BodyLG, BodyMD } from '@/components/ui/Typography'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, CheckCircle, BarChart3, Lightbulb, Check, Edit, RefreshCw, BookOpen, Clock, Target, Award } from 'lucide-react'
import { Container, Section, Grid, Flex } from '@/components/ui/Layout'
import { CollapsibleSection } from '@/components/quiz/CollapsibleSection'
import { ResultsExplanation } from '@/components/quiz/ResultsExplanation'
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
      router.push('/auth/login')
      return
    }

    const fetchResults = async () => {
      try {
        setLoading(true)
        const { data, error: fetchError } = await getQuizResults(params.resultId as string)
        
        if (fetchError) {
          setError('Failed to load quiz results')
          logger.error('Error fetching quiz results:', fetchError)
        } else {
          setResults(data)
        }
      } catch (err) {
        logger.error('Error fetching quiz results:', err)
        setError('Failed to load quiz results')
      } finally {
        setLoading(false)
      }
    }

    if (params.resultId) {
      fetchResults()
    }
  }, [params.resultId, user, router])

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
      <Section className="min-h-screen relative overflow-hidden" background="gradient">
        <Container className="relative flex items-center justify-center py-20">
          <Card variant="glass" className="text-center p-12">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary mx-auto mb-6"></div>
            <BodyLG className="text-gray-700 font-medium">Loading results...</BodyLG>
          </Card>
        </Container>
      </Section>
    )
  }

  if (error || !results) {
    return (
      <Section className="min-h-screen relative overflow-hidden" background="gradient">
        <Container className="relative max-w-2xl pt-32 text-center">
          <Card variant="glass" className="p-12">
            <div className="w-16 h-16 bg-destructive rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
            <H2 className="text-gray-900 mb-6">Results Not Found</H2>
            <BodyLG className="text-gray-700 mb-8">{error || 'The quiz results could not be found.'}</BodyLG>
            <Link
              href="/quizzes"
              className="bg-primary hover:bg-secondary text-white hover:text-black px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 inline-block"
            >
              Back to Quizzes
            </Link>
          </Card>
        </Container>
      </Section>
    )
  }

  const scoreMessage = getScoreMessage(results.score)

  return (
    <Section className="min-h-screen relative overflow-hidden" background="gradient">
      <Container className="relative max-w-6xl pt-20 pb-12">

        {/* Results Header */}
        <Card variant="glass" className="text-center p-8 mb-8">
          <div className="w-16 h-16 bg-success rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <H1 className="text-gray-900 mb-3">Quiz Complete!</H1>
          <H3 className="text-gray-700 mb-8">{results.quiz_title}</H3>
          
          <div className={`text-6xl font-bold mb-4 ${getScoreColor(results.score)}`}>
            {results.score}%
          </div>
          <BodyLG className="text-gray-700 mb-8">{scoreMessage.message}</BodyLG>
          
          {/* Mobile-Optimized Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
            <Card variant="base" className="text-center p-3 sm:p-4">
              <div className="flex items-center justify-center mb-2">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 text-success mr-2" />
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-success">
                  {results.correct_answers}
                </div>
              </div>
              <div className="text-xs sm:text-sm text-gray-600 font-medium uppercase tracking-wide">
                Correct
              </div>
            </Card>
            
            <Card variant="base" className="text-center p-3 sm:p-4">
              <div className="flex items-center justify-center mb-2">
                <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 mr-2" />
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                  {results.total_questions}
                </div>
              </div>
              <div className="text-xs sm:text-sm text-gray-600 font-medium uppercase tracking-wide">
                Total
              </div>
            </Card>
            
            <Card variant="base" className="text-center p-3 sm:p-4">
              <div className="flex items-center justify-center mb-2">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-primary mr-2" />
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary">
                  {results.time_taken_minutes}
                </div>
              </div>
              <div className="text-xs sm:text-sm text-gray-600 font-medium uppercase tracking-wide">
                Minutes
              </div>
            </Card>
            
            <Card variant="base" className="text-center p-3 sm:p-4">
              <div className="flex items-center justify-center mb-2">
                <Award className="w-5 h-5 sm:w-6 sm:h-6 text-secondary mr-2" />
                <div className={`text-xl sm:text-2xl lg:text-3xl font-bold ${getScoreColor(results.score)}`}>
                  {results.score}%
                </div>
              </div>
              <div className="text-xs sm:text-sm text-gray-600 font-medium uppercase tracking-wide">
                Score
              </div>
            </Card>
          </div>
        </Card>

        {/* Mobile-Optimized Detailed Results */}
        <Card variant="glass" className="mb-8">
          <CardHeader className="bg-secondary/10 p-4 sm:p-6">
            <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
              <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />
              <span>Question by Question Review</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
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
        <Card variant="glass" className="p-8 text-center">
          <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Lightbulb className="w-8 h-8 text-white" />
          </div>
          <H3 className="text-gray-900 mb-4">Tips for Improvement</H3>
          <BodyMD className="text-gray-700 mb-8">Enhance your learning journey with these proven strategies</BodyMD>
          
          <Grid cols={2} gap="lg" className="max-w-4xl mx-auto">
            <div className="text-left">
              <H4 className="text-secondary mb-4">Learning Strategies</H4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                  <Check className="w-4 h-4 text-success" />
                  <span className="text-gray-700">Review explanations carefully</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                  <Edit className="w-4 h-4 text-primary" />
                  <span className="text-gray-700">Take detailed notes</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                  <RefreshCw className="w-4 h-4 text-secondary" />
                  <span className="text-gray-700">Practice regularly</span>
                </div>
              </div>
            </div>
            
            <div className="text-left">
              <H4 className="text-secondary mb-4">Growth Actions</H4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                  <BookOpen className="w-4 h-4 text-warning" />
                  <span className="text-gray-700">Explore related courses</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span className="text-gray-700">Join study communities</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  <span className="text-gray-700">Create study schedule</span>
                </div>
              </div>
            </div>
          </Grid>
          
          {/* Mobile-Optimized Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mt-6 sm:mt-8">
            <Link
              href="/courses"
              className="bg-primary hover:bg-secondary text-white hover:text-black px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 transform hover:scale-105 text-center touch-manipulation min-h-[44px] flex items-center justify-center"
            >
              Browse Courses
            </Link>
            <Link
              href="/quizzes"
              className="bg-secondary hover:bg-primary text-black hover:text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 transform hover:scale-105 text-center touch-manipulation min-h-[44px] flex items-center justify-center"
            >
              More Quizzes
            </Link>
          </div>
        </Card>

      </Container>
    </Section>
  )
}
