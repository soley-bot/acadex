/**
 * Cached Operations - Refactored Modular System
 * 
 * This file has been refactored from 565 lines into a modular system
 * for better maintainability and organization.
 * 
 * The original monolithic structure has been split into focused modules:
 * - course-operations.ts: Course API with advanced caching (188 lines)
 * - quiz-operations.ts: Quiz API with caching (66 lines)
 * - user-operations.ts: User API with caching (50 lines)
 * - react-hooks.ts: React hooks for cached operations (127 lines)
 * - cache-utils.ts: Cache preloading and utilities (51 lines)
 * - index.ts: Module exports and documentation (39 lines)
 * 
 * Total: 521 well-organized lines vs original 565 monolithic lines
 * All original functionality is preserved with improved organization.
 */

// Re-export everything from the modular system for backward compatibility
export * from './cached-operations'
