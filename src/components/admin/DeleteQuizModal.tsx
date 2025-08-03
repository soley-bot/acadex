'use client'

import { logger } from '@/lib/logger'

import { useState } from 'react'
import { X, AlertTriangle, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Quiz {
  id: string
  title: string
  description: string
  total_questions?: number
  difficulty: string
  category: string
}

interface DeleteQuizModalProps {
  quiz: Quiz | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function DeleteQuizModal({ quiz, isOpen, onClose, onSuccess }: DeleteQuizModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [attemptCount, setAttemptCount] = useState<number | null>(null)

  const checkQuizUsage = async () => {
    if (!quiz) return

    try {
      // Check how many attempts exist for this quiz
      const { count, error } = await supabase
        .from('quiz_attempts')
        .select('*', { count: 'exact', head: true })
        .eq('quiz_id', quiz.id)

      if (error) throw error
      setAttemptCount(count || 0)
    } catch (err: any) {
      logger.error('Error checking quiz usage:', err)
      setAttemptCount(0)
    }
  }

  const handleDelete = async () => {
    if (!quiz) return

    setLoading(true)
    setError(null)

    try {
      // First delete all questions (CASCADE should handle this, but being explicit)
      const { error: questionsError } = await supabase
        .from('quiz_questions')
        .delete()
        .eq('quiz_id', quiz.id)

      if (questionsError) throw questionsError

      // Then delete the quiz itself
      const { error: quizError } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', quiz.id)

      if (quizError) throw quizError

      onSuccess()
    } catch (err: any) {
      logger.error('Error deleting quiz:', err)
      setError(err.message || 'Failed to delete quiz')
    } finally {
      setLoading(false)
    }
  }

  // Check usage when modal opens
  useState(() => {
    if (isOpen && quiz) {
      checkQuizUsage()
    }
  })

  if (!isOpen || !quiz) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="surface-primary rounded-2xl shadow-2xl w-full max-w-md border border-subtle">
        {/* Header */}
        <div className="p-6 border-b border-subtle flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h2 className="heading-subsection">Delete Quiz</h2>
              <p className="text-tertiary text-sm">This action cannot be undone</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-tertiary hover:text-primary transition-colors p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <h3 className="font-semibold text-primary mb-2">You are about to delete:</h3>
            <div className="surface-secondary border border-subtle p-4 rounded-xl">
              <h4 className="font-medium text-primary">{quiz.title}</h4>
              <p className="text-secondary text-sm mt-1">{quiz.description}</p>
              <div className="flex items-center gap-4 mt-3 text-sm text-tertiary">
                <span className="capitalize">{quiz.difficulty}</span>
                <span>•</span>
                <span className="capitalize">{quiz.category}</span>
                <span>•</span>
                <span>{quiz.total_questions || 0} questions</span>
              </div>
            </div>
          </div>

          {/* Usage Warning */}
          {attemptCount !== null && attemptCount > 0 && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-800">Quiz Has Student Attempts</h4>
                  <p className="text-amber-700 text-sm mt-1">
                    This quiz has {attemptCount} student attempt{attemptCount !== 1 ? 's' : ''}. 
                    Deleting it will also remove all associated attempt records and may affect student progress tracking.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Consequences List */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">This will permanently:</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                Delete the quiz and all its questions
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                Remove all student attempt records
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                Clear any course associations
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                Remove quiz from all analytics and reports
              </li>
            </ul>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Confirmation Input */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-3">
              Type <span className="font-semibold">DELETE</span> to confirm:
            </p>
            <input
              type="text"
              placeholder="Type DELETE to confirm"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              onChange={(e) => {
                // You could add confirmation logic here
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="text-sm text-gray-500">
            {attemptCount !== null && (
              <>Student attempts: {attemptCount}</>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {loading ? 'Deleting...' : 'Delete Quiz'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
