/**
 * Simplified logging utility
 * Centralized console logging with level support
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  [key: string]: any
}

const isDevelopment = process.env.NODE_ENV === 'development'

function formatMessage(level: LogLevel, message: string): string {
  const timestamp = new Date().toISOString()
  return `[${timestamp}] [${level.toUpperCase()}] ${message}`
}

export const logger = {
  debug: (message: string, context?: LogContext) => {
    if (isDevelopment) {
      console.log(formatMessage('debug', message), context || '')
    }
  },

  info: (message: string, context?: LogContext) => {
    console.info(formatMessage('info', message), context || '')
  },

  warn: (message: string, context?: LogContext) => {
    console.warn(formatMessage('warn', message), context || '')
  },

  error: (message: string, context?: LogContext) => {
    console.error(formatMessage('error', message), context || '')
  },
}

// Export types for TypeScript support
export type { LogLevel, LogContext }
