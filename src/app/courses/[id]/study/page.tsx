'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChevronDown, ChevronRight, PlayCircle, FileText, Download, Clock, CheckCircle, Lock } from 'lucide-react'
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

  const markLessonComplete = async (lessonId: string) => {
    if (!user || !isEnrolled) return

    try {
      await supabase
        .from('lesson_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          is_completed: true,
          completed_at: new Date().toISOString()
        })

      // Reload progress
      loadCourseContent()
    } catch (err) {
      console.error('Error marking lesson complete:', err)
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course content...</p>
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Course not found'}</p>
          <button
            onClick={() => router.push('/courses')}
            className="text-blue-600 hover:text-blue-700"
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
      <div className="bg-white border-b fixed top-16 left-0 right-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => router.push('/courses')}
                className="text-blue-600 hover:text-blue-700 mb-2 flex items-center text-sm font-medium"
              >
                ← Back to Courses
              </button>
              <h1 className="text-xl font-semibold text-gray-900">{course.title}</h1>
              <p className="text-sm text-gray-600">{course.instructor_name}</p>
            </div>
            {!isEnrolled && (
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-2">Not enrolled</p>
                <button
                  onClick={() => router.push(`/courses/${params.id}`)}
                  className="btn-primary"
                >
                  Enroll Now
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content - Add top padding to account for fixed header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-40">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Course Content Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Course Content</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {modules.reduce((total, module) => total + module.course_lessons.length, 0)} lessons
                </p>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {modules.map((module) => (
                  <div key={module.id} className="border-b last:border-b-0">
                    <button
                      onClick={() => toggleModule(module.id)}
                      className="w-full p-3 text-left hover:bg-gray-50 flex items-center justify-between touch-target"
                    >
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{module.title}</h3>
                        <p className="text-xs text-gray-500">{module.course_lessons.length} lessons</p>
                      </div>
                      {expandedModules.has(module.id) ? (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                    
                    {expandedModules.has(module.id) && (
                      <div className="bg-gray-50">
                        {module.course_lessons.map((lesson) => {
                          const isLocked = !isEnrolled && !lesson.is_free_preview
                          const isCompleted = lesson.progress?.is_completed
                          const isCurrent = currentLesson?.id === lesson.id
                          
                          return (
                            <button
                              key={lesson.id}
                              onClick={() => selectLesson(lesson)}
                              disabled={isLocked}
                              className={`w-full p-3 text-left hover:bg-gray-100 flex items-center gap-3 touch-target ${
                                isCurrent ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                              } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <div className="flex-shrink-0">
                                {isLocked ? (
                                  <Lock className="w-4 h-4 text-gray-400" />
                                ) : isCompleted ? (
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                ) : (
                                  <PlayCircle className="w-4 h-4 text-gray-400" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {lesson.title}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <Clock className="w-3 h-3" />
                                  {formatDuration(lesson.duration_minutes)}
                                  {lesson.is_free_preview && (
                                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Free</span>
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
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                        {currentLesson.title}
                      </h1>
                      <p className="text-sm text-gray-600">{currentLesson.description}</p>
                    </div>
                    {isEnrolled && !currentLesson.progress?.is_completed && (
                      <button
                        onClick={() => markLessonComplete(currentLesson.id)}
                        className="btn-primary flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Mark Complete
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  {/* Video Player */}
                  {currentLesson.video_url && (
                    <div className="mb-6">
                      <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                        <video
                          src={currentLesson.video_url}
                          controls
                          className="w-full h-full"
                        />
                      </div>
                    </div>
                  )}

                  {/* Lesson Content */}
                  {currentLesson.content && (
                    <div className="prose prose-sm max-w-none mb-6">
                      <div className="text-gray-700 leading-relaxed text-base whitespace-pre-wrap">{currentLesson.content}</div>
                    </div>
                  )}

                  {/* Resources */}
                  {currentLesson.resources && currentLesson.resources.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Resources</h3>
                      <div className="space-y-3">
                        {currentLesson.resources.map((resource) => (
                          <div key={resource.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg touch-target">
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-gray-400" />
                              <div>
                                <h4 className="text-sm font-medium text-gray-900">{resource.title}</h4>
                                {resource.description && (
                                  <p className="text-xs text-gray-500">{resource.description}</p>
                                )}
                              </div>
                            </div>
                            {resource.is_downloadable && (
                              <a
                                href={resource.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700 flex items-center gap-2 touch-target text-sm font-medium"
                              >
                                <Download className="w-4 h-4" />
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
              <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                <PlayCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Select a Lesson</h2>
                <p className="text-sm text-gray-600">Choose a lesson from the sidebar to start learning</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

