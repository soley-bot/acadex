'use client'

import { logger } from '@/lib/logger'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getQuizResults } from '@/lib/database'
import { useAuth } from '@/contexts/AuthContext'
import SvgIcon from '@/components/ui/SvgIcon'

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
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
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
      <div className="min-h-screen bg-white">
        <div className="flex items-center justify-center py-20 pt-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading results...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !results) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-2xl mx-auto pt-32 text-center px-6">
          <h1 className="text-4xl font-black text-black mb-6">Results Not Found</h1>
          <p className="text-gray-600 mb-12 text-xl">{error || 'The quiz results could not be found.'}</p>
          <Link
            href="/quizzes"
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors inline-block"
          >
            Back to Quizzes
          </Link>
        </div>
      </div>
    )
  }

  const scoreMessage = getScoreMessage(results.score)

  return (
    <div className="min-h-screen bg-white">
      
      <div className="max-w-6xl mx-auto pt-28 pb-12 px-6">

        {/* Results Header */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-12 mb-12">
          <div className="text-center">
            <h1 className="text-4xl font-black text-black mb-4">Quiz Complete!</h1>
            <h2 className="text-xl text-gray-600 mb-8">{results.quiz_title}</h2>
            
            <div className={`text-6xl font-black mb-6 ${
              results.score >= 80 ? 'text-green-600' : 
              results.score >= 60 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {results.score}%
            </div>
            
            <p className="text-lg text-gray-600 mb-8 font-medium">{scoreMessage.message}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center bg-gray-50 rounded-xl p-6">
                <div className="text-3xl font-black text-black">{results.correct_answers}</div>
                <div className="text-sm font-bold text-gray-600 uppercase tracking-wide">Correct Answers</div>
              </div>
              <div className="text-center bg-gray-50 rounded-xl p-6">
                <div className="text-3xl font-black text-black">{results.total_questions}</div>
                <div className="text-sm font-bold text-gray-600 uppercase tracking-wide">Total Questions</div>
              </div>
              <div className="text-center bg-gray-50 rounded-xl p-6">
                <div className="text-3xl font-black text-black">{results.time_taken_minutes}</div>
                <div className="text-sm font-bold text-gray-600 uppercase tracking-wide">Minutes</div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Results */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-lg mb-12">
          <div className="p-8 border-b border-gray-200 bg-black rounded-t-2xl">
            <h2 className="text-3xl font-black text-white">Detailed Results</h2>
            <p className="text-gray-300 mt-2 text-lg">Review your answers and learn from explanations</p>
          </div>
          
          <div className="p-8">
            <div className="space-y-8">
              {results.answers.map((answer, index) => (
                <div
                  key={index}
                  className={`border-2 rounded-2xl p-8 ${
                    answer.is_correct 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-start gap-6 mb-6">
                    <span className={`text-3xl ${answer.is_correct ? 'text-green-600' : 'text-red-600'}`}>
                      {answer.is_correct ? '✓' : '✗'}
                    </span>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-black mb-6">
                        Question {index + 1}: {answer.question}
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-bold text-black">Your answer:</span>
                          <span className={`px-4 py-2 rounded-full text-sm font-bold border-2 ${
                            answer.is_correct 
                              ? 'bg-green-100 text-green-800 border-green-300' 
                              : 'bg-red-100 text-red-800 border-red-300'
                          }`}>
                            {answer.user_answer}
                          </span>
                        </div>
                        
                        {!answer.is_correct && (
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-bold text-black">Correct answer:</span>
                            <span className="px-4 py-2 rounded-full text-sm font-bold bg-green-100 text-green-800 border-2 border-green-300">
                              {answer.correct_answer}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {answer.explanation && (
                        <div className="mt-6 p-6 bg-blue-50 border-2 border-blue-200 rounded-xl">
                          <h4 className="font-bold text-blue-900 mb-3 text-base">💡 Explanation:</h4>
                          <p className="text-blue-800 leading-relaxed">{answer.explanation}</p>
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
        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
          <Link
            href={`/quizzes/${params.id}`}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors text-center shadow-lg hover:shadow-xl"
          >
            Retake Quiz
          </Link>
          <Link
            href="/quizzes"
            className="border-2 border-black text-black hover:bg-black hover:text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors text-center"
          >
            Browse More Quizzes
          </Link>
          <Link
            href="/dashboard"
            className="bg-black hover:bg-gray-800 text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors text-center"
          >
            View Dashboard
          </Link>
        </div>

        {/* Performance Tips */}
        <div className="bg-black rounded-2xl p-12 text-white shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-full mb-6 shadow-lg">
              <span className="text-white text-2xl">💡</span>
            </div>
            <h3 className="text-3xl font-black text-white mb-4">Tips for Improvement</h3>
            <p className="text-gray-300 text-lg font-light">Enhance your learning journey with these proven strategies</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <h4 className="font-bold text-red-400 text-sm uppercase tracking-wide">Learning Strategies</h4>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-6 bg-gray-900 rounded-xl border border-gray-800">
                  <span className="text-red-400 text-lg font-bold mt-1">📝</span>
                  <div>
                    <p className="text-white font-bold text-base">Review explanations carefully</p>
                    <p className="text-gray-400 text-sm">Focus on understanding why answers are correct</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-6 bg-gray-900 rounded-xl border border-gray-800">
                  <span className="text-red-400 text-lg font-bold mt-1">📚</span>
                  <div>
                    <p className="text-white font-bold text-base">Take detailed notes</p>
                    <p className="text-gray-400 text-sm">Document challenging topics for future review</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-6 bg-gray-900 rounded-xl border border-gray-800">
                  <span className="text-red-400 text-lg font-bold mt-1">🔄</span>
                  <div>
                    <p className="text-white font-bold text-base">Practice regularly</p>
                    <p className="text-gray-400 text-sm">Reinforce learning with similar quizzes</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <h4 className="font-bold text-red-400 text-sm uppercase tracking-wide">Growth Actions</h4>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-6 bg-gray-900 rounded-xl border border-gray-800">
                  <span className="text-red-400 text-lg font-bold mt-1">🎓</span>
                  <div>
                    <p className="text-white font-bold text-base">Explore related courses</p>
                    <p className="text-gray-400 text-sm">Deepen knowledge with structured learning</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-6 bg-gray-900 rounded-xl border border-gray-800">
                  <span className="text-red-400 text-lg font-bold mt-1">👥</span>
                  <div>
                    <p className="text-white font-bold text-base">Join study communities</p>
                    <p className="text-gray-400 text-sm">Connect with other learners for support</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-6 bg-gray-900 rounded-xl border border-gray-800">
                  <span className="text-red-400 text-lg font-bold mt-1">📅</span>
                  <div>
                    <p className="text-white font-bold text-base">Create study schedule</p>
                    <p className="text-gray-400 text-sm">Set consistent practice routines</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-10 pt-8 border-t border-gray-800">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/courses"
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors text-center shadow-lg hover:shadow-xl"
              >
                Browse Courses
              </Link>
              <Link
                href="/quizzes"
                className="border-2 border-white text-white hover:bg-white hover:text-black px-8 py-4 rounded-lg font-bold text-lg transition-colors text-center"
              >
                More Quizzes
              </Link>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
