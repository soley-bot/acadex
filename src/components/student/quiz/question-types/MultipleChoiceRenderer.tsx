'use client'

import React, { memo, useCallback, useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Circle } from 'lucide-react'
import Image from 'next/image'
import { MultipleChoiceData, QuestionRendererProps } from '@/types/question-types'

interface MultipleChoiceRendererProps extends QuestionRendererProps<MultipleChoiceData> {}

export const MultipleChoiceRenderer = memo<MultipleChoiceRendererProps>(({
  question,
  userAnswer,
  onAnswerChange,
  isSubmitted,
  showCorrectAnswer,
  isReview
}) => {
  // Map database fields to expected names for backward compatibility
  // Note: In this quiz system, "multiple_choice" is actually single choice
  // partial_credit is used for partial scoring, not multiple selection
  const allowMultiple = false  // Always false since "multiple_choice" is actually single choice
  const shuffleOptions = question.randomize_options ?? true
  
  const handleOptionSelect = useCallback((optionIndex: number) => {
    if (isSubmitted && !isReview) return

    if (allowMultiple) {
      // Multiple selection mode
      const currentAnswers = Array.isArray(userAnswer) ? userAnswer : []
      const newAnswers = currentAnswers.includes(optionIndex)
        ? currentAnswers.filter(i => i !== optionIndex)
        : [...currentAnswers, optionIndex]
      onAnswerChange(newAnswers)
    } else {
      // Single selection mode
      onAnswerChange(optionIndex)
    }
  }, [allowMultiple, userAnswer, onAnswerChange, isSubmitted, isReview])

  const isOptionSelected = useCallback((optionIndex: number) => {
    if (allowMultiple) {
      return Array.isArray(userAnswer) && userAnswer.includes(optionIndex)
    }
    return userAnswer === optionIndex
  }, [allowMultiple, userAnswer])

  const getOptionStatus = useCallback((optionIndex: number) => {
    if (!showCorrectAnswer) return 'default'
    
    const isCorrect = optionIndex === question.correct_answer
    const isSelected = isOptionSelected(optionIndex)
    
    if (isCorrect && isSelected) return 'correct-selected'
    if (isCorrect && !isSelected) return 'correct-unselected'
    if (!isCorrect && isSelected) return 'incorrect-selected'
    return 'default'
  }, [showCorrectAnswer, question.correct_answer, isOptionSelected])

  const getOptionClasses = (status: string, isSelected: boolean) => {
    const baseClasses = "w-full text-left p-4 rounded-lg border-2 transition-all duration-200 flex items-center gap-3"
    
    switch (status) {
      case 'correct-selected':
        return `${baseClasses} bg-green-50 border-green-500 text-green-800`
      case 'correct-unselected':
        return `${baseClasses} bg-green-50 border-green-300 text-green-700`
      case 'incorrect-selected':
        return `${baseClasses} bg-red-50 border-red-500 text-red-800`
      default:
        if (isSelected) {
          return `${baseClasses} bg-primary/10 border-primary text-primary`
        }
        return `${baseClasses} bg-white border-gray-200 hover:border-primary/50 hover:bg-gray-50`
    }
  }

  const getOptionIcon = (status: string, isSelected: boolean) => {
    switch (status) {
      case 'correct-selected':
      case 'correct-unselected':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'incorrect-selected':
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return isSelected ? (
          <CheckCircle className="w-5 h-5 text-primary" />
        ) : (
          <Circle className="w-5 h-5 text-gray-400" />
        )
    }
  }

  const [shuffledOptions, setShuffledOptions] = useState<Array<{ option: string; index: number }>>([])

  // Initialize and shuffle options
  useEffect(() => {
    if (!shuffleOptions) {
      const optionsWithIndex = question.options.map((option, index) => ({ option, index }))
      setShuffledOptions(optionsWithIndex)
      return
    }
    
    // For demonstration - in real implementation, use a seeded random function
    // based on user ID + question ID to ensure consistent shuffling
    const optionsWithIndex = question.options.map((option, index) => ({ option, index }))
    setShuffledOptions(optionsWithIndex.sort(() => Math.random() - 0.5))
  }, [question.options, shuffleOptions])

  return (
    <Card className="w-full">
      <CardContent className="p-6 space-y-6">
        {/* Question Text */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 leading-relaxed">
            {question.question}
          </h3>
          
          {/* Question Image */}
          {question.image_url && (
            <div className="relative w-full max-w-2xl mx-auto">
              <Image
                src={question.image_url}
                alt="Question image"
                width={600}
                height={400}
                className="rounded-lg object-cover"
              />
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
          {allowMultiple 
            ? "Select all correct answers:" 
            : "Select the best answer:"
          }
        </div>

        {/* Options */}
        <div className="space-y-3">
          {shuffledOptions.map(({ option, index }, displayIndex) => {
            const isSelected = isOptionSelected(index)
            const status = getOptionStatus(index)
            
            return (
              <Button
                key={index}
                variant="outline"
                onClick={() => handleOptionSelect(index)}
                disabled={isSubmitted && !isReview}
                className={getOptionClasses(status, isSelected)}
              >
                {getOptionIcon(status, isSelected)}
                
                <span className="font-medium text-sm w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                  {String.fromCharCode(65 + displayIndex)}
                </span>
                
                <span className="flex-1 text-left">{option}</span>
              </Button>
            )
          })}
        </div>

        {/* Points and Difficulty Display */}
        <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t">
          <span>Points: {question.points}</span>
          <span className={`px-2 py-1 rounded-full text-xs ${
            question.difficulty_level === 'easy' ? 'bg-green-100 text-green-800' :
            question.difficulty_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {question.difficulty_level}
          </span>
        </div>

        {/* Explanation (shown after submission) */}
        {showCorrectAnswer && question.explanation && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">Explanation:</h4>
            <p className="text-blue-800 text-sm leading-relaxed">{question.explanation}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
})

MultipleChoiceRenderer.displayName = 'MultipleChoiceRenderer'

