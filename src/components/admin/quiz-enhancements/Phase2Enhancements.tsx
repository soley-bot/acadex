/**
 * Phase 2 Enhancements Integration
 * Integrates enhanced visual components into the main QuizForm
 */

import React from 'react'
import { EnhancedQuestionCard } from './EnhancedQuestionCard'
import { QuizProgressIndicator } from './QuizProgressIndicator'
import { QuestionTypeStats } from './QuestionTypeIndicators'

export type QuestionType = 'multiple_choice' | 'single_choice' | 'true_false' | 'fill_blank' | 'essay' | 'matching' | 'ordering'

interface Question {
  id?: string
  question: string
  question_type: QuestionType
  options: string[] | Array<{left: string; right: string}>
  correct_answer: number | string | number[]
  explanation?: string
  order_index: number
  points?: number
  difficulty_level?: 'easy' | 'medium' | 'hard'
  image_url?: string | null
  audio_url?: string | null
}

interface QuizData {
  title: string
  description: string
  category: string
  duration_minutes: number
  passing_score: number
  max_attempts: number
}

interface ValidationError {
  field: string
  message: string
  questionIndex?: number
}

interface Phase2EnhancementsProps {
  formData: QuizData
  questions: Question[]
  errors: ValidationError[]
  expandedQuestions: Set<number>
  previewMode: boolean
  onToggleExpanded: (index: number) => void
  onUpdateQuestion: (index: number, field: string, value: any) => void
  onDuplicateQuestion: (index: number) => void
  onDeleteQuestion: (index: number) => void
  children: (questionIndex: number, question: Question) => React.ReactNode
}

export const Phase2Enhancements: React.FC<Phase2EnhancementsProps> = ({
  formData,
  questions,
  errors,
  expandedQuestions,
  previewMode,
  onToggleExpanded,
  onUpdateQuestion,
  onDuplicateQuestion,
  onDeleteQuestion,
  children
}) => {
  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <QuizProgressIndicator 
        formData={formData}
        questions={questions}
        errors={errors}
        className="mb-6"
      />
      
      {/* Question Type Statistics */}
      {questions.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <QuestionTypeStats 
            types={questions.map(q => q.question_type)}
          />
        </div>
      )}
      
      {/* Enhanced Question Cards */}
      <div className="space-y-4">
        {questions.map((question, questionIndex) => (
          <EnhancedQuestionCard
            key={questionIndex}
            question={question}
            questionIndex={questionIndex}
            isExpanded={expandedQuestions.has(questionIndex)}
            isPreviewMode={previewMode}
            errors={errors}
            onToggleExpanded={() => onToggleExpanded(questionIndex)}
            onUpdateQuestion={onUpdateQuestion}
            onDuplicateQuestion={onDuplicateQuestion}
            onDeleteQuestion={onDeleteQuestion}
          >
            {children(questionIndex, question)}
          </EnhancedQuestionCard>
        ))}
      </div>
    </div>
  )
}

export default Phase2Enhancements
