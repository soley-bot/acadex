'use client'

import { logger } from '@/lib/logger'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChevronDown, ChevronRight, PlayCircle, FileText, Download, Clock, CheckCircle, Lock, Circle, Menu, X, Home, BookOpen } from 'lucide-react'
import { supabase, Course, CourseModule, CourseLesson, CourseResource, LessonProgress } from '@/lib/supabase'
import { getCourseWithModulesAndLessons, updateEnrollmentProgress } from '@/lib/database-operations'
import { useAuth } from '@/contexts/AuthContext'
import { RichTextRenderer } from '@/components/ui/RichTextRenderer'
import { LessonQuiz, QuizAttemptResult } from '@/components/lesson/LessonQuiz'
import { Typography, DisplayLG, H1, H2, H3, BodyLG, BodyMD } from '@/components/ui/Typography'
import { Container, Section, Grid, Flex } from '@/components/ui/Layout'
import Icon from '@/components/ui/Icon'
import { useToast } from '@/components/ui/Toast'

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
  const { success: showSuccessToast, error: showErrorToast } = useToast()

  const loadCourseContent = useCallback(async () => {
    try {
      setLoading(true);
      if (!user) {
        router.push('/auth/login');
        return;
      }

      const { data: enrollmentData, error: enrollmentError } = await supabase
        .from('enrollments')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', params.id)
        .single();

      if (enrollmentError || !enrollmentData) {
        setIsEnrolled(false);
        setError('You are not enrolled in this course.');
        return;
      }

      setIsEnrolled(true);
      setEnrollmentProgress(enrollmentData.progress || 0);

      const courseData = await getCourseWithModulesAndLessons(params.id as string);
      setCourse(courseData);

      const { data: progressData } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('user_id', user.id);

      const modulesWithProgress = courseData.modules.map((module: any) => ({
        ...module,
        course_lessons: module.course_lessons.map((lesson: any) => ({
          ...lesson,
          progress: progressData?.find(p => p.lesson_id === lesson.id),
        })),
      }));

      setModules(modulesWithProgress);

      let lessonToSet = null;
      if (enrollmentData.current_lesson_id) {
        for (const module of modulesWithProgress) {
          const foundLesson = module.course_lessons.find(l => l.id === enrollmentData.current_lesson_id);
          if (foundLesson) {
            lessonToSet = foundLesson;
            setExpandedModules(new Set([module.id]));
            break;
          }
        }
      }

      if (lessonToSet) {
        setCurrentLesson(lessonToSet);
      } else if (modulesWithProgress.length > 0 && modulesWithProgress[0].course_lessons.length > 0) {
        setCurrentLesson(modulesWithProgress[0].course_lessons[0]);
        setExpandedModules(new Set([modulesWithProgress[0].id]));
      }

    } catch (err) {
      logger.error('Error loading course content:', err);
      setError('Failed to load course content');
    } finally {
      setLoading(false);
    }
  }, [user, params.id, router]);

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
    if (!isEnrolled && !lesson.is_free_preview) {
      return;
    }
    setCurrentLesson(lesson);
    setIsSidebarOpen(false);

    // Fire-and-forget update to the backend
    fetch('/api/enrollments/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        course_id: params.id,
        lesson_id: lesson.id,
      }),
    }).catch(err => {
      logger.error('Failed to update current lesson progress:', err);
    });
  };

  const toggleLessonCompletion = async (lessonId: string) => {
    if (!user || !isEnrolled || !currentLesson) return;

    const originalModules = modules;
    const originalLesson = currentLesson;

    const newCompletionStatus = !originalLesson.progress?.is_completed;

    // Optimistic UI update
    const updatedModules = modules.map(module => ({
      ...module,
      course_lessons: module.course_lessons.map(lesson => {
        if (lesson.id === lessonId) {
          return {
            ...lesson,
            progress: { ...lesson.progress, is_completed: newCompletionStatus },
          };
        }
        return lesson;
      }),
    }));
    setModules(updatedModules);
    setCurrentLesson({
      ...originalLesson,
      progress: { ...originalLesson.progress, is_completed: newCompletionStatus },
    });

    try {
      const { data: existingRecord } = await supabase
        .from('lesson_progress')
        .select('id')
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId)
        .maybeSingle();

      const progressData = {
        is_completed: newCompletionStatus,
        completed_at: newCompletionStatus ? new Date().toISOString() : null,
      };

      let result;
      if (existingRecord) {
        result = await supabase
          .from('lesson_progress')
          .update(progressData)
          .eq('id', existingRecord.id);
      } else {
        result = await supabase.from('lesson_progress').insert({
          ...progressData,
          user_id: user.id,
          lesson_id: lessonId,
        });
      }

      if (result.error) throw result.error;
      
      showSuccessToast('Progress updated!', newCompletionStatus ? 'Lesson marked as complete.' : 'Lesson marked as incomplete.');

    } catch (err) {
      logger.error('Error toggling lesson completion:', err);
      showErrorToast('Update failed', 'Could not update lesson progress. Please try again.');

      // Revert UI on error
      setModules(originalModules);
      setCurrentLesson(originalLesson);
    }
  };

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
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
        
        <Container className="relative flex items-center justify-center min-h-screen">
          <div className="text-center bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
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
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
        
        <Container className="relative flex items-center justify-center min-h-screen px-4">
          <div className="text-center bg-white/80 backdrop-blur-lg rounded-2xl p-12 shadow-xl border border-white/20 max-w-md w-full">
            <div className="w-16 h-16 bg-gradient-to-r from-red-600 to-red-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Icon name="warning" size={32} color="white" />
            </div>
            <H3 className="mb-4">{error || 'Course not found'}</H3>
            <button
              onClick={() => router.push('/courses')}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-xl font-bold transition-all duration-200 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
            >
              ← Back to Courses
            </button>
          </div>
        </Container>
      </Section>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-6000"></div>
      </div>

      {/* Mobile Navigation Bar */}
      <nav className="lg:hidden fixed top-14 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-b border-white/20 shadow-lg">
        {/* Top Row: Course Title and Menu Button */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <button
              onClick={() => router.push('/courses')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors flex-shrink-0 bg-white rounded-lg p-1.5 shadow-sm border border-gray-200"
            >
              <Home className="w-4 h-4" />
            </button>
            <div className="flex-1 min-w-0">
              <BodyMD className="font-bold truncate text-gray-900">
                {course?.title || 'Course'}
              </BodyMD>
            </div>
          </div>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-red-600 to-red-700 text-white px-3 py-1.5 rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 flex-shrink-0 shadow-lg"
          >
            <BookOpen className="w-4 h-4" />
            <span className="text-sm font-medium">Lessons</span>
            {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
        
        {/* Bottom Row: Current Lesson */}
        {currentLesson && (
          <div className="px-4 py-2 bg-gray-50/80">
            <div className="flex items-center space-x-2">
              <PlayCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <BodyMD color="muted" className="truncate font-medium">
                {currentLesson.title}
              </BodyMD>
            </div>
          </div>
        )}
      </nav>

      {/* Desktop Header */}
      <div className="hidden lg:block bg-white/80 backdrop-blur-lg border-b border-white/20 fixed top-16 left-0 right-0 z-10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/courses')}
              className="text-red-600 hover:text-red-700 flex items-center text-sm font-semibold bg-white/80 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg border border-white/20 transition-all duration-200 hover:-translate-y-1"
            >
              ← Back to Courses
            </button>
            <div className="flex items-center justify-between flex-1">
              <h1 className="text-lg font-bold text-gray-900 truncate ml-48">{course?.title}</h1>
              <p className="text-sm text-gray-600 font-medium bg-white/80 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg border border-white/20">{course?.instructor_name}</p>
            </div>
            {!isEnrolled && (
              <div className="flex-shrink-0 ml-8">
                <button
                  onClick={() => router.push(`/courses/${params.id}`)}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-2 font-semibold rounded-lg transition-all duration-200 text-sm shadow-lg hover:shadow-xl transform hover:-translate-y-1"
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
        lg:hidden fixed top-20 left-0 bottom-0 w-full max-w-sm bg-white/90 backdrop-blur-lg z-50 transform transition-transform duration-300 ease-in-out shadow-xl border-r border-white/20
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full overflow-y-auto">
          <div className="p-4 border-b border-white/20 bg-gradient-to-r from-gray-900 to-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Course Content</h2>
                <p className="text-sm text-gray-300 mt-1">
                  {modules.reduce((total, module) => total + module.course_lessons.length, 0)} lessons
                </p>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="text-gray-300 hover:text-white p-1 rounded bg-white/10 backdrop-blur-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="pb-4">
            {modules.map((module) => (
              <div key={module.id} className="border-b last:border-b-0 border-white/20">
                <button
                  onClick={() => toggleModule(module.id)}
                  className="w-full p-4 text-left hover:bg-white/50 flex items-center justify-between transition-all duration-200 min-h-[60px] backdrop-blur-sm"
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
                  <div className="bg-white/30 backdrop-blur-sm border-t border-white/20">
                    {module.course_lessons.map((lesson) => {
                      const isLocked = !isEnrolled && !lesson.is_free_preview
                      const isCompleted = lesson.progress?.is_completed
                      const isCurrent = currentLesson?.id === lesson.id
                      
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => selectLesson(lesson)}
                          disabled={isLocked}
                          className={`w-full p-4 text-left hover:bg-white/60 flex items-center gap-3 transition-all duration-200 border-b border-white/20 last:border-b-0 min-h-[70px] backdrop-blur-sm ${
                            isCurrent ? 'bg-red-50/80 border-r-4 border-red-600 shadow-lg' : ''
                          } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''} ${
                            !isLocked && !isCurrent ? 'hover:shadow-lg' : ''
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
                                <span className="bg-green-100/80 text-green-800 px-1.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap backdrop-blur-sm">Free</span>
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
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 overflow-hidden sticky top-32">
                <div className="p-4 border-b border-white/20 bg-gradient-to-r from-gray-900 to-gray-800">
                  <h2 className="text-lg font-bold text-white">Course Content</h2>
                  <p className="text-sm text-gray-300 mt-1">
                    {modules.reduce((total, module) => total + module.course_lessons.length, 0)} lessons
                  </p>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {modules.map((module) => (
                    <div key={module.id} className="border-b last:border-b-0 border-white/20">
                      <button
                        onClick={() => toggleModule(module.id)}
                        className="w-full p-4 text-left hover:bg-white/50 flex items-center justify-between transition-all duration-200 min-h-[60px] backdrop-blur-sm"
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
                        <div className="bg-white/30 backdrop-blur-sm border-t border-white/20">
                          {module.course_lessons.map((lesson) => {
                            const isLocked = !isEnrolled && !lesson.is_free_preview
                            const isCompleted = lesson.progress?.is_completed
                            const isCurrent = currentLesson?.id === lesson.id
                            
                            return (
                              <button
                                key={lesson.id}
                                onClick={() => selectLesson(lesson)}
                                disabled={isLocked}
                                className={`w-full p-3 text-left hover:bg-white/60 flex items-center gap-3 transition-all duration-200 border-b border-white/20 last:border-b-0 min-h-[70px] backdrop-blur-sm ${
                                  isCurrent ? 'bg-red-50/80 border-r-4 border-red-600 shadow-lg' : ''
                                } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''} ${
                                  !isLocked && !isCurrent ? 'hover:shadow-lg' : ''
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
                                      <span className="bg-green-100/80 text-green-800 px-1.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap backdrop-blur-sm">Free</span>
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
                <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                  <div className="p-4 lg:p-8 border-b border-white/20 bg-gradient-to-r from-gray-900 to-gray-800">
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
                          className={`flex items-center gap-2 px-4 lg:px-6 py-2 lg:py-3 rounded-xl text-sm lg:text-base font-bold transition-all duration-200 transform hover:-translate-y-1 shadow-lg hover:shadow-xl self-start ${
                            currentLesson.progress?.is_completed
                              ? 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800'
                              : 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800'
                          }`}
                        >
                          {currentLesson.progress?.is_completed ? (
                            <>
                              <CheckCircle className="w-4 lg:w-5 h-4 lg:h-5" />
                              <span>Completed</span>
                              <Icon name="check" size={16} color="current" />
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
                        <div className="aspect-video bg-gray-100/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl border border-white/20">
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
                      <div className="mb-6 lg:mb-8 bg-white/50 backdrop-blur-sm rounded-2xl p-6 lg:p-8 shadow-lg border border-white/20">
                        <RichTextRenderer 
                          content={currentLesson.content}
                          className="text-gray-900 leading-relaxed text-base lg:text-lg"
                        />
                      </div>
                    )}

                    {/* Lesson Quiz Section */}
                    <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 lg:p-8 shadow-lg border border-white/20">
                      <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-4 lg:mb-6 flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-red-700 rounded-full flex items-center justify-center">
                          <BookOpen className="w-4 h-4 text-white" />
                        </div>
                        Test Your Knowledge
                      </h3>
                      <div className="p-4 lg:p-6 bg-white/80 backdrop-blur-lg rounded-xl border border-white/20 hover:border-red-300 hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="flex items-start gap-3 lg:gap-4 flex-1">
                            <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-red-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
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
                            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white flex items-center gap-2 text-sm lg:text-base font-bold px-4 py-2 rounded-xl transition-all duration-200 transform hover:-translate-y-1 shadow-lg hover:shadow-xl self-start sm:self-center"
                          >
                            <PlayCircle className="w-4 h-4 text-white" />
                            Take Quiz
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Resources */}
                    {currentLesson.resources && currentLesson.resources.length > 0 && (
                      <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 lg:p-8 shadow-lg border border-white/20">
                        <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-4 lg:mb-6 flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
                            <FileText className="w-4 h-4 text-white" />
                          </div>
                          Resources
                        </h3>
                        <div className="space-y-3 lg:space-y-4">
                          {currentLesson.resources.map((resource) => (
                            <div key={resource.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 lg:p-6 bg-white/80 backdrop-blur-lg rounded-xl border border-white/20 hover:border-red-300 hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
                              <div className="flex items-start gap-3 lg:gap-4 flex-1">
                                <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-red-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                                  <FileText className="w-5 h-5 text-white" />
                                </div>
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
                                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white flex items-center gap-2 text-sm lg:text-base font-bold px-4 py-2 rounded-xl transition-all duration-200 transform hover:-translate-y-1 shadow-lg hover:shadow-xl self-start sm:self-center"
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
                <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8 lg:p-16 text-center">
                  <div className="p-4 lg:p-6 bg-gradient-to-r from-red-600 to-red-700 rounded-full w-fit mx-auto mb-6 lg:mb-8 shadow-xl">
                    <PlayCircle className="w-12 lg:w-16 h-12 lg:h-16 text-white" />
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
      
      {/* Lesson Quiz Modal */}
      {showQuizModal && currentLesson && (
        <LessonQuiz
          lessonId={currentLesson.id}
          lessonTitle={currentLesson.title}
          isOpen={showQuizModal}
          onClose={() => setShowQuizModal(false)}
          onComplete={async (result: QuizAttemptResult) => {
            logger.info('Quiz completed, saving attempt...', result)
            try {
              const response = await fetch('/api/quizzes/attempts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(result),
              })

              if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to save quiz attempt')
              }

              logger.info('Quiz attempt saved successfully')
              // Optionally, show a success toast here
            } catch (error) {
              logger.error('Error saving quiz attempt:', error)
              // Optionally, show an error toast here
            }
          }}
        />
      )}
    </div>
  )
}

