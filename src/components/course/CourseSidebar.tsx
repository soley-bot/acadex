'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, PlayCircle, CheckCircle, Lock, Clock, FileText, Circle } from 'lucide-react'
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
    const completedLessons = module.course_lessons.filter(
      lesson => lesson.progress?.is_completed
    ).length
    return Math.round((completedLessons / module.course_lessons.length) * 100)
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
                        {progress}% complete • {module.course_lessons?.length || 0} lessons
                      </div>
                    </div>

                    {/* Progress Ring - Smart: bigger on mobile */}
                    <div className="relative w-10 h-10 sm:w-8 sm:h-8">
                      <svg className="w-10 h-10 sm:w-8 sm:h-8 transform -rotate-90" viewBox="0 0 32 32">
                        <circle
                          cx="16" cy="16" r="14"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="text-muted-foreground/20"
                        />
                        <circle
                          cx="16" cy="16" r="14"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeDasharray={`${progress * 0.88} 88`}
                          className="text-primary"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-medium text-foreground">
                          {Math.round(progress)}%
                        </span>
                      </div>
                    </div>
                  </button>

                  {/* Lessons List */}
                  {isExpanded && module.course_lessons && (
                    <div className="border-t border-border">
                      {module.course_lessons.map((lesson, lessonIndex) => {
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
                              
                              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                                {lesson.duration_minutes && (
                                  <div className="flex items-center gap-1">
                                    <Clock size={14} className="sm:w-3 sm:h-3" />
                                    <span>{lesson.duration_minutes} min</span>
                                  </div>
                                )}
                                
                                {lesson.video_url && (
                                  <div className="flex items-center gap-1">
                                    <PlayCircle size={14} className="sm:w-3 sm:h-3" />
                                    <span>Video</span>
                                  </div>
                                )}
                                
                                {status === 'completed' && (
                                  <span className="text-xs bg-success/10 text-success px-2 py-0.5 rounded-full font-medium">
                                    Complete
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {/* Mobile: Show arrow for current lesson */}
                            {isCurrentLesson && (
                              <div className="lg:hidden flex-shrink-0">
                                <ChevronRight size={16} className="text-primary" />
                              </div>
                            )}
                          </button>
                        )
                      })}
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

