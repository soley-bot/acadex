import { logger } from './logger'

/**
 * Centralized error handling utility
 */

export interface AppError {
  message: string
  code?: string
  technical?: string
  retry?: boolean
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
        retry: true
      }
    }

    // Authentication errors
    if (error?.message?.includes('auth')) {
      return {
        message: 'Authentication error. Please log in again.',
        code: 'AUTH_ERROR',
        technical: error.message,
        retry: false
      }
    }

    // File upload errors
    if (error?.message?.includes('file') || error?.message?.includes('upload')) {
      return {
        message: 'File upload failed. Please try again with a smaller file.',
        code: 'UPLOAD_ERROR',
        technical: error.message,
        retry: true
      }
    }

    // Generic error
    return {
      message: 'An unexpected error occurred. Please try again.',
      code: 'GENERIC_ERROR',
      technical: error?.message || 'Unknown error',
      retry: true
    }
  }

  /**
   * Handles Supabase/PostgreSQL specific errors
   */
  private static handleDatabaseError(error: any): AppError {
    const commonErrors: Record<string, string> = {
      '23505': 'This item already exists. Please use a different name.',
      '23503': 'Cannot delete this item because it is being used elsewhere.',
      '42P01': 'Database table not found. Please contact support.',
      '42501': 'You do not have permission to perform this action.',
      'PGRST116': 'No data found matching your request.',
      'PGRST301': 'You do not have permission to access this data.'
    }

    const userMessage = commonErrors[error.code] || 'Database error occurred.'

    return {
      message: userMessage,
      code: error.code,
      technical: error.message,
      retry: !['23505', '42501', 'PGRST301'].includes(error.code)
    }
  }

  /**
   * Logs error and returns formatted error for UI
   */
  static handleError(error: any, context?: string): AppError {
    const formattedError = this.formatError(error)
    
    logger.error(`Error in ${context || 'application'}`, {
      userMessage: formattedError.message,
      code: formattedError.code,
      technical: formattedError.technical,
      originalError: error
    })

    return formattedError
  }
}

/**
 * Hook for handling errors in React components
 */
export function useErrorHandler() {
  const handleError = (error: any, context?: string) => {
    return ErrorHandler.handleError(error, context)
  }

  return { handleError }
}
