// QuizForm Monitoring & Error Tracking
// Comprehensive monitoring for QuizForm improvements with performance tracking

import { logger } from './logger'

// Performance metrics interface
export interface PerformanceMetrics {
  renderTime: number
  interactionLatency: number
  memoryUsage?: number
  bundleSize?: number
  questionCount: number
  timestamp: number
}

// User interaction tracking
export interface UserInteraction {
  action: string
  questionIndex?: number
  questionType?: string
  duration: number
  feature?: string
  userId?: string
  timestamp: number
}

// Error context for better debugging
export interface ErrorContext {
  component: string
  action: string
  questionIndex?: number
  questionType?: string
  userId?: string
  formData?: any
  featureFlags?: Record<string, boolean>
  timestamp: number
}

// QuizForm specific monitoring class
class QuizFormMonitor {
  private startTime: number = 0
  private interactions: UserInteraction[] = []
  private performanceObserver?: PerformanceObserver
  
  constructor() {
    this.initializePerformanceTracking()
  }
  
  // Initialize performance tracking
  private initializePerformanceTracking() {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      try {
        this.performanceObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry) => {
            if (entry.name.includes('QuizForm')) {
              this.trackPerformanceEntry(entry)
            }
          })
        })
        
        this.performanceObserver.observe({ entryTypes: ['measure', 'navigation'] })
      } catch (error) {
        logger.warn('Performance Observer not available', { error })
      }
    }
  }
  
  // Start timing an operation
  startTiming(operation: string): void {
    this.startTime = performance.now()
    if (typeof window !== 'undefined') {
      performance.mark(`QuizForm-${operation}-start`)
    }
  }
  
  // End timing and record metrics
  endTiming(operation: string, context?: any): number {
    const endTime = performance.now()
    const duration = endTime - this.startTime
    
    if (typeof window !== 'undefined') {
      performance.mark(`QuizForm-${operation}-end`)
      performance.measure(
        `QuizForm-${operation}`,
        `QuizForm-${operation}-start`,
        `QuizForm-${operation}-end`
      )
    }
    
    this.trackPerformance({
      operation,
      duration,
      context,
      timestamp: Date.now()
    })
    
    return duration
  }
  
  // Track user interactions
  trackInteraction(interaction: Omit<UserInteraction, 'timestamp'>): void {
    const fullInteraction: UserInteraction = {
      ...interaction,
      timestamp: Date.now()
    }
    
    this.interactions.push(fullInteraction)
    
    // Log significant interactions
    if (interaction.duration > 5000) {
      logger.warn('Slow user interaction detected', fullInteraction)
    }
    
    // Send to analytics (in production, this would be your analytics service)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'quiz_form_interaction', {
        action: interaction.action,
        duration: interaction.duration,
        question_type: interaction.questionType,
        feature: interaction.feature
      })
    }
  }
  
  // Track performance metrics
  trackPerformance(metrics: {
    operation: string
    duration: number
    context?: any
    timestamp: number
  }): void {
    // Log performance issues
    if (metrics.duration > 1000) {
      logger.warn('Slow QuizForm operation detected', metrics)
    }
    
    // Store performance data
    if (typeof window !== 'undefined') {
      const perfData = localStorage.getItem('quizform-performance')
      const existing = perfData ? JSON.parse(perfData) : []
      existing.push(metrics)
      
      // Keep only last 100 entries
      if (existing.length > 100) {
        existing.splice(0, existing.length - 100)
      }
      
      localStorage.setItem('quizform-performance', JSON.stringify(existing))
    }
  }
  
  // Handle performance observer entries
  private trackPerformanceEntry(entry: PerformanceEntry): void {
    const metrics: PerformanceMetrics = {
      renderTime: entry.duration,
      interactionLatency: 0,
      questionCount: 0,
      timestamp: Date.now()
    }
    
    logger.debug('QuizForm performance entry', { entry, metrics })
  }
  
  // Track errors with rich context
  trackError(error: Error, context: ErrorContext): void {
    const errorData = {
      message: error.message,
      stack: error.stack,
      context,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
      url: typeof window !== 'undefined' ? window.location.href : 'server',
      timestamp: Date.now()
    }
    
    // Log error
    logger.error('QuizForm error', errorData)
    
    // Send to error tracking service (e.g., Sentry)
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        tags: {
          component: context.component,
          action: context.action,
          questionType: context.questionType
        },
        extra: context
      })
    }
    
    // Store error for debugging
    if (typeof window !== 'undefined') {
      const errorLog = localStorage.getItem('quizform-errors')
      const existing = errorLog ? JSON.parse(errorLog) : []
      existing.push(errorData)
      
      // Keep only last 50 errors
      if (existing.length > 50) {
        existing.splice(0, existing.length - 50)
      }
      
      localStorage.setItem('quizform-errors', JSON.stringify(existing))
    }
  }
  
  // Get performance summary
  getPerformanceSummary(): {
    averageRenderTime: number
    slowOperations: number
    totalInteractions: number
    errorRate: number
  } {
    const perfData = typeof window !== 'undefined' 
      ? JSON.parse(localStorage.getItem('quizform-performance') || '[]')
      : []
      
    const errorData = typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('quizform-errors') || '[]')
      : []
    
    const renderTimes = perfData.map((p: any) => p.duration).filter((d: number) => d > 0)
    const averageRenderTime = renderTimes.length > 0 
      ? renderTimes.reduce((a: number, b: number) => a + b, 0) / renderTimes.length 
      : 0
    
    return {
      averageRenderTime,
      slowOperations: perfData.filter((p: any) => p.duration > 1000).length,
      totalInteractions: this.interactions.length,
      errorRate: errorData.length > 0 ? errorData.length / (this.interactions.length || 1) : 0
    }
  }
  
  // Clear stored data
  clearStoredData(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('quizform-performance')
      localStorage.removeItem('quizform-errors')
    }
    this.interactions = []
  }
  
  // Health check for monitoring
  healthCheck(): {
    status: 'healthy' | 'warning' | 'error'
    issues: string[]
    metrics: any
  } {
    const summary = this.getPerformanceSummary()
    const issues: string[] = []
    let status: 'healthy' | 'warning' | 'error' = 'healthy'
    
    if (summary.averageRenderTime > 1000) {
      issues.push('Slow render times detected')
      status = 'warning'
    }
    
    if (summary.errorRate > 0.05) {
      issues.push('High error rate detected')
      status = 'error'
    }
    
    if (summary.slowOperations > 10) {
      issues.push('Multiple slow operations detected')
      status = 'warning'
    }
    
    return {
      status,
      issues,
      metrics: summary
    }
  }
}

