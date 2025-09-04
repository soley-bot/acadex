'use client'

import React, { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import { QuestionData, QuestionEditorProps, MultipleChoiceData } from '@/types/question-types'
import type { QuizQuestion } from '@/lib/supabase'

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
        allow_multiple: true,
        shuffle_options: true,
      } as MultipleChoiceData

    case 'single_choice':
      return {
        ...base,
        question_type: 'single_choice',
        options: Array.isArray(quizQuestion.options) ? quizQuestion.options : [],
        correct_answer: quizQuestion.correct_answer,
        shuffle_options: true,
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
        correct_answers: Array.isArray(quizQuestion.options) ? quizQuestion.options : [],
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
        shuffle_options: true,
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
        allow_multiple: false,
        shuffle_options: true,
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
      break
      
    case 'true_false':
      if (updates.correct_answer !== undefined) {
        // Convert boolean to number for database storage
        result.correct_answer = updates.correct_answer ? 1 : 0
      }
      break
      
    case 'fill_blank':
      if (updates.correct_answers !== undefined) result.options = updates.correct_answers
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

export function QuestionEditorFactory({ question: rawQuestion, onChange, ...props }: QuestionEditorFactoryProps) {
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

  const renderEditor = () => {
    const editorProps = { ...props, errors, onChange: wrappedOnChange }
    
    switch (question.question_type) {
      case 'multiple_choice':
        return <MultipleChoiceEditor question={question} {...editorProps} />
      
      case 'true_false':
        return <TrueFalseEditor question={question} {...editorProps} />
      
      case 'single_choice':
        // Single choice works the same as multiple choice but with allow_multiple: false
        return <MultipleChoiceEditor question={{...question, question_type: 'multiple_choice', allow_multiple: false} as unknown as MultipleChoiceData} {...editorProps} />
      
      case 'fill_blank':
        return <FillBlankEditor question={question} {...editorProps} />
      
      case 'essay':
        return <EssayEditor question={question} {...editorProps} />
      
      case 'matching':
        return <MatchingEditor question={question} {...editorProps} />
      
      case 'ordering':
        return <OrderingEditor question={question} {...editorProps} />
      
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
