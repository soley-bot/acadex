"use client"

import { useEffect } from "react"
import { QuestionWrapper } from "../core/QuestionWrapper"
import { Timer } from "../core/Timer"
import { Navigation } from "../core/Navigation"
import { Progress } from "../core/Progress"
import { cn } from "@/lib/utils"

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
  submitting?: boolean
  className?: string
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
  submitting = false,
  className
}: StandardQuizLayoutProps) {
  const currentQuestion = questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === questions.length - 1
  const answeredQuestions = new Set(
    Object.keys(answers).map((_, index) => questions.findIndex(q => q.id === Object.keys(answers)[index]))
      .filter(index => index !== -1)
  )

  // Add keyboard navigation like the original
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return
      }

      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'Enter':
            event.preventDefault()
            if (isLastQuestion) {
              onSubmit()
            } else {
              onNext()
            }
            break
          case 'ArrowLeft':
            event.preventDefault()
            if (currentQuestionIndex > 0) {
              onPrevious()
            }
            break
          case 'ArrowRight':
            event.preventDefault()
            if (currentQuestionIndex < questions.length - 1) {
              onNext()
            }
            break
        }
      }
    }

    if (!submitting) {
      window.addEventListener('keydown', handleKeyPress)
      return () => window.removeEventListener('keydown', handleKeyPress)
    }
  }, [currentQuestionIndex, questions.length, onSubmit, onNext, onPrevious, isLastQuestion, submitting])

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
    <div className={cn("min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10", className)}>
      {/* Header - Match original design */}
      <div className="bg-white/80 backdrop-blur border-b">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-base sm:text-lg font-semibold text-foreground">
              <span className="hidden sm:inline">Question {currentQuestionIndex + 1} of {questions.length}</span>
              <span className="sm:hidden">Q{currentQuestionIndex + 1}/{questions.length}</span>
            </h1>
            
            {showTimer && timeLeft !== undefined && (
              <span className={cn(
                "px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium border",
                timeLeft < 60 
                  ? "bg-destructive/10 text-destructive border-destructive/20" 
                  : timeLeft < 300 
                  ? "bg-warning/10 text-warning border-warning/20" 
                  : "bg-muted text-muted-foreground border-border"
              )}>
                <Timer timeLeft={timeLeft} />
              </span>
            )}
          </div>
          
          {/* Progress bar - match original */}
          <div className="mt-3 sm:mt-4">
            <Progress
              currentQuestion={currentQuestionIndex}
              totalQuestions={questions.length}
              answeredQuestions={answeredQuestions}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <QuestionWrapper
          question={currentQuestion}
          answer={answers[currentQuestion.id]}
          onAnswerChange={(answer) => onAnswerChange(currentQuestion.id, answer)}
          questionNumber={currentQuestionIndex + 1}
          disabled={submitting}
        />

        {/* Navigation - Match original button design */}
        <div className="mt-8">
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
  )
}