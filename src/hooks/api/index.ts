/**
 * Centralized exports for all API hooks
 * This replaces the large useOptimizedAPI.ts file with focused, modular hooks
 */

// Cache invalidation utilities
export * from './useCacheInvalidation'

// Admin hooks
export * from './useAdminQuizzes'
export * from './useAdminCourses'
export * from './useAdminUsers'

// Dashboard hooks
export * from './useDashboardData'

// Public API hooks
export * from './usePublicAPI'

// Mutation hooks
export * from './useMutations'

// Prefetch utilities
export * from './usePrefetch'