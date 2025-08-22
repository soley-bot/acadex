/**
 * Enhanced Quiz Validation Utilities
 * Provides comprehensive validation for quiz data and questions
 */

import { logger } from '@/lib/logger'

interface ValidationError {
  field: string
  message: string
  questionIndex?: number
}

interface QuizData {
  title: string
  description: string
  category: string
  duration_minutes: number
  max_attempts: number
  time_limit_type: string
}

interface Question {
  id?: string
  question: string
  question_type: string
  options: string[] | Array<{left: string; right: string}>
  correct_answer: number | string | number[]
  explanation?: string
  points?: number
  difficulty_level?: string
}

/**
 * Validates quiz metadata and settings
 */
export const validateQuizData = (formData: QuizData): ValidationError[] => {
  const errors: ValidationError[] = []
  
  try {
    // Title validation
    if (!formData.title?.trim()) {
      errors.push({ field: 'title', message: 'Quiz title is required' })
    } else if (formData.title.trim().length < 3) {
      errors.push({ field: 'title', message: 'Quiz title must be at least 3 characters' })
    } else if (formData.title.trim().length > 200) {
      errors.push({ field: 'title', message: 'Quiz title must be less than 200 characters' })
    }
    
    // Description validation
    if (!formData.description?.trim()) {
      errors.push({ field: 'description', message: 'Quiz description is required' })
    } else if (formData.description.trim().length < 10) {
      errors.push({ field: 'description', message: 'Description must be at least 10 characters' })
    }
    
    // Category validation
    if (!formData.category) {
      errors.push({ field: 'category', message: 'Please select a category' })
    }
    
    // Duration validation
    if (!formData.duration_minutes || formData.duration_minutes < 1) {
      errors.push({ field: 'duration_minutes', message: 'Duration must be at least 1 minute' })
    } else if (formData.duration_minutes > 480) { // 8 hours max
      errors.push({ field: 'duration_minutes', message: 'Duration cannot exceed 8 hours (480 minutes)' })
    }
    
    // Attempts validation
    if (formData.max_attempts < 0) {
      errors.push({ field: 'max_attempts', message: 'Max attempts cannot be negative' })
    } else if (formData.max_attempts > 10) {
      errors.push({ field: 'max_attempts', message: 'Max attempts cannot exceed 10' })
    }
    
  } catch (error) {
    logger.error('Error in validateQuizData:', error)
    errors.push({ field: 'general', message: 'Validation error occurred' })
  }
  
  return errors
}

/**
 * Validates individual question data
 */
export const validateQuestion = (question: Question, index: number): ValidationError[] => {
  const errors: ValidationError[] = []
  
  try {
    // Question text validation
    if (!question.question?.trim()) {
      errors.push({ 
        field: 'question', 
        message: 'Question text is required',
        questionIndex: index 
      })
    } else if (question.question.trim().length < 10) {
      errors.push({ 
        field: 'question', 
        message: 'Question must be at least 10 characters',
        questionIndex: index 
      })
    }
    
    // Question type specific validation
    switch (question.question_type) {
      case 'multiple_choice':
        validateMultipleChoiceQuestion(question, index, errors)
        break
      case 'true_false':
        validateTrueFalseQuestion(question, index, errors)
        break
      case 'fill_blank':
        validateFillBlankQuestion(question, index, errors)
        break
      case 'essay':
        validateEssayQuestion(question, index, errors)
        break
      case 'matching':
        validateMatchingQuestion(question, index, errors)
        break
      case 'ordering':
        validateOrderingQuestion(question, index, errors)
        break
      default:
        errors.push({
          field: 'question_type',
          message: 'Invalid question type',
          questionIndex: index
        })
    }
    
    // Points validation
    if (question.points !== undefined && question.points < 0) {
      errors.push({
        field: 'points',
        message: 'Points cannot be negative',
        questionIndex: index
      })
    }
    
  } catch (error) {
    logger.error(`Error validating question ${index}:`, error)
    errors.push({ 
      field: 'general', 
      message: 'Question validation error occurred',
      questionIndex: index 
    })
  }
  
  return errors
}

/**
 * Validate multiple choice question (now uses single correct answer)
 */
const validateMultipleChoiceQuestion = (question: Question, index: number, errors: ValidationError[]) => {
  const options = question.options as string[]
  
  if (!options || options.length < 2) {
    errors.push({
      field: 'options',
      message: 'At least 2 options required',
      questionIndex: index
    })
    return
  }
  
  if (options.some(opt => !opt?.trim())) {
    errors.push({
      field: 'options',
      message: 'All options must have text',
      questionIndex: index
    })
  }
  
  if (typeof question.correct_answer !== 'number' || question.correct_answer < 0) {
    errors.push({
      field: 'correct_answer',
      message: 'Select one correct answer',
      questionIndex: index
    })
  }
}

/**
 * Validate true/false question
 */
const validateTrueFalseQuestion = (question: Question, index: number, errors: ValidationError[]) => {
  const options = question.options as string[]
  
  if (!options || options.length !== 2) {
    errors.push({
      field: 'options',
      message: 'True/False must have exactly 2 options',
      questionIndex: index
    })
    return
  }
  
  if (typeof question.correct_answer !== 'number' || question.correct_answer < 0) {
    errors.push({
      field: 'correct_answer',
      message: 'Select a correct answer',
      questionIndex: index
    })
  }
}

/**
 * Validate fill in the blank question
 */
const validateFillBlankQuestion = (question: Question, index: number, errors: ValidationError[]) => {
  if (!question.correct_answer || (question.correct_answer as string).trim() === '') {
    errors.push({
      field: 'correct_answer',
      message: 'Fill-in-the-blank answer required',
      questionIndex: index
    })
  }
}

/**
 * Validate essay question
 */
const validateEssayQuestion = (question: Question, index: number, errors: ValidationError[]) => {
  // Essay questions are optional for correct_answer (sample answer)
  // No additional validation needed beyond basic question text
}

/**
 * Validate matching question
 */
const validateMatchingQuestion = (question: Question, index: number, errors: ValidationError[]) => {
  const matchingOptions = question.options as Array<{left: string; right: string}>
  
  if (!matchingOptions || matchingOptions.length < 2) {
    errors.push({
      field: 'options',
      message: 'At least 2 matching pairs required',
      questionIndex: index
    })
    return
  }
  
  if (matchingOptions.some(pair => !pair?.left?.trim() || !pair?.right?.trim())) {
    errors.push({
      field: 'options',
      message: 'All matching pairs must have text',
      questionIndex: index
    })
  }
}

/**
 * Validate ordering question
 */
const validateOrderingQuestion = (question: Question, index: number, errors: ValidationError[]) => {
  const options = question.options as string[]
  
  if (!options || options.length < 2) {
    errors.push({
      field: 'options',
      message: 'At least 2 items required for ordering',
      questionIndex: index
    })
    return
  }
  
  if (options.some(opt => !opt?.trim())) {
    errors.push({
      field: 'options',
      message: 'All ordering items must have text',
      questionIndex: index
    })
  }
}
