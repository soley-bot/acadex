"use client"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface FillBlankProps {
  value?: string
  onValueChange: (value: string) => void
  disabled?: boolean
  showCorrect?: boolean
  // SECURITY: Only pass correctAnswer in review mode
  correctAnswer?: string | null
  placeholder?: string
  className?: string
  isReviewMode?: boolean
}

export function FillBlank({
  value,
  onValueChange,
  disabled = false,
  showCorrect = false,
  correctAnswer = null,
  placeholder = "Enter your answer...",
  className,
  isReviewMode = false
}: FillBlankProps) {
  // SECURITY: Only show correct answer in review mode
  const isCorrect = isReviewMode && showCorrect && correctAnswer !== null && value === correctAnswer
  const isIncorrect = isReviewMode && showCorrect && correctAnswer !== null && value !== correctAnswer && value

  return (
    <div className={cn("space-y-4", className)}>
      <div className="p-3 sm:p-4 bg-muted/20 rounded-lg">
        <p className="text-xs sm:text-sm text-muted-foreground mb-3">Fill in the blank:</p>
        <Input
          type="text"
          value={value || ''}
          onChange={(e) => onValueChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "text-sm sm:text-base h-10 sm:h-11",
            isCorrect && "border-green-500 bg-green-50",
            isIncorrect && "border-red-500 bg-red-50"
          )}
        />
        {showCorrect && correctAnswer && (
          <div className="mt-3 p-2 sm:p-3 bg-green-50 border border-green-200 rounded text-xs sm:text-sm">
            <span className="font-medium text-green-800">Correct answer: </span>
            <span className="text-green-700">{correctAnswer}</span>
          </div>
        )}
      </div>
    </div>
  )
}