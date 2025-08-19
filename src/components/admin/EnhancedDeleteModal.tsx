'use client'

import { useState, useEffect, useCallback } from 'react'
import { AlertTriangle, Trash2, Loader2, Users, FileText, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { logger } from '@/lib/logger'

interface EnhancedDeleteModalProps {
  item: {
    id: string
    title: string
    type: 'quiz' | 'course'
  } | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface UsageInfo {
  enrollments?: number
  attempts?: number
  questions?: number
  modules?: number
  lessons?: number
}

export function EnhancedDeleteModal({ item, isOpen, onClose, onSuccess }: EnhancedDeleteModalProps) {
  const [loading, setLoading] = useState(false)
  const [checkingUsage, setCheckingUsage] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [usageInfo, setUsageInfo] = useState<UsageInfo>({})
  const [deleteOption, setDeleteOption] = useState<'cascade' | 'clean' | ''>('')

  const checkUsage = useCallback(async () => {
    if (!item) return

    setCheckingUsage(true)
    try {
      if (item.type === 'quiz') {
        // Check quiz attempts and questions
        const [attemptsResult, questionsResult] = await Promise.all([
          supabase.from('quiz_attempts').select('id').eq('quiz_id', item.id),
          supabase.from('quiz_questions').select('id').eq('quiz_id', item.id)
        ])

        setUsageInfo({
          attempts: attemptsResult.data?.length || 0,
          questions: questionsResult.data?.length || 0
        })
      } else if (item.type === 'course') {
        // Check enrollments, modules, and lessons
        const [enrollmentsResult, modulesResult] = await Promise.all([
          supabase.from('enrollments').select('id').eq('course_id', item.id),
          supabase.from('course_modules').select('id, course_lessons(id)').eq('course_id', item.id)
        ])

        const totalLessons = modulesResult.data?.reduce((total, module: any) => 
          total + (module.course_lessons?.length || 0), 0) || 0

        setUsageInfo({
          enrollments: enrollmentsResult.data?.length || 0,
          modules: modulesResult.data?.length || 0,
          lessons: totalLessons
        })
      }
    } catch (err) {
      logger.error('Error checking usage:', err)
    } finally {
      setCheckingUsage(false)
    }
  }, [item])

  useEffect(() => {
    if (isOpen && item) {
      setError(null)
      setDeleteOption('')
      checkUsage()
    }
  }, [isOpen, item, checkUsage])

  const handleCascadeDelete = async () => {
    if (!item) return

    setLoading(true)
    setError(null)

    try {
      if (item.type === 'quiz') {
        // Delete quiz attempts first, then quiz (questions will cascade)
        await supabase.from('quiz_attempts').delete().eq('quiz_id', item.id)
        await supabase.from('quizzes').delete().eq('id', item.id)
      } else if (item.type === 'course') {
        // Delete enrollments and lesson progress first, then course (modules/lessons will cascade)
        const [, ] = await Promise.all([
          supabase.from('enrollments').delete().eq('course_id', item.id),
          supabase.from('lesson_progress').delete().eq('course_id', item.id)
        ])
        await supabase.from('courses').delete().eq('id', item.id)
      }

      onSuccess()
      onClose()
    } catch (err: any) {
      logger.error('Error deleting item:', err)
      setError(err.message || 'Failed to delete item')
    } finally {
      setLoading(false)
    }
  }

  const handleCleanDelete = async () => {
    if (!item) return

    setLoading(true)
    setError(null)

    try {
      if (item.type === 'quiz') {
        // Remove all quiz attempts
        await supabase.from('quiz_attempts').delete().eq('quiz_id', item.id)
        setUsageInfo(prev => ({ ...prev, attempts: 0 }))
      } else if (item.type === 'course') {
        // Remove all enrollments and lesson progress
        await Promise.all([
          supabase.from('enrollments').delete().eq('course_id', item.id),
          supabase.from('lesson_progress').delete().eq('course_id', item.id)
        ])
        setUsageInfo(prev => ({ ...prev, enrollments: 0 }))
      }

      // Recheck usage
      await checkUsage()
      setDeleteOption('')
    } catch (err: any) {
      logger.error('Error cleaning item:', err)
      setError(err.message || 'Failed to clean item')
    } finally {
      setLoading(false)
    }
  }

  const canDelete = item?.type === 'quiz' 
    ? (usageInfo.attempts || 0) === 0
    : (usageInfo.enrollments || 0) === 0

  const hasUsage = item?.type === 'quiz'
    ? (usageInfo.attempts || 0) > 0
    : (usageInfo.enrollments || 0) > 0

  if (!isOpen || !item) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="bg-primary text-black flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Trash2 size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold">Delete {item.type === 'quiz' ? 'Quiz' : 'Course'}</h2>
              <p className="text-red-100 text-sm">{item.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {checkingUsage ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">Checking usage...</p>
            </div>
          ) : (
            <>
              {/* Usage Information */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3">Current Usage</h3>
                <div className="space-y-2 text-sm">
                  {item.type === 'quiz' ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Users size={16} className="text-gray-400" />
                          Student Attempts
                        </span>
                        <span className={`font-medium ${(usageInfo.attempts || 0) > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                          {usageInfo.attempts || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <FileText size={16} className="text-gray-400" />
                          Questions
                        </span>
                        <span className="font-medium text-gray-600">
                          {usageInfo.questions || 0}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Users size={16} className="text-gray-400" />
                          Enrolled Students
                        </span>
                        <span className={`font-medium ${(usageInfo.enrollments || 0) > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                          {usageInfo.enrollments || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <FileText size={16} className="text-gray-400" />
                          Modules
                        </span>
                        <span className="font-medium text-gray-600">
                          {usageInfo.modules || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <FileText size={16} className="text-gray-400" />
                          Lessons
                        </span>
                        <span className="font-medium text-gray-600">
                          {usageInfo.lessons || 0}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Options */}
              {hasUsage ? (
                <div className="space-y-4 mb-6">
                  <h3 className="font-semibold text-gray-800">Choose an option:</h3>
                  
                  {/* Clean First Option */}
                  <div
                    className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                      deleteOption === 'clean' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setDeleteOption('clean')}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        checked={deleteOption === 'clean'}
                        onChange={() => setDeleteOption('clean')}
                        className="mt-1"
                      />
                      <div>
                        <h4 className="font-medium text-gray-800">Remove {item.type === 'quiz' ? 'Attempts' : 'Enrollments'} First</h4>
                        <p className="text-sm text-gray-600">
                          Safely remove all {item.type === 'quiz' ? 'student attempts' : 'student enrollments'} first, then delete the {item.type}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Force Delete Option */}
                  <div
                    className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                      deleteOption === 'cascade' ? 'border-red-500 bg-primary/5' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setDeleteOption('cascade')}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        checked={deleteOption === 'cascade'}
                        onChange={() => setDeleteOption('cascade')}
                        className="mt-1"
                      />
                      <div>
                        <h4 className="font-medium text-gray-800 flex items-center gap-2">
                          Force Delete Everything
                          <AlertTriangle size={16} className="text-destructive" />
                        </h4>
                        <p className="text-sm text-gray-600">
                          Delete the {item.type} and all related data permanently. This cannot be undone.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 text-sm">
                    ✅ This {item.type} has no {item.type === 'quiz' ? 'attempts' : 'enrollments'} and can be safely deleted.
                  </p>
                </div>
              )}

              {error && (
                <div className="mb-4 p-3 bg-primary/5 border border-destructive/30 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-6 bg-gray-50 flex items-center justify-between rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
          >
            Cancel
          </button>
          
          <div className="flex gap-3">
            {hasUsage && deleteOption === 'clean' && (
              <button
                onClick={handleCleanDelete}
                disabled={loading}
                className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 font-medium disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Remove Data'
                )}
              </button>
            )}
            
            <button
              onClick={deleteOption === 'cascade' ? handleCascadeDelete : canDelete ? handleCascadeDelete : undefined}
              disabled={loading || (hasUsage && !deleteOption)}
              className="px-4 py-2 bg-primary text-secondary rounded-lg hover:bg-primary/90 font-medium disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Trash2 size={16} />
                  Delete {item.type === 'quiz' ? 'Quiz' : 'Course'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
