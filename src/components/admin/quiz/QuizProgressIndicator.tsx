import React from 'react'
import { CheckCircle, Circle, AlertCircle, Clock } from 'lucide-react'
import { FEATURE_FLAGS } from '@/lib/featureFlags'
import type { QuestionType } from '@/lib/supabase'

interface Question {
  id?: string
  question: string
  question_type: QuestionType
  options: string[] | any[]
  correct_answer: any
  explanation?: string
  points?: number
}

interface QuizProgressIndicatorProps {
  questions: Question[]
  errors: Array<{ questionIndex: number; field: string; message: string }>
  currentQuestionIndex?: number
  className?: string
}

export function QuizProgressIndicator({
  questions,
  errors,
  currentQuestionIndex,
  className = ''
}: QuizProgressIndicatorProps) {
  if (!FEATURE_FLAGS.PROGRESS_INDICATORS) {
    return null
  }

  const getQuestionStatus = (questionIndex: number) => {
    const question = questions[questionIndex]
    const hasErrors = errors.some(e => e.questionIndex === questionIndex)
    
    if (!question?.question.trim()) {
      return 'empty'
    }
    
    if (hasErrors) {
      return 'error'
    }
    
    // Check if question is complete based on type
    const isComplete = isQuestionComplete(question)
    return isComplete ? 'complete' : 'incomplete'
  }

  const isQuestionComplete = (question: Question): boolean => {
    if (!question.question.trim()) return false
    
    switch (question.question_type) {
      case 'multiple_choice':
      case 'single_choice':
        return question.options.length >= 2 && 
               question.options.every(opt => opt.toString().trim()) &&
               question.correct_answer !== undefined
      
      case 'true_false':
        return question.correct_answer !== undefined
      
      case 'fill_blank':
      case 'essay':
        return question.correct_answer?.toString().trim()
      
      case 'matching':
        return Array.isArray(question.options) && 
               question.options.length >= 2 &&
               question.options.every(opt => opt.left && opt.right) &&
               Array.isArray(question.correct_answer)
      
      case 'ordering':
        return Array.isArray(question.options) && 
               question.options.length >= 2 &&
               question.options.every(opt => opt.toString().trim()) &&
               Array.isArray(question.correct_answer)
      
      default:
        return false
    }
  }

  const statusCounts = {
    complete: 0,
    incomplete: 0,
    error: 0,
    empty: 0
  }

  questions.forEach((_, index) => {
    const status = getQuestionStatus(index)
    statusCounts[status]++
  })

  const totalQuestions = questions.length
  const completionPercentage = totalQuestions > 0 
    ? Math.round((statusCounts.complete / totalQuestions) * 100)
    : 0

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Quiz Progress</h3>
        <span className="text-sm text-gray-600">
          {statusCounts.complete}/{totalQuestions} complete
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div 
          className="bg-green-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${completionPercentage}%` }}
        />
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="text-gray-700">
            Complete: <span className="font-semibold">{statusCounts.complete}</span>
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-yellow-600" />
          <span className="text-gray-700">
            Incomplete: <span className="font-semibold">{statusCounts.incomplete}</span>
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <span className="text-gray-700">
            Errors: <span className="font-semibold">{statusCounts.error}</span>
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Circle className="h-4 w-4 text-gray-400" />
          <span className="text-gray-700">
            Empty: <span className="font-semibold">{statusCounts.empty}</span>
          </span>
        </div>
      </div>

      {/* Question List Preview */}
      {totalQuestions > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex flex-wrap gap-1">
            {questions.map((_, index) => {
              const status = getQuestionStatus(index)
              const isCurrent = currentQuestionIndex === index
              
              const statusStyles = {
                complete: 'bg-green-600 border-green-600',
                incomplete: 'bg-yellow-600 border-yellow-600',
                error: 'bg-red-600 border-red-600',
                empty: 'bg-gray-300 border-gray-300'
              }
              
              return (
                <div
                  key={index}
                  className={`
                    w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white border-2 transition-all
                    ${statusStyles[status]}
                    ${isCurrent ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
                  `}
                  title={`Question ${index + 1} - ${status}`}
                >
                  {index + 1}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Completion Message */}
      {completionPercentage === 100 && totalQuestions > 0 && (
        <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">
              Quiz is ready to publish!
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
