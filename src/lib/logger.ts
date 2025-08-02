/**
 * Centralized logging utility for production-safe logging
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  component?: string
  userId?: string
  courseId?: string
  quizId?: string
  action?: string
  [key: string]: any
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private isProduction = process.env.NODE_ENV === 'production'

  private log(level: LogLevel, message: string, context?: LogContext | any) {
    if (!this.isDevelopment && level === 'debug') {
      return // Skip debug logs in production
    }

    const timestamp = new Date().toISOString()
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`

    // Format context for better readability
    const formattedContext = context ? this.formatContext(context) : ''

    switch (level) {
      case 'debug':
        console.log(logMessage, formattedContext)
        break
      case 'info':
        console.info(logMessage, formattedContext)
        break
      case 'warn':
        console.warn(logMessage, formattedContext)
        break
      case 'error':
        console.error(logMessage, formattedContext)
        // In production, send errors to monitoring service
        if (this.isProduction) {
          this.sendToMonitoring(level, message, context)
        }
        break
    }
  }

  private formatContext(context: any): string {
    if (typeof context === 'string') return context
    if (typeof context === 'object') {
      try {
        return JSON.stringify(context, null, 2)
      } catch {
        return String(context)
      }
    }
    return String(context)
  }

  private sendToMonitoring(level: LogLevel, message: string, context?: any) {
    // TODO: Integrate with monitoring service (Sentry, LogRocket, etc.)
    // For now, just store critical errors
    if (level === 'error' && typeof window !== 'undefined') {
      try {
        const errorLog = {
          timestamp: new Date().toISOString(),
          level,
          message,
          context,
          url: window.location.href,
          userAgent: navigator.userAgent
        }
        
        // Store in sessionStorage for debugging
        const existingLogs = JSON.parse(sessionStorage.getItem('acadex-error-logs') || '[]')
        existingLogs.push(errorLog)
        
        // Keep only last 50 errors
        if (existingLogs.length > 50) {
          existingLogs.splice(0, existingLogs.length - 50)
        }
        
        sessionStorage.setItem('acadex-error-logs', JSON.stringify(existingLogs))
      } catch {
        // Silent fail for storage issues
      }
    }
  }

  // Convenience methods with semantic meaning
  debug(message: string, context?: LogContext | any) {
    this.log('debug', message, context)
  }

  info(message: string, context?: LogContext | any) {
    this.log('info', message, context)
  }

  warn(message: string, context?: LogContext | any) {
    this.log('warn', message, context)
  }

  error(message: string, context?: LogContext | any) {
    this.log('error', message, context)
  }

  // Specific logging methods for common use cases
  courseAction(action: string, courseId: string, context?: LogContext) {
    this.info(`Course ${action}`, { action, courseId, ...context })
  }

  userAction(action: string, userId: string, context?: LogContext) {
    this.info(`User ${action}`, { action, userId, ...context })
  }

  apiCall(endpoint: string, method: string, context?: LogContext) {
    this.debug(`API ${method} ${endpoint}`, { endpoint, method, ...context })
  }

  performance(metric: string, value: number, unit: string = 'ms') {
    this.debug(`Performance: ${metric}`, { metric, value, unit })
  }

  security(action: string, context?: LogContext) {
    this.warn(`Security Event: ${action}`, { action, ...context })
  }

  validation(field: string, isValid: boolean, value?: any) {
    const level = isValid ? 'debug' : 'warn'
    this.log(level, `Validation ${isValid ? 'passed' : 'failed'}: ${field}`, { field, isValid, value })
  }

  // Error logs for easy access in development
  getErrorLogs(): any[] {
    if (typeof window === 'undefined') return []
    try {
      return JSON.parse(sessionStorage.getItem('acadex-error-logs') || '[]')
    } catch {
      return []
    }
  }

  clearErrorLogs() {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('acadex-error-logs')
    }
  }
}

export const logger = new Logger()

// Development helper for accessing logs in browser console
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  ;(window as any).acadexLogger = {
    getErrors: () => logger.getErrorLogs(),
    clearErrors: () => logger.clearErrorLogs(),
    logger
  }
}

// Export types for TypeScript support
export type { LogLevel, LogContext }
