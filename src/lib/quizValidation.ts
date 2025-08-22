// Enhanced Quiz Validation Utilities
// Supports all 7 question types with comprehensive validation logic

import type { QuizQuestion } from './supabase'

// Question type definitions matching database schema
export type QuestionType = 'multiple_choice' | 'single_choice' | 'true_false' | 'fill_blank' | 'essay' | 'matching' | 'ordering'

// Validation result interface
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
const VALIDATION_RULES = {
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
}

// Main validation function
export function validateQuestion(question: Question): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []
  
  // Basic question validation
  if (!question.question?.trim()) {
    errors.push({
      field: 'question',
      message: 'Question text is required',
      code: 'QUESTION_REQUIRED'
    })
  }
  
  if (question.question && question.question.length < 10) {
    warnings.push({
      field: 'question',
      message: 'Question might be too short',
      suggestion: 'Consider adding more context to help students understand what is being asked'
    })
  }
  
  if (question.question && question.question.length > 500) {
    warnings.push({
      field: 'question',
      message: 'Question is quite long',
      suggestion: 'Consider breaking this into multiple questions or simplifying the language'
    })
  }
  
  // Question type validation
  if (!question.question_type) {
    errors.push({
      field: 'question_type',
      message: 'Question type is required',
      code: 'TYPE_REQUIRED'
    })
    return { isValid: false, errors, warnings }
  }
  
  // Type-specific validation
  const typeValidation = validateByType(question)
  errors.push(...typeValidation.errors)
  warnings.push(...typeValidation.warnings)
  
  // Points validation
  if (question.points !== undefined) {
    if (question.points < 1 || question.points > 10) {
      errors.push({
        field: 'points',
        message: 'Points must be between 1 and 10',
        code: 'POINTS_RANGE'
      })
    }
  }
  
  // Media validation
  if (question.media_url && !question.media_type) {
    errors.push({
      field: 'media_type',
      message: 'Media type is required when media URL is provided',
      code: 'MEDIA_TYPE_REQUIRED'
    })
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

// Type-specific validation logic
function validateByType(question: Question): { errors: ValidationError[], warnings: ValidationWarning[] } {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []
  const rules = VALIDATION_RULES[question.question_type]
  
  if (!rules) {
    errors.push({
      field: 'question_type',
      message: `Unsupported question type: ${question.question_type}`,
      code: 'UNSUPPORTED_TYPE'
    })
    return { errors, warnings }
  }
  
  switch (question.question_type) {
    case 'multiple_choice':
    case 'single_choice':
      return validateChoiceQuestion(question, rules)
      
    case 'true_false':
      return validateTrueFalseQuestion(question, rules)
      
    case 'fill_blank':
      return validateFillBlankQuestion(question, rules)
      
    case 'essay':
      return validateEssayQuestion(question, rules)
      
    case 'matching':
      return validateMatchingQuestion(question, rules)
      
    case 'ordering':
      return validateOrderingQuestion(question, rules)
      
    default:
      errors.push({
        field: 'question_type',
        message: `Unknown question type: ${question.question_type}`,
        code: 'UNKNOWN_TYPE'
      })
  }
  
  return { errors, warnings }
}

// Choice-based question validation (multiple_choice, single_choice)
function validateChoiceQuestion(question: Question, rules: any): { errors: ValidationError[], warnings: ValidationWarning[] } {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []
  
  // Options validation
  if (!Array.isArray(question.options)) {
    errors.push({
      field: 'options',
      message: 'Options must be an array',
      code: 'OPTIONS_ARRAY_REQUIRED'
    })
    return { errors, warnings }
  }
  
  if (question.options.length < rules.minOptions) {
    errors.push({
      field: 'options',
      message: `At least ${rules.minOptions} options are required`,
      code: 'INSUFFICIENT_OPTIONS'
    })
  }
  
  if (question.options.length > rules.maxOptions) {
    errors.push({
      field: 'options',
      message: `Maximum ${rules.maxOptions} options allowed`,
      code: 'TOO_MANY_OPTIONS'
    })
  }
  
  // Check for empty options
  const emptyOptions = question.options.filter((opt: string) => !opt?.trim())
  if (emptyOptions.length > 0) {
    errors.push({
      field: 'options',
      message: 'All options must have text',
      code: 'EMPTY_OPTIONS'
    })
  }
  
  // Check for duplicate options
  const duplicates = question.options.filter((opt: string, index: number) => 
    question.options.indexOf(opt) !== index
  )
  if (duplicates.length > 0) {
    warnings.push({
      field: 'options',
      message: 'Duplicate options detected',
      suggestion: 'Consider making each option unique to avoid confusion'
    })
  }
  
  // Correct answer validation
  if (question.question_type === 'multiple_choice') {
    if (!Array.isArray(question.correct_answer) || question.correct_answer.length === 0) {
      errors.push({
        field: 'correct_answer',
        message: 'At least one correct answer must be selected',
        code: 'NO_CORRECT_ANSWER'
      })
    }
  } else {
    if (typeof question.correct_answer !== 'number' || question.correct_answer < 0) {
      errors.push({
        field: 'correct_answer',
        message: 'A correct answer must be selected',
        code: 'NO_CORRECT_ANSWER'
      })
    }
  }
  
  return { errors, warnings }
}

// True/False question validation
function validateTrueFalseQuestion(question: Question, rules: any): { errors: ValidationError[], warnings: ValidationWarning[] } {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []
  
  // Ensure options are exactly ['True', 'False']
  if (!Array.isArray(question.options) || 
      question.options.length !== 2 || 
      !question.options.includes('True') || 
      !question.options.includes('False')) {
    errors.push({
      field: 'options',
      message: 'True/False questions must have exactly "True" and "False" options',
      code: 'INVALID_TRUEFALSE_OPTIONS'
    })
  }
  
  // Correct answer validation
  if (typeof question.correct_answer !== 'number' || 
      (question.correct_answer !== 0 && question.correct_answer !== 1)) {
    errors.push({
      field: 'correct_answer',
      message: 'Correct answer must be either True (0) or False (1)',
      code: 'INVALID_TRUEFALSE_ANSWER'
    })
  }
  
  return { errors, warnings }
}

// Fill-in-the-blank validation
function validateFillBlankQuestion(question: Question, rules: any): { errors: ValidationError[], warnings: ValidationWarning[] } {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []
  
  // Check for blank placeholder in question
  if (!question.question.includes('_____') && !question.question.includes('___')) {
    warnings.push({
      field: 'question',
      message: 'Consider adding underscores (___) to indicate where students should fill in the blank',
      suggestion: 'Use _____ to show students exactly where to type their answer'
    })
  }
  
  // Correct answer validation
  if (!question.correct_answer || typeof question.correct_answer !== 'string' || !question.correct_answer.trim()) {
    errors.push({
      field: 'correct_answer',
      message: 'Correct answer text is required for fill-in-the-blank questions',
      code: 'BLANK_ANSWER_REQUIRED'
    })
  }
  
  return { errors, warnings }
}

// Essay question validation
function validateEssayQuestion(question: Question, rules: any): { errors: ValidationError[], warnings: ValidationWarning[] } {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []
  
  // Essay questions don't require correct answers, but benefit from rubrics
  if (!question.correct_answer && !question.explanation) {
    warnings.push({
      field: 'explanation',
      message: 'Consider providing a grading rubric or sample answer',
      suggestion: 'This helps ensure consistent grading and provides guidance to students'
    })
  }
  
  return { errors, warnings }
}

// Matching question validation
function validateMatchingQuestion(question: Question, rules: any): { errors: ValidationError[], warnings: ValidationWarning[] } {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []
  
  // Options should be array of {left, right} pairs
  if (!Array.isArray(question.options)) {
    errors.push({
      field: 'options',
      message: 'Matching questions require an array of pairs',
      code: 'MATCHING_PAIRS_REQUIRED'
    })
    return { errors, warnings }
  }
  
  if (question.options.length < rules.minOptions) {
    errors.push({
      field: 'options',
      message: `At least ${rules.minOptions} matching pairs are required`,
      code: 'INSUFFICIENT_PAIRS'
    })
  }
  
  // Validate pair structure
  const invalidPairs = question.options.filter((pair: any) => 
    !pair || typeof pair !== 'object' || !pair.left?.trim() || !pair.right?.trim()
  )
  
  if (invalidPairs.length > 0) {
    errors.push({
      field: 'options',
      message: 'All matching pairs must have both left and right values',
      code: 'INVALID_PAIRS'
    })
  }
  
  return { errors, warnings }
}

// Ordering question validation
function validateOrderingQuestion(question: Question, rules: any): { errors: ValidationError[], warnings: ValidationWarning[] } {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []
  
  if (!Array.isArray(question.options)) {
    errors.push({
      field: 'options',
      message: 'Ordering questions require an array of items',
      code: 'ORDERING_ITEMS_REQUIRED'
    })
    return { errors, warnings }
  }
  
  if (question.options.length < rules.minOptions) {
    errors.push({
      field: 'options',
      message: `At least ${rules.minOptions} items are required for ordering`,
      code: 'INSUFFICIENT_ITEMS'
    })
  }
  
  // Check for empty items
  const emptyItems = question.options.filter((item: string) => !item?.trim())
  if (emptyItems.length > 0) {
    errors.push({
      field: 'options',
      message: 'All ordering items must have text',
      code: 'EMPTY_ITEMS'
    })
  }
  
  return { errors, warnings }
}

// Validate entire quiz form
export function validateQuizForm(questions: Question[]): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []
  
  if (questions.length === 0) {
    errors.push({
      field: 'questions',
      message: 'At least one question is required',
      code: 'NO_QUESTIONS'
    })
  }
  
  // Validate each question
  questions.forEach((question, index) => {
    const questionValidation = validateQuestion(question)
    
    // Add question index to errors and warnings
    questionValidation.errors.forEach(error => {
      errors.push({
        ...error,
        field: `question_${index}_${error.field}`,
        message: `Question ${index + 1}: ${error.message}`
      })
    })
    
    questionValidation.warnings.forEach(warning => {
      warnings.push({
        ...warning,
        field: `question_${index}_${warning.field}`,
        message: `Question ${index + 1}: ${warning.message}`
      })
    })
  })
  
  // Quiz-level validation
  if (questions.length > 50) {
    warnings.push({
      field: 'questions',
      message: 'Quiz has many questions',
      suggestion: 'Consider breaking into multiple shorter quizzes for better user experience'
    })
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

// Helper function to get validation summary
export function getValidationSummary(questions: Question[]): {
  totalQuestions: number
  validQuestions: number
  questionsWithWarnings: number
  questionsWithErrors: number
} {
  const validQuestions = questions.filter(q => validateQuestion(q).isValid).length
  const questionsWithWarnings = questions.filter(q => validateQuestion(q).warnings.length > 0).length
  const questionsWithErrors = questions.filter(q => !validateQuestion(q).isValid).length
  
  return {
    totalQuestions: questions.length,
    validQuestions,
    questionsWithWarnings,
    questionsWithErrors
  }
}

// Export validation rules for reference
export { VALIDATION_RULES }
