'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getQuizResults } from '@/lib/database'
import { useAuth } from '@/contexts/AuthContext'

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
      router.push('/login')
      return
    }

    const fetchResults = async () => {
      try {
        setLoading(true)
        const { data, error: fetchError } = await getQuizResults(params.resultId as string)
        
        if (fetchError) {
          setError('Failed to load quiz results')
          console.error('Error fetching quiz results:', fetchError)
        } else {
          setResults(data)
        }
      } catch (err) {
        console.error('Error fetching quiz results:', err)
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
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreMessage = (score: number) => {
    if (score >= 90) return { emoji: '🎉', message: 'Excellent work! You mastered this topic!' }
    if (score >= 80) return { emoji: '✨', message: 'Great job! You have a solid understanding!' }
    if (score >= 70) return { emoji: '👍', message: 'Good work! Keep practicing to improve!' }
    if (score >= 60) return { emoji: '📚', message: 'Not bad! Review the topics and try again!' }
    return { emoji: '💪', message: 'Keep learning! Practice makes perfect!' }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (error || !results) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Results Not Found</h1>
          <p className="text-gray-600 mb-8">{error || 'The quiz results could not be found.'}</p>
          <Link
            href="/quizzes"
            className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-black transition-colors"
          >
            Back to Quizzes
          </Link>
        </div>
      </div>
    )
  }

  const scoreMessage = getScoreMessage(results.score)

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Results Header */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          <div className="text-center">
            <div className="text-6xl mb-4">{scoreMessage.emoji}</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Complete!</h1>
            <h2 className="text-xl text-gray-600 mb-6">{results.quiz_title}</h2>
            
            <div className={`text-6xl font-bold mb-4 ${getScoreColor(results.score)}`}>
              {results.score}%
            </div>
            
            <p className="text-lg text-gray-700 mb-6">{scoreMessage.message}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{results.correct_answers}</div>
                <div className="text-sm text-gray-600">Correct Answers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{results.total_questions}</div>
                <div className="text-sm text-gray-600">Total Questions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{results.time_taken_minutes}</div>
                <div className="text-sm text-gray-600">Minutes</div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Results */}
        <div className="bg-white rounded-lg shadow-sm border mb-8">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-900">Detailed Results</h2>
            <p className="text-gray-600 mt-1">Review your answers and learn from explanations</p>
          </div>
          
          <div className="p-6">
            <div className="space-y-6">
              {results.answers.map((answer, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-6 ${
                    answer.is_correct ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-start gap-3 mb-4">
                    <span className={`text-2xl ${answer.is_correct ? 'text-green-600' : 'text-red-600'}`}>
                      {answer.is_correct ? '✅' : '❌'}
                    </span>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Question {index + 1}: {answer.question}
                      </h3>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-600">Your answer:</span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            answer.is_correct 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {answer.user_answer}
                          </span>
                        </div>
                        
                        {!answer.is_correct && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-600">Correct answer:</span>
                            <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                              {answer.correct_answer}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {answer.explanation && (
                        <div className="mt-4 p-4 bg-white rounded-lg border">
                          <h4 className="font-medium text-gray-900 mb-2">💡 Explanation:</h4>
                          <p className="text-gray-700 text-sm">{answer.explanation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href={`/quizzes/${params.id}`}
            className="bg-gray-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-black transition-colors text-center"
          >
            Retake Quiz
          </Link>
          <Link
            href="/quizzes"
            className="bg-gray-100 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-center"
          >
            Browse More Quizzes
          </Link>
          <Link
            href="/dashboard"
            className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors text-center"
          >
            View Dashboard
          </Link>
        </div>

        {/* Performance Tips */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Tips for Improvement</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-800">
            <ul className="space-y-2 text-sm">
              <li>• Review the explanations for incorrect answers</li>
              <li>• Take notes on topics you found challenging</li>
              <li>• Practice similar quizzes to reinforce learning</li>
            </ul>
            <ul className="space-y-2 text-sm">
              <li>• Consider enrolling in related courses</li>
              <li>• Join study groups or discussion forums</li>
              <li>• Set regular practice schedules</li>
            </ul>
          </div>
        </div>
      </div>

    </div>
  )
}
