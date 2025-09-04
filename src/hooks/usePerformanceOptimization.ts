import { useCallback, useEffect, useRef, useState } from 'react'
import { logger } from '@/lib/logger'

interface PerformanceMetrics {
  renderCount: number
  lastRenderTime: number
  averageRenderTime: number
  componentName: string
  slowRenders: number
  renderTimes: number[]
}

interface UsePerformanceMonitorOptions {
  componentName: string
  threshold?: number // ms - renders slower than this are considered slow
  maxSamples?: number // Maximum number of render times to keep
  logSlowRenders?: boolean
}

export const usePerformanceMonitor = ({
  componentName,
  threshold = 16, // 16ms for 60fps
  maxSamples = 100,
  logSlowRenders = true
}: UsePerformanceMonitorOptions) => {
  const renderStartTime = useRef<number>(Date.now())
  const metricsRef = useRef<PerformanceMetrics>({
    renderCount: 0,
    lastRenderTime: 0,
    averageRenderTime: 0,
    componentName,
    slowRenders: 0,
    renderTimes: []
  })

  const [metrics, setMetrics] = useState<PerformanceMetrics>(metricsRef.current)

  // Start timing before render
  renderStartTime.current = performance.now()

  useEffect(() => {
    // End timing after render
    const renderEndTime = performance.now()
    const renderTime = renderEndTime - renderStartTime.current

    const currentMetrics = metricsRef.current
    currentMetrics.renderCount += 1
    currentMetrics.lastRenderTime = renderTime

    // Track render times for average calculation
    currentMetrics.renderTimes.push(renderTime)
    if (currentMetrics.renderTimes.length > maxSamples) {
      currentMetrics.renderTimes.shift()
    }

    // Calculate average
    currentMetrics.averageRenderTime = currentMetrics.renderTimes.reduce((a, b) => a + b, 0) / currentMetrics.renderTimes.length

    // Track slow renders
    if (renderTime > threshold) {
      currentMetrics.slowRenders += 1
      if (logSlowRenders) {
        logger.warn('Slow render detected', {
          componentName,
          renderTime,
          threshold,
          renderCount: currentMetrics.renderCount
        })
      }
    }

    // Update state to trigger re-render of monitoring UI if needed
    setMetrics({ ...currentMetrics })
  }, [maxSamples, threshold, logSlowRenders, componentName])

  const getReport = useCallback(() => {
    const current = metricsRef.current
    return {
      ...current,
      slowRenderPercentage: (current.slowRenders / current.renderCount) * 100,
      isPerformant: current.averageRenderTime <= threshold,
      maxRenderTime: Math.max(...current.renderTimes),
      minRenderTime: Math.min(...current.renderTimes)
    }
  }, [threshold])

  const reset = useCallback(() => {
    metricsRef.current = {
      renderCount: 0,
      lastRenderTime: 0,
      averageRenderTime: 0,
      componentName,
      slowRenders: 0,
      renderTimes: []
    }
    setMetrics({ ...metricsRef.current })
  }, [componentName])

  const logReport = useCallback(() => {
    const report = getReport()
    logger.info('Performance Report', report)
  }, [getReport])

  return {
    metrics,
    getReport,
    reset,
    logReport
  }
}

// Hook for measuring specific operations
export const useOperationTimer = () => {
  const startTime = useRef<number>(0)
  const operationTimes = useRef<Record<string, number[]>>({})

  const startTimer = useCallback((operationName: string) => {
    startTime.current = performance.now()
    if (!operationTimes.current[operationName]) {
      operationTimes.current[operationName] = []
    }
  }, [])

  const endTimer = useCallback((operationName: string) => {
    const endTime = performance.now()
    const duration = endTime - startTime.current
    
    if (operationTimes.current[operationName]) {
      operationTimes.current[operationName].push(duration)
      
      // Keep only last 50 measurements
      if (operationTimes.current[operationName].length > 50) {
        operationTimes.current[operationName].shift()
      }
    }

    return duration
  }, [])

  const getOperationStats = useCallback((operationName: string) => {
    const times = operationTimes.current[operationName] || []
    if (times.length === 0) return null

    const average = times.reduce((a, b) => a + b, 0) / times.length
    const max = Math.max(...times)
    const min = Math.min(...times)

    return {
      operationName,
      count: times.length,
      average,
      max,
      min,
      latest: times[times.length - 1]
    }
  }, [])

  const getAllStats = useCallback(() => {
    return Object.keys(operationTimes.current).map(getOperationStats).filter(Boolean)
  }, [getOperationStats])

  return {
    startTimer,
    endTimer,
    getOperationStats,
    getAllStats
  }
}
