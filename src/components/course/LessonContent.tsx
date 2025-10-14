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
      {/* Lesson Header - Smart: adaptive padding */}
      <div className="border-b border-border px-3 py-5 sm:px-5 sm:py-6 lg:px-8 lg:py-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {lesson.video_url ? (
              <Play size={22} className="text-primary" />
            ) : (
              <FileText size={22} className="text-primary" />
            )}
            <span className="text-sm sm:text-base text-muted-foreground">
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
        
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3">{lesson.title}</h1>
        
        <div className="flex items-center justify-between">
          {lesson.duration_minutes && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock size={18} />
              <span className="text-base">{lesson.duration_minutes} minutes</span>
            </div>
          )}
          
          {/* Mobile: Swipe hint - Smart: larger text */}
          <div className="lg:hidden flex items-center gap-4 text-sm text-muted-foreground">
            {hasPrevious && (
              <div className="flex items-center gap-1 opacity-60">
                <ChevronLeft size={14} />
                <span>Swipe</span>
              </div>
            )}
            {hasNext && (
              <div className="flex items-center gap-1 opacity-60">
                <span>Swipe</span>
                <ChevronRight size={14} />
              </div>
            )}
          </div>
        </div>
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

      {/* Navigation Footer - Smart: status above on mobile, icon-only buttons, better padding */}
      <div className="border-t border-border p-4 sm:p-5 lg:p-6">
        {/* Smart: Status above buttons on mobile */}
        <div className="sm:hidden text-center mb-3">
          <p className="text-sm font-medium text-foreground">
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
          >
            <ChevronLeft size={20} />
            <span className="hidden md:inline">Previous</span>
          </button>

          {/* Smart: Hidden on mobile, shown on desktop */}
          <div className="hidden sm:flex text-center flex-1 px-4">
            <div className="flex-1">
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
          >
            <span className="hidden md:inline">Next</span>
            <ChevronRight size={20} />
          </button>
        </div>
        
        {/* Smart: Shorter hint */}
        <div className="sm:hidden mt-3 text-center">
          <p className="text-sm text-muted-foreground">
            💡 Swipe to navigate
          </p>
        </div>
      </div>
    </div>
  )
}

