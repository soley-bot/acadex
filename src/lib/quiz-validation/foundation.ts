/**
 * Foundation types and interfaces for quiz validation system
 * Shared across all validation modules
 */

import type { QuizQuestion } from '../supabase'

// Question type definitions matching database schema
export type QuestionType = 'multiple_choice' | 'single_choice' | 'true_false' | 'fill_blank' | 'essay' | 'matching' | 'ordering'

// Validation result interfaces
export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

export interface ValidationError {
  field: string
  message: string
  code: string
}

export interface ValidationWarning {
  field: string
  message: string
  suggestion?: string
}

// Question structure for UI (extends database interface)
export interface Question extends Partial<QuizQuestion> {
  question: string
  question_type: QuestionType
  options: any
  correct_answer: any
  explanation?: string
  order_index: number
  points?: number
  difficulty_level?: 'easy' | 'medium' | 'hard'
  
  // UI-specific fields
  media_type?: 'image' | 'audio' | 'video'
  media_url?: string
}

// Type-specific validation rules
export const VALIDATION_RULES = {
  multiple_choice: {
    minOptions: 2,
    maxOptions: 6,
    requiresCorrectAnswer: true,
    allowsMultipleCorrect: true
  },
  single_choice: {
    minOptions: 2,
    maxOptions: 6,
    requiresCorrectAnswer: true,
    allowsMultipleCorrect: false
  },
  true_false: {
    minOptions: 2,
    maxOptions: 2,
    requiresCorrectAnswer: true,
    allowsMultipleCorrect: false,
    fixedOptions: ['True', 'False']
  },
  fill_blank: {
    minOptions: 0,
    maxOptions: 0,
    requiresCorrectAnswer: true,
    allowsMultipleCorrect: false,
    usesTextAnswer: true
  },
  essay: {
    minOptions: 0,
    maxOptions: 0,
    requiresCorrectAnswer: false,
    allowsMultipleCorrect: false,
    usesTextAnswer: true
  },
  matching: {
    minOptions: 2,
    maxOptions: 10,
    requiresCorrectAnswer: true,
    allowsMultipleCorrect: false,
    usesJsonAnswer: true,
    requiresPairs: true
  },
  ordering: {
    minOptions: 2,
    maxOptions: 8,
    requiresCorrectAnswer: true,
    allowsMultipleCorrect: false,
    usesJsonAnswer: true,
    requiresSequence: true
  }
} as const

// Common validation helper functions
export function createError(field: string, message: string, code: string): ValidationError {
  return { field, message, code }
}

export function createWarning(field: string, message: string, suggestion?: string): ValidationWarning {
  return { field, message, suggestion }
}

// Basic field validation
export function validateBasicFields(question: Question): { errors: ValidationError[], warnings: ValidationWarning[] } {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []
  
  // Question text validation
  if (!question.question?.trim()) {
    errors.push(createError('question', 'Question text is required', 'QUESTION_REQUIRED'))
  }
  
  if (question.question && question.question.length < 10) {
    warnings.push(createWarning(
      'question',
      'Question might be too short',
      'Consider adding more context to help students understand what is being asked'
    ))
  }
  
  if (question.question && question.question.length > 500) {
    warnings.push(createWarning(
      'question',
      'Question is quite long',
      'Consider breaking this into multiple questions or simplifying the language'
    ))
  }
  
  // Question type validation
  if (!question.question_type) {
    errors.push(createError('question_type', 'Question type is required', 'TYPE_REQUIRED'))
  }
  
  // Points validation
  if (question.points !== undefined) {
    if (question.points < 1 || question.points > 10) {
      errors.push(createError('points', 'Points must be between 1 and 10', 'POINTS_RANGE'))
    }
  }
  
  // Media validation
  if (question.media_url && !question.media_type) {
    errors.push(createError(
      'media_type',
      'Media type is required when media URL is provided',
      'MEDIA_TYPE_REQUIRED'
    ))
  }
  
  return { errors, warnings }
}

// Combine validation results from multiple validators
export function combineValidationResults(...results: { errors: ValidationError[], warnings: ValidationWarning[] }[]): { errors: ValidationError[], warnings: ValidationWarning[] } {
  return {
    errors: results.flatMap(r => r.errors),
    warnings: results.flatMap(r => r.warnings)
  }
}

// Check if validation result indicates success
export function isValidationSuccessful(errors: ValidationError[]): boolean {
  return errors.length === 0
}