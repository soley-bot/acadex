/**
 * Enhanced Question Card Component
 * Beautiful, interactive question cards with improved UX
 */

import React, { useState } from 'react'
import { 
  GripVertical, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Trash2, 
  Eye, 
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Settings
} from 'lucide-react'
import { QuestionTypeIndicator, DifficultyIndicator, questionTypeConfigs } from './QuestionTypeIndicators'

export type QuestionType = 'multiple_choice' | 'single_choice' | 'true_false' | 'fill_blank' | 'essay' | 'matching' | 'ordering'

interface Question {
  id?: string
  question: string
  question_type: QuestionType
  options: string[] | Array<{left: string; right: string}>
  correct_answer: number | string | number[]
  correct_answer_text?: string | null
  explanation?: string
  order_index: number
  points?: number
  difficulty_level?: 'easy' | 'medium' | 'hard'
  image_url?: string | null
  audio_url?: string | null
}

interface ValidationError {
  field: string
  message: string
  questionIndex?: number
}

interface EnhancedQuestionCardProps {
  question: Question
  questionIndex: number
  isExpanded: boolean
  isPreviewMode: boolean
  errors: ValidationError[]
  onToggleExpanded: () => void
  onUpdateQuestion: (index: number, field: string, value: any) => void
  onDuplicateQuestion: (index: number) => void
  onDeleteQuestion: (index: number) => void
  children: React.ReactNode
}

