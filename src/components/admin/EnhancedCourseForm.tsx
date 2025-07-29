'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, Save, Loader2, Plus, Trash2, Upload, PlayCircle, FileText, Link, GripVertical, Image as ImageIcon, BookOpen } from 'lucide-react'
import { supabase, Course, CourseModule, CourseLesson, CourseResource } from '@/lib/supabase'
import { createCourse, updateCourse } from '@/lib/database-operations'
import { useAuth } from '@/contexts/AuthContext'
import { uploadCourseImage } from '@/lib/storage'
import { courseCache } from '@/lib/cache'
import { CourseImage } from '@/components/OptimizedImage'
import { categories, levels, statuses } from '@/lib/courseConstants'

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
  course?: Course
  isOpen: boolean
  onClose: () => void
  onSuccess: (updatedCourse?: Course) => void
}

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
    console.log('🔄 [ENHANCED_COURSE_FORM] useEffect triggered')
    console.log('🔄 [ENHANCED_COURSE_FORM] course prop:', course ? course.title : 'none')
    console.log('🔄 [ENHANCED_COURSE_FORM] course id:', course?.id)
    console.log('🔄 [ENHANCED_COURSE_FORM] course updated_at:', course?.updated_at)
    console.log('🔄 [ENHANCED_COURSE_FORM] isOpen:', isOpen)
    console.log('🔄 [ENHANCED_COURSE_FORM] course object reference:', course)
    
    if (course) {
      console.log('✅ [ENHANCED_COURSE_FORM] Setting form data from course prop')
      console.log('✅ [ENHANCED_COURSE_FORM] Setting title to:', course.title)
      console.log('✅ [ENHANCED_COURSE_FORM] Setting description to:', course.description?.substring(0, 50) + '...')
      
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

    console.log('� [SUBMIT] === STARTING COURSE SAVE PROCESS ===')
    console.log('� [SUBMIT] Form Data:', formData)
    console.log('� [SUBMIT] Pricing Data:', pricingData)
    console.log('� [SUBMIT] Modules count:', modules.length)
    console.log('� [SUBMIT] User:', user?.id)
    console.log('� [SUBMIT] Course (editing):', course?.id)
    console.log('🚀 [SUBMIT] Loading state set to true')

    // Add global timeout for the entire save operation
    const saveTimeout = setTimeout(() => {
      console.error('⏰ [SUBMIT] Save operation timed out after 30 seconds')
      setError('Save operation timed out. Please try again.')
      setLoading(false)
    }, 30000) // 30 second timeout (reduced since we have DB timeouts)

    try {
      if (!user) {
        console.error('❌ [SUBMIT] User not authenticated')
        throw new Error('User not authenticated')
      }
      
      console.log('✅ [SUBMIT] User authentication verified')

      // Pre-validation checks specifically for title
      console.log('🔍 [VALIDATION] Running pre-validation checks...')
      console.log('🔍 [VALIDATION] Form title value:', JSON.stringify(formData.title))
      console.log('🔍 [VALIDATION] Title type:', typeof formData.title)
      console.log('🔍 [VALIDATION] Title length:', formData.title?.length || 0)
      
      if (!formData.title || formData.title.trim().length === 0) {
        console.error('❌ [VALIDATION] Title is empty or null')
        throw new Error('Course title is required')
      }

      let courseId: string

      // Prepare course data with proper validation
      console.log('📝 [SUBMIT] Preparing course data...')
      
      // Sanitize and validate title specifically
      const cleanTitle = formData.title
        .replace(/[^a-zA-Z0-9\s\-\.\,\!\?\:\;\(\)\'\"&]/g, '')
        .trim()
      
      console.log('📝 [TITLE_DEBUG] Original title:', formData.title)
      console.log('📝 [TITLE_DEBUG] Cleaned title:', cleanTitle)
      console.log('📝 [TITLE_DEBUG] Clean title length:', cleanTitle.length)
      console.log('📝 [TITLE_DEBUG] Title is valid:', cleanTitle.length > 0)
      console.log('📝 [TITLE_DEBUG] Title passes regex test:', /^[a-zA-Z0-9\s\-\.\,\!\?\:\;\(\)\'\"&]+$/.test(cleanTitle))
      
      if (!cleanTitle || cleanTitle.length === 0) {
        console.error('❌ [TITLE_DEBUG] Title is empty after cleaning')
        throw new Error('Course title contains invalid characters or is empty')
      }
      
      const courseData: Partial<Course> = {
        title: cleanTitle,
        description: formData.description,
        category: formData.category,
        level: formData.level,
        duration: formData.duration,
        image_url: formData.image_url || null,
        video_preview_url: formData.video_preview_url || null,
        tags: formData.tags || null,
        prerequisites: formData.prerequisites || null,
        learning_objectives: formData.learning_objectives?.filter(obj => obj.trim() !== '') || null,
        price: pricingData.price || 0,
        original_price: pricingData.original_price || null,
        discount_percentage: pricingData.discount_percentage || null,
        is_free: (pricingData.price || 0) === 0,
        status: (formData.status || 'draft') as Course['status'],
        is_published: formData.is_published || false,
        instructor_id: user.id,
        instructor_name: formData.instructor_name || user.name || 'Unknown Instructor'
      }

      console.log('💾 Prepared courseData:', courseData)
      console.log('🎯 [SAVE_DEBUG] Learning objectives being saved:', courseData.learning_objectives)
      console.log('🎯 [SAVE_DEBUG] Original learning objectives from form:', formData.learning_objectives)
      console.log('🎯 [SAVE_DEBUG] Learning objectives lengths:', formData.learning_objectives?.map(obj => obj.length))
      console.log('🎯 [SAVE_DEBUG] Total learning objectives size:', JSON.stringify(formData.learning_objectives).length)
      console.log('📝 [SAVE_DEBUG] Course title length:', formData.title.length)
      console.log('📝 [SAVE_DEBUG] Course title preview:', formData.title.substring(0, 100) + (formData.title.length > 100 ? '...' : ''))
      console.log('📝 [SAVE_DEBUG] Course description length:', formData.description.length)
      console.log('⏱️ [SAVE_DEBUG] Course duration:', formData.duration)
      console.log('👤 [SAVE_DEBUG] Instructor ID:', user.id)
      console.log('👤 [SAVE_DEBUG] Instructor name:', formData.instructor_name)
      console.log('🏷️ [SAVE_DEBUG] Category:', formData.category)
      console.log('📚 [SAVE_DEBUG] Modules count:', modules.length)
      console.log('📚 [SAVE_DEBUG] Modules text lengths:', modules.map((m, i) => ({
        moduleIndex: i,
        titleLength: m.title.length,
        descriptionLength: m.description.length,
        lessonsCount: m.lessons.length,
        lessonsTextLengths: m.lessons.map((l, j) => ({
          lessonIndex: j,
          titleLength: l.title.length,
          descriptionLength: l.description.length,
          contentLength: l.content.length
        }))
      })))

      if (course?.id) {
        // Update existing course
        console.log('🔄 [SUBMIT] === UPDATING EXISTING COURSE ===')
        console.log('🔄 [SUBMIT] Course ID:', course.id)
        console.log('🔄 [SUBMIT] Update data:', courseData)
        try {
          const updatedCourse = await updateCourse(course.id, courseData)
          console.log('✅ [SUBMIT] Course update completed:', updatedCourse.id)
          courseId = updatedCourse.id
        } catch (updateError) {
          console.error('❌ [SUBMIT] Error in updateCourse:', updateError)
          throw updateError
        }
      } else {
        // Create new course
        console.log('🆕 [SUBMIT] === CREATING NEW COURSE ===')
        console.log('🆕 [SUBMIT] Course data:', courseData)
        try {
          const newCourse = await createCourse(courseData)
          console.log('✅ [SUBMIT] Course creation completed:', newCourse.id)
          courseId = newCourse.id
        } catch (createError) {
          console.error('❌ [SUBMIT] Error in createCourse:', createError)
          throw createError
        }
      }

      // Save modules and lessons
      console.log('📚 Saving course content for courseId:', courseId)
      console.log('📚 Number of modules to save:', modules.length)
      
      try {
        // Add timeout for course content saving
        const contentSavePromise = saveCourseContent(courseId)
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Course content save timed out after 30 seconds')), 30000)
        )
        
        await Promise.race([contentSavePromise, timeoutPromise])
        console.log('✅ Course content saved successfully')
      } catch (contentError) {
        console.error('❌ Error saving course content:', contentError)
        // Don't throw the error - allow the course to save even if content fails
        console.warn('⚠️ Course saved but content save failed. Course will still be usable.')
      }

      console.log('🎉 All operations completed successfully')
      
      // Invalidate cache to ensure fresh data
      console.log('🗑️ [ENHANCED_COURSE_FORM] Invalidating course cache for courseId:', courseId)
      courseCache.invalidateByTags(['courses', 'courses-list', `course:${courseId}`])
      console.log('🗑️ [ENHANCED_COURSE_FORM] Cache invalidated - all course data should now be fresh')
      
      // Fetch the updated course data to pass to onSuccess
      try {
        const { data: updatedCourse, error: fetchError } = await supabase
          .from('courses')
          .select('*')
          .eq('id', courseId)
          .single()
        
        if (fetchError) {
          console.error('❌ Error fetching updated course:', fetchError)
          onSuccess() // Call without data if fetch fails
        } else {
          console.log('✅ Fetched updated course data:', updatedCourse)
          
          // Update form data immediately with the fresh data
          console.log('🔄 [ENHANCED_COURSE_FORM] === UPDATING FORM DATA WITH FRESH COURSE DATA ===')
          console.log('🔄 [ENHANCED_COURSE_FORM] Fresh course title:', updatedCourse.title)
          console.log('🔄 [ENHANCED_COURSE_FORM] Fresh course description:', updatedCourse.description?.substring(0, 50) + '...')
          console.log('🔄 [ENHANCED_COURSE_FORM] Fresh course learning_objectives:', updatedCourse.learning_objectives)
          
          setFormData({
            title: updatedCourse.title,
            description: updatedCourse.description,
            instructor_name: updatedCourse.instructor_name,
            category: updatedCourse.category,
            level: updatedCourse.level,
            duration: updatedCourse.duration,
            image_url: updatedCourse.image_url || '',
            video_preview_url: updatedCourse.video_preview_url || '',
            tags: updatedCourse.tags || [],
            prerequisites: updatedCourse.prerequisites || [],
            learning_objectives: updatedCourse.learning_objectives || [],
            status: updatedCourse.status || 'draft',
            is_published: updatedCourse.is_published
          })

          setPricingData({
            price: updatedCourse.price,
            original_price: updatedCourse.original_price || updatedCourse.price,
            discount_percentage: updatedCourse.discount_percentage || 0,
            is_free: updatedCourse.is_free || false
          })
          
          console.log('✅ [ENHANCED_COURSE_FORM] Form data updated with fresh course data')
          
          onSuccess(updatedCourse) // Pass updated course data
        }
      } catch (fetchError) {
        console.error('❌ Error in fetch operation:', fetchError)
        onSuccess() // Call without data if fetch fails
      }
      
      // Don't auto-close the form - let the parent component decide based on whether it's editing or creating
    } catch (err: any) {
      console.error('💥 Error saving course:', err)
      
      // Better error handling
      let errorMessage = 'Failed to save course'
      if (err instanceof Error) {
        errorMessage = err.message
      } else if (err?.message) {
        errorMessage = err.message
      } else if (err?.details) {
        errorMessage = err.details
      } else if (typeof err === 'string') {
        errorMessage = err
      }
      
      console.error('📝 Setting error message:', errorMessage)
      setError(errorMessage)
    } finally {
      console.log('🔄 Setting loading to false')
      clearTimeout(saveTimeout) // Clear the timeout if save completes
      setLoading(false)
    }
  }

  const saveCourseContent = async (courseId: string) => {
    console.log('Saving course content for courseId:', courseId)
    console.log('Modules to save:', modules.length)
    
    // If no modules, just return success
    if (modules.length === 0) {
      console.log('✅ No modules to save, skipping course content save')
      return
    }
    
    try {
      // Delete existing modules if updating (cascade will handle lessons and resources)
      if (course?.id) {
        console.log('Deleting existing modules for course:', course.id)
        const { error: deleteError } = await supabase
          .from('course_modules')
          .delete()
          .eq('course_id', courseId)
        
        if (deleteError) {
          console.error('Error deleting existing modules:', deleteError)
          throw new Error(`Failed to delete existing modules: ${deleteError.message}`)
        }
      }

      // Insert new modules and lessons
      for (let moduleIndex = 0; moduleIndex < modules.length; moduleIndex++) {
        const courseModule = modules[moduleIndex]
        
        if (!courseModule) continue
        
        console.log(`Inserting module ${moduleIndex + 1}:`, courseModule.title)
        
        // Validate module data
        if (!courseModule.title?.trim()) {
          throw new Error(`Module ${moduleIndex + 1} is missing a title`)
        }

        const { data: moduleData, error: moduleError } = await supabase
          .from('course_modules')
          .insert({
            course_id: courseId,
            title: courseModule.title.trim(),
            description: courseModule.description?.trim() || null,
            order_index: moduleIndex,
            is_published: courseModule.is_published
          })
          .select()
          .single()

        if (moduleError) {
          console.error(`Error inserting module ${moduleIndex + 1}:`, moduleError)
          throw new Error(`Failed to save module "${courseModule.title}": ${moduleError.message}`)
        }

        console.log(`Module ${moduleIndex + 1} saved with ID:`, moduleData.id)

        // Insert lessons for this module
        for (let lessonIndex = 0; lessonIndex < courseModule.lessons.length; lessonIndex++) {
          const lesson = courseModule.lessons[lessonIndex]
          
          if (!lesson) continue
          
          console.log(`Inserting lesson ${lessonIndex + 1} for module ${moduleIndex + 1}:`, lesson.title)
          
          // Validate lesson data
          if (!lesson.title?.trim()) {
            throw new Error(`Lesson ${lessonIndex + 1} in module "${courseModule.title}" is missing a title`)
          }
          if (lesson.duration_minutes <= 0) {
            throw new Error(`Lesson "${lesson.title}" must have a duration greater than 0`)
          }

          const { data: lessonData, error: lessonError } = await supabase
            .from('course_lessons')
            .insert({
              module_id: moduleData.id,
              title: lesson.title.trim(),
              description: lesson.description?.trim() || null,
              content: lesson.content?.trim() || null,
              video_url: lesson.video_url?.trim() || null,
              duration_minutes: lesson.duration_minutes,
              order_index: lessonIndex,
              is_published: lesson.is_published,
              is_free_preview: lesson.is_free_preview
            })
            .select()
            .single()

          if (lessonError) {
            console.error(`Error inserting lesson ${lessonIndex + 1}:`, lessonError)
            throw new Error(`Failed to save lesson "${lesson.title}": ${lessonError.message}`)
          }

          console.log(`Lesson ${lessonIndex + 1} saved with ID:`, lessonData.id)

          // Insert resources for this lesson
          if (lesson.resources && lesson.resources.length > 0) {
            console.log(`Inserting ${lesson.resources.length} resources for lesson:`, lesson.title)
            
            const validResources = lesson.resources.filter(resource => 
              resource.title?.trim() && resource.file_url?.trim()
            )
            
            if (validResources.length > 0) {
              const resourcesData = validResources.map(resource => ({
                lesson_id: lessonData.id,
                title: resource.title.trim(),
                description: resource.description?.trim() || null,
                file_url: resource.file_url.trim(),
                file_type: resource.file_type || 'document',
                file_size_bytes: resource.file_size_bytes || null,
                is_downloadable: resource.is_downloadable !== false
              }))

              const { error: resourcesError } = await supabase
                .from('course_resources')
                .insert(resourcesData)

              if (resourcesError) {
                console.error('Error inserting resources:', resourcesError)
                throw new Error(`Failed to save resources for lesson "${lesson.title}": ${resourcesError.message}`)
              }
              
              console.log(`${validResources.length} resources saved for lesson:`, lesson.title)
            }
          }
        }
      }
      
      console.log('All course content saved successfully')
    } catch (error) {
      console.error('Error in saveCourseContent:', error)
      throw error
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {course ? 'Edit Course' : 'Create New Course'}
              </h2>
              <p className="text-base text-gray-600 mt-1">
                {course ? 'Update course details and content' : 'Create a comprehensive course with modules and lessons'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-white/50 rounded-lg"
          >
            <X className="w-7 h-7" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b bg-gray-50">
          {[
            { id: 'details', label: 'Course Details', icon: '📝' },
            { id: 'content', label: 'Content & Modules', icon: '📚' },
            { id: 'pricing', label: 'Pricing & Settings', icon: '💰' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-8 py-4 text-base font-semibold transition-all duration-200 flex items-center gap-3 ${
                activeTab === tab.id
                  ? 'text-blue-700 border-b-3 border-blue-600 bg-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
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
              <div className="space-y-8">
                {/* Basic Course Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      Course Title *
                    </label>
                    <div className="space-y-2">
                      <textarea
                        value={formData.title}
                        onChange={(e) => {
                          let value = e.target.value
                          
                          // Clean the title value - be more conservative with allowed characters
                          // Only allow basic alphanumeric, spaces, and common punctuation
                          value = value.replace(/[^a-zA-Z0-9\s\-\.\,\!\?\:\;\(\)\'\"&]/g, '')
                          
                          // Limit to 200 characters for better performance and UX
                          if (value.length <= 200) {
                            console.log('📝 [TITLE_DEBUG] Setting title:', value)
                            console.log('📝 [TITLE_DEBUG] Title length:', value.length)
                            console.log('📝 [TITLE_DEBUG] Title trimmed:', value.trim())
                            console.log('📝 [TITLE_DEBUG] Title trimmed length:', value.trim().length)
                            console.log('📝 [TITLE_DEBUG] Title validity check:', /^[a-zA-Z0-9\s\-\.\,\!\?\:\;\(\)\'\"&]+$/.test(value.trim()))
                            setFormData({ ...formData, title: value })
                          }
                        }}
                        onBlur={(e) => {
                          // Additional validation on blur
                          const value = e.target.value.trim()
                          console.log('🔍 [TITLE_DEBUG] Title onBlur - value after trim:', value)
                          console.log('🔍 [TITLE_DEBUG] Title onBlur - is valid:', value.length > 0)
                          if (value !== formData.title) {
                            setFormData({ ...formData, title: value })
                          }
                        }}
                        required
                        className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400 bg-white shadow-sm resize-none"
                        placeholder="Enter course title (e.g., Complete English Grammar Mastery Course)"
                        rows={2}
                        maxLength={200}
                      />
                      {/* Character count indicator */}
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500">
                          Course title should be descriptive but concise
                        </span>
                        <span className={`${
                          formData.title.length > 160 
                            ? 'text-orange-600' 
                            : formData.title.length > 180 
                            ? 'text-red-600' 
                            : 'text-gray-500'
                        }`}>
                          {formData.title.length}/200 characters
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      Instructor Name *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.instructor_name}
                        onChange={(e) => setFormData({ ...formData, instructor_name: e.target.value })}
                        required
                        className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400 bg-white shadow-sm"
                        placeholder="Enter instructor name (you can change this from the default)"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2 flex items-center gap-1">
                      <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      This field is editable - you can change the instructor name for this course
                    </p>
                  </div>

                  <div>
                    <label className="block text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                      className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Level *
                    </label>
                    <select
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: e.target.value as any })}
                      required
                      className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm"
                    >
                      {levels.map(level => (
                        <option key={level.value} value={level.value}>{level.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Duration
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Hours</label>
                        <input
                          type="number"
                          min="0"
                          max="999"
                          step="1"
                          value={formData.duration ? parseInt((formData.duration.split(' ')[0]) || '0') || 0 : 0}
                          onChange={(e) => {
                            const hours = parseInt(e.target.value) || 0
                            const minutes = formData.duration && formData.duration.includes('minutes') 
                              ? parseInt((formData.duration.split(' ')[2]) || '0') || 0 
                              : 0
                            const durationText = hours > 0 && minutes > 0 
                              ? `${hours} hours ${minutes} minutes`
                              : hours > 0 
                                ? `${hours} hours`
                                : minutes > 0 
                                  ? `${minutes} minutes`
                                  : ''
                            setFormData({ ...formData, duration: durationText })
                          }}
                          className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Minutes</label>
                        <input
                          type="number"
                          min="0"
                          max="59"
                          step="1"
                          value={formData.duration && formData.duration.includes('minutes') 
                            ? parseInt((formData.duration.split(' ')[2]) || '0') || 0 
                            : 0}
                          onChange={(e) => {
                            const minutes = parseInt(e.target.value) || 0
                            const hours = formData.duration ? parseInt((formData.duration.split(' ')[0]) || '0') || 0 : 0
                            const durationText = hours > 0 && minutes > 0 
                              ? `${hours} hours ${minutes} minutes`
                              : hours > 0 
                                ? `${hours} hours`
                                : minutes > 0 
                                  ? `${minutes} minutes`
                                  : ''
                            setFormData({ ...formData, duration: durationText })
                          }}
                          className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm"
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Set the total course duration. Example: 2 hours 30 minutes
                    </p>
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
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Course Description *
                  </label>
                  <div className="space-y-2">
                    <textarea
                      value={formData.description}
                      onChange={(e) => {
                        const value = e.target.value
                        // Limit to 2000 characters for better performance
                        if (value.length <= 2000) {
                          setFormData({ ...formData, description: value })
                        }
                      }}
                      required
                      rows={5}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent bg-background/50 backdrop-blur-sm resize-vertical"
                      placeholder="Describe what students will learn in this course. Include key topics, learning outcomes, and any prerequisites."
                      maxLength={2000}
                    />
                    {/* Character count indicator */}
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">
                        Detailed description helps students understand course value
                      </span>
                      <span className={`${
                        formData.description.length > 1600 
                          ? 'text-orange-600' 
                          : formData.description.length > 1800 
                          ? 'text-red-600' 
                          : 'text-gray-500'
                      }`}>
                        {formData.description.length}/2000 characters
                      </span>
                    </div>
                  </div>
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

                {/* Learning Objectives */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">Learning Outcomes</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      What Students Will Learn
                    </label>
                    <div className="space-y-3">
                      {formData.learning_objectives.map((objective, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex items-start gap-2">
                            <textarea
                              value={objective}
                              onChange={(e) => {
                                const value = e.target.value
                                // Limit to 500 characters to prevent performance issues
                                if (value.length <= 500) {
                                  const updated = [...formData.learning_objectives]
                                  updated[index] = value
                                  setFormData(prev => ({ ...prev, learning_objectives: updated }))
                                }
                              }}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                              placeholder="e.g., Master advanced English grammar concepts and apply them in real-world conversations"
                              rows={2}
                              maxLength={500}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const updated = formData.learning_objectives.filter((_, i) => i !== index)
                                setFormData(prev => ({ ...prev, learning_objectives: updated }))
                              }}
                              className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded transition-colors flex-shrink-0 mt-1"
                              title="Remove learning objective"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          {/* Character count indicator */}
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-500">
                              Learning objective #{index + 1}
                            </span>
                            <span className={`${
                              objective.length > 400 
                                ? 'text-orange-600' 
                                : objective.length > 450 
                                ? 'text-red-600' 
                                : 'text-gray-500'
                            }`}>
                              {objective.length}/500 characters
                            </span>
                          </div>
                        </div>
                      ))}
                      
                      {formData.learning_objectives.length === 0 && (
                        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                          <BookOpen className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500 text-sm">No learning objectives yet</p>
                          <p className="text-gray-400 text-xs">Add what students can expect to learn</p>
                        </div>
                      )}
                      
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ 
                            ...prev, 
                            learning_objectives: [...prev.learning_objectives, ''] 
                          }))
                        }}
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Add Learning Objective
                      </button>
                      
                      <p className="text-xs text-gray-500">
                        These will appear prominently on the course page to help students understand what they&apos;ll achieve
                      </p>
                    </div>
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
                            <div className="flex-1 space-y-2">
                              <div>
                                <textarea
                                  value={module.title}
                                  onChange={(e) => {
                                    const value = e.target.value
                                    if (value.length <= 150) {
                                      updateModule(moduleIndex, 'title', value)
                                    }
                                  }}
                                  placeholder="Module title (e.g., Introduction to Advanced Grammar)"
                                  className="text-lg font-semibold bg-transparent border-none p-0 focus:ring-0 focus:outline-none w-full resize-none"
                                  rows={1}
                                  maxLength={150}
                                />
                                <div className="flex justify-between items-center text-xs mt-1">
                                  <span className="text-gray-500">Module #{moduleIndex + 1}</span>
                                  <span className={`${
                                    module.title.length > 120 
                                      ? 'text-orange-600' 
                                      : module.title.length > 135 
                                      ? 'text-red-600' 
                                      : 'text-gray-500'
                                  }`}>
                                    {module.title.length}/150
                                  </span>
                                </div>
                              </div>
                              <div>
                                <textarea
                                  value={module.description}
                                  onChange={(e) => {
                                    const value = e.target.value
                                    if (value.length <= 800) {
                                      updateModule(moduleIndex, 'description', value)
                                    }
                                  }}
                                  placeholder="Module description - what will students learn in this module?"
                                  rows={2}
                                  className="text-sm text-gray-600 bg-transparent border-none p-0 focus:ring-0 focus:outline-none w-full resize-none"
                                  maxLength={800}
                                />
                                <div className="flex justify-between items-center text-xs">
                                  <span className="text-gray-500">Brief overview of module content</span>
                                  <span className={`${
                                    module.description.length > 640 
                                      ? 'text-orange-600' 
                                      : module.description.length > 720 
                                      ? 'text-red-600' 
                                      : 'text-gray-500'
                                  }`}>
                                    {module.description.length}/800
                                  </span>
                                </div>
                              </div>
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
                                    <div className="flex-1 space-y-2">
                                      <div>
                                        <textarea
                                          value={lesson.title}
                                          onChange={(e) => {
                                            const value = e.target.value
                                            if (value.length <= 120) {
                                              updateLesson(moduleIndex, lessonIndex, 'title', value)
                                            }
                                          }}
                                          placeholder="Lesson title (e.g., Present Simple - Daily Routines)"
                                          className="font-medium bg-transparent border-none p-0 focus:ring-0 focus:outline-none w-full resize-none"
                                          rows={1}
                                          maxLength={120}
                                        />
                                        <div className="flex justify-between items-center text-xs mt-1">
                                          <span className="text-gray-500">Lesson #{lessonIndex + 1}</span>
                                          <span className={`${
                                            lesson.title.length > 96 
                                              ? 'text-orange-600' 
                                              : lesson.title.length > 108 
                                              ? 'text-red-600' 
                                              : 'text-gray-500'
                                          }`}>
                                            {lesson.title.length}/120
                                          </span>
                                        </div>
                                      </div>
                                      <div>
                                        <textarea
                                          value={lesson.description}
                                          onChange={(e) => {
                                            const value = e.target.value
                                            if (value.length <= 300) {
                                              updateLesson(moduleIndex, lessonIndex, 'description', value)
                                            }
                                          }}
                                          placeholder="Brief lesson description - what specific topic will be covered?"
                                          className="text-sm text-gray-600 bg-transparent border-none p-0 focus:ring-0 focus:outline-none w-full resize-none"
                                          rows={2}
                                          maxLength={300}
                                        />
                                        <div className="flex justify-between items-center text-xs">
                                          <span className="text-gray-500">Short summary for students</span>
                                          <span className={`${
                                            lesson.description.length > 240 
                                              ? 'text-orange-600' 
                                              : lesson.description.length > 270 
                                              ? 'text-red-600' 
                                              : 'text-gray-500'
                                          }`}>
                                            {lesson.description.length}/300
                                          </span>
                                        </div>
                                      </div>
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

                                  <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">
                                      Lesson Content
                                    </label>
                                    <div className="space-y-2">
                                      <textarea
                                        value={lesson.content}
                                        onChange={(e) => {
                                          const value = e.target.value
                                          if (value.length <= 5000) {
                                            updateLesson(moduleIndex, lessonIndex, 'content', value)
                                          }
                                        }}
                                        placeholder="Enter lesson content, transcript, or description. This is where you can write detailed lesson materials that students will see when studying this lesson."
                                        rows={8}
                                        className="w-full text-sm px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent resize-vertical bg-background/50 backdrop-blur-sm min-h-[120px]"
                                        maxLength={5000}
                                      />
                                      <div className="flex justify-between items-center text-xs">
                                        <span className="text-muted-foreground">
                                          Tip: You can resize this field vertically. Use Markdown syntax for formatting if needed.
                                        </span>
                                        <span className={`${
                                          lesson.content.length > 4000 
                                            ? 'text-orange-600' 
                                            : lesson.content.length > 4500 
                                            ? 'text-red-600' 
                                            : 'text-gray-500'
                                        }`}>
                                          {lesson.content.length}/5000 characters
                                        </span>
                                      </div>
                                    </div>
                                  </div>
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
              <div className="space-y-8">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <span className="text-2xl">💰</span>
                  Pricing & Settings
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      Course Price ($)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 text-base">$</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={pricingData.price}
                        onChange={(e) => setPricingData({ ...pricingData, price: parseFloat(e.target.value) || 0 })}
                        className="w-full pl-8 pr-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400 bg-white shadow-sm"
                        placeholder="0.00"
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Enter the current selling price (supports decimals like $49.99)
                    </p>
                  </div>

                  <div>
                    <label className="block text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      Original Price ($)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 text-base">$</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={pricingData.original_price || ''}
                        onChange={(e) => setPricingData({ ...pricingData, original_price: parseFloat(e.target.value) || 0 })}
                        className="w-full pl-8 pr-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400 bg-white shadow-sm"
                        placeholder="0.00"
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Optional: Original price before discount (for showing savings)
                    </p>
                  </div>

                  <div>
                    <label className="block text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                      </svg>
                      Discount Percentage (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={pricingData.discount_percentage || ''}
                        onChange={(e) => setPricingData({ ...pricingData, discount_percentage: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400 bg-white shadow-sm"
                        placeholder="0"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 text-base">%</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Discount percentage (0-100%)
                    </p>
                  </div>

                  <div className="flex items-center pt-8">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="is_free"
                        checked={pricingData.is_free}
                        onChange={(e) => setPricingData({ ...pricingData, is_free: e.target.checked })}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="is_free" className="ml-3 text-base font-medium text-gray-800">
                        This is a free course
                      </label>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Check this if the course should be available for free
                    </p>
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
