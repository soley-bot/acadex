'use client'

import { useState, useEffect, useCallback } from 'react'
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
      
      // Set first lesson as current
      const firstModule = modulesWithProgress[0]
      if (firstModule?.course_lessons && firstModule.course_lessons.length > 0) {
        const firstLesson = firstModule.course_lessons[0]
        if (firstLesson) {
          setCurrentLesson(firstLesson)
        }
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
  }

  const handleCompleteLesson = async () => {
    if (!currentLesson || !user) return

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
      
      // Update enrollment progress (only for actually enrolled users, not admin bypass)
      if (user.role !== 'admin') {
        console.log('📊 Updating enrollment progress for regular user...')
        try {
          await updateEnrollmentProgress(user.id, params.id as string, newProgress, currentLesson.id)
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
    
    // Try next lesson in current module
    if (currentModule.course_lessons && lessonIndex < currentModule.course_lessons.length - 1) {
      const nextLesson = currentModule.course_lessons[lessonIndex + 1]
      if (nextLesson) {
        setCurrentLesson(nextLesson)
      }
      return
    }
    
    // Try first lesson of next module
    if (moduleIndex < modules.length - 1) {
      const nextModule = modules[moduleIndex + 1]
      if (nextModule && nextModule.course_lessons && nextModule.course_lessons.length > 0) {
        const firstLesson = nextModule.course_lessons[0]
        if (firstLesson) {
          setCurrentLesson(firstLesson)
          // Expand next module
          setExpandedModules(prev => new Set([...prev, nextModule.id]))
        }
      }
    }
  }

  const handlePreviousLesson = () => {
    const { moduleIndex, lessonIndex } = getCurrentLessonIndex()
    if (moduleIndex === -1) return

    // Try previous lesson in current module
    if (lessonIndex > 0) {
      const currentModule = modules[moduleIndex]
      if (currentModule && currentModule.course_lessons) {
        const prevLesson = currentModule.course_lessons[lessonIndex - 1]
        if (prevLesson) {
          setCurrentLesson(prevLesson)
        }
      }
      return
    }
    
    // Try last lesson of previous module
    if (moduleIndex > 0) {
      const prevModule = modules[moduleIndex - 1]
      if (prevModule && prevModule.course_lessons && prevModule.course_lessons.length > 0) {
        const lastLesson = prevModule.course_lessons[prevModule.course_lessons.length - 1]
        if (lastLesson) {
          setCurrentLesson(lastLesson)
          // Expand previous module
          setExpandedModules(prev => new Set([...prev, prevModule.id]))
        }
      }
    }
  }

  const hasNextLesson = () => {
    const { moduleIndex, lessonIndex } = getCurrentLessonIndex()
    if (moduleIndex === -1) return false
    
    const currentModule = modules[moduleIndex]
    if (!currentModule) return false
    
    // Check if there's a next lesson in current module
    if (currentModule.course_lessons && lessonIndex < currentModule.course_lessons.length - 1) return true
    
    // Check if there's a next module with lessons
    for (let i = moduleIndex + 1; i < modules.length; i++) {
      const moduleToCheck = modules[i]
      if (moduleToCheck && moduleToCheck.course_lessons && moduleToCheck.course_lessons.length > 0) return true
    }
    
    return false
  }

  const hasPreviousLesson = () => {
    const { moduleIndex, lessonIndex } = getCurrentLessonIndex()
    if (moduleIndex === -1) return false
    
    // Check if there's a previous lesson in current module
    if (lessonIndex > 0) return true
    
    // Check if there's a previous module with lessons
    for (let i = moduleIndex - 1; i >= 0; i--) {
      const moduleToCheck = modules[i]
      if (moduleToCheck && moduleToCheck.course_lessons && moduleToCheck.course_lessons.length > 0) return true
    }
    
    return false
  }

  const calculateOverallProgress = () => {
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
  }

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
        
        {/* Mobile-Only Contextual Back Navigation Overlay */}
        <div className="lg:hidden absolute top-4 left-4 z-50">
          <ContextualBackButton
            href="/courses"
            label="Back to Courses"
          />
        </div>

        {/* Course Header */}
        <CourseHeader
          course={course}
          progress={calculateOverallProgress()}
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
