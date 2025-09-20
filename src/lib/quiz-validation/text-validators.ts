/**
 * Validation logic for text-based questions
 * Handles fill_blank and essay question types
 */

import type { Question, ValidationError, ValidationWarning } from './foundation'
import { createError, createWarning } from './foundation'

/**
 * Validate fill-in-the-blank questions
 */
export function validateFillBlankQuestion(
  question: Question
): { errors: ValidationError[], warnings: ValidationWarning[] } {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []
  
  // Check for blank placeholder in question
  if (!question.question.includes('_____') && !question.question.includes('___')) {
    warnings.push(createWarning(
      'question',
      'Consider adding underscores (___) to indicate where students should fill in the blank',
      'Use _____ to show students exactly where to type their answer'
    ))
  }
  
  // Multiple blanks detection
  const blankCount = (question.question.match(/_{3,}/g) || []).length
  if (blankCount > 3) {
    warnings.push(createWarning(
      'question',
      'Too many blanks in a single question',
      'Consider splitting into multiple fill-in-the-blank questions for clarity'
    ))
  }
  
  // Correct answer validation
  if (!question.correct_answer || typeof question.correct_answer !== 'string' || !question.correct_answer.trim()) {
    errors.push(createError(
      'correct_answer',
      'Correct answer text is required for fill-in-the-blank questions',
      'BLANK_ANSWER_REQUIRED'
    ))
  }
  
  // Answer length validation
  if (question.correct_answer && typeof question.correct_answer === 'string') {
    if (question.correct_answer.length > 100) {
      warnings.push(createWarning(
        'correct_answer',
        'Answer is quite long for a fill-in-the-blank',
        'Consider if this would be better as an essay question'
      ))
    }
    
    if (question.correct_answer.length < 2) {
      warnings.push(createWarning(
        'correct_answer',
        'Very short answer - ensure it provides sufficient context',
        'Consider if students will understand what is expected'
      ))
    }
  }
  
  // Case sensitivity considerations
  if (question.correct_answer && typeof question.correct_answer === 'string') {
    const hasUpperCase = question.correct_answer !== question.correct_answer.toLowerCase()
    if (hasUpperCase) {
      warnings.push(createWarning(
        'correct_answer',
        'Answer contains uppercase letters',
        'Consider if case sensitivity is important for this question'
      ))
    }
  }
  
  return { errors, warnings }
}

/**
 * Validate essay questions
 */
export function validateEssayQuestion(
  question: Question
): { errors: ValidationError[], warnings: ValidationWarning[] } {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []
  
  // Essay questions don't require correct answers, but benefit from rubrics
  if (!question.correct_answer && !question.explanation) {
    warnings.push(createWarning(
      'explanation',
      'Consider providing a grading rubric or sample answer',
      'This helps ensure consistent grading and provides guidance to students'
    ))
  }
  
  // Check if question provides enough context
  if (question.question.length < 50) {
    warnings.push(createWarning(
      'question',
      'Essay question might benefit from more context',
      'Detailed questions help students understand expectations'
    ))
  }
  
  // Encourage explanation for grading guidance
  if (!question.explanation?.trim()) {
    warnings.push(createWarning(
      'explanation',
      'Essay questions benefit from grading guidelines',
      'Provide key points or criteria that should be included in good answers'
    ))
  }
  
  // Sample answer validation
  if (question.correct_answer && typeof question.correct_answer === 'string') {
    if (question.correct_answer.length < 100) {
      warnings.push(createWarning(
        'correct_answer',
        'Sample answer is quite short',
        'Consider providing a more comprehensive sample answer'
      ))
    }
    
    if (question.correct_answer.length > 2000) {
      warnings.push(createWarning(
        'correct_answer',
        'Sample answer is very long',
        'Consider if this question scope is appropriate for the assessment'
      ))
    }
  }
  
  // Points consideration for essays
  if (question.points && question.points < 3) {
    warnings.push(createWarning(
      'points',
      'Essay questions typically warrant more points',
      'Consider if the point value reflects the effort required'
    ))
  }
  
  return { errors, warnings }
}

/**
 * Common text validation utilities
 */
export function validateTextLength(text: string, minLength: number, maxLength: number, fieldName: string): ValidationError[] {
  const errors: ValidationError[] = []
  
  if (text.length < minLength) {
    errors.push(createError(
      fieldName,
      `Text must be at least ${minLength} characters`,
      'TEXT_TOO_SHORT'
    ))
  }
  
  if (text.length > maxLength) {
    errors.push(createError(
      fieldName,
      `Text must not exceed ${maxLength} characters`,
      'TEXT_TOO_LONG'
    ))
  }
  
  return errors
}

/**
 * Check for potential accessibility issues in text
 */
export function validateTextAccessibility(text: string, fieldName: string): ValidationWarning[] {
  const warnings: ValidationWarning[] = []
  
  // Check for all caps (potential accessibility issue)
  if (text === text.toUpperCase() && text.length > 20) {
    warnings.push(createWarning(
      fieldName,
      'All caps text can be difficult to read',
      'Consider using normal capitalization for better accessibility'
    ))
  }
  
  // Check for very long sentences
  const sentences = text.split(/[.!?]+/)
  const longSentences = sentences.filter(sentence => sentence.trim().length > 200)
  if (longSentences.length > 0) {
    warnings.push(createWarning(
      fieldName,
      'Some sentences are very long',
      'Consider breaking long sentences into shorter ones for clarity'
    ))
  }
  
  return warnings
}