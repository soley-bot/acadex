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
    <div className={cn("space-y-2", className)}>
      {/* Progress Bar with Text on Right */}
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
          <div
            className="bg-primary h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
          <span>
            <span className="font-semibold text-gray-900 dark:text-white">{answeredQuestions.size}</span> of {totalQuestions} answered
          </span>
          <span className="font-medium">{Math.round(progressPercentage)}%</span>
        </div>
      </div>
    </div>
  )
}
