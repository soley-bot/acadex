'use client'

import React from 'react'
import { QuizBuilder } from './QuizBuilder'
import type { Quiz } from '@/lib/supabase'

export interface QuizBuilderRouterProps {
  quiz?: Quiz | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  prefilledData?: any // For compatibility with existing code
}

export const QuizBuilderRouter: React.FC<QuizBuilderRouterProps> = (props) => {
  console.log('🚀 QuizBuilderRouter:', { 
    hasQuiz: !!props.quiz
  })

  // Use unified QuizBuilder
  return (
    <QuizBuilder 
      {...props} 
    />
  )
}

// Clean export - no more confusing aliases
export { QuizBuilder } from './QuizBuilder'