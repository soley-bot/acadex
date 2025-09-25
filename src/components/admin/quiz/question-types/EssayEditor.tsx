'use client'

import React, { memo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Trash2, GripVertical, FileText, Plus } from 'lucide-react'
import { EssayData, QuestionEditorProps, RubricCriterion } from '@/types/question-types'

interface EssayEditorProps extends QuestionEditorProps<EssayData> {}

export const EssayEditor = memo<EssayEditorProps>(({ 
  question, 
  onChange, 
  onRemove, 
  isValid, 
  errors 
}) => {
  const updateQuestion = useCallback((field: keyof EssayData, value: any) => {
    onChange({ [field]: value })
  }, [onChange])

  const addRubricCriterion = useCallback(() => {
    const newCriterion: RubricCriterion = {
      id: `criterion-${Date.now()}`,
      criterion: '',
      max_points: 5,
      description: ''
    }
    const newCriteria = [...(question.rubric_criteria || []), newCriterion]
    updateQuestion('rubric_criteria', newCriteria)
  }, [question.rubric_criteria, updateQuestion])

  const updateRubricCriterion = useCallback((index: number, field: keyof RubricCriterion, value: any) => {
    const newCriteria = [...(question.rubric_criteria || [])]
    newCriteria[index] = { ...newCriteria[index], [field]: value } as RubricCriterion
    updateQuestion('rubric_criteria', newCriteria)
  }, [question.rubric_criteria, updateQuestion])

  const removeRubricCriterion = useCallback((index: number) => {
    const newCriteria = (question.rubric_criteria || []).filter((_, i) => i !== index)
    updateQuestion('rubric_criteria', newCriteria)
  }, [question.rubric_criteria, updateQuestion])

  return (
    <Card className={`relative ${!isValid ? 'border-red-500' : ''}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-gray-500 cursor-move" />
            <FileText className="w-5 h-5 text-purple-600" />
            Essay Question
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
        <div className="space-y-2">
          <label className="text-sm font-medium">Essay Prompt</label>
          <textarea
            value={question.question}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateQuestion('question', e.target.value)}
            placeholder="Enter your essay question or prompt..."
            className={`w-full min-h-[120px] p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent ${errors.question ? 'border-red-500' : ''}`}
          />
          {errors.question && (
            <p className="text-sm text-red-500">{errors.question}</p>
          )}
        </div>

        {/* Word Count Limits */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Minimum Words (Optional)</label>
            <input
              type="number"
              min="0"
              value={question.min_words || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                updateQuestion('min_words', e.target.value ? parseInt(e.target.value) : undefined)
              }
              placeholder="e.g., 100"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Maximum Words (Optional)</label>
            <input
              type="number"
              min="0"
              value={question.max_words || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                updateQuestion('max_words', e.target.value ? parseInt(e.target.value) : undefined)
              }
              placeholder="e.g., 500"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        {/* Auto-grading Option */}
        <div className="flex items-center space-x-3">
          <Switch
            checked={question.auto_grade}
            onCheckedChange={(checked) => updateQuestion('auto_grade', checked)}
          />
          <div className="space-y-1">
            <label className="text-sm font-medium">Enable Auto-grading</label>
            <p className="text-xs text-gray-600">
              Use AI to automatically grade essays based on rubric criteria
            </p>
          </div>
        </div>

        {/* Rubric Criteria */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Grading Rubric (Optional)</label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addRubricCriterion}
              className="h-8"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Criterion
            </Button>
          </div>
          
          {question.rubric_criteria && question.rubric_criteria.length > 0 && (
            <div className="space-y-3 border border-gray-200 rounded-lg p-4">
              {question.rubric_criteria.map((criterion, index) => (
                <div key={criterion.id} className="space-y-3 p-3 border border-gray-100 rounded-md">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={criterion.criterion}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        updateRubricCriterion(index, 'criterion', e.target.value)
                      }
                      placeholder="Criterion name (e.g., Grammar, Content, Organization)"
                      className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <div className="flex items-center gap-2 ml-3">
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={criterion.max_points}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                          updateRubricCriterion(index, 'max_points', parseInt(e.target.value) || 1)
                        }
                        className="w-16 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      <span className="text-sm text-gray-600">pts</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeRubricCriterion(index)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <textarea
                    value={criterion.description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                      updateRubricCriterion(index, 'description', e.target.value)
                    }
                    placeholder="Describe what constitutes excellent performance for this criterion..."
                    className="w-full min-h-[60px] p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  />
                </div>
              ))}
            </div>
          )}
          
          <p className="text-xs text-muted-foreground">
            Define specific criteria for grading to ensure consistent evaluation
          </p>
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

        {/* Explanation/Sample Answer */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Sample Answer / Explanation (Optional)</label>
          <textarea
            value={question.explanation || ''}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateQuestion('explanation', e.target.value)}
            placeholder="Provide a sample answer or key points students should address..."
            className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <p className="text-xs text-gray-600">
            This field supports Khmer text for bilingual explanations
          </p>
        </div>
      </CardContent>
    </Card>
  )
})

EssayEditor.displayName = 'EssayEditor'

