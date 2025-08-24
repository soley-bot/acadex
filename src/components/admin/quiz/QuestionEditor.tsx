'use client'

import React, { useMemo } from 'react'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Minus, MoveUp, MoveDown, GripVertical } from 'lucide-react'
import { useQuizQuestions, useQuizForm } from '@/contexts/QuizContext'
import { ImageUpload } from '@/components/ui/ImageUpload'

const questionTypeLabels = {
  multiple_choice: 'Multiple Choice',
  true_false: 'True/False', 
  fill_blank: 'Fill in the Blank',
  essay: 'Essay',
  matching: 'Matching',
  ordering: 'Ordering'
} as const

const difficultyLevels = [
  { value: 'easy', label: 'Easy', color: 'text-green-600' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
  { value: 'hard', label: 'Hard', color: 'text-red-600' }
]

interface QuestionEditorProps {
  question: any
  questionIndex: number
  isPreviewMode?: boolean
}

export const QuestionEditor = React.memo(({ 
  question, 
  questionIndex, 
  isPreviewMode = false 
}: QuestionEditorProps) => {
  const { updateQuestion } = useQuizQuestions()
  const { errors } = useQuizForm()

  // Get errors for this specific question
  const questionErrors = useMemo(() => 
    errors.filter(error => error.questionIndex === questionIndex),
    [errors, questionIndex]
  )

  const hasError = (field: string) => 
    questionErrors.some(error => error.field === field)

  const getError = (field: string) => 
    questionErrors.find(error => error.field === field)?.message

  const updateQuestionField = (field: string, value: any) => {
    updateQuestion(questionIndex, { [field]: value })
  }

  const addOption = () => {
    const currentOptions = question.options || []
    updateQuestionField('options', [...currentOptions, ''])
  }

  const removeOption = (optionIndex: number) => {
    const currentOptions = [...(question.options || [])]
    currentOptions.splice(optionIndex, 1)
    updateQuestionField('options', currentOptions)
    
    // Adjust correct_answer if needed
    if (question.correct_answer >= currentOptions.length) {
      updateQuestionField('correct_answer', Math.max(0, currentOptions.length - 1))
    }
  }

  const updateOption = (optionIndex: number, value: string) => {
    const currentOptions = [...(question.options || [])]
    currentOptions[optionIndex] = value
    updateQuestionField('options', currentOptions)
  }

  const moveOption = (optionIndex: number, direction: 'up' | 'down') => {
    const currentOptions = [...(question.options || [])]
    const targetIndex = direction === 'up' ? optionIndex - 1 : optionIndex + 1
    
    if (targetIndex >= 0 && targetIndex < currentOptions.length) {
      [currentOptions[optionIndex], currentOptions[targetIndex]] = 
      [currentOptions[targetIndex], currentOptions[optionIndex]]
      
      updateQuestionField('options', currentOptions)
      
      // Update correct answer if it was one of the moved options
      if (question.correct_answer === optionIndex) {
        updateQuestionField('correct_answer', targetIndex)
      } else if (question.correct_answer === targetIndex) {
        updateQuestionField('correct_answer', optionIndex)
      }
    }
  }

  if (isPreviewMode) {
    return <QuestionPreview question={question} questionIndex={questionIndex} />
  }

  return (
    <div className="space-y-6">
      {/* Question Text */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Question Text *
        </label>
        <textarea
          value={question.question}
          onChange={(e) => updateQuestionField('question', e.target.value)}
          rows={3}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
            hasError('question') ? 'border-destructive bg-destructive/5' : 'border-gray-300'
          }`}
          placeholder="Enter your question..."
          maxLength={500}
        />
        {hasError('question') && (
          <p className="mt-1 text-sm text-destructive">{getError('question')}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          {(question.question || '').length}/500 characters
        </p>
      </div>

      {/* Question Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Question Type
          </label>
          <select
            value={question.question_type}
            onChange={(e) => updateQuestionField('question_type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {Object.entries(questionTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Difficulty Level
          </label>
          <select
            value={question.difficulty_level || 'medium'}
            onChange={(e) => updateQuestionField('difficulty_level', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {difficultyLevels.map(({ value, label, color }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Points
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={question.points || 1}
            onChange={(e) => updateQuestionField('points', parseInt(e.target.value) || 1)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              hasError('points') ? 'border-destructive' : 'border-gray-300'
            }`}
          />
          {hasError('points') && (
            <p className="mt-1 text-sm text-destructive">{getError('points')}</p>
          )}
        </div>
      </div>

      {/* Question Type Specific Content */}
      <QuestionTypeContent
        question={question}
        onUpdate={updateQuestionField}
        onUpdateOption={updateOption}
        onAddOption={addOption}
        onRemoveOption={removeOption}
        onMoveOption={moveOption}
        errors={questionErrors}
      />

      {/* Media Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Question Image (Optional)
        </label>
        <ImageUpload
          value={question.image_url || ''}
          onChange={(url: string | null) => updateQuestionField('image_url', url)}
          className="w-full max-w-md"
        />
      </div>

      {/* Explanation */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Explanation (Optional)
        </label>
        <textarea
          value={question.explanation || ''}
          onChange={(e) => updateQuestionField('explanation', e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Explain why this is the correct answer..."
          maxLength={300}
        />
        <p className="mt-1 text-xs text-gray-500">
          {(question.explanation || '').length}/300 characters
        </p>
      </div>
    </div>
  )
})

// Question Type Specific Content Component
const QuestionTypeContent = React.memo(({
  question,
  onUpdate,
  onUpdateOption,
  onAddOption,
  onRemoveOption,
  onMoveOption,
  errors
}: any) => {
  const hasError = (field: string) => 
    errors.some((error: any) => error.field === field)

  const getError = (field: string) => 
    errors.find((error: any) => error.field === field)?.message

  switch (question.question_type) {
    case 'multiple_choice':
      return (
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Answer Options * (select the correct one)
            </label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onAddOption}
              disabled={question.options?.length >= 6}
              className="flex items-center gap-1"
            >
              <Plus className="h-3 w-3" />
              Add Option
            </Button>
          </div>

          <div className="space-y-2">
            {(question.options || []).map((option: string, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`question-${question.id || 'new'}-correct`}
                  checked={question.correct_answer === index}
                  onChange={() => onUpdate('correct_answer', index)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={option}
                  onChange={(e) => onUpdateOption(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={`Option ${index + 1}`}
                  maxLength={200}
                />
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onMoveOption(index, 'up')}
                    disabled={index === 0}
                    className="p-1"
                  >
                    <MoveUp className="h-3 w-3" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onMoveOption(index, 'down')}
                    disabled={index === (question.options?.length || 1) - 1}
                    className="p-1"
                  >
                    <MoveDown className="h-3 w-3" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveOption(index)}
                    disabled={question.options?.length <= 2}
                    className="p-1 text-destructive hover:text-destructive"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {hasError('options') && (
            <p className="mt-2 text-sm text-destructive">{getError('options')}</p>
          )}
        </div>
      )

    case 'true_false':
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Correct Answer *
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name={`question-${question.id || 'new'}-tf`}
                checked={question.correct_answer === 1}
                onChange={() => onUpdate('correct_answer', 1)}
                className="text-blue-600 focus:ring-blue-500 mr-2"
              />
              True
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name={`question-${question.id || 'new'}-tf`}
                checked={question.correct_answer === 0}
                onChange={() => onUpdate('correct_answer', 0)}
                className="text-blue-600 focus:ring-blue-500 mr-2"
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
            onChange={(e) => onUpdate('correct_answer_text', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              hasError('correct_answer_text') ? 'border-destructive' : 'border-gray-300'
            }`}
            placeholder="Enter the correct answer"
            maxLength={100}
          />
          {hasError('correct_answer_text') && (
            <p className="mt-1 text-sm text-destructive">{getError('correct_answer_text')}</p>
          )}
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
            onChange={(e) => onUpdate('correct_answer_text', e.target.value)}
            rows={4}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              hasError('correct_answer_text') ? 'border-destructive' : 'border-gray-300'
            }`}
            placeholder="Provide a sample answer or grading criteria..."
            maxLength={500}
          />
          {hasError('correct_answer_text') && (
            <p className="mt-1 text-sm text-destructive">{getError('correct_answer_text')}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            This will help with manual grading. Students won&apos;t see this.
          </p>
        </div>
      )

    default:
      return (
        <div className="text-center py-8 text-gray-500">
          <p>Question type &quot;{question.question_type}&quot; is not fully implemented yet.</p>
          <p className="text-xs mt-1">Please select a different question type.</p>
        </div>
      )
  }
})

// Question Preview Component
const QuestionPreview = React.memo(({ question, questionIndex }: {
  question: any
  questionIndex: number
}) => {
  return (
    <Card variant="base" className="bg-gray-50">
      <CardContent className="p-6">
        <div className="mb-4">
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            Question {questionIndex + 1}
          </h4>
          <p className="text-gray-700">{question.question}</p>
        </div>

        {question.image_url && (
          <div className="mb-4">
            <Image
              src={question.image_url}
              alt="Question"
              width={500}
              height={300}
              className="max-w-full h-auto rounded-lg"
            />
          </div>
        )}

        <div className="space-y-2">
          {question.question_type === 'multiple_choice' && (
            <div className="space-y-2">
              {(question.options || []).map((option: string, index: number) => (
                <label key={index} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name={`preview-${question.id}-${questionIndex}`}
                    disabled
                    className="text-blue-600"
                  />
                  <span className="text-gray-700">{option}</span>
                  {question.correct_answer === index && (
                    <span className="text-green-600 text-sm font-medium">✓ Correct</span>
                  )}
                </label>
              ))}
            </div>
          )}

          {question.question_type === 'true_false' && (
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input type="radio" disabled className="text-blue-600" />
                <span className="text-gray-700">True</span>
                {question.correct_answer === 1 && (
                  <span className="text-green-600 text-sm font-medium">✓ Correct</span>
                )}
              </label>
              <label className="flex items-center space-x-2">
                <input type="radio" disabled className="text-blue-600" />
                <span className="text-gray-700">False</span>
                {question.correct_answer === 0 && (
                  <span className="text-green-600 text-sm font-medium">✓ Correct</span>
                )}
              </label>
            </div>
          )}

          {(question.question_type === 'fill_blank' || question.question_type === 'essay') && (
            <div>
              <input
                type="text"
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                placeholder={question.question_type === 'essay' ? 'Essay answer...' : 'Fill in the blank...'}
              />
              {question.correct_answer_text && (
                <p className="mt-2 text-sm text-green-600">
                  <strong>Expected answer:</strong> {question.correct_answer_text}
                </p>
              )}
            </div>
          )}
        </div>

        {question.explanation && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <h5 className="font-medium text-blue-900 mb-1">Explanation</h5>
            <p className="text-blue-800 text-sm">{question.explanation}</p>
          </div>
        )}

        <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
          <span>Points: {question.points || 1}</span>
          <span>Difficulty: {question.difficulty_level || 'Medium'}</span>
        </div>
      </CardContent>
    </Card>
  )
})

QuestionTypeContent.displayName = 'QuestionTypeContent'
QuestionPreview.displayName = 'QuestionPreview'
QuestionEditor.displayName = 'QuestionEditor'
