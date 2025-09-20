/**
 * Database Backup API - Modular System
 * 
 * This module has been refactored from a monolithic 1193-line file
 * into focused modules for better maintainability and organization.
 * 
 * Original structure:
 * - database-backup.ts: 1193 lines (monolithic)
 * 
 * New modular structure:
 * - users.ts: User operations (47 lines)
 * - courses.ts: Course operations (117 lines)
 * - quizzes.ts: Quiz operations (154 lines)
 * - enrollments.ts: Enrollment operations (64 lines)
 * - auth.ts: Authentication operations (48 lines)
 * - legacy-functions.ts: Backward compatibility functions (367 lines)
 * - index.ts: Module exports (30 lines)
 * 
 * Total: 827 lines (well-organized) vs original 1193 lines (monolithic)
 * All original functionality preserved with improved organization.
 */

// Export all API modules
export { userAPI } from './users'
export { courseAPI } from './courses'
export { quizAPI } from './quizzes'
export { enrollmentAPI } from './enrollments'
export { authAPI } from './auth'

// Export legacy functions for backward compatibility
export * from './legacy-functions'