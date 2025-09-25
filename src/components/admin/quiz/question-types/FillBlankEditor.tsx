'use client'

import React, { memo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { TextInput, TextareaInput } from '@/components/ui/FormInputs'
import { FormField } from '@/components/ui/FormComponents'
import { Plus, Trash2, GripVertical, Type } from 'lucide-react'
import { FillBlankData, QuestionEditorProps } from '@/types/question-types'

interface FillBlankEditorProps extends QuestionEditorProps<FillBlankData> {}

export const FillBlankEditor = memo<FillBlankEditorProps>(({ 
  question, 
  onChange, 
  onRemove, 
  isValid, 
  errors 
}) => {
  const updateQuestion = useCallback((field: keyof FillBlankData, value: any) => {
    onChange({ [field]: value })
  }, [onChange])

  const updateAnswer = useCallback((index: number, value: string) => {
    const newAnswers = [...question.correct_answers]
    newAnswers[index] = value
    updateQuestion('correct_answers', newAnswers)
  }, [question.correct_answers, updateQuestion])

  const addAnswer = useCallback(() => {
    const newAnswers = [...question.correct_answers, '']
    updateQuestion('correct_answers', newAnswers)
  }, [question.correct_answers, updateQuestion])

  const removeAnswer = useCallback((index: number) => {
    if (question.correct_answers.length <= 1) return // Minimum 1 answer
    const newAnswers = question.correct_answers.filter((_, i) => i !== index)
    updateQuestion('correct_answers', newAnswers)
  }, [question.correct_answers, updateQuestion])

  return (
    <Card className={`relative ${!isValid ? 'border-red-500' : ''}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-gray-500 cursor-move" />
            <Type className="w-5 h-5 text-blue-600" />
            Fill in the Blank Question
          </CardTitle>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={onRemove}
            className="h-8 w-8 p-0"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Question Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Question Text</label>
          <TextareaInput
            value={question.question}
            onChange={(value) => updateQuestion('question', value)}
            placeholder="Enter the text with blanks marked as [BLANK] or ___"
            className="font-mono"
          />
        </div>

        {/* Correct Answers */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Correct Answers</label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addAnswer}
              className="h-8"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Answer
            </Button>
          </div>
          
          <div className="space-y-2">
            {question.correct_answers.map((answer, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={answer}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateAnswer(index, e.target.value)}
                  placeholder={`Correct answer ${index + 1}`}
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                {question.correct_answers.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeAnswer(index)}
                    className="h-10 w-10 p-0 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {errors.correct_answers && (
            <p className="text-sm text-red-500">{errors.correct_answers}</p>
          )}
          <p className="text-xs text-gray-600">
            Add multiple acceptable answers (e.g., &ldquo;color&rdquo; and &ldquo;colour&rdquo;)
          </p>
        </div>

        {/* Answer Options */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <Switch
              checked={question.case_sensitive}
              onCheckedChange={(checked) => updateQuestion('case_sensitive', checked)}
            />
            <label className="text-sm">Case Sensitive</label>
          </div>
          
          <div className="flex items-center space-x-3">
            <Switch
              checked={question.allow_partial_credit}
              onCheckedChange={(checked) => updateQuestion('allow_partial_credit', checked)}
            />
            <label className="text-sm">Allow Partial Credit</label>
          </div>
        </div>

        {/* Points and Difficulty */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Points</label>
            <input
              type="number"
              min="1"
              max="100"
              value={question.points}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateQuestion('points', parseInt(e.target.value) || 1)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Difficulty</label>
            <select
              value={question.difficulty_level}
              onChange={(e) => updateQuestion('difficulty_level', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        {/* Explanation */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Explanation (Optional)</label>
          <textarea
            value={question.explanation || ''}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateQuestion('explanation', e.target.value)}
            placeholder="Explain the correct answer and provide context..."
            className="w-full min-h-[80px] p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <p className="text-xs text-gray-600">
            This explanation supports Khmer text for bilingual content
          </p>
        </div>
      </CardContent>
    </Card>
  )
})

FillBlankEditor.displayName = 'FillBlankEditor'
