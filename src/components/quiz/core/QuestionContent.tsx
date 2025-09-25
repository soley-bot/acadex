'use client'

import { useMemo } from 'react'
import { MatchingQuestion } from '@/components/student/quiz/MatchingQuestion'
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
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// Sortable Item Component for Drag & Drop
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
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 999 : 1,
  }

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className={`touch-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
    >
      <div className="bg-white p-4 border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 select-none touch-manipulation">
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

export function QuestionContent({ 
  question, 
  answer, 
  onAnswerChange, 
  submitting, 
  quizAttemptId 
}: QuestionContentProps) {
  
  // Drag & Drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  return (
    <div className="space-y-2 mb-5">
      {/* Multiple Choice / Single Choice */}
      {(question.question_type === 'multiple_choice' || question.question_type === 'single_choice') && Array.isArray(question.options) && (
        <>
          {(question.options as string[]).map((option, index) => (
            <label
              key={index}
              className={`flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                answer === index
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 bg-white hover:border-red-300 hover:bg-red-25'
              }`}
            >
              <div className={`flex items-center justify-center w-5 h-5 rounded-full border-2 transition-all ${
                answer === index
                  ? 'border-primary bg-primary/50'
                  : 'border-gray-400 bg-white'
              }`}>
                {answer === index && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </div>
              <input
                type="radio"
                name={`question-${question.id}`}
                value={index}
                checked={answer === index}
                onChange={() => onAnswerChange(question.id, index)}
                className="sr-only"
              />
              <span className="text-base text-gray-800 flex-1">
                {option}
              </span>
            </label>
          ))}
        </>
      )}

      {/* True/False */}
      {question.question_type === 'true_false' && (
        <>
          {['True', 'False'].map((option, index) => (
            <label
              key={index}
              className={`flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                answer === index
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 bg-white hover:border-red-300 hover:bg-red-25'
              }`}
            >
              <div className={`flex items-center justify-center w-5 h-5 rounded-full border-2 transition-all ${
                answer === index
                  ? 'border-primary bg-primary/50'
                  : 'border-gray-400 bg-white'
              }`}>
                {answer === index && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </div>
              <input
                type="radio"
                name={`question-${question.id}`}
                value={index}
                checked={answer === index}
                onChange={() => onAnswerChange(question.id, index)}
                className="sr-only"
              />
              <span className="text-base text-gray-800 flex-1 font-medium">
                {option}
              </span>
            </label>
          ))}
        </>
      )}

      {/* Fill in the Blank */}
      {question.question_type === 'fill_blank' && (
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Type your answer here..."
            value={answer || ''}
            onChange={(e) => onAnswerChange(question.id, e.target.value)}
            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all text-base md:text-lg bg-white shadow-sm hover:shadow-md touch-manipulation"
            style={{ 
              minHeight: '48px',
              fontSize: '16px',
              touchAction: 'manipulation'
            }}
            autoComplete="off"
            spellCheck="true"
            autoCapitalize="sentences"
          />
          <div className="text-xs text-gray-500 flex items-center gap-1">
            💡 <span>Tip: Your answer will be auto-saved as you type</span>
          </div>
        </div>
      )}

      {/* Essay */}
      {question.question_type === 'essay' && (
        <div className="space-y-3">
          <textarea
            placeholder="Write your essay answer here..."
            value={answer || ''}
            onChange={(e) => onAnswerChange(question.id, e.target.value)}
            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all text-base md:text-lg resize-none bg-white shadow-sm hover:shadow-md touch-manipulation"
            rows={6}
            style={{ 
              minHeight: '120px',
              fontSize: '16px',
              touchAction: 'manipulation',
              lineHeight: '1.5'
            }}
            autoComplete="off"
            spellCheck="true"
            autoCapitalize="sentences"
          />
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1">
              💡 <span>Take your time to provide a detailed answer</span>
            </div>
            <div className="flex items-center gap-1">
              <span>Words: {(answer || '').split(' ').filter((word: string) => word.length > 0).length}</span>
            </div>
          </div>
        </div>
      )}

      {/* Matching */}
      {question.question_type === 'matching' && Array.isArray(question.options) && quizAttemptId && (
        <MatchingQuestion
          question={{
            id: question.id,
            question: question.question,
            options: question.options as Array<{left: string; right: string}>
          }}
          userAnswer={answer || {}}
          onAnswerChange={onAnswerChange}
          quizAttemptId={quizAttemptId}
          isSubmitted={submitting}
        />
      )}

      {/* Ordering */}
      {question.question_type === 'ordering' && Array.isArray(question.options) && (
        <div className="space-y-4">
          {(() => {
            // Detect if this is sentence ordering (short words) vs list ordering
            const avgWordLength = (question.options as string[]).reduce((sum, word) => sum + word.length, 0) / question.options.length;
            const isSentenceOrdering = avgWordLength < 8 && (question.options as string[]).length <= 8;
            
            // Get current order from answers
            const currentAnswer = answer || {};
            
            // Convert answer format to sortable array
            const sortedItems = Array.from({ length: question.options.length }, (_, position) => {
              const itemIndex = Object.keys(currentAnswer).find(
                idx => currentAnswer[idx] === position + 1
              );
              return itemIndex ? {
                id: `item-${itemIndex}`,
                content: (question.options as string[])[parseInt(itemIndex)],
                originalIndex: parseInt(itemIndex)
              } : null;
            }).filter(Boolean) as Array<{id: string; content: string; originalIndex: number}>;
            
            // Get unplaced items
            const placedIndices = new Set(sortedItems.map(item => item.originalIndex));
            const unplacedItems = (question.options as string[])
              .map((content, index) => ({ 
                id: `item-${index}`, 
                content, 
                originalIndex: index 
              }))
              .filter(item => !placedIndices.has(item.originalIndex));

            const handleDragEnd = (event: DragEndEvent) => {
              const { active, over } = event;
              
              if (!over) return;

              const activeId = active.id as string;
              const overId = over.id as string;

              // Handle drag within sorted area
              if (activeId !== overId && sortedItems.find(item => item.id === activeId)) {
                const oldIndex = sortedItems.findIndex(item => item.id === activeId);
                const newIndex = sortedItems.findIndex(item => item.id === overId);
                
                const newSortedItems = arrayMove(sortedItems, oldIndex, newIndex);
                
                // Convert back to answer format
                const newAnswer: Record<string, number> = {};
                newSortedItems.forEach((item, position) => {
                  newAnswer[item.originalIndex] = position + 1;
                });
                
                onAnswerChange(question.id, newAnswer);
              }
            };

            const addToOrder = (item: {id: string; content: string; originalIndex: number}) => {
              const newAnswer = { ...currentAnswer };
              newAnswer[item.originalIndex] = sortedItems.length + 1;
              onAnswerChange(question.id, newAnswer);
            };

            const removeFromOrder = (item: {id: string; content: string; originalIndex: number}) => {
              const newAnswer = { ...currentAnswer };
              const removedPosition = newAnswer[item.originalIndex];
              delete newAnswer[item.originalIndex];
              
              // Shift other items down
              Object.keys(newAnswer).forEach(key => {
                if (newAnswer[key] > removedPosition) {
                  newAnswer[key]--;
                }
              });
              
              onAnswerChange(question.id, newAnswer);
            };
            
            if (isSentenceOrdering) {
              // Word Pill Component for sentence ordering
              const WordPill = ({ 
                item, 
                isInSentence = false, 
                onClick 
              }: { 
                item: {id: string; content: string; originalIndex: number};
                isInSentence?: boolean;
                onClick: () => void;
              }) => {
                const {
                  attributes,
                  listeners,
                  setNodeRef,
                  transform,
                  transition,
                  isDragging,
                } = useSortable({ 
                  id: item.id,
                  disabled: !isInSentence
                });

                const style = {
                  transform: CSS.Transform.toString(transform),
                  transition,
                  opacity: isDragging ? 0.5 : 1,
                };

                return (
                  <button
                    ref={setNodeRef}
                    onClick={onClick}
                    className={`
                      px-4 py-2 rounded-full font-medium min-h-[44px] 
                      touch-manipulation cursor-pointer select-none
                      transition-all duration-200 
                      ${isInSentence 
                        ? 'bg-primary hover:bg-secondary text-white hover:text-black active:bg-secondary active:text-black' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700 active:bg-gray-300'
                      }
                      ${isDragging ? 'shadow-lg scale-105 z-50' : 'hover:scale-102 active:scale-95'}
                      ${isInSentence ? 'hover:shadow-md touch-action-none' : ''}
                    `}
                    {...(isInSentence ? { 
                      ...attributes, 
                      ...listeners,
                      style: { 
                        ...style, 
                        touchAction: 'none'
                      }
                    } : { style })}
                    aria-label={isInSentence ? `${item.content} - click to remove or drag to reorder` : `${item.content} - click to add`}
                  >
                    {item.content}
                  </button>
                );
              };

              return (
                <>
                  {/* Sentence Building Area */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border-2 border-blue-200">
                    <h4 className="font-semibold text-sm text-gray-800 mb-3">Build your sentence:</h4>
                    
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext 
                        items={sortedItems.map(item => item.id)} 
                        strategy={horizontalListSortingStrategy}
                      >
                        <div className="min-h-[80px] border-2 border-dashed border-blue-300 rounded-lg p-4 flex flex-wrap gap-2 items-center bg-white">
                          {sortedItems.length === 0 ? (
                            <div className="text-center text-gray-400 py-4 w-full">
                              Click words below to build your sentence
                            </div>
                          ) : (
                            sortedItems.map((item) => (
                              <WordPill 
                                key={item.id} 
                                item={item}
                                isInSentence={true}
                                onClick={() => removeFromOrder(item)}
                              />
                            ))
                          )}
                        </div>
                      </SortableContext>
                    </DndContext>
                    
                    {/* Sentence Preview */}
                    {sortedItems.length > 0 && (
                      <div className="mt-3 p-3 bg-blue-100 rounded-lg">
                        <span className="text-sm font-medium text-blue-800">Preview: </span>
                        <span className="text-base text-blue-900">
                          &ldquo;{sortedItems.map(item => item.content).join(' ')}&rdquo;
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Available Words */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-sm text-gray-800 mb-3">Available words:</h4>
                    <div className="flex flex-wrap gap-2">
                      {unplacedItems.map((item) => (
                        <WordPill
                          key={item.id}
                          item={item}
                          isInSentence={false}
                          onClick={() => addToOrder(item)}
                        />
                      ))}
                    </div>
                  </div>
                </>
              );
            } else {
              // List Ordering with Drag & Drop
              return (
                <>
                  <DndContext 
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    {/* Current Order Display */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-sm text-gray-800 mb-3">Your Current Order:</h4>
                      
                      {sortedItems.length > 0 ? (
                        <SortableContext 
                          items={sortedItems.map(item => item.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="space-y-2">
                            {sortedItems.map((item, index) => (
                              <SortableItem key={item.id} id={item.id}>
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center justify-center w-8 h-8 bg-primary text-white text-sm font-bold rounded-full">
                                    {index + 1}
                                  </div>
                                  <span className="flex-1 text-base">{item.content}</span>
                                  <button
                                    onClick={() => removeFromOrder(item)}
                                    className="text-red-500 hover:text-red-700 p-1"
                                  >
                                    ✕
                                  </button>
                                </div>
                              </SortableItem>
                            ))}
                          </div>
                        </SortableContext>
                      ) : (
                        <div className="text-gray-400 italic text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                          Drag items here to create your ordered list
                        </div>
                      )}
                    </div>
                  </DndContext>
                  
                  {/* Available Items */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-sm text-gray-800 mb-3">Available Items:</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {unplacedItems.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => addToOrder(item)}
                          className="w-full text-left p-3 border-2 border-gray-300 bg-white rounded-lg transition-all hover:border-primary hover:bg-primary/5 touch-manipulation"
                          style={{ minHeight: '44px' }}
                        >
                          <span className="text-sm">{item.content}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              );
            }
          })()}
        </div>
      )}
    </div>
  )
}

export default QuestionContent
