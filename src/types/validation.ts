/**
 * Unified validation types for the entire application
 * This replaces the inconsistent validation interfaces across different systems
 */

export interface UnifiedValidationError {
  field: string
  message: string
  severity: 'error' | 'warning'
  code?: string
  questionIndex?: number
  suggestion?: string
}

export interface UnifiedValidationResult {
  isValid: boolean
  errors: UnifiedValidationError[]
  warnings: UnifiedValidationError[]
}

export interface QuizValidationContext {
  isAdmin?: boolean
  allowDraft?: boolean
  strictMode?: boolean
}

// Safe validation error types with strict input validation
interface UnsafeValidationError {
  field?: unknown
  message?: unknown
  severity?: unknown
  code?: unknown
  questionIndex?: unknown
  suggestion?: unknown
}

// Migration helpers for existing validation systems with proper type safety
export const migrateValidationError = (
  error: UnsafeValidationError,
  severity: 'error' | 'warning' = 'error'
): UnifiedValidationError => {
  // Strict input validation to prevent injection attacks
  const safeField = typeof error.field === 'string' && error.field.length > 0 && error.field.length < 100
    ? error.field 
    : 'unknown'
    
  const safeMessage = typeof error.message === 'string' && error.message.length > 0 && error.message.length < 500
    ? error.message.replace(/[<>\"'&]/g, '') // Sanitize potential XSS
    : 'Validation failed'
    
  const safeSeverity = (error.severity === 'error' || error.severity === 'warning') 
    ? error.severity 
    : severity
    
  const safeCode = typeof error.code === 'string' && error.code.length < 50
    ? error.code.replace(/[^a-zA-Z0-9_-]/g, '') // Allow only safe characters
    : undefined
    
  const safeQuestionIndex = typeof error.questionIndex === 'number' && 
    Number.isInteger(error.questionIndex) && 
    error.questionIndex >= 0 && 
    error.questionIndex < 10000 // Reasonable limit
    ? error.questionIndex 
    : undefined
    
  const safeSuggestion = typeof error.suggestion === 'string' && error.suggestion.length < 200
    ? error.suggestion.replace(/[<>\"'&]/g, '') // Sanitize potential XSS
    : undefined

  return {
    field: safeField,
    message: safeMessage,
    severity: safeSeverity,
    code: safeCode,
    questionIndex: safeQuestionIndex,
    suggestion: safeSuggestion
  }
}

interface UnsafeValidationResult {
  isValid?: unknown
  errors?: unknown
  warnings?: unknown
}

export const migrateValidationResult = (
  result: UnsafeValidationResult
): UnifiedValidationResult => {
  // Validate errors array with proper type checking
  const rawErrors = Array.isArray(result.errors) ? result.errors : []
  const errors = rawErrors
    .filter((err): err is UnsafeValidationError => err && typeof err === 'object')
    .slice(0, 50) // Limit array size to prevent DoS
    .map((err: UnsafeValidationError) => migrateValidationError(err, 'error'))
    
  // Validate warnings array with proper type checking  
  const rawWarnings = Array.isArray(result.warnings) ? result.warnings : []
  const warnings = rawWarnings
    .filter((warn): warn is UnsafeValidationError => warn && typeof warn === 'object')
    .slice(0, 50) // Limit array size to prevent DoS
    .map((warn: UnsafeValidationError) => migrateValidationError(warn, 'warning'))
  
  // Safely validate isValid boolean
  const safeIsValid = typeof result.isValid === 'boolean' ? result.isValid : false
  
  return {
    isValid: safeIsValid && errors.length === 0,
    errors,
    warnings
  }
}