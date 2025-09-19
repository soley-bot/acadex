'use client'

import { useEffect, useCallback } from 'react'
import { onCLS, onINP, onFCP, onLCP, onTTFB, Metric } from 'web-vitals'

interface WebVitalsConfig {
  enabled?: boolean
  debug?: boolean
  reportToAnalytics?: boolean
  thresholds?: {
    lcp: number
    inp: number // Changed from fid to inp (Interaction to Next Paint)
    cls: number
    fcp: number
    ttfb: number
  }
}

const defaultConfig: WebVitalsConfig = {
  enabled: process.env.NODE_ENV === 'production',
  debug: process.env.NODE_ENV === 'development',
  reportToAnalytics: true,
  thresholds: {
    lcp: 2500, // 2.5s
    inp: 200,  // 200ms (replaced FID)
    cls: 0.1,  // 0.1
    fcp: 1800, // 1.8s
    ttfb: 800  // 800ms
  }
}

export default function CoreWebVitalsMonitor({ config = defaultConfig }: { config?: WebVitalsConfig }) {
  const reportMetric = useCallback((metric: Metric) => {
    const { name, value, rating, delta } = metric
    const threshold = config.thresholds?.[name.toLowerCase() as keyof typeof config.thresholds]
    
    if (config.debug) {
      console.group(`🔍 Core Web Vital: ${name}`)
      console.log(`Value: ${value}`)
      console.log(`Rating: ${rating}`)
      console.log(`Delta: ${delta}`)
      console.log(`Threshold: ${threshold}`)
      console.log(`Status: ${threshold && value > threshold ? '❌ POOR' : '✅ GOOD'}`)
      console.groupEnd()
    }

    // Report to analytics service
    if (config.reportToAnalytics && typeof window !== 'undefined') {
      // Google Analytics 4
      if ('gtag' in window) {
        ;(window as any).gtag('event', name, {
          event_category: 'Core Web Vitals',
          value: Math.round(name === 'CLS' ? value * 1000 : value),
          custom_parameter_1: rating,
          non_interaction: true,
        })
      }

      // Custom analytics endpoint
      fetch('/api/analytics/web-vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metric: name,
          value,
          rating,
          delta,
          url: window.location.pathname,
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          connection: (navigator as any).connection?.effectiveType
        })
      }).catch(err => {
        if (config.debug) {
          console.warn('Failed to report web vitals:', err)
        }
      })
    }

    // Performance warnings for development
    if (config.debug && threshold && value > threshold) {
      console.warn(`⚠️ ${name} exceeded threshold: ${value} > ${threshold}`)
      
      // Specific optimization suggestions
      const suggestions = {
        LCP: [
          'Optimize images with next/image',
          'Enable image preloading for hero images',
          'Reduce server response times',
          'Use CDN for static assets'
        ],
        INP: [
          'Minimize JavaScript execution time', 
          'Code split large bundles',
          'Use web workers for heavy computations',
          'Optimize third-party scripts'
        ],
        CLS: [
          'Set explicit dimensions for images and videos',
          'Reserve space for dynamic content',
          'Avoid inserting content above existing content',
          'Use transform animations instead of layout changes'
        ],
        FCP: [
          'Minimize render-blocking resources',
          'Inline critical CSS',
          'Optimize web fonts loading',
          'Use efficient cache policies'
        ],
        TTFB: [
          'Optimize server response times',
          'Use CDN for static content',
          'Implement proper caching strategies',
          'Optimize database queries'
        ]
      }

      console.group(`💡 Optimization suggestions for ${name}:`)
      suggestions[name as keyof typeof suggestions]?.forEach(suggestion => 
        console.log(`• ${suggestion}`)
      )
      console.groupEnd()
    }
  }, [config])

  useEffect(() => {
    if (!config.enabled) return

    // Initialize Core Web Vitals monitoring
    onCLS(reportMetric)
    onINP(reportMetric) // Replaces getFID in web-vitals v5
    onFCP(reportMetric)
    onLCP(reportMetric)
    onTTFB(reportMetric)

    // Bundle analysis in development
    if (config.debug) {
      console.log('🚀 Core Web Vitals monitoring initialized')
      console.log('🎯 Performance thresholds:', config.thresholds)
      
      // Log initial performance state
      if (typeof window !== 'undefined' && 'performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        console.group('📊 Initial Performance Metrics')
        console.log(`DNS Lookup: ${Math.round(navigation.domainLookupEnd - navigation.domainLookupStart)}ms`)
        console.log(`Connection: ${Math.round(navigation.connectEnd - navigation.connectStart)}ms`)
        console.log(`Request: ${Math.round(navigation.responseStart - navigation.requestStart)}ms`)
        console.log(`Response: ${Math.round(navigation.responseEnd - navigation.responseStart)}ms`)
        console.log(`DOM Processing: ${Math.round(navigation.domComplete - navigation.domContentLoadedEventStart)}ms`)
        console.groupEnd()
      }
    }
  }, [config.enabled, config.debug, config.thresholds, reportMetric])

  // Performance observer for additional metrics
  useEffect(() => {
    if (!config.enabled || typeof window === 'undefined') return

    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'longtask' && entry.duration > 50) {
            if (config.debug) {
              console.warn(`🐌 Long task detected: ${Math.round(entry.duration)}ms`)
            }
          }
        })
      })

      try {
        observer.observe({ type: 'longtask', buffered: true })
      } catch (e) {
        // Long task observer not supported
      }

      return () => observer.disconnect()
    }
  }, [config.enabled, config.debug])

  return null
}

// Hook for component-level performance monitoring
export function useWebVitalsMonitoring(componentName: string) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔧 Performance monitoring active for: ${componentName}`)
      
      const startTime = performance.now()
      
      return () => {
        const endTime = performance.now()
        const renderTime = endTime - startTime
        
        if (renderTime > 16) { // > 1 frame at 60fps
          console.warn(`⚠️ Slow component render: ${componentName} took ${Math.round(renderTime)}ms`)
        }
      }
    }
  }, [componentName])
}