"use client"

import { cn } from "@/lib/utils"

interface MultipleChoiceProps {
  options: string[]
  selectedValue?: number
  onValueChange: (value: number) => void
  disabled?: boolean
  showCorrect?: boolean
  // SECURITY: Only pass correctAnswer in review mode, never during active quiz
  correctAnswer?: number | null
  className?: string
  isReviewMode?: boolean  // New prop to distinguish review from active quiz
}

export function MultipleChoice({
  options,
  selectedValue,
  onValueChange,
  disabled = false,
  showCorrect = false,
  correctAnswer = null,
  className,
  isReviewMode = false
}: MultipleChoiceProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {options.map((option, index) => {
        const isSelected = selectedValue === index
        // SECURITY: Only show correct answer in review mode
        const isCorrect = isReviewMode && correctAnswer !== null ? correctAnswer === index : false
        const shouldShowCorrect = showCorrect && isCorrect && isReviewMode
        const shouldShowIncorrect = showCorrect && isSelected && !isCorrect && isReviewMode

        return (
          <label
            key={index}
            className={cn(
              "group flex items-start gap-4 p-4 sm:p-5 border-2 rounded-xl cursor-pointer transition-all duration-300 relative overflow-hidden",
              "min-h-[60px] touch-manipulation hover:scale-[1.01] active:scale-[0.99]",
              // Show correct/incorrect states if showing answers
              shouldShowCorrect && "border-green-400 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 shadow-lg shadow-green-100",
              shouldShowIncorrect && "border-red-400 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 shadow-lg shadow-red-100",
              // Normal selection states
              !showCorrect && isSelected && "border-primary bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30 shadow-lg shadow-primary/20",
              !showCorrect && !isSelected && "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary/50 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 dark:hover:from-blue-950/10 dark:hover:to-indigo-950/10 shadow-sm hover:shadow-md",
              disabled && "opacity-50 cursor-not-allowed hover:scale-100"
            )}
          >
            {/* Selection Indicator Circle */}
            <div
              className={cn(
                "flex items-center justify-center w-6 h-6 rounded-full border-2 transition-all duration-300 flex-shrink-0 mt-0.5",
                // Show correct/incorrect states
                shouldShowCorrect && "border-green-500 bg-green-500 shadow-lg shadow-green-200",
                shouldShowIncorrect && "border-red-500 bg-red-500 shadow-lg shadow-red-200",
                // Normal selection states
                !showCorrect && isSelected && "border-primary bg-primary shadow-lg shadow-primary/30 scale-110",
                !showCorrect && !isSelected && "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 group-hover:border-primary/50 group-hover:scale-105"
              )}
            >
              {isSelected && (
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
              {showCorrect && isCorrect && !isSelected && (
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>

            <input
              type="radio"
              name="question-options"
              value={index}
              checked={isSelected}
              onChange={() => !disabled && onValueChange(index)}
              className="sr-only"
              disabled={disabled}
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-3">
                <span className={cn(
                  "inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold flex-shrink-0 transition-all duration-300",
                  shouldShowCorrect && "bg-green-500 text-white shadow-md",
                  shouldShowIncorrect && "bg-red-500 text-white shadow-md",
                  !showCorrect && isSelected && "bg-primary text-white shadow-md",
                  !showCorrect && !isSelected && "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 group-hover:bg-primary/10 group-hover:text-primary"
                )}>
                  {String.fromCharCode(65 + index)}
                </span>
                <span className={cn(
                  "text-base sm:text-lg leading-relaxed flex-1",
                  shouldShowCorrect && "text-green-800 dark:text-green-200 font-semibold",
                  shouldShowIncorrect && "text-red-800 dark:text-red-200 font-medium",
                  !showCorrect && isSelected && "text-gray-900 dark:text-white font-medium",
                  !showCorrect && !isSelected && "text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white"
                )}>
                  {option}
                </span>
              </div>
            </div>

            {/* Visual feedback icon for selected state */}
            {isSelected && !showCorrect && (
              <div className="absolute top-2 right-2 text-primary animate-in fade-in zoom-in duration-200">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </label>
        )
      })}
    </div>
  )
}
