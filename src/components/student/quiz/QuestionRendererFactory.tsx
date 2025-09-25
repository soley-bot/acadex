'use client'

import React, { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import { QuestionData, QuestionRendererProps } from '@/types/question-types'

// Lazy load only the question type renderers that exist
const MultipleChoiceRenderer = React.lazy(() => 
  import('./question-types/MultipleChoiceRenderer').then(m => ({ default: m.MultipleChoiceRenderer }))
)

const TrueFalseRenderer = React.lazy(() => 
  import('./question-types/TrueFalseRenderer').then(m => ({ default: m.TrueFalseRenderer }))
)

interface QuestionRendererFactoryProps {
  question: QuestionData
  userAnswer?: any
  onAnswerChange: (answer: any) => void
  isSubmitted: boolean
  showCorrectAnswer: boolean
  isReview: boolean
}

const LoadingFallback = () => (
  <div className="flex items-center justify-center p-8 border rounded-lg bg-gray-50">
    <div className="flex items-center gap-2 text-gray-500">
      <Loader2 className="w-5 h-5 animate-spin" />
      <span>Loading question...</span>
    </div>
  </div>
)

export function QuestionRendererFactory({ question, ...props }: QuestionRendererFactoryProps) {
  const renderQuestion = () => {
    switch (question.question_type) {
      case 'multiple_choice':
        return <MultipleChoiceRenderer question={question} {...props} />
      
      case 'true_false':
        return <TrueFalseRenderer question={question} {...props} />
      
      case 'single_choice':
      case 'fill_blank':
      case 'essay':
      case 'matching':
      case 'ordering':
        return (
          <div className="p-6 border rounded-lg bg-yellow-50 border-yellow-200">
            <p className="text-yellow-800 font-medium">
              Question type &ldquo;{question.question_type}&rdquo; renderer is coming soon!
            </p>
            <p className="text-yellow-600 text-sm mt-1">
              This question type is supported but the student interface is still in development.
            </p>
          </div>
        )
      
      default:
        return (
          <div className="p-6 border rounded-lg bg-yellow-50 border-yellow-200">
            <p className="text-yellow-800 font-medium">
              Question type &ldquo;{(question as any).question_type}&rdquo; is not yet supported.
            </p>
            <p className="text-yellow-600 text-sm mt-1">
              Please contact support or try a different question type.
            </p>
          </div>
        )
    }
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      {renderQuestion()}
    </Suspense>
  )
}

