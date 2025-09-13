'use client'

import React, { Suspense, useState } from 'react'
import { Loader2, ChevronDown, ChevronRight, CheckCircle, AlertTriangle, Trash2 } from 'lucide-react'
import { QuestionData, QuestionEditorProps, MultipleChoiceData, TrueFalseData, FillBlankData, EssayData, MatchingData, OrderingData } from '@/types/question-types'
import type { QuizQuestion } from '@/lib/supabase'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'

// Helper function to convert QuizQuestion to QuestionData
function convertQuizQuestionToQuestionData(quizQuestion: QuizQuestion): QuestionData {
  const base = {
    id: quizQuestion.id,
    quiz_id: quizQuestion.quiz_id,
    question: quizQuestion.question,
    explanation: quizQuestion.explanation,
    order_index: quizQuestion.order_index,
    points: quizQuestion.points,
    difficulty_level: quizQuestion.difficulty_level,
    image_url: quizQuestion.image_url,
    audio_url: quizQuestion.audio_url,
    video_url: quizQuestion.video_url,
  }

  switch (quizQuestion.question_type) {
    case 'multiple_choice':
      return {
        ...base,
        question_type: 'multiple_choice',
        options: Array.isArray(quizQuestion.options) ? quizQuestion.options : [],
        correct_answer: quizQuestion.correct_answer,
        randomize_options: quizQuestion.randomize_options ?? true,
        partial_credit: quizQuestion.partial_credit ?? false,
        feedback_correct: quizQuestion.feedback_correct,
        feedback_incorrect: quizQuestion.feedback_incorrect,
        hint: quizQuestion.hint,
        time_limit_seconds: quizQuestion.time_limit_seconds,
        weight: quizQuestion.weight,
      } as MultipleChoiceData

    case 'single_choice':
      return {
        ...base,
        question_type: 'single_choice',
        options: Array.isArray(quizQuestion.options) ? quizQuestion.options : [],
        correct_answer: quizQuestion.correct_answer,
        randomize_options: quizQuestion.randomize_options ?? true,
        feedback_correct: quizQuestion.feedback_correct,
        feedback_incorrect: quizQuestion.feedback_incorrect,
        hint: quizQuestion.hint,
      }

    case 'true_false':
      return {
        ...base,
        question_type: 'true_false',
        correct_answer: quizQuestion.correct_answer === 1,
      }

    case 'fill_blank':
      return {
        ...base,
        question_type: 'fill_blank',
        text_with_blanks: quizQuestion.question || '',
        correct_answers: quizQuestion.correct_answer_text ? [quizQuestion.correct_answer_text] : 
                        (Array.isArray(quizQuestion.options) && quizQuestion.options.length > 0 ? quizQuestion.options : ['']),
        case_sensitive: false,
        allow_partial_credit: true,
      }

    case 'essay':
      return {
        ...base,
        question_type: 'essay',
        max_words: 500,
        min_words: 50,
        rubric_criteria: [],
        auto_grade: false,
      }

    case 'matching':
      return {
        ...base,
        question_type: 'matching',
        left_column: [],
        right_column: [],
        correct_pairs: [],
        randomize_options: quizQuestion.randomize_options ?? true,
      }

    case 'ordering':
      return {
        ...base,
        question_type: 'ordering',
        items: [],
        correct_order: [],
        allow_partial_credit: true,
      }

    default:
      // Fallback to multiple choice
      return {
        ...base,
        question_type: 'multiple_choice',
        options: [],
        correct_answer: 0,
        randomize_options: true,
        partial_credit: false,
      } as MultipleChoiceData
  }
}