// Create singleton instance
export const quizFormMonitor = new QuizFormMonitor()

// Convenience export for form event tracking
export function trackFormEvent(action: string, data?: any): void {
  quizFormMonitor.trackInteraction({
    action,
    duration: 0,
    ...data
  })
}

// Convenience functions for common monitoring patterns
export function withPerformanceTracking<T>(
  operation: string,
  fn: () => T | Promise<T>,
  context?: any
): T | Promise<T> {
  quizFormMonitor.startTiming(operation)
  
  try {
    const result = fn()
    
    // Handle both sync and async functions
    if (result instanceof Promise) {
      return result
        .then(value => {
          quizFormMonitor.endTiming(operation, context)
          return value
        })
        .catch(error => {
          quizFormMonitor.endTiming(operation, context)
          throw error
        })
    } else {
      quizFormMonitor.endTiming(operation, context)
      return result
    }
  } catch (error) {
    quizFormMonitor.endTiming(operation, context)
    throw error
  }
}

// Error boundary helper for React components
export function withErrorTracking(
  error: Error,
  errorInfo: any,
  component: string
): void {
  quizFormMonitor.trackError(error, {
    component,
    action: 'render',
    timestamp: Date.now(),
    ...errorInfo
  })
}

// Hook for tracking component lifecycle
export function useQuizFormMonitoring(component: string) {
  return {
    trackInteraction: (interaction: Omit<UserInteraction, 'timestamp'>) => {
      quizFormMonitor.trackInteraction(interaction)
    },
    
    trackError: (error: Error, context: Partial<ErrorContext>) => {
      quizFormMonitor.trackError(error, {
        component,
        ...context,
        timestamp: Date.now()
      } as ErrorContext)
    },
    
    startTiming: (operation: string) => {
      quizFormMonitor.startTiming(`${component}-${operation}`)
    },
    
    endTiming: (operation: string, context?: any) => {
      return quizFormMonitor.endTiming(`${component}-${operation}`, context)
    }
  }
}

// Development helpers
export function enableDebugMode(): void {
  if (process.env.NODE_ENV === 'development') {
    (window as any).quizFormMonitor = quizFormMonitor
    console.log('🔍 QuizForm debug mode enabled. Access via window.quizFormMonitor')
  }
}

export function getDebugInfo(): any {
  return {
    performanceSummary: quizFormMonitor.getPerformanceSummary(),
    healthCheck: quizFormMonitor.healthCheck(),
    recentInteractions: quizFormMonitor['interactions'].slice(-10)
  }
}
