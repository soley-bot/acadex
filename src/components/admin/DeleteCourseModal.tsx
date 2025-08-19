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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="surface-primary rounded-2xl shadow-2xl max-w-md w-full border border-subtle">
        <div className="flex items-center justify-between p-6 border-b border-subtle">
          <div className="flex items-center">
            <div className="p-2 bg-destructive/20 rounded-lg mr-3">
              <AlertTriangle className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="heading-subsection">Delete Course</h2>
              <p className="text-sm text-tertiary">This action cannot be undone</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted/40 rounded-lg transition-colors text-tertiary hover:text-primary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-secondary mb-4">
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
            <div className="bg-primary/5 border border-destructive/30 rounded-lg p-4 mb-4">
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-muted/40 hover:bg-muted/60 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-secondary rounded-lg transition-colors disabled:opacity-50 flex items-center"
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
