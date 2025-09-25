'use client'

import React, { memo, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, X, CheckCircle, XCircle } from 'lucide-react'
import Image from 'next/image'
import { TrueFalseData, QuestionRendererProps } from '@/types/question-types'

interface TrueFalseRendererProps extends QuestionRendererProps<TrueFalseData> {}

export const TrueFalseRenderer = memo<TrueFalseRendererProps>(({
  question,
  userAnswer,
  onAnswerChange,
  isSubmitted,
  showCorrectAnswer,
  isReview
}) => {
  const handleAnswerSelect = useCallback((answer: boolean) => {
    if (isSubmitted && !isReview) return
    onAnswerChange(answer)
  }, [onAnswerChange, isSubmitted, isReview])

  const getButtonStatus = useCallback((option: boolean) => {
    if (!showCorrectAnswer) return 'default'
    
    const isCorrect = option === question.correct_answer
    const isSelected = userAnswer === option
    
    if (isCorrect && isSelected) return 'correct-selected'
    if (isCorrect && !isSelected) return 'correct-unselected'
    if (!isCorrect && isSelected) return 'incorrect-selected'
    return 'default'
  }, [showCorrectAnswer, question.correct_answer, userAnswer])

  const getButtonClasses = (status: string, isSelected: boolean) => {
    const baseClasses = "flex-1 h-16 text-xl font-medium transition-all duration-200 flex items-center justify-center gap-3"
    
    switch (status) {
      case 'correct-selected':
        return `${baseClasses} bg-green-500 hover:bg-green-600 text-white border-green-500`
      case 'correct-unselected':
        return `${baseClasses} bg-green-100 hover:bg-green-200 text-green-800 border-green-300`
      case 'incorrect-selected':
        return `${baseClasses} bg-red-500 hover:bg-red-600 text-white border-red-500`
      default:
        if (isSelected) {
          return `${baseClasses} bg-primary hover:bg-primary/90 text-white`
        }
        return `${baseClasses} bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 hover:border-primary/50`
    }
  }

  const getButtonIcon = (option: boolean, status: string, isSelected: boolean) => {
    if (showCorrectAnswer) {
      switch (status) {
        case 'correct-selected':
        case 'correct-unselected':
          return <CheckCircle className="w-6 h-6" />
        case 'incorrect-selected':
          return <XCircle className="w-6 h-6" />
      }
    }
    
    return option ? <Check className="w-6 h-6" /> : <X className="w-6 h-6" />
  }

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
        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg text-center">
          Is this statement true or false?
        </div>

        {/* True/False Options */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => handleAnswerSelect(true)}
            disabled={isSubmitted && !isReview}
            className={getButtonClasses(getButtonStatus(true), userAnswer === true)}
          >
            {getButtonIcon(true, getButtonStatus(true), userAnswer === true)}
            TRUE
          </Button>
          
          <Button
            variant="outline"
            onClick={() => handleAnswerSelect(false)}
            disabled={isSubmitted && !isReview}
            className={getButtonClasses(getButtonStatus(false), userAnswer === false)}
          >
            {getButtonIcon(false, getButtonStatus(false), userAnswer === false)}
            FALSE
          </Button>
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

TrueFalseRenderer.displayName = 'TrueFalseRenderer'

