'use client'

import React, { memo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Trash2, GripVertical, Plus, Check } from 'lucide-react'
import { MultipleChoiceData, QuestionEditorProps } from '@/types/question-types'

interface MultipleChoiceEditorProps extends QuestionEditorProps<MultipleChoiceData> {}

export const MultipleChoiceEditor = memo<MultipleChoiceEditorProps>(({ 
  question, 
  onChange, 
  onRemove, 
  isValid, 
  errors 
}) => {
  const updateQuestion = useCallback((field: keyof MultipleChoiceData, value: any) => {
    onChange({ [field]: value })
  }, [onChange])

  const updateOption = useCallback((index: number, value: string) => {
    const newOptions = [...question.options]
    newOptions[index] = value
    updateQuestion('options', newOptions)
  }, [question.options, updateQuestion])

  const addOption = useCallback(() => {
    const newOptions = [...question.options, '']
    updateQuestion('options', newOptions)
  }, [question.options, updateQuestion])

  const removeOption = useCallback((index: number) => {
    if (question.options.length <= 2) return // Minimum 2 options
    
    const newOptions = question.options.filter((_, i) => i !== index)
    updateQuestion('options', newOptions)
    
    // Adjust correct answer if needed
    if (question.correct_answer >= newOptions.length) {
      updateQuestion('correct_answer', 0)
    } else if (question.correct_answer === index) {
      updateQuestion('correct_answer', 0)
    } else if (question.correct_answer > index) {
      updateQuestion('correct_answer', question.correct_answer - 1)
    }
  }, [question.options, question.correct_answer, updateQuestion])

  const setCorrectAnswer = useCallback((index: number) => {
    updateQuestion('correct_answer', index)
  }, [updateQuestion])

  return (
    <Card className={`relative ${!isValid ? 'border-red-500' : ''}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
            Multiple Choice Question
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
          <label className="text-sm font-medium">Question</label>
          <textarea
            value={question.question}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateQuestion('question', e.target.value)}
            placeholder="Enter your multiple choice question..."
            className={`w-full min-h-[100px] p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent ${errors.question ? 'border-red-500' : ''}`}
          />
          {errors.question && (
            <p className="text-sm text-red-500">{errors.question}</p>
          )}
        </div>

        {/* Options */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Answer Options</label>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={addOption}
              disabled={question.options.length >= 6} // Max 6 options
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Option
            </Button>
          </div>

          <div className="space-y-3">
            {question.options.map((option, index) => (
              <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                <Button
                  type="button"
                  variant={question.correct_answer === index ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCorrectAnswer(index)}
                  className="shrink-0"
                >
                  {question.correct_answer === index ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <span className="w-4 h-4 flex items-center justify-center text-sm">
                      {String.fromCharCode(65 + index)}
                    </span>
                  )}
                </Button>

                <input
                  type="text"
                  value={option}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateOption(index, e.target.value)}
                  placeholder={`Option ${String.fromCharCode(65 + index)}`}
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                />

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeOption(index)}
                  disabled={question.options.length <= 2}
                  className="shrink-0 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          {errors.options && (
            <p className="text-sm text-red-500">{errors.options}</p>
          )}
        </div>

        {/* Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Allow Multiple Selections</label>
            <Switch
              checked={question.allow_multiple}
              onCheckedChange={(checked) => updateQuestion('allow_multiple', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Shuffle Options</label>
            <Switch
              checked={question.shuffle_options}
              onCheckedChange={(checked) => updateQuestion('shuffle_options', checked)}
            />
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
            placeholder="Explain why this is the correct answer..."
            className="w-full min-h-[80px] p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </CardContent>
    </Card>
  )
})

MultipleChoiceEditor.displayName = 'MultipleChoiceEditor'
