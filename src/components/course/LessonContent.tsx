'use client'

import { useRef, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Download, FileText, CheckCircle, Clock } from 'lucide-react'
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
  isCompleting?: boolean
}

export function LessonContent({
  lesson,
  onNext,
  onPrevious,
  onComplete,
  hasNext,
  hasPrevious,
  isCompleting = false
}: LessonContentProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null)
  
  const isCompleted = lesson.progress?.is_completed || false

  // Memoize handlers to prevent recreation on every render
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length !== 1) return
    const touch = e.touches[0]
    if (!touch) return
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    }
  }, [])

  const handleTouchEnd = useCallback((e: TouchEvent) => {
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
  }, [hasNext, hasPrevious, onNext, onPrevious])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!touchStartRef.current) return

    // Prevent default scrolling if horizontal swipe is detected
    const touch = e.touches[0]
    if (!touch) return
    const deltaX = Math.abs(touch.clientX - touchStartRef.current.x)
    const deltaY = Math.abs(touch.clientY - touchStartRef.current.y)

    if (deltaX > deltaY && deltaX > 30) {
      e.preventDefault()
    }
  }, [])

  // Mobile swipe gesture handling
  useEffect(() => {
    const element = contentRef.current
    if (!element) return

    element.addEventListener('touchstart', handleTouchStart, { passive: true })
    element.addEventListener('touchend', handleTouchEnd, { passive: true })
    element.addEventListener('touchmove', handleTouchMove, { passive: false })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchend', handleTouchEnd)
      element.removeEventListener('touchmove', handleTouchMove)
    }
  }, [handleTouchStart, handleTouchEnd, handleTouchMove])

  const handleVideoEnd = () => {
    if (!isCompleted && onComplete) {
      onComplete()
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Lesson Header - Simplified */}
      <div className="border-b border-border px-3 py-5 sm:px-5 sm:py-6 lg:px-8 lg:py-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex-1">{lesson.title}</h1>

          {isCompleted && (
            <div className="flex items-center gap-2 text-success ml-4">
              <CheckCircle size={20} />
              <span className="hidden sm:inline text-sm font-medium">Completed</span>
            </div>
          )}
        </div>

        {lesson.duration_minutes && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock size={16} />
            <span className="text-sm">{lesson.duration_minutes} min</span>
          </div>
        )}
      </div>

      {/* Main Content - Smart: adaptive padding */}
      <div 
        ref={contentRef}
        className="flex-1 overflow-y-auto px-3 py-5 sm:px-5 sm:py-6 lg:px-8 lg:py-8 space-y-8 touch-pan-y"
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

      </div>

      {/* Navigation Footer - Simplified and clear */}
      <div className="border-t border-border p-4 sm:p-5 lg:p-6">
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Smart: Icon only on mobile, text on desktop */}
          <button
            onClick={onPrevious}
            disabled={!hasPrevious}
            className={`
              flex items-center justify-center gap-2 px-4 py-3 sm:px-5 rounded-xl font-medium
              transition-all duration-200 touch-manipulation min-h-[48px] min-w-[48px] sm:min-w-[120px]
              ${hasPrevious
                ? 'bg-muted hover:bg-muted/80 text-foreground active:scale-95 shadow-sm hover:shadow-md'
                : 'bg-muted/50 text-muted-foreground cursor-not-allowed opacity-50'
              }
            `}
            style={{ touchAction: 'manipulation' }}
            aria-label="Go to previous lesson"
            aria-disabled={!hasPrevious}
          >
            <ChevronLeft size={20} />
            <span className="hidden md:inline">Previous</span>
          </button>

          {/* Center - Completion Control */}
          <div className="flex-1 flex items-center justify-center">
            {!isCompleted && onComplete ? (
              <button
                onClick={onComplete}
                disabled={isCompleting}
                className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                aria-label={isCompleting ? 'Saving lesson progress' : 'Mark lesson as complete'}
              >
                {isCompleting ? 'Saving...' : 'Mark Complete'}
              </button>
            ) : isCompleted ? (
              <div className="flex items-center gap-2 text-success">
                <CheckCircle size={18} />
                <span className="text-sm font-medium">Completed</span>
              </div>
            ) : null}
          </div>

          {/* Smart: Icon only on mobile, text on desktop */}
          <button
            onClick={onNext}
            disabled={!hasNext}
            className={`
              flex items-center justify-center gap-2 px-4 py-3 sm:px-5 rounded-xl font-medium
              transition-all duration-200 touch-manipulation min-h-[48px] min-w-[48px] sm:min-w-[120px]
              ${hasNext
                ? 'bg-primary hover:bg-secondary text-white hover:text-black active:scale-95 shadow-sm hover:shadow-md'
                : 'bg-muted/50 text-muted-foreground cursor-not-allowed opacity-50'
              }
            `}
            style={{ touchAction: 'manipulation' }}
            aria-label="Go to next lesson"
            aria-disabled={!hasNext}
          >
            <span className="hidden md:inline">Next</span>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}

