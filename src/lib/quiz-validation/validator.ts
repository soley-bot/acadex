/**
 * Main quiz validation orchestrator
 * Coordinates all validation modules and provides the main validation interface
 */

import type { Question, ValidationResult, ValidationError, ValidationWarning } from './foundation'
import { 
  VALIDATION_RULES, 
  validateBasicFields, 
  combineValidationResults, 
  isValidationSuccessful 
} from './foundation'
import { validateChoiceQuestion, validateTrueFalseQuestion } from './choice-validators'
import { validateFillBlankQuestion, validateEssayQuestion } from './text-validators'
import { 
  validateMatchingQuestion, 
  validateOrderingQuestion, 
  validateComplexQuestionStructure 
} from './complex-validators'

/**
 * Main validation function - validates a single question
 */
export function validateQuestion(question: Question): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []
  
  // Basic field validation
  const basicValidation = validateBasicFields(question)
  errors.push(...basicValidation.errors)
  warnings.push(...basicValidation.warnings)
  
  // If no question type, we can't do type-specific validation
  if (!question.question_type) {
    return {
      isValid: isValidationSuccessful(errors),
      errors,
      warnings
    }
  }
  
  // Type-specific validation
  const typeValidation = validateByType(question)
  errors.push(...typeValidation.errors)
  warnings.push(...typeValidation.warnings)
  
  return {
    isValid: isValidationSuccessful(errors),
    errors,
    warnings
  }
}

/**
 * Type-specific validation dispatcher
 */
function validateByType(question: Question): { errors: ValidationError[], warnings: ValidationWarning[] } {
  const rules = VALIDATION_RULES[question.question_type]
  
  if (!rules) {
    return {
      errors: [{
        field: 'question_type',
        message: `Unsupported question type: ${question.question_type}`,
        code: 'UNSUPPORTED_TYPE'
      }],
      warnings: []
    }
  }
  
  switch (question.question_type) {
    case 'multiple_choice':
    case 'single_choice':
      return validateChoiceQuestion(question, rules)
      
    case 'true_false':
      return validateTrueFalseQuestion(question, rules)
      
    case 'fill_blank':
      return validateFillBlankQuestion(question)
      
    case 'essay':
      return validateEssayQuestion(question)
      
    case 'matching':
      return combineValidationResults(
        validateMatchingQuestion(question),
        validateComplexQuestionStructure(question)
      )
      
    case 'ordering':
      return combineValidationResults(
        validateOrderingQuestion(question),
        validateComplexQuestionStructure(question)
      )
      
    default:
      return {
        errors: [{
          field: 'question_type',
          message: `Unknown question type: ${question.question_type}`,
          code: 'UNKNOWN_TYPE'
        }],
        warnings: []
      }
  }
}

/**
 * Validate an entire quiz form (multiple questions)
 */
export function validateQuizForm(questions: Question[]): ValidationResult {
  const allErrors: ValidationError[] = []
  const allWarnings: ValidationWarning[] = []
  
  if (!Array.isArray(questions) || questions.length === 0) {
    return {
      isValid: false,
      errors: [{
        field: 'questions',
        message: 'At least one question is required',
        code: 'NO_QUESTIONS'
      }],
      warnings: []
    }
  }
  
  // Validate each question individually
  questions.forEach((question, index) => {
    const result = validateQuestion(question)
    
    // Prefix field names with question index for clarity
    const prefixedErrors = result.errors.map(error => ({
      ...error,
      field: `question_${index + 1}.${error.field}`
    }))
    
    const prefixedWarnings = result.warnings.map(warning => ({
      ...warning,
      field: `question_${index + 1}.${warning.field}`
    }))
    
    allErrors.push(...prefixedErrors)
    allWarnings.push(...prefixedWarnings)
  })
  
  // Quiz-level validations
  const quizLevelValidation = validateQuizLevel(questions)
  allErrors.push(...quizLevelValidation.errors)
  allWarnings.push(...quizLevelValidation.warnings)
  
  return {
    isValid: isValidationSuccessful(allErrors),
    errors: allErrors,
    warnings: allWarnings
  }
}

/**
 * Quiz-level validation (relationships between questions, overall structure)
 */
function validateQuizLevel(questions: Question[]): { errors: ValidationError[], warnings: ValidationWarning[] } {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []
  
  // Check for duplicate questions
  const questionTexts = questions.map(q => q.question?.trim().toLowerCase()).filter(Boolean)
  const duplicateTexts = questionTexts.filter((text, index) => questionTexts.indexOf(text) !== index)
  if (duplicateTexts.length > 0) {
    warnings.push({
      field: 'questions',
      message: 'Some questions appear to be duplicates',
      suggestion: 'Review questions for potential duplicates'
    })
  }
  
  // Check question type variety
  const questionTypes = questions.map(q => q.question_type).filter(Boolean)
  const uniqueTypes = new Set(questionTypes)
  if (uniqueTypes.size === 1 && questions.length > 5) {
    warnings.push({
      field: 'questions',
      message: 'Quiz uses only one question type',
      suggestion: 'Consider adding variety with different question types'
    })
  }
  
  // Check total points
  const totalPoints = questions.reduce((sum, q) => sum + (q.points || 1), 0)
  if (totalPoints > 100) {
    warnings.push({
      field: 'questions',
      message: 'Total quiz points exceed 100',
      suggestion: 'Consider if this point total is appropriate for your grading scale'
    })
  }
  
  // Check quiz length
  if (questions.length > 50) {
    warnings.push({
      field: 'questions',
      message: 'Quiz is quite long',
      suggestion: 'Consider breaking into multiple shorter quizzes'
    })
  }
  
  return { errors, warnings }
}