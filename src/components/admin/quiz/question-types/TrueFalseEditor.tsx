'use client'

import React, { memo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trash2, GripVertical, Check, X } from 'lucide-react'
import { TrueFalseData, QuestionEditorProps } from '@/types/question-types'

interface TrueFalseEditorProps extends QuestionEditorProps<TrueFalseData> {}

export const TrueFalseEditor = memo<TrueFalseEditorProps>(({ 
  question, 
  onChange, 
  onRemove, 
  isValid, 
  errors 
}) => {
  const updateQuestion = useCallback((field: keyof TrueFalseData, value: any) => {
    onChange({ [field]: value })
  }, [onChange])

  const setCorrectAnswer = useCallback((answer: boolean) => {
    updateQuestion('correct_answer', answer)
  }, [updateQuestion])

  return (
    <Card className={`relative ${!isValid ? 'border-red-500' : ''}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
            True/False Question
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

      <CardContent className="space-y-6">
        {/* Question Text */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Statement</label>
          <textarea
            value={question.question}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateQuestion('question', e.target.value)}
            placeholder="Enter a statement that can be answered with True or False..."
            className={`w-full min-h-[100px] p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent ${errors.question ? 'border-red-500' : ''}`}
          />
          {errors.question && (
            <p className="text-sm text-red-500">{errors.question}</p>
          )}
        </div>

        {/* Correct Answer Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Correct Answer</label>
          <div className="flex gap-4">
            <Button
              type="button"
              variant={question.correct_answer === true ? "default" : "outline"}
              onClick={() => setCorrectAnswer(true)}
              className="flex-1 h-12 text-lg"
            >
              <Check className="w-5 h-5 mr-2" />
              True
            </Button>
            
            <Button
              type="button"
              variant={question.correct_answer === false ? "default" : "outline"}
              onClick={() => setCorrectAnswer(false)}
              className="flex-1 h-12 text-lg"
            >
              <X className="w-5 h-5 mr-2" />
              False
            </Button>
          </div>
          
          {errors.correct_answer && (
            <p className="text-sm text-red-500">{errors.correct_answer}</p>
          )}
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
            placeholder="Explain why this statement is true or false..."
            className="w-full min-h-[80px] p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </CardContent>
    </Card>
  )
})

TrueFalseEditor.displayName = 'TrueFalseEditor'
