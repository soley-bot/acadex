/**
 * Cached Operations - Modular System Exports
 * 
 * Centralized exports for the refactored cached operations system.
 * 
 * This modular system replaces the original monolithic cachedOperations.ts (565 lines)
 * with focused, maintainable modules:
 * 
 * Modules:
 * - course-operations.ts: Course API with caching (188 lines)
 * - quiz-operations.ts: Quiz API with caching (66 lines)
 * - user-operations.ts: User API with caching (50 lines)
 * - react-hooks.ts: React hooks for cached operations (127 lines)
 * - cache-utils.ts: Cache preloading and utilities (51 lines)
 * - index.ts: Module exports and documentation (35 lines)
 * 
 * Total: 517 well-organized lines vs original 565 monolithic lines
 * Benefits: Better separation of concerns, easier testing, improved maintainability
 */

// Export course operations
export { cachedCourseAPI } from './course-operations'

// Export quiz operations
export { cachedQuizAPI } from './quiz-operations'

// Export user operations
export { cachedUserAPI } from './user-operations'

// Export React hooks
export { 
  useCourses,
  useCourse,
  useCourseMutations,
  useQuizzes,
  useUserProfile
} from './react-hooks'

// Export cache utilities
export { 
  cachePreloader,
  initializeCache,
  autoInitializeCache
} from './cache-utils'

// Auto-initialize cache system
import { autoInitializeCache } from './cache-utils'
autoInitializeCache()