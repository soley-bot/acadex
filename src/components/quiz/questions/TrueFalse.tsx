"use client"

import { cn } from "@/lib/utils"

interface TrueFalseProps {
  selectedValue?: boolean
  onValueChange: (value: boolean) => void
  disabled?: boolean
  showCorrect?: boolean
  // SECURITY: Only pass correctAnswer in review mode
  correctAnswer?: boolean | null
  className?: string
  isReviewMode?: boolean
}

export function TrueFalse({
  selectedValue,
  onValueChange,
  disabled = false,
  showCorrect = false,
  correctAnswer = null,
  className,
  isReviewMode = false
}: TrueFalseProps) {
  const options = [
    { label: 'True', value: true },
    { label: 'False', value: false }
  ]

  return (
    <div className={cn("space-y-2", className)}>
      {options.map((option) => {
        const isSelected = selectedValue === option.value
        // SECURITY: Only show correct answer in review mode
        const isCorrect = isReviewMode && correctAnswer !== null ? correctAnswer === option.value : false
        const shouldShowCorrect = showCorrect && isCorrect && isReviewMode
        const shouldShowIncorrect = showCorrect && isSelected && !isCorrect && isReviewMode

        return (
          <label
            key={option.label}
            className={cn(
              "flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all duration-200",
              // Show correct/incorrect states if showing answers
              shouldShowCorrect && "border-success bg-success/10",
              shouldShowIncorrect && "border-destructive bg-destructive/10",
              // Normal selection states
              !showCorrect && isSelected && "border-primary bg-primary/5",
              !showCorrect && !isSelected && "border-gray-200 bg-white hover:border-red-300 hover:bg-red-25",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <div
              className={cn(
                "flex items-center justify-center w-5 h-5 rounded-full border-2 transition-all",
                // Show correct/incorrect states
                shouldShowCorrect && "border-success bg-success/50",
                shouldShowIncorrect && "border-destructive bg-destructive/50", 
                // Normal selection states
                !showCorrect && isSelected && "border-primary bg-primary/50",
                !showCorrect && !isSelected && "border-gray-400 bg-white"
              )}
            >
              {isSelected && (
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  shouldShowCorrect && "bg-success",
                  shouldShowIncorrect && "bg-destructive",
                  !showCorrect && "bg-white"
                )} />
              )}
              {showCorrect && isCorrect && !isSelected && (
                <div className="w-2 h-2 bg-success rounded-full" />
              )}
            </div>
            <input
              type="radio"
              name="true-false-options"
              value={option.value.toString()}
              checked={isSelected}
              onChange={() => !disabled && onValueChange(option.value)}
              className="sr-only"
              disabled={disabled}
            />
            <span className={cn(
              "text-base flex-1 font-medium",
              shouldShowCorrect && "text-success-foreground",
              shouldShowIncorrect && "text-destructive-foreground",
              !showCorrect && "text-gray-800"
            )}>
              {option.label}
            </span>
          </label>
        )
      })}
    </div>
  )
}
