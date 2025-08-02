'use client'

import { logger } from '@/lib/logger'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getQuizResults } from '@/lib/database'
import { useAuth } from '@/contexts/AuthContext'
import { H1, H2, H3, H4, BodyLG, BodyMD } from '@/components/ui/Typography'
import Icon from '@/components/ui/Icon'
import { Container, Section, Grid, Flex } from '@/components/ui/Layout'

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
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="relative flex items-center justify-center py-20 pt-32">
          <div className="text-center p-12 rounded-3xl backdrop-blur-lg bg-white/80 border border-white/20 shadow-2xl">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-200 border-t-red-600 mx-auto mb-6"></div>
            <p className="text-gray-700 text-xl font-medium">Loading results...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="relative max-w-2xl mx-auto pt-32 text-center px-6">
          <div className="p-12 rounded-3xl backdrop-blur-lg bg-white/80 border border-white/20 shadow-2xl">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-6">Results Not Found</h1>
            <p className="text-gray-700 mb-12 text-xl leading-relaxed">{error || 'The quiz results could not be found.'}</p>
            <Link
              href="/quizzes"
              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105 inline-block"
            >
              Back to Quizzes
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const scoreMessage = getScoreMessage(results.score)

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="relative max-w-6xl mx-auto pt-20 sm:pt-28 pb-12 px-4 sm:px-6">

        {/* Results Header */}
        <div className="p-6 sm:p-12 mb-8 sm:mb-12 rounded-3xl backdrop-blur-lg bg-white/80 border border-white/20 shadow-2xl">
          <div className="text-center">
            <div className="inline-block p-3 sm:p-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl mb-4 sm:mb-6">
              <Icon name="celebration" size={32} color="white" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-2 sm:mb-4">Quiz Complete!</h1>
            <h2 className="text-lg sm:text-xl text-gray-700 mb-6 sm:mb-8 font-medium px-4">{results.quiz_title}</h2>
            
            <div className={`text-5xl sm:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 ${
              results.score >= 80 ? 'bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent' : 
              results.score >= 60 ? 'bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent' : 
              'bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent'
            }`}>
              {results.score}%
            </div>
            
            <p className="text-base sm:text-lg text-gray-700 mb-6 sm:mb-8 font-medium leading-relaxed px-4">{scoreMessage.message}</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto">
              <div className="text-center p-4 sm:p-6 rounded-2xl backdrop-blur-lg bg-white/60 border border-white/30 shadow-lg">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-1 sm:mb-2">
                  {results.correct_answers}
                </div>
                <div className="text-xs sm:text-sm font-bold text-gray-600 uppercase tracking-wide">Correct Answers</div>
              </div>
              <div className="text-center p-4 sm:p-6 rounded-2xl backdrop-blur-lg bg-white/60 border border-white/30 shadow-lg">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1 sm:mb-2">
                  {results.total_questions}
                </div>
                <div className="text-xs sm:text-sm font-bold text-gray-600 uppercase tracking-wide">Total Questions</div>
              </div>
              <div className="text-center p-4 sm:p-6 rounded-2xl backdrop-blur-lg bg-white/60 border border-white/30 shadow-lg">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-1 sm:mb-2">
                  {results.time_taken_minutes}
                </div>
                <div className="text-xs sm:text-sm font-bold text-gray-600 uppercase tracking-wide">Minutes</div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Results */}
        <div className="rounded-3xl backdrop-blur-lg bg-white/80 border border-white/20 shadow-2xl mb-12 overflow-hidden">
          <div className="p-4 sm:p-8 bg-gradient-to-r from-red-600 to-orange-600">
            <h2 className="text-xl sm:text-3xl font-bold text-white flex items-center gap-2 sm:gap-3">
              <Icon name="chart" size={24} color="white" />
              Detailed Results
            </h2>
            <p className="text-red-100 mt-1 sm:mt-2 text-sm sm:text-lg">Review your answers and learn from explanations</p>
          </div>
          
          <div className="p-4 sm:p-8">
            <div className="space-y-6 sm:space-y-8">
              {results.answers.map((answer, index) => (
                <div
                  key={index}
                  className={`border-2 rounded-2xl p-4 sm:p-8 backdrop-blur-sm ${
                    answer.is_correct 
                      ? 'border-green-300 bg-gradient-to-r from-green-50/80 to-emerald-50/80 shadow-lg' 
                      : 'border-red-300 bg-gradient-to-r from-red-50/80 to-pink-50/80 shadow-lg'
                  } transition-all duration-300 hover:shadow-xl hover:scale-102`}
                >
                  <div className="flex items-start gap-3 sm:gap-6 mb-4 sm:mb-6">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-lg flex-shrink-0 ${
                      answer.is_correct 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                        : 'bg-gradient-to-r from-red-500 to-pink-500'
                    }`}>
                      <Icon 
                        name={answer.is_correct ? "check" : "close"} 
                        size={20} 
                        color="white" 
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6 leading-relaxed break-words">
                        Question {index + 1}: {answer.question}
                      </h3>
                      
                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex flex-col gap-2 sm:gap-4">
                          <span className="text-xs sm:text-sm font-bold text-gray-700">Your answer:</span>
                          <span className={`px-3 py-2 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold border-2 block w-fit max-w-full break-words ${
                            answer.is_correct 
                              ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300' 
                              : 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-red-300'
                          }`}>
                            {answer.user_answer}
                          </span>
                        </div>
                        
                        {!answer.is_correct && (
                          <div className="flex flex-col gap-2 sm:gap-4">
                            <span className="text-xs sm:text-sm font-bold text-gray-700">Correct answer:</span>
                            <span className="px-3 py-2 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-2 border-green-300 block w-fit max-w-full break-words">
                              {answer.correct_answer}
                            </span>
                          </div>
                        )}
                      </div>
                      
                    </div>
                  </div>
                  
                  {answer.explanation && (
                    <div className="mt-4 sm:mt-6 p-4 sm:p-6 rounded-2xl backdrop-blur-sm bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border-2 border-blue-200 shadow-lg">
                      <h4 className="font-bold text-blue-900 mb-2 sm:mb-3 text-sm sm:text-base flex items-center gap-2">
                        <Icon name="lightbulb" size={16} color="primary" />
                        Explanation:
                      </h4>
                      <p className="text-blue-800 leading-relaxed text-sm sm:text-base break-words">{answer.explanation}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-4 sm:gap-6 justify-center mb-8 sm:mb-12 px-4 sm:px-0">
          <Link
            href={`/quizzes/${params.id}`}
            className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-2xl font-bold text-base sm:text-lg transition-all duration-300 text-center shadow-2xl hover:shadow-3xl transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <Icon name="refresh" size={18} color="white" />
            Retake Quiz
          </Link>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            <Link
              href="/quizzes"
              className="backdrop-blur-lg bg-white/80 border-2 border-gray-300 text-gray-800 hover:bg-white hover:border-gray-400 px-6 py-3 sm:px-8 sm:py-4 rounded-2xl font-bold text-base sm:text-lg transition-all duration-300 text-center shadow-lg hover:shadow-xl flex items-center justify-center gap-2 flex-1"
            >
              <Icon name="book" size={18} color="current" />
              Browse More Quizzes
            </Link>
            <Link
              href="/dashboard"
              className="bg-gradient-to-r from-gray-800 to-black hover:from-gray-900 hover:to-gray-800 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-2xl font-bold text-base sm:text-lg transition-all duration-300 text-center shadow-2xl hover:shadow-3xl transform hover:scale-105 flex items-center justify-center gap-2 flex-1"
            >
              <Icon name="chart" size={18} color="white" />
              View Dashboard
            </Link>
          </div>
        </div>

        {/* Performance Tips */}
        <div className="rounded-3xl backdrop-blur-lg bg-gradient-to-r from-gray-900/90 to-black/90 border border-white/20 p-6 sm:p-12 text-white shadow-2xl">
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-red-600 to-orange-600 rounded-full mb-4 sm:mb-6 shadow-lg">
              <Icon name="lightbulb" size={24} color="white" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-4">Tips for Improvement</h3>
            <p className="text-gray-300 text-base sm:text-lg font-light px-4">Enhance your learning journey with these proven strategies</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10">
            <div className="space-y-4 sm:space-y-6">
              <h4 className="font-bold text-red-400 text-xs sm:text-sm uppercase tracking-wide">Learning Strategies</h4>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start gap-3 sm:gap-4 p-4 sm:p-6 rounded-2xl backdrop-blur-lg bg-white/10 border border-white/20 hover:bg-white/20 transition-all duration-300">
                  <Icon name="edit" size={16} color="error" />
                  <div>
                    <p className="text-white font-bold text-sm sm:text-base">Review explanations carefully</p>
                    <p className="text-gray-400 text-xs sm:text-sm">Focus on understanding why answers are correct</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 sm:gap-4 p-4 sm:p-6 rounded-2xl backdrop-blur-lg bg-white/10 border border-white/20 hover:bg-white/20 transition-all duration-300">
                  <Icon name="book" size={16} color="error" />
                  <div>
                    <p className="text-white font-bold text-sm sm:text-base">Take detailed notes</p>
                    <p className="text-gray-400 text-xs sm:text-sm">Document challenging topics for future review</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 sm:gap-4 p-4 sm:p-6 rounded-2xl backdrop-blur-lg bg-white/10 border border-white/20 hover:bg-white/20 transition-all duration-300">
                  <Icon name="refresh" size={16} color="error" />
                  <div>
                    <p className="text-white font-bold text-sm sm:text-base">Practice regularly</p>
                    <p className="text-gray-400 text-xs sm:text-sm">Reinforce learning with similar quizzes</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4 sm:space-y-6">
              <h4 className="font-bold text-red-400 text-xs sm:text-sm uppercase tracking-wide">Growth Actions</h4>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start gap-3 sm:gap-4 p-4 sm:p-6 rounded-2xl backdrop-blur-lg bg-white/10 border border-white/20 hover:bg-white/20 transition-all duration-300">
                  <Icon name="graduation" size={16} color="error" />
                  <div>
                    <p className="text-white font-bold text-sm sm:text-base">Explore related courses</p>
                    <p className="text-gray-400 text-xs sm:text-sm">Deepen knowledge with structured learning</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 sm:gap-4 p-4 sm:p-6 rounded-2xl backdrop-blur-lg bg-white/10 border border-white/20 hover:bg-white/20 transition-all duration-300">
                  <Icon name="users" size={16} color="error" />
                  <div>
                    <p className="text-white font-bold text-sm sm:text-base">Join study communities</p>
                    <p className="text-gray-400 text-xs sm:text-sm">Connect with other learners for support</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 sm:gap-4 p-4 sm:p-6 rounded-2xl backdrop-blur-lg bg-white/10 border border-white/20 hover:bg-white/20 transition-all duration-300">
                  <Icon name="calendar" size={16} color="error" />
                  <div>
                    <p className="text-white font-bold text-sm sm:text-base">Create study schedule</p>
                    <p className="text-gray-400 text-xs sm:text-sm">Set consistent practice routines</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 sm:mt-10 pt-6 sm:pt-8 border-t border-white/20">
            <div className="flex flex-col gap-3 sm:gap-4 justify-center">
              <Link
                href="/courses"
                className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-2xl font-bold text-base sm:text-lg transition-all duration-300 text-center shadow-2xl hover:shadow-3xl transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <Icon name="book" size={18} color="white" />
                Browse Courses
              </Link>
              <Link
                href="/quizzes"
                className="backdrop-blur-lg bg-white/20 border-2 border-white/30 text-white hover:bg-white/30 px-6 py-3 sm:px-8 sm:py-4 rounded-2xl font-bold text-base sm:text-lg transition-all duration-300 text-center shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <Icon name="lightbulb" size={18} color="white" />
                More Quizzes
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
