import React, { memo, useMemo, useCallback } from 'react'
import { Copy, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { QuizQuestion } from '@/lib/supabase'
import { usePerformanceMonitor } from '@/hooks/usePerformanceOptimization'

interface OptimizedQuestionEditorProps {
  question: QuizQuestion
  index: number
  onUpdate: (updates: Partial<QuizQuestion>) => void
  onDuplicate: () => void
  onRemove: () => void
  isActive?: boolean
  validationErrors?: string[]
}

// Memoized Option Editor Component
const OptionEditor = memo<{
  option: string
  index: number
  isCorrect: boolean
  questionId: string
  onOptionChange: (index: number, value: string) => void
  onCorrectChange: (index: number) => void
}>(({ option, index, isCorrect, questionId, onOptionChange, onCorrectChange }) => {
  const handleOptionChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onOptionChange(index, e.target.value)
  }, [index, onOptionChange])

  const handleCorrectChange = useCallback(() => {
    onCorrectChange(index)
  }, [index, onCorrectChange])

  return (
    <div className="flex items-center space-x-2">
      <input
        type="radio"
        name={`correct-${questionId}`}
        checked={isCorrect}
        onChange={handleCorrectChange}
        className="text-primary"
      />
      <input
        type="text"
        value={option}
        onChange={handleOptionChange}
        placeholder={`Option ${index + 1}`}
        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
      />
    </div>
  )
}, (prevProps, nextProps) => {
  // Custom comparison for optimal re-rendering
  return (
    prevProps.option === nextProps.option &&
    prevProps.isCorrect === nextProps.isCorrect &&
    prevProps.index === nextProps.index &&
    prevProps.questionId === nextProps.questionId
  )
})

OptionEditor.displayName = 'OptionEditor'

// Memoized Question Type Selector
const QuestionTypeSelector = memo<{
  questionType: string
  onChange: (type: string) => void
}>(({ questionType, onChange }) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value)
  }, [onChange])

  return (
    <select
      value={questionType}
      onChange={handleChange}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
    >
      <option value="multiple_choice">Multiple Choice</option>
      <option value="true_false">True/False</option>
      <option value="fill_blank">Fill in the Blank</option>
      <option value="essay">Essay</option>
      <option value="matching">Matching</option>
      <option value="ordering">Ordering</option>
    </select>
  )
}, (prevProps, nextProps) => prevProps.questionType === nextProps.questionType)

QuestionTypeSelector.displayName = 'QuestionTypeSelector'

