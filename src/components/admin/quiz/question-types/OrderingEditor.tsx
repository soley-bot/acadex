'use client'

import React from 'react'
import { GripVertical, Trash2, Plus, ArrowUpDown, MoveUp, MoveDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TextInput, TextareaInput } from '@/components/ui/FormInputs'
import { Switch } from '@/components/ui/switch'
import { QuestionEditorProps, OrderingData, OrderingItem } from '@/types/question-types'

export function OrderingEditor({ question, onChange, onRemove, isValid, errors }: QuestionEditorProps<OrderingData>) {
  const items = question.items || []
  const correctOrder = question.correct_order || []
  const allowPartialCredit = question.allow_partial_credit ?? true

  const updateQuestion = (field: keyof OrderingData, value: any) => {
    onChange({ [field]: value })
  }

  const addItem = () => {
    const newItem = { 
      id: `item_${Date.now()}`, 
      content: '', 
      media_url: undefined 
    }
    const newItems = [...items, newItem]
    const newCorrectOrder = [...correctOrder, newItems.length - 1]
    
    updateQuestion('items', newItems)
    updateQuestion('correct_order', newCorrectOrder)
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index)
      const newCorrectOrder = newItems.map((_, i) => i)
      
      updateQuestion('items', newItems)
      updateQuestion('correct_order', newCorrectOrder)
    }
  }

  const updateItem = (index: number, content: string) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], content } as OrderingItem
    updateQuestion('items', newItems)
  }

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...items]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    
    if (targetIndex >= 0 && targetIndex < items.length && newItems[index] && newItems[targetIndex]) {
      [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]]
      updateQuestion('items', newItems)
      
      // Update correct_order to reflect new positions
      const newCorrectOrder = newItems.map((_, i) => i)
      updateQuestion('correct_order', newCorrectOrder)
    }
  }

  return (
    <Card className={`w-full ${!isValid ? 'border-red-300 bg-red-50' : ''}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-gray-500 cursor-move" />
            <ArrowUpDown className="w-5 h-5 text-green-600" />
            Ordering Question
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

        {/* Items to Order */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-base font-medium">Items to Order</span>
            <Button 
              onClick={addItem}
              size="sm"
              variant="outline"
              className="h-8"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Item
            </Button>
          </div>
          
          <p className="text-sm text-gray-700">
            Add items in the correct order. Students will need to arrange them properly.
          </p>

          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={item.id || index} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-600 text-center">#{index + 1}</span>
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveItem(index, 'up')}
                      disabled={index === 0}
                      className="h-6 w-6 p-0"
                    >
                      <MoveUp className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveItem(index, 'down')}
                      disabled={index === items.length - 1}
                      className="h-6 w-6 p-0"
                    >
                      <MoveDown className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex-1">
                  <TextInput
                    placeholder={`Enter item ${index + 1}...`}
                    value={item.content}
                    onChange={(e) => updateItem(index, e.target.value)}
                  />
                </div>

                {items.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(index)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Options */}
        <div className="space-y-4 pt-4 border-t">
          <span className="text-base font-medium">Options</span>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium">Partial Credit</span>
                <p className="text-xs text-gray-600">Award partial points for partially correct ordering</p>
              </div>
              <Switch
                checked={allowPartialCredit}
                onCheckedChange={(checked) => updateQuestion('allow_partial_credit', checked)}
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Explanation (Optional)</label>
          <TextareaInput
            placeholder="Explain why this order is correct..."
            value={question.explanation || ''}
            onChange={(e) => onChange({ explanation: e.target.value })}
          />
        </div>
      </CardContent>
    </Card>
  )
}

