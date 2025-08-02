'use client'

import { logger } from '@/lib/logger'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getQuizById } from '@/lib/database'
import { useAuth } from '@/contexts/AuthContext'

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
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center py-20 pt-32">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600"></div>
        </div>
      </div>
    )
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container-content pt-32 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Quiz Not Found</h1>
          <p className="text-gray-600 mb-12 text-xl">{error || 'The quiz you are looking for does not exist.'}</p>
          <Link
            href="/quizzes"
            className="btn-default inline-block text-lg px-8 py-4"
          >
            Back to Quizzes
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="container-content pt-28 pb-12">
        {/* Debug Information */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 mb-8">
            <h3 className="text-sm font-semibold text-warning mb-2">Debug Info:</h3>
            <div className="text-xs text-warning/80">
              <p>User: {user ? `${user.email} (${user.id})` : 'Not logged in'}</p>
              <p>Quiz ID: {quiz?.id}</p>
              <p>Quiz Title: {quiz?.title}</p>
            </div>
          </div>
        )}

        {/* Quiz Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-8 text-white mb-8">
          <div className="flex items-center gap-4 mb-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white`}>
              {quiz.difficulty}
            </span>
            <span className="text-primary-50 text-base">{quiz.category}</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">{quiz.title}</h1>
          
          <div className="flex items-center gap-6 text-primary-50 mb-6 text-base">
            <div className="flex items-center gap-2">
              <span>{quiz.question_count} questions</span>
            </div>
            <div className="flex items-center gap-2">
              <span>{quiz.duration_minutes} minutes</span>
            </div>
          </div>
          
          <p className="text-base text-primary-50 leading-relaxed max-w-2xl">{quiz.description}</p>
        </div>

        {/* Quiz Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Quiz Info */}
          <div className="card-elevated p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quiz Details</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Difficulty:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(quiz.difficulty)}`}>
                  {quiz.difficulty}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Category:</span>
                <span className="font-medium text-gray-900 text-sm">{quiz.category}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Questions:</span>
                <span className="font-medium text-gray-900 text-sm">{quiz.question_count}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Time Limit:</span>
                <span className="font-medium text-gray-900 text-sm">{quiz.duration_minutes} minutes</span>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="card-elevated p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Instructions</h2>
            <ul className="space-y-3 text-gray-600 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Read each question carefully before answering</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>You have {quiz.duration_minutes} minutes to complete the quiz</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>You can navigate between questions during the quiz</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Submit your answers before time runs out</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Your results will be available immediately</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Quiz Tips */}
        <div className="bg-warning/10 border border-warning/20 rounded-xl p-8 mb-12">
          <h3 className="text-2xl font-semibold text-warning-foreground mb-6">💡 Tips for Success</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-warning-foreground">
            <div>
              <h4 className="font-semibold mb-4 text-lg">Before Starting:</h4>
              <ul className="text-base space-y-2">
                <li>• Find a quiet environment</li>
                <li>• Ensure stable internet connection</li>
                <li>• Have scratch paper ready if needed</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-lg">During the Quiz:</h4>
              <ul className="text-base space-y-2">
                <li>• Read questions thoroughly</li>
                <li>• Manage your time wisely</li>
                <li>• Review answers before submitting</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleStartQuiz}
            className="btn-default text-base px-8 py-3 font-medium"
          >
            Start Quiz
          </button>
          <Link
            href="/quizzes"
            className="btn-secondary text-base px-8 py-3 font-medium text-center"
          >
            Back to Quizzes
          </Link>
        </div>
      </div>

    </div>
  )
}
