'use client'

import { logger } from '@/lib/logger'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getQuizById } from '@/lib/database'
import { useAuth } from '@/contexts/AuthContext'
import { H1, H2, H3, H4, BodyLG, BodyMD } from '@/components/ui/Typography'
import { Container, Section } from '@/components/ui/Layout'
import Icon from '@/components/ui/Icon'

interface Quiz {
  id: string
  title: string
  description: string
  category: string
  difficulty: string
  duration_minutes: number
  is_published: boolean
  created_at: string
  question_count: number
}

export default function QuizPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true)
        const { data, error: fetchError } = await getQuizById(params.id as string)
        
        if (fetchError) {
          setError('Failed to load quiz')
          logger.error('Error fetching quiz:', fetchError)
        } else {
          setQuiz(data)
        }
      } catch (err) {
        logger.error('Error fetching quiz:', err)
        setError('Failed to load quiz')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchQuiz()
    }
  }, [params.id])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'hard':
        return 'bg-destructive/20 text-red-800'
      default:
        return 'bg-muted/40 text-gray-800'
    }
  }

  const handleStartQuiz = () => {
    if (!user) {
      logger.debug('No user found, redirecting to login')
      router.push('/auth/login')
      return
    }
    logger.debug('Starting quiz:', params.id)
    router.push(`/quizzes/${params.id}/take`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-secondary/10 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-warning/40 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-secondary/40 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
        
        <Section spacing="lg" className="pt-24 px-6 lg:px-8 overflow-hidden">
          <Container size="md" className="text-center">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary/90 text-gray-900 px-6 py-3 rounded-full text-sm lg:text-base font-medium mb-8 shadow-lg">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              Quiz Loading
            </div>
            <H1 className="mb-8">Loading Quiz...</H1>
            <div className="mt-8">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-200 border-t-red-600 mx-auto"></div>
            </div>
          </Container>
        </Section>
      </div>
    )
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-secondary/10 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-warning/40 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-secondary/40 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
        
        <Section spacing="lg" className="pt-24 px-6 lg:px-8">
          <Container size="md" className="text-center">
            <div className="bg-white/80 backdrop-blur-lg border border-red-200 rounded-2xl p-12 max-w-md mx-auto shadow-xl">
              <H1 className="mb-6 text-primary">Quiz Not Found</H1>
              <BodyLG color="muted" className="mb-8">{error || 'The quiz you are looking for does not exist.'}</BodyLG>
              <Link
                href="/quizzes"
                className="inline-block px-8 py-4 bg-gradient-to-r from-primary to-primary/90 text-gray-900 font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
              >
                Back to Quizzes
              </Link>
            </div>
          </Container>
        </Section>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-secondary/10 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-warning/40 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-secondary/40 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Streamlined Quiz Start */}
      <Section spacing="lg" className="pt-24 px-6 lg:px-8">
        <Container size="lg">
          {/* Quiz Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary/90 text-gray-900 px-6 py-3 rounded-full text-sm lg:text-base font-medium mb-6 shadow-lg">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              Ready to Start
            </div>
            <H1 className="mb-4 text-primary">{quiz.title}</H1>
            <BodyLG color="muted" className="max-w-2xl mx-auto">
              {quiz.description}
            </BodyLG>
          </div>

          {/* Quick Info Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12 max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-xl text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-secondary to-secondary/90 rounded-xl mx-auto mb-3 flex items-center justify-center">
                <Icon name="clock" size={20} color="white" />
              </div>
              <BodyMD className="font-bold text-gray-800">{quiz.duration_minutes} min</BodyMD>
              <BodyMD color="muted" className="text-sm">Time Limit</BodyMD>
            </div>

            <div className="bg-white/80 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-xl text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-success to-success/90 rounded-xl mx-auto mb-3 flex items-center justify-center">
                <Icon name="help" size={20} color="white" />
              </div>
              <BodyMD className="font-bold text-gray-800">{quiz.question_count}</BodyMD>
              <BodyMD color="muted" className="text-sm">Questions</BodyMD>
            </div>

            <div className="bg-white/80 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-xl text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-warning to-secondary rounded-xl mx-auto mb-3 flex items-center justify-center">
                <Icon name="target" size={20} color="white" />
              </div>
              <BodyMD className={`font-bold px-3 py-1 rounded-full text-sm ${getDifficultyColor(quiz.difficulty)}`}>
                {quiz.difficulty}
              </BodyMD>
              <BodyMD color="muted" className="text-sm mt-1">Difficulty</BodyMD>
            </div>

            <div className="bg-white/80 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-xl text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-secondary to-secondary/90 rounded-xl mx-auto mb-3 flex items-center justify-center">
                <Icon name="book" size={20} color="white" />
              </div>
              <BodyMD className="font-bold text-gray-800">{quiz.category}</BodyMD>
              <BodyMD color="muted" className="text-sm">Category</BodyMD>
            </div>
          </div>

          {/* Key Instructions */}
          <div className="bg-white/80 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-xl max-w-3xl mx-auto mb-12">
            <div className="flex items-center gap-3 mb-6 justify-center">
              <div className="w-10 h-10 bg-gradient-to-r from-secondary to-secondary/90 rounded-xl flex items-center justify-center">
                <Icon name="info" size={20} color="white" />
              </div>
              <H3>Quick Instructions</H3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-xl bg-blue-50 border border-blue-100">
                <Icon name="clock" size={24} color="primary" className="mx-auto mb-2" />
                <BodyMD className="font-semibold text-gray-800">Time Management</BodyMD>
                <BodyMD color="muted" className="text-sm">{quiz.duration_minutes} minutes total</BodyMD>
              </div>
              <div className="text-center p-4 rounded-xl bg-green-50 border border-green-100">
                <Icon name="map" size={24} color="success" className="mx-auto mb-2" />
                <BodyMD className="font-semibold text-gray-800">Navigation</BodyMD>
                <BodyMD color="muted" className="text-sm">Move between questions freely</BodyMD>
              </div>
              <div className="text-center p-4 rounded-xl bg-orange-50 border border-orange-100">
                <Icon name="check" size={24} color="warning" className="mx-auto mb-2" />
                <BodyMD className="font-semibold text-gray-800">Submission</BodyMD>
                <BodyMD color="muted" className="text-sm">Review before final submit</BodyMD>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="text-center">
            <div className="inline-flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleStartQuiz}
                className="group relative px-16 py-5 bg-gradient-to-r from-primary to-primary/90 text-gray-900 text-2xl font-bold rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative flex items-center gap-4">
                  <Icon name="play" size={28} color="white" />
                  Start Quiz Now
                </span>
              </button>
              
              <Link
                href="/quizzes"
                className="group px-12 py-5 bg-white/80 backdrop-blur-lg text-gray-600 text-xl font-semibold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border border-white/30"
              >
                <span className="flex items-center gap-3">
                  <Icon name="arrow-left" size={20} color="current" />
                  Back to Quizzes
                </span>
              </Link>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  )
}
