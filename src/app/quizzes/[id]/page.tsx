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
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
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
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
        
        <Section spacing="lg" className="pt-24 px-6 lg:px-8 overflow-hidden">
          <Container size="md" className="text-center">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-full text-sm lg:text-base font-medium mb-8 shadow-lg">
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
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
        
        <Section spacing="lg" className="pt-24 px-6 lg:px-8">
          <Container size="md" className="text-center">
            <div className="bg-white/80 backdrop-blur-lg border border-red-200 rounded-2xl p-12 max-w-md mx-auto shadow-xl">
              <H1 className="mb-6 text-red-600">Quiz Not Found</H1>
              <BodyLG color="muted" className="mb-8">{error || 'The quiz you are looking for does not exist.'}</BodyLG>
              <Link
                href="/quizzes"
                className="inline-block px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
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
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Hero Section */}
      <Section spacing="lg" className="pt-24 text-center px-6">
        <Container size="md">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-full text-sm lg:text-base font-medium mb-8 shadow-lg">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            Quiz Details
          </div>
          <H1 className="mb-6 text-red-600">{quiz.title}</H1>
          <BodyLG color="muted" className="max-w-2xl mx-auto leading-relaxed">
            {quiz.description}
          </BodyLG>
        </Container>
      </Section>

      {/* Main Content */}
      <Section spacing="lg" className="px-6 lg:px-8">
        <Container size="xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {/* Quiz Details */}
            <div className="group">
              <div className="p-8 rounded-3xl backdrop-blur-lg bg-white/80 border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                    <Icon name="chart" size={24} color="white" />
                  </div>
                  <H2>Quiz Details</H2>
                </div>
              
              <div className="space-y-6">
                <div className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-r from-red-50 to-red-50/50 border border-red-100">
                  <BodyMD color="muted" className="font-medium">Difficulty:</BodyMD>
                  <span className={`px-4 py-2 rounded-full text-sm font-bold ${getDifficultyColor(quiz.difficulty)} shadow-lg`}>
                    {quiz.difficulty}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-r from-blue-50 to-blue-50/50 border border-blue-100">
                  <BodyMD color="muted" className="font-medium">Category:</BodyMD>
                  <span className="font-bold text-gray-600 bg-white px-4 py-2 rounded-full shadow-md">{quiz.category}</span>
                </div>
                <div className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-r from-green-50 to-green-50/50 border border-green-100">
                  <BodyMD color="muted" className="font-medium">Questions:</BodyMD>
                  <span className="font-bold text-gray-600 bg-white px-4 py-2 rounded-full shadow-md">{quiz.question_count}</span>
                </div>
                <div className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-r from-orange-50 to-orange-50/50 border border-orange-100">
                  <BodyMD color="muted" className="font-medium">Time Limit:</BodyMD>
                  <span className="font-bold text-gray-600 bg-white px-4 py-2 rounded-full shadow-md">{quiz.duration_minutes} minutes</span>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="group">
            <div className="p-8 rounded-3xl backdrop-blur-lg bg-white/80 border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Icon name="edit" size={24} color="white" />
                </div>
                <H2>Instructions</H2>
              </div>
              
              <ul className="space-y-4">
                {[
                  "Read each question carefully before answering",
                  `You have ${quiz.duration_minutes} minutes to complete the quiz`,
                  "You can navigate between questions during the quiz",
                  "Submit your answers before time runs out",
                  "Your results will be available immediately"
                ].map((instruction, index) => (
                  <li key={index} className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-blue-50/50 border border-blue-100 hover:shadow-md transition-all duration-300">
                    <span className="w-6 h-6 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                      {index + 1}
                    </span>
                    <BodyMD color="muted" className="font-medium">{instruction}</BodyMD>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Quiz Tips */}
        <div className="mb-16">
          <div className="p-10 rounded-3xl backdrop-blur-lg bg-gradient-to-r from-yellow-100/80 to-orange-100/80 border border-yellow-200/50 shadow-2xl">
            <div className="text-center mb-8">
              <div className="inline-block p-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl mb-4">
                <Icon name="lightbulb" size={32} color="white" />
              </div>
              <H3 className="text-center">Tips for Success</H3>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/30">
                <H4 className="mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center">
                    <Icon name="file" size={16} color="white" />
                  </span>
                  Before Starting:
                </H4>
                <ul className="space-y-3">
                  {["Find a quiet environment", "Ensure stable internet connection", "Have scratch paper ready if needed"].map((tip, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <span className="w-2 h-2 bg-gradient-to-r from-green-400 to-blue-400 rounded-full"></span>
                      <BodyMD color="muted" className="font-medium">{tip}</BodyMD>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/30">
                <h4 className="font-bold mb-6 text-xl text-gray-800 flex items-center gap-2">
                  <span className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                    <Icon name="lightning" size={16} color="white" />
                  </span>
                  During the Quiz:
                </h4>
                <ul className="space-y-3">
                  {["Read questions thoroughly", "Manage your time wisely", "Review answers before submitting"].map((tip, index) => (
                    <li key={index} className="flex items-center gap-3 text-gray-700">
                      <span className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></span>
                      <span className="font-medium">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="text-center">
          <div className="inline-flex flex-col sm:flex-row gap-6">
            <button
              onClick={handleStartQuiz}
              className="group relative px-12 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white text-xl font-bold rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-700 to-red-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative flex items-center gap-3">
                <Icon name="rocket" size={24} color="white" />
                Start Quiz
              </span>
            </button>
            
            <Link
              href="/quizzes"
              className="group relative px-12 py-4 bg-white/80 backdrop-blur-lg text-gray-600 text-xl font-bold rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 border border-white/30"
            >
              <span className="relative flex items-center gap-3">
                <Icon name="arrow-left" size={24} color="current" />
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
