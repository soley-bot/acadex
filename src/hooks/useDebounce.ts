import { useState, useEffect, useRef } from 'react'

/**
 * Debounce hook that delays updating a value until after a specified delay
 * Prevents excessive API calls from search inputs or filters
 * 
 * @example
 * const [searchQuery, setSearchQuery] = useState('')
 * const debouncedQuery = useDebounce(searchQuery, 300)
 * 
 * useEffect(() => {
 *   if (debouncedQuery) {
 *     searchAPI(debouncedQuery)
 *   }
 * }, [debouncedQuery])
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Debounced callback hook
 * 
 * @example
 * const debouncedSearch = useDebouncedCallback((query: string) => {
 *   searchAPI(query)
 * }, 300)
 * 
 * onChange={(e) => debouncedSearch(e.target.value)}
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      callback(...args)
    }, delay)
  }
}
