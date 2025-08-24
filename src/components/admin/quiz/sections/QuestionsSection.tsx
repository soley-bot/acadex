'use client'

import React, { useMemo } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Brain, Copy, Trash2, Eye, EyeOff } from 'lucide-react'
import { useQuizQuestions, useQuizUI } from '@/contexts/QuizContext'
import { QuestionEditor } from '../QuestionEditor'

const questionTypeLabels = {
  multiple_choice: 'Multiple Choice',
  true_false: 'True/False',
  fill_blank: 'Fill in the Blank',
  essay: 'Essay',
  matching: 'Matching',
  ordering: 'Ordering'
} as const

type QuestionType = keyof typeof questionTypeLabels

interface QuestionsSectionProps {
  onShowAIGenerator: () => void
}

export const QuestionsSection = React.memo(({ onShowAIGenerator }: QuestionsSectionProps) => {
  const { 
    questions, 
    expandedQuestions, 
    addQuestion, 
    reorderQuestions, 
    toggleQuestionExpanded 
  } = useQuizQuestions()
  const { previewMode, togglePreviewMode } = useQuizUI()

  // Memoize question type options for performance
  const questionTypeOptions = useMemo(() => 
    Object.entries(questionTypeLabels).map(([value, label]) => ({ value, label })),
    []
  )

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const sourceIndex = result.source.index
    const destinationIndex = result.destination.index

    if (sourceIndex !== destinationIndex) {
      reorderQuestions(sourceIndex, destinationIndex)
    }
  }

  const handleAddQuestion = (questionType: QuestionType = 'multiple_choice') => {
    addQuestion(questionType)
    // Auto-expand the new question
    setTimeout(() => {
      toggleQuestionExpanded(questions.length)
    }, 100)
  }

  const duplicateQuestion = (questionIndex: number) => {
    const questionToDuplicate = questions[questionIndex]
    if (questionToDuplicate) {
      const duplicatedQuestion = {
        ...questionToDuplicate,
        id: `temp_${Date.now()}`,
        question: `${questionToDuplicate.question} (Copy)`,
        order_index: questions.length
      }
      addQuestion()
      // The actual duplication logic would be handled by the context
    }
  }

  return (
    <div className="space-y-6">
      {/* Questions Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Quiz Questions ({questions.length})
          </h3>
          <p className="text-sm text-gray-600">
            Create and organize your quiz questions. Drag to reorder.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={togglePreviewMode}
            className="flex items-center gap-2"
          >
            {previewMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {previewMode ? 'Edit Mode' : 'Preview Mode'}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={onShowAIGenerator}
            className="flex items-center gap-2 text-primary border-primary hover:bg-primary hover:text-white"
          >
            <Brain className="h-4 w-4" />
            AI Generate
          </Button>
          
          <div className="relative group">
            <Button
              type="button"
              className="bg-primary hover:bg-secondary text-white hover:text-black flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Question
            </Button>
            
            {/* Question Type Dropdown */}
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <div className="p-2">
                {questionTypeOptions.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleAddQuestion(value as QuestionType)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Questions List */}
      {questions.length === 0 ? (
        <Card variant="base" className="border-2 border-dashed border-gray-300">
          <CardContent className="text-center py-12">
            <div className="max-w-sm mx-auto">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
                <Plus className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No questions yet</h3>
              <p className="text-sm text-gray-500 mb-4">
                Start building your quiz by adding your first question.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button
                  type="button"
                  onClick={() => handleAddQuestion('multiple_choice')}
                  className="bg-primary hover:bg-secondary text-white hover:text-black"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Question
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onShowAIGenerator}
                  className="border-primary text-primary hover:bg-primary hover:text-white"
                >
                  <Brain className="h-4 w-4 mr-2" />
                  Generate with AI
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="questions">
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={`space-y-4 ${
                  snapshot.isDraggingOver ? 'bg-blue-50 rounded-lg p-2' : ''
                }`}
              >
                {questions.map((question, index) => (
                  <Draggable
                    key={question.id || `question-${index}`}
                    draggableId={question.id || `question-${index}`}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`${
                          snapshot.isDragging ? 'opacity-75 rotate-2 scale-105' : ''
                        } transition-all duration-200`}
                      >
                        <QuestionCard
                          question={question}
                          questionIndex={index}
                          isExpanded={expandedQuestions.has(index)}
                          isPreviewMode={previewMode}
                          dragHandleProps={provided.dragHandleProps}
                          onToggleExpanded={() => toggleQuestionExpanded(index)}
                          onDuplicate={() => duplicateQuestion(index)}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {/* Bulk Actions */}
      {questions.length > 0 && (
        <Card variant="base" className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{questions.length}</span> question{questions.length !== 1 ? 's' : ''} total
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  // Expand all questions
                  questions.forEach((_, index) => {
                    if (!expandedQuestions.has(index)) {
                      toggleQuestionExpanded(index)
                    }
                  })
                }}
                className="text-xs"
              >
                Expand All
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  // Collapse all questions
                  questions.forEach((_, index) => {
                    if (expandedQuestions.has(index)) {
                      toggleQuestionExpanded(index)
                    }
                  })
                }}
                className="text-xs"
              >
                Collapse All
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
})

// Individual Question Card Component
const QuestionCard = React.memo(({
  question,
  questionIndex,
  isExpanded,
  isPreviewMode,
  dragHandleProps,
  onToggleExpanded,
  onDuplicate
}: {
  question: any
  questionIndex: number
  isExpanded: boolean
  isPreviewMode: boolean
  dragHandleProps?: any
  onToggleExpanded: () => void
  onDuplicate: () => void
}) => {
  const { deleteQuestion } = useQuizQuestions()

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'multiple_choice': return '☑️'
      case 'true_false': return '✅'
      case 'fill_blank': return '📝'
      case 'essay': return '📄'
      case 'matching': return '🔗'
      case 'ordering': return '📋'
      default: return '❓'
    }
  }

  return (
    <Card variant="base" className={`transition-all duration-200 ${isExpanded ? 'ring-2 ring-blue-200' : ''}`}>
      {/* Question Header */}
      <div 
        className="flex items-center justify-between p-4 border-b border-gray-100 cursor-pointer"
        onClick={onToggleExpanded}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            {...dragHandleProps}
            className="cursor-grab hover:cursor-grabbing text-gray-400 hover:text-gray-600"
            onClick={(e) => e.stopPropagation()}
          >
            ⋮⋮
          </div>
          
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
              {questionIndex + 1}
            </span>
            <span className="text-lg">{getQuestionTypeIcon(question.question_type)}</span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-gray-900 capitalize">
                {questionTypeLabels[question.question_type as keyof typeof questionTypeLabels]}
              </span>
              <span className="text-xs text-gray-500">
                • {question.points || 1} point{(question.points || 1) !== 1 ? 's' : ''}
              </span>
            </div>
            <p className="text-sm text-gray-600 truncate">
              {question.question || 'Untitled question'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onDuplicate}
            className="text-gray-400 hover:text-gray-600"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => deleteQuestion(questionIndex)}
            className="text-gray-400 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Question Content */}
      {isExpanded && (
        <div className="p-4">
          <QuestionEditor
            question={question}
            questionIndex={questionIndex}
            isPreviewMode={isPreviewMode}
          />
        </div>
      )}
    </Card>
  )
})

QuestionCard.displayName = 'QuestionCard'
QuestionsSection.displayName = 'QuestionsSection'
