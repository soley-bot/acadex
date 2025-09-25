"use client"

import { Circle, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProgressProps {
  currentQuestion: number
  totalQuestions: number
  answeredQuestions: Set<number>
  className?: string
}

export function Progress({
  currentQuestion,
  totalQuestions,
  answeredQuestions,
  className
}: ProgressProps) {
  const progressPercentage = (answeredQuestions.size / totalQuestions) * 100

  return (
    <div className={cn("space-y-3", className)}>
      {/* Progress Bar - Match original design */}
      <div className="w-full bg-muted/60 rounded-full h-2 sm:h-3 shadow-inner">
        <div 
          className="bg-primary h-2 sm:h-3 rounded-full transition-all duration-500 shadow-sm"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Progress Text */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Progress: {answeredQuestions.size} of {totalQuestions}
        </span>
        <span className="font-medium">
          {Math.round(progressPercentage)}%
        </span>
      </div>

      {/* Question Dots */}
      <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {Array.from({ length: totalQuestions }, (_, index) => {
          const isAnswered = answeredQuestions.has(index)
          const isCurrent = index === currentQuestion

          return (
            <div
              key={index}
              className={cn(
                "flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full text-xs font-medium transition-colors flex-shrink-0",
                isCurrent && "bg-primary text-primary-foreground",
                isAnswered && !isCurrent && "bg-green-100 text-green-800 border-2 border-green-300",
                !isAnswered && !isCurrent && "bg-muted text-muted-foreground"
              )}
              title={`Question ${index + 1}${isAnswered ? ' - Answered' : ''}${isCurrent ? ' - Current' : ''}`}
            >
              {isAnswered && !isCurrent ? (
                <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4" />
              ) : (
                <span className="text-xs">{index + 1}</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
