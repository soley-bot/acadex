'use client'

import { logger } from '@/lib/logger'

import { useState, useEffect } from 'react'
import { Course, Question } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import SvgIcon from '@/components/ui/SvgIcon'
import { CategorySelector } from '@/components/admin/CategorySelector'
import { CategoryManagement } from '@/components/admin/CategoryManagement'
import { RichTextFormatGuide } from './RichTextFormatGuide'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { uploadCourseImage } from '@/lib/storage'

interface Module {
  id?: string
  title: string
  description: string
  order_index: number
  lessons: Lesson[]
}

interface Lesson {
  id?: string
  title: string
  content: string
  video_url?: string
  duration?: string
  order_index: number
  is_preview: boolean
}

interface LearningOutcome {
  id: string
  description: string
}

interface EnhancedCourseData {
  // Basic course info
  title: string
  description: string
  category: string
  level: 'beginner' | 'intermediate' | 'advanced'
  duration: string
  price: number
  is_published: boolean
  image_url?: string
  instructor_name: string
  
  // Enhanced features
  learning_outcomes: LearningOutcome[]
  prerequisites: string[]
  modules: Module[]
  certificate_enabled: boolean
  estimated_completion_time: string
  difficulty_rating: number
  tags: string[]
}

interface Props {
  course?: Course
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function EnhancedAPICourseForm({ course, isOpen, onClose, onSuccess }: Props) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('basic')
  const [showCategoryManagement, setShowCategoryManagement] = useState(false)

  const [formData, setFormData] = useState<EnhancedCourseData>({
    title: '',
    description: '',
    category: 'english',
    level: 'beginner',
    duration: '',
    price: 0,
    is_published: false,
    instructor_name: '',
    learning_outcomes: [{ id: '1', description: '' }],
    prerequisites: [''],
    modules: [{
      title: '',
      description: '',
      order_index: 0,
      lessons: [{
        title: '',
        content: '',
        order_index: 0,
        is_preview: false
      }]
    }],
    certificate_enabled: false,
    estimated_completion_time: '',
    difficulty_rating: 1,
    tags: ['']
  })

  useEffect(() => {
    const loadCourseData = async () => {
      if (course?.id) {
        // Load full course data including modules and lessons
        try {
          setDataLoading(true)
          const response = await fetch(`/api/admin/courses/enhanced?id=${course.id}`)
          const result = await response.json()
          
          if (result.success && result.data) {
            const fullCourse = result.data
            
            // Transform modules and lessons data
            const modules = fullCourse.course_modules?.length > 0 
              ? fullCourse.course_modules.map((module: any) => ({
                  id: module.id,
                  title: module.title || '',
                  description: module.description || '',
                  order_index: module.order_index || 0,
                  lessons: module.course_lessons?.map((lesson: any) => ({
                    id: lesson.id,
                    title: lesson.title || '',
                    content: lesson.content || '',
                    video_url: lesson.video_url || '',
                    duration: lesson.duration || '',
                    order_index: lesson.order_index || 0,
                    is_preview: lesson.is_preview || false
                  })) || []
                }))
              : [{
                  title: '',
                  description: '',
                  order_index: 0,
                  lessons: [{
                    title: '',
                    content: '',
                    order_index: 0,
                    is_preview: false
                  }]
                }]

            // Transform learning outcomes
            const learningOutcomes = fullCourse.learning_outcomes?.length > 0
              ? fullCourse.learning_outcomes.map((outcome: string, index: number) => ({
                  id: (index + 1).toString(),
                  description: outcome
                }))
              : [{ id: '1', description: '' }]

            // Transform prerequisites
            const prerequisites = fullCourse.prerequisites?.length > 0
              ? fullCourse.prerequisites
              : ['']

            // Transform tags
            const tags = fullCourse.tags?.length > 0
              ? fullCourse.tags
              : ['']

            setFormData({
              title: fullCourse.title || '',
              description: fullCourse.description || '',
              category: fullCourse.category || 'english',
              level: fullCourse.level || 'beginner',
              duration: fullCourse.duration || '',
              price: fullCourse.price || 0,
              is_published: fullCourse.is_published || false,
              instructor_name: fullCourse.instructor_name || '',
              image_url: fullCourse.image_url || '',
              learning_outcomes: learningOutcomes,
              prerequisites: prerequisites,
              modules: modules,
              certificate_enabled: fullCourse.certificate_enabled || false,
              estimated_completion_time: fullCourse.estimated_completion_time || '',
              difficulty_rating: fullCourse.difficulty_rating || 1,
              tags: tags
            })
          }
        } catch (error) {
          logger.error('Error loading course data:', error)
        } finally {
          setDataLoading(false)
        }
      } else {
        // New course - use defaults
        setFormData({
          title: '',
          description: '',
          category: 'english',
          level: 'beginner',
          duration: '',
          price: 0,
          is_published: false,
          instructor_name: '',
          image_url: '',
          learning_outcomes: [{ id: '1', description: '' }],
          prerequisites: [''],
          modules: [{
            title: '',
            description: '',
            order_index: 0,
            lessons: [{
              title: '',
              content: '',
              order_index: 0,
              is_preview: false
            }]
          }],
          certificate_enabled: false,
          estimated_completion_time: '',
          difficulty_rating: 1,
          tags: ['']
        })
      }
    }

    loadCourseData()
  }, [course])

