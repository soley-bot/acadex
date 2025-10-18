import { z } from 'zod'

// Question type enum
export const QuestionTypeSchema = z.enum([
  'multiple_choice',
  'true_false',
  'fill_blank'
])

export type QuestionType = z.infer<typeof QuestionTypeSchema>

// Difficulty levels
export const DifficultySchema = z.enum(['easy', 'medium', 'hard']).optional()

// Single question validation schema
export const QuestionImportSchema = z.object({
  question: z.string().min(5, 'Question text must be at least 5 characters'),
  type: QuestionTypeSchema,
  
  // Multiple choice fields
  option_a: z.string().optional(),
  option_b: z.string().optional(),
  option_c: z.string().optional(),
  option_d: z.string().optional(),
  correct_answer: z.union([z.number(), z.string()]).optional().transform(val => 
    val !== undefined && val !== '' ? Number(val) : undefined
  ),
  
  // True/False and Fill in blank fields
  correct_answer_text: z.string().optional(),
  
  // Common optional fields
  explanation: z.string().optional(),
  points: z.union([z.number(), z.string()]).optional().transform(val => 
    val !== undefined && val !== '' ? Number(val) : 10
  ),
  difficulty: z.union([DifficultySchema, z.string().transform(val => {
    const lower = val.toLowerCase()
    if (['easy', 'medium', 'hard'].includes(lower)) return lower as 'easy' | 'medium' | 'hard'
    return undefined
  })]).optional(),
  tags: z.string().optional(), // Comma-separated string
}).refine(
  (data) => {
    // Type-specific validation
    if (data.type === 'multiple_choice') {
      // Must have at least 2 options
      const hasOptions = data.option_a && data.option_b
      if (!hasOptions) return false
      
      // Count actual options
      const options = [data.option_a, data.option_b, data.option_c, data.option_d].filter(Boolean)
      
      // Correct answer must be valid index
      if (data.correct_answer === undefined) return false
      if (data.correct_answer < 0 || data.correct_answer >= options.length) return false
      
      return true
    }
    
    if (data.type === 'fill_blank' || data.type === 'true_false') {
      return !!data.correct_answer_text
    }
    
    return true
  },
  { message: 'Missing or invalid required fields for question type' }
)

export type QuestionImport = z.infer<typeof QuestionImportSchema>

// Validation result with detailed feedback
export interface ValidationResult {
  success: boolean
  data?: QuestionImport
  errors?: string[]
  warnings?: string[]
}

/**
 * Validate a single question with detailed error messages
 */
export function validateQuestion(data: any, rowNumber: number): ValidationResult {
  const result = QuestionImportSchema.safeParse(data)
  
  if (result.success) {
    const warnings: string[] = []
    
    // Check for optional but recommended fields
    if (!result.data.explanation) {
      warnings.push('Missing explanation (recommended)')
    }
    if (!result.data.difficulty) {
      warnings.push('Missing difficulty level')
    }
    if (!result.data.tags) {
      warnings.push('No tags specified')
    }
    
    return {
      success: true,
      data: result.data,
      warnings: warnings.length > 0 ? warnings : undefined
    }
  }
  
  // Parse errors into user-friendly messages
  const errors = result.error.issues.map((err: any) => {
    const path = err.path.join('.')
    return `${path}: ${err.message}`
  })
  
  return {
    success: false,
    errors
  }
}

/**
 * Batch validation for multiple questions
 */
export interface BatchValidationResult {
  valid: QuestionImport[]
  invalid: Array<{
    row: number
    data: any
    errors: string[]
  }>
  warnings: Array<{
    row: number
    data: QuestionImport
    warnings: string[]
  }>
  summary: {
    total: number
    valid: number
    invalid: number
    withWarnings: number
  }
}

export function validateBatch(questions: any[]): BatchValidationResult {
  const valid: QuestionImport[] = []
  const invalid: Array<{ row: number; data: any; errors: string[] }> = []
  const warnings: Array<{ row: number; data: QuestionImport; warnings: string[] }> = []
  
  questions.forEach((q, index) => {
    const rowNumber = index + 2 // +2 because row 1 is header, array is 0-indexed
    const result = validateQuestion(q, rowNumber)
    
    if (result.success && result.data) {
      valid.push(result.data)
      if (result.warnings && result.warnings.length > 0) {
        warnings.push({
          row: rowNumber,
          data: result.data,
          warnings: result.warnings
        })
      }
    } else if (result.errors) {
      invalid.push({
        row: rowNumber,
        data: q,
        errors: result.errors
      })
    }
  })
  
  return {
    valid,
    invalid,
    warnings,
    summary: {
      total: questions.length,
      valid: valid.length,
      invalid: invalid.length,
      withWarnings: warnings.length
    }
  }
}
