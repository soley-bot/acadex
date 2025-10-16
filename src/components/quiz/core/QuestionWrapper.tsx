"use client"

import React, { memo } from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { MultipleChoice } from "../questions/MultipleChoice"
import { TrueFalse } from "../questions/TrueFalse"
import { FillBlank } from "../questions/FillBlank"
import { Essay } from "../questions/Essay"
import { MultiSelect } from "../questions/MultiSelect"

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

interface QuestionWrapperProps {
  question: Question
  answer?: any
  onAnswerChange: (answer: any) => void
  questionNumber: number
  showCorrect?: boolean
  showExplanation?: boolean
  disabled?: boolean
  className?: string
}

export const QuestionWrapper = memo<QuestionWrapperProps>(({
  question,
  answer,
  onAnswerChange,
  questionNumber,
  showCorrect = false,
  showExplanation = false,
  disabled = false,
  className
}) => {
  
  // Render the appropriate question component
  const renderQuestionContent = () => {
    const commonProps = {
      disabled,
      showCorrect,
      className: "mt-4"
    }

    switch (question.question_type) {
      case 'multiple_choice':
        return (
          <MultipleChoice
            options={question.options || []}
            selectedValue={answer}
            onValueChange={onAnswerChange}
            correctAnswer={question.correct_answer}
            {...commonProps}
          />
        )

      case 'single_choice':
        return (
          <MultiSelect
            options={question.options || []}
            selectedValues={answer || []}
            onValueChange={onAnswerChange}
            correctAnswers={Array.isArray(question.correct_answer) ? question.correct_answer : []}
            {...commonProps}
          />
        )

      case 'true_false':
        return (
          <TrueFalse
            selectedValue={answer}
            onValueChange={onAnswerChange}
            correctAnswer={question.correct_answer}
            {...commonProps}
          />
        )

      case 'fill_blank':
        return (
          <FillBlank
            value={answer}
            onValueChange={onAnswerChange}
            correctAnswer={question.correct_answer}
            {...commonProps}
          />
        )

      case 'essay':
        return (
          <Essay
            value={answer}
            onValueChange={onAnswerChange}
            {...commonProps}
          />
        )

      default:
        return (
          <div className="p-6 text-center text-muted-foreground bg-muted/20 rounded-lg">
            Question type &quot;{question.question_type}&quot; is not yet supported.
          </div>
        )
    }
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Question Container - Enhanced with modern design */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-xl border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-shadow duration-300">
        {/* Question Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30 rounded-xl p-5 sm:p-6 border border-blue-100 dark:border-blue-900/30">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1.5 h-8 bg-gradient-to-b from-primary to-secondary rounded-full"></div>
                  <span className="text-xs font-semibold text-primary uppercase tracking-wide">Question</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white leading-relaxed">
                  {question.question}
                </h2>
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <Badge variant="secondary" className="text-xs font-semibold px-3 py-1 bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
                  Q{questionNumber}
                </Badge>
                {question.points && (
                  <Badge variant="outline" className="text-xs font-medium px-3 py-1 border-2 border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
                    {question.points} pts
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Question Content */}
        <div className="space-y-3">
          {renderQuestionContent()}
        </div>

        {/* Explanation - Enhanced design */}
        {showExplanation && question.explanation && (
          <div className="mt-8 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-l-4 border-blue-500 rounded-xl shadow-md">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-lg">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-blue-900 dark:text-blue-200 mb-2 text-sm uppercase tracking-wide">Explanation</h4>
                <p className="text-sm sm:text-base text-blue-800 dark:text-blue-300 leading-relaxed">{question.explanation}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
})

QuestionWrapper.displayName = 'QuestionWrapper'
