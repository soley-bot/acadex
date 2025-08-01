'use client'

import { useState } from 'react'
import { AlertTriangle, Loader2, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface DeleteCourseModalProps {
  course: {
    id: string
    title: string
    student_count: number
  } | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function DeleteCourseModal({ course, isOpen, onClose, onSuccess }: DeleteCourseModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!course) return

    setLoading(true)
    setError(null)

    try {
      // First check if there are any enrollments
      const { data: enrollments, error: enrollmentError } = await supabase
        .from('enrollments')
        .select('id')
        .eq('course_id', course.id)

      if (enrollmentError) throw enrollmentError

      if (enrollments && enrollments.length > 0) {
        setError(`Cannot delete course with ${enrollments.length} enrolled students. Please remove enrollments first.`)
        return
      }

      // Delete the course
      const { error: deleteError } = await supabase
        .from('courses')
        .delete()
        .eq('id', course.id)

      if (deleteError) throw deleteError

      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete course')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !course) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
            <h2 className="text-lg font-semibold text-gray-900">Delete Course</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-700 mb-4">
            Are you sure you want to delete the course &ldquo;{course.title}&rdquo;? This action cannot be undone.
          </p>

          {course.student_count > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                <span className="text-yellow-800 text-sm">
                  This course has {course.student_count} enrolled students
                </span>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Course'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
