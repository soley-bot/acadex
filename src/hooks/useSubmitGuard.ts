import { useRef, useState, useCallback } from 'react'

interface UseSubmitGuardOptions {
  onSuccess?: () => void
  onError?: (error: Error) => void
  resetDelay?: number // Delay before allowing retry (milliseconds)
}

interface UseSubmitGuardReturn {
  isSubmitting: boolean
  isSubmitted: boolean
  canSubmit: boolean
  handleSubmit: <T>(submitFn: () => Promise<T>) => Promise<T | null>
  reset: () => void
}

/**
 * Submit guard hook that prevents double submissions
 * Tracks submission state and prevents multiple concurrent submissions
 * 
 * @example
 * const { isSubmitting, canSubmit, handleSubmit } = useSubmitGuard({
 *   resetDelay: 2000,
 *   onSuccess: () => toast.success('Saved!'),
 *   onError: (err) => toast.error(err.message)
 * })
 * 
 * const onSubmit = async () => {
 *   await handleSubmit(async () => {
 *     return await api.save(data)
 *   })
 * }
 * 
 * <button disabled={!canSubmit || isSubmitting}>Submit</button>
 */
export function useSubmitGuard(
  options: UseSubmitGuardOptions = {}
): UseSubmitGuardReturn {
  const { onSuccess, onError, resetDelay = 0 } = options
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const submitRef = useRef(false)
  const resetTimeoutRef = useRef<NodeJS.Timeout>()

  const canSubmit = !isSubmitting && !submitRef.current

  const handleSubmit = useCallback(
    async <T,>(submitFn: () => Promise<T>): Promise<T | null> => {
      // Prevent double submission
      if (submitRef.current || isSubmitting) {
        console.warn('[useSubmitGuard] Submission already in progress')
        return null
      }

      submitRef.current = true
      setIsSubmitting(true)
      setIsSubmitted(false)

      try {
        const result = await submitFn()
        
        setIsSubmitted(true)
        onSuccess?.()

        // Allow retry after delay
        if (resetDelay > 0) {
          resetTimeoutRef.current = setTimeout(() => {
            submitRef.current = false
          }, resetDelay)
        }

        return result
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Submission failed')
        onError?.(err)
        
        // Allow retry immediately on error
        submitRef.current = false
        
        throw err
      } finally {
        setIsSubmitting(false)
      }
    },
    [isSubmitting, onSuccess, onError, resetDelay]
  )

  const reset = useCallback(() => {
    submitRef.current = false
    setIsSubmitting(false)
    setIsSubmitted(false)
    
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current)
    }
  }, [])

  return {
    isSubmitting,
    isSubmitted,
    canSubmit,
    handleSubmit,
    reset,
  }
}
