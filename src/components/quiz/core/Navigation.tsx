"use client"

import React, { memo } from "react"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavigationProps {
  onPrevious: () => void
  onNext: () => void
  onSubmit: () => void
  canGoPrevious?: boolean
  canGoNext?: boolean
  isLastQuestion?: boolean
  submitting?: boolean
  className?: string
}

export const Navigation = memo<NavigationProps>(({
  onPrevious,
  onNext,
  onSubmit,
  canGoPrevious = true,
  canGoNext = true,
  isLastQuestion = false,
  submitting = false,
  className
}: NavigationProps) => {
  return (
    <div className={cn("flex items-center justify-between gap-3 sm:gap-4", className)}>
      {/* Previous Button - Match original design */}
      <button
        onClick={onPrevious}
        disabled={!canGoPrevious || submitting}
        className={cn(
          "px-3 sm:px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 active:scale-95 touch-manipulation min-h-[44px] flex-shrink-0 shadow-sm hover:shadow-md",
          canGoPrevious && !submitting 
            ? "bg-muted hover:bg-muted/80 text-muted-foreground"
            : "bg-gray-200 cursor-not-allowed opacity-50 text-gray-400"
        )}
        style={{ touchAction: 'manipulation' }}
      >
        <span className="hidden sm:inline">← Previous</span>
        <span className="sm:hidden">← Prev</span>
      </button>

      {/* Next/Submit Button - Match original design */}
      {isLastQuestion ? (
        <button
          onClick={onSubmit}
          disabled={submitting}
          className={cn(
            "px-4 sm:px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 min-h-[44px] flex-shrink-0 shadow-sm",
            submitting 
              ? "bg-gray-400 cursor-not-allowed opacity-75" 
              : "bg-success hover:bg-success/90 hover:shadow-md active:scale-95 touch-manipulation"
          )}
          style={{ touchAction: 'manipulation' }}
        >
          {submitting ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span className="hidden sm:inline text-white">Submitting...</span>
              <span className="sm:hidden text-white">...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-white">
              <CheckCircle2 className="w-4 h-4" />
              <span className="hidden sm:inline">Submit Quiz</span>
              <span className="sm:hidden">Submit</span>
            </div>
          )}
        </button>
      ) : (
        <button
          onClick={onNext}
          disabled={!canGoNext || submitting}
          className={cn(
            "px-3 sm:px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 active:scale-95 touch-manipulation min-h-[44px] flex-shrink-0 shadow-sm hover:shadow-md",
            canGoNext && !submitting
              ? "bg-primary hover:bg-secondary text-white"
              : "bg-gray-200 cursor-not-allowed opacity-50 text-gray-400"
          )}
          style={{ touchAction: 'manipulation' }}
        >
          <span className="hidden sm:inline flex items-center gap-1">
            Next <ArrowRight className="w-4 h-4" />
          </span>
          <span className="sm:hidden">→</span>
        </button>
      )}
    </div>
  )
})

Navigation.displayName = 'Navigation'
