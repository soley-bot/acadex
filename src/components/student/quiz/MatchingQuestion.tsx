/**
 * Modern Matching Question Component with Connected Lines Pattern
 * Implements UX best practices for intuitive matching interactions
 */

'use client'

import React, { useState, useEffect, useRef } from 'react'
import { randomizeMatchingQuestion, convertMatchingAnswerToOriginal, type RandomizedMatchingData } from '@/utils/questionRandomization'

interface MatchingQuestionProps {
  question: {
    id: string
    question: string
    options: Array<{left: string; right: string}>
  }
  userAnswer?: Record<string, number>
  onAnswerChange: (questionId: string, answer: Record<string, number>) => void
  quizAttemptId: string
  isSubmitted?: boolean
  showCorrectAnswer?: boolean
  isReview?: boolean
}

interface Connection {
  leftIndex: number
  rightIndex: number
  isCorrect?: boolean
}

export function MatchingQuestion({
  question,
  userAnswer = {},
  onAnswerChange,
  quizAttemptId,
  isSubmitted = false,
  showCorrectAnswer = false,
  isReview = false
}: MatchingQuestionProps) {
  const [randomizedData, setRandomizedData] = useState<RandomizedMatchingData | null>(null)
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null)
  const [connections, setConnections] = useState<Connection[]>([])
  const svgRef = useRef<SVGSVGElement>(null)
  const leftItemsRef = useRef<(HTMLDivElement | null)[]>([])
  const rightItemsRef = useRef<(HTMLDivElement | null)[]>([])

  // Initialize randomized data on mount
  useEffect(() => {
    if (question.options.length > 0) {
      const data = randomizeMatchingQuestion(question.options, quizAttemptId, question.id)
      setRandomizedData(data)
    }
  }, [question.options, quizAttemptId, question.id])

  // Update connections when user answer changes
  useEffect(() => {
    if (!randomizedData) return

    const newConnections: Connection[] = []
    
    Object.entries(userAnswer).forEach(([leftDisplayIndex, rightDisplayIndex]) => {
      const leftIdx = parseInt(leftDisplayIndex)
      const rightIdx = rightDisplayIndex
      
      // Check if this connection is correct (for review mode)
      let isCorrect = undefined
      if (showCorrectAnswer && randomizedData) {
        const originalLeftIndex = randomizedData.leftMapping[leftIdx]
        const originalRightIndex = randomizedData.rightMapping[rightIdx]
        isCorrect = originalLeftIndex === originalRightIndex
      }
      
      newConnections.push({
        leftIndex: leftIdx,
        rightIndex: rightIdx,
        isCorrect
      })
    })
    
    setConnections(newConnections)
  }, [userAnswer, randomizedData, showCorrectAnswer])

  // Handle clicking on left item
  const handleLeftItemClick = (displayIndex: number) => {
    if (isSubmitted && !isReview) return
    
    if (selectedLeft === displayIndex) {
      // Deselect if clicking the same item
      setSelectedLeft(null)
    } else {
      // Select new left item
      setSelectedLeft(displayIndex)
      
      // If this left item already has a connection, remove it
      const newAnswer = { ...userAnswer }
      if (newAnswer[displayIndex.toString()] !== undefined) {
        delete newAnswer[displayIndex.toString()]
        onAnswerChange(question.id, newAnswer)
      }
    }
  }

  // Handle clicking on right item
  const handleRightItemClick = (displayIndex: number) => {
    if (isSubmitted && !isReview) return
    if (selectedLeft === null) return
    
    // Remove any existing connection to this right item
    const newAnswer = { ...userAnswer }
    Object.keys(newAnswer).forEach(leftKey => {
      if (newAnswer[leftKey] === displayIndex) {
        delete newAnswer[leftKey]
      }
    })
    
    // Create new connection
    newAnswer[selectedLeft.toString()] = displayIndex
    onAnswerChange(question.id, newAnswer)
    
    // Clear selection
    setSelectedLeft(null)
  }

  // Get connection line coordinates
  const getConnectionCoordinates = (leftIndex: number, rightIndex: number) => {
    const leftElement = leftItemsRef.current[leftIndex]
    const rightElement = rightItemsRef.current[rightIndex]
    const svg = svgRef.current
    
    if (!leftElement || !rightElement || !svg) return null
    
    const svgRect = svg.getBoundingClientRect()
    const leftRect = leftElement.getBoundingClientRect()
    const rightRect = rightElement.getBoundingClientRect()
    
    return {
      x1: leftRect.right - svgRect.left,
      y1: leftRect.top + leftRect.height / 2 - svgRect.top,
      x2: rightRect.left - svgRect.left,
      y2: rightRect.top + rightRect.height / 2 - svgRect.top
    }
  }

  // Check if a right item is already connected
  const isRightItemConnected = (displayIndex: number) => {
    return Object.values(userAnswer).includes(displayIndex)
  }

  // Check if a left item is connected
  const isLeftItemConnected = (displayIndex: number) => {
    return userAnswer[displayIndex.toString()] !== undefined
  }

  if (!randomizedData) {
    return <div className="flex justify-center p-8">Loading...</div>
  }

  return (
    <div className="space-y-3">
      {/* Matching Interface - Compact Layout */}
      <div className="relative">
        {/* Items Layout - Column containers with flexbox */}
        <div className="flex justify-between items-start gap-4 relative z-10">
          {/* Left Column */}
          <div className="w-40 sm:w-48 space-y-1 sm:space-y-1.5 md:space-y-2">
            <h4 className="font-medium text-gray-700 text-xs sm:text-sm border-b border-gray-200 pb-1">
              Items to Match
            </h4>
              {randomizedData.leftItems.map((item, index) => {
                const isSelected = selectedLeft === index
                const isConnected = isLeftItemConnected(index)
                const connection = connections.find(c => c.leftIndex === index)
                
                return (
                  <div
                    key={`left-${index}`}
                    ref={el => { leftItemsRef.current[index] = el }}
                    onClick={() => handleLeftItemClick(index)}
                    className={`
                      px-3 py-2 sm:px-4 sm:py-2.5 border-2 rounded-md cursor-pointer transition-all duration-200 text-sm sm:text-base
                      ${isSelected 
                        ? 'border-primary bg-primary/10 shadow-md' 
                        : isConnected
                        ? connection?.isCorrect === true
                          ? 'border-green-400 bg-green-50'
                          : connection?.isCorrect === false
                          ? 'border-red-400 bg-red-50'
                          : 'border-blue-400 bg-blue-50'
                        : 'border-gray-300 bg-white hover:border-primary/50 hover:bg-primary/5'
                      }
                    `}
                  >
                    <div className="relative flex items-center justify-center">
                      <span className="text-sm sm:text-base font-medium text-gray-800 text-center">
                        {index + 1}. {item.content}
                      </span>
                      {isConnected && (
                        <div className="absolute right-0 flex items-center space-x-1">
                          {showCorrectAnswer && connection?.isCorrect === true && (
                            <span className="text-green-600 text-xs">✓</span>
                          )}
                          {showCorrectAnswer && connection?.isCorrect === false && (
                            <span className="text-red-600 text-xs">✗</span>
                          )}
                          <div className="w-2 h-2 rounded-full bg-current opacity-60"></div>
                        </div>
                      )}
                      {isSelected && (
                        <div className="absolute right-0 w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Right Column */}
            <div className="w-40 sm:w-48 space-y-1 sm:space-y-1.5 md:space-y-2">
              <h4 className="font-medium text-gray-700 text-xs sm:text-sm border-b border-gray-200 pb-1">
                Match Options
              </h4>
              {randomizedData.rightItems.map((item, index) => {
                const isConnected = isRightItemConnected(index)
                const connection = connections.find(c => c.rightIndex === index)
                const canSelect = selectedLeft !== null && !isConnected
                
                return (
                  <div
                    key={`right-${index}`}
                    ref={el => { rightItemsRef.current[index] = el }}
                    onClick={() => handleRightItemClick(index)}
                    className={`
                      px-3 py-2 sm:px-4 sm:py-2.5 border-2 rounded-md transition-all duration-200 text-sm sm:text-base
                      ${isConnected
                        ? connection?.isCorrect === true
                          ? 'border-green-400 bg-green-50 cursor-default'
                          : connection?.isCorrect === false
                          ? 'border-red-400 bg-red-50 cursor-default'
                          : 'border-blue-400 bg-blue-50 cursor-default'
                        : canSelect
                        ? 'border-secondary bg-secondary/10 cursor-pointer hover:bg-secondary/20'
                        : selectedLeft !== null
                        ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                        : 'border-gray-300 bg-white cursor-default'
                      }
                    `}
                  >
                    <div className="relative flex items-center justify-center">
                      <span className="text-sm sm:text-base font-medium text-gray-800 text-center">
                        {String.fromCharCode(65 + index)}. {item.content}
                      </span>
                      {isConnected && (
                        <div className="absolute left-0 flex items-center space-x-1">
                          {showCorrectAnswer && connection?.isCorrect === true && (
                            <span className="text-green-600 text-xs">✓</span>
                          )}
                          {showCorrectAnswer && connection?.isCorrect === false && (
                            <span className="text-red-600 text-xs">✗</span>
                          )}
                          <div className="w-2 h-2 rounded-full bg-current opacity-60"></div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Connection Lines SVG Overlay */}
          <svg
            ref={svgRef}
            className="absolute inset-0 w-full h-full pointer-events-none z-0"
            style={{ top: 0, left: 0 }}
          >
            {connections.map((connection, index) => {
              const coords = getConnectionCoordinates(connection.leftIndex, connection.rightIndex)
              if (!coords) return null
              
              const strokeColor = showCorrectAnswer 
                ? connection.isCorrect === true 
                  ? '#22c55e' 
                  : connection.isCorrect === false 
                  ? '#ef4444' 
                  : '#3b82f6'
                : '#3b82f6'
              
              return (
                <g key={`connection-${index}`}>
                  {/* Connection line */}
                  <line
                    x1={coords.x1}
                    y1={coords.y1}
                    x2={coords.x2}
                    y2={coords.y2}
                    stroke={strokeColor}
                    strokeWidth="1.5"
                    strokeDasharray={showCorrectAnswer && connection.isCorrect === false ? "5,5" : "none"}
                    className="drop-shadow-sm"
                  />
                  {/* Connection dots */}
                  <circle
                    cx={coords.x1}
                    cy={coords.y1}
                    r="3"
                    fill={strokeColor}
                    className="drop-shadow-sm"
                  />
                  <circle
                    cx={coords.x2}
                    cy={coords.y2}
                    r="3"
                    fill={strokeColor}
                    className="drop-shadow-sm"
                  />
                </g>
              )
            })}
          </svg>
        </div>

        {/* Progress indicator - Compact */}
        <div className="bg-gray-50 rounded-lg p-2">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 text-xs">
            <span className="text-gray-600">
              {connections.length} of {randomizedData.leftItems.length} matched
            </span>
            {selectedLeft !== null && (
              <span className="text-primary font-medium text-xs">
                Selected: Click a match option
              </span>
            )}
          </div>
          
          {/* Progress bar */}
          <div className="mt-1.5 w-full bg-gray-200 rounded-full h-1">
            <div 
              className="bg-primary h-1 rounded-full transition-all duration-300"
              style={{ 
                width: `${(connections.length / randomizedData.leftItems.length) * 100}%` 
              }}
            ></div>
          </div>
        </div>
    </div>
  )
}
