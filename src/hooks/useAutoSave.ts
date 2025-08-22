'use client'

import { useCallback, useEffect, useRef } from 'react'

interface UseAutoSaveOptions<T> {
  data: T
  onSave: (data: T) => Promise<void>
  delay?: number
  enabled?: boolean
}

// Simple debounce function to avoid lodash dependency issues
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T & { cancel: () => void } {
  let timeoutId: NodeJS.Timeout | null = null
  
  const debounced = ((...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), wait)
  }) as T & { cancel: () => void }
  
  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }
  
  return debounced
}

export function useAutoSave<T>({ 
  data, 
  onSave, 
  delay = 2000, 
  enabled = true 
}: UseAutoSaveOptions<T>) {
  const previousDataRef = useRef<T>(data)
  const isInitialMount = useRef(true)
  
  const debouncedSave = useCallback(() => {
    return debounce(async (dataToSave: T) => {
      try {
        await onSave(dataToSave)
      } catch (error) {
        console.error('Auto-save failed:', error)
      }
    }, delay)
  }, [onSave, delay])

  const debouncedSaveInstance = useRef(debouncedSave())

  useEffect(() => {
    debouncedSaveInstance.current = debouncedSave()
  }, [debouncedSave])

  useEffect(() => {
    // Skip auto-save on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false
      previousDataRef.current = data
      return
    }

    // Skip if auto-save is disabled
    if (!enabled) return

    // Only save if data has actually changed
    if (JSON.stringify(data) !== JSON.stringify(previousDataRef.current)) {
      debouncedSaveInstance.current(data)
      previousDataRef.current = data
    }
  }, [data, enabled])

  // Cleanup function to cancel pending saves
  useEffect(() => {
    return () => {
      debouncedSaveInstance.current.cancel()
    }
  }, [])

  // Manual save function
  const saveNow = useCallback(async () => {
    debouncedSaveInstance.current.cancel()
    await onSave(data)
  }, [data, onSave])

  return { saveNow }
}
