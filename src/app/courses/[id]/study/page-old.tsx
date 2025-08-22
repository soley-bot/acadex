'use client'

import { logger } from '@/lib/logger'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChevronDown, ChevronRight, PlayCircle, FileText, Download, Clock, CheckCircle, Lock, Circle, Menu, X, Home, BookOpen } from 'lucide-react'
import { supabase, Course, CourseModule, CourseLesson, CourseResource, LessonProgress } from '@/lib/supabase'
import { getCourseWithModulesAndLessons, updateEnrollmentProgress } from '@/lib/database-operations'
import { useAuth } from '@/contexts/AuthContext'
import { RichTextRenderer } from '@/components/ui/RichTextRenderer'
import { LessonQuiz } from '@/components/lesson/LessonQuiz'
import { Typography, DisplayLG, H1, H2, H3, BodyLG, BodyMD } from '@/components/ui/Typography'
import { Container, Section, Grid, Flex } from '@/components/ui/Layout'
import { VideoPlayer } from '@/components/ui/VideoPlayer'
import Icon from '@/components/ui/Icon'

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
  const [showQuizModal, setShowQuizModal] = useState(false)

  const loadCourseContent = useCallback(async () => {
    try {
      setLoading(true)
      
      if (!user) {
        router.push('/auth/login')
        return
      }
      
      // Admin users can access any course without enrollment check
      if (user.role === 'admin') {
        setIsEnrolled(true)
        setEnrollmentProgress(0)
        
        // Load course with modules and lessons
        const courseData = await getCourseWithModulesAndLessons(params.id as string)
        setCourse(courseData)
        
        // Load lesson progress for user (if any)
        const { data: progressData } = await supabase
          .from('lesson_progress')
          .select('*')
          .eq('user_id', user.id)
        
        // Process progress data...
        const progressMap = new Map()
        progressData?.forEach((progress: LessonProgress) => {
          progressMap.set(progress.lesson_id, progress)
        })
        
        // Apply progress to lessons
        const modulesWithProgress = courseData.modules.map((module: ModuleWithContent) => ({
          ...module,
          course_lessons: module.course_lessons.map((lesson: LessonWithProgress) => ({
            ...lesson,
            progress: progressMap.get(lesson.id)
          }))
        }))
        
        setModules(modulesWithProgress)
        setExpandedModules(new Set(courseData.modules.map((m: CourseModule) => m.id)))
        
        const firstModule = modulesWithProgress[0]
        if (firstModule?.course_lessons && firstModule.course_lessons.length > 0) {
          const firstLesson = firstModule.course_lessons[0]
          if (firstLesson) {
            setCurrentLesson(firstLesson)
          }
        }
        
        setLoading(false)
        return
      }
      
      // Regular enrollment check for non-admin users
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
          progress: progressData?.find((p: any) => p.lesson_id === lesson.id)
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
      <Section 
        className="min-h-screen relative overflow-hidden"
        background="gradient"
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-warning/40 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-secondary/40 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
        
        <Container className="relative flex items-center justify-center min-h-screen">
          <div className="text-center bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <BodyLG color="muted" className="font-medium">Loading course content...</BodyLG>
          </div>
        </Container>
      </Section>
    )
  }

  if (error || !course) {
    return (
      <Section 
        className="min-h-screen relative overflow-hidden"
        background="gradient"
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-warning/40 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-secondary/40 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
        
        <Container className="relative flex items-center justify-center min-h-screen px-4">
          <div className="text-center bg-white/80 backdrop-blur-lg rounded-2xl p-12 shadow-xl border border-white/20 max-w-md w-full">
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary/90 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Icon name="warning" size={32} color="white" />
            </div>
            <H3 className="mb-4">{error || 'Course not found'}</H3>
            <button
              onClick={() => router.push('/courses')}
              className="bg-primary hover:bg-secondary text-white hover:text-black px-6 py-3 rounded-xl font-bold transition-all duration-200 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
            >
              ← Back to Courses
            </button>
          </div>
        </Container>
      </Section>
    )
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background Elements - Using Semantic Colors */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-primary/15 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-secondary/15 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-6000"></div>
      </div>

      {/* Mobile Navigation Bar */}
      <nav className="lg:hidden fixed top-14 left-0 right-0 z-40 bg-card/95 backdrop-blur-lg border-b border-border shadow-lg">
        {/* Top Row: Course Title and Menu Button */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <button
              onClick={() => router.push('/courses')}
              className="flex items-center text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 bg-card rounded-lg p-2 shadow-sm border border-border"
            >
              <Home className="w-4 h-4" />
            </button>
            <div className="flex-1 min-w-0">
              <BodyMD className="font-bold truncate text-foreground">
                {course?.title || 'Course'}
              </BodyMD>
            </div>
          </div>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="flex items-center space-x-2 bg-primary hover:bg-secondary text-white hover:text-black px-4 py-2 rounded-lg transition-all duration-200 flex-shrink-0 shadow-lg"
          >
            <BookOpen className="w-4 h-4" />
            <span className="text-sm font-medium">Lessons</span>
            {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
        
        {/* Bottom Row: Current Lesson */}
        {currentLesson && (
          <div className="px-4 py-3 bg-muted/50">
            <div className="flex items-center space-x-2">
              <PlayCircle className="w-4 h-4 text-primary flex-shrink-0" />
              <BodyMD className="truncate font-medium text-foreground">
                {currentLesson.title}
              </BodyMD>
            </div>
          </div>
        )}
      </nav>

      {/* Desktop Header */}
      <div className="hidden lg:block bg-card/80 backdrop-blur-lg border-b border-border fixed top-16 left-0 right-0 z-10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/courses')}
              className="bg-primary hover:bg-secondary text-white hover:text-black flex items-center text-sm font-semibold rounded-lg px-4 py-2 shadow-lg transition-all duration-200 hover:-translate-y-1"
            >
              ← Back to Courses
            </button>
            <div className="flex items-center justify-between flex-1">
              <h1 className="text-lg font-bold text-foreground truncate ml-48">{course?.title}</h1>
              <p className="text-sm text-muted-foreground font-medium bg-card/80 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg border border-border">{course?.instructor_name}</p>
            </div>
            {!isEnrolled && (
              <div className="flex-shrink-0 ml-8">
                <button
                  onClick={() => router.push(`/courses/${params.id}`)}
                  className="bg-primary hover:bg-secondary text-white hover:text-black px-4 py-2 font-semibold rounded-lg transition-all duration-200 text-sm shadow-lg hover:shadow-xl transform hover:-translate-y-1"
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
        lg:hidden fixed top-20 left-0 bottom-0 w-full max-w-sm bg-white z-50 transform transition-transform duration-300 ease-in-out shadow-xl border-r border-gray-200
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full overflow-y-auto">
          <div className="p-6 border-b border-gray-200 bg-primary">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Course Content</h2>
                <p className="text-sm text-white/90 mt-1">
                  {modules.reduce((total, module) => total + module.course_lessons.length, 0)} lessons
                </p>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="text-white/80 hover:text-white p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="pb-4">
            {modules.map((module) => (
              <div key={module.id} className="border-b last:border-b-0 border-border">
                <button
                  onClick={() => toggleModule(module.id)}
                  className="w-full p-4 text-left hover:bg-muted flex items-center justify-between transition-all duration-200 min-h-[60px]"
                >
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{module.title}</h3>
                    <p className="text-xs text-muted-foreground">{module.course_lessons.length} lessons</p>
                  </div>
                  {expandedModules.has(module.id) ? (
                    <ChevronDown className="w-4 h-4 text-primary transition-transform duration-200 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground transition-transform duration-200 flex-shrink-0" />
                  )}
                </button>
                
                {expandedModules.has(module.id) && (
                  <div className="bg-muted border-t border-border">
                    {module.course_lessons.map((lesson) => {
                      const isLocked = !isEnrolled && !lesson.is_free_preview
                      const isCompleted = lesson.progress?.is_completed
                      const isCurrent = currentLesson?.id === lesson.id
                      
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => selectLesson(lesson)}
                          disabled={isLocked}
                          className={`w-full p-4 text-left hover:bg-white flex items-center gap-3 transition-all duration-200 border-b border-gray-200 last:border-b-0 min-h-[70px] ${
                            isCurrent ? 'bg-primary/5 border-r-4 border-primary' : ''
                          } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <div className="flex-shrink-0">
                            {isLocked ? (
                              <Lock className="w-4 h-4 text-muted-foreground" />
                            ) : isCompleted ? (
                              <CheckCircle className="w-4 h-4 text-success" />
                            ) : (
                              <PlayCircle className="w-4 h-4 text-primary" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">
                              {lesson.title}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                              <Clock className="w-3 h-3 flex-shrink-0" />
                              {formatDuration(lesson.duration_minutes)}
                              {lesson.is_free_preview && (
                                <span className="bg-success/10 text-success px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap">Free</span>
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
      <div className="relative pt-36 lg:pt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="lg:grid lg:grid-cols-4 lg:gap-8">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden sticky top-32">
                <div className="p-6 border-b border-gray-200 bg-primary">
                  <h2 className="text-lg font-semibold text-white">Course Content</h2>
                  <p className="text-sm text-white/90 mt-1">
                    {modules.reduce((total, module) => total + module.course_lessons.length, 0)} lessons
                  </p>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {modules.map((module) => (
                    <div key={module.id} className="border-b last:border-b-0 border-border">
                      <button
                        onClick={() => toggleModule(module.id)}
                        className="w-full p-4 text-left hover:bg-muted flex items-center justify-between transition-all duration-200 min-h-[60px]"
                      >
                        <div>
                          <h3 className="text-sm font-semibold text-foreground">{module.title}</h3>
                          <p className="text-xs text-muted-foreground">{module.course_lessons.length} lessons</p>
                        </div>
                        {expandedModules.has(module.id) ? (
                          <ChevronDown className="w-4 h-4 text-primary transition-transform duration-200 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-muted-foreground transition-transform duration-200 flex-shrink-0" />
                        )}
                      </button>
                      
                      {expandedModules.has(module.id) && (
                        <div className="bg-muted border-t border-border">
                          {module.course_lessons.map((lesson) => {
                            const isLocked = !isEnrolled && !lesson.is_free_preview
                            const isCompleted = lesson.progress?.is_completed
                            const isCurrent = currentLesson?.id === lesson.id
                            
                            return (
                              <button
                                key={lesson.id}
                                onClick={() => selectLesson(lesson)}
                                disabled={isLocked}
                                className={`w-full p-4 text-left hover:bg-white flex items-center gap-3 transition-all duration-200 border-b border-gray-200 last:border-b-0 min-h-[70px] ${
                                  isCurrent ? 'bg-primary/5 border-r-4 border-primary' : ''
                                } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                              >
                                <div className="flex-shrink-0">
                                  {isLocked ? (
                                    <Lock className="w-4 h-4 text-muted-foreground" />
                                  ) : isCompleted ? (
                                    <CheckCircle className="w-4 h-4 text-success" />
                                  ) : (
                                    <PlayCircle className="w-4 h-4 text-primary" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-foreground truncate">
                                    {lesson.title}
                                  </p>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                    <Clock className="w-3 h-3 flex-shrink-0" />
                                    {formatDuration(lesson.duration_minutes)}
                                    {lesson.is_free_preview && (
                                      <span className="bg-success/10 text-success px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap">Free</span>
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
                <div className="bg-card/80 backdrop-blur-lg rounded-2xl shadow-xl border border-border overflow-hidden">
                  <div className="p-6 lg:p-8 border-b border-border bg-primary">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex-1">
                        <h1 className="text-xl lg:text-3xl font-bold text-white mb-3">
                          {currentLesson.title}
                        </h1>
                        <p className="text-sm lg:text-base text-white/80">{currentLesson.description}</p>
                      </div>
                      {isEnrolled && (
                        <button
                          onClick={() => toggleLessonCompletion(currentLesson.id)}
                          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm lg:text-base font-bold transition-all duration-200 transform hover:-translate-y-1 shadow-lg hover:shadow-xl self-start ${
                            currentLesson.progress?.is_completed
                              ? 'bg-success hover:bg-success/90 text-success-foreground'
                              : 'bg-secondary hover:bg-secondary/90 text-black'
                          }`}
                        >
                          {currentLesson.progress?.is_completed ? (
                            <>
                              <CheckCircle className="w-5 h-5" />
                              <span>Completed</span>
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

                  <div className="p-4 lg:p-8">
                    {/* Video Player */}
                    {currentLesson.video_url && (
                      <div className="mb-6 lg:mb-8">
                        <div className="aspect-video bg-muted/40/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl border border-white/20">
                          <VideoPlayer
                            url={currentLesson.video_url}
                            className="w-full h-full"
                          />
                        </div>
                      </div>
                    )}

                    {/* Rich Text Lesson Content */}
                    {currentLesson.content && (
                      <div className="mb-6 lg:mb-8 bg-white/50 backdrop-blur-sm rounded-2xl p-6 lg:p-8 shadow-lg border border-white/20">
                        <RichTextRenderer 
                          content={currentLesson.content}
                          className="text-foreground leading-relaxed text-base lg:text-lg"
                        />
                      </div>
                    )}

                    {/* Lesson Quiz Section */}
                    <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 lg:p-8 shadow-lg border border-white/20">
                      <h3 className="text-lg lg:text-xl font-bold text-foreground mb-4 lg:mb-6 flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary/90 rounded-full flex items-center justify-center">
                          <BookOpen className="w-4 h-4 text-white" />
                        </div>
                        Test Your Knowledge
                      </h3>
                      <div className="p-4 lg:p-6 bg-white/80 backdrop-blur-lg rounded-xl border border-white/20 hover:border-red-300 hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="flex items-start gap-3 lg:gap-4 flex-1">
                            <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary/90 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                              <CheckCircle className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm lg:text-base font-bold text-gray-900">Lesson Quiz</h4>
                              <p className="text-xs lg:text-sm text-gray-600 mt-1">
                                Test your understanding of this lesson with a quick quiz
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>~5 min</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="w-3 h-3 bg-red-400 rounded-full flex items-center justify-center text-white text-xs">#</span>
                                  <span>5 questions</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <button 
                            onClick={() => setShowQuizModal(true)}
                            className="bg-primary hover:bg-secondary text-white hover:text-black flex items-center gap-2 text-sm lg:text-base font-bold px-6 py-3 rounded-xl transition-all duration-200 transform hover:-translate-y-1 shadow-lg hover:shadow-xl self-start sm:self-center"
                          >
                            <PlayCircle className="w-4 h-4" />
                            Take Quiz
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Resources */}
                    {currentLesson.resources && currentLesson.resources.length > 0 && (
                      <div className="bg-muted/50 backdrop-blur-sm rounded-2xl p-6 lg:p-8 shadow-lg border border-border">
                        <h3 className="text-lg lg:text-xl font-bold text-foreground mb-6 flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                            <FileText className="w-4 h-4 text-white" />
                          </div>
                          Resources
                        </h3>
                        <div className="space-y-4">
                          {currentLesson.resources.map((resource) => (
                            <div key={resource.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-card/80 backdrop-blur-lg rounded-xl border border-border hover:border-primary hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
                              <div className="flex items-start gap-4 flex-1">
                                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                                  <FileText className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm lg:text-base font-bold text-foreground">{resource.title}</h4>
                                  {resource.description && (
                                    <p className="text-xs lg:text-sm text-muted-foreground mt-1">{resource.description}</p>
                                  )}
                                </div>
                              </div>
                              {resource.is_downloadable && (
                                <a
                                  href={resource.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-primary hover:bg-secondary text-white hover:text-black flex items-center gap-2 text-sm lg:text-base font-bold px-6 py-3 rounded-xl transition-all duration-200 transform hover:-translate-y-1 shadow-lg hover:shadow-xl self-start sm:self-center"
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
                <div className="bg-card/80 backdrop-blur-lg rounded-2xl shadow-xl border border-border p-12 lg:p-16 text-center">
                  <div className="p-6 bg-primary rounded-full w-fit mx-auto mb-8 shadow-xl">
                    <PlayCircle className="w-16 h-16 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">Select a Lesson</h2>
                  <p className="text-base text-muted-foreground max-w-md mx-auto mb-4 lg:hidden">
                    Tap the &ldquo;Lessons&rdquo; button above to choose a lesson and start your learning journey
                  </p>
                  <p className="hidden lg:block text-base text-muted-foreground max-w-md mx-auto">
                    Choose a lesson from the sidebar to start your learning journey
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Lesson Quiz Modal */}
      {showQuizModal && currentLesson && (
        <LessonQuiz
          lessonId={currentLesson.id}
          lessonTitle={currentLesson.title}
          isOpen={showQuizModal}
          onClose={() => setShowQuizModal(false)}
          onComplete={(score) => {
            console.log('Quiz completed with score:', score)
            // TODO: Save quiz attempt to database
          }}
        />
      )}
    </div>
  )
}

