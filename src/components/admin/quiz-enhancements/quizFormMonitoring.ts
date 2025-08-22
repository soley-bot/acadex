/**
 * Quiz Form Monitoring and Analytics
 * Tracks user interactions and performance metrics
 */

import { logger } from '@/lib/logger'

interface MonitoringEvent {
  event: string
  data: Record<string, any>
  timestamp: Date
  userId?: string
}

interface ValidationMetrics {
  totalErrors: number
  errorTypes: string[]
  questionCount: number
  quizId?: string
}

interface PerformanceMetric {
  operation: string
  duration: number
  timestamp: Date
  context?: Record<string, any>
}

// In-memory storage for development (should be replaced with proper analytics)
let events: MonitoringEvent[] = []
let performanceMetrics: PerformanceMetric[] = []

/**
 * Initialize monitoring system
 */
export const initializeMonitoring = (): void => {
  try {
    logger.info('Quiz Form Monitoring initialized')
    
    // Clear old events (keep last 1000 for memory management)
    if (events.length > 1000) {
      events = events.slice(-1000)
    }
    
    if (performanceMetrics.length > 1000) {
      performanceMetrics = performanceMetrics.slice(-1000)
    }
    
  } catch (error) {
    logger.error('Failed to initialize monitoring:', error)
  }
}

/**
 * Track quiz form events
 */
export const trackQuizFormEvent = (
  event: string, 
  data: Record<string, any> = {}
): void => {
  try {
    const monitoringEvent: MonitoringEvent = {
      event,
      data,
      timestamp: new Date(),
      userId: data.userId
    }
    
    events.push(monitoringEvent)
    
    // Log important events
    if (['form_opened', 'form_submitted', 'validation_failed'].includes(event)) {
      logger.info(`Quiz Form Event: ${event}`, data)
    }
    
  } catch (error) {
    logger.error('Failed to track quiz form event:', error)
  }
}

/**
 * Track validation results for analysis
 */
export const trackValidationResults = (metrics: ValidationMetrics): void => {
  try {
    trackQuizFormEvent('validation_results', {
      totalErrors: metrics.totalErrors,
      errorTypes: metrics.errorTypes,
      questionCount: metrics.questionCount,
      quizId: metrics.quizId,
      errorRate: metrics.totalErrors / Math.max(metrics.questionCount, 1)
    })
    
    // Log validation issues for debugging
    if (metrics.totalErrors > 0) {
      logger.warn(`Validation issues found: ${metrics.totalErrors} errors`, {
        errorTypes: metrics.errorTypes,
        questionCount: metrics.questionCount
      })
    }
    
  } catch (error) {
    logger.error('Failed to track validation results:', error)
  }
}

/**
 * Track performance metrics
 */
export const trackPerformance = (
  operation: string,
  startTime: number,
  context: Record<string, any> = {}
): void => {
  try {
    const duration = Date.now() - startTime
    
    const metric: PerformanceMetric = {
      operation,
      duration,
      timestamp: new Date(),
      context
    }
    
    performanceMetrics.push(metric)
    
    // Log slow operations
    if (duration > 1000) { // More than 1 second
      logger.warn(`Slow operation detected: ${operation} took ${duration}ms`, context)
    }
    
    trackQuizFormEvent('performance_metric', {
      operation,
      duration,
      ...context
    })
    
  } catch (error) {
    logger.error('Failed to track performance:', error)
  }
}

/**
 * Get monitoring statistics
 */
export const getMonitoringStats = (): {
  totalEvents: number
  recentEvents: MonitoringEvent[]
  performanceStats: {
    averageValidationTime: number
    slowOperations: PerformanceMetric[]
  }
} => {
  try {
    const recentEvents = events.slice(-50) // Last 50 events
    
    const validationMetrics = performanceMetrics.filter(m => 
      m.operation.includes('validation')
    )
    
    const averageValidationTime = validationMetrics.length > 0
      ? validationMetrics.reduce((sum, m) => sum + m.duration, 0) / validationMetrics.length
      : 0
    
    const slowOperations = performanceMetrics.filter(m => m.duration > 1000)
    
    return {
      totalEvents: events.length,
      recentEvents,
      performanceStats: {
        averageValidationTime,
        slowOperations
      }
    }
    
  } catch (error) {
    logger.error('Failed to get monitoring stats:', error)
    return {
      totalEvents: 0,
      recentEvents: [],
      performanceStats: {
        averageValidationTime: 0,
        slowOperations: []
      }
    }
  }
}

/**
 * Monitor form interaction patterns
 */
export const trackFormInteraction = (
  interaction: 'question_added' | 'question_deleted' | 'option_changed' | 'type_changed',
  context: Record<string, any> = {}
): void => {
  trackQuizFormEvent(`form_interaction_${interaction}`, context)
}

/**
 * Monitor save operations
 */
export const trackSaveOperation = (
  type: 'auto_save' | 'manual_save' | 'draft_save',
  success: boolean,
  duration: number,
  context: Record<string, any> = {}
): void => {
  trackQuizFormEvent(`save_operation`, {
    type,
    success,
    duration,
    ...context
  })
  
  if (!success) {
    logger.error(`Save operation failed: ${type}`, context)
  }
}

/**
 * Clear monitoring data (for testing/reset)
 */
export const clearMonitoringData = (): void => {
  events = []
  performanceMetrics = []
  logger.info('Monitoring data cleared')
}

/**
 * Export monitoring data for analysis
 */
export const exportMonitoringData = (): {
  events: MonitoringEvent[]
  performanceMetrics: PerformanceMetric[]
  summary: Record<string, any>
} => {
  const eventCounts = events.reduce((acc, event) => {
    acc[event.event] = (acc[event.event] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const avgPerformance = performanceMetrics.reduce((acc, metric) => {
    if (!acc[metric.operation]) {
      acc[metric.operation] = { total: 0, count: 0, avg: 0 }
    }
    const operationStats = acc[metric.operation]
    if (operationStats) {
      operationStats.total += metric.duration
      operationStats.count += 1
      operationStats.avg = operationStats.total / operationStats.count
    }
    return acc
  }, {} as Record<string, { total: number, count: number, avg: number }>)
  
  return {
    events,
    performanceMetrics,
    summary: {
      totalEvents: events.length,
      eventCounts,
      averagePerformance: avgPerformance,
      dataRange: {
        start: events.length > 0 ? events[0]?.timestamp || null : null,
        end: events.length > 0 ? events[events.length - 1]?.timestamp || null : null
      }
    }
  }
}
