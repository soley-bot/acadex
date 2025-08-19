'use client'

import { logger } from '@/lib/logger'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Save, Loader2, Upload, AlertCircle, Plus, Trash2, BookOpen, Video, Link, PlayCircle, FileText, HelpCircle, Move, ChevronDown, ChevronRight } from 'lucide-react'
import { Course, CourseModule, CourseLesson, Quiz } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useCourseMutations } from '@/lib/cachedOperations'
import { categories, levels } from '@/lib/courseConstants'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { uploadCourseImage } from '@/lib/storage'
import { quizAPI, courseAPI } from '@/lib/auth-api'

interface CourseFormProps {
  course?: Course
  isOpen: boolean
  onClose: () => void
  onSuccess: (updatedCourse?: Course) => void
  embedded?: boolean // New prop to control rendering mode
}

// Enhanced interfaces for course structure
interface QuizOption {
  id: string
  title: string
  description?: string
}

interface LessonData {
  id?: string
  title: string
  description: string
  content: string
  video_url?: string
  video_type?: 'upload' | 'youtube'
  duration_minutes?: number
  order_index: number
  is_free_preview: boolean
  quiz_id?: string
}

interface ModuleData {
  id?: string
  title: string
  description: string
  order_index: number
  lessons: LessonData[]
}

interface EnhancedCourseData {
  title: string
  description: string
  instructor_name: string
  price: number
  category: string
  level: 'beginner' | 'intermediate' | 'advanced'
  duration: string
  image_url: string
  is_published: boolean
  learning_objectives: string[]
  modules: ModuleData[]
}

