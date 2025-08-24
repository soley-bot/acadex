// Enhanced validation hooks for quiz administration
// This prevents administrators from saving incomplete questions

import { useState, useEffect } from 'react'
import { QuizQuestion } from '@/lib/supabase'

export interface ValidationError {
  field: string
  message: string
  severity: 'error' | 'warning'
}

export interface QuizValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
}

export const useQuizValidation = () => {
  const validateQuestion = (question: QuizQuestion): ValidationError[] => {
    const errors: ValidationError[] = []

    // Basic validation
    if (!question.question?.trim()) {
      errors.push({
        field: 'question',
        message: 'Question text is required',
        severity: 'error'
      })
    }

    if (!question.question_type) {
      errors.push({
        field: 'question_type',
        message: 'Question type is required',
        severity: 'error'
      })
    }

    // Question-type specific validation
    switch (question.question_type) {
      case 'multiple_choice':
      case 'single_choice':
        if (!Array.isArray(question.options) || question.options.length < 2) {
          errors.push({
            field: 'options',
            message: 'At least 2 options are required',
            severity: 'error'
          })
        }
        if (question.correct_answer === null || question.correct_answer === undefined) {
          errors.push({
            field: 'correct_answer',
            message: 'Please select the correct answer',
            severity: 'error'
          })
        }
        break

      case 'true_false':
        if (question.correct_answer !== 0 && question.correct_answer !== 1) {
          errors.push({
            field: 'correct_answer',
            message: 'Please select True or False as the correct answer',
            severity: 'error'
          })
        }
        break

      case 'fill_blank':
        if (!question.correct_answer_text?.trim()) {
          errors.push({
            field: 'correct_answer_text',
            message: 'Please provide the correct answer text',
            severity: 'error'
          })
        }
        break

      case 'essay':
        // Essays don't require a specific correct answer, but warn if empty
        if (!question.correct_answer_text?.trim()) {
          errors.push({
            field: 'correct_answer_text',
            message: 'Consider providing sample answer or grading criteria',
            severity: 'warning'
          })
        }
        break

      case 'matching':
        if (!Array.isArray(question.options) || question.options.length === 0) {
          errors.push({
            field: 'options',
            message: 'Matching pairs are required',
            severity: 'error'
          })
        }
        
        // Check if correct_answer_json is properly set
        if (!question.correct_answer_json || 
            (Array.isArray(question.correct_answer_json) && question.correct_answer_json.length === 0) ||
            (typeof question.correct_answer_json === 'object' && Object.keys(question.correct_answer_json).length === 0)) {
          errors.push({
            field: 'correct_answer_json',
            message: 'Please set the correct matching pairs',
            severity: 'error'
          })
        }
        break

      case 'ordering':
        if (!Array.isArray(question.options) || question.options.length < 2) {
          errors.push({
            field: 'options',
            message: 'At least 2 items are required for ordering',
            severity: 'error'
          })
        }
        
        // Check if correct_answer_json is properly set as an array
        if (!Array.isArray(question.correct_answer_json) || question.correct_answer_json.length === 0) {
          errors.push({
            field: 'correct_answer_json',
            message: 'Please set the correct order of items',
            severity: 'error'
          })
        } else if (question.correct_answer_json.length !== question.options?.length) {
          errors.push({
            field: 'correct_answer_json',
            message: 'Correct order must include all available options',
            severity: 'error'
          })
        }
        break
    }

    return errors
  }

  const validateQuiz = (questions: QuizQuestion[]): QuizValidationResult => {
    if (questions.length === 0) {
      return {
        isValid: false,
        errors: [{
          field: 'questions',
          message: 'Quiz must have at least one question',
          severity: 'error'
        }],
        warnings: []
      }
    }

    const allErrors: ValidationError[] = []
    const allWarnings: ValidationError[] = []

    questions.forEach((question, index) => {
      const questionErrors = validateQuestion(question)
      questionErrors.forEach(error => {
        const errorWithIndex = {
          ...error,
          field: `question_${index + 1}_${error.field}`,
          message: `Question ${index + 1}: ${error.message}`
        }
        
        if (error.severity === 'error') {
          allErrors.push(errorWithIndex)
        } else {
          allWarnings.push(errorWithIndex)
        }
      })
    })

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings
    }
  }

  return {
    validateQuestion,
    validateQuiz
  }
}

// Hook for real-time validation feedback
export const useRealTimeValidation = (question: QuizQuestion) => {
  const { validateQuestion } = useQuizValidation()
  const [validationResult, setValidationResult] = useState<ValidationError[]>([])

  useEffect(() => {
    const errors = validateQuestion(question)
    setValidationResult(errors)
  }, [question, validateQuestion])

  return {
    errors: validationResult.filter(e => e.severity === 'error'),
    warnings: validationResult.filter(e => e.severity === 'warning'),
    isValid: validationResult.filter(e => e.severity === 'error').length === 0
  }
}
