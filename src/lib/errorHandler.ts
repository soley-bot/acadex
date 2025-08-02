import { logger } from './logger'

/**
 * Centralized error handling utility
 */

export interface AppError {
  message: string
  code?: string
  technical?: string
  retry?: boolean
  severity?: 'low' | 'medium' | 'high' | 'critical'
}

interface ErrorContext {
  component?: string
  action?: string
  userId?: string
  courseId?: string
  [key: string]: any
}

export class ErrorHandler {
  /**
   * Formats errors for user display
   */
  static formatError(error: any): AppError {
    // Database/Supabase errors
    if (error?.code) {
      return this.handleDatabaseError(error)
    }

    // Network errors
    if (error?.name === 'NetworkError' || error?.message?.includes('fetch')) {
      return {
        message: 'Network connection error. Please check your internet connection.',
        code: 'NETWORK_ERROR',
        technical: error.message,
        retry: true,
        severity: 'medium'
      }
    }

    // Authentication errors
    if (error?.message?.includes('auth') || error?.status === 401) {
      return {
        message: 'Authentication error. Please log in again.',
        code: 'AUTH_ERROR',
        technical: error.message,
        retry: false,
        severity: 'high'
      }
    }

    // Validation errors
    if (error?.message?.includes('validation') || error?.name === 'ValidationError') {
      return {
        message: 'Please check your input and try again.',
        code: 'VALIDATION_ERROR',
        technical: error.message,
        retry: true,
        severity: 'low'
      }
    }

    // File upload errors
    if (error?.message?.includes('file') || error?.message?.includes('upload')) {
      return {
        message: 'File upload failed. Please try again with a smaller file.',
        code: 'UPLOAD_ERROR',
        technical: error.message,
        retry: true,
        severity: 'medium'
      }
    }

    // Rate limit errors
    if (error?.status === 429 || error?.message?.includes('rate limit')) {
      return {
        message: 'Too many requests. Please wait a moment and try again.',
        code: 'RATE_LIMIT_ERROR',
        technical: error.message,
        retry: true,
        severity: 'medium'
      }
    }

    // Generic error
    return {
      message: 'An unexpected error occurred. Please try again.',
      code: 'GENERIC_ERROR',
      technical: error?.message || 'Unknown error',
      retry: true,
      severity: 'medium'
    }
  }

  /**
   * Handles Supabase/PostgreSQL specific errors
   */
  private static handleDatabaseError(error: any): AppError {
    const code = error.code || error.error_code

    switch (code) {
      case '23505': // Unique violation
        return {
          message: 'This item already exists. Please choose a different name.',
          code: 'DUPLICATE_ERROR',
          technical: error.message,
          retry: false,
          severity: 'low'
        }
      case '42501': // Insufficient privilege
      case 'PGRST301': // RLS policy violation
        return {
          message: 'You do not have permission to perform this action.',
          code: 'PERMISSION_ERROR',
          technical: error.message,
          retry: false,
          severity: 'high'
        }
      case '23503': // Foreign key violation
        return {
          message: 'Cannot delete this item because it is being used elsewhere.',
          code: 'REFERENCE_ERROR',
          technical: error.message,
          retry: false,
          severity: 'medium'
        }
      case 'PGRST116': // No rows found
        return {
          message: 'The requested item was not found.',
          code: 'NOT_FOUND_ERROR',
          technical: error.message,
          retry: false,
          severity: 'low'
        }
      case '23514': // Check violation
        return {
          message: 'Invalid data provided. Please check your input.',
          code: 'CONSTRAINT_ERROR',
          technical: error.message,
          retry: true,
          severity: 'medium'
        }
      case 'PGRST000': // Connection error
        return {
          message: 'Database connection error. Please try again.',
          code: 'CONNECTION_ERROR',
          technical: error.message,
          retry: true,
          severity: 'high'
        }
      default:
        return {
          message: 'Database error occurred. Please try again.',
          code: 'DATABASE_ERROR',
          technical: error.message,
          retry: true,
          severity: 'medium'
        }
    }
  }

  /**
   * Logs error and returns formatted error for UI
   */
  static handleError(error: any, context?: ErrorContext | string): AppError {
    const formattedError = this.formatError(error)
    
    // Convert string context to object
    const contextObj = typeof context === 'string' 
      ? { component: context } 
      : context || {}

    logger.error(`Error in ${contextObj.component || 'application'}`, {
      userMessage: formattedError.message,
      code: formattedError.code,
      technical: formattedError.technical,
      severity: formattedError.severity,
      originalError: error,
      ...contextObj
    })

    return formattedError
  }

  /**
   * React hook for error handling
   */
  static useErrorHandler() {
    return {
      handleError: (error: any, context?: ErrorContext | string) => 
        this.handleError(error, context),
      formatError: (error: any) => this.formatError(error)
    }
  }

  /**
   * Async wrapper with error handling
   */
  static async withErrorHandling<T>(
    operation: () => Promise<T>,
    context?: ErrorContext | string
  ): Promise<{ data?: T; error?: AppError }> {
    try {
      const data = await operation()
      return { data }
    } catch (error) {
      const appError = this.handleError(error, context)
      return { error: appError }
    }
  }

  /**
   * Retry mechanism for operations
   */
  static async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delayMs: number = 1000,
    context?: ErrorContext | string
  ): Promise<{ data?: T; error?: AppError }> {
    let lastError: any
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const data = await operation()
        return { data }
      } catch (error) {
        lastError = error
        
        const formattedError = this.formatError(error)
        
        // Don't retry if the error is not retryable
        if (!formattedError.retry) {
          return { error: this.handleError(error, context) }
        }
        
        // Don't retry on the last attempt
        if (attempt === maxRetries) {
          break
        }
        
        logger.warn(`Retry attempt ${attempt}/${maxRetries} failed`, {
          error: formattedError.message,
          context
        })
        
        // Wait before retrying with exponential backoff
        await new Promise(resolve => setTimeout(resolve, delayMs * attempt))
      }
    }
    
    return { error: this.handleError(lastError, context) }
  }
}

// Export hook for React components
export const useErrorHandler = ErrorHandler.useErrorHandler

// Export types
export type { ErrorContext }
