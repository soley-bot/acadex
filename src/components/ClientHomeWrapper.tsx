'use client'

import { useMemoryMonitor } from '@/lib/memory-optimization'
import { useEnhancedWebVitals } from '@/lib/safe-web-vitals'
import { useEffect } from 'react'

interface ClientHomeWrapperProps {
  children: React.ReactNode
}

/**
 * Client-side wrapper that adds performance monitoring to the home page
 * This is completely safe - it only observes and logs, no modifications
 */
export default function ClientHomeWrapper({ children }: ClientHomeWrapperProps) {
  // Safe memory monitoring (observation only)
  const memoryStats = useMemoryMonitor('HomePage')
  
  // Enhanced Web Vitals monitoring (observation only)  
  useEnhancedWebVitals((report) => {
    // Only log key metrics to reduce console noise
    if (process.env.NODE_ENV === 'development' && report.metric === 'LCP') {
      console.info(`🏠 Home Performance: ${report.value.toFixed(0)}ms`)
    }
  })
  
  // Optional: Log performance insights for debugging (reduced noise)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && memoryStats?.memoryUsage) {
      // Only log significant memory changes (>10MB difference)
      const currentMemory = memoryStats.memoryUsage / (1024 * 1024)
      const global = globalThis as any
      if (!global.lastMemoryLog || Math.abs(currentMemory - global.lastMemoryLog) > 10) {
        console.info(`🏠 Home Page Memory: ${currentMemory.toFixed(1)}MB`)
        global.lastMemoryLog = currentMemory
      }
    }
  }, [memoryStats])
  
  return <>{children}</>
}