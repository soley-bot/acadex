'use client'

import { logger } from '@/lib/logger'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChevronDown, ChevronRight, PlayCircle, FileText, Download, Clock, CheckCircle, Lock, Circle, Menu, X, Home, BookOpen } from 'lucide-react'
import { supabase, Course, CourseModule, CourseLesson, CourseResource, LessonProgress } from '@/lib/supabase'
import { getCourseWithModulesAndLessons, updateEnrollmentProgress } from '@/lib/database-operations'
import { useAuth } from '@/contexts/AuthContext'
import { RichTextRenderer } from '@/components/ui/RichTextRenderer'

interface ModuleWithContent extends CourseModule {
  course_lessons: (CourseLesson & {
    progress?: LessonProgress
    resources?: CourseResource[]
  })[]
}

type LessonWithProgress = CourseLesson & {
  progress?: LessonProgress
  resources?: CourseResource[]
}

export default function CourseStudyPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [course, setCourse] = useState<Course | null>(null)
  const [modules, setModules] = useState<ModuleWithContent[]>([])
  const [currentLesson, setCurrentLesson] = useState<LessonWithProgress | null>(null)
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [enrollmentProgress, setEnrollmentProgress] = useState(0)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const loadCourseContent = useCallback(async () => {
    try {
      setLoading(true)
      
      if (!user) {
        router.push('/auth/login')
        return
      }
      
      // Check enrollment first
      const { data: enrollmentData, error: enrollmentError } = await supabase
        .from('enrollments')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', params.id)
        .single()

      if (enrollmentError || !enrollmentData) {
        setIsEnrolled(false)
        setError('You are not enrolled in this course.')
        return
      }

      setIsEnrolled(true)
      setEnrollmentProgress(enrollmentData.progress || 0)
      
      // Load course with modules and lessons
      const courseData = await getCourseWithModulesAndLessons(params.id as string)
      setCourse(courseData)
      
      // Load lesson progress for user
      const { data: progressData } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('user_id', user.id)

      // Combine modules with progress data
      const modulesWithProgress = courseData.modules.map((module: any) => ({
        ...module,
        course_lessons: module.course_lessons.map((lesson: any) => ({
          ...lesson,
          progress: progressData?.find(p => p.lesson_id === lesson.id)
        }))
      }))

      setModules(modulesWithProgress)
      
      // Set first lesson as current if no lesson is selected
      if (modulesWithProgress.length > 0 && modulesWithProgress[0].course_lessons.length > 0) {
        setCurrentLesson(modulesWithProgress[0].course_lessons[0])
        setExpandedModules(new Set([modulesWithProgress[0].id]))
      }
      
    } catch (err) {
      logger.error('Error loading course content:', err)
      setError('Failed to load course content')
    } finally {
      setLoading(false)
    }
  }, [user, params.id, router])

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    loadCourseContent()
  }, [user, router, loadCourseContent])

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules)
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId)
    } else {
      newExpanded.add(moduleId)
    }
    setExpandedModules(newExpanded)
  }

  const selectLesson = (lesson: LessonWithProgress) => {
    // Check if lesson is accessible
    if (!isEnrolled && !lesson.is_free_preview) {
      return // Don't allow access to locked lessons
    }
    setCurrentLesson(lesson)
    // Close sidebar on mobile after selecting lesson
    setIsSidebarOpen(false)
  }

  const toggleLessonCompletion = async (lessonId: string) => {
    if (!user || !isEnrolled) return

    // Get current completion status
    const currentProgress = currentLesson?.progress
    const isCurrentlyCompleted = currentProgress?.is_completed || false
    const newCompletionStatus = !isCurrentlyCompleted

    try {
      // Step 1: Check if record exists
      const { data: existingRecord, error: checkError } = await supabase
        .from('lesson_progress')
        .select('id, is_completed')
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId)
        .maybeSingle()

      if (checkError) {
        logger.error('Error checking existing record:', checkError)
        throw checkError
      }

      let result
      if (existingRecord) {
        // Step 2a: Update existing record
        logger.debug('Updating existing lesson progress record')
        result = await supabase
          .from('lesson_progress')
          .update({
            is_completed: newCompletionStatus,
            completed_at: newCompletionStatus ? new Date().toISOString() : null
          })
          .eq('id', existingRecord.id)
      } else {
        // Step 2b: Create new record
        logger.debug('Creating new lesson progress record')
        result = await supabase
          .from('lesson_progress')
          .insert({
            user_id: user.id,
            lesson_id: lessonId,
            is_completed: newCompletionStatus,
            completed_at: newCompletionStatus ? new Date().toISOString() : null
          })
      }

      if (result.error) {
        logger.error('Lesson progress operation failed:', result.error)
        throw result.error
      }

      logger.debug('Lesson progress updated successfully')
      // Reload progress to reflect changes
      await loadCourseContent()
      
    } catch (err) {
      logger.error('Error toggling lesson completion:', err)
      alert('Failed to update lesson progress. Please try again.')
    }
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg border border-gray-200">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading course content...</p>
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg border border-gray-200 max-w-md">
          <p className="text-red-600 mb-4 font-bold">{error || 'Course not found'}</p>
          <button
            onClick={() => router.push('/courses')}
            className="text-red-600 hover:text-red-700 font-bold bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors duration-200"
          >
            ← Back to Courses
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Navigation Bar */}
      <nav className="lg:hidden fixed top-14 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <button
              onClick={() => router.push('/courses')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors flex-shrink-0"
            >
              <Home className="w-5 h-5" />
            </button>
            <div className="h-4 w-px bg-gray-300 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h1 className="text-base lg:text-lg font-bold text-gray-900 truncate">
                {course?.title || 'Course'}
              </h1>
              {currentLesson && (
                <p className="text-xs text-gray-500 truncate">
                  {currentLesson.title}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="flex items-center space-x-2 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors flex-shrink-0"
          >
            <BookOpen className="w-4 h-4" />
            <span className="text-sm font-medium">Lessons</span>
            {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </nav>

      {/* Desktop Header */}
      <div className="hidden lg:block bg-white border-b fixed top-16 left-0 right-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/courses')}
              className="text-red-600 hover:text-red-700 flex items-center text-sm font-semibold"
            >
              ← Back to Courses
            </button>
            <div className="flex items-center justify-between flex-1">
              <h1 className="text-lg font-bold text-gray-900 truncate ml-48">{course?.title}</h1>
              <p className="text-sm text-gray-600 font-medium">{course?.instructor_name}</p>
            </div>
            {!isEnrolled && (
              <div className="flex-shrink-0 ml-8">
                <button
                  onClick={() => router.push(`/courses/${params.id}`)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 font-semibold rounded-lg transition-colors text-sm shadow-md hover:shadow-lg"
                >
                  Enroll Now
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Course Content Sidebar */}
      <div className={`
        lg:hidden fixed top-20 left-0 bottom-0 w-full max-w-sm bg-white z-50 transform transition-transform duration-300 ease-in-out shadow-xl
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full overflow-y-auto">
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-900 to-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Course Content</h2>
                <p className="text-sm text-gray-300 mt-1">
                  {modules.reduce((total, module) => total + module.course_lessons.length, 0)} lessons
                </p>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="text-gray-300 hover:text-white p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="pb-4">
            {modules.map((module) => (
              <div key={module.id} className="border-b last:border-b-0 border-gray-100">
                <button
                  onClick={() => toggleModule(module.id)}
                  className="w-full p-4 text-left hover:bg-gray-50 flex items-center justify-between transition-colors duration-200 min-h-[60px]"
                >
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{module.title}</h3>
                    <p className="text-xs text-gray-500">{module.course_lessons.length} lessons</p>
                  </div>
                  {expandedModules.has(module.id) ? (
                    <ChevronDown className="w-4 h-4 text-red-600 transition-transform duration-200 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400 transition-transform duration-200 flex-shrink-0" />
                  )}
                </button>
                
                {expandedModules.has(module.id) && (
                  <div className="bg-gray-50 border-t border-gray-100">
                    {module.course_lessons.map((lesson) => {
                      const isLocked = !isEnrolled && !lesson.is_free_preview
                      const isCompleted = lesson.progress?.is_completed
                      const isCurrent = currentLesson?.id === lesson.id
                      
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => selectLesson(lesson)}
                          disabled={isLocked}
                          className={`w-full p-4 text-left hover:bg-white flex items-center gap-3 transition-all duration-200 border-b border-gray-100 last:border-b-0 min-h-[70px] ${
                            isCurrent ? 'bg-red-50 border-r-4 border-red-600 shadow-sm' : ''
                          } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''} ${
                            !isLocked && !isCurrent ? 'hover:shadow-sm' : ''
                          }`}
                        >
                          <div className="flex-shrink-0">
                            {isLocked ? (
                              <Lock className="w-4 h-4 text-gray-400" />
                            ) : isCompleted ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <PlayCircle className="w-4 h-4 text-red-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {lesson.title}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                              <Clock className="w-3 h-3 flex-shrink-0" />
                              {formatDuration(lesson.duration_minutes)}
                              {lesson.is_free_preview && (
                                <span className="bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap">Free</span>
                              )}
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-20 lg:pt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="lg:grid lg:grid-cols-4 lg:gap-8">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden sticky top-32">
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-900 to-gray-800">
                  <h2 className="text-lg font-bold text-white">Course Content</h2>
                  <p className="text-sm text-gray-300 mt-1">
                    {modules.reduce((total, module) => total + module.course_lessons.length, 0)} lessons
                  </p>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {modules.map((module) => (
                    <div key={module.id} className="border-b last:border-b-0 border-gray-100">
                      <button
                        onClick={() => toggleModule(module.id)}
                        className="w-full p-4 text-left hover:bg-gray-50 flex items-center justify-between transition-colors duration-200 min-h-[60px]"
                      >
                        <div>
                          <h3 className="text-sm font-bold text-gray-900">{module.title}</h3>
                          <p className="text-xs text-gray-500">{module.course_lessons.length} lessons</p>
                        </div>
                        {expandedModules.has(module.id) ? (
                          <ChevronDown className="w-4 h-4 text-red-600 transition-transform duration-200 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400 transition-transform duration-200 flex-shrink-0" />
                        )}
                      </button>
                      
                      {expandedModules.has(module.id) && (
                        <div className="bg-gray-50 border-t border-gray-100">
                          {module.course_lessons.map((lesson) => {
                            const isLocked = !isEnrolled && !lesson.is_free_preview
                            const isCompleted = lesson.progress?.is_completed
                            const isCurrent = currentLesson?.id === lesson.id
                            
                            return (
                              <button
                                key={lesson.id}
                                onClick={() => selectLesson(lesson)}
                                disabled={isLocked}
                                className={`w-full p-3 text-left hover:bg-white flex items-center gap-3 transition-all duration-200 border-b border-gray-100 last:border-b-0 min-h-[70px] ${
                                  isCurrent ? 'bg-red-50 border-r-4 border-red-600 shadow-sm' : ''
                                } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''} ${
                                  !isLocked && !isCurrent ? 'hover:shadow-sm' : ''
                                }`}
                              >
                                <div className="flex-shrink-0">
                                  {isLocked ? (
                                    <Lock className="w-4 h-4 text-gray-400" />
                                  ) : isCompleted ? (
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                  ) : (
                                    <PlayCircle className="w-4 h-4 text-red-600" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-gray-900 truncate">
                                    {lesson.title}
                                  </p>
                                  <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                                    <Clock className="w-3 h-3 flex-shrink-0" />
                                    {formatDuration(lesson.duration_minutes)}
                                    {lesson.is_free_preview && (
                                      <span className="bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap">Free</span>
                                    )}
                                  </div>
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3">
              {currentLesson ? (
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="p-4 lg:p-8 border-b border-gray-200 bg-gradient-to-r from-gray-900 to-gray-800">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex-1">
                        <h1 className="text-xl lg:text-3xl font-bold text-white mb-2 lg:mb-3">
                          {currentLesson.title}
                        </h1>
                        <p className="text-sm lg:text-base text-gray-300">{currentLesson.description}</p>
                      </div>
                      {isEnrolled && (
                        <button
                          onClick={() => toggleLessonCompletion(currentLesson.id)}
                          className={`flex items-center gap-2 px-4 lg:px-6 py-2 lg:py-3 rounded-lg text-sm lg:text-base font-bold transition-all duration-200 hover:shadow-lg self-start ${
                            currentLesson.progress?.is_completed
                              ? 'bg-green-600 text-white hover:bg-green-700 shadow-md'
                              : 'bg-red-600 text-white hover:bg-red-700 shadow-md'
                          }`}
                        >
                          {currentLesson.progress?.is_completed ? (
                            <>
                              <CheckCircle className="w-4 lg:w-5 h-4 lg:h-5" />
                              <span>Completed ✓</span>
                            </>
                          ) : (
                            <>
                              <Circle className="w-4 lg:w-5 h-4 lg:h-5" />
                              <span>Mark Complete</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="p-4 lg:p-8">
                    {/* Video Player */}
                    {currentLesson.video_url && (
                      <div className="mb-6 lg:mb-8">
                        <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden shadow-md">
                          <video
                            src={currentLesson.video_url}
                            controls
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}

                    {/* Rich Text Lesson Content */}
                    {currentLesson.content && (
                      <div className="mb-6 lg:mb-8">
                        <RichTextRenderer 
                          content={currentLesson.content}
                          className="text-gray-900 leading-relaxed text-base lg:text-lg"
                        />
                      </div>
                    )}

                    {/* Resources */}
                    {currentLesson.resources && currentLesson.resources.length > 0 && (
                      <div>
                        <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-4 lg:mb-6">Resources</h3>
                        <div className="space-y-3 lg:space-y-4">
                          {currentLesson.resources.map((resource) => (
                            <div key={resource.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 lg:p-6 bg-gray-50 rounded-xl border border-gray-200 hover:border-red-300 hover:shadow-md transition-all duration-200">
                              <div className="flex items-start gap-3 lg:gap-4 flex-1">
                                <FileText className="w-5 lg:w-6 h-5 lg:h-6 text-red-600 flex-shrink-0 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm lg:text-base font-bold text-gray-900">{resource.title}</h4>
                                  {resource.description && (
                                    <p className="text-xs lg:text-sm text-gray-600 mt-1">{resource.description}</p>
                                  )}
                                </div>
                              </div>
                              {resource.is_downloadable && (
                                <a
                                  href={resource.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-red-600 hover:text-red-700 flex items-center gap-2 text-sm lg:text-base font-bold hover:bg-red-50 px-3 py-2 rounded-lg transition-colors duration-200 self-start sm:self-center"
                                >
                                  <Download className="w-4 lg:w-5 h-4 lg:h-5" />
                                  Download
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 lg:p-16 text-center">
                  <div className="p-4 lg:p-6 bg-red-50 rounded-full w-fit mx-auto mb-6 lg:mb-8">
                    <PlayCircle className="w-12 lg:w-16 h-12 lg:h-16 text-red-600" />
                  </div>
                  <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3 lg:mb-4">Select a Lesson</h2>
                  <p className="text-sm lg:text-base text-gray-600 max-w-md mx-auto mb-4 lg:hidden">
                    Tap the &ldquo;Lessons&rdquo; button above to choose a lesson and start your learning journey
                  </p>
                  <p className="hidden lg:block text-sm lg:text-base text-gray-600 max-w-md mx-auto">
                    Choose a lesson from the sidebar to start your learning journey
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