  // Learning Outcomes Management
  const addLearningOutcome = () => {
    setFormData(prev => ({
      ...prev,
      learning_outcomes: [...prev.learning_outcomes, { id: Date.now().toString(), description: '' }]
    }))
  }

  const updateLearningOutcome = (id: string, description: string) => {
    setFormData(prev => ({
      ...prev,
      learning_outcomes: prev.learning_outcomes.map(outcome =>
        outcome.id === id ? { ...outcome, description } : outcome
      )
    }))
  }

  const removeLearningOutcome = (id: string) => {
    setFormData(prev => ({
      ...prev,
      learning_outcomes: prev.learning_outcomes.filter(outcome => outcome.id !== id)
    }))
  }

  // Prerequisites Management
  const addPrerequisite = () => {
    setFormData(prev => ({
      ...prev,
      prerequisites: [...prev.prerequisites, '']
    }))
  }

  const updatePrerequisite = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      prerequisites: prev.prerequisites.map((prereq, i) => i === index ? value : prereq)
    }))
  }

  const removePrerequisite = (index: number) => {
    setFormData(prev => ({
      ...prev,
      prerequisites: prev.prerequisites.filter((_, i) => i !== index)
    }))
  }

  // Module Management
  const addModule = () => {
    setFormData(prev => ({
      ...prev,
      modules: [...prev.modules, {
        title: '',
        description: '',
        order_index: prev.modules.length,
        lessons: [{
          title: '',
          content: '',
          order_index: 0,
          is_preview: false
        }]
      }]
    }))
  }

  const updateModule = (moduleIndex: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.map((module, i) =>
        i === moduleIndex ? { ...module, [field]: value } : module
      )
    }))
  }

  const removeModule = (moduleIndex: number) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.filter((_, i) => i !== moduleIndex)
    }))
  }

  // Lesson Management
  const addLesson = (moduleIndex: number) => {
    setFormData(prev => {
      const updated = [...prev.modules]
      const currentModule = updated[moduleIndex]
      if (currentModule) {
        updated[moduleIndex] = {
          ...currentModule,
          lessons: [...currentModule.lessons, {
            title: '',
            content: '',
            order_index: currentModule.lessons.length,
            is_preview: false
          }]
        }
      }
      return { ...prev, modules: updated }
    })
  }

  const updateLesson = (moduleIndex: number, lessonIndex: number, field: string, value: any) => {
    setFormData(prev => {
      const updated = [...prev.modules]
      const currentModule = updated[moduleIndex]
      if (currentModule) {
        updated[moduleIndex] = {
          ...currentModule,
          lessons: currentModule.lessons.map((lesson, i) =>
            i === lessonIndex ? { ...lesson, [field]: value } : lesson
          )
        }
      }
      return { ...prev, modules: updated }
    })
  }

  const removeLesson = (moduleIndex: number, lessonIndex: number) => {
    setFormData(prev => {
      const updated = [...prev.modules]
      const currentModule = updated[moduleIndex]
      if (currentModule) {
        updated[moduleIndex] = {
          ...currentModule,
          lessons: currentModule.lessons.filter((_, i) => i !== lessonIndex)
        }
      }
      return { ...prev, modules: updated }
    })
  }

  // Tags Management
  const addTag = () => {
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, '']
    }))
  }

  const updateTag = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.map((tag, i) => i === index ? value : tag)
    }))
  }

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      setError('You must be logged in to create courses')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/admin/courses/enhanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseData: {
            ...formData,
            instructor_id: user.id, // Add this line to set the instructor_id
            id: course?.id
          },
          action: course ? 'update' : 'create',
          userId: user.id
        })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to save course')
      }

      setSuccess(course ? 'Course updated successfully!' : 'Course created successfully!')
      
      // Call onSuccess to refresh the course list, but don't auto-close
      onSuccess()
      
      // Optional: Auto-close after longer delay (or remove entirely)
      // setTimeout(() => {
      //   onClose()
      // }, 3000)

    } catch (err: any) {
      setError(err.message || 'An error occurred while saving the course')
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: 'info' },
    { id: 'outcomes', label: 'Learning Outcomes', icon: 'target' },
    { id: 'modules', label: 'Modules & Lessons', icon: 'book' },
    { id: 'settings', label: 'Advanced Settings', icon: 'settings' }
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-xl border border-gray-200">
        <div className="flex items-center justify-between p-6 sm:p-8 border-b bg-gradient-to-r from-gray-50 via-white to-purple-50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg">
              <SvgIcon icon="book" size={24} variant="white" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                {course ? 'Edit Course' : 'Create New Course'}
              </h2>
              <p className="text-gray-600 text-lg mt-1">
                {course ? 'Update your course content and settings' : 'Build engaging educational content for your students'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-white/50 rounded-lg"
          >
            <SvgIcon icon="close" size={24} className="text-gray-400" />
          </button>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex border-b bg-gray-50">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 sm:px-8 py-4 text-base font-semibold transition-all duration-200 ${
                activeTab === tab.id
                  ? 'text-purple-700 border-b-3 border-purple-600 bg-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              <SvgIcon icon={tab.icon} size={16} className={activeTab === tab.id ? 'text-purple-600' : 'text-gray-600'} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="p-6">
            {/* Data Loading Indicator */}
            {dataLoading && (
              <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-xl">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-purple-300 border-t-purple-600 mr-3"></div>
                  <span className="text-purple-800 font-medium">Loading course data...</span>
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-emerald-500 p-1 rounded-full mr-3">
                      <SvgIcon icon="check" size={16} variant="white" />
                    </div>
                    <span className="text-emerald-800 font-semibold">{success}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-emerald-700 text-sm">You can continue editing or close the form.</span>
                    <button
                      type="button"
                      onClick={() => setSuccess(null)}
                      className="text-emerald-600 hover:text-emerald-800 p-1 rounded-lg hover:bg-emerald-200 transition-colors"
                    >
                      <SvgIcon icon="close" size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <SvgIcon icon="warning" size={20} className="text-red-600 mr-2" />
                  <span className="text-red-800">{error}</span>
                </div>
              </div>
            )}

            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Course Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter course title"
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
                      onChange={(e) => setFormData(prev => ({ ...prev, instructor_name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter instructor name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Description *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe what students will learn in this course"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <CategorySelector
                      value={formData.category}
                      onChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                      type="course"
                      onManageCategories={() => setShowCategoryManagement(true)}
                      placeholder="Select a category"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Level *
                    </label>
                    <select
                      required
                      value={formData.level}
                      onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value as 'beginner' | 'intermediate' | 'advanced' }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
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
                      onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration
                    </label>
                    <input
                      type="text"
                      value={formData.duration}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 4 weeks, 20 hours"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Course Image
                    </label>
                    <ImageUpload
                      value={formData.image_url || ''}
                      onChange={(url) => setFormData(prev => ({ ...prev, image_url: url || '' }))}
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
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_published"
                    checked={formData.is_published}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_published: e.target.checked }))}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <label htmlFor="is_published" className="ml-2 text-sm text-gray-700">
                    Publish course immediately
                  </label>
                </div>
              </div>
            )}

            {/* Learning Outcomes Tab */}
            {activeTab === 'outcomes' && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Learning Outcomes</h3>
                    <button
                      type="button"
                      onClick={addLearningOutcome}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-2"
                    >
                      <SvgIcon icon="plus" size={16} variant="white" />
                      Add Outcome
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Define what students will be able to do after completing this course.
                  </p>
                  
                  <div className="space-y-3">
                    {formData.learning_outcomes.map((outcome, index) => (
                      <div key={outcome.id} className="flex items-center gap-3">
                        <span className="text-sm text-gray-500 min-w-8">{index + 1}.</span>
                        <input
                          type="text"
                          value={outcome.description}
                          onChange={(e) => updateLearningOutcome(outcome.id, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Students will be able to..."
                        />
                        {formData.learning_outcomes.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeLearningOutcome(outcome.id)}
                            className="text-red-600 hover:text-red-700 p-2"
                          >
                            <SvgIcon icon="close" size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Prerequisites</h3>
                    <button
                      type="button"
                      onClick={addPrerequisite}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-2"
                    >
                      <SvgIcon icon="plus" size={16} variant="white" />
                      Add Prerequisite
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    List any knowledge or skills students should have before taking this course.
                  </p>
                  
                  <div className="space-y-3">
                    {formData.prerequisites.map((prereq, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <span className="text-sm text-gray-500 min-w-4">•</span>
                        <input
                          type="text"
                          value={prereq}
                          onChange={(e) => updatePrerequisite(index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g. Basic English understanding"
                        />
                        {formData.prerequisites.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removePrerequisite(index)}
                            className="text-red-600 hover:text-red-700 p-2"
                          >
                            <SvgIcon icon="close" size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Modules & Lessons Tab */}
            {activeTab === 'modules' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Course Modules</h3>
                    <p className="text-sm text-gray-600">Organize your course content into modules and lessons.</p>
                  </div>
                  <button
                    type="button"
                    onClick={addModule}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                  >
                    <SvgIcon icon="plus" size={16} variant="white" />
                    Add Module
                  </button>
                </div>

                <div className="space-y-6">
                  {formData.modules.map((module, moduleIndex) => (
                    <div key={moduleIndex} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-900">Module {moduleIndex + 1}</h4>
                        {formData.modules.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeModule(moduleIndex)}
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            <SvgIcon icon="ban" size={16} />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Module Title
                          </label>
                          <input
                            type="text"
                            value={module.title}
                            onChange={(e) => updateModule(moduleIndex, 'title', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter module title"
                          />
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Module Description
                        </label>
                        <textarea
                          rows={2}
                          value={module.description}
                          onChange={(e) => updateModule(moduleIndex, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Describe what this module covers"
                        />
                      </div>

                      {/* Lessons */}
                      <div className="border-t pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="text-sm font-medium text-gray-700">Lessons</h5>
                          <button
                            type="button"
                            onClick={() => addLesson(moduleIndex)}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm flex items-center gap-2"
                          >
                            <SvgIcon icon="plus" size={14} variant="white" />
                            Add Lesson
                          </button>
                        </div>

                        <div className="space-y-4">
                          {module.lessons.map((lesson, lessonIndex) => (
                            <div key={lessonIndex} className="bg-gray-50 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-medium text-gray-700">
                                  Lesson {lessonIndex + 1}
                                </span>
                                {module.lessons.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeLesson(moduleIndex, lessonIndex)}
                                    className="text-red-600 hover:text-red-700 p-1"
                                  >
                                    <SvgIcon icon="close" size={14} />
                                  </button>
                                )}
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                <input
                                  type="text"
                                  value={lesson.title}
                                  onChange={(e) => updateLesson(moduleIndex, lessonIndex, 'title', e.target.value)}
                                  className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="Lesson title"
                                />
                                <input
                                  type="text"
                                  value={lesson.duration || ''}
                                  onChange={(e) => updateLesson(moduleIndex, lessonIndex, 'duration', e.target.value)}
                                  className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="Duration (e.g., 10 min)"
                                />
                              </div>

                              <RichTextFormatGuide />

                              <textarea
                                rows={6}
                                value={lesson.content}
                                onChange={(e) => updateLesson(moduleIndex, lessonIndex, 'content', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
                                placeholder="Lesson content and description. You can use formatting like **bold**, *italic*, ==highlight==, and {{red:colored text}}."
                              />

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <input
                                  type="url"
                                  value={lesson.video_url || ''}
                                  onChange={(e) => updateLesson(moduleIndex, lessonIndex, 'video_url', e.target.value)}
                                  className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="Video URL (optional)"
                                />
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    id={`preview-${moduleIndex}-${lessonIndex}`}
                                    checked={lesson.is_preview}
                                    onChange={(e) => updateLesson(moduleIndex, lessonIndex, 'is_preview', e.target.checked)}
                                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                  />
                                  <label htmlFor={`preview-${moduleIndex}-${lessonIndex}`} className="ml-2 text-sm text-gray-700">
                                    Free preview
                                  </label>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Advanced Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estimated Completion Time
                    </label>
                    <input
                      type="text"
                      value={formData.estimated_completion_time}
                      onChange={(e) => setFormData(prev => ({ ...prev, estimated_completion_time: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 6 weeks"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulty Rating (1-5)
                    </label>
                    <select
                      value={formData.difficulty_rating}
                      onChange={(e) => setFormData(prev => ({ ...prev, difficulty_rating: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={1}>1 - Very Easy</option>
                      <option value={2}>2 - Easy</option>
                      <option value={3}>3 - Moderate</option>
                      <option value={4}>4 - Challenging</option>
                      <option value={5}>5 - Very Challenging</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Course Tags
                    </label>
                    <button
                      type="button"
                      onClick={addTag}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-2"
                    >
                      <SvgIcon icon="plus" size={16} variant="white" />
                      Add Tag
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.tags.map((tag, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <input
                          type="text"
                          value={tag}
                          onChange={(e) => updateTag(index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., conversation, grammar, IELTS"
                        />
                        {formData.tags.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeTag(index)}
                            className="text-red-600 hover:text-red-700 p-2"
                          >
                            <SvgIcon icon="close" size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="certificate_enabled"
                    checked={formData.certificate_enabled}
                    onChange={(e) => setFormData(prev => ({ ...prev, certificate_enabled: e.target.checked }))}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <label htmlFor="certificate_enabled" className="ml-2 text-sm text-gray-700">
                    Enable certificate of completion
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="border-t bg-gradient-to-r from-gray-50 to-gray-100 p-6 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {course ? 'Update your course information' : 'Create a new course to start teaching'}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-300 border-t-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <SvgIcon icon="check" size={16} variant="white" />
                    {course ? 'Update Course' : 'Create Course'}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      <CategoryManagement
        isOpen={showCategoryManagement}
        onClose={() => setShowCategoryManagement(false)}
        onCategoryCreated={() => {
          // Categories will be refreshed automatically by CategorySelector
        }}
      />
    </div>
  )
}
