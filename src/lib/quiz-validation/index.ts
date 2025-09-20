/**
 * Quiz Validation Module Exports
 * 
 * Modular quiz validation system with focused responsibilities:
 * - Foundation: Shared types, interfaces, and basic validation
 * - Choice Validators: Multiple choice, single choice, and true/false questions
 * - Text Validators: Fill-in-the-blank and essay questions
 * - Complex Validators: Matching and ordering questions
 * - Main Validator: Orchestrates all validation logic
 */

// Main validation functions (most commonly used)
export { validateQuestion, validateQuizForm } from './validator'

// Foundation types and interfaces
export type { 
  QuestionType, 
  ValidationResult, 
  ValidationError, 
  ValidationWarning, 
  Question 
} from './foundation'

// Validation rules and utilities
export { VALIDATION_RULES, createError, createWarning } from './foundation'

// Specific validators for direct use if needed
export { 
  validateChoiceQuestion, 
  validateTrueFalseQuestion 
} from './choice-validators'

export { 
  validateFillBlankQuestion, 
  validateEssayQuestion,
  validateTextLength,
  validateTextAccessibility
} from './text-validators'

export { 
  validateMatchingQuestion, 
  validateOrderingQuestion,
  validateComplexQuestionStructure
} from './complex-validators'