export const EnhancedQuestionCard: React.FC<EnhancedQuestionCardProps> = ({
  question,
  questionIndex,
  isExpanded,
  isPreviewMode,
  errors,
  onToggleExpanded,
  onUpdateQuestion,
  onDuplicateQuestion,
  onDeleteQuestion,
  children
}) => {
  const [showSettings, setShowSettings] = useState(false)
  
  const questionErrors = errors.filter(e => e.questionIndex === questionIndex)
  const hasErrors = questionErrors.length > 0
  const config = questionTypeConfigs[question.question_type]
  
  // Calculate completeness score
  const completeness = calculateCompleteness(question)
  
  return (
    <div 
      className={`
        relative bg-white rounded-xl border-2 transition-all duration-200 shadow-sm hover:shadow-md
        ${hasErrors ? 'border-red-200 bg-red-50/30' : 'border-gray-200'}
        ${isExpanded ? 'ring-2 ring-primary/20' : ''}
      `}
    >
      {/* Card Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Drag Handle */}
            <div className="cursor-move p-1 rounded hover:bg-gray-100">
              <GripVertical className="h-4 w-4 text-gray-400" />
            </div>
            
            {/* Question Number & Type */}
            <div className="flex items-center gap-3">
              <span className="text-lg font-semibold text-gray-900">
                Q{questionIndex + 1}
              </span>
              <QuestionTypeIndicator type={question.question_type} size="sm" />
              {question.difficulty_level && (
                <DifficultyIndicator difficulty={question.difficulty_level} />
              )}
            </div>
          </div>
          
          {/* Header Actions */}
          <div className="flex items-center gap-2">
            {/* Completeness Indicator */}
            <div className="flex items-center gap-1">
              <div className={`h-2 w-16 rounded-full bg-gray-200 overflow-hidden`}>
                <div 
                  className={`h-full transition-all duration-300 ${
                    completeness >= 80 ? 'bg-green-500' : 
                    completeness >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${completeness}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">{completeness}%</span>
            </div>
            
            {/* Error Indicator */}
            {hasErrors && (
              <div className="flex items-center gap-1 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-xs">{questionErrors.length}</span>
              </div>
            )}
            
            {/* Status Indicator */}
            {!hasErrors && completeness >= 80 && (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            )}
            
            {/* Action Buttons */}
            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
              title="Question Settings"
            >
              <Settings className="h-4 w-4" />
            </button>
            
            <button
              type="button"
              onClick={() => onDuplicateQuestion(questionIndex)}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
              title="Duplicate Question"
            >
              <Copy className="h-4 w-4" />
            </button>
            
            <button
              type="button"
              onClick={onToggleExpanded}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
            >
              {isPreviewMode ? (
                isExpanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />
              ) : (
                isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
              )}
            </button>
            
            <button
              type="button"
              onClick={() => onDeleteQuestion(questionIndex)}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
              title="Delete Question"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {/* Question Preview */}
        {!isExpanded && (
          <div className="mt-3">
            <p className="text-sm text-gray-700 line-clamp-2">
              {question.question || 'Enter question text...'}
            </p>
            {question.options && Array.isArray(question.options) && question.options.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {(question.options as string[]).slice(0, 3).map((option, i) => (
                  <span 
                    key={i}
                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                  >
                    {option || 'Empty option'}
                  </span>
                ))}
                {(question.options as string[]).length > 3 && (
                  <span className="text-xs text-gray-400">
                    +{(question.options as string[]).length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Error Summary */}
        {!isExpanded && hasErrors && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">
                {questionErrors.length} issue{questionErrors.length > 1 ? 's' : ''} found
              </span>
            </div>
            <ul className="mt-1 text-xs text-red-600 space-y-1">
              {questionErrors.slice(0, 2).map((error, i) => (
                <li key={i}>• {error.message}</li>
              ))}
              {questionErrors.length > 2 && (
                <li className="text-red-500">• +{questionErrors.length - 2} more issues</li>
              )}
            </ul>
          </div>
        )}
      </div>
      
      {/* Settings Panel */}
      {showSettings && (
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Points
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={question.points || 1}
                onChange={(e) => onUpdateQuestion(questionIndex, 'points', parseInt(e.target.value) || 1)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Difficulty
              </label>
              <select
                value={question.difficulty_level || 'medium'}
                onChange={(e) => onUpdateQuestion(questionIndex, 'difficulty_level', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>
        </div>
      )}
      
      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-4">
          {/* Error Display */}
          {hasErrors && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700 mb-2">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">Please fix the following issues:</span>
              </div>
              <ul className="space-y-1 text-sm text-red-600">
                {questionErrors.map((error, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">•</span>
                    <span>{error.message}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Question Content */}
          {children}
        </div>
      )}
    </div>
  )
}

/**
 * Calculate question completeness percentage
 */
function calculateCompleteness(question: Question): number {
  let score = 0
  let total = 0
  
  // Question text (required) - 30%
  total += 30
  if (question.question?.trim()) score += 30
  
  // Question type (always present) - 10%
  total += 10
  if (question.question_type) score += 10
  
  // Options/Answers based on type - 40%
  total += 40
  if (['multiple_choice', 'single_choice', 'true_false'].includes(question.question_type)) {
    const options = question.options as string[]
    if (options && options.length >= 2 && options.every(opt => opt?.trim())) {
      score += 20
    }
    if (question.correct_answer !== undefined && question.correct_answer !== null) {
      score += 20
    }
  } else if (question.question_type === 'fill_blank') {
    // For fill_blank questions, check correct_answer_text field
    if (question.correct_answer_text && question.correct_answer_text.trim()) {
      score += 40
    }
  } else if (question.question_type === 'matching') {
    const matchingOptions = question.options as Array<{left: string; right: string}>
    if (matchingOptions && matchingOptions.length >= 2 && 
        matchingOptions.every(pair => pair?.left?.trim() && pair?.right?.trim())) {
      score += 40
    }
  } else if (question.question_type === 'ordering') {
    const options = question.options as string[]
    if (options && options.length >= 2 && options.every(opt => opt?.trim())) {
      score += 40
    }
  } else {
    // Essay type - optional answer
    score += 40
  }
  
  // Optional fields - 20%
  total += 20
  if (question.explanation?.trim()) score += 10
  if (question.points && question.points > 0) score += 5
  if (question.difficulty_level) score += 5
  
  return Math.round((score / total) * 100)
}
