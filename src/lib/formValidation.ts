import { logger } from './logger'

/**
 * Centralized form validation utilities
 */

export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: any) => string | null
  message?: string
}

export interface ValidationRules {
  [fieldName: string]: ValidationRule
}

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
  validFields: string[]
}

export class FormValidator {
  /**
   * Validates a single field
   */
  static validateField(value: any, rule: ValidationRule, fieldName: string): string | null {
    // Required validation
    if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
      return rule.message || `${fieldName} is required`
    }

    // Skip other validations if field is empty and not required
    if (!value || (typeof value === 'string' && !value.trim())) {
      return null
    }

    const stringValue = String(value).trim()

    // Min length validation
    if (rule.minLength && stringValue.length < rule.minLength) {
      return rule.message || `${fieldName} must be at least ${rule.minLength} characters`
    }

    // Max length validation
    if (rule.maxLength && stringValue.length > rule.maxLength) {
      return rule.message || `${fieldName} must be no more than ${rule.maxLength} characters`
    }

    // Pattern validation
    if (rule.pattern && !rule.pattern.test(stringValue)) {
      return rule.message || `${fieldName} format is invalid`
    }

    // Custom validation
    if (rule.custom) {
      const customError = rule.custom(value)
      if (customError) return customError
    }

    return null
  }

  /**
   * Validates multiple fields
   */
  static validateForm(data: Record<string, any>, rules: ValidationRules): ValidationResult {
    const errors: Record<string, string> = {}
    const validFields: string[] = []

    for (const [fieldName, rule] of Object.entries(rules)) {
      const error = this.validateField(data[fieldName], rule, fieldName)
      if (error) {
        errors[fieldName] = error
      } else {
        validFields.push(fieldName)
      }
    }

    const isValid = Object.keys(errors).length === 0

    logger.validation('Form validation', isValid, { 
      validFields: validFields.length, 
      errorFields: Object.keys(errors).length,
      errors: Object.keys(errors)
    })

    return { isValid, errors, validFields }
  }

  /**
   * Real-time field validation for better UX
   */
  static validateFieldRealTime(
    value: any, 
    rule: ValidationRule, 
    fieldName: string,
    debounceMs: number = 300
  ): Promise<string | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const error = this.validateField(value, rule, fieldName)
        resolve(error)
      }, debounceMs)
    })
  }
}

/**
 * Common validation rules for reuse
 */
export const commonValidationRules = {
  // Course fields
  courseTitle: {
    required: true,
    minLength: 3,
    maxLength: 100,
    message: 'Course title must be between 3 and 100 characters'
  } as ValidationRule,

  courseDescription: {
    required: true,
    minLength: 10,
    maxLength: 1000,
    message: 'Description must be between 10 and 1000 characters'
  } as ValidationRule,

  coursePrice: {
    custom: (value: any) => {
      const num = Number(value)
      if (isNaN(num) || num < 0) return 'Price must be a positive number'
      if (num > 10000) return 'Price cannot exceed $10,000'
      return null
    }
  } as ValidationRule,

  courseDuration: {
    pattern: /^\d+\s+(hours?|minutes?|days?)$/i,
    message: 'Duration must be in format like "2 hours" or "30 minutes"'
  } as ValidationRule,

  courseCategory: {
    required: true,
    custom: (value: string) => {
      const validCategories = ['english', 'math', 'science', 'programming', 'other']
      if (!validCategories.includes(value?.toLowerCase())) {
        return 'Please select a valid category'
      }
      return null
    }
  } as ValidationRule,

  courseLevel: {
    required: true,
    custom: (value: string) => {
      const validLevels = ['beginner', 'intermediate', 'advanced']
      if (!validLevels.includes(value?.toLowerCase())) {
        return 'Please select a valid difficulty level'
      }
      return null
    }
  } as ValidationRule,

  // Quiz fields
  quizTitle: {
    required: true,
    minLength: 3,
    maxLength: 100,
    message: 'Quiz title must be between 3 and 100 characters'
  } as ValidationRule,

  quizDescription: {
    required: true,
    minLength: 10,
    maxLength: 500,
    message: 'Description must be between 10 and 500 characters'
  } as ValidationRule,

  quizQuestion: {
    required: true,
    minLength: 5,
    maxLength: 500,
    message: 'Question must be between 5 and 500 characters'
  } as ValidationRule,

  // User fields
  userName: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s]+$/,
    message: 'Name must be 2-50 characters and contain only letters and spaces'
  } as ValidationRule,

  userEmail: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address'
  } as ValidationRule,

  // Image URL validation
  imageUrl: {
    pattern: /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i,
    message: 'Please enter a valid image URL (jpg, png, gif, or webp)'
  } as ValidationRule,

  // Learning objectives
  learningObjective: {
    required: true,
    minLength: 5,
    maxLength: 200,
    message: 'Learning objective must be between 5 and 200 characters'
  } as ValidationRule
}

/**
 * Sanitization utilities for input cleaning
 */
export class InputSanitizer {
  /**
   * Basic HTML/script sanitization
   */
  static sanitizeText(input: string): string {
    if (typeof input !== 'string') return ''
    
    return input
      .trim()
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
  }

  /**
   * Sanitize for database storage
   */
  static sanitizeForDatabase(input: string): string {
    return this.sanitizeText(input)
      .replace(/'/g, "''") // Escape single quotes for SQL
      .substring(0, 10000) // Prevent extremely long inputs
  }

  /**
   * Sanitize course data
   */
  static sanitizeCourseData(courseData: any): any {
    return {
      ...courseData,
      title: this.sanitizeText(courseData.title || ''),
      description: this.sanitizeText(courseData.description || ''),
      instructor_name: this.sanitizeText(courseData.instructor_name || ''),
      learning_objectives: Array.isArray(courseData.learning_objectives) 
        ? courseData.learning_objectives.map((obj: string) => this.sanitizeText(obj)).filter(Boolean)
        : [],
      image_url: courseData.image_url ? this.sanitizeText(courseData.image_url) : null
    }
  }

  /**
   * Sanitize quiz data
   */
  static sanitizeQuizData(quizData: any): any {
    return {
      ...quizData,
      title: this.sanitizeText(quizData.title || ''),
      description: this.sanitizeText(quizData.description || ''),
      questions: Array.isArray(quizData.questions) 
        ? quizData.questions.map((q: any) => ({
            ...q,
            question: this.sanitizeText(q.question || ''),
            options: Array.isArray(q.options) 
              ? q.options.map((opt: string) => this.sanitizeText(opt))
              : [],
            explanation: this.sanitizeText(q.explanation || '')
          }))
        : []
    }
  }
}

/**
 * React hook for form validation
 */
export function useFormValidation(rules: ValidationRules) {
  const validateForm = (data: Record<string, any>) => {
    return FormValidator.validateForm(data, rules)
  }

  const validateField = (fieldName: string, value: any) => {
    const rule = rules[fieldName]
    if (!rule) return null
    return FormValidator.validateField(value, rule, fieldName)
  }

  const validateFieldRealTime = (fieldName: string, value: any, debounceMs?: number) => {
    const rule = rules[fieldName]
    if (!rule) return Promise.resolve(null)
    return FormValidator.validateFieldRealTime(value, rule, fieldName, debounceMs)
  }

  return {
    validateForm,
    validateField,
    validateFieldRealTime
  }
}

// Export types already done at the top of the file
