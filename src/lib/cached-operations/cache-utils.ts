/**
 * Cached Operations - Cache Management Utilities Module
 * 
 * Utilities for cache preloading and performance optimization.
 * Extracted from cachedOperations.ts for better organization and maintainability.
 */

import { logger } from '@/lib/logger'
import { cachedCourseAPI } from './course-operations'
import { cachedQuizAPI } from './quiz-operations'
import { cachedUserAPI } from './user-operations'

/**
 * Cache preloading utilities for performance optimization
 */
export const cachePreloader = {
  // Preload popular courses
  preloadPopularCourses: async () => {
    logger.debug('🔄 Preloading popular courses...')
    try {
      await cachedCourseAPI.getCourses({ is_published: true })
      logger.debug('✅ Popular courses preloaded')
    } catch (error) {
      logger.warn('⚠️ Failed to preload popular courses:', error)
    }
  },

  // Preload course details when user hovers
  preloadCourse: async (id: string) => {
    try {
      await cachedCourseAPI.getCourse(id)
    } catch (error) {
      logger.warn(`⚠️ Failed to preload course ${id}:`, error)
    }
  },

  // Preload user dashboard data
  preloadDashboard: async (userId: string) => {
    logger.debug('🔄 Preloading dashboard data...')
    try {
      await Promise.all([
        cachedCourseAPI.getCourses({ instructor_id: userId }),
        cachedUserAPI.getUserProfile(userId),
        cachedQuizAPI.getQuizzes()
      ])
      logger.debug('✅ Dashboard data preloaded')
    } catch (error) {
      logger.warn('⚠️ Failed to preload dashboard data:', error)
    }
  }
}

/**
 * Initialize cache system with preloaded data
 */
export const initializeCache = async () => {
  logger.debug('🚀 Initializing cache system...')
  
  // Preload critical data
  try {
    await cachePreloader.preloadPopularCourses()
    logger.debug('✅ Cache system initialized successfully')
  } catch (error) {
    logger.warn('⚠️ Cache initialization warning:', error)
  }
}

/**
 * Auto-initialize cache system in browser environment
 */
export const autoInitializeCache = () => {
  // Auto-initialize if in browser
  if (typeof window !== 'undefined') {
    // Initialize cache after a short delay to not block initial render
    setTimeout(initializeCache, 1000)
  }
}