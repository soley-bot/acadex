'use client'

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
          console.error('Error fetching quiz:', fetchError)
        } else {
          setQuiz(data)
        }
      } catch (err) {
        console.error('Error fetching quiz:', err)
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
      console.log('No user found, redirecting to login')
      router.push('/login')
      return
    }
    console.log('Starting quiz:', params.id)
    router.push(`/quizzes/${params.id}/take`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex items-center justify-center py-20 pt-24">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 py-20 pt-24 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Quiz Not Found</h1>
          <p className="text-gray-600 mb-8">{error || 'The quiz you are looking for does not exist.'}</p>
          <Link
            href="/quizzes"
            className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-black transition-colors inline-block"
          >
            Back to Quizzes
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      
      <div className="max-w-4xl mx-auto px-4 py-8 pt-24">
        {/* Debug Information */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-yellow-800 mb-2">Debug Info:</h3>
            <div className="text-xs text-yellow-700">
              <p>User: {user ? `${user.email} (${user.id})` : 'Not logged in'}</p>
              <p>Quiz ID: {quiz?.id}</p>
              <p>Quiz Title: {quiz?.title}</p>
            </div>
          </div>
        )}

        {/* Quiz Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-8">
          <div className="flex items-center gap-4 mb-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white`}>
              {quiz.difficulty}
            </span>
            <span className="text-blue-100">{quiz.category}</span>
          </div>
          
          <h1 className="text-4xl font-bold mb-4">{quiz.title}</h1>
          
          <div className="flex items-center gap-6 text-blue-100 mb-6">
            <div className="flex items-center gap-2">
              <span>{quiz.question_count} questions</span>
            </div>
            <div className="flex items-center gap-2">
              <span>{quiz.duration_minutes} minutes</span>
            </div>
          </div>
          
          <p className="text-lg text-blue-100 leading-relaxed">{quiz.description}</p>
        </div>

        {/* Quiz Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Quiz Info */}
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Quiz Details</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Difficulty:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(quiz.difficulty)}`}>
                  {quiz.difficulty}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Category:</span>
                <span className="font-medium text-gray-900">{quiz.category}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Questions:</span>
                <span className="font-medium text-gray-900">{quiz.question_count}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Time Limit:</span>
                <span className="font-medium text-gray-900">{quiz.duration_minutes} minutes</span>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Instructions</h2>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Read each question carefully before answering</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>You have {quiz.duration_minutes} minutes to complete the quiz</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>You can navigate between questions during the quiz</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Submit your answers before time runs out</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Your results will be available immediately</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Quiz Tips */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-yellow-800 mb-3">💡 Tips for Success</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-yellow-700">
            <div>
              <h4 className="font-medium mb-2">Before Starting:</h4>
              <ul className="text-sm space-y-1">
                <li>• Find a quiet environment</li>
                <li>• Ensure stable internet connection</li>
                <li>• Have scratch paper ready if needed</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">During the Quiz:</h4>
              <ul className="text-sm space-y-1">
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
            className="bg-gray-900 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-black transition-colors"
          >
            Start Quiz
          </button>
          <Link
            href="/quizzes"
            className="bg-gray-100 text-gray-700 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-200 transition-colors text-center"
          >
            Back to Quizzes
          </Link>
        </div>
      </div>

    </div>
  )
}
