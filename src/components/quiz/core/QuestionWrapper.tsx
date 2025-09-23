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
      {/* Question Container - Match original design */}
      <div className="bg-white/95 rounded-xl p-5 shadow-lg border border-white/20">
        {/* Question Header */}
        <div className="mb-6">
          <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg p-4 mb-4">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-xl font-semibold text-foreground leading-relaxed flex-1">
                {question.question}
              </h2>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge variant="secondary" className="text-xs">
                  Q{questionNumber}
                </Badge>
                {question.points && (
                  <Badge variant="outline" className="text-xs">
                    {question.points} pts
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Question Content - Compact spacing */}
        <div className="space-y-2">
          {renderQuestionContent()}
        </div>

        {/* Explanation */}
        {showExplanation && question.explanation && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                i
              </div>
              <div>
                <h4 className="font-medium text-blue-900 mb-2">Explanation</h4>
                <p className="text-sm text-blue-800 leading-relaxed">{question.explanation}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
})

QuestionWrapper.displayName = 'QuestionWrapper'