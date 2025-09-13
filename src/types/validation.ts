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

// Migration helpers for existing validation systems
export const migrateValidationError = (
  error: any,
  severity: 'error' | 'warning' = 'error'
): UnifiedValidationError => {
  return {
    field: error.field || 'unknown',
    message: error.message || 'Validation failed',
    severity: error.severity || severity,
    code: error.code,
    questionIndex: error.questionIndex,
    suggestion: error.suggestion
  }
}

export const migrateValidationResult = (
  result: any
): UnifiedValidationResult => {
  const errors = (result.errors || []).map((err: any) => 
    migrateValidationError(err, 'error')
  )
  const warnings = (result.warnings || []).map((warn: any) => 
    migrateValidationError(warn, 'warning')
  )
  
  return {
    isValid: result.isValid && errors.length === 0,
    errors,
    warnings
  }
}