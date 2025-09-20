/**
 * Validation logic for choice-based questions
 * Handles multiple_choice, single_choice, and true_false question types
 */

import type { Question, ValidationError, ValidationWarning } from './foundation'
import { VALIDATION_RULES, createError, createWarning } from './foundation'

/**
 * Validate choice-based questions (multiple_choice, single_choice)
 */
export function validateChoiceQuestion(
  question: Question, 
  rules: typeof VALIDATION_RULES[keyof typeof VALIDATION_RULES]
): { errors: ValidationError[], warnings: ValidationWarning[] } {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []
  
  // Options validation
  if (!Array.isArray(question.options)) {
    errors.push(createError('options', 'Options must be an array', 'OPTIONS_ARRAY_REQUIRED'))
    return { errors, warnings }
  }
  
  if (question.options.length < rules.minOptions) {
    errors.push(createError(
      'options',
      `At least ${rules.minOptions} options are required`,
      'INSUFFICIENT_OPTIONS'
    ))
  }
  
  if (question.options.length > rules.maxOptions) {
    errors.push(createError(
      'options',
      `Maximum ${rules.maxOptions} options allowed`,
      'TOO_MANY_OPTIONS'
    ))
  }
  
  // Check for empty options
  const emptyOptions = question.options.filter((opt: string) => !opt?.trim())
  if (emptyOptions.length > 0) {
    errors.push(createError('options', 'All options must have text', 'EMPTY_OPTIONS'))
  }
  
  // Check for duplicate options
  const duplicates = question.options.filter((opt: string, index: number) => 
    question.options.indexOf(opt) !== index
  )
  if (duplicates.length > 0) {
    warnings.push(createWarning(
      'options',
      'Duplicate options detected',
      'Consider making each option unique to avoid confusion'
    ))
  }
  
  // Check option lengths
  const longOptions = question.options.filter((opt: string) => opt?.length > 200)
  if (longOptions.length > 0) {
    warnings.push(createWarning(
      'options',
      'Some options are very long',
      'Consider shortening options for better readability'
    ))
  }
  
  // Correct answer validation for multiple choice
  if (question.question_type === 'multiple_choice') {
    if (!Array.isArray(question.correct_answer) || question.correct_answer.length === 0) {
      errors.push(createError(
        'correct_answer',
        'At least one correct answer must be selected',
        'NO_CORRECT_ANSWER'
      ))
    } else {
      // Validate indices are within range
      const invalidIndices = question.correct_answer.filter(
        (index: number) => index < 0 || index >= question.options.length
      )
      if (invalidIndices.length > 0) {
        errors.push(createError(
          'correct_answer',
          'Correct answer indices are out of range',
          'INVALID_ANSWER_INDEX'
        ))
      }
    }
  } 
  // Correct answer validation for single choice
  else if (question.question_type === 'single_choice') {
    if (typeof question.correct_answer !== 'number' || question.correct_answer < 0) {
      errors.push(createError(
        'correct_answer',
        'A correct answer must be selected',
        'NO_CORRECT_ANSWER'
      ))
    } else if (question.correct_answer >= question.options.length) {
      errors.push(createError(
        'correct_answer',
        'Correct answer index is out of range',
        'INVALID_ANSWER_INDEX'
      ))
    }
  }
  
  return { errors, warnings }
}

/**
 * Validate true/false questions
 */
export function validateTrueFalseQuestion(
  question: Question, 
  rules: typeof VALIDATION_RULES[keyof typeof VALIDATION_RULES]
): { errors: ValidationError[], warnings: ValidationWarning[] } {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []
  
  // Ensure options are exactly ['True', 'False']
  if (!Array.isArray(question.options) || 
      question.options.length !== 2 || 
      !question.options.includes('True') || 
      !question.options.includes('False')) {
    errors.push(createError(
      'options',
      'True/False questions must have exactly "True" and "False" options',
      'INVALID_TRUEFALSE_OPTIONS'
    ))
  }
  
  // Correct answer validation
  if (question.correct_answer !== 0 && question.correct_answer !== 1) {
    errors.push(createError(
      'correct_answer',
      'True/False questions must select either True (0) or False (1)',
      'INVALID_TRUEFALSE_ANSWER'
    ))
  }
  
  // Explanation especially important for T/F questions
  if (!question.explanation?.trim()) {
    warnings.push(createWarning(
      'explanation',
      'True/False questions benefit from explanations',
      'Explanations help students understand why an answer is correct or incorrect'
    ))
  }
  
  return { errors, warnings }
}