// Shared utility functions for quiz operations

import type { QuizQuestion } from './quiz-types'

export const calculateQuizStats = (questions: QuizQuestion[]) => {
  const totalQuestions = questions.length
  const totalPoints = questions.reduce((sum, q) => sum + (q.points || 1), 0)
  const estimatedTime = Math.ceil(totalQuestions * 1.5) // 1.5 minutes per question estimate
  
  const difficultyCount = questions.reduce((acc, q) => {
    const level = q.difficulty_level || 'medium'
    acc[level] = (acc[level] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const typeCount = questions.reduce((acc, q) => {
    acc[q.question_type] = (acc[q.question_type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return {
    totalQuestions,
    totalPoints,
    estimatedTime,
    difficultyCount,
    typeCount,
    averagePointsPerQuestion: totalQuestions > 0 ? totalPoints / totalQuestions : 0
  }
}

export const generateQuestionOrderIndex = (questions: QuizQuestion[]): number => {
  if (questions.length === 0) return 0
  const maxIndex = Math.max(...questions.map(q => q.order_index || 0))
  return maxIndex + 1
}

export const reorderQuestions = (questions: QuizQuestion[], newOrder: string[]): QuizQuestion[] => {
  const questionMap = new Map(questions.map(q => [q.id, q]))
  
  return newOrder.map((id, index) => {
    const question = questionMap.get(id)
    if (!question) throw new Error(`Question with id ${id} not found`)
    
    return {
      ...question,
      order_index: index
    }
  })
}

export const duplicateQuestion = (question: QuizQuestion): Omit<QuizQuestion, 'id'> => {
  return {
    ...question,
    question: `${question.question} (Copy)`,
    order_index: (question.order_index || 0) + 1
  }
}

// Quiz status helpers
export const getQuizStatus = (quiz: any) => {
  if (!quiz.is_published) return 'draft'
  if (quiz.total_questions === 0) return 'no_questions'
  return 'published'
}

export const canPublishQuiz = (quiz: any, questions: QuizQuestion[]) => {
  if (questions.length === 0) return { canPublish: false, reason: 'Quiz must have at least one question' }
  if (!quiz.title?.trim()) return { canPublish: false, reason: 'Quiz must have a title' }
  if (!quiz.category?.trim()) return { canPublish: false, reason: 'Quiz must have a category' }
  
  // Check if all questions are valid
  for (const question of questions) {
    if (!question.question?.trim()) {
      return { canPublish: false, reason: 'All questions must have question text' }
    }
    
    if (question.question_type === 'multiple_choice' || question.question_type === 'single_choice') {
      if (!question.options || !Array.isArray(question.options) || question.options.length < 2) {
        return { canPublish: false, reason: 'Multiple choice questions must have at least 2 options' }
      }
    }
  }
  
  return { canPublish: true }
}