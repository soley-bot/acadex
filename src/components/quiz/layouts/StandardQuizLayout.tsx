"use client"

import { useEffect, useState, useCallback } from "react"
import { QuestionWrapper } from "../core/QuestionWrapper"
import { Timer } from "../core/Timer"
import { Navigation } from "../core/Navigation"
import { Progress } from "../core/Progress"
import { QuestionPalette } from "../core/QuestionPalette"
import { AutoSaveIndicator } from "../core/AutoSaveIndicator"
import { KeyboardHints } from "../core/KeyboardHints"
import { TimerWarning } from "../core/TimerWarning"
import { cn } from "@/lib/utils"
import { CheckCircle2 } from "lucide-react"

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

interface StandardQuizLayoutProps {
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
  saving?: boolean
  className?: string
  quizTitle?: string
}

export function StandardQuizLayout({
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
  saving = false,
  className,
  quizTitle = "Quiz"
}: StandardQuizLayoutProps) {
  const currentQuestion = questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === questions.length - 1
  const [saveStatus, setSaveStatus] = useState<'saving' | 'saved' | 'error'>('saved')

  // Helper function to check if a question is answered
  const isAnswered = (questionId: string) => {
    const answer = answers[questionId]
    return answer !== undefined && answer !== null && answer !== '' && !(Array.isArray(answer) && answer.length === 0)
  }

  const answeredQuestions = new Set(
    Object.keys(answers).map((_, index) => questions.findIndex(q => q.id === Object.keys(answers)[index]))
      .filter(index => index !== -1)
  )

  // Update save status
  useEffect(() => {
    if (saving) {
      setSaveStatus('saving')
    } else {
      setSaveStatus('saved')
      // Keep "saved" status visible for 2 seconds
      const timer = setTimeout(() => {
        // Only reset if still saved (not changed to saving again)
        setSaveStatus(prev => prev === 'saved' ? 'saved' : prev)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [saving])

  // Handle question selection from palette
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

      {/* Compact Header with Quiz Palette */}
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto">
          {/* Top Row: Quiz Title + Timer */}
          <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-800">
            <h1 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate">
              {quizTitle}
            </h1>

            {showTimer && (
              <Timer 
                timeLeft={timeLeft || 0} 
                hasTimeLimit={timeLeft !== undefined && timeLeft !== null && timeLeft > 0}
              />
            )}
          </div>

          {/* Bottom Row: Progress + Question Palette */}
          <div className="px-4 sm:px-6 py-3 space-y-3">
            {/* Progress - Full width on all screens */}
            <div>
              <Progress
                currentQuestion={currentQuestionIndex}
                totalQuestions={questions.length}
                answeredQuestions={answeredQuestions}
              />
            </div>

            {/* Inline Question Palette - Scrollable with padding to prevent cutoff */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-2 px-1 -mx-1">
              {questions.map((question, idx) => (
                <button
                  key={question.id}
                  onClick={() => handleQuestionSelect(idx)}
                  className={cn(
                    "w-7 h-7 rounded-md text-[10px] font-bold transition-all flex items-center justify-center flex-shrink-0",
                    idx === currentQuestionIndex && "ring-2 ring-primary",
                    isAnswered(question.id)
                      ? "bg-green-500 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  )}
                  title={`Question ${idx + 1}${isAnswered(question.id) ? ' - Answered' : ''}`}
                >
                  {isAnswered(question.id) ? (
                    <CheckCircle2 className="w-3 h-3" />
                  ) : (
                    idx + 1
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 pb-28">
        {/* Timer Warning */}
        {showTimer && timeLeft !== undefined && (timeLeft === 300 || timeLeft === 60 || timeLeft < 60) && (
          <TimerWarning timeLeft={timeLeft} />
        )}

        {/* Question Card with enhanced design */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <QuestionWrapper
            question={currentQuestion}
            answer={answers[currentQuestion.id]}
            onAnswerChange={(answer) => onAnswerChange(currentQuestion.id, answer)}
            questionNumber={currentQuestionIndex + 1}
            disabled={submitting}
          />
        </div>

        {/* Navigation - Sticky on mobile with enhanced styling */}
        <div className="mt-8 sm:mt-10 fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white dark:from-gray-900 dark:via-gray-900 to-transparent pt-6 pb-6 px-4 sm:px-6 sm:relative sm:bg-none sm:pt-0 sm:pb-0 sm:px-0 border-t sm:border-t-0 border-gray-200/50 dark:border-gray-700/50">
          <div className="max-w-5xl mx-auto">
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
  )
}
