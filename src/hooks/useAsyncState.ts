/**
 * Unified Async State Hook
 * Consolidates the common pattern of loading, error, and data state management
 * Replaces duplicate useState patterns across the application
 */

import { useState, useCallback } from 'react'
import { ErrorHandler } from '@/lib/errorHandler'

export interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: string | null
  success: boolean
}

export interface AsyncActions<T> {
  setData: (data: T | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setSuccess: (success: boolean) => void
  clearError: () => void
  reset: () => void
  execute: (asyncFn: () => Promise<T>) => Promise<T | null>
}

/**
 * Unified async state management hook
 * Consolidates loading, error, success, and data state into a single hook
 */
export function useAsyncState<T = any>(initialData: T | null = null): AsyncState<T> & AsyncActions<T> {
  const [data, setData] = useState<T | null>(initialData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const reset = useCallback(() => {
    setData(initialData)
    setLoading(false)
    setError(null)
    setSuccess(false)
  }, [initialData])

  const execute = useCallback(async (asyncFn: () => Promise<T>): Promise<T | null> => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(false)
      
      const result = await asyncFn()
      
      setData(result)
      setSuccess(true)
      return result
    } catch (err: any) {
      const formattedError = ErrorHandler.formatError(err)
      setError(formattedError.message)
      setSuccess(false)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    // State
    data,
    loading,
    error,
    success,
    // Actions
    setData,
    setLoading,
    setError,
    setSuccess,
    clearError,
    reset,
    execute
  }
}

/**
 * Specialized hook for simple loading states (common pattern)
 * For when you only need loading and error states
 */
export function useLoadingState() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => setError(null), [])
  
  const withLoading = useCallback(async <T>(asyncFn: () => Promise<T>): Promise<T | null> => {
    try {
      setLoading(true)
      setError(null)
      return await asyncFn()
    } catch (err: any) {
      const formattedError = ErrorHandler.formatError(err)
      setError(formattedError.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { loading, error, setLoading, setError, clearError, withLoading }
}

/**
 * Hook for components that need submission states
 * Common pattern for forms and modals
 */
export function useSubmissionState() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const clearMessages = useCallback(() => {
    setError(null)
    setSuccess(false)
  }, [])

  const handleSubmission = useCallback(async <T>(
    submitFn: () => Promise<T>,
    onSuccess?: (result: T) => void
  ): Promise<boolean> => {
    try {
      setIsSubmitting(true)
      setError(null)
      setSuccess(false)
      
      const result = await submitFn()
      
      setSuccess(true)
      if (onSuccess) onSuccess(result)
      return true
    } catch (err: any) {
      const formattedError = ErrorHandler.formatError(err)
      setError(formattedError.message)
      return false
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  return {
    isSubmitting,
    error,
    success,
    setError,
    setSuccess,
    clearMessages,
    handleSubmission
  }
}