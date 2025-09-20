/**
 * Validation logic for complex question types
 * Handles matching and ordering question types
 */

import type { Question, ValidationError, ValidationWarning } from './foundation'
import { VALIDATION_RULES, createError, createWarning } from './foundation'

/**
 * Validate matching questions
 */
export function validateMatchingQuestion(
  question: Question
): { errors: ValidationError[], warnings: ValidationWarning[] } {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []
  const rules = VALIDATION_RULES.matching
  
  // Options should be array of {left, right} pairs
  if (!Array.isArray(question.options)) {
    errors.push(createError(
      'options',
      'Matching questions require an array of pairs',
      'MATCHING_PAIRS_REQUIRED'
    ))
    return { errors, warnings }
  }
  
  if (question.options.length < rules.minOptions) {
    errors.push(createError(
      'options',
      `At least ${rules.minOptions} matching pairs are required`,
      'INSUFFICIENT_PAIRS'
    ))
  }
  
  if (question.options.length > rules.maxOptions) {
    errors.push(createError(
      'options',
      `Maximum ${rules.maxOptions} matching pairs allowed`,
      'TOO_MANY_PAIRS'
    ))
  }
  
  // Validate pair structure
  const invalidPairs = question.options.filter((pair: any) => 
    !pair || typeof pair !== 'object' || !pair.left?.trim() || !pair.right?.trim()
  )
  
  if (invalidPairs.length > 0) {
    errors.push(createError(
      'options',
      'All matching pairs must have both left and right values',
      'INVALID_PAIRS'
    ))
  }
  
  // Check for duplicate left items
  const leftItems = question.options.map((pair: any) => pair.left?.trim()).filter(Boolean)
  const duplicateLefts = leftItems.filter((item: string, index: number) => leftItems.indexOf(item) !== index)
  if (duplicateLefts.length > 0) {
    warnings.push(createWarning(
      'options',
      'Duplicate left items detected',
      'Each left item should be unique to avoid confusion'
    ))
  }
  
  // Check for duplicate right items
  const rightItems = question.options.map((pair: any) => pair.right?.trim()).filter(Boolean)
  const duplicateRights = rightItems.filter((item: string, index: number) => rightItems.indexOf(item) !== index)
  if (duplicateRights.length > 0) {
    warnings.push(createWarning(
      'options',
      'Duplicate right items detected',
      'Each right item should be unique to avoid confusion'
    ))
  }
  
  // Validate correct answer for matching questions
  if (!question.correct_answer || 
      (Array.isArray(question.correct_answer) && question.correct_answer.length === 0) ||
      (typeof question.correct_answer === 'object' && Object.keys(question.correct_answer).length === 0)) {
    errors.push(createError(
      'correct_answer',
      'Matching questions must have correct matching pairs defined',
      'MATCHING_ANSWER_REQUIRED'
    ))
  }
  
  // Validate correct answer structure if it exists
  if (question.correct_answer && typeof question.correct_answer === 'object' && !Array.isArray(question.correct_answer)) {
    const correctMatches = question.correct_answer as Record<string, number>
    const maxLeftIndex = question.options.length - 1
    const maxRightIndex = question.options.length - 1
    
    Object.entries(correctMatches).forEach(([leftIndex, rightIndex]) => {
      const leftIdx = parseInt(leftIndex)
      const rightIdx = rightIndex as number
      
      if (leftIdx < 0 || leftIdx > maxLeftIndex) {
        errors.push(createError(
          'correct_answer',
          `Invalid left item index in matching: ${leftIdx}`,
          'INVALID_MATCHING_INDEX'
        ))
      }
      
      if (rightIdx < 0 || rightIdx > maxRightIndex) {
        errors.push(createError(
          'correct_answer',
          `Invalid right item index in matching: ${rightIdx}`,
          'INVALID_MATCHING_INDEX'
        ))
      }
    })
  }
  
  return { errors, warnings }
}

/**
 * Validate ordering questions
 */
