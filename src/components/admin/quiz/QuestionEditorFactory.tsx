'use client'

import React, { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import { QuestionData, QuestionEditorProps } from '@/types/question-types'

// Lazy load only the question type editors that exist
const MultipleChoiceEditor = React.lazy(() => 
  import('./question-types/MultipleChoiceEditor').then(m => ({ default: m.MultipleChoiceEditor }))
)

const TrueFalseEditor = React.lazy(() => 
  import('./question-types/TrueFalseEditor').then(m => ({ default: m.TrueFalseEditor }))
)

interface QuestionEditorFactoryProps {
  question: QuestionData
  onChange: (updatedQuestion: Partial<QuestionData>) => void
  onRemove: () => void
  isValid: boolean
  errors: Record<string, string>
}

const LoadingFallback = () => (
  <div className="flex items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
    <div className="flex items-center gap-2 text-gray-500">
      <Loader2 className="w-5 h-5 animate-spin" />
      <span>Loading question editor...</span>
    </div>
  </div>
)

export function QuestionEditorFactory({ question, ...props }: QuestionEditorFactoryProps) {
  const renderEditor = () => {
    switch (question.question_type) {
      case 'multiple_choice':
        return <MultipleChoiceEditor question={question} {...props} />
      
      case 'true_false':
        return <TrueFalseEditor question={question} {...props} />
      
      case 'single_choice':
      case 'fill_blank':
      case 'essay':
      case 'matching':
      case 'ordering':
        return (
          <div className="p-6 border-2 border-dashed border-yellow-300 rounded-lg bg-yellow-50">
            <p className="text-yellow-800 font-medium">
              Question type &ldquo;{question.question_type}&rdquo; editor is coming soon!
            </p>
            <p className="text-yellow-600 text-sm mt-1">
              This question type is supported but the specialized editor is still in development.
            </p>
          </div>
        )
      
      default:
        return (
          <div className="p-6 border-2 border-dashed border-red-300 rounded-lg bg-red-50">
            <p className="text-red-600 font-medium">
              Unsupported question type: {(question as any).question_type}
            </p>
          </div>
        )
    }
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      {renderEditor()}
    </Suspense>
  )
}