// Helper function to convert QuestionData updates back to QuizQuestion format
function convertQuestionDataToQuizQuestion(updates: any): Partial<QuizQuestion> {
  const result: Partial<QuizQuestion> = {}
  
  // Map common fields - ensure all undefined values are handled
  if (updates.id !== undefined) result.id = updates.id
  if (updates.quiz_id !== undefined) result.quiz_id = updates.quiz_id
  if (updates.question !== undefined) result.question = updates.question
  if (updates.explanation !== undefined) result.explanation = updates.explanation
  if (updates.order_index !== undefined) result.order_index = updates.order_index
  if (updates.points !== undefined) result.points = updates.points
  if (updates.difficulty_level !== undefined) result.difficulty_level = updates.difficulty_level
  if (updates.image_url !== undefined) result.image_url = updates.image_url
  if (updates.audio_url !== undefined) result.audio_url = updates.audio_url
  if (updates.video_url !== undefined) result.video_url = updates.video_url
  
  // Handle question type specific conversions
  if (updates.question_type !== undefined) {
    result.question_type = updates.question_type
  }
  
  // Handle type-specific data based on the question type
  const questionType = updates.question_type || 'multiple_choice'
  
  switch (questionType) {
    case 'multiple_choice':
    case 'single_choice':
      if (updates.options !== undefined) result.options = updates.options
      if (updates.correct_answer !== undefined) result.correct_answer = updates.correct_answer
      if (updates.randomize_options !== undefined) result.randomize_options = updates.randomize_options
      if (updates.partial_credit !== undefined) result.partial_credit = updates.partial_credit
      if (updates.feedback_correct !== undefined) result.feedback_correct = updates.feedback_correct
      if (updates.feedback_incorrect !== undefined) result.feedback_incorrect = updates.feedback_incorrect
      if (updates.hint !== undefined) result.hint = updates.hint
      if (updates.time_limit_seconds !== undefined) result.time_limit_seconds = updates.time_limit_seconds
      if (updates.weight !== undefined) result.weight = updates.weight
      break
      
    case 'true_false':
      if (updates.correct_answer !== undefined) {
        // Convert boolean to number for database storage
        // Database mapping: True = 0, False = 1 (matching AI prompt specification)
        result.correct_answer = updates.correct_answer ? 0 : 1
      }
      break
      
    case 'fill_blank':
      if (updates.correct_answers !== undefined) {
        result.options = updates.correct_answers
        // Also set correct_answer_text to the first answer for compatibility
        result.correct_answer_text = Array.isArray(updates.correct_answers) && updates.correct_answers.length > 0 ? 
                                    updates.correct_answers[0] : null
      }
      if (updates.text_with_blanks !== undefined) result.question = updates.text_with_blanks
      break
      
    case 'essay':
    case 'matching': 
    case 'ordering':
      // For complex types, store the data in correct_answer_json
      result.correct_answer_json = updates
      break
      
    default:
      result.correct_answer_json = updates
      break
  }
  
  return result
}

// Lazy load only the question type editors that exist
const MultipleChoiceEditor = React.lazy(() => 
  import('./question-types/MultipleChoiceEditor').then(m => ({ default: m.MultipleChoiceEditor }))
)

const TrueFalseEditor = React.lazy(() => 
  import('./question-types/TrueFalseEditor').then(m => ({ default: m.TrueFalseEditor }))
)

const FillBlankEditor = React.lazy(() => 
  import('./question-types/FillBlankEditor').then(m => ({ default: m.FillBlankEditor }))
)

const EssayEditor = React.lazy(() => 
  import('./question-types/EssayEditor').then(m => ({ default: m.EssayEditor }))
)

const MatchingEditor = React.lazy(() => 
  import('./question-types/MatchingEditor').then(m => ({ default: m.MatchingEditor }))
)

const OrderingEditor = React.lazy(() => 
  import('./question-types/OrderingEditor').then(m => ({ default: m.OrderingEditor }))
)

interface QuestionEditorFactoryProps {
  question: QuestionData | QuizQuestion
  onChange: (updatedQuestion: Partial<QuizQuestion>) => void
  onRemove: () => void
  isValid: boolean
  errors: Record<string, string> | string[]
}

const LoadingFallback = () => (
  <div className="flex items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
    <div className="flex items-center gap-2 text-gray-500">
      <Loader2 className="w-5 h-5 animate-spin" />
      <span>Loading question editor...</span>
    </div>
  </div>
)

