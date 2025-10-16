import { useState, useEffect, useRef } from 'react'

interface UseFetchOptions extends RequestInit {
  skip?: boolean
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
}

interface UseFetchResult<T> {
  data: T | null
  loading: boolean
  error: Error | null
  refetch: () => void
}

/**
 * Fetch hook with automatic abort controller and race condition prevention
 * 
 * @example
 * const { data, loading, error, refetch } = useFetch('/api/data', {
 *   skip: !userId,
 *   onSuccess: (data) => console.log('Success!', data)
 * })
 */
export function useFetch<T = any>(
  url: string | null,
  options: UseFetchOptions = {}
): UseFetchResult<T> {
  const { skip = false, onSuccess, onError, ...fetchOptions } = options
  
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(!skip)
  const [error, setError] = useState<Error | null>(null)
  const [refetchTrigger, setRefetchTrigger] = useState(0)
  
  const controllerRef = useRef<AbortController>()
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (!url || skip) {
      setLoading(false)
      return
    }

    const fetchData = async () => {
      // Cancel previous request
      if (controllerRef.current) {
        controllerRef.current.abort()
      }

      controllerRef.current = new AbortController()
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(url, {
          ...fetchOptions,
          signal: controllerRef.current.signal,
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()

        if (mountedRef.current) {
          setData(result)
          setError(null)
          onSuccess?.(result)
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          // Request was cancelled, ignore
          return
        }

        const error = err instanceof Error ? err : new Error('Fetch failed')
        
        if (mountedRef.current) {
          setError(error)
          setData(null)
          onError?.(error)
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, skip, refetchTrigger])

  const refetch = () => {
    setRefetchTrigger(prev => prev + 1)
  }

  return { data, loading, error, refetch }
}
