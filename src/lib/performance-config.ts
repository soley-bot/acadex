/**
 * Performance Monitoring Configuration
 * Set ENABLE_PERFORMANCE_MONITORING to false to completely disable all monitoring
 */

export const PERFORMANCE_CONFIG = {
  // Set to false to completely disable all performance monitoring
  ENABLE_PERFORMANCE_MONITORING: true,
  
  // Set to false to disable console logging (monitoring still works silently)
  ENABLE_CONSOLE_LOGGING: true,
  
  // Only log significant performance issues (in production)
  LOG_ONLY_ISSUES: false
}

export function shouldLogPerformance(): boolean {
  return PERFORMANCE_CONFIG.ENABLE_PERFORMANCE_MONITORING && 
         PERFORMANCE_CONFIG.ENABLE_CONSOLE_LOGGING &&
         process.env.NODE_ENV === 'development'
}

export function shouldLogIssuesOnly(): boolean {
  return PERFORMANCE_CONFIG.LOG_ONLY_ISSUES
}