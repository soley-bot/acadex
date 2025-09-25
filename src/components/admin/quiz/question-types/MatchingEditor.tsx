'use client'

import React from 'react'
import { GripVertical, Trash2, Plus, ArrowRightLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TextInput, TextareaInput } from '@/components/ui/FormInputs'
import { FormField } from '@/components/ui/FormComponents'
import { Switch } from '@/components/ui/switch'
import { QuestionEditorProps, MatchingData, MatchingPair, MatchingItem } from '@/types/question-types'

export function MatchingEditor({ question, onChange, onRemove, isValid, errors }: QuestionEditorProps<MatchingData>) {
  const leftColumn = question.left_column || []
  const rightColumn = question.right_column || []
  const correctPairs = question.correct_pairs || []
  const randomizeOptions = question.randomize_options ?? true

  const updateQuestion = (field: keyof MatchingData, value: any) => {
    onChange({ [field]: value })
  }

  const addPair = () => {
    const newLeftItem = { id: `left_${Date.now()}`, content: '', media_url: undefined }
    const newRightItem = { id: `right_${Date.now()}`, content: '', media_url: undefined }
    
    updateQuestion('left_column', [...leftColumn, newLeftItem])
    updateQuestion('right_column', [...rightColumn, newRightItem])
    updateQuestion('correct_pairs', [...correctPairs, { left_id: newLeftItem.id, right_id: newRightItem.id }])
  }

  const removePair = (index: number) => {
    if (leftColumn.length > 1) {
      const newLeftColumn = leftColumn.filter((_, i) => i !== index)
      const newRightColumn = rightColumn.filter((_, i) => i !== index)
      const newCorrectPairs = correctPairs.filter((_, i) => i !== index)
      
      updateQuestion('left_column', newLeftColumn)
      updateQuestion('right_column', newRightColumn)
      updateQuestion('correct_pairs', newCorrectPairs)
    }
  }

  const updateLeftItem = (index: number, content: string) => {
    const newLeftColumn = [...leftColumn]
    newLeftColumn[index] = { ...newLeftColumn[index], content } as MatchingItem
    updateQuestion('left_column', newLeftColumn)
  }

  const updateRightItem = (index: number, content: string) => {
    const newRightColumn = [...rightColumn]
    newRightColumn[index] = { ...newRightColumn[index], content } as MatchingItem
    updateQuestion('right_column', newRightColumn)
  }

  return (
    <Card className={`w-full ${!isValid ? 'border-red-300 bg-red-50' : ''}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-gray-500 cursor-move" />
            <ArrowRightLeft className="w-5 h-5 text-purple-600" />
            Matching Question
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Question Text (English)
            {errors.question && <span className="text-red-600 ml-1">*</span>}
          </label>
          <TextareaInput
            value={question.question || ''}
            onChange={(e) => onChange({ question: e.target.value })}
            placeholder="Enter the question text..."
            className={errors.question ? 'border-red-300' : ''}
          />
          {errors.question && <p className="text-sm text-red-600 mt-1">{errors.question}</p>}
        </div>

        {/* Matching Pairs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-base font-medium">Matching Pairs</span>
            <Button 
              onClick={addPair}
              size="sm"
              variant="outline"
              className="h-8"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Pair
            </Button>
          </div>
          
          <p className="text-sm text-gray-700">
            Create pairs that students need to match. Left items will be shown on the left, right items on the right.
          </p>

          <div className="space-y-3">
            {leftColumn.map((leftItem, index) => {
              const rightItem = rightColumn[index]
              if (!rightItem) return null
              
              return (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="flex-1">
                    <span className="text-xs text-gray-600">Left Item</span>
                    <TextInput
                      placeholder="Enter left item..."
                      value={leftItem.content}
                      onChange={(e) => updateLeftItem(index, e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <ArrowRightLeft className="w-4 h-4 text-gray-500 flex-shrink-0 mt-5" />
                  
                  <div className="flex-1">
                    <span className="text-xs text-gray-600">Right Item</span>
                    <TextInput
                      placeholder="Enter right item..."
                      value={rightItem.content}
                      onChange={(e) => updateRightItem(index, e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  {leftColumn.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removePair(index)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0 mt-5"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Options */}
        <div className="space-y-4 pt-4 border-t">
          <span className="text-base font-medium">Options</span>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium">Randomize Options</span>
                <p className="text-xs text-gray-600">Randomize the order of items for students</p>
              </div>
              <Switch
                checked={randomizeOptions}
                onCheckedChange={(checked) => updateQuestion('randomize_options', checked)}
              />
            </div>
          </div>
        </div>

        {/* Points */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Points
            {errors.points && <span className="text-red-600 ml-1">*</span>}
          </label>
          <TextInput
            type="number"
            placeholder="Enter points for this question"
            value={question.points?.toString() || ''}
            onChange={(e) => onChange({ points: parseInt(e.target.value) || 0 })}
          />
          {errors.points && <p className="text-sm text-red-600 mt-1">{errors.points}</p>}
        </div>

        {/* Explanation */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Explanation (Optional)</label>
          <TextareaInput
            placeholder="Provide an explanation for the correct matches..."
            value={question.explanation || ''}
            onChange={(e) => onChange({ explanation: e.target.value })}
          />
        </div>
      </CardContent>
    </Card>
  )
}
