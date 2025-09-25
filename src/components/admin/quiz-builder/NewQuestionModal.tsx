'use client'

import React, { useState } from 'react'
import { X, Plus, BookOpen, CheckSquare, Square, Edit, List, ArrowUpDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { QuizQuestion } from '@/lib/supabase'

interface NewQuestionModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateQuestion: (questionType: string) => void
}

const questionTypes = [
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
  },
  {
    type: 'fill_blank',
    label: 'Fill in the Blank',
    description: 'Students type in missing words or phrases',
    icon: Edit,
    color: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100',
    iconColor: 'text-yellow-600'
  },
  {
    type: 'essay',
    label: 'Essay Question',
    description: 'Students write a detailed response',
    icon: BookOpen,
    color: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
    iconColor: 'text-purple-600'
  },
  {
    type: 'matching',
    label: 'Matching',
    description: 'Students match items from two columns',
    icon: List,
    color: 'bg-pink-50 border-pink-200 hover:bg-pink-100',
    iconColor: 'text-pink-600'
  },
  {
    type: 'ordering',
    label: 'Ordering',
    description: 'Students arrange items in the correct order',
    icon: ArrowUpDown,
    color: 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100',
    iconColor: 'text-indigo-600'
  }
]

export const NewQuestionModal: React.FC<NewQuestionModalProps> = ({
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
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Add New Question</h2>
            <p className="text-gray-600 mt-1">Choose the type of question you want to create</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Question Type Selection */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {questionTypes.map((questionType) => {
              const IconComponent = questionType.icon
              const isSelected = selectedType === questionType.type
              
              return (
                <Card
                  key={questionType.type}
                  className={`cursor-pointer transition-all ${
                    isSelected 
                      ? 'ring-2 ring-primary bg-primary/5 border-primary' 
                      : questionType.color
                  }`}
                  onClick={() => setSelectedType(questionType.type)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${
                        isSelected ? 'bg-primary text-white' : `bg-white ${questionType.iconColor}`
                      }`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-medium ${
                          isSelected ? 'text-primary' : 'text-gray-900'
                        }`}>
                          {questionType.label}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
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
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                <span className="text-sm text-blue-800 font-medium">
                  Selected: {questionTypes.find(t => t.type === selectedType)?.label}
                </span>
              </div>
              <p className="text-sm text-blue-700 mt-1">
                {questionTypes.find(t => t.type === selectedType)?.description}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>
          <Button
            onClick={handleCreateQuestion}
            disabled={!selectedType}
            className="bg-primary hover:bg-secondary text-white hover:text-black"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Question
          </Button>
        </div>
      </div>
    </div>
  )
}

export default NewQuestionModal

