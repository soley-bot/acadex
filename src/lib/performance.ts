/**
 * Performance optimization utilities
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

/**
 * Debounce hook for search inputs and API calls
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
 * Throttle hook for scroll events and frequent updates
 */
export function useThrottle<T>(value: T, limit: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value)
  const lastExecuted = useRef<number>(Date.now())

  useEffect(() => {
    if (Date.now() >= lastExecuted.current + limit) {
      lastExecuted.current = Date.now()
      setThrottledValue(value)
    } else {
      const timerId = setTimeout(() => {
        lastExecuted.current = Date.now()
        setThrottledValue(value)
      }, limit)

      return () => clearTimeout(timerId)
    }
  }, [value, limit])

  return throttledValue
}

/**
 * Intersection Observer hook for lazy loading
 */
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  { threshold = 0, root = null, rootMargin = '0%' }: IntersectionObserverInit = {}
): boolean {
  const [isIntersecting, setIsIntersecting] = useState<boolean>(false)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry) {
          setIsIntersecting(entry.isIntersecting)
        }
      },
      { threshold, root, rootMargin }
    )

    observer.observe(element)
    return () => observer.unobserve(element)
  }, [elementRef, threshold, root, rootMargin])

  return isIntersecting
}

/**
 * Lazy loading component for images and heavy content
 */
interface LazyLoadProps {
  children: React.ReactNode
  placeholder?: React.ReactNode
  threshold?: number
  className?: string
}

export function LazyLoad({ 
  children, 
  placeholder, 
  threshold = 0.1,
  className 
}: LazyLoadProps) {
  const defaultPlaceholder = React.createElement('div', {}, 'Loading...')
  const ref = useRef<HTMLDivElement>(null)
  const isVisible = useIntersectionObserver(ref, { threshold })
  const [hasLoaded, setHasLoaded] = useState(false)

  useEffect(() => {
    if (isVisible && !hasLoaded) {
      setHasLoaded(true)
    }
  }, [isVisible, hasLoaded])

  return React.createElement(
    'div', 
    { ref, className },
    hasLoaded ? children : (placeholder || defaultPlaceholder)
  )
}

/**
 * Virtual list for handling large datasets
 */
interface VirtualListProps<T> {
  items: T[]
  itemHeight: number
  containerHeight: number
  renderItem: (item: T, index: number) => React.ReactNode
  overscan?: number
}

export function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 3
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0)
  const scrollElementRef = useRef<HTMLDivElement>(null)

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(
    items.length - 1,
    Math.floor((scrollTop + containerHeight) / itemHeight) + overscan
  )

  const visibleItems = items.slice(startIndex, endIndex + 1)

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  return React.createElement(
    'div',
    {
      ref: scrollElementRef,
      style: { height: containerHeight, overflow: 'auto' },
      onScroll: handleScroll
    },
    React.createElement(
      'div',
      { style: { height: items.length * itemHeight, position: 'relative' } },
      React.createElement(
        'div',
        { style: { transform: `translateY(${startIndex * itemHeight}px)` } },
        visibleItems.map((item, index) => renderItem(item, startIndex + index))
      )
    )
  )
}

/**
 * Memoized search function for filtering large datasets
 */
export function useSearch<T>(
  items: T[],
  searchTerm: string,
  searchKeys: (keyof T)[],
  debounceMs: number = 300
) {
  const debouncedSearchTerm = useDebounce(searchTerm, debounceMs)

  const filteredItems = useMemo(() => {
    if (!debouncedSearchTerm) return items

    const lowercaseSearchTerm = debouncedSearchTerm.toLowerCase()

    return items.filter(item =>
      searchKeys.some(key => {
        const value = item[key]
        return String(value).toLowerCase().includes(lowercaseSearchTerm)
      })
    )
  }, [items, debouncedSearchTerm, searchKeys])

  return filteredItems
}

/**
 * Image preloader for better user experience
 */
export function useImagePreloader(imageSources: string[]) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const imagePromises = imageSources.map(src => {
      return new Promise<string>((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve(src)
        img.onerror = () => reject(src)
        img.src = src
      })
    })

    Promise.allSettled(imagePromises).then(results => {
      const loaded = new Set<string>()
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && imageSources[index]) {
          loaded.add(imageSources[index])
        }
      })
      setLoadedImages(loaded)
      setIsLoading(false)
    })
  }, [imageSources])

  return { loadedImages, isLoading }
}

/**
 * Batch API calls to reduce server load
 */
export class BatchProcessor<T, R> {
  private batch: Array<T & { resolve: (value: R) => void; reject: (error: any) => void }> = []
  private readonly batchSize: number
  private readonly delayMs: number
  private readonly processor: (batch: T[]) => Promise<R[]>
  private timeout: NodeJS.Timeout | null = null

  constructor(
    processor: (batch: T[]) => Promise<R[]>,
    batchSize: number = 10,
    delayMs: number = 100
  ) {
    this.processor = processor
    this.batchSize = batchSize
    this.delayMs = delayMs
  }

  add(item: T): Promise<R> {
    return new Promise((resolve, reject) => {
      this.batch.push({ ...item, resolve, reject } as T & { resolve: (value: R) => void; reject: (error: any) => void })

      if (this.batch.length >= this.batchSize) {
        this.processBatch()
      } else if (!this.timeout) {
        this.timeout = setTimeout(() => this.processBatch(), this.delayMs)
      }
    })
  }

  private async processBatch() {
    if (this.timeout) {
      clearTimeout(this.timeout)
      this.timeout = null
    }

    const currentBatch = this.batch.splice(0, this.batchSize)
    if (currentBatch.length === 0) return

    try {
      const items = currentBatch.map(({ resolve, reject, ...item }) => item as T)
      const results = await this.processor(items)
      
      currentBatch.forEach((item, index) => {
        const result = results[index]
        if (result !== undefined) {
          item.resolve(result)
        } else {
          item.reject(new Error('No result for batch item'))
        }
      })
    } catch (error) {
      currentBatch.forEach((item) => {
        item.reject(error)
      })
    }
  }
}

// ==============================================
// QUERY PERFORMANCE MONITORING (Legacy)
// ==============================================

import { logger } from '@/lib/logger'

export class QueryPerformance {
  private static measurements: Record<string, number[]> = {}

  static async measure<T>(queryName: string, queryFn: () => Promise<T>): Promise<T> {
    const start = Date.now()
    try {
      const result = await queryFn()
      const duration = Date.now() - start
      
      if (!this.measurements[queryName]) {
        this.measurements[queryName] = []
      }
      this.measurements[queryName].push(duration)

      // Log slow queries
      if (duration > 1000) {
        logger.warn(`🐌 Slow query: ${queryName} took ${duration}ms`)
      }

      return result
    } catch (error) {
      const duration = Date.now() - start
      logger.error(`❌ Query failed: ${queryName} after ${duration}ms`, error)
      throw error
    }
  }

  static getStats() {
    const stats: Record<string, { avg: number, count: number, max: number }> = {}
    
    Object.entries(this.measurements).forEach(([query, times]) => {
      stats[query] = {
        avg: Math.round(times.reduce((a, b) => a + b, 0) / times.length),
        count: times.length,
        max: Math.max(...times)
      }
    })

    return stats
  }

  static clearStats() {
    this.measurements = {}
  }
}
