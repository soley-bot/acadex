'use client'

import { ChevronDown, ChevronRight, CheckCircle, Circle, PlayCircle } from 'lucide-react'
import { CourseModule, CourseLesson, LessonProgress } from '@/lib/supabase'

interface ModuleWithContent extends CourseModule {
  course_lessons: (CourseLesson & {
    progress?: LessonProgress
  })[]
}

interface CourseSidebarProps {
  modules: ModuleWithContent[]
  currentLesson: CourseLesson | null
  expandedModules: Set<string>
  onToggleModule: (moduleId: string) => void
  onSelectLesson: (lesson: CourseLesson) => void
  isOpen: boolean
  onClose: () => void
}

export function CourseSidebar({
  modules,
  currentLesson,
  expandedModules,
  onToggleModule,
  onSelectLesson,
  isOpen,
  onClose
}: CourseSidebarProps) {
  const calculateModuleProgress = (module: ModuleWithContent) => {
    if (!module.course_lessons?.length) return 0

    // In development, show all lessons if no published lessons exist
    // In production, only count published lessons
    const isDevelopment = process.env.NODE_ENV === 'development'
    let lessonsToCount = module.course_lessons.filter(lesson => lesson.is_published)

    // Fallback: if no published lessons, show all lessons in development
    if (lessonsToCount.length === 0 && isDevelopment) {
      lessonsToCount = module.course_lessons
    }

    if (lessonsToCount.length === 0) return 0

    const completedLessons = lessonsToCount.filter(
      lesson => lesson.progress?.is_completed
    ).length
    return Math.round((completedLessons / lessonsToCount.length) * 100)
  }

  const getLessonStatus = (lesson: CourseLesson & { progress?: LessonProgress }) => {
    if (lesson.progress?.is_completed) return 'completed'
    if (lesson.id === currentLesson?.id) return 'current'
    return 'available'
  }

  const getStatusIcon = (status: string, lesson: CourseLesson & { progress?: LessonProgress }) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} className="text-success" />
      case 'current':
        return <PlayCircle size={16} className="text-primary" />
      default:
        return <Circle size={16} className="text-muted-foreground" />
    }
  }

  return (
    <>
      {/* Mobile Overlay - Enhanced with touch feedback */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300" 
          onClick={onClose}
          style={{ touchAction: 'none' }} // Prevent scrolling behind overlay
        />
      )}
      
      {/* Sidebar - Smart: responsive width */}
      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen w-full sm:w-80 lg:w-72 glass z-50
        transform transition-transform duration-300 ease-in-out lg:transform-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col touch-manipulation
      `}>
        {/* Mobile Close Handle - Swipe indicator */}
        <div className="lg:hidden absolute top-4 right-4 z-10">
          <button
            onClick={onClose}
            className="w-8 h-8 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all active:scale-95"
            aria-label="Close course navigation"
          >
            <svg className="w-4 h-4 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Sidebar Header */}
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground mb-2">Course Content</h2>
          <div className="text-sm text-muted-foreground">
            {modules.length} modules • {modules.reduce((acc, mod) => acc + (mod.course_lessons?.length || 0), 0)} lessons
          </div>
        </div>

        {/* Modules List - Smart: adaptive padding, larger spacing */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-3 sm:p-4 space-y-3">
            {modules.map((module, moduleIndex) => {
              const isExpanded = expandedModules.has(module.id)
              const progress = calculateModuleProgress(module)
              
              return (
                <div key={module.id} className="card-base overflow-hidden">
                  {/* Module Header - Smart: bigger icons on mobile */}
                  <button
                    onClick={() => onToggleModule(module.id)}
                    className="w-full p-4 text-left bg-muted/30 hover:bg-muted/50 transition-colors flex items-center gap-3"
                    aria-label={`${isExpanded ? 'Collapse' : 'Expand'} module ${moduleIndex + 1}: ${module.title}`}
                    aria-expanded={isExpanded}
                  >
                    {isExpanded ? (
                      <ChevronDown size={18} className="sm:w-4 sm:h-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight size={18} className="sm:w-4 sm:h-4 text-muted-foreground" />
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground truncate">
                        Module {moduleIndex + 1}: {module.title}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {(() => {
                          const isDevelopment = process.env.NODE_ENV === 'development'
                          let lessonsToShow = module.course_lessons?.filter(l => l.is_published) || []

                          // Fallback: show all lessons in development if none are published
                          if (lessonsToShow.length === 0 && isDevelopment) {
                            lessonsToShow = module.course_lessons || []
                          }

                          const completedCount = lessonsToShow.filter(l => l.progress?.is_completed).length
                          return `${completedCount}/${lessonsToShow.length} lessons`
                        })()}
                      </div>
                    </div>
                  </button>

                  {/* Lessons List */}
                  {isExpanded && module.course_lessons && (
                    <div className="border-t border-border">
                      {module.course_lessons.length === 0 ? (
                        <div className="p-6 text-center">
                          <p className="text-sm text-muted-foreground">
                            No lessons in this module yet.
                          </p>
                        </div>
                      ) : (() => {
                        const isDevelopment = process.env.NODE_ENV === 'development'
                        let lessonsToDisplay = module.course_lessons.filter(lesson => lesson.is_published)

                        // Fallback: show all lessons in development if none are published
                        if (lessonsToDisplay.length === 0 && isDevelopment) {
                          lessonsToDisplay = module.course_lessons
                        }

                        if (lessonsToDisplay.length === 0) {
                          return (
                            <div className="p-6 text-center">
                              <p className="text-sm text-muted-foreground">
                                No published lessons in this module yet.
                              </p>
                            </div>
                          )
                        }

                        return lessonsToDisplay.map((lesson, lessonIndex) => {
                        const status = getLessonStatus(lesson)
                        const isCurrentLesson = lesson.id === currentLesson?.id

                        return (
                          <button
                            key={lesson.id}
                            onClick={() => onSelectLesson(lesson)}
                            className={`
                              w-full p-4 text-left transition-all duration-200 flex items-center gap-3
                              min-h-[56px] touch-manipulation
                              hover:bg-muted/30 active:bg-muted/50 active:scale-[0.98]
                              ${isCurrentLesson ? 'bg-primary/10 border-l-4 border-l-primary shadow-sm' : 'hover:shadow-sm'}
                            `}
                            style={{ touchAction: 'manipulation' }} // Optimize for touch
                            aria-label={`Lesson ${lessonIndex + 1}: ${lesson.title}${status === 'completed' ? ' (completed)' : ''}${isCurrentLesson ? ' (current)' : ''}`}
                            aria-current={isCurrentLesson ? 'page' : undefined}
                          >
                            <div className="flex-shrink-0">
                              {getStatusIcon(status, lesson)}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className={`font-medium truncate leading-tight ${
                                isCurrentLesson ? 'text-primary' : 'text-foreground'
                              }`}>
                                {lessonIndex + 1}. {lesson.title}
                              </div>

                              {lesson.duration_minutes && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {lesson.duration_minutes} min
                                </div>
                              )}
                            </div>

                            {/* Mobile: Show arrow for current lesson */}
                            {isCurrentLesson && (
                              <div className="lg:hidden flex-shrink-0">
                                <ChevronRight size={16} className="text-primary" />
                              </div>
                            )}
                          </button>
                        )
                      })
                      })()}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </aside>
    </>
  )
}

