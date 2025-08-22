'use client'

import { useEffect, useCallback, useRef } from 'react'

interface PerformanceMetrics {
  renderTime: number
  interactionTime: number
  memoryUsage?: number
}

export function usePerformanceMonitor(componentName: string) {
  const startTimeRef = useRef<number>(Date.now())
  const renderCountRef = useRef<number>(0)
  const interactionStartRef = useRef<number | null>(null)

  // Track render performance
  useEffect(() => {
    renderCountRef.current += 1
    const renderTime = Date.now() - startTimeRef.current
    
    if (renderCountRef.current % 10 === 0) { // Log every 10 renders
      console.debug(`[PERF] ${componentName} - Renders: ${renderCountRef.current}, Last render: ${renderTime}ms`)
    }
  })

  // Track interaction performance
  const trackInteractionStart = useCallback(() => {
    interactionStartRef.current = Date.now()
  }, [])

  const trackInteractionEnd = useCallback((action: string) => {
    if (interactionStartRef.current) {
      const interactionTime = Date.now() - interactionStartRef.current
      console.debug(`[PERF] ${componentName} - ${action}: ${interactionTime}ms`)
      interactionStartRef.current = null
    }
  }, [componentName])

  // Get current performance metrics
  const getMetrics = useCallback((): PerformanceMetrics => {
    const now = Date.now()
    return {
      renderTime: now - startTimeRef.current,
      interactionTime: interactionStartRef.current ? now - interactionStartRef.current : 0,
      memoryUsage: (performance as any).memory?.usedJSHeapSize || undefined
    }
  }, [])

  return {
    trackInteractionStart,
    trackInteractionEnd,
    getMetrics,
    renderCount: renderCountRef.current
  }
}

// Memory usage optimization hook
export function useMemoryOptimization() {
  const cleanupFunctions = useRef<Array<() => void>>([])

  const addCleanup = useCallback((cleanup: () => void) => {
    cleanupFunctions.current.push(cleanup)
  }, [])

  const forceCleanup = useCallback(() => {
    cleanupFunctions.current.forEach(cleanup => cleanup())
    cleanupFunctions.current = []
    
    // Force garbage collection if available (development only)
    if (typeof window !== 'undefined' && (window as any).gc) {
      (window as any).gc()
    }
  }, [])

  useEffect(() => {
    return () => {
      forceCleanup()
    }
  }, [forceCleanup])

  return { addCleanup, forceCleanup }
}
