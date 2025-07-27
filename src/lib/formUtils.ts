/**
 * Reusable form utilities and validation
 */

import React from 'react'
import { logger } from './logger'

export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: any) => string | null
}

export interface FormField {
  name: string
  value: any
  rules?: ValidationRule
  error?: string
}

export class FormValidator {
  /**
   * Validate a single field
   */
  static validateField(field: FormField): string | null {
    const { value, rules } = field
    
    if (!rules) return null

    // Required validation
    if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
      return `${field.name} is required`
    }

    // Skip other validations if field is empty and not required
    if (!value && !rules.required) return null

    // String validations
    if (typeof value === 'string') {
      if (rules.minLength && value.length < rules.minLength) {
        return `${field.name} must be at least ${rules.minLength} characters`
      }

      if (rules.maxLength && value.length > rules.maxLength) {
        return `${field.name} must be no more than ${rules.maxLength} characters`
      }

      if (rules.pattern && !rules.pattern.test(value)) {
        return `${field.name} format is invalid`
      }
    }

    // Custom validation
    if (rules.custom) {
      const customError = rules.custom(value)
      if (customError) return customError
    }

    return null
  }

  /**
   * Validate multiple fields
   */
  static validateForm(fields: FormField[]): Record<string, string> {
    const errors: Record<string, string> = {}

    fields.forEach(field => {
      const error = this.validateField(field)
      if (error) {
        errors[field.name] = error
      }
    })

    return errors
  }
}

/**
 * Common validation rules
 */
export const validationRules = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    custom: (value: string) => {
      if (value && value.length > 254) return 'Email is too long'
      return null
    }
  },
  
  password: {
    required: true,
    minLength: 8,
    custom: (value: string) => {
      if (value && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
        return 'Password must contain uppercase, lowercase, and number'
      }
      return null
    }
  },

  courseTitle: {
    required: true,
    minLength: 3,
    maxLength: 100
  },

  courseDescription: {
    required: true,
    minLength: 10,
    maxLength: 500
  },

  quizTitle: {
    required: true,
    minLength: 3,
    maxLength: 80
  },

  questionText: {
    required: true,
    minLength: 5,
    maxLength: 200
  }
}

/**
 * React hook for form state management
 */
export function useFormState<T extends Record<string, any>>(
  initialState: T,
  validationConfig?: Record<keyof T, ValidationRule>
) {
  const [formData, setFormData] = React.useState<T>(initialState)
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const updateField = (name: keyof T, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when field is updated
    if (errors[name as string]) {
      setErrors(prev => ({ ...prev, [name as string]: '' }))
    }
  }

  const validateForm = (): boolean => {
    if (!validationConfig) return true

    const fields: FormField[] = Object.entries(validationConfig).map(([name, rules]) => ({
      name,
      value: formData[name],
      rules
    }))

    const formErrors = FormValidator.validateForm(fields)
    setErrors(formErrors)

    return Object.keys(formErrors).length === 0
  }

  const handleSubmit = async (
    onSubmit: (data: T) => Promise<void>,
    onSuccess?: () => void,
    onError?: (error: any) => void
  ) => {
    setIsSubmitting(true)

    try {
      if (!validateForm()) {
        setIsSubmitting(false)
        return
      }

      await onSubmit(formData)
      
      if (onSuccess) onSuccess()
    } catch (error) {
      logger.error('Form submission error', error)
      if (onError) onError(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    formData,
    errors,
    isSubmitting,
    updateField,
    validateForm,
    handleSubmit,
    resetForm: () => {
      setFormData(initialState)
      setErrors({})
    }
  }
}

/**
 * File upload validation
 */
export const fileValidation = {
  validateImage: (file: File): string | null => {
    const maxSize = 5 * 1024 * 1024 // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']

    if (file.size > maxSize) {
      return 'Image must be smaller than 5MB'
    }

    if (!allowedTypes.includes(file.type)) {
      return 'Only JPEG, PNG, and WebP images are allowed'
    }

    return null
  },

  validateDocument: (file: File): string | null => {
    const maxSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = ['application/pdf', 'text/plain', 'application/msword']

    if (file.size > maxSize) {
      return 'Document must be smaller than 10MB'
    }

    if (!allowedTypes.includes(file.type)) {
      return 'Only PDF, TXT, and DOC files are allowed'
    }

    return null
  }
}
