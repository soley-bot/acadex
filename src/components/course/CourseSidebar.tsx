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
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen w-80 bg-background border-r border-border z-50
        transform transition-transform duration-300 ease-in-out lg:transform-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        {/* Sidebar Header */}
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground mb-2">Course Content</h2>
          <div className="text-sm text-muted-foreground">
            {modules.length} modules • {modules.reduce((acc, mod) => acc + (mod.course_lessons?.length || 0), 0)} lessons
          </div>
        </div>

        {/* Modules List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-2">
            {modules.map((module, moduleIndex) => {
              const isExpanded = expandedModules.has(module.id)
              const progress = calculateModuleProgress(module)
              
              return (
                <div key={module.id} className="border border-border rounded-lg overflow-hidden">
                  {/* Module Header */}
                  <button
                    onClick={() => onToggleModule(module.id)}
                    className="w-full p-4 text-left bg-muted/30 hover:bg-muted/50 transition-colors flex items-center gap-3"
                  >
                    {isExpanded ? (
                      <ChevronDown size={16} className="text-muted-foreground" />
                    ) : (
                      <ChevronRight size={16} className="text-muted-foreground" />
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground truncate">
                        Module {moduleIndex + 1}: {module.title}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {progress}% complete • {module.course_lessons?.length || 0} lessons
                      </div>
                    </div>

                    {/* Progress Ring */}
                    <div className="relative w-8 h-8">
                      <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 32 32">
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
                              w-full p-4 text-left hover:bg-muted/30 transition-colors flex items-center gap-3
                              ${isCurrentLesson ? 'bg-primary/10 border-l-4 border-l-primary' : ''}
                            `}
                          >
                            {getStatusIcon(status, lesson)}
                            
                            <div className="flex-1 min-w-0">
                              <div className={`font-medium truncate ${
                                isCurrentLesson ? 'text-primary' : 'text-foreground'
                              }`}>
                                {lessonIndex + 1}. {lesson.title}
                              </div>
                              
                              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                                {lesson.duration_minutes && (
                                  <div className="flex items-center gap-1">
                                    <Clock size={12} />
                                    <span>{lesson.duration_minutes} min</span>
                                  </div>
                                )}
                                
                                {lesson.video_url && (
                                  <div className="flex items-center gap-1">
                                    <PlayCircle size={12} />
                                    <span>Video</span>
                                  </div>
                                )}
                              </div>
                            </div>
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
