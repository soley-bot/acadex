'use client'

import { useState, useEffect, useCallback } from 'react'
import { AlertTriangle, Trash2, Loader2 } from 'lucide-react'
import { BaseModal } from '@/components/ui/BaseModal'
import { logger } from '@/lib/logger'

interface DeleteItem {
  id: string
  title: string
  type: 'quiz' | 'course' | 'user'
  [key: string]: any
}

interface DeleteModalProps {
  item: DeleteItem | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  onDelete: (item: DeleteItem) => Promise<void>
  usageCheck?: (item: DeleteItem) => Promise<{ count: number; message?: string }>
}

export function DeleteModal({ 
  item, 
  isOpen, 
  onClose, 
  onSuccess, 
  onDelete,
  usageCheck 
}: DeleteModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [usageInfo, setUsageInfo] = useState<{ count: number; message?: string } | null>(null)

  const checkUsage = useCallback(async () => {
    if (!item || !usageCheck) return

    try {
      const usage = await usageCheck(item)
      setUsageInfo(usage)
    } catch (err: any) {
      logger.error('Error checking item usage:', err)
      setUsageInfo({ count: 0 })
    }
  }, [item, usageCheck])

  useEffect(() => {
    if (isOpen && item && usageCheck) {
      checkUsage()
    }
  }, [isOpen, item, usageCheck, checkUsage])

  const handleDelete = async () => {
    if (!item) return

    setLoading(true)
    setError(null)

    try {
      await onDelete(item)
      onSuccess()
    } catch (err: any) {
      logger.error(`Error deleting ${item.type}:`, err)
      setError(err.message || `Failed to delete ${item.type}. Please try again.`)
    } finally {
      setLoading(false)
    }
  }

  const getItemTypeLabel = (type: string) => {
    switch (type) {
      case 'quiz': return 'Quiz'
      case 'course': return 'Course'
      case 'user': return 'User'
      default: return 'Item'
    }
  }

  const getWarningMessage = () => {
    if (!item || !usageInfo) return null

    const { count, message } = usageInfo
    const typeLabel = getItemTypeLabel(item.type).toLowerCase()

    if (message) return message

    if (count > 0) {
      switch (item.type) {
        case 'quiz':
          return `This quiz has ${count} student attempt${count === 1 ? '' : 's'}. Deleting it will permanently remove all attempt records.`
        case 'course':
          return `This course has ${count} enrolled student${count === 1 ? '' : 's'}. Please remove enrollments before deleting.`
        case 'user':
          return `This user has ${count} associated record${count === 1 ? '' : 's'}. Deleting will remove all their data.`
        default:
          return `This ${typeLabel} has ${count} associated record${count === 1 ? '' : 's'}.`
      }
    }

    return null
  }

  const canDelete = () => {
    if (!usageInfo) return true
    if (item?.type === 'course' && usageInfo.count > 0) return false
    return true
  }

  if (!item) return null

  const warningMessage = getWarningMessage()
  const typeLabel = getItemTypeLabel(item.type)

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Delete ${typeLabel}`}
      subtitle={`Permanently remove "${item.title}"`}
      size="md"
      headerIcon={<AlertTriangle size={24} color="white" />}
      headerGradient="red"
      footer={
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            This action cannot be undone
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={loading || !canDelete()}
              className="px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 size={16} />
                  Delete {typeLabel}
                </>
              )}
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Error</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="text-center py-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 size={24} className="text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Are you sure you want to delete this {typeLabel.toLowerCase()}?
          </h3>
          <p className="text-gray-600 mb-4">
            You are about to permanently delete <strong>&ldquo;{item.title}&rdquo;</strong>
          </p>
        </div>

        {warningMessage && (
          <div className={`p-4 rounded-xl border ${
            !canDelete() 
              ? 'bg-red-50 border-red-200 text-red-700' 
              : 'bg-yellow-50 border-yellow-200 text-yellow-800'
          }`}>
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} className={`mt-0.5 flex-shrink-0 ${
                !canDelete() ? 'text-red-600' : 'text-yellow-600'
              }`} />
              <div>
                <p className="font-medium">
                  {!canDelete() ? 'Cannot Delete' : 'Warning'}
                </p>
                <p className="text-sm mt-1">{warningMessage}</p>
              </div>
            </div>
          </div>
        )}

        {item.type === 'quiz' && (
          <div className="bg-gray-50 p-4 rounded-xl">
            <h4 className="font-medium text-gray-900 mb-2">Quiz Details</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <p><span className="font-medium">Category:</span> {item.category}</p>
              <p><span className="font-medium">Difficulty:</span> <span className="capitalize">{item.difficulty}</span></p>
              <p><span className="font-medium">Questions:</span> {item.total_questions || 0}</p>
            </div>
          </div>
        )}

        {item.type === 'course' && (
          <div className="bg-gray-50 p-4 rounded-xl">
            <h4 className="font-medium text-gray-900 mb-2">Course Details</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <p><span className="font-medium">Students:</span> {item.student_count || 0}</p>
              <p><span className="font-medium">Status:</span> {item.is_published ? 'Published' : 'Draft'}</p>
            </div>
          </div>
        )}
      </div>
    </BaseModal>
  )
}
