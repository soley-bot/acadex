'use client'

import { logger } from '@/lib/logger'

import { useState, useEffect, useCallback } from 'react'
import { X, Eye, Edit, Clock, Users, BarChart3, CheckCircle, XCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Question {
  id: string
  question: string
  options: string[]
  correct_answer: number
  explanation?: string
  order_index: number
}

interface Quiz {
  id: string
  title: string
  description: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration_minutes: number
  total_questions: number
  is_published: boolean
  created_at: string
  updated_at: string
}

interface QuizStats {
  totalAttempts: number
  averageScore: number
  completionRate: number
  recentAttempts: Array<{
    id: string
    user_id: string
    score: number
    total_questions: number
    completed_at: string
  }>
}

interface QuizViewModalProps {
  quiz: Quiz | null
  isOpen: boolean
  onClose: () => void
  onEdit: () => void
}

export function QuizViewModal({ quiz, isOpen, onClose, onEdit }: QuizViewModalProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [stats, setStats] = useState<QuizStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'questions' | 'analytics'>('overview')

  const loadQuizData = useCallback(async () => {
    if (!quiz) return

    setLoading(true)
    try {
      // Load questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', quiz.id)
        .order('order_index')

      if (questionsError) throw questionsError

      setQuestions(questionsData.map(q => ({
        id: q.id,
        question: q.question,
        options: q.options,
        correct_answer: q.correct_answer,
        explanation: q.explanation,
        order_index: q.order_index
      })))

      // Load statistics
      const { data: attempts, error: attemptsError } = await supabase
        .from('quiz_attempts')
        .select('id, user_id, score, total_questions, completed_at')
        .eq('quiz_id', quiz.id)
        .order('completed_at', { ascending: false })

      if (attemptsError) throw attemptsError

      // Calculate stats
      const totalAttempts = attempts.length
      const averageScore = totalAttempts > 0 
        ? Math.round(attempts.reduce((sum, attempt) => sum + (attempt.score / attempt.total_questions * 100), 0) / totalAttempts)
        : 0
      const completionRate = 100 // For now, assume all attempts are completions

      setStats({
        totalAttempts,
        averageScore,
        completionRate,
        recentAttempts: attempts.slice(0, 5)
      })

    } catch (err) {
      logger.error('Error loading quiz data:', err)
    } finally {
      setLoading(false)
    }
  }, [quiz])

  useEffect(() => {
    if (isOpen && quiz) {
      loadQuizData()
    }
  }, [isOpen, quiz, loadQuizData])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusBadge = (isPublished: boolean) => {
    return isPublished 
      ? 'bg-green-100 text-green-800' 
      : 'bg-yellow-100 text-yellow-800'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!isOpen || !quiz) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">{quiz.title}</h2>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadge(quiz.is_published)}`}>
                  {quiz.is_published ? 'Published' : 'Draft'}
                </span>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${getDifficultyColor(quiz.difficulty)}`}>
                  {quiz.difficulty}
                </span>
              </div>
              <p className="text-gray-600 mb-3">{quiz.description}</p>
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {quiz.duration_minutes} min
                </div>
                <div className="flex items-center gap-1">
                  <BarChart3 className="h-4 w-4" />
                  {quiz.total_questions} questions
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {stats?.totalAttempts || 0} attempts
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 border-b border-gray-200">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('questions')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'questions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Questions ({questions.length})
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Analytics
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Stats Cards */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-600 text-sm font-medium">Total Attempts</p>
                          <p className="text-2xl font-bold text-blue-900">{stats?.totalAttempts || 0}</p>
                        </div>
                        <Users className="h-8 w-8 text-blue-600" />
                      </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-600 text-sm font-medium">Average Score</p>
                          <p className="text-2xl font-bold text-green-900">{stats?.averageScore || 0}%</p>
                        </div>
                        <BarChart3 className="h-8 w-8 text-green-600" />
                      </div>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-600 text-sm font-medium">Completion Rate</p>
                          <p className="text-2xl font-bold text-purple-900">{stats?.completionRate || 0}%</p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-purple-600" />
                      </div>
                    </div>
                  </div>

                  {/* Quiz Details */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-4">Quiz Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Category:</span>
                        <span className="ml-2 font-medium capitalize">{quiz.category}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Difficulty:</span>
                        <span className="ml-2 font-medium capitalize">{quiz.difficulty}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Duration:</span>
                        <span className="ml-2 font-medium">{quiz.duration_minutes} minutes</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Questions:</span>
                        <span className="ml-2 font-medium">{quiz.total_questions}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Created:</span>
                        <span className="ml-2 font-medium">{formatDate(quiz.created_at)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Last Updated:</span>
                        <span className="ml-2 font-medium">{formatDate(quiz.updated_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'questions' && (
                <div className="p-6">
                  {questions.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500">No questions found for this quiz.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {questions.map((question, index) => (
                        <div key={question.id} className="border border-gray-200 rounded-lg p-6">
                          <h4 className="font-medium text-gray-900 mb-3">
                            Question {index + 1}
                          </h4>
                          <p className="text-gray-700 mb-4">{question.question}</p>
                          
                          <div className="space-y-2 mb-4">
                            {question.options.map((option, optionIndex) => (
                              <div key={optionIndex} className={`flex items-center gap-3 p-3 rounded-lg ${
                                optionIndex === question.correct_answer 
                                  ? 'bg-green-50 border border-green-200' 
                                  : 'bg-gray-50'
                              }`}>
                                {optionIndex === question.correct_answer ? (
                                  <CheckCircle className="h-5 w-5 text-green-600" />
                                ) : (
                                  <XCircle className="h-5 w-5 text-gray-400" />
                                )}
                                <span className={`${
                                  optionIndex === question.correct_answer 
                                    ? 'text-green-900 font-medium' 
                                    : 'text-gray-700'
                                }`}>
                                  {option}
                                </span>
                              </div>
                            ))}
                          </div>

                          {question.explanation && (
                            <div className="bg-blue-50 p-4 rounded-lg">
                              <h5 className="font-medium text-blue-900 mb-2">Explanation</h5>
                              <p className="text-blue-800 text-sm">{question.explanation}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'analytics' && (
                <div className="p-6">
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Recent Attempts</h3>
                    {stats?.recentAttempts && stats.recentAttempts.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left py-3 px-4 font-medium text-gray-900">User</th>
                              <th className="text-left py-3 px-4 font-medium text-gray-900">Score</th>
                              <th className="text-left py-3 px-4 font-medium text-gray-900">Percentage</th>
                              <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {stats.recentAttempts.map((attempt) => (
                              <tr key={attempt.id} className="border-b border-gray-100">
                                <td className="py-3 px-4 text-gray-700">{attempt.user_id.slice(0, 8)}...</td>
                                <td className="py-3 px-4 text-gray-700">
                                  {attempt.score}/{attempt.total_questions}
                                </td>
                                <td className="py-3 px-4">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    (attempt.score / attempt.total_questions * 100) >= 70
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {Math.round(attempt.score / attempt.total_questions * 100)}%
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-gray-500">
                                  {formatDate(attempt.completed_at)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-gray-500">No attempts yet.</p>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="text-sm text-gray-500">
            Last updated: {formatDate(quiz.updated_at)}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit Quiz
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
