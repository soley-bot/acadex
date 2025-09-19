'use client'

import { useMemo } from 'react'
import { Check, Circle, Square, Type, Volume2, Image, Video, AlertCircle } from 'lucide-react'
import { 
  DndContext, 
  closestCenter, 
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// Enhanced Sortable Item Component
interface SortableItemProps {
  id: string
  children: React.ReactNode
}

function SortableItem({ id, children }: SortableItemProps) {
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
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1000 : 1,
  }

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className={`touch-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
    >
      <div className="bg-white p-4 border-2 border-gray-300 rounded-xl shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200 select-none touch-manipulation">
        {children}
      </div>
    </div>
  )
}

interface Question {
  id: string
  question: string
  options: any[]
  correct_answer: string | number | number[]
  explanation?: string
  question_type: 'multiple_choice' | 'single_choice' | 'true_false' | 'fill_blank' | 'essay' | 'matching' | 'ordering'
  points?: number
  media_url?: string
  media_type?: 'image' | 'audio' | 'video'
}

interface QuestionContentProps {
  question: Question
  answer: any
  onAnswerChange: (questionId: string, answer: any) => void
  submitting: boolean
  quizAttemptId: string
}

export function QuestionContentNew({ 
  question, 
  answer, 
  onAnswerChange, 
  submitting, 
  quizAttemptId 
}: QuestionContentProps) {
  
  // Enhanced Drag & Drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 10,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  return (
    <div className="space-y-4">
      {/* Question Text with Enhanced Styling */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 leading-relaxed mb-4">
          {question.question}
        </h3>
        
        {/* Media Content */}
        {question.media_url && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            {question.media_type === 'image' && (
              <div className="flex items-center gap-2 mb-2">
                <Image className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Reference Image</span>
              </div>
            )}
            {question.media_type === 'audio' && (
              <div className="flex items-center gap-2 mb-2">
                <Volume2 className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Audio Content</span>
              </div>
            )}
            {question.media_type === 'video' && (
              <div className="flex items-center gap-2 mb-2">
                <Video className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Video Content</span>
              </div>
            )}
            
            {question.media_type === 'image' && (
              <img 
                src={question.media_url} 
                alt="Question media"
                className="max-w-full h-auto rounded-lg shadow-sm"
              />
            )}
            
            {question.media_type === 'audio' && (
              <audio 
                controls 
                className="w-full"
                src={question.media_url}
              >
                Your browser does not support the audio element.
              </audio>
            )}
            
            {question.media_type === 'video' && (
              <video 
                controls 
                className="w-full max-h-96 rounded-lg"
                src={question.media_url}
              >
                Your browser does not support the video element.
              </video>
            )}
          </div>
        )}

        {/* Points Display */}
        {question.points && (
          <div className="flex items-center gap-2 text-sm text-blue-600 font-medium mb-4">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            <span>{question.points} point{question.points !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Enhanced Answer Options */}
      <div className="space-y-3">
        {/* Multiple Choice / Single Choice with improved styling */}
        {(question.question_type === 'multiple_choice' || question.question_type === 'single_choice') && Array.isArray(question.options) && (
          <>
            {(question.options as string[]).map((option, index) => {
              const isSelected = Array.isArray(answer) ? answer.includes(index) : answer === index
              const optionLabel = String.fromCharCode(65 + index) // A, B, C, D...
              
              return (
                <label
                  key={index}
                  className={`flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 shadow-sm'
                      : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-25'
                  }`}
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 font-semibold text-sm transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-500 text-white'
                      : 'border-gray-400 bg-white text-gray-600'
                  }`}>
                    {optionLabel}
                  </div>
                  
                  <input
                    type={question.question_type === 'multiple_choice' ? 'checkbox' : 'radio'}
                    name={`question-${question.id}`}
                    value={index}
                    checked={isSelected}
                    onChange={(e) => {
                      if (question.question_type === 'multiple_choice') {
                        const currentAnswers = Array.isArray(answer) ? [...answer] : []
                        if (e.target.checked) {
                          onAnswerChange(question.id, [...currentAnswers, index])
                        } else {
                          onAnswerChange(question.id, currentAnswers.filter(a => a !== index))
                        }
                      } else {
                        onAnswerChange(question.id, index)
                      }
                    }}
                    className="sr-only"
                    disabled={submitting}
                  />
                  
                  <span className="text-base text-gray-800 flex-1 leading-relaxed pt-1">
                    {option}
                  </span>
                </label>
              )
            })}
            
            {/* Instruction text */}
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {question.question_type === 'multiple_choice' 
                  ? 'Select all correct answers' 
                  : 'Select the best answer'}
              </p>
            </div>
          </>
        )}

        {/* Enhanced True/False */}
        {question.question_type === 'true_false' && (
          <>
            {[true, false].map((option) => (
              <label
                key={option.toString()}
                className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                  answer === option
                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-25'
                }`}
              >
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 font-semibold text-sm transition-all ${
                  answer === option
                    ? 'border-blue-500 bg-blue-500 text-white'
                    : 'border-gray-400 bg-white text-gray-600'
                }`}>
                  {option ? '✓' : '✗'}
                </div>
                
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option.toString()}
                  checked={answer === option}
                  onChange={() => onAnswerChange(question.id, option)}
                  className="sr-only"
                  disabled={submitting}
                />
                
                <span className="text-lg font-medium text-gray-800">
                  {option ? 'True' : 'False'}
                </span>
              </label>
            ))}
            
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Select True or False for the statement above
              </p>
            </div>
          </>
        )}

        {/* Enhanced Fill in the Blank */}
        {question.question_type === 'fill_blank' && (
          <div className="space-y-3">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Type className="w-4 h-4" />
                Your Answer
              </label>
              <input
                type="text"
                value={answer || ''}
                onChange={(e) => onAnswerChange(question.id, e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-0 text-base"
                placeholder="Type your answer here..."
                disabled={submitting}
              />
            </div>
            
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Enter the missing word or phrase that completes the statement
              </p>
            </div>
          </div>
        )}

        {/* Enhanced Essay Question */}
        {question.question_type === 'essay' && (
          <div className="space-y-3">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Type className="w-4 h-4" />
                Your Essay Response
              </label>
              <textarea
                value={answer || ''}
                onChange={(e) => onAnswerChange(question.id, e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-0 text-base min-h-[120px] resize-y"
                placeholder="Write your detailed response here..."
                disabled={submitting}
              />
              <div className="mt-2 text-xs text-gray-500">
                {answer ? `${answer.length} characters` : '0 characters'}
              </div>
            </div>
            
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Provide a detailed, well-structured response to the question above
              </p>
            </div>
          </div>
        )}

        {/* Enhanced Matching Questions - Simplified for better UX */}
        {question.question_type === 'matching' && Array.isArray(question.options) && (
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
              <p className="text-sm text-blue-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Match each item on the left with the correct item on the right
              </p>
            </div>
            
            <div className="space-y-3">
              {(question.options as Array<{left: string, right: string}>).map((pair, index) => {
                const userChoice = answer?.[index] || null
                
                return (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <span className="font-medium text-gray-900">{pair.left}</span>
                      </div>
                      
                      <div className="text-gray-400 text-xl">↔</div>
                      
                      <div className="flex-1">
                        <select
                          value={userChoice || ''}
                          onChange={(e) => {
                            const newAnswer = { ...answer }
                            if (e.target.value) {
                              newAnswer[index] = parseInt(e.target.value)
                            } else {
                              delete newAnswer[index]
                            }
                            onAnswerChange(question.id, newAnswer)
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500"
                          disabled={submitting}
                        >
                          <option value="">Select match...</option>
                          {(question.options as Array<{left: string, right: string}>).map((option, rightIndex) => (
                            <option key={rightIndex} value={rightIndex}>
                              {option.right}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Enhanced Ordering Questions */}
        {question.question_type === 'ordering' && Array.isArray(question.options) && (
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
              <p className="text-sm text-blue-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Drag and drop the items below to arrange them in the correct order
              </p>
            </div>
            
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={(event: DragEndEvent) => {
                const { active, over } = event
                if (active.id !== over?.id) {
                  const currentOrder = answer || question.options.map((_, index) => index)
                  const oldIndex = currentOrder.indexOf(Number(active.id))
                  const newIndex = currentOrder.indexOf(Number(over?.id))
                  
                  const newOrder = arrayMove(currentOrder, oldIndex, newIndex)
                  onAnswerChange(question.id, newOrder)
                }
              }}
            >
              <SortableContext 
                items={answer || question.options.map((_, index) => index)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {(answer || question.options.map((_, index) => index)).map((itemIndex: number, position: number) => (
                    <SortableItem key={itemIndex} id={itemIndex.toString()}>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full font-semibold text-sm">
                          {position + 1}
                        </div>
                        <span className="text-base text-gray-800 flex-1">
                          {question.options[itemIndex]}
                        </span>
                        <div className="text-gray-400 text-sm">
                          ⋮⋮ Drag to reorder
                        </div>
                      </div>
                    </SortableItem>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        )}
      </div>
      
      {/* Answer Status Indicator */}
      {answer !== undefined && answer !== null && answer !== '' && (
        <div className="mt-6 flex items-center gap-2 text-green-600 text-sm font-medium">
          <Check className="w-4 h-4" />
          <span>Answer saved</span>
        </div>
      )}
    </div>
  )
}