"use client"

import { useEffect, useState, useCallback } from "react"
import { QuestionWrapper } from "../core/QuestionWrapper"
import { Timer } from "../core/Timer"
import { Navigation } from "../core/Navigation"
import { Progress } from "../core/Progress"
import { KeyboardHints } from "../core/KeyboardHints"
import { cn } from "@/lib/utils"
import { BookOpen, Clock, Volume2 } from "lucide-react"

// Simple Question Interface
interface Question {
  id: string
  question: string
  options?: string[]
  correct_answer?: any
  explanation?: string
  question_type: 'multiple_choice' | 'single_choice' | 'true_false' | 'fill_blank' | 'essay'
  points?: number
}

interface ReadingQuizLayoutProps {
  questions: Question[]
  currentQuestionIndex: number
  answers: Record<string, any>
  timeLeft?: number
  showTimer?: boolean
  onAnswerChange: (questionId: string, answer: any) => void
  onPrevious: () => void
  onNext: () => void
  onSubmit: () => void
  onQuestionSelect?: (index: number) => void
  submitting?: boolean
  className?: string
  // Reading-specific props
  readingPassage?: string
  passageTitle?: string
  passageSource?: string
  passageAudioUrl?: string
  wordCount?: number
  estimatedReadTime?: number
}

export function ReadingQuizLayout({
  questions,
  currentQuestionIndex,
  answers,
  timeLeft,
  showTimer = false,
  onAnswerChange,
  onPrevious,
  onNext,
  onSubmit,
  onQuestionSelect,
  submitting = false,
  className,
  readingPassage,
  passageTitle,
  passageSource,
  passageAudioUrl,
  wordCount,
  estimatedReadTime
}: ReadingQuizLayoutProps) {
  const currentQuestion = questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === questions.length - 1
  
  // Helper function to check if a question is answered
  const isAnswered = (questionId: string) => {
    const answer = answers[questionId]
    return answer !== undefined && answer !== null && answer !== '' && !(Array.isArray(answer) && answer.length === 0)
  }

  const answeredQuestions = new Set(
    Object.keys(answers).map((_, index) => questions.findIndex(q => q.id === Object.keys(answers)[index]))
      .filter(index => index !== -1)
  )

  const [isPlayingAudio, setIsPlayingAudio] = useState(false)

  // Handle question selection
  const handleQuestionSelect = useCallback((index: number) => {
    if (onQuestionSelect) {
      onQuestionSelect(index)
    }
  }, [onQuestionSelect])

  // Focus management for accessibility
  useEffect(() => {
    if (!submitting) {
      // Focus first interactive element when question changes
      const timer = setTimeout(() => {
        const firstInput = document.querySelector('[role="radio"], input:not([type="hidden"]), textarea') as HTMLElement
        firstInput?.focus()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [currentQuestionIndex, submitting])

  // Add keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return
      }

      // Arrow keys for navigation (no Ctrl/Cmd needed)
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        if (currentQuestionIndex > 0) {
          onPrevious()
        }
        return
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault()
        if (currentQuestionIndex < questions.length - 1) {
          onNext()
        }
        return
      }

      // Enter key to submit or next
      if (event.key === 'Enter') {
        event.preventDefault()
        if (isLastQuestion) {
          onSubmit()
        } else {
          onNext()
        }
        return
      }

      // Number keys for multiple choice (1-4)
      if (currentQuestion.question_type === 'multiple_choice') {
        const num = parseInt(event.key)
        if (num >= 1 && num <= 4 && currentQuestion.options && num <= currentQuestion.options.length) {
          event.preventDefault()
          onAnswerChange(currentQuestion.id, num - 1)
        }
      }
    }

    if (!submitting) {
      window.addEventListener('keydown', handleKeyPress)
      return () => window.removeEventListener('keydown', handleKeyPress)
    }
  }, [currentQuestionIndex, questions.length, onSubmit, onNext, onPrevious, isLastQuestion, submitting, currentQuestion, onAnswerChange])

  const handlePlayAudio = () => {
    if (passageAudioUrl) {
      const audio = new Audio(passageAudioUrl)
      audio.play()
      setIsPlayingAudio(true)
      audio.onended = () => setIsPlayingAudio(false)
    }
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="p-8 text-center">
          <p className="text-muted-foreground">No questions available</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950 relative", className)}>
      {/* Keyboard Shortcuts Hint */}
      <KeyboardHints />

      {/* Compact Header with Quiz Info */}
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto">
          {/* Top Row: Quiz Title + Timer */}
          <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-800">
            <h1 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate">
              {passageTitle || "Reading Quiz"}
            </h1>

            {showTimer && (
              <Timer 
                timeLeft={timeLeft || 0} 
                hasTimeLimit={timeLeft !== undefined && timeLeft !== null && timeLeft > 0}
              />
            )}
          </div>

          {/* Bottom Row: Progress Bar */}
          <div className="px-4 sm:px-6 py-3">
            <Progress
              currentQuestion={currentQuestionIndex}
              totalQuestions={questions.length}
              answeredQuestions={answeredQuestions}
            />
          </div>
        </div>
      </div>

      {/* Two-panel layout: Passage on left, Questions on right */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Left Panel - Reading Passage (sticky on desktop) */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-2xl transition-shadow duration-300">
              {/* Passage Header */}
              <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30 p-5 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0 shadow-lg">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    {passageTitle && (
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {passageTitle}
                      </h2>
                    )}
                    {passageSource && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        Source: {passageSource}
                      </p>
                    )}
                  </div>
                </div>

                {/* Metadata badges - Enhanced */}
                <div className="flex flex-wrap gap-2">
                  {wordCount && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300 shadow-sm">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {wordCount} words
                    </span>
                  )}
                  {estimatedReadTime && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300 shadow-sm">
                      <Clock className="h-3.5 w-3.5" />
                      ~{estimatedReadTime} min read
                    </span>
                  )}
                  {passageAudioUrl && (
                    <button
                      onClick={handlePlayAudio}
                      disabled={isPlayingAudio}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 shadow-sm hover:shadow-md",
                        isPlayingAudio
                          ? "bg-primary text-white cursor-not-allowed"
                          : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-primary hover:text-white hover:border-primary"
                      )}
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                      {isPlayingAudio ? 'Playing...' : 'Listen'}
                    </button>
                  )}
                </div>
              </div>

              {/* Passage Content - Enhanced Scrollable */}
              <div className="p-6 sm:p-8">
                <div className="prose prose-sm sm:prose lg:prose-lg max-w-none dark:prose-invert">
                  <div className="max-h-[60vh] overflow-y-auto pr-3 space-y-4 custom-scrollbar">
                    {readingPassage ? (
                      readingPassage.split('\n').map((paragraph, idx) => (
                        paragraph.trim() && (
                          <p key={idx} className="text-base sm:text-lg leading-relaxed text-gray-700 dark:text-gray-300 first-letter:text-2xl first-letter:font-bold first-letter:text-primary">
                            {paragraph}
                          </p>
                        )
                      ))
                    ) : (
                      <p className="text-muted-foreground italic text-center py-8">No passage available</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Question */}
          <div className="space-y-6">
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <QuestionWrapper
                question={currentQuestion}
                answer={answers[currentQuestion.id]}
                onAnswerChange={(answer) => onAnswerChange(currentQuestion.id, answer)}
                questionNumber={currentQuestionIndex + 1}
                disabled={submitting}
              />
            </div>

            {/* Navigation - Sticky on mobile with enhanced styling */}
            <div className="mt-8 sm:mt-10 fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white dark:from-gray-900 dark:via-gray-900 to-transparent pt-6 pb-6 px-4 sm:px-6 lg:relative lg:bg-none lg:pt-0 lg:pb-0 lg:px-0 border-t lg:border-t-0 border-gray-200/50 dark:border-gray-700/50 z-20">
              <div className="max-w-3xl mx-auto">
                <Navigation
                  onPrevious={onPrevious}
                  onNext={onNext}
                  onSubmit={onSubmit}
                  canGoPrevious={currentQuestionIndex > 0}
                  canGoNext={currentQuestionIndex < questions.length - 1}
                  isLastQuestion={isLastQuestion}
                  submitting={submitting}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add bottom padding to prevent content being hidden behind sticky navigation on mobile */}
      <div className="h-24 lg:hidden"></div>
    </div>
  )
}