export function validateOrderingQuestion(
  question: Question
): { errors: ValidationError[], warnings: ValidationWarning[] } {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []
  const rules = VALIDATION_RULES.ordering
  
  if (!Array.isArray(question.options)) {
    errors.push(createError(
      'options',
      'Ordering questions require an array of items',
      'ORDERING_ITEMS_REQUIRED'
    ))
    return { errors, warnings }
  }
  
  if (question.options.length < rules.minOptions) {
    errors.push(createError(
      'options',
      `At least ${rules.minOptions} items are required for ordering`,
      'INSUFFICIENT_ITEMS'
    ))
  }
  
  if (question.options.length > rules.maxOptions) {
    errors.push(createError(
      'options',
      `Maximum ${rules.maxOptions} items allowed for ordering`,
      'TOO_MANY_ITEMS'
    ))
  }
  
  // Check for empty items
  const emptyItems = question.options.filter((item: string) => !item?.trim())
  if (emptyItems.length > 0) {
    errors.push(createError(
      'options',
      'All ordering items must have text',
      'EMPTY_ITEMS'
    ))
  }
  
  // Check for duplicate items
  const duplicates = question.options.filter((item: string, index: number) => 
    question.options.indexOf(item) !== index
  )
  if (duplicates.length > 0) {
    errors.push(createError(
      'options',
      'All ordering items must be unique',
      'DUPLICATE_ITEMS'
    ))
  }
  
  // Check item lengths
  const longItems = question.options.filter((item: string) => item?.length > 100)
  if (longItems.length > 0) {
    warnings.push(createWarning(
      'options',
      'Some items are very long',
      'Consider shortening items for better usability in ordering tasks'
    ))
  }
  
  // Validate correct answer for ordering questions
  if (!question.correct_answer || 
      (Array.isArray(question.correct_answer) && question.correct_answer.length === 0)) {
    errors.push(createError(
      'correct_answer',
      'Ordering questions must have a correct sequence defined',
      'ORDERING_ANSWER_REQUIRED'
    ))
  }
  
  // Validate correct answer structure
  if (Array.isArray(question.correct_answer)) {
    const correctSequence = question.correct_answer as string[]
    
    // Check that all items in correct answer exist in options
    const missingItems = correctSequence.filter(item => !question.options.includes(item))
    if (missingItems.length > 0) {
      errors.push(createError(
        'correct_answer',
        `Correct sequence contains items not in options: ${missingItems.join(', ')}`,
        'INVALID_SEQUENCE_ITEMS'
      ))
    }
    
    // Check that all options are included in correct answer
    const missingFromSequence = question.options.filter(item => !correctSequence.includes(item))
    if (missingFromSequence.length > 0) {
      errors.push(createError(
        'correct_answer',
        `Some options are missing from correct sequence: ${missingFromSequence.join(', ')}`,
        'INCOMPLETE_SEQUENCE'
      ))
    }
    
    // Check for duplicates in sequence
    const duplicates = correctSequence.filter((item, index) => correctSequence.indexOf(item) !== index)
    if (duplicates.length > 0) {
      errors.push(createError(
        'correct_answer',
        `Duplicate items in correct sequence: ${duplicates.join(', ')}`,
        'DUPLICATE_SEQUENCE_ITEMS'
      ))
    }
    
    // Check sequence length matches options length
    if (correctSequence.length !== question.options.length) {
      errors.push(createError(
        'correct_answer',
        'Correct sequence must include all items exactly once',
        'SEQUENCE_LENGTH_MISMATCH'
      ))
    }
  }
  
  return { errors, warnings }
}

/**
 * Validate complex question structure requirements
 */
export function validateComplexQuestionStructure(question: Question): { errors: ValidationError[], warnings: ValidationWarning[] } {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []
  
  // Complex questions benefit from detailed explanations
  if (!question.explanation?.trim()) {
    warnings.push(createWarning(
      'explanation',
      'Complex questions benefit from detailed explanations',
      'Explanations help students understand the reasoning behind correct matches/sequences'
    ))
  }
  
  // Points consideration for complex questions
  if (question.points && question.points < 2) {
    warnings.push(createWarning(
      'points',
      'Complex questions typically warrant more points',
      'Consider if the point value reflects the cognitive effort required'
    ))
  }
  
  return { errors, warnings }
}