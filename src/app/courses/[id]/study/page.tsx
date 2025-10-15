'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase, Course, CourseModule, CourseLesson, LessonProgress } from '@/lib/supabase'
import { getCourseWithModulesAndLessons, updateEnrollmentProgress } from '@/lib/database-operations'
import { useAuth } from '@/contexts/AuthContext'
import { CourseHeader } from '@/components/course/CourseHeader'
import { CourseSidebar } from '@/components/course/CourseSidebar'
import { LessonContent } from '@/components/course/LessonContent'
import { logger } from '@/lib/logger'
import { ContextualBackButton } from '@/components/navigation/ContextualBackButton'
import { CourseErrorBoundary } from '@/components/ErrorBoundary'

// Force dynamic rendering - this page requires authentication
export const dynamic = 'force-dynamic'

interface ModuleWithContent extends CourseModule {
  course_lessons: (CourseLesson & {
    progress?: LessonProgress
  })[]
}

type LessonWithProgress = CourseLesson & {
  progress?: LessonProgress
}

export default function CourseStudyPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const courseId = params.id as string
  
  // Core state
  const [course, setCourse] = useState<Course | null>(null)
  const [modules, setModules] = useState<ModuleWithContent[]>([])
  const [currentLesson, setCurrentLesson] = useState<LessonWithProgress | null>(null)
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [enrollmentProgress, setEnrollmentProgress] = useState(0)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isCompletingLesson, setIsCompletingLesson] = useState(false)
  const [sessionWarning, setSessionWarning] = useState(false)

  // Session expiry detection
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session && user) {
        console.warn('⚠️ Session expired detected')
        setSessionWarning(true)
      }
    }

    // Check session every 30 seconds
    const intervalId = setInterval(checkSession, 30000)

    return () => clearInterval(intervalId)
  }, [user])

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      return
    }

    const loadCourseContent = async () => {
      try {
        setLoading(true)
        setError(null)

        if (!courseId) {
          console.error('Course ID is missing from params')
          setError('Invalid course ID')
          setLoading(false)
          return
        }
        
        if (!user) {
          router.push(`/auth?tab=signin&redirect=/courses/${courseId}/study`)
          return
        }
      
      // Get session token for API authentication
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push(`/auth?tab=signin&redirect=/courses/${courseId}/study`)
        return
      }

      // Use API route instead of direct Supabase (fixes CORS on custom domains)
      const response = await fetch(`/api/courses/${courseId}/study`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
      })

      if (!response.ok) {
        if (response.status === 403) {
          setError('You are not enrolled in this course.')
        } else if (response.status === 404) {
          setError('Course not found.')
        } else {
          setError('Failed to load course content. Please try again.')
        }
        setLoading(false)
        return
      }

      const data = await response.json()
      
      console.log('📦 Course data received:', {
        course: !!data.course,
        modulesCount: data.modules?.length,
        isEnrolled: data.isEnrolled,
        progressCount: data.progress?.length
      })
      
      if (!data.course) {
        setError('Course data not found')
        setLoading(false)
        return
      }

      if (!data.modules || data.modules.length === 0) {
        console.warn('⚠️ No modules found for course')
      }
      
      setIsEnrolled(data.isEnrolled)
      setEnrollmentProgress(data.enrollmentProgress || 0)
      setCourse(data.course)
      
      // Process progress data
      const progressMap = new Map()
      data.progress?.forEach((progress: LessonProgress) => {
        progressMap.set(progress.lesson_id, progress)
      })
      
      // Apply progress to lessons
      const modulesWithProgress = data.modules.map((module: ModuleWithContent) => ({
        ...module,
        course_lessons: module.course_lessons.map((lesson: LessonWithProgress) => ({
          ...lesson,
          progress: progressMap.get(lesson.id)
        }))
      }))
      
      setModules(modulesWithProgress)
      setExpandedModules(new Set(data.modules.map((m: CourseModule) => m.id)))
      
      // Try to restore last lesson from localStorage
      let lessonToSet = null
      try {
        const savedLessonId = localStorage.getItem(`course_${courseId}_last_lesson`)
        if (savedLessonId) {
          // Find the saved lesson
          for (const module of modulesWithProgress) {
            if (module.course_lessons) {
              const savedLesson = module.course_lessons.find(
                lesson => lesson.id === savedLessonId && lesson.is_published
              )
              if (savedLesson) {
                lessonToSet = savedLesson
                console.log('📍 Restored last lesson position from localStorage')
                break
              }
            }
          }
        }
      } catch (error) {
        console.warn('Failed to restore lesson position from localStorage:', error)
      }

      // Fallback to first published lesson if no saved position
      if (!lessonToSet) {
        for (const module of modulesWithProgress) {
          if (module.course_lessons && module.course_lessons.length > 0) {
            lessonToSet = module.course_lessons.find(lesson => lesson.is_published)
            if (lessonToSet) break
          }
        }
      }

      if (lessonToSet) {
        setCurrentLesson(lessonToSet)
      }

        console.log('✅ Course content loaded successfully')
        setLoading(false)
        
      } catch (error) {
        console.error('❌ Error loading course content:', error)
        logger.error('Error loading course content:', error)
        setError('Failed to load course content. Please try again.')
        setLoading(false)
      }
    }

    loadCourseContent()
  }, [courseId, user, authLoading, router])

  const handleToggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules)
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId)
    } else {
      newExpanded.add(moduleId)
    }
    setExpandedModules(newExpanded)
  }

  const handleSelectLesson = (lesson: LessonWithProgress) => {
    setCurrentLesson(lesson)
    setIsSidebarOpen(false) // Close sidebar on mobile when lesson is selected

    // Save lesson position to localStorage for recovery
    try {
      localStorage.setItem(`course_${courseId}_last_lesson`, lesson.id)
    } catch (error) {
      console.warn('Failed to save lesson position to localStorage:', error)
    }
  }

  const handleCompleteLesson = async () => {
    if (!currentLesson || !user || isCompletingLesson) return

    // Prevent race conditions - only allow one completion at a time
    setIsCompletingLesson(true)

    console.log('🔄 Starting lesson completion...', {
      lessonId: currentLesson.id,
      userId: user.id,
      userRole: user.role,
      isAdmin: user.role === 'admin'
    })

    try {
      // First check if a record exists
      const { data: existingProgress, error: checkError } = await supabase
        .from('lesson_progress')
        .select('id')
        .eq('user_id', user.id)
        .eq('lesson_id', currentLesson.id)
        .maybeSingle()

      if (checkError) {
        console.error('Error checking existing progress:', checkError)
        throw checkError
      }

      let result
      if (existingProgress) {
        // Update existing record
        result = await supabase
          .from('lesson_progress')
          .update({
            is_completed: true,
            completed_at: new Date().toISOString()
          })
          .eq('id', existingProgress.id)
      } else {
        // Insert new record
        result = await supabase
          .from('lesson_progress')
          .insert({
            user_id: user.id,
            lesson_id: currentLesson.id,
            is_completed: true,
            completed_at: new Date().toISOString()
          })
      }

      if (result.error) {
        console.error('Error updating lesson progress:', result.error)
        throw result.error
      }

      console.log('✅ Lesson marked as complete successfully!')

      // Update local state with proper typing
      setModules(prev => prev.map(module => ({
        ...module,
        course_lessons: module.course_lessons.map(lesson => {
          if (lesson.id === currentLesson.id) {
            return {
              ...lesson,
              progress: {
                ...lesson.progress,
                is_completed: true,
                id: lesson.progress?.id || '',
                user_id: user.id,
                lesson_id: currentLesson.id,
                completed_at: new Date().toISOString()
              } as LessonProgress
            }
          }
          return lesson
        })
      })))

      // Update current lesson
      setCurrentLesson(prev => prev ? {
        ...prev,
        progress: {
          ...prev.progress,
          is_completed: true,
          id: prev.progress?.id || '',
          user_id: user.id,
          lesson_id: prev.id,
          completed_at: new Date().toISOString()
        } as LessonProgress
      } : null)

      // Update course progress
      const totalLessons = modules.reduce((acc, courseModule) => {
        return acc + (courseModule.course_lessons?.length || 0)
      }, 0)
      
      const completedLessons = modules.reduce((acc, courseModule) => {
        if (!courseModule.course_lessons) return acc
        return acc + courseModule.course_lessons.filter(lesson => 
          lesson.progress?.is_completed || lesson.id === currentLesson.id
        ).length
      }, 0)
      
      const newProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

      // Validate progress bounds (0-100)
      const validatedProgress = Math.max(0, Math.min(100, newProgress))

      // Update enrollment progress (only for actually enrolled users, not admin bypass)
      if (user.role !== 'admin') {
        console.log('📊 Updating enrollment progress for regular user...')
        try {
          await updateEnrollmentProgress(user.id, params.id as string, validatedProgress, currentLesson.id)
          console.log('✅ Enrollment progress updated successfully')
        } catch (progressError) {
          console.warn('⚠️ Failed to update enrollment progress:', progressError)
          // Don't throw - lesson completion should still work even if enrollment update fails
        }
      } else {
        console.log('👑 Admin user detected - skipping enrollment progress update')
      }

    } catch (error) {
      logger.error('Error completing lesson:', error)
      // Show user-friendly error message
      alert('Failed to mark lesson as complete. Please try again.')
    } finally {
      // Always reset loading state
      setIsCompletingLesson(false)
    }
  }

  const getCurrentLessonIndex = () => {
    if (!currentLesson || !modules) return { moduleIndex: -1, lessonIndex: -1 }
    
    for (let i = 0; i < modules.length; i++) {
      const courseModule = modules[i]
      if (courseModule && courseModule.course_lessons) {
        const lessonIndex = courseModule.course_lessons.findIndex(l => l.id === currentLesson.id)
        if (lessonIndex !== -1) {
          return { moduleIndex: i, lessonIndex }
        }
      }
    }
    return { moduleIndex: -1, lessonIndex: -1 }
  }

  const handleNextLesson = () => {
    const { moduleIndex, lessonIndex } = getCurrentLessonIndex()
    if (moduleIndex === -1) return

    const currentModule = modules[moduleIndex]
    if (!currentModule) return

    // Try next published lesson in current module
    if (currentModule.course_lessons && lessonIndex < currentModule.course_lessons.length - 1) {
      // Find next published lesson
      for (let i = lessonIndex + 1; i < currentModule.course_lessons.length; i++) {
        const nextLesson = currentModule.course_lessons[i]
        if (nextLesson && nextLesson.is_published) {
          setCurrentLesson(nextLesson)
          return
        }
      }
    }

    // Try first published lesson of next module
    for (let i = moduleIndex + 1; i < modules.length; i++) {
      const nextModule = modules[i]
      if (nextModule && nextModule.course_lessons && nextModule.course_lessons.length > 0) {
        const firstPublishedLesson = nextModule.course_lessons.find(lesson => lesson.is_published)
        if (firstPublishedLesson) {
          setCurrentLesson(firstPublishedLesson)
          // Expand next module
          setExpandedModules(prev => new Set([...prev, nextModule.id]))
          return
        }
      }
    }
  }

  const handlePreviousLesson = () => {
    const { moduleIndex, lessonIndex } = getCurrentLessonIndex()
    if (moduleIndex === -1) return

    // Try previous published lesson in current module
    if (lessonIndex > 0) {
      const currentModule = modules[moduleIndex]
      if (currentModule && currentModule.course_lessons) {
        // Find previous published lesson
        for (let i = lessonIndex - 1; i >= 0; i--) {
          const prevLesson = currentModule.course_lessons[i]
          if (prevLesson && prevLesson.is_published) {
            setCurrentLesson(prevLesson)
            return
          }
        }
      }
    }

    // Try last published lesson of previous module
    for (let i = moduleIndex - 1; i >= 0; i--) {
      const prevModule = modules[i]
      if (prevModule && prevModule.course_lessons && prevModule.course_lessons.length > 0) {
        // Find last published lesson
        for (let j = prevModule.course_lessons.length - 1; j >= 0; j--) {
          const lastLesson = prevModule.course_lessons[j]
          if (lastLesson && lastLesson.is_published) {
            setCurrentLesson(lastLesson)
            // Expand previous module
            setExpandedModules(prev => new Set([...prev, prevModule.id]))
            return
          }
        }
      }
    }
  }

  const hasNextLesson = () => {
    const { moduleIndex, lessonIndex } = getCurrentLessonIndex()
    if (moduleIndex === -1) return false

    const currentModule = modules[moduleIndex]
    if (!currentModule) return false

    // Check if there's a next published lesson in current module
    if (currentModule.course_lessons && lessonIndex < currentModule.course_lessons.length - 1) {
      for (let i = lessonIndex + 1; i < currentModule.course_lessons.length; i++) {
        if (currentModule.course_lessons[i]?.is_published) return true
      }
    }

    // Check if there's a next module with published lessons
    for (let i = moduleIndex + 1; i < modules.length; i++) {
      const moduleToCheck = modules[i]
      if (moduleToCheck && moduleToCheck.course_lessons) {
        if (moduleToCheck.course_lessons.some(lesson => lesson.is_published)) return true
      }
    }

    return false
  }

  const hasPreviousLesson = () => {
    const { moduleIndex, lessonIndex } = getCurrentLessonIndex()
    if (moduleIndex === -1) return false

    const currentModule = modules[moduleIndex]
    if (!currentModule) return false

    // Check if there's a previous published lesson in current module
    if (lessonIndex > 0 && currentModule.course_lessons) {
      for (let i = lessonIndex - 1; i >= 0; i--) {
        if (currentModule.course_lessons[i]?.is_published) return true
      }
    }

    // Check if there's a previous module with published lessons
    for (let i = moduleIndex - 1; i >= 0; i--) {
      const moduleToCheck = modules[i]
      if (moduleToCheck && moduleToCheck.course_lessons) {
        if (moduleToCheck.course_lessons.some(lesson => lesson.is_published)) return true
      }
    }

    return false
  }

  // Memoize overall progress calculation to avoid recalculating on every render
  const overallProgress = useMemo(() => {
    if (!modules || modules.length === 0) return 0

    const totalLessons = modules.reduce((acc, courseModule) => {
      return acc + (courseModule.course_lessons?.length || 0)
    }, 0)

    if (totalLessons === 0) return 0

    const completedLessons = modules.reduce((acc, courseModule) => {
      if (!courseModule.course_lessons) return acc
      return acc + courseModule.course_lessons.filter(lesson => lesson.progress?.is_completed).length
    }, 0)

    return (completedLessons / totalLessons) * 100
  }, [modules])

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-foreground">Loading course content...</p>
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Course Not Found</h1>
          <p className="text-muted-foreground mb-6">{error || 'The course you are looking for does not exist.'}</p>
          <button
            onClick={() => router.push('/courses')}
            className="bg-primary hover:bg-secondary text-white hover:text-black px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Browse Courses
          </button>
        </div>
      </div>
    )
  }

  if (!isEnrolled) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Enrollment Required</h1>
          <p className="text-muted-foreground mb-6">You need to enroll in this course to access the content.</p>
          <button
            onClick={() => router.push(`/courses/${course.id}`)}
            className="bg-primary hover:bg-secondary text-white hover:text-black px-6 py-3 rounded-lg font-medium transition-colors"
          >
            View Course Details
          </button>
        </div>
      </div>
    )
  }

  return (
    <CourseErrorBoundary>
      <div className="h-screen flex flex-col bg-background relative">

        {/* Session Expiry Warning */}
        {sessionWarning && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 shadow-lg rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm text-yellow-700 font-medium">
                    Your session has expired
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Your progress has been saved. Please sign in again to continue.
                  </p>
                  <button
                    onClick={() => router.push(`/auth?tab=signin&redirect=/courses/${courseId}/study`)}
                    className="mt-2 text-sm font-medium text-yellow-700 hover:text-yellow-600 underline"
                  >
                    Sign in again
                  </button>
                </div>
                <div className="ml-auto pl-3">
                  <button
                    onClick={() => setSessionWarning(false)}
                    className="inline-flex text-yellow-400 hover:text-yellow-500"
                  >
                    <span className="sr-only">Dismiss</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Course Header */}
        <CourseHeader
          course={course}
          progress={overallProgress}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Course Sidebar */}
          <CourseSidebar
            modules={modules}
            currentLesson={currentLesson}
            expandedModules={expandedModules}
            onToggleModule={handleToggleModule}
            onSelectLesson={handleSelectLesson}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />

          {/* Lesson Content */}
          <main className="flex-1 overflow-hidden">
            {currentLesson ? (
              <LessonContent
                lesson={currentLesson}
                onNext={handleNextLesson}
                onPrevious={handlePreviousLesson}
                onComplete={handleCompleteLesson}
                hasNext={hasNextLesson()}
                hasPrevious={hasPreviousLesson()}
                isCompleting={isCompletingLesson}
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-foreground mb-2">Select a Lesson</h2>
                  <p className="text-muted-foreground">Choose a lesson from the sidebar to begin studying.</p>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </CourseErrorBoundary>
  )
}
