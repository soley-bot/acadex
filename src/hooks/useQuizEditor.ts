import { useState, useCallback, useMemo } from 'react'
import type { QuizQuestion } from '@/lib/supabase'
import { logger } from '@/lib/logger'

interface QuizWithQuestions {
  id?: string
  title: string
  description: string
  questions: QuizQuestion[]
  category?: string
  difficulty?: string
  duration_minutes?: number
  is_published?: boolean
}

interface UseQuizEditorReturn {
  quiz: QuizWithQuestions
  updateQuiz: (updates: Partial<QuizWithQuestions>) => void
  updateQuestion: (index: number, updates: Partial<QuizQuestion>) => void
  addQuestion: () => void
  removeQuestion: (index: number) => void
  moveQuestion: (fromIndex: number, toIndex: number) => void
  duplicateQuestion: (index: number) => void
  resetQuiz: (initialQuiz?: QuizWithQuestions) => void
  hasUnsavedChanges: boolean
}

const createDefaultQuestion = (orderIndex: number): QuizQuestion => ({
  id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  quiz_id: '',
  question: '',
  question_type: 'multiple_choice',
  points: 1,
  options: ['', '', '', ''],
  correct_answer: 0,
  correct_answer_text: null,
  correct_answer_json: null,
  explanation: '',
  order_index: orderIndex,
  difficulty_level: 'medium',
  image_url: null,
  audio_url: null,
  video_url: null
})

export const useQuizEditor = (initialQuiz: QuizWithQuestions): UseQuizEditorReturn => {
  const [quiz, setQuiz] = useState<QuizWithQuestions>(initialQuiz)
  const [originalQuiz] = useState<QuizWithQuestions>(initialQuiz)

  // Check for unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    return JSON.stringify(quiz) !== JSON.stringify(originalQuiz)
  }, [quiz, originalQuiz])

  const updateQuiz = useCallback((updates: Partial<QuizWithQuestions>) => {
    setQuiz(prev => {
      const updated = { ...prev, ...updates }
      logger.debug('Quiz updated', { updates, newState: updated })
      return updated
    })
  }, [])

  const updateQuestion = useCallback((index: number, updates: Partial<QuizQuestion>) => {
    setQuiz(prev => {
      const questions = [...prev.questions]
      if (questions[index]) {
        questions[index] = { ...questions[index], ...updates }
        logger.debug('Question updated', { index, updates })
        return { ...prev, questions }
      }
      logger.warn('Attempted to update non-existent question', { index, totalQuestions: questions.length })
      return prev
    })
  }, [])

  const addQuestion = useCallback(() => {
    setQuiz(prev => {
      const newQuestion = createDefaultQuestion(prev.questions.length)
      const questions = [...prev.questions, newQuestion]
      logger.info('Question added', { questionId: newQuestion.id, totalQuestions: questions.length })
      return { ...prev, questions }
    })
  }, [])

  const removeQuestion = useCallback((index: number) => {
    setQuiz(prev => {
      if (index < 0 || index >= prev.questions.length) {
        logger.warn('Attempted to remove invalid question index', { index, totalQuestions: prev.questions.length })
        return prev
      }
      
      const questions = prev.questions.filter((_, i) => i !== index)
      // Update order indices
      questions.forEach((q, i) => {
        q.order_index = i
      })
      
      logger.info('Question removed', { index, remainingQuestions: questions.length })
      return { ...prev, questions }
    })
  }, [])

  const moveQuestion = useCallback((fromIndex: number, toIndex: number) => {
    setQuiz(prev => {
      const questions = [...prev.questions]
      
      if (fromIndex < 0 || fromIndex >= questions.length || toIndex < 0 || toIndex >= questions.length) {
        logger.warn('Invalid move indices', { fromIndex, toIndex, totalQuestions: questions.length })
        return prev
      }

      const [movedQuestion] = questions.splice(fromIndex, 1)
      if (movedQuestion) {
        questions.splice(toIndex, 0, movedQuestion)
        
        // Update order indices
        questions.forEach((q, i) => {
          q.order_index = i
        })
        
        logger.info('Question moved', { fromIndex, toIndex })
        return { ...prev, questions }
      }
      
      return prev
    })
  }, [])

  const duplicateQuestion = useCallback((index: number) => {
    setQuiz(prev => {
      if (index < 0 || index >= prev.questions.length) {
        logger.warn('Attempted to duplicate invalid question index', { index })
        return prev
      }

      const questionToDuplicate = prev.questions[index]
      if (!questionToDuplicate) {
        logger.warn('Question to duplicate not found', { index })
        return prev
      }

      const duplicatedQuestion: QuizQuestion = {
        ...questionToDuplicate,
        id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        quiz_id: questionToDuplicate.quiz_id || prev.id || '',
        order_index: prev.questions.length
      }

      const questions = [...prev.questions, duplicatedQuestion]
      logger.info('Question duplicated', { originalIndex: index, newQuestionId: duplicatedQuestion.id })
      
      return { ...prev, questions }
    })
  }, [])

  const resetQuiz = useCallback((newInitialQuiz?: QuizWithQuestions) => {
    const resetTo = newInitialQuiz || originalQuiz
    setQuiz(resetTo)
    logger.info('Quiz reset', { hasNewInitial: !!newInitialQuiz })
  }, [originalQuiz])

  return {
    quiz,
    updateQuiz,
    updateQuestion,
    addQuestion,
    removeQuestion,
    moveQuestion,
    duplicateQuestion,
    resetQuiz,
    hasUnsavedChanges
  }
}

export type { QuizWithQuestions, UseQuizEditorReturn }
