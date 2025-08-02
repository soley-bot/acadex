'use client'

import { logger } from '@/lib/logger'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Save, Loader2, Upload, AlertCircle, Plus, Trash2, BookOpen } from 'lucide-react'
import { Course } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useCourseMutations } from '@/lib/cachedOperations'
import { categories, levels } from '@/lib/courseConstants'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { uploadCourseImage } from '@/lib/storage'

interface CourseFormProps {
  course?: Course
  isOpen: boolean
  onClose: () => void
  onSuccess: (updatedCourse?: Course) => void
}

export function CourseForm({ course, isOpen, onClose, onSuccess }: CourseFormProps) {
  const { user } = useAuth()
  const { createCourse, updateCourse, isCreating, isUpdating, error: mutationError } = useCourseMutations()
  
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructor_name: '',
    price: 0,
    category: 'Programming',
    level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    duration: '',
    image_url: '',
    is_published: false,
    learning_objectives: [] as string[]
  })

  const isLoading = isCreating || isUpdating

  // Helper function to handle form field changes and clear success message
  const handleFieldChange = (field: string, value: any) => {
    if (successMessage) {
      setSuccessMessage(null) // Clear success message when user makes changes
    }
    setFormData({ ...formData, [field]: value })
  }

  // Track loading state changes
  useEffect(() => {
    logger.debug('🔧 [COURSE_FORM] Loading state changed:')
    logger.debug('🔧 [COURSE_FORM] isCreating:', isCreating)
    logger.debug('🔧 [COURSE_FORM] isUpdating:', isUpdating)
    logger.debug('🔧 [COURSE_FORM] isLoading:', isLoading)
  }, [isCreating, isUpdating, isLoading])

  // Update error state when mutation error changes
  useEffect(() => {
    logger.debug('🔧 [COURSE_FORM] Mutation error changed:', mutationError)
    if (mutationError) {
      logger.debug('❌ [COURSE_FORM] Setting error from mutation:', mutationError.message)
      setError(mutationError.message)
    }
  }, [mutationError])

  useEffect(() => {
    logger.debug('🔄 [COURSE_FORM] Form opened/course changed')
    logger.debug('🔄 [COURSE_FORM] Course prop:', { courseId: course?.id, courseTitle: course?.title })
    logger.debug('🔄 [COURSE_FORM] User:', { userId: user?.id, userEmail: user?.email })
    logger.debug('🔄 [COURSE_FORM] Form open:', { isOpen })
    
    if (course) {
      logger.debug('📝 [COURSE_FORM] Setting form data from course:', course.title)
      setFormData({
        title: course.title,
        description: course.description,
        instructor_name: course.instructor_name,
        price: course.price,
        category: course.category,
        level: course.level,
        duration: course.duration,
        image_url: course.image_url || '',
        is_published: course.is_published,
        learning_objectives: course.learning_objectives || []
      })
    } else {
      logger.debug('📝 [COURSE_FORM] Resetting form for new course')
      // Reset form for new course
      setFormData({
        title: '',
        description: '',
        instructor_name: user?.name || '',
        price: 0,
        category: 'Programming',
        level: 'beginner',
        duration: '',
        image_url: '',
        is_published: false,
        learning_objectives: []
      })
    }
    setError(null)
    setSuccessMessage(null) // Clear success message when form opens/changes
  }, [course, user, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null) // Clear previous success message

    logger.debug('🔄 [COURSE_FORM] === STARTING COURSE SUBMISSION ===')
    logger.debug('🔄 [COURSE_FORM] Form submitted at:', new Date().toISOString())
    logger.debug('📝 [COURSE_FORM] Form Data:', JSON.stringify(formData, null, 2))
    logger.debug('👤 [COURSE_FORM] User:', { userId: user?.id, userEmail: user?.email })
    logger.debug('📚 [COURSE_FORM] Course being edited:', { courseId: course?.id, courseTitle: course?.title })
    logger.debug('🔧 [COURSE_FORM] isCreating:', isCreating)
    logger.debug('🔧 [COURSE_FORM] isUpdating:', isUpdating)
    logger.debug('🔧 [COURSE_FORM] isLoading:', isLoading)

    const courseData = {
      title: formData.title,
      description: formData.description,
      instructor_name: formData.instructor_name,
      price: formData.price,
      category: formData.category,
      level: formData.level,
      duration: formData.duration,
      image_url: formData.image_url || null,
      is_published: formData.is_published,
      learning_objectives: formData.learning_objectives.filter(obj => obj.trim() !== ''),
      instructor_id: user?.id,
    }

    logger.debug('💾 [COURSE_FORM] Prepared courseData:', JSON.stringify(courseData, null, 2))

    try {
      logger.debug('🚀 [COURSE_FORM] About to call mutation...')
      
      let result: Course
      
      if (course?.id) {
        logger.debug('✏️ [COURSE_FORM] UPDATING existing course:', course.id)
        logger.debug('✏️ [COURSE_FORM] Calling updateCourse with:', { id: course.id, updates: courseData })
        
        result = await updateCourse({ id: course.id, updates: courseData })
        
        logger.debug('✅ [COURSE_FORM] updateCourse returned:', result)
        logger.debug('✅ [COURSE_FORM] Course updated successfully')
      } else {
        logger.debug('🆕 [COURSE_FORM] CREATING new course')
        logger.debug('🆕 [COURSE_FORM] Calling createCourse with:', courseData)
        
        result = await createCourse(courseData)
        
        logger.debug('✅ [COURSE_FORM] createCourse returned:', result)
        logger.debug('✅ [COURSE_FORM] Course created successfully')
      }

      logger.debug('🎉 [COURSE_FORM] Operation completed successfully, calling callbacks...')
      
      if (course?.id) {
        // For updates, show success message and keep form open
        logger.debug('🎉 [COURSE_FORM] This is an UPDATE - keeping form open')
        logger.debug('🎉 [COURSE_FORM] Updated course data:', JSON.stringify(result, null, 2))
        
        // Set success message first
        setSuccessMessage('Course updated successfully!')
        
        // Then call success callback with updated data - DO NOT CLOSE FORM
        logger.debug('🎉 [COURSE_FORM] Calling onSuccess with result')
        onSuccess(result)
        logger.debug('🎉 [COURSE_FORM] Form should stay OPEN for updates')
        
      } else {
        // For new courses, close the form
        logger.debug('🎉 [COURSE_FORM] This is a NEW COURSE - closing form')
        onSuccess()
        logger.debug('🎉 [COURSE_FORM] Calling onClose()...')
        onClose()
      }
      
      logger.debug('🎉 [COURSE_FORM] === SUBMISSION COMPLETE ===')
      
    } catch (err) {
      logger.error('💥 [COURSE_FORM] === ERROR IN SUBMISSION ===')
      logger.error('💥 [COURSE_FORM] Error occurred at:', new Date().toISOString())
      logger.error('💥 [COURSE_FORM] Error details:', err)
      logger.error('💥 [COURSE_FORM] Error message:', err instanceof Error ? err.message : 'Unknown error')
      logger.error('💥 [COURSE_FORM] Error stack:', err instanceof Error ? err.stack : 'No stack trace')
      
      setError(err instanceof Error ? err.message : 'An error occurred while saving the course')
      logger.debug('💥 [COURSE_FORM] Error state set, form should show error now')
    }
  }

  if (!isOpen) {
    logger.debug('🚫 [COURSE_FORM] Form not rendering - isOpen is false')
    return null
  }

  logger.debug('📺 [COURSE_FORM] Form rendering - isOpen is true')
  logger.debug('📺 [COURSE_FORM] Current course:', { courseId: course?.id, courseTitle: course?.title })
  logger.debug('📺 [COURSE_FORM] Form data title:', formData.title)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {course ? 'Edit Course' : 'Create New Course'}
            </h2>
            <p className="text-sm text-gray-600">
              {course ? 'Update course information' : 'Add a new course to the platform'}
            </p>
          </div>
          <button
            onClick={() => {
              logger.debug('❌ [COURSE_FORM] X button clicked - closing form')
              onClose()
            }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
              <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-green-700">{successMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter course title"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe what students will learn in this course"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instructor Name *
              </label>
              <input
                type="text"
                required
                value={formData.instructor_name}
                onChange={(e) => setFormData({ ...formData, instructor_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Instructor name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price ($) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Level *
              </label>
              <select
                required
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {levels.map(level => (
                  <option key={level.value} value={level.value}>{level.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration *
              </label>
              <input
                type="text"
                required
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 8 weeks, 24 hours"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Image
              </label>
              <ImageUpload
                value={formData.image_url}
                onChange={(url) => setFormData({ ...formData, image_url: url || '' })}
                onFileUpload={async (file) => {
                  // We'll use a temporary ID for new courses
                  const tempId = course?.id || 'temp-' + Date.now()
                  const result = await uploadCourseImage(file, tempId)
                  if (result.error) {
                    throw new Error(result.error)
                  }
                  return result.url!
                }}
                placeholder="Upload course image or enter URL"
              />
            </div>

            {/* Learning Objectives */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Learning Outcomes
              </label>
              <div className="space-y-2">
                {formData.learning_objectives.map((objective, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={objective}
                      onChange={(e) => {
                        const updated = [...formData.learning_objectives]
                        updated[index] = e.target.value
                        setFormData({ ...formData, learning_objectives: updated })
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Master advanced programming concepts"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = formData.learning_objectives.filter((_, i) => i !== index)
                        setFormData({ ...formData, learning_objectives: updated })
                      }}
                      className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded transition-colors"
                      title="Remove learning objective"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                {formData.learning_objectives.length === 0 && (
                  <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <BookOpen className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No learning objectives yet</p>
                  </div>
                )}
                
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ 
                      ...formData, 
                      learning_objectives: [...formData.learning_objectives, ''] 
                    })
                  }}
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Learning Objective
                </button>
                
                <p className="text-xs text-gray-500">
                  These will appear on the course page to help students understand what they&apos;ll learn
                </p>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Publish course (make it visible to students)
                </span>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={() => {
                logger.debug('❌ [COURSE_FORM] Cancel button clicked - closing form')
                onClose()
              }}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center"
              onClick={() => {
                logger.debug('🖱️ [COURSE_FORM] Submit button clicked')
                logger.debug('🖱️ [COURSE_FORM] isLoading at click:', isLoading)
                logger.debug('🖱️ [COURSE_FORM] Button disabled:', isLoading)
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {course ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {course ? 'Update Course' : 'Create Course'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
