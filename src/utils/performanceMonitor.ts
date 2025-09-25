// =====================================================
// QUIZ BUILDER PERFORMANCE MONITORING
// Helps track and reduce violation warnings
// =====================================================

/**
 * Performance monitoring utility for quiz builder operations
 * Helps identify and reduce Chrome violation warnings
 */
export class QuizBuilderPerformanceMonitor {
  private static measurements = new Map<string, number>()
  
  /**
   * Start measuring performance of an operation
   */
  static startMeasurement(operation: string) {
    if (process.env.NODE_ENV === 'development') {
      this.measurements.set(operation, performance.now())
    }
  }
  
  /**
   * End measurement and log if it exceeds thresholds
   */
  static endMeasurement(operation: string, warnThreshold = 16.67) { // 16.67ms = 60fps
    if (process.env.NODE_ENV === 'development' && this.measurements.has(operation)) {
      const startTime = this.measurements.get(operation)!
      const duration = performance.now() - startTime
      this.measurements.delete(operation)
      
      if (duration > warnThreshold) {
        console.warn(`⚠️ Performance: ${operation} took ${duration.toFixed(2)}ms (>${warnThreshold}ms threshold)`)
        
        // Provide optimization suggestions
        if (operation.includes('state') && duration > 50) {
          console.info('💡 Consider using startTransition() for this state update')
        }
        if (operation.includes('save') && duration > 100) {
          console.info('💡 Consider debouncing this save operation')
        }
      } else {
        console.log(`✅ Performance: ${operation} completed in ${duration.toFixed(2)}ms`)
      }
    }
  }
  
  /**
   * Measure async operations
   */
  static async measureAsync<T>(operation: string, asyncFn: () => Promise<T>): Promise<T> {
    this.startMeasurement(operation)
    try {
      const result = await asyncFn()
      this.endMeasurement(operation, 100) // Higher threshold for async ops
      return result
    } catch (error) {
      this.endMeasurement(operation, 100)
      throw error
    }
  }
  
  /**
   * Debounce function to reduce violation warnings
   */
  static debounce<T extends (...args: any[]) => void>(
    func: T, 
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => func(...args), delay)
    }
  }
  
  /**
   * Throttle function for high-frequency events
   */
  static throttle<T extends (...args: any[]) => void>(
    func: T, 
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean
    
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }
  }
}

// Usage examples:
// 
// // Measure state updates
// QuizBuilderPerformanceMonitor.startMeasurement('quiz-state-update')
// setState(newState)
// QuizBuilderPerformanceMonitor.endMeasurement('quiz-state-update')
//
// // Measure async operations  
// const result = await QuizBuilderPerformanceMonitor.measureAsync('quiz-save', () => saveQuiz())
//
// // Debounce rapid state changes
// const debouncedUpdate = QuizBuilderPerformanceMonitor.debounce(updateQuiz, 300)

export default QuizBuilderPerformanceMonitor