'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { quizAPI } from '@/lib/api'
const { getUserQuizAttempts: getQuizResults } = quizAPI
import { useAuth } from '@/contexts/AuthContext'
import { H1, H2, H3, H4, BodyLG, BodyMD } from '@/components/ui/Typography'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Icon from '@/components/ui/Icon'
import { Container, Section, Grid, Flex } from '@/components/ui/Layout'
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
        const response = await getQuizResults(params.resultId as string)
        
        if (response.error) {
          setError('Failed to load quiz results')
          logger.error('Error fetching quiz results:', response.error)
        } else {
          const resultData = Array.isArray(response.data) ? response.data[0] : response.data?.data?.[0] || null
          setResults(resultData)
        }
      } catch (err: any) {
        logger.error('Error fetching quiz results', { error: err?.message || 'Unknown error' })
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
      <Section className="min-h-screen relative overflow-hidden" background="accent">
        <Container className="relative flex items-center justify-center py-20">
          <Card variant="elevated" className="text-center p-12">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary mx-auto mb-6"></div>
            <BodyLG className="text-gray-700 font-medium">Loading results...</BodyLG>
          </Card>
        </Container>
      </Section>
    )
  }

  if (error || !results) {
    return (
      <Section className="min-h-screen relative overflow-hidden" background="accent">
        <Container className="relative max-w-2xl pt-32 text-center">
          <Card variant="elevated" className="p-12">
            <div className="inline-block p-4 bg-destructive rounded-2xl mb-6">
              <Icon name="warning" size={32} color="white" />
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
    <Section className="min-h-screen relative overflow-hidden" background="accent">
      <Container className="relative max-w-6xl pt-20 pb-12">

        {/* Results Header */}
        <Card variant="elevated" className="text-center p-8 mb-8">
          <div className="inline-block p-4 bg-success rounded-2xl mb-6">
            <Icon name="check" size={32} color="white" />
          </div>
          <H1 className="text-gray-900 mb-3">Quiz Complete!</H1>
          <H3 className="text-gray-700 mb-8">{results.quiz_title}</H3>
          
          <div className={`text-6xl font-bold mb-4 ${getScoreColor(results.score)}`}>
            {results.score}%
          </div>
          <BodyLG className="text-gray-700 mb-8">{scoreMessage.message}</BodyLG>
          
          {/* Stats Grid */}
          <Grid cols={3} className="max-w-3xl mx-auto">
            <Card variant="default" className="text-center p-6">
              <div className="text-3xl font-bold text-success mb-2">
                {results.correct_answers}
              </div>
              <BodyMD className="text-gray-600 font-medium uppercase tracking-wide">Correct Answers</BodyMD>
            </Card>
            <Card variant="default" className="text-center p-6">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {results.total_questions}
              </div>
              <BodyMD className="text-gray-600 font-medium uppercase tracking-wide">Total Questions</BodyMD>
            </Card>
            <Card variant="default" className="text-center p-6">
              <div className="text-3xl font-bold text-secondary mb-2">
                {results.time_taken_minutes}
              </div>
              <BodyMD className="text-gray-600 font-medium uppercase tracking-wide">Minutes</BodyMD>
            </Card>
          </Grid>
        </Card>

        {/* Detailed Results */}
        <Card variant="elevated" className="mb-8">
          <CardHeader className="bg-secondary/10">
            <CardTitle className="flex items-center gap-3">
              <Icon name="chart" size={24} color="current" />
              <span>Detailed Results</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-6">
              {results.answers.map((answer, index) => (
                <Card
                  key={index}
                  variant="default"
                  className={`p-6 border-2 ${
                    answer.is_correct 
                      ? 'border-green-300 bg-green-50/50' 
                      : 'border-red-300 bg-red-50/50'
                  }`}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      answer.is_correct 
                        ? 'bg-success text-white' 
                        : 'bg-destructive text-white'
                    }`}>
                      <Icon 
                        name={answer.is_correct ? "check" : "warning"} 
                        size={20} 
                        color="white" 
                      />
                    </div>
                    <div className="flex-1">
                      <H4 className="text-gray-900 mb-2">Question {index + 1}</H4>
                      <BodyMD className="text-gray-700 mb-3">{answer.question}</BodyMD>
                      
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm font-medium text-gray-600">Your answer: </span>
                          <span className={`font-medium ${answer.is_correct ? 'text-success' : 'text-destructive'}`}>
                            {answer.user_answer}
                          </span>
                        </div>
                        
                        {!answer.is_correct && (
                          <div>
                            <span className="text-sm font-medium text-gray-600">Correct answer: </span>
                            <span className="font-medium text-success">{answer.correct_answer}</span>
                          </div>
                        )}
                        
                        {answer.explanation && (
                          <div className="mt-3 p-3 bg-secondary/10 rounded-lg">
                            <span className="text-sm font-medium text-gray-600">Explanation: </span>
                            <span className="text-gray-700">{answer.explanation}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tips for Improvement */}
        <Card variant="elevated" className="p-8 text-center">
          <div className="inline-block p-4 bg-secondary rounded-2xl mb-6">
            <Icon name="lightbulb" size={32} color="white" />
          </div>
          <H3 className="text-gray-900 mb-4">Tips for Improvement</H3>
          <BodyMD className="text-gray-700 mb-8">Enhance your learning journey with these proven strategies</BodyMD>
          
          <Grid cols={2} className="max-w-4xl mx-auto">
            <div className="text-left">
              <H4 className="text-secondary mb-4">Learning Strategies</H4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                  <Icon name="check" size={16} color="success" />
                  <span className="text-gray-700">Review explanations carefully</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                  <Icon name="edit" size={16} color="primary" />
                  <span className="text-gray-700">Take detailed notes</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                  <Icon name="refresh" size={16} color="secondary" />
                  <span className="text-gray-700">Practice regularly</span>
                </div>
              </div>
            </div>
            
            <div className="text-left">
              <H4 className="text-secondary mb-4">Growth Actions</H4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                  <Icon name="book" size={16} color="warning" />
                  <span className="text-gray-700">Explore related courses</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                  <Icon name="users" size={16} color="primary" />
                  <span className="text-gray-700">Join study communities</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                  <Icon name="calendar" size={16} color="secondary" />
                  <span className="text-gray-700">Create study schedule</span>
                </div>
              </div>
            </div>
          </Grid>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link
              href="/courses"
              className="bg-primary hover:bg-secondary text-black hover:text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
            >
              Browse Courses
            </Link>
            <Link
              href="/quizzes"
              className="bg-secondary hover:bg-primary text-white hover:text-black px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
            >
              More Quizzes
            </Link>
          </div>
        </Card>

      </Container>
    </Section>
  )
}
