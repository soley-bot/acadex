'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Download, FileText, Play, CheckCircle, Clock, Users } from 'lucide-react'
import { CourseLesson, CourseResource, LessonProgress } from '@/lib/supabase'
import { YouTubePlayer } from './YouTubePlayer'
import { RichTextRenderer } from '@/components/ui/RichTextRenderer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface LessonContentProps {
  lesson: CourseLesson & {
    progress?: LessonProgress
    resources?: CourseResource[]
  }
  onNext?: () => void
  onPrevious?: () => void
  onComplete?: () => void
  hasNext: boolean
  hasPrevious: boolean
}

export function LessonContent({
  lesson,
  onNext,
  onPrevious,
  onComplete,
  hasNext,
  hasPrevious
}: LessonContentProps) {
  const [showResources, setShowResources] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null)
  
  const isCompleted = lesson.progress?.is_completed || false

  // Mobile swipe gesture handling
  useEffect(() => {
    const element = contentRef.current
    if (!element) return

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return
      const touch = e.touches[0]
      if (!touch) return
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current || e.changedTouches.length !== 1) return
      
      const touch = e.changedTouches[0]
      if (!touch) return
      const deltaX = touch.clientX - touchStartRef.current.x
      const deltaY = touch.clientY - touchStartRef.current.y
      const deltaTime = Date.now() - touchStartRef.current.time
      
      // Only process quick swipes (< 300ms) with significant horizontal movement
      if (deltaTime < 300 && Math.abs(deltaX) > 50 && Math.abs(deltaY) < 100) {
        if (deltaX > 0 && hasPrevious && onPrevious) {
          // Swipe right = previous lesson
          onPrevious()
        } else if (deltaX < 0 && hasNext && onNext) {
          // Swipe left = next lesson
          onNext()
        }
      }
      
      touchStartRef.current = null
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartRef.current) return
      
      // Prevent default scrolling if horizontal swipe is detected
      const touch = e.touches[0]
      if (!touch) return
      const deltaX = Math.abs(touch.clientX - touchStartRef.current.x)
      const deltaY = Math.abs(touch.clientY - touchStartRef.current.y)
      
      if (deltaX > deltaY && deltaX > 30) {
        e.preventDefault()
      }
    }

    element.addEventListener('touchstart', handleTouchStart, { passive: true })
    element.addEventListener('touchend', handleTouchEnd, { passive: true })
    element.addEventListener('touchmove', handleTouchMove, { passive: false })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchend', handleTouchEnd)
      element.removeEventListener('touchmove', handleTouchMove)
    }
  }, [hasNext, hasPrevious, onNext, onPrevious])

  const handleVideoEnd = () => {
    if (!isCompleted && onComplete) {
      onComplete()
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Lesson Header */}
      <div className="border-b border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {lesson.video_url ? (
              <Play size={20} className="text-primary" />
            ) : (
              <FileText size={20} className="text-primary" />
            )}
            <span className="text-sm text-muted-foreground">
              {lesson.video_url ? 'Video Lesson' : 'Reading Material'}
            </span>
          </div>
          
          {isCompleted && (
            <div className="flex items-center gap-2 text-success">
              <CheckCircle size={16} />
              <span className="text-sm font-medium">Completed</span>
            </div>
          )}
        </div>
        
        <h1 className="text-2xl font-bold text-foreground mb-2">{lesson.title}</h1>
        
        <div className="flex items-center justify-between">
          {lesson.duration_minutes && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock size={16} />
              <span>{lesson.duration_minutes} minutes</span>
            </div>
          )}
          
          {/* Mobile: Swipe hint */}
          <div className="lg:hidden flex items-center gap-4 text-xs text-muted-foreground">
            {hasPrevious && (
              <div className="flex items-center gap-1 opacity-60">
                <ChevronLeft size={12} />
                <span>Swipe</span>
              </div>
            )}
            {hasNext && (
              <div className="flex items-center gap-1 opacity-60">
                <span>Swipe</span>
                <ChevronRight size={12} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content - With mobile swipe support */}
      <div 
        ref={contentRef}
        className="flex-1 overflow-y-auto p-6 space-y-8 touch-pan-y"
        style={{ touchAction: 'pan-y' }} // Allow vertical scrolling, horizontal for swipe
      >
        {/* Video Player */}
        {lesson.video_url && (
          <div className="max-w-4xl mx-auto">
            <YouTubePlayer
              videoId={lesson.video_url}
              title={lesson.title}
              onVideoEnd={handleVideoEnd}
              className="mb-8"
            />
          </div>
        )}

        {/* Lesson Description */}
        {lesson.description && (
          <Card variant="default">
            <CardHeader>
              <CardTitle className="text-lg">Lesson Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <RichTextRenderer content={lesson.description} />
            </CardContent>
          </Card>
        )}

        {/* Lesson Content */}
        {lesson.content && (
          <Card variant="default">
            <CardHeader>
              <CardTitle className="text-lg">Content</CardTitle>
            </CardHeader>
            <CardContent>
              <RichTextRenderer content={lesson.content} />
            </CardContent>
          </Card>
        )}

        {/* Resources Section */}
        {lesson.resources && lesson.resources.length > 0 && (
          <Card variant="default">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Download size={18} />
                Lesson Resources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lesson.resources.map((resource) => (
                  <div
                    key={resource.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText size={20} className="text-primary" />
                      <div>
                        <h4 className="font-medium text-foreground">{resource.title}</h4>
                        {resource.description && (
                          <p className="text-sm text-muted-foreground">{resource.description}</p>
                        )}
                      </div>
                    </div>
                    
                    {resource.file_url && (
                      <a
                        href={resource.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-primary hover:bg-secondary text-white hover:text-black px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        Download
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Completion Section */}
        {!isCompleted ? (
          <Card variant="default" className="border-primary/20 bg-primary/5">
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Ready to mark this lesson as complete?
                </h3>
                <p className="text-muted-foreground mb-6">
                  Once you&apos;ve finished reviewing the content, mark this lesson as completed to track your progress.
                </p>
                <button
                  onClick={onComplete}
                  className="bg-primary hover:bg-secondary text-white hover:text-black px-8 py-3 rounded-lg font-medium transition-colors"
                >
                  Mark as Complete
                </button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card variant="default" className="border-success/20 bg-success/10">
            <CardContent className="p-6">
              <div className="text-center">
                <CheckCircle className="w-12 h-12 text-success mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-success-foreground mb-2">
                  Lesson Completed!
                </h3>
                <p className="text-success-foreground/80">
                  Great job! You&apos;ve completed this lesson.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Navigation Footer - Enhanced for mobile */}
      <div className="border-t border-border p-4 lg:p-6">
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={onPrevious}
            disabled={!hasPrevious}
            className={`
              flex items-center gap-2 px-4 py-3 lg:px-6 rounded-xl font-medium 
              transition-all duration-200 touch-manipulation min-h-[48px] flex-1 max-w-[140px]
              ${hasPrevious 
                ? 'bg-muted hover:bg-muted/80 text-foreground active:scale-95 shadow-sm hover:shadow-md' 
                : 'bg-muted/50 text-muted-foreground cursor-not-allowed opacity-50'
              }
            `}
            style={{ touchAction: 'manipulation' }}
          >
            <ChevronLeft size={16} />
            <span className="hidden sm:inline">Previous</span>
            <span className="sm:hidden">Prev</span>
          </button>

          {/* Center content - Mobile optimized */}
          <div className="text-center flex-1 px-2">
            <p className="text-sm text-muted-foreground">
              {isCompleted ? '✅ Completed!' : 'Continue learning'}
            </p>
            {!isCompleted && onComplete && (
              <button
                onClick={onComplete}
                className="mt-1 text-xs text-primary hover:text-primary/80 underline touch-manipulation"
                style={{ touchAction: 'manipulation' }}
              >
                Mark complete
              </button>
            )}
          </div>

          <button
            onClick={onNext}
            disabled={!hasNext}
            className={`
              flex items-center gap-2 px-4 py-3 lg:px-6 rounded-xl font-medium 
              transition-all duration-200 touch-manipulation min-h-[48px] flex-1 max-w-[140px]
              ${hasNext 
                ? 'bg-primary hover:bg-secondary text-white hover:text-black active:scale-95 shadow-sm hover:shadow-md' 
                : 'bg-muted/50 text-muted-foreground cursor-not-allowed opacity-50'
              }
            `}
            style={{ touchAction: 'manipulation' }}
          >
            <span className="hidden sm:inline">Next</span>
            <span className="sm:hidden">Next</span>
            <ChevronRight size={16} />
          </button>
        </div>
        
        {/* Mobile: Navigation hint */}
        <div className="lg:hidden mt-3 text-center">
          <p className="text-xs text-muted-foreground/70">
            💡 Tip: Swipe left/right to navigate between lessons
          </p>
        </div>
      </div>
    </div>
  )
}

