/**
 * Simplified error handling utility
 * Formats errors for user display
 */

export interface AppError {
  message: string
  code?: string
}

/**
 * Formats errors into user-friendly messages
 */
export function formatError(error: any): AppError {
  // Handle null/undefined
  if (!error) {
    return { message: 'An unknown error occurred', code: 'UNKNOWN' }
  }

  // Database/Supabase errors
  if (error.code) {
    switch (error.code) {
      case '23505':
        return { message: 'This item already exists', code: 'DUPLICATE' }
      case '42501':
      case 'PGRST301':
        return { message: 'Permission denied', code: 'PERMISSION' }
      case '23503':
        return { message: 'Cannot delete - item is being used', code: 'REFERENCE' }
      case 'PGRST116':
        return { message: 'Item not found', code: 'NOT_FOUND' }
      default:
        return { message: 'Database error occurred', code: 'DATABASE' }
    }
  }

  // Auth errors
  if (error.status === 401 || error.message?.includes('auth')) {
    return { message: 'Please log in again', code: 'AUTH' }
  }

  // Network errors
  if (error.name === 'NetworkError' || error.message?.includes('fetch')) {
    return { message: 'Connection error. Check your internet.', code: 'NETWORK' }
  }

  // Generic error
  return {
    message: error.message || 'Something went wrong',
    code: 'UNKNOWN'
  }
}

/**
 * Handles error with logging
 */
export function handleError(error: any, context?: string): AppError {
  const formatted = formatError(error)
  console.error(`Error${context ? ` in ${context}` : ''}:`, formatted, error)
  return formatted
}
