import { useState, useCallback, useMemo, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useCourseMutations } from '@/lib/cached-operations'
import { quizAPI } from '@/lib/api'
import type { EnhancedCourseData, ModuleData, LessonData, QuizOption, TabType } from '../types'
import type { Course } from '@/lib/supabase'

export function useCourseForm(course?: Course) {
  const { user } = useAuth()
  const { createCourse, updateCourse, isCreating, isUpdating, error: mutationError } = useCourseMutations()
  
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [availableQuizzes, setAvailableQuizzes] = useState<QuizOption[]>([])
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set())
  const [activeTab, setActiveTab] = useState<TabType>('basic')

  const [formData, setFormData] = useState<EnhancedCourseData>({
    title: '',
    description: '',
    instructor_name: user?.name || '',
    price: 0,
    category: '',
    level: 'beginner',
    duration: '',
    image_url: '',
    is_published: false,
    learning_objectives: [''],
    modules: []
  })

  const [initialFormData, setInitialFormData] = useState<EnhancedCourseData | null>(null)
  const [isDirty, setIsDirty] = useState(false)

  const isLoading = isCreating || isUpdating || isSubmitting

  // Track changes to determine if form is dirty
  useEffect(() => {
    if (initialFormData) {
      const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialFormData)
      setIsDirty(hasChanges)
    }
  }, [formData, initialFormData])

  // Computed values
  const totalLessons = useMemo(() => {
    return formData.modules.reduce((total, module) => total + module.lessons.length, 0)
  }, [formData.modules])

  const totalDurationMinutes = useMemo(() => {
    return formData.modules.reduce((total, module) => {
      return total + module.lessons.reduce((moduleTotal, lesson) => {
        return moduleTotal + (lesson.duration_minutes || 0)
      }, 0)
    }, 0)
  }, [formData.modules])

  const hasValidationErrors = useMemo(() => {
    if (!formData.title.trim() || !formData.description.trim() || !formData.category) {
      return true
    }

    // Validate modules and lessons
    for (const courseModule of formData.modules) {
      if (!courseModule.title.trim() || !courseModule.description.trim()) {
        return true
      }
      for (const lesson of courseModule.lessons) {
        if (!lesson.title.trim() || !lesson.description.trim() || !lesson.content.trim()) {
          return true
        }
      }
    }

    return false
  }, [formData])

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load available quizzes
        const quizzes = await quizAPI.getQuizzes()
        const quizData = Array.isArray(quizzes.data) ? quizzes.data : quizzes.data?.data || []
        const quizOptions = quizData.map((quiz: any) => ({
          id: quiz.id,
          title: quiz.title,
          description: quiz.description
        }))
        setAvailableQuizzes(quizOptions)

        // Load course data if editing
        if (course) {
          const courseData = {
            title: course.title || '',
            description: course.description || '',
            instructor_name: course.instructor_name || user?.name || '',
            price: course.price || 0,
            category: course.category || '',
            level: (course.level as 'beginner' | 'intermediate' | 'advanced') || 'beginner',
            duration: course.duration || '',
            image_url: course.image_url || '',
            is_published: course.is_published || false,
            learning_objectives: course.learning_objectives || [''],
            modules: [] // Will be loaded separately if needed
          }
          setFormData(courseData)
          setInitialFormData(courseData) // Track initial state
        } else {
          // Set initial data for new course
          const initialData = {
            title: '',
            description: '',
            instructor_name: user?.name || '',
            price: 0,
            category: '',
            level: 'beginner' as const,
            duration: '',
            image_url: '',
            is_published: false,
            learning_objectives: [''],
            modules: []
          }
          setFormData(initialData)
          setInitialFormData(initialData)
        }
      } catch (err) {
        setError('Failed to load initial data')
      }
    }

    if (user) {
      loadInitialData()
    }
  }, [course, user])

  // Form handlers
  const handleFieldChange = useCallback((field: keyof EnhancedCourseData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError(null)
  }, [error])

  const addModule = useCallback(() => {
    const newModule: ModuleData = {
      title: '',
      description: '',
      order_index: formData.modules.length,
      lessons: []
    }
    
    setFormData(prev => ({
      ...prev,
      modules: [...prev.modules, newModule]
    }))
  }, [formData.modules.length])

  const updateModule = useCallback((moduleIndex: number, field: keyof ModuleData, value: any) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.map((module, index) =>
        index === moduleIndex ? { ...module, [field]: value } : module
      )
    }))
  }, [])

  const deleteModule = useCallback((moduleIndex: number) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.filter((_, index) => index !== moduleIndex)
        .map((module, index) => ({ ...module, order_index: index }))
    }))
    
    // Remove from expanded modules if it was expanded
    setExpandedModules(prev => {
      const newSet = new Set(prev)
      newSet.delete(moduleIndex)
      // Adjust indices for remaining modules
      const adjustedSet = new Set<number>()
      newSet.forEach(index => {
        if (index > moduleIndex) {
          adjustedSet.add(index - 1)
        } else {
          adjustedSet.add(index)
        }
      })
      return adjustedSet
    })
  }, [])

  const addLesson = useCallback((moduleIndex: number) => {
    const newLesson: LessonData = {
      title: '',
      description: '',
      content: '',
      duration_minutes: 10,
      order_index: formData.modules[moduleIndex].lessons.length,
      is_free_preview: false
    }
    
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.map((module, index) =>
        index === moduleIndex 
          ? { ...module, lessons: [...module.lessons, newLesson] }
          : module
      )
    }))
  }, [formData.modules])

  const updateLesson = useCallback((moduleIndex: number, lessonIndex: number, field: keyof LessonData, value: any) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.map((module, mIndex) =>
        mIndex === moduleIndex
          ? {
              ...module,
              lessons: module.lessons.map((lesson, lIndex) =>
                lIndex === lessonIndex ? { ...lesson, [field]: value } : lesson
              )
            }
          : module
      )
    }))
  }, [])

  const deleteLesson = useCallback((moduleIndex: number, lessonIndex: number) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.map((module, mIndex) =>
        mIndex === moduleIndex
          ? {
              ...module,
              lessons: module.lessons.filter((_, lIndex) => lIndex !== lessonIndex)
                .map((lesson, index) => ({ ...lesson, order_index: index }))
            }
          : module
      )
    }))
  }, [])

  const toggleModuleExpanded = useCallback((moduleIndex: number) => {
    setExpandedModules(prev => {
      const newSet = new Set(prev)
      if (newSet.has(moduleIndex)) {
        newSet.delete(moduleIndex)
      } else {
        newSet.add(moduleIndex)
      }
      return newSet
    })
  }, [])

  return {
    // State
    formData,
    error,
    successMessage,
    availableQuizzes,
    expandedModules,
    activeTab,
    isLoading,
    isDirty,

    // Computed values
    totalLessons,
    totalDurationMinutes,
    hasValidationErrors,

    // Handlers
    setFormData,
    setError,
    setSuccessMessage,
    setActiveTab,
    handleFieldChange,
    addModule,
    updateModule,
    deleteModule,
    addLesson,
    updateLesson,
    deleteLesson,
    toggleModuleExpanded,

    // Mutations
    createCourse,
    updateCourse,
    mutationError,
    setIsSubmitting
  }
}