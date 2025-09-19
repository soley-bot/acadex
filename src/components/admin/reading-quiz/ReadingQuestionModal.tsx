'use client'

import React, { useState } from 'react'
import { X, Plus, CheckSquare, Square } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ReadingQuestionModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateQuestion: (questionType: string) => void
}

const readingQuestionTypes = [
  {
    type: 'multiple_choice',
    label: 'Multiple Choice',
    description: 'Students select one or more correct answers from a list',
    icon: CheckSquare,
    color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
    iconColor: 'text-blue-600'
  },
  {
    type: 'true_false',
    label: 'True/False',
    description: 'Students choose between true or false',
    icon: Square,
    color: 'bg-green-50 border-green-200 hover:bg-green-100',
    iconColor: 'text-green-600'
  }
]

export const ReadingQuestionModal: React.FC<ReadingQuestionModalProps> = ({
  isOpen,
  onClose,
  onCreateQuestion
}) => {
  const [selectedType, setSelectedType] = useState<string>('')

  if (!isOpen) return null

  const handleCreateQuestion = () => {
    if (selectedType) {
      onCreateQuestion(selectedType)
      setSelectedType('')
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-xl max-w-xl w-full mx-4 max-h-[90vh] overflow-y-auto border">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Add Reading Question</h2>
            <p className="text-muted-foreground mt-1">Choose the type of question for your reading comprehension</p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Question Type Selection */}
        <div className="p-6">
          <div className="grid grid-cols-1 gap-4">
            {readingQuestionTypes.map((questionType) => {
              const IconComponent = questionType.icon
              const isSelected = selectedType === questionType.type
              
              return (
                <Card
                  key={questionType.type}
                  className={`cursor-pointer transition-all border-2 ${
                    isSelected 
                      ? 'ring-2 ring-primary bg-primary/5 border-primary' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedType(questionType.type)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-lg ${
                        isSelected ? 'bg-primary text-primary-foreground' : `bg-muted ${questionType.iconColor}`
                      }`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold text-lg ${
                          isSelected ? 'text-primary' : 'text-foreground'
                        }`}>
                          {questionType.label}
                        </h3>
                        <p className="text-muted-foreground mt-1">
                          {questionType.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {selectedType && (
            <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-primary rounded-full"></div>
                <span className="text-sm text-primary font-medium">
                  Selected: {readingQuestionTypes.find(t => t.type === selectedType)?.label}
                </span>
              </div>
              <p className="text-sm text-primary/80 mt-1">
                {readingQuestionTypes.find(t => t.type === selectedType)?.description}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t bg-muted/30">
          <button
            onClick={onClose}
            className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <Button
            onClick={handleCreateQuestion}
            disabled={!selectedType}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Question
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ReadingQuestionModal