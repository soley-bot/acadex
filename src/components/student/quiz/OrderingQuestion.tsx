/**
 * Modern Ordering Question Component with Randomization
 * Implements drag-and-drop with randomized item order
 */

'use client'

import React, { useState, useEffect } from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent } from '@/components/ui/card'
import { GripVertical, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { randomizeOrderingQuestion, convertOrderingAnswerToOriginal, type RandomizedOrderingData } from '@/utils/questionRandomization'

interface OrderingQuestionProps {
  question: {
    id: string
    question: string
    options: string[]
  }
  userAnswer?: Record<string, number>
  onAnswerChange: (questionId: string, answer: Record<string, number>) => void
  quizAttemptId: string
  isSubmitted?: boolean
  showCorrectAnswer?: boolean
  isReview?: boolean
}

interface SortableItemProps {
  id: string
  content: string
  position: number
  totalItems: number
  isCorrectPosition?: boolean
  isSubmitted: boolean
}

function SortableItem({ id, content, position, totalItems, isCorrectPosition, isSubmitted }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        flex items-center p-4 border-2 rounded-lg transition-all duration-200
        ${isDragging 
          ? 'shadow-lg border-primary bg-primary/5 z-50' 
          : isSubmitted
          ? isCorrectPosition === true
            ? 'border-green-400 bg-green-50'
            : isCorrectPosition === false
            ? 'border-red-400 bg-red-50'
            : 'border-gray-300 bg-white'
          : 'border-gray-300 bg-white hover:border-primary/50 hover:bg-primary/5'
        }
      `}
    >
      {/* Drag Handle */}
      {!isSubmitted && (
        <div
          {...attributes}
          {...listeners}
          className="mr-3 p-1 rounded hover:bg-gray-100 cursor-grab active:cursor-grabbing"
          aria-label="Drag to reorder"
        >
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>
      )}
      
      {/* Position Indicator */}
      <div className={`
        flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold mr-4
        ${isSubmitted
          ? isCorrectPosition === true
            ? 'bg-green-100 text-green-700 border border-green-300'
            : isCorrectPosition === false
            ? 'bg-red-100 text-red-700 border border-red-300'
            : 'bg-gray-100 text-gray-700 border border-gray-300'
          : 'bg-primary/10 text-primary border border-primary/30'
        }
      `}>
        {position}
      </div>
      
      {/* Content */}
      <div className="flex-1">
        <span className="text-sm font-medium text-gray-800">
          {content}
        </span>
      </div>
      
      {/* Correct/Incorrect Indicator */}
      {isSubmitted && isCorrectPosition !== undefined && (
        <div className="flex-shrink-0 ml-3">
          {isCorrectPosition ? (
            <span className="text-green-600 text-lg">✓</span>
          ) : (
            <span className="text-red-600 text-lg">✗</span>
          )}
        </div>
      )}
    </div>
  )
}

export function OrderingQuestion({
  question,
  userAnswer = {},
  onAnswerChange,
  quizAttemptId,
  isSubmitted = false,
  showCorrectAnswer = false,
  isReview = false
}: OrderingQuestionProps) {
  const [randomizedData, setRandomizedData] = useState<RandomizedOrderingData | null>(null)
  const [orderedItems, setOrderedItems] = useState<Array<{
    id: string
    content: string
    originalIndex: number
    correctPosition: number
  }>>([])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Initialize randomized data on mount
  useEffect(() => {
    if (question.options.length > 0) {
      const data = randomizeOrderingQuestion(question.options, quizAttemptId, question.id)
      setRandomizedData(data)
      
      // Initialize ordered items from randomized data
      const initialItems = data.items.map(item => ({
        id: `item-${item.displayIndex}`,
        content: item.content,
        originalIndex: item.originalIndex,
        correctPosition: item.correctPosition
      }))
      
      setOrderedItems(initialItems)
    }
  }, [question.options, quizAttemptId, question.id])

  // Restore user's previous ordering
  useEffect(() => {
    if (!randomizedData || Object.keys(userAnswer).length === 0 || orderedItems.length === 0) return

    // Convert user answer back to display order
    const restoredOrder = [...orderedItems]
    
    // Sort based on user's position assignments
    restoredOrder.sort((a, b) => {
      const aOriginalIndex = randomizedData.items.find(item => 
        item.displayIndex === parseInt(a.id.replace('item-', ''))
      )?.originalIndex ?? 0
      
      const bOriginalIndex = randomizedData.items.find(item => 
        item.displayIndex === parseInt(b.id.replace('item-', ''))
      )?.originalIndex ?? 0
      
      const aPosition = userAnswer[aOriginalIndex.toString()] ?? 999
      const bPosition = userAnswer[bOriginalIndex.toString()] ?? 999
      
      return aPosition - bPosition
    })
    
    setOrderedItems(restoredOrder)
  }, [randomizedData, userAnswer, orderedItems])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (!over || !randomizedData) return
    
    if (active.id !== over.id) {
      const oldIndex = orderedItems.findIndex(item => item.id === active.id)
      const newIndex = orderedItems.findIndex(item => item.id === over.id)
      
      const newOrderedItems = arrayMove(orderedItems, oldIndex, newIndex)
      setOrderedItems(newOrderedItems)
      
      // Convert to answer format (position-based)
      const newAnswer: Record<string, number> = {}
      newOrderedItems.forEach((item, position) => {
        newAnswer[item.originalIndex.toString()] = position + 1
      })
      
      onAnswerChange(question.id, newAnswer)
    }
  }

  const handleReset = () => {
    if (!randomizedData) return
    
    // Reset to original randomized order
    const resetItems = randomizedData.items.map(item => ({
      id: `item-${item.displayIndex}`,
      content: item.content,
      originalIndex: item.originalIndex,
      correctPosition: item.correctPosition
    }))
    
    setOrderedItems(resetItems)
    onAnswerChange(question.id, {})
  }

  const getItemCorrectness = (item: typeof orderedItems[0], currentPosition: number) => {
    if (!showCorrectAnswer) return undefined
    return currentPosition === item.correctPosition
  }

  if (!randomizedData) {
    return <div className="flex justify-center p-8">Loading...</div>
  }

  // Detect if this is sentence ordering vs list ordering
  const avgWordLength = question.options.reduce((sum, word) => sum + word.length, 0) / question.options.length
  const isSentenceOrdering = avgWordLength < 8 && question.options.length <= 8

  return (
        <Card variant="elevated" className="p-6">
      <CardContent className="space-y-6">
        {/* Instructions */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <p className="text-sm text-primary font-medium mb-2">
            <strong>Instructions:</strong>
          </p>
          <p className="text-sm text-primary/80">
            {isSentenceOrdering 
              ? "Drag and drop the words to form the correct sentence order."
              : "Drag and drop the items to arrange them in the correct order."
            }
          </p>
        </div>

        {/* Ordering Interface */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-800 text-sm">
              {isSentenceOrdering ? "Arrange the words:" : "Order the items:"}
            </h4>
            {!isSubmitted && orderedItems.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="text-xs"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Reset Order
              </Button>
            )}
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={orderedItems.map(item => item.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {orderedItems.map((item, index) => (
                  <SortableItem
                    key={item.id}
                    id={item.id}
                    content={item.content}
                    position={index + 1}
                    totalItems={orderedItems.length}
                    isCorrectPosition={getItemCorrectness(item, index + 1)}
                    isSubmitted={isSubmitted}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        {/* Progress indicator */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">
              {isSentenceOrdering ? "Words arranged" : "Items ordered"}: {orderedItems.length} of {orderedItems.length}
            </span>
            {showCorrectAnswer && (
              <span className="text-primary font-medium">
                Correct positions: {orderedItems.filter((item, index) => 
                  getItemCorrectness(item, index + 1) === true
                ).length} of {orderedItems.length}
              </span>
            )}
          </div>
        </div>

        {/* Helpful tips */}
        {!isSubmitted && (
          <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-2">
              <span className="text-blue-500">💡</span>
              <div>
                <p className="font-medium text-blue-700 mb-1">Tips:</p>
                <ul className="space-y-1 text-blue-600">
                  <li>• Items are shown in random order to test your knowledge</li>
                  <li>• Use the drag handle (⋮⋮) to reorder items</li>
                  <li>• You can also use keyboard navigation (Tab + Arrow keys)</li>
                  <li>• Click &ldquo;Reset Order&rdquo; to start over</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

