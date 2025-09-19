"use client"

import { cn } from "@/lib/utils"

interface MultipleChoiceProps {
  options: string[]
  selectedValue?: number
  onValueChange: (value: number) => void
  disabled?: boolean
  showCorrect?: boolean
  correctAnswer?: number
  className?: string
}

export function MultipleChoice({
  options,
  selectedValue,
  onValueChange,
  disabled = false,
  showCorrect = false,
  correctAnswer,
  className
}: MultipleChoiceProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {options.map((option, index) => {
        const isSelected = selectedValue === index
        const isCorrect = correctAnswer === index
        const shouldShowCorrect = showCorrect && isCorrect
        const shouldShowIncorrect = showCorrect && isSelected && !isCorrect

        return (
          <label
            key={index}
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
              name="question-options"
              value={index}
              checked={isSelected}
              onChange={() => !disabled && onValueChange(index)}
              className="sr-only"
              disabled={disabled}
            />
            <span className={cn(
              "text-base flex-1",
              shouldShowCorrect && "text-success-foreground font-medium",
              shouldShowIncorrect && "text-destructive-foreground",
              !showCorrect && "text-gray-800"
            )}>
              <span className="font-medium mr-2 text-sm">{String.fromCharCode(65 + index)}.</span>
              {option}
            </span>
          </label>
        )
      })}
    </div>
  )
}