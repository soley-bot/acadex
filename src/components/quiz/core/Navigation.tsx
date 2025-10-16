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
      {/* Previous Button - Enhanced design */}
      <button
        onClick={onPrevious}
        disabled={!canGoPrevious || submitting}
        className={cn(
          "group px-4 sm:px-6 py-3 sm:py-3.5 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 min-h-[48px] sm:min-h-[52px] flex items-center gap-2 shadow-md hover:shadow-xl",
          canGoPrevious && !submitting
            ? "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:scale-105 active:scale-95"
            : "bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-40 text-gray-400 dark:text-gray-600 border-2 border-gray-200 dark:border-gray-700"
        )}
        style={{ touchAction: 'manipulation' }}
      >
        <svg className={cn("w-4 h-4 transition-transform duration-300", canGoPrevious && !submitting && "group-hover:-translate-x-1")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
        <span className="hidden sm:inline">Previous</span>
        <span className="sm:hidden">Prev</span>
      </button>

      {/* Next/Submit Button - Enhanced design */}
      {isLastQuestion ? (
        <button
          onClick={onSubmit}
          disabled={submitting}
          className={cn(
            "group relative overflow-hidden px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 min-h-[48px] sm:min-h-[52px] flex items-center gap-2 shadow-lg hover:shadow-2xl flex-1 sm:flex-initial",
            submitting
              ? "bg-gray-400 cursor-not-allowed opacity-75 text-white"
              : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white hover:scale-105 active:scale-95"
          )}
          style={{ touchAction: 'manipulation' }}
        >
          {!submitting && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"
                 style={{ backgroundSize: '200% 100%' }} />
          )}
          {submitting ? (
            <div className="flex items-center gap-2.5 justify-center w-full">
              <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span className="hidden sm:inline">Submitting...</span>
              <span className="sm:hidden">Submitting...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 justify-center w-full relative z-10">
              <CheckCircle2 className="w-5 h-5" />
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
            "group relative overflow-hidden px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 min-h-[48px] sm:min-h-[52px] flex items-center gap-2 shadow-lg hover:shadow-2xl flex-1 sm:flex-initial",
            canGoNext && !submitting
              ? "bg-gradient-to-r from-primary to-secondary hover:from-blue-600 hover:to-purple-600 text-white hover:scale-105 active:scale-95"
              : "bg-gray-200 dark:bg-gray-700 cursor-not-allowed opacity-40 text-gray-400 dark:text-gray-500"
          )}
          style={{ touchAction: 'manipulation' }}
        >
          {canGoNext && !submitting && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"
                 style={{ backgroundSize: '200% 100%' }} />
          )}
          <span className="flex items-center gap-2 justify-center w-full relative z-10">
            Next
            <ArrowRight className={cn("w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300", canGoNext && !submitting && "group-hover:translate-x-1")} />
          </span>
        </button>
      )}
    </div>
  )
})

Navigation.displayName = 'Navigation'
