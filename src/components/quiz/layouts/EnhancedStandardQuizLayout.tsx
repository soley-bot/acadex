/**
 * Enhanced Standard Quiz Layout
 * Extends the existing StandardQuizLayout with network awareness, auto-save, and modern UX features
 */

'use client'

import React from 'react'
import { StandardQuizLayout } from '../layouts/StandardQuizLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Wifi, WifiOff, Save, Clock, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { EnhancedQuestion } from '@/hooks/useEnhancedQuizTaking'

interface NetworkStatusBadgeProps {
  isOnline: boolean
  hasUnsavedChanges: boolean
  isAutoSaving: boolean
  lastSaved: Date | null
}

function NetworkStatusBadge({ isOnline, hasUnsavedChanges, isAutoSaving, lastSaved }: NetworkStatusBadgeProps) {
  if (!isOnline) {
    return (
      <Badge variant="destructive" className="gap-1">
        <WifiOff size={12} />
        Offline
      </Badge>
    )
  }

  if (isAutoSaving) {
    return (
      <Badge variant="secondary" className="gap-1">
        <Save size={12} />
        Saving...
      </Badge>
    )
  }

  if (hasUnsavedChanges) {
    return (
      <Badge variant="outline" className="gap-1">
        <AlertCircle size={12} />
        Unsaved
      </Badge>
    )
  }

  if (lastSaved) {
    return (
      <Badge variant="secondary" className="gap-1">
        <CheckCircle2 size={12} />
        Saved
      </Badge>
    )
  }

  return null
}

interface QuizStartScreenProps {
  quiz: any
  onStart: () => void
  isLoading?: boolean
}

function QuizStartScreen({ quiz, onStart, isLoading = false }: QuizStartScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{quiz?.title || 'Quiz'}</CardTitle>
          {quiz?.description && (
            <p className="text-muted-foreground mt-2">{quiz.description}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="font-semibold">Questions</div>
              <div className="text-muted-foreground">{quiz?.total_questions || '?'}</div>
            </div>
            {quiz?.time_limit && (
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="font-semibold">Time Limit</div>
                <div className="text-muted-foreground">{quiz.time_limit} min</div>
              </div>
            )}
          </div>
          
          {quiz?.reading_passage && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm font-medium text-blue-800 mb-2">Reading Passage</div>
              <div className="text-sm text-blue-700 max-h-32 overflow-y-auto">
                {quiz.reading_passage}
              </div>
            </div>
          )}

          <Button 
            onClick={onStart} 
            className="w-full" 
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Start Quiz'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

interface LoadingScreenProps {
  error?: string | null
}

function LoadingScreen({ error }: LoadingScreenProps) {
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
              <h3 className="text-lg font-semibold">Error Loading Quiz</h3>
              <p className="text-muted-foreground">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground">Loading quiz...</p>
      </div>
    </div>
  )
}

interface EnhancedStandardQuizLayoutProps {
  // Quiz data
  quiz: any
  questions: EnhancedQuestion[]
  
  // Current state
  currentQuestionIndex: number
  answers: Record<string, any>
  quizStarted: boolean
  timeLeft?: number
  
  // Status
  loading: boolean
  error: string | null
  submitting: boolean
  
  // Enhanced features
  isOnline: boolean
  hasUnsavedChanges: boolean
  isAutoSaving: boolean
  lastSaved: Date | null
  
  // Actions
  onStart: () => void
  onAnswerChange: (questionId: string, answer: any) => void
  onNext: () => void
  onPrevious: () => void
  onSubmit: () => Promise<void>
  onSaveProgress?: () => Promise<void>
}

export function EnhancedStandardQuizLayout({
  quiz,
  questions,
  currentQuestionIndex,
  answers,
  quizStarted,
  timeLeft,
  loading,
  error,
  submitting,
  isOnline,
  hasUnsavedChanges,
  isAutoSaving,
  lastSaved,
  onStart,
  onAnswerChange,
  onNext,
  onPrevious,
  onSubmit,
  onSaveProgress
}: EnhancedStandardQuizLayoutProps) {
  // Loading state
  if (loading) {
    return <LoadingScreen error={error} />
  }

  // Error state
  if (error) {
    return <LoadingScreen error={error} />
  }

  // Quiz start screen
  if (!quizStarted) {
    return <QuizStartScreen quiz={quiz} onStart={onStart} />
  }

  // Main quiz interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10">
      {/* Enhanced Header with Network Status */}
      <div className="bg-white/80 backdrop-blur border-b">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-base sm:text-lg font-semibold text-foreground">
                <span className="hidden sm:inline">Question {currentQuestionIndex + 1} of {questions.length}</span>
                <span className="sm:hidden">Q{currentQuestionIndex + 1}/{questions.length}</span>
              </h1>
              
              <NetworkStatusBadge
                isOnline={isOnline}
                hasUnsavedChanges={hasUnsavedChanges}
                isAutoSaving={isAutoSaving}
                lastSaved={lastSaved}
              />
            </div>
            
            <div className="flex items-center gap-2">
              {/* Save Progress Button */}
              {onSaveProgress && hasUnsavedChanges && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onSaveProgress}
                  disabled={isAutoSaving}
                  className="hidden sm:inline-flex"
                >
                  <Save size={14} className="mr-1" />
                  Save
                </Button>
              )}
              
              {/* Timer */}
              {timeLeft !== undefined && (
                <span className={cn(
                  "px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium border",
                  timeLeft < 60 
                    ? "bg-destructive/10 text-destructive border-destructive/20" 
                    : timeLeft < 300 
                    ? "bg-yellow-100 text-yellow-800 border-yellow-200" 
                    : "bg-muted text-muted-foreground border-border"
                )}>
                  <Clock size={12} className="inline mr-1" />
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Use existing StandardQuizLayout for the main content */}
      <StandardQuizLayout
        questions={questions.map(q => ({
          id: q.id,
          question: q.question,
          options: Array.isArray(q.options) ? q.options : undefined,
          correct_answer: q.correct_answer,
          explanation: q.explanation || undefined,
          question_type: ['matching', 'ordering'].includes(q.question_type) ? 'multiple_choice' : q.question_type as any,
          points: q.points
        }))}
        currentQuestionIndex={currentQuestionIndex}
        answers={answers}
        timeLeft={timeLeft}
        showTimer={false} // We handle timer in the header
        onAnswerChange={onAnswerChange}
        onPrevious={onPrevious}
        onNext={onNext}
        onSubmit={onSubmit}
        submitting={submitting}
        className="bg-transparent pt-0" // Remove duplicate background and padding
      />
    </div>
  )
}