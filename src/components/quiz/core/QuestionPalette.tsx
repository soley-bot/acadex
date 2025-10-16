"use client"

import { cn } from "@/lib/utils"
import { Grid3x3, X } from "lucide-react"
import { useState } from "react"

interface Question {
  id: string
}

interface QuestionPaletteProps {
  questions: Question[]
  currentQuestionIndex: number
  answers: Record<string, any>
  onQuestionSelect: (index: number) => void
  className?: string
}

export function QuestionPalette({
  questions,
  currentQuestionIndex,
  answers,
  onQuestionSelect,
  className
}: QuestionPaletteProps) {
  const [isOpen, setIsOpen] = useState(false)

  const isAnswered = (questionId: string) => {
    const answer = answers[questionId]
    return answer !== undefined && answer !== null && answer !== '' && !(Array.isArray(answer) && answer.length === 0)
  }

  const answeredCount = questions.filter(q => isAnswered(q.id)).length

  return (
    <>
      {/* Desktop: Fixed Sidebar */}
      <div className={cn("hidden xl:block fixed right-6 top-1/2 -translate-y-1/2 z-40", className)}>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-5 w-[200px]">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold text-foreground">Questions</p>
            <span className="text-xs font-medium text-muted-foreground bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">
              {answeredCount}/{questions.length}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2.5 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
            {questions.map((question, idx) => (
              <button
                key={question.id}
                onClick={() => onQuestionSelect(idx)}
                className={cn(
                  "w-10 h-10 rounded-lg text-xs font-semibold transition-all relative flex items-center justify-center",
                  "hover:scale-105 active:scale-95",
                  idx === currentQuestionIndex && "ring-2 ring-primary ring-offset-2 ring-offset-white dark:ring-offset-gray-800",
                  isAnswered(question.id)
                    ? "bg-green-500 text-white hover:bg-green-600 shadow-sm"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                )}
                aria-label={`Go to question ${idx + 1}`}
                aria-current={idx === currentQuestionIndex ? 'step' : undefined}
              >
                {idx + 1}
              </button>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
            <div className="flex items-center gap-2.5 text-xs">
              <div className="w-3.5 h-3.5 rounded bg-green-500" />
              <span className="text-gray-600 dark:text-gray-300">Answered</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs">
              <div className="w-3.5 h-3.5 rounded bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600" />
              <span className="text-gray-600 dark:text-gray-300">Unanswered</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: Floating Button + Sheet */}
      <div className="xl:hidden">
        {/* Floating Button */}
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 right-4 z-40 bg-primary text-primary-foreground rounded-full p-3 shadow-lg hover:shadow-xl transition-all hover:scale-110 active:scale-95"
          aria-label="Open question navigator"
        >
          <Grid3x3 className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {answeredCount}
          </span>
        </button>

        {/* Mobile Sheet */}
        {isOpen && (
          <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setIsOpen(false)}>
            <div
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">Questions</h3>
                  <p className="text-sm text-muted-foreground">
                    {answeredCount} of {questions.length} answered
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-5 sm:grid-cols-8 gap-3 mb-4">
                {questions.map((question, idx) => (
                  <button
                    key={question.id}
                    onClick={() => {
                      onQuestionSelect(idx)
                      setIsOpen(false)
                    }}
                    className={cn(
                      "aspect-square rounded-lg text-sm font-semibold transition-all flex items-center justify-center min-h-[48px]",
                      idx === currentQuestionIndex && "ring-2 ring-primary ring-offset-2",
                      isAnswered(question.id)
                        ? "bg-green-500 text-white"
                        : "bg-gray-100 text-gray-600"
                    )}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-4 text-sm pt-4 border-t">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-green-500" />
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-muted" />
                  <span>Unanswered</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