// Main Optimized Question Editor Component
export const OptimizedQuestionEditor = memo<OptimizedQuestionEditorProps>(({
  question,
  index,
  onUpdate,
  onDuplicate,
  onRemove,
  isActive = false,
  validationErrors = []
}) => {
  // Performance monitoring
  const { metrics } = usePerformanceMonitor({
    componentName: `QuestionEditor-${index}`,
    threshold: 16,
    logSlowRenders: process.env.NODE_ENV === 'development'
  })

  // Memoized validation state
  const hasErrors = useMemo(() => validationErrors.length > 0, [validationErrors.length])

  // Optimized event handlers
  const handleQuestionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({ question: e.target.value })
  }, [onUpdate])

  const handlePointsChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ points: parseInt(e.target.value) || 1 })
  }, [onUpdate])

  const handleExplanationChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({ explanation: e.target.value })
  }, [onUpdate])

  const handleQuestionTypeChange = useCallback((type: string) => {
    onUpdate({ question_type: type as any })
  }, [onUpdate])

  const handleOptionChange = useCallback((optionIndex: number, value: string) => {
    const newOptions = [...(question.options || [])]
    newOptions[optionIndex] = value
    onUpdate({ options: newOptions })
  }, [question.options, onUpdate])

  const handleCorrectAnswerChange = useCallback((optionIndex: number) => {
    onUpdate({ correct_answer: optionIndex })
  }, [onUpdate])

  // Memoized options rendering
  const optionsEditor = useMemo(() => {
    if (question.question_type !== 'multiple_choice' && question.question_type !== 'single_choice') {
      return null
    }

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Options
        </label>
        <div className="space-y-2">
          {question.options?.map((option: string, optionIndex: number) => (
            <OptionEditor
              key={`${question.id}-option-${optionIndex}`}
              option={option}
              index={optionIndex}
              isCorrect={question.correct_answer === optionIndex}
              questionId={question.id}
              onOptionChange={handleOptionChange}
              onCorrectChange={handleCorrectAnswerChange}
            />
          ))}
        </div>
      </div>
    )
  }, [
    question.question_type,
    question.options,
    question.correct_answer,
    question.id,
    handleOptionChange,
    handleCorrectAnswerChange
  ])

  // Memoized answer editor for non-multiple-choice types
  const answerEditor = useMemo(() => {
    switch (question.question_type) {
      case 'true_false':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correct Answer *
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name={`tf-${question.id}`}
                  checked={question.correct_answer === 1}
                  onChange={() => onUpdate({ correct_answer: 1 })}
                  className="text-primary mr-2"
                />
                True
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name={`tf-${question.id}`}
                  checked={question.correct_answer === 0}
                  onChange={() => onUpdate({ correct_answer: 0 })}
                  className="text-primary mr-2"
                />
                False
              </label>
            </div>
          </div>
        )

      case 'fill_blank':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correct Answer *
            </label>
            <input
              type="text"
              value={question.correct_answer_text || ''}
              onChange={(e) => onUpdate({ correct_answer_text: e.target.value })}
              placeholder="Enter the correct answer"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-500">
              Students will type their answer. Consider multiple acceptable answers in your explanation.
            </p>
          </div>
        )

      case 'essay':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sample Answer / Grading Criteria *
            </label>
            <textarea
              value={question.correct_answer_text || ''}
              onChange={(e) => onUpdate({ correct_answer_text: e.target.value })}
              placeholder="Provide a sample answer or grading criteria..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-500">
              This will help with manual grading. Students won&apos;t see this.
            </p>
          </div>
        )

      case 'matching':
      case 'ordering':
        return (
          <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg">
            <p>Question type &quot;{question.question_type}&quot; is not fully implemented yet.</p>
            <p className="text-xs mt-1">Please select a different question type.</p>
          </div>
        )

      default:
        return null
    }
  }, [question.question_type, question.correct_answer, question.correct_answer_text, question.id, onUpdate])

  // Memoized card styling
  const cardClassName = useMemo(() => {
    let className = "border-l-4 transition-all duration-200"
    if (hasErrors) {
      className += " border-l-red-500 bg-red-50"
    } else if (isActive) {
      className += " border-l-primary bg-blue-50"
    } else {
      className += " border-l-gray-300"
    }
    return className
  }, [hasErrors, isActive])

  return (
    <Card className={cardClassName}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-500">Question {index + 1}</span>
            {hasErrors && (
              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                {validationErrors.length} error{validationErrors.length > 1 ? 's' : ''}
              </span>
            )}
            {process.env.NODE_ENV === 'development' && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                {metrics.renderCount} renders
              </span>
            )}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={onDuplicate}
              className="text-gray-400 hover:text-primary transition-colors"
              title="Duplicate question"
            >
              <Copy className="h-4 w-4" />
            </button>
            <button
              onClick={onRemove}
              className="text-gray-400 hover:text-red-500 transition-colors"
              title="Remove question"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Validation Errors */}
        {hasErrors && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="text-red-800 text-sm">
              <ul className="space-y-1">
                {validationErrors.map((error, errorIndex) => (
                  <li key={errorIndex}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Question Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Question Text *
          </label>
          <textarea
            value={question.question}
            onChange={handleQuestionChange}
            placeholder="Enter your question"
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Question Type and Points */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question Type
            </label>
            <QuestionTypeSelector
              questionType={question.question_type}
              onChange={handleQuestionTypeChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Points
            </label>
            <input
              type="number"
              min="1"
              value={question.points}
              onChange={handlePointsChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        {/* Options Editor */}
        {optionsEditor}

        {/* Answer Editor for non-multiple-choice types */}
        {answerEditor}

        {/* Explanation */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Explanation (Optional)
          </label>
          <textarea
            value={question.explanation || ''}
            onChange={handleExplanationChange}
            placeholder="Explain the correct answer"
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </CardContent>
    </Card>
  )
}, (prevProps, nextProps) => {
  // Custom comparison function for optimal re-rendering
  return (
    prevProps.index === nextProps.index &&
    prevProps.isActive === nextProps.isActive &&
    JSON.stringify(prevProps.question) === JSON.stringify(nextProps.question) &&
    JSON.stringify(prevProps.validationErrors) === JSON.stringify(nextProps.validationErrors)
  )
})

OptimizedQuestionEditor.displayName = 'OptimizedQuestionEditor'
