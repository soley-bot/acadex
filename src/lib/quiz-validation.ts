/**
 * Shared validation utilities for AI Quiz Generators
 */

import { VALIDATION_RULES, BaseQuizFormData } from './quiz-constants'

export interface ValidationError {
  field: string
  message: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

/**
 * Validates basic quiz form data
 */
export function validateBasicQuizForm(formData: Partial<BaseQuizFormData>): ValidationResult {
  const errors: ValidationError[] = []

  // Topic validation
  if (!formData.topic?.trim()) {
    errors.push({ field: 'topic', message: 'Please enter a topic for the quiz' })
  } else if (formData.topic.trim().length < VALIDATION_RULES.MIN_TOPIC_LENGTH) {
    errors.push({ field: 'topic', message: `Topic must be at least ${VALIDATION_RULES.MIN_TOPIC_LENGTH} characters` })
  } else if (formData.topic.trim().length > VALIDATION_RULES.MAX_TOPIC_LENGTH) {
    errors.push({ field: 'topic', message: `Topic must be less than ${VALIDATION_RULES.MAX_TOPIC_LENGTH} characters` })
  }

  // Subject validation
  if (!formData.subject?.trim()) {
    errors.push({ field: 'subject', message: 'Please select or enter a subject' })
  } else if (formData.subject.trim().length < VALIDATION_RULES.MIN_SUBJECT_LENGTH) {
    errors.push({ field: 'subject', message: `Subject must be at least ${VALIDATION_RULES.MIN_SUBJECT_LENGTH} characters` })
  } else if (formData.subject.trim().length > VALIDATION_RULES.MAX_SUBJECT_LENGTH) {
    errors.push({ field: 'subject', message: `Subject must be less than ${VALIDATION_RULES.MAX_SUBJECT_LENGTH} characters` })
  }

  // Question count validation
  if (!formData.questionCount || 
      formData.questionCount < VALIDATION_RULES.MIN_QUESTIONS || 
      formData.questionCount > VALIDATION_RULES.MAX_QUESTIONS) {
    errors.push({ 
      field: 'questionCount', 
      message: `Question count must be between ${VALIDATION_RULES.MIN_QUESTIONS} and ${VALIDATION_RULES.MAX_QUESTIONS}` 
    })
  }

  // Question types validation
  if (!formData.questionTypes || formData.questionTypes.length === 0) {
    errors.push({ field: 'questionTypes', message: 'Please select at least one question type' })
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Creates a standardized error message display
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  if (errors.length === 0) return ''
  if (errors.length === 1) return errors[0]?.message || 'Unknown error'
  
  return `Multiple issues found:\n${errors.map(e => `• ${e.message}`).join('\n')}`
}

/**
 * Sanitizes form input to prevent XSS and ensure data quality
 */
export function sanitizeFormInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/\s+/g, ' ') // Normalize whitespace
}

/**
 * Validates question count is within acceptable range
 */
export function isValidQuestionCount(count: number): boolean {
  return Number.isInteger(count) && 
         count >= VALIDATION_RULES.MIN_QUESTIONS && 
         count <= VALIDATION_RULES.MAX_QUESTIONS
}

/**
 * Checks if a language code is supported
 */
export function isSupportedLanguage(languageCode: string): boolean {
  const supportedCodes = ['english', 'spanish', 'french', 'german', 'italian', 'portuguese', 
                         'chinese', 'japanese', 'korean', 'arabic', 'russian', 'hindi', 
                         'khmer', 'indonesian']
  return supportedCodes.includes(languageCode.toLowerCase())
}
