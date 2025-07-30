'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChevronDown, ChevronRight, PlayCircle, FileText, Download, Clock, CheckCircle, Lock, Circle } from 'lucide-react'
import { supabase, Course, CourseModule, CourseLesson, CourseResource, LessonProgress } from '@/lib/supabase'
import { getCourseWithModulesAndLessons, updateEnrollmentProgress } from '@/lib/database-operations'
import { useAuth } from '@/contexts/AuthContext'

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

  const loadCourseContent = useCallback(async () => {
    try {
      setLoading(true)
      
      if (!user) {
        router.push('/login')
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
      console.error('Error loading course content:', err)
      setError('Failed to load course content')
    } finally {
      setLoading(false)
    }
  }, [user, params.id, router])

  useEffect(() => {
    if (!user) {
      router.push('/login')
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
        console.error('Error checking existing record:', checkError)
        throw checkError
      }

      let result
      if (existingRecord) {
        // Step 2a: Update existing record
        console.log('Updating existing lesson progress record')
        result = await supabase
          .from('lesson_progress')
          .update({
            is_completed: newCompletionStatus,
            completed_at: newCompletionStatus ? new Date().toISOString() : null
          })
          .eq('id', existingRecord.id)
      } else {
        // Step 2b: Create new record
        console.log('Creating new lesson progress record')
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
        console.error('Lesson progress operation failed:', result.error)
        throw result.error
      }

      console.log('Lesson progress updated successfully')
      // Reload progress to reflect changes
      await loadCourseContent()
      
    } catch (err) {
      console.error('Error toggling lesson completion:', err)
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
      {/* Header */}
      <div className="bg-white border-b fixed top-16 left-0 right-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => router.push('/courses')}
                className="text-red-600 hover:text-red-700 mb-3 flex items-center text-base font-bold"
              >
                ← Back to Courses
              </button>
              <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
              <p className="text-base text-gray-600 mt-1">{course.instructor_name}</p>
            </div>
            {!isEnrolled && (
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">Not enrolled</p>
                <button
                  onClick={() => router.push(`/courses/${params.id}`)}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 font-bold rounded-lg transition-colors text-base shadow-md hover:shadow-lg"
                >
                  Enroll Now
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content - Add top padding to account for fixed header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-44">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Course Content Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-900 to-gray-800">
                <h2 className="text-xl font-bold text-white">Course Content</h2>
                <p className="text-base text-gray-300 mt-1">
                  {modules.reduce((total, module) => total + module.course_lessons.length, 0)} lessons
                </p>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {modules.map((module) => (
                  <div key={module.id} className="border-b last:border-b-0 border-gray-100">
                    <button
                      onClick={() => toggleModule(module.id)}
                      className="w-full p-4 text-left hover:bg-gray-50 flex items-center justify-between touch-target transition-colors duration-200"
                    >
                      <div>
                        <h3 className="text-base font-bold text-gray-900">{module.title}</h3>
                        <p className="text-sm text-gray-500">{module.course_lessons.length} lessons</p>
                      </div>
                      {expandedModules.has(module.id) ? (
                        <ChevronDown className="w-5 h-5 text-red-600 transition-transform duration-200" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400 transition-transform duration-200" />
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
                              className={`w-full p-4 text-left hover:bg-white flex items-center gap-3 touch-target transition-all duration-200 border-b border-gray-100 last:border-b-0 ${
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
                                <p className="text-base font-bold text-gray-900 truncate">
                                  {lesson.title}
                                </p>
                                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                  <Clock className="w-3 h-3" />
                                  {formatDuration(lesson.duration_minutes)}
                                  {lesson.is_free_preview && (
                                    <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-bold">Free</span>
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
          <div className="lg:col-span-2">
            {currentLesson ? (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="p-8 border-b border-gray-200 bg-gradient-to-r from-gray-900 to-gray-800">
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-3xl font-bold text-white mb-3">
                        {currentLesson.title}
                      </h1>
                      <p className="text-base text-gray-300">{currentLesson.description}</p>
                    </div>
                    {isEnrolled && (
                      <button
                        onClick={() => toggleLessonCompletion(currentLesson.id)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg text-base font-bold transition-all duration-200 hover:shadow-lg ${
                          currentLesson.progress?.is_completed
                            ? 'bg-green-600 text-white hover:bg-green-700 shadow-md'
                            : 'bg-red-600 text-white hover:bg-red-700 shadow-md'
                        }`}
                      >
                        {currentLesson.progress?.is_completed ? (
                          <>
                            <CheckCircle className="w-5 h-5" />
                            <span>Completed ✓</span>
                          </>
                        ) : (
                          <>
                            <Circle className="w-5 h-5" />
                            <span>Mark Complete</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-8">
                  {/* Video Player */}
                  {currentLesson.video_url && (
                    <div className="mb-8">
                      <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden shadow-md">
                        <video
                          src={currentLesson.video_url}
                          controls
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}

                  {/* Lesson Content */}
                  {currentLesson.content && (
                    <div className="prose prose-xl max-w-none mb-8">
                      <div className="text-gray-900 leading-relaxed text-lg whitespace-pre-wrap">{currentLesson.content}</div>
                    </div>
                  )}

                  {/* Resources */}
                  {currentLesson.resources && currentLesson.resources.length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-6">Resources</h3>
                      <div className="space-y-4">
                        {currentLesson.resources.map((resource) => (
                          <div key={resource.id} className="flex items-center justify-between p-6 bg-gray-50 rounded-xl touch-target border border-gray-200 hover:border-red-300 hover:shadow-md transition-all duration-200">
                            <div className="flex items-center gap-4">
                              <FileText className="w-6 h-6 text-red-600" />
                              <div>
                                <h4 className="text-base font-bold text-gray-900">{resource.title}</h4>
                                {resource.description && (
                                  <p className="text-sm text-gray-600 mt-1">{resource.description}</p>
                                )}
                              </div>
                            </div>
                            {resource.is_downloadable && (
                              <a
                                href={resource.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-red-600 hover:text-red-700 flex items-center gap-2 touch-target text-base font-bold hover:bg-red-50 px-3 py-2 rounded-lg transition-colors duration-200"
                              >
                                <Download className="w-5 h-5" />
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
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-16 text-center">
                <div className="p-6 bg-red-50 rounded-full w-fit mx-auto mb-8">
                  <PlayCircle className="w-16 h-16 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Select a Lesson</h2>
                <p className="text-base text-gray-600 max-w-md mx-auto">Choose a lesson from the sidebar to start your learning journey</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

