'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, Save, Loader2, Plus, Trash2, Upload, PlayCircle, FileText, Link, GripVertical, Image as ImageIcon } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { uploadCourseImage } from '@/lib/storage'
import { CourseImage } from '@/components/OptimizedImage'

interface Module {
  id?: string
  title: string
  description: string
  order_index: number
  is_published: boolean
  lessons: Lesson[]
}

interface Lesson {
  id?: string
  title: string
  description: string
  content: string
  video_url: string
  duration_minutes: number
  order_index: number
  is_published: boolean
  is_free_preview: boolean
  resources: Resource[]
}

interface Resource {
  id?: string
  title: string
  description: string
  file_url: string
  file_type: string
  file_size_bytes?: number
  is_downloadable: boolean
}

interface EnhancedCourseFormProps {
  course?: {
    id: string
    title: string
    description: string
    instructor_name: string
    price: number
    original_price?: number
    discount_percentage?: number
    category: string
    level: 'beginner' | 'intermediate' | 'advanced'
    duration: string
    image_url?: string
    video_preview_url?: string
    tags?: string[]
    prerequisites?: string[]
    learning_objectives?: string[]
    status?: string
    is_published: boolean
    is_free?: boolean
  }
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const categories = [
  'Programming', 'Data Science', 'Design', 'Business', 'Marketing',
  'Language', 'Music', 'Photography', 'Health & Fitness', 'Other'
]

const levels = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' }
]

