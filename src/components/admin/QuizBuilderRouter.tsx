'use client'

import React from 'react'
import { QuizBuilder } from './QuizBuilder'
import type { Quiz } from '@/lib/supabase'

export interface QuizBuilderRouterProps {
  quiz?: Quiz | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  quizType?: 'standard' | 'reading'
  prefilledData?: any // For compatibility with existing code
}

export const QuizBuilderRouter: React.FC<QuizBuilderRouterProps> = ({ 
  quizType = 'standard',
  ...props 
}) => {
  // Auto-detect quiz type from existing quiz data
  const detectedType = props.quiz?.reading_passage ? 'reading' : quizType
  
  console.log('🚀 QuizBuilderRouter:', { 
    passedQuizType: quizType, 
    detectedType, 
    hasQuiz: !!props.quiz,
    hasPassage: !!(props.quiz as any)?.reading_passage
  })

  // Use unified QuizBuilder for both types
  return (
    <QuizBuilder 
      {...props} 
      quizType={detectedType}
    />
  )
}

// Clean export - no more confusing aliases
export { QuizBuilder } from './QuizBuilder'