export function CourseForm({ course, isOpen, onClose, onSuccess, embedded = false }: CourseFormProps) {
  const { user } = useAuth()
  const { createCourse, updateCourse, isCreating, isUpdating, error: mutationError } = useCourseMutations()
  
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [availableQuizzes, setAvailableQuizzes] = useState<QuizOption[]>([])
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set())
  const [activeTab, setActiveTab] = useState<'basic' | 'modules'>('basic')
  
  const [formData, setFormData] = useState<EnhancedCourseData>({
    title: '',
    description: '',
    instructor_name: '',
    price: 0,
    category: 'Programming',
    level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    duration: '',
    image_url: '',
    is_published: false,
    learning_objectives: [] as string[],
    modules: [] as ModuleData[]
  })

  const isLoading = isCreating || isUpdating

  // Load available quizzes
  useEffect(() => {
    const loadQuizzes = async () => {
      try {
        logger.info('CourseForm: Loading quizzes for user:', user?.id)
        const response = await quizAPI.getQuizzes({ limit: 100 })
        
        if (response.error) {
          throw new Error(response.error)
        }
        
        // Transform the response to match the expected format
        const quizOptions = response.quizzes?.map((quiz: any) => ({
          id: quiz.id,
          title: quiz.title,
          description: quiz.description
        })) || []
        
        setAvailableQuizzes(quizOptions)
        logger.info(`CourseForm: Successfully loaded ${quizOptions.length} quizzes`)
      } catch (err) {
        logger.error('CourseForm: Error loading quizzes:', err)
        console.error('Error loading quizzes:', err)
      }
    }

    if (user?.id && isOpen) {
      loadQuizzes()
    }
  }, [user?.id, isOpen])

  // Helper function to handle form field changes and clear success message
  const handleFieldChange = (field: keyof EnhancedCourseData, value: any) => {
    if (successMessage) {
      setSuccessMessage(null) // Clear success message when user makes changes
    }
    setFormData({ ...formData, [field]: value })
  }

  // Module management functions
  const addModule = () => {
    const newModule: ModuleData = {
      title: `Module ${formData.modules.length + 1}`,
      description: '',
      order_index: formData.modules.length,
      lessons: []
    }
    setFormData({
      ...formData,
      modules: [...formData.modules, newModule]
    })
    setExpandedModules(new Set([...expandedModules, formData.modules.length]))
  }

  const updateModule = (moduleIndex: number, field: keyof ModuleData, value: any) => {
    const updated = [...formData.modules]
    updated[moduleIndex] = { ...updated[moduleIndex], [field]: value } as ModuleData
    setFormData({ ...formData, modules: updated })
  }

  const deleteModule = (moduleIndex: number) => {
    const updated = formData.modules.filter((_, index) => index !== moduleIndex)
    setFormData({ ...formData, modules: updated })
    
    // Update expanded modules
    const newExpanded = new Set<number>()
    expandedModules.forEach(index => {
      if (index < moduleIndex) {
        newExpanded.add(index)
      } else if (index > moduleIndex) {
        newExpanded.add(index - 1)
      }
    })
    setExpandedModules(newExpanded)
  }

  // Lesson management functions
  const addLesson = (moduleIndex: number) => {
    const updated = [...formData.modules]
    if (!updated[moduleIndex]) return
    
    const newLesson: LessonData = {
      title: `Lesson ${updated[moduleIndex].lessons.length + 1}`,
      description: '',
      content: '',
      order_index: updated[moduleIndex].lessons.length,
      is_free_preview: false
    }
    updated[moduleIndex].lessons.push(newLesson)
    setFormData({ ...formData, modules: updated })
  }

  const updateLesson = (moduleIndex: number, lessonIndex: number, field: keyof LessonData, value: any) => {
    const updated = [...formData.modules]
    if (!updated[moduleIndex] || !updated[moduleIndex].lessons[lessonIndex]) return
    
    updated[moduleIndex].lessons[lessonIndex] = { 
      ...updated[moduleIndex].lessons[lessonIndex], 
      [field]: value 
    } as LessonData
    setFormData({ ...formData, modules: updated })
  }

  const deleteLesson = (moduleIndex: number, lessonIndex: number) => {
    const updated = [...formData.modules]
    if (!updated[moduleIndex]) return
    
    updated[moduleIndex].lessons = updated[moduleIndex].lessons.filter((_, index) => index !== lessonIndex)
    setFormData({ ...formData, modules: updated })
  }

  const toggleModuleExpanded = (moduleIndex: number) => {
    const newExpanded = new Set(expandedModules)
    if (newExpanded.has(moduleIndex)) {
      newExpanded.delete(moduleIndex)
    } else {
      newExpanded.add(moduleIndex)
    }
    setExpandedModules(newExpanded)
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
    
    if (course && user) {
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
        learning_objectives: course.learning_objectives || [],
        modules: [] // Will be loaded separately
      })

      // Load modules and lessons if editing existing course
      loadCourseModules(course.id)
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
        learning_objectives: [],
        modules: []
      })
    }
    setError(null)
    setSuccessMessage(null) // Clear success message when form opens/changes
  }, [course, user, isOpen])

  // Load course modules and lessons
  const loadCourseModules = async (courseId: string) => {
    try {
      const { supabase } = await import('@/lib/supabase')
      
      // Load modules with lessons
      const { data: modules, error: modulesError } = await supabase
        .from('course_modules')
        .select(`
          *,
          course_lessons (
            *
          )
        `)
        .eq('course_id', courseId)
        .order('order_index')

      if (modulesError) throw modulesError

      const moduleData: ModuleData[] = (modules || []).map(module => ({
        id: module.id,
        title: module.title,
        description: module.description || '',
        order_index: module.order_index,
        lessons: (module.course_lessons || [])
          .sort((a: any, b: any) => a.order_index - b.order_index)
          .map((lesson: any) => ({
            id: lesson.id,
            title: lesson.title,
            description: lesson.description || '',
            content: lesson.content || '',
            video_url: lesson.video_url || '',
            video_type: lesson.video_url?.includes('youtube') ? 'youtube' : 'upload',
            duration_minutes: lesson.duration_minutes,
            order_index: lesson.order_index,
            is_free_preview: lesson.is_free_preview || false,
            quiz_id: lesson.quiz_id || undefined
          }))
      }))

      setFormData(prev => ({ ...prev, modules: moduleData }))
      
      // Expand first module by default
      if (moduleData.length > 0) {
        setExpandedModules(new Set([0]))
      }
      
    } catch (err) {
      console.error('Error loading course modules:', err)
      setError('Failed to load course content')
    }
  }

  // Save modules and lessons
  const saveModulesAndLessons = async (courseId: string) => {
    console.log('🎯 [DIRECT_LOG] SAVE MODULES AND LESSONS CALLED!!')
    console.log('🎯 [DIRECT_LOG] Course ID:', courseId)
    console.log('🎯 [DIRECT_LOG] Modules to save:', formData.modules)
    
    try {
      logger.debug('🔄 [COURSE_FORM] Saving modules and lessons via authenticated API')
      logger.debug('📚 [COURSE_FORM] Course ID:', courseId)
      logger.debug('📝 [COURSE_FORM] Modules count:', formData.modules.length)
      
      console.log('🎯 [DIRECT_LOG] About to call courseAPI.saveModulesAndLessons...')
      const response = await courseAPI.saveModulesAndLessons(courseId, formData.modules)
      
      console.log('🎯 [DIRECT_LOG] courseAPI.saveModulesAndLessons response:', response)
      
      if (response.error) {
        logger.error('❌ [COURSE_FORM] Modules API error:', response.error)
        throw new Error(response.error)
      }
      
      logger.debug('✅ [COURSE_FORM] Modules and lessons saved successfully')
    } catch (err) {
      console.error('🎯 [DIRECT_LOG] ERROR in saveModulesAndLessons:', err)
      logger.error('💥 [COURSE_FORM] Error saving modules and lessons:', err)
      console.error('Error saving modules and lessons:', err)
      throw new Error('Failed to save course content')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('🎯 [DIRECT_LOG] HANDLE SUBMIT CALLED!!')
    console.log('🎯 [DIRECT_LOG] Form data has modules:', formData.modules.length)
    console.log('🎯 [DIRECT_LOG] Checking for video URLs in lessons...')
    
    // Check if any lesson has video_url
    const hasVideoUrls = formData.modules.some(module => 
      module.lessons.some(lesson => lesson.video_url && lesson.video_url.trim() !== '')
    )
    console.log('🎯 [DIRECT_LOG] Has video URLs:', hasVideoUrls)
    
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
        console.log('🎯 [DIRECT_LOG] ABOUT TO CALL updateCourse!!')
        console.log('🎯 [DIRECT_LOG] Course ID:', course.id)
        console.log('🎯 [DIRECT_LOG] Updates:', courseData)
        
        logger.debug('✏️ [COURSE_FORM] UPDATING existing course:', course.id)
        logger.debug('✏️ [COURSE_FORM] Calling updateCourse with:', { id: course.id, updates: courseData })
        
        result = await updateCourse({ id: course.id, updates: courseData })
        
        console.log('🎯 [DIRECT_LOG] updateCourse COMPLETED!!')
        console.log('🎯 [DIRECT_LOG] Result:', result)
        
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
      
      // Save modules and lessons after course is saved
      await saveModulesAndLessons(result.id)
      
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

  const formContent = (
    <>
      <div className="flex items-center justify-between p-6 border-b">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {course ? 'Edit Course' : 'Create New Course'}
          </h2>
          <p className="text-sm text-gray-600">
            {course ? 'Update course information' : 'Add a new course to the platform'}
          </p>
        </div>
        {!embedded && (
          <button
            onClick={() => {
              logger.debug('❌ [COURSE_FORM] X button clicked - closing form')
              onClose()
            }}
            className="p-2 hover:bg-muted/40 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6" onInvalid={(e) => {
        console.log('🎯 [DIRECT_LOG] FORM VALIDATION ERROR!!')
        console.log('🎯 [DIRECT_LOG] Invalid element:', e.target)
        console.log('🎯 [DIRECT_LOG] Validation message:', (e.target as HTMLInputElement).validationMessage)
      }}>
          {error && (
            <div className="bg-primary/5 border border-destructive/30 rounded-lg p-4 flex items-center">
              <AlertCircle className="h-5 w-5 text-destructive mr-2" />
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

          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                type="button"
                onClick={() => setActiveTab('basic')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'basic'
                    ? 'border-blue-500 text-secondary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Basic Information
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('modules')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'modules'
                    ? 'border-blue-500 text-secondary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Course Content ({formData.modules.length} modules)
              </button>
            </nav>
          </div>

          {/* Basic Information Tab */}
          {activeTab === 'basic' && (
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
                      className="text-primary hover:text-primary/80 p-2 hover:bg-primary/5 rounded transition-colors"
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
                  className="inline-flex items-center gap-2 text-secondary hover:text-blue-700 text-sm font-medium hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
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
                  className="rounded border-gray-300 text-secondary focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Publish course (make it visible to students)
                </span>
              </label>
            </div>
          </div>
          )}

          {/* Course Content Tab */}
          {activeTab === 'modules' && (
            <div className="space-y-6">
              {/* Add Module Button */}
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Course Modules</h3>
                <button
                  type="button"
                  onClick={addModule}
                  className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Module
                </button>
              </div>

              {/* Modules List */}
              {formData.modules.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <BookOpen className="w-8 h-8 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No modules yet</h4>
                  <p className="text-gray-500 mb-4">Start building your course by adding modules</p>
                  <button
                    type="button"
                    onClick={addModule}
                    className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Your First Module
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.modules.map((module, moduleIndex) => (
                    <div key={moduleIndex} className="border border-gray-200 rounded-lg">
                      {/* Module Header */}
                      <div className="p-4 border-b border-gray-200 bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <button
                              type="button"
                              onClick={() => toggleModuleExpanded(moduleIndex)}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              {expandedModules.has(moduleIndex) ? (
                                <ChevronDown className="w-5 h-5" />
                              ) : (
                                <ChevronRight className="w-5 h-5" />
                              )}
                            </button>
                            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4">
                              <input
                                type="text"
                                value={module.title}
                                onChange={(e) => updateModule(moduleIndex, 'title', e.target.value)}
                                className="font-medium bg-transparent border-none outline-none text-gray-900 placeholder-gray-500"
                                placeholder="Module title"
                              />
                              <input
                                type="text"
                                value={module.description}
                                onChange={(e) => updateModule(moduleIndex, 'description', e.target.value)}
                                className="text-sm bg-transparent border-none outline-none text-gray-600 placeholder-gray-400"
                                placeholder="Module description"
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">{module.lessons.length} lessons</span>
                            <button
                              type="button"
                              onClick={() => deleteModule(moduleIndex)}
                              className="text-primary hover:text-primary/80 p-1 hover:bg-primary/5 rounded transition-colors"
                              title="Delete module"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Module Content (Lessons) */}
                      {expandedModules.has(moduleIndex) && (
                        <div className="p-4">
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="font-medium text-gray-900">Lessons</h4>
                            <button
                              type="button"
                              onClick={() => addLesson(moduleIndex)}
                              className="inline-flex items-center gap-2 text-secondary hover:text-blue-700 text-sm font-medium hover:bg-blue-50 px-3 py-1 rounded transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                              Add Lesson
                            </button>
                          </div>

                          {module.lessons.length === 0 ? (
                            <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                              <FileText className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                              <p className="text-gray-500 text-sm mb-3">No lessons in this module</p>
                              <button
                                type="button"
                                onClick={() => addLesson(moduleIndex)}
                                className="inline-flex items-center gap-2 text-secondary hover:text-blue-700 text-sm font-medium"
                              >
                                <Plus className="w-4 h-4" />
                                Add First Lesson
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {module.lessons.map((lesson, lessonIndex) => (
                                <div key={lessonIndex} className="border border-gray-200 rounded-lg p-4 bg-white">
                                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Lesson Title *
                                      </label>
                                      <input
                                        type="text"
                                        value={lesson.title}
                                        onChange={(e) => updateLesson(moduleIndex, lessonIndex, 'title', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                        placeholder="Enter lesson title"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Duration (minutes)
                                      </label>
                                      <input
                                        type="number"
                                        value={lesson.duration_minutes || ''}
                                        onChange={(e) => updateLesson(moduleIndex, lessonIndex, 'duration_minutes', e.target.value ? parseInt(e.target.value) : undefined)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                        placeholder="e.g., 15"
                                        min="1"
                                      />
                                    </div>
                                  </div>

                                  <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Description
                                    </label>
                                    <textarea
                                      value={lesson.description}
                                      onChange={(e) => updateLesson(moduleIndex, lessonIndex, 'description', e.target.value)}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                      rows={2}
                                      placeholder="Brief lesson description"
                                    />
                                  </div>

                                  {/* Video Section */}
                                  <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Video Content
                                    </label>
                                    <div className="flex gap-2 mb-3">
                                      <button
                                        type="button"
                                        onClick={() => updateLesson(moduleIndex, lessonIndex, 'video_type', 'youtube')}
                                        className={`flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${
                                          lesson.video_type === 'youtube'
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                        }`}
                                      >
                                        <Link className="w-4 h-4" />
                                        YouTube Link
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => updateLesson(moduleIndex, lessonIndex, 'video_type', 'upload')}
                                        className={`flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${
                                          lesson.video_type === 'upload'
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                        }`}
                                      >
                                        <Video className="w-4 h-4" />
                                        Upload Video
                                      </button>
                                    </div>

                                    {lesson.video_type === 'youtube' && (
                                      <input
                                        type="text"
                                        value={lesson.video_url || ''}
                                        onChange={(e) => updateLesson(moduleIndex, lessonIndex, 'video_url', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                        placeholder="https://www.youtube.com/watch?v=..."
                                      />
                                    )}

                                    {lesson.video_type === 'upload' && (
                                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                        <Video className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                        <p className="text-sm text-gray-600 mb-2">Video upload coming soon</p>
                                        <p className="text-xs text-gray-500">For now, please use YouTube links</p>
                                      </div>
                                    )}
                                  </div>

                                  {/* Quiz Assignment */}
                                  <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Attach Quiz (Optional)
                                    </label>
                                    <select
                                      value={lesson.quiz_id || ''}
                                      onChange={(e) => updateLesson(moduleIndex, lessonIndex, 'quiz_id', e.target.value || undefined)}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    >
                                      <option value="">No quiz</option>
                                      {availableQuizzes.map((quiz) => (
                                        <option key={quiz.id} value={quiz.id}>
                                          {quiz.title}
                                        </option>
                                      ))}
                                    </select>
                                  </div>

                                  {/* Lesson Content */}
                                  <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Lesson Content
                                    </label>
                                    <textarea
                                      value={lesson.content}
                                      onChange={(e) => updateLesson(moduleIndex, lessonIndex, 'content', e.target.value)}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                      rows={4}
                                      placeholder="Enter lesson content, instructions, or notes..."
                                    />
                                  </div>

                                  {/* Lesson Options */}
                                  <div className="flex items-center justify-between">
                                    <label className="flex items-center">
                                      <input
                                        type="checkbox"
                                        checked={lesson.is_free_preview}
                                        onChange={(e) => updateLesson(moduleIndex, lessonIndex, 'is_free_preview', e.target.checked)}
                                        className="rounded border-gray-300 text-secondary focus:ring-blue-500"
                                      />
                                      <span className="ml-2 text-sm text-gray-700">
                                        Free preview lesson
                                      </span>
                                    </label>
                                    <button
                                      type="button"
                                      onClick={() => deleteLesson(moduleIndex, lessonIndex)}
                                      className="text-primary hover:text-primary/80 p-2 hover:bg-primary/5 rounded transition-colors"
                                      title="Delete lesson"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={() => {
                logger.debug('❌ [COURSE_FORM] Cancel button clicked - closing form')
                onClose()
              }}
              className="px-4 py-2 text-secondary-foreground bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-brand hover:bg-brand/90 text-brand-foreground rounded-lg transition-colors disabled:opacity-50 flex items-center"
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
      </>
    )

  if (embedded) {
    return (
      <div className="w-full max-w-none">
        {formContent}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {formContent}
      </div>
    </div>
  )
}
