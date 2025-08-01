'use client'

import { logger } from '@/lib/logger'

import { useEffect } from 'react'

export default function PerformanceMonitor() {
  useEffect(() => {
    // Only in development
    if (process.env.NODE_ENV === 'development') {
      // Monitor Core Web Vitals
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if ('value' in entry) {
            logger.debug(`${entry.name}: ${(entry as any).value}ms`)
          } else if ('duration' in entry) {
            logger.debug(`${entry.name}: ${entry.duration}ms`)
          }
        })
      })

      observer.observe({ entryTypes: ['measure', 'navigation'] })
      
      // Monitor bundle size
      if ('memory' in performance) {
        const memInfo = (performance as any).memory
        logger.debug('Memory Usage:', {
          used: Math.round(memInfo.usedJSHeapSize / 1048576) + 'MB',
          total: Math.round(memInfo.totalJSHeapSize / 1048576) + 'MB',
          limit: Math.round(memInfo.jsHeapSizeLimit / 1048576) + 'MB'
        })
      }

      return () => observer.disconnect()
    }
  }, [])

  return null
}