const statuses = [
  { value: 'draft', label: 'Draft' },
  { value: 'review', label: 'In Review' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' }
]

export function EnhancedCourseForm({ course, isOpen, onClose, onSuccess }: EnhancedCourseFormProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'details' | 'content' | 'pricing'>('details')
  const [uploadingImage, setUploadingImage] = useState(false)
  
  // Course basic details
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructor_name: '',
    category: 'Programming',
    level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    duration: '',
    image_url: '',
    video_preview_url: '',
    tags: [] as string[],
    prerequisites: [] as string[],
    learning_objectives: [] as string[],
    status: 'draft',
    is_published: false
  })

  // Pricing details
  const [pricingData, setPricingData] = useState({
    price: 0,
    original_price: 0,
    discount_percentage: 0,
    is_free: false
  })

  // Course content
  const [modules, setModules] = useState<Module[]>([])
  const [draggedModule, setDraggedModule] = useState<number | null>(null)

  const loadCourseContent = useCallback(async () => {
    if (!course?.id) return

    try {
      const { data: modulesData, error: modulesError } = await supabase
        .from('course_modules')
        .select(`
          *,
          course_lessons (
            *,
            course_resources (*)
          )
        `)
        .eq('course_id', course.id)
        .order('order_index')

      if (modulesError) throw modulesError

      const formattedModules = modulesData.map(module => ({
        id: module.id,
        title: module.title,
        description: module.description || '',
        order_index: module.order_index,
        is_published: module.is_published,
        lessons: module.course_lessons
          .sort((a: any, b: any) => a.order_index - b.order_index)
          .map((lesson: any) => ({
            id: lesson.id,
            title: lesson.title,
            description: lesson.description || '',
            content: lesson.content || '',
            video_url: lesson.video_url || '',
            duration_minutes: lesson.duration_minutes || 0,
            order_index: lesson.order_index,
            is_published: lesson.is_published,
            is_free_preview: lesson.is_free_preview,
            resources: lesson.course_resources || []
          }))
      }))

      setModules(formattedModules)
    } catch (err) {
      console.error('Error loading course content:', err)
    }
  }, [course?.id])

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title,
        description: course.description,
        instructor_name: course.instructor_name,
        category: course.category,
        level: course.level,
        duration: course.duration,
        image_url: course.image_url || '',
        video_preview_url: course.video_preview_url || '',
        tags: course.tags || [],
        prerequisites: course.prerequisites || [],
        learning_objectives: course.learning_objectives || [],
        status: course.status || 'draft',
        is_published: course.is_published
      })

      setPricingData({
        price: course.price,
        original_price: course.original_price || course.price,
        discount_percentage: course.discount_percentage || 0,
        is_free: course.is_free || false
      })

      loadCourseContent()
    } else {
      // Reset form for new course
      setFormData({
        title: '',
        description: '',
        instructor_name: user?.name || '',
        category: 'Programming',
        level: 'beginner',
        duration: '',
        image_url: '',
        video_preview_url: '',
        tags: [],
        prerequisites: [],
        learning_objectives: [],
        status: 'draft',
        is_published: false
      })

      setPricingData({
        price: 0,
        original_price: 0,
        discount_percentage: 0,
        is_free: false
      })

      setModules([])
    }
    setError(null)
    setActiveTab('details')
  }, [course, user, isOpen, loadCourseContent])

  const addModule = () => {
    const newModule: Module = {
      title: '',
      description: '',
      order_index: modules.length,
      is_published: false,
      lessons: []
    }
    setModules([...modules, newModule])
  }

  const updateModule = (index: number, field: keyof Module, value: any) => {
    const updated = [...modules]
    updated[index] = { ...updated[index], [field]: value } as Module
    setModules(updated)
  }

  const deleteModule = (index: number) => {
    const updated = modules.filter((_, i) => i !== index)
    // Update order indexes
    updated.forEach((module, i) => {
      module.order_index = i
    })
    setModules(updated)
  }

  const addLesson = (moduleIndex: number) => {
    const updated = [...modules]
    if (!updated[moduleIndex]) return
    
    const newLesson: Lesson = {
      title: '',
      description: '',
      content: '',
      video_url: '',
      duration_minutes: 0,
      order_index: updated[moduleIndex].lessons.length,
      is_published: false,
      is_free_preview: false,
      resources: []
    }
    updated[moduleIndex].lessons.push(newLesson)
    setModules(updated)
  }

  const updateLesson = (moduleIndex: number, lessonIndex: number, field: keyof Lesson, value: any) => {
    const updated = [...modules]
    if (!updated[moduleIndex] || !updated[moduleIndex].lessons[lessonIndex]) return
    
    updated[moduleIndex].lessons[lessonIndex] = {
      ...updated[moduleIndex].lessons[lessonIndex],
      [field]: value
    } as Lesson
    setModules(updated)
  }

  const deleteLesson = (moduleIndex: number, lessonIndex: number) => {
    const updated = [...modules]
    if (!updated[moduleIndex]) return
    
    updated[moduleIndex].lessons = updated[moduleIndex].lessons.filter((_, i) => i !== lessonIndex)
    // Update order indexes
    updated[moduleIndex].lessons.forEach((lesson, i) => {
      lesson.order_index = i
    })
    setModules(updated)
  }

  const addResource = (moduleIndex: number, lessonIndex: number) => {
    const updated = [...modules]
    if (!updated[moduleIndex] || !updated[moduleIndex].lessons[lessonIndex]) return
    
    const newResource: Resource = {
      title: '',
      description: '',
      file_url: '',
      file_type: 'pdf',
      is_downloadable: true
    }
    updated[moduleIndex].lessons[lessonIndex].resources.push(newResource)
    setModules(updated)
  }

  const updateResource = (moduleIndex: number, lessonIndex: number, resourceIndex: number, field: keyof Resource, value: any) => {
    const updated = [...modules]
    if (!updated[moduleIndex] || !updated[moduleIndex].lessons[lessonIndex] || !updated[moduleIndex].lessons[lessonIndex].resources[resourceIndex]) return
    
    updated[moduleIndex].lessons[lessonIndex].resources[resourceIndex] = {
      ...updated[moduleIndex].lessons[lessonIndex].resources[resourceIndex],
      [field]: value
    } as Resource
    setModules(updated)
  }

  const deleteResource = (moduleIndex: number, lessonIndex: number, resourceIndex: number) => {
    const updated = [...modules]
    if (!updated[moduleIndex] || !updated[moduleIndex].lessons[lessonIndex]) return
    
    updated[moduleIndex].lessons[lessonIndex].resources = updated[moduleIndex].lessons[lessonIndex].resources.filter((_, i) => i !== resourceIndex)
    setModules(updated)
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    setError(null)

    try {
      // Create a temporary course ID for new courses
      const courseId = course?.id || `temp-${Date.now()}`
      const result = await uploadCourseImage(file, courseId)
      
      if (result.error) {
        setError(result.error)
      } else if (result.url) {
        setFormData({ ...formData, image_url: result.url })
      }
    } catch (err) {
      setError('Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      let courseId: string

      const courseData = {
        ...formData,
        ...pricingData,
        instructor_id: user!.id,
        updated_at: new Date().toISOString()
      }

      if (course?.id) {
        // Update existing course
        const { error } = await supabase
          .from('courses')
          .update(courseData)
          .eq('id', course.id)

        if (error) throw error
        courseId = course.id
      } else {
        // Create new course
        const { data, error } = await supabase
          .from('courses')
          .insert(courseData)
          .select()
          .single()

        if (error) throw error
        courseId = data.id
      }

      // Save modules and lessons
      await saveCourseContent(courseId)

      onSuccess()
      onClose()
    } catch (err) {
      console.error('Error saving course:', err)
      setError(err instanceof Error ? err.message : 'Failed to save course')
    } finally {
      setLoading(false)
    }
  }

  const saveCourseContent = async (courseId: string) => {
    // Delete existing modules if updating
    if (course?.id) {
      await supabase
        .from('course_modules')
        .delete()
        .eq('course_id', courseId)
    }

    // Insert new modules and lessons
    for (const courseModule of modules) {
      const { data: moduleData, error: moduleError } = await supabase
        .from('course_modules')
        .insert({
          course_id: courseId,
          title: courseModule.title,
          description: courseModule.description,
          order_index: courseModule.order_index,
          is_published: courseModule.is_published
        })
        .select()
        .single()

      if (moduleError) throw moduleError

      // Insert lessons for this module
      for (const lesson of courseModule.lessons) {
        const { data: lessonData, error: lessonError } = await supabase
          .from('course_lessons')
          .insert({
            module_id: moduleData.id,
            title: lesson.title,
            description: lesson.description,
            content: lesson.content,
            video_url: lesson.video_url,
            duration_minutes: lesson.duration_minutes,
            order_index: lesson.order_index,
            is_published: lesson.is_published,
            is_free_preview: lesson.is_free_preview
          })
          .select()
          .single()

        if (lessonError) throw lessonError

        // Insert resources for this lesson
        if (lesson.resources.length > 0) {
          const resourcesData = lesson.resources.map(resource => ({
            lesson_id: lessonData.id,
            title: resource.title,
            description: resource.description,
            file_url: resource.file_url,
            file_type: resource.file_type,
            file_size_bytes: resource.file_size_bytes,
            is_downloadable: resource.is_downloadable
          }))

          const { error: resourcesError } = await supabase
            .from('course_resources')
            .insert(resourcesData)

          if (resourcesError) throw resourcesError
        }
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {course ? 'Edit Course' : 'Create New Course'}
            </h2>
            <p className="text-sm text-gray-500">
              {course ? 'Update course details and content' : 'Create a comprehensive course with modules and lessons'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b bg-gray-50">
          {[
            { id: 'details', label: 'Course Details' },
            { id: 'content', label: 'Content & Modules' },
            { id: 'pricing', label: 'Pricing & Settings' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {activeTab === 'details' && (
              <div className="space-y-6">
                {/* Basic Course Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Course Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
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
                      value={formData.instructor_name}
                      onChange={(e) => setFormData({ ...formData, instructor_name: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter instructor name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
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
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: e.target.value as any })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {levels.map(level => (
                        <option key={level.value} value={level.value}>{level.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration
                    </label>
                    <input
                      type="text"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 4 weeks, 20 hours"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {statuses.map(status => (
                        <option key={status.value} value={status.value}>{status.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe what students will learn in this course"
                  />
                </div>

                {/* Media URLs */}
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-gray-900">Course Media</h4>
                  
                  {/* Course Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Course Thumbnail
                    </label>
                    
                    <div className="flex items-start gap-6">
                      {/* Current Image Preview */}
                      <div className="flex-shrink-0">
                        <div className="w-40 h-30 rounded-lg overflow-hidden border-2 border-dashed border-gray-300">
                          {formData.image_url ? (
                            <CourseImage
                              src={formData.image_url}
                              alt="Course thumbnail"
                              size="small"
                              className="w-full h-full"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-50">
                              <ImageIcon className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Upload Controls */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <label className="relative cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              disabled={uploadingImage}
                              className="sr-only"
                            />
                            <div className={`inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium transition-colors ${
                              uploadingImage
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}>
                              {uploadingImage ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Uploading...
                                </>
                              ) : (
                                <>
                                  <Upload className="w-4 h-4" />
                                  Upload Image
                                </>
                              )}
                            </div>
                          </label>
                          
                          {formData.image_url && (
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, image_url: '' })}
                              className="text-red-600 hover:text-red-700 text-sm font-medium"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        
                        <p className="text-xs text-gray-500">
                          Upload a course thumbnail image. Recommended size: 400x300px. Max file size: 5MB.
                        </p>
                        
                        {/* Manual URL Input */}
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-600 mb-2">
                            Or enter image URL manually:
                          </label>
                          <input
                            type="url"
                            value={formData.image_url}
                            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            placeholder="https://example.com/image.jpg"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Preview Video URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preview Video URL
                    </label>
                    <input
                      type="url"
                      value={formData.video_preview_url}
                      onChange={(e) => setFormData({ ...formData, video_preview_url: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://youtube.com/watch?v=..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Link to a preview video (YouTube, Vimeo, etc.)
                    </p>
                  </div>
                </div>

                {/* Published Status */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_published"
                    checked={formData.is_published}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_published" className="ml-2 text-sm text-gray-700">
                    Publish this course (make it visible to students)
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'content' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Course Modules</h3>
                  <button
                    type="button"
                    onClick={addModule}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Module
                  </button>
                </div>

                {modules.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No modules yet. Click &ldquo;Add Module&rdquo; to get started.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {modules.map((module, moduleIndex) => (
                      <div key={moduleIndex} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <GripVertical className="w-5 h-5 text-gray-400" />
                            <div className="flex-1">
                              <input
                                type="text"
                                value={module.title}
                                onChange={(e) => updateModule(moduleIndex, 'title', e.target.value)}
                                placeholder="Module title"
                                className="text-lg font-semibold bg-transparent border-none p-0 focus:ring-0 focus:outline-none w-full"
                              />
                              <textarea
                                value={module.description}
                                onChange={(e) => updateModule(moduleIndex, 'description', e.target.value)}
                                placeholder="Module description"
                                rows={2}
                                className="mt-2 text-sm text-gray-600 bg-transparent border-none p-0 focus:ring-0 focus:outline-none w-full resize-none"
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={module.is_published}
                              onChange={(e) => updateModule(moduleIndex, 'is_published', e.target.checked)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="text-sm text-gray-500">Published</span>
                            <button
                              type="button"
                              onClick={() => deleteModule(moduleIndex)}
                              className="text-red-600 hover:text-red-700 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Lessons */}
                        <div className="ml-8">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-medium text-gray-700">Lessons</h4>
                            <button
                              type="button"
                              onClick={() => addLesson(moduleIndex)}
                              className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" />
                              Add Lesson
                            </button>
                          </div>

                          {module.lessons.length === 0 ? (
                            <p className="text-sm text-gray-500 py-4">No lessons yet.</p>
                          ) : (
                            <div className="space-y-4">
                              {module.lessons.map((lesson, lessonIndex) => (
                                <div key={lessonIndex} className="border border-gray-100 rounded-lg p-4 bg-gray-50">
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                      <input
                                        type="text"
                                        value={lesson.title}
                                        onChange={(e) => updateLesson(moduleIndex, lessonIndex, 'title', e.target.value)}
                                        placeholder="Lesson title"
                                        className="font-medium bg-transparent border-none p-0 focus:ring-0 focus:outline-none w-full"
                                      />
                                      <input
                                        type="text"
                                        value={lesson.description}
                                        onChange={(e) => updateLesson(moduleIndex, lessonIndex, 'description', e.target.value)}
                                        placeholder="Lesson description"
                                        className="mt-1 text-sm text-gray-600 bg-transparent border-none p-0 focus:ring-0 focus:outline-none w-full"
                                      />
                                    </div>
                                    <div className="flex items-center gap-2 ml-4">
                                      <input
                                        type="checkbox"
                                        checked={lesson.is_free_preview}
                                        onChange={(e) => updateLesson(moduleIndex, lessonIndex, 'is_free_preview', e.target.checked)}
                                        className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                      />
                                      <span className="text-xs text-gray-500">Free</span>
                                      <button
                                        type="button"
                                        onClick={() => deleteLesson(moduleIndex, lessonIndex)}
                                        className="text-red-600 hover:text-red-700 p-1"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-3 mb-3">
                                    <input
                                      type="url"
                                      value={lesson.video_url}
                                      onChange={(e) => updateLesson(moduleIndex, lessonIndex, 'video_url', e.target.value)}
                                      placeholder="Video URL"
                                      className="text-sm px-2 py-1 border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <input
                                      type="number"
                                      value={lesson.duration_minutes}
                                      onChange={(e) => updateLesson(moduleIndex, lessonIndex, 'duration_minutes', parseInt(e.target.value) || 0)}
                                      placeholder="Duration (minutes)"
                                      className="text-sm px-2 py-1 border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                    />
                                  </div>

                                  <textarea
                                    value={lesson.content}
                                    onChange={(e) => updateLesson(moduleIndex, lessonIndex, 'content', e.target.value)}
                                    placeholder="Lesson content/transcript"
                                    rows={3}
                                    className="w-full text-sm px-2 py-1 border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent resize-none"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'pricing' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Pricing & Settings</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Course Price ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={pricingData.price}
                      onChange={(e) => setPricingData({ ...pricingData, price: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Original Price ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={pricingData.original_price}
                      onChange={(e) => setPricingData({ ...pricingData, original_price: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount Percentage (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={pricingData.discount_percentage}
                      onChange={(e) => setPricingData({ ...pricingData, discount_percentage: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>

                  <div className="flex items-center pt-8">
                    <input
                      type="checkbox"
                      id="is_free"
                      checked={pricingData.is_free}
                      onChange={(e) => setPricingData({ ...pricingData, is_free: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_free" className="ml-2 text-sm text-gray-700">
                      This is a free course
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t mt-8">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {course ? 'Update Course' : 'Create Course'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
