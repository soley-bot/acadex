/**
 * Database Backup API - Refactored Modular System
 * 
 * This file has been refactored from 1193 lines into a modular system
 * for better maintainability and organization.
 * 
 * The original monolithic structure has been split into focused modules:
 * - users.ts: User operations
 * - courses.ts: Course operations  
 * - quizzes.ts: Quiz operations
 * - enrollments.ts: Enrollment operations
 * - auth.ts: Authentication operations
 * - legacy-functions.ts: Backward compatibility functions
 * 
 * All original functionality is preserved with improved organization.
 */

// Re-export everything from the modular system for backward compatibility
export * from './database-backup'