export const QuestionEditorFactory = React.memo(function QuestionEditorFactory({ question: rawQuestion, onChange, onRemove, isValid, ...props }: QuestionEditorFactoryProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  
  // Convert QuizQuestion to QuestionData if needed
  const question = 'question_type' in rawQuestion && typeof rawQuestion.question_type === 'string' 
    ? convertQuizQuestionToQuestionData(rawQuestion as QuizQuestion)
    : rawQuestion as QuestionData

  // Convert errors to Record<string, string> if it's an array
  const errors = Array.isArray(props.errors) 
    ? props.errors.reduce((acc, error, index) => ({ ...acc, [index]: error }), {} as Record<string, string>)
    : props.errors

  // Create a wrapped onChange that converts back to QuizQuestion format
  const wrappedOnChange = (updates: any): void => {
    // Make sure to include the current question type if not provided in updates
    const updatesWithType = {
      ...updates,
      question_type: updates.question_type || question.question_type
    }
    
    const quizQuestionUpdates = convertQuestionDataToQuizQuestion(updatesWithType)
    onChange(quizQuestionUpdates)
  }

  const getQuestionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'multiple_choice': 'Multiple Choice',
      'single_choice': 'Single Choice', 
      'true_false': 'True/False',
      'fill_blank': 'Fill in the Blank',
      'essay': 'Essay Question',
      'matching': 'Matching',
      'ordering': 'Ordering'
    }
    return labels[type] || type
  }

  const getQuestionPreview = () => {
    if (question.question?.trim()) {
      return question.question.length > 60 
        ? question.question.substring(0, 60) + '...'
        : question.question
    }
    return 'No question text'
  }

  const renderEditor = () => {
    const editorProps = { ...props, errors, onChange: wrappedOnChange, isValid, onRemove }
    
    // Normalize question type - single_choice is treated as multiple_choice
    const normalizedQuestionType = question.question_type === 'single_choice' ? 'multiple_choice' : question.question_type
    const normalizedQuestion = question.question_type === 'single_choice' 
      ? { ...question, question_type: 'multiple_choice' as const, allow_multiple: false }
      : question
    
    switch (normalizedQuestionType) {
      case 'multiple_choice':
        return <MultipleChoiceEditor question={normalizedQuestion as MultipleChoiceData} {...editorProps} />
      
      case 'true_false':
        return <TrueFalseEditor question={question as TrueFalseData} {...editorProps} />
      
      case 'fill_blank':
        return <FillBlankEditor question={question as FillBlankData} {...editorProps} />
      
      case 'essay':
        return <EssayEditor question={question as EssayData} {...editorProps} />
      
      case 'matching':
        return <MatchingEditor question={question as MatchingData} {...editorProps} />
      
      case 'ordering':
        return <OrderingEditor question={question as OrderingData} {...editorProps} />
      
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
    <div className={`border rounded-lg bg-white shadow-sm ${isValid ? 'border-green-200' : 'border-red-200'}`}>
      {/* Collapsible Header */}
      <div className="flex items-center justify-between p-4 border-b cursor-pointer hover:bg-gray-50" onClick={() => setIsCollapsed(!isCollapsed)}>
        <div className="flex items-center gap-3">
          <button type="button" className="flex items-center justify-center">
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </button>
          
          <div className="flex items-center gap-2">
            {isValid ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm font-medium text-gray-500">
              {getQuestionTypeLabel(question.question_type)}
            </span>
          </div>
          
          <div className="text-sm text-gray-600">
            {getQuestionPreview()}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className={`text-xs px-2 py-1 rounded-full ${
            isValid 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {isValid ? 'Ready' : 'Incomplete'}
          </div>
          
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            className="p-1 hover:bg-red-50 rounded"
          >
            <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
          </button>
        </div>
      </div>
      
      {/* Question Editor Content */}
      {!isCollapsed && (
        <div className="p-4">
          <ErrorBoundary
            fallback={
              <div className="p-6 border-2 border-dashed border-red-300 rounded-lg bg-red-50">
                <div className="flex items-center gap-2 text-red-600 mb-3">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-medium">Question Editor Error</span>
                </div>
                <p className="text-red-700 text-sm mb-3">
                  Failed to load question editor. Please try refreshing the page.
                </p>
              </div>
            }
            onError={(error) => console.error('Question editor error:', error)}
          >
            <Suspense fallback={<LoadingFallback />}>
              {renderEditor()}
            </Suspense>
          </ErrorBoundary>
          
          {/* Error Display */}
          {!isValid && Object.keys(errors).length > 0 && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium text-red-700">Issues to fix:</span>
              </div>
              <ul className="text-sm text-red-600 space-y-1">
                {Object.values(errors).map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
})
