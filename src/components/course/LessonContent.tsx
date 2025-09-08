'use client'

import { useState } from 'react'
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
  
  const isCompleted = lesson.progress?.is_completed || false

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
        
        {lesson.duration_minutes && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock size={16} />
            <span>{lesson.duration_minutes} minutes</span>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
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
          <Card variant="base">
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
          <Card variant="base">
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
          <Card variant="base">
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
          <Card variant="base" className="border-primary/20 bg-primary/5">
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
          <Card variant="base" className="border-success/20 bg-success/10">
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

      {/* Navigation Footer */}
      <div className="border-t border-border p-6">
        <div className="flex items-center justify-between">
          <button
            onClick={onPrevious}
            disabled={!hasPrevious}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors
              ${hasPrevious 
                ? 'bg-muted hover:bg-muted/80 text-foreground' 
                : 'bg-muted/50 text-muted-foreground cursor-not-allowed'
              }
            `}
          >
            <ChevronLeft size={16} />
            Previous
          </button>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {isCompleted ? 'Lesson completed!' : 'Continue learning'}
            </p>
          </div>

          <button
            onClick={onNext}
            disabled={!hasNext}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors
              ${hasNext 
                ? 'bg-primary hover:bg-secondary text-white hover:text-black' 
                : 'bg-muted/50 text-muted-foreground cursor-not-allowed'
              }
            `}
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
