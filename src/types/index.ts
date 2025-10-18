/**
 * Types Barrel Export - Phase 2: Import Path Optimization
 * 
 * Centralized export for all consolidated and common types
 */

// Consolidated API types
export type {
  // Base response types
  BaseAdminResponse,
  PaginatedAdminResponse,
  PaginationMeta,
  
  // Admin API responses
  AdminQuizzesResponse,
  AdminCoursesResponse,
  AdminUsersResponse,
  AdminDashboardResponse,
  AdminDashboardStats,
  AdminActivityItem,
  SystemHealthStatus,
  
  // Admin operations
  AdminListFilters,
  AdminBulkOperationRequest,
  AdminBulkOperationResponse,
  
  // Type guards
  isPaginatedResponse,
  isSuccessfulResponse
} from './consolidated-api'

// Re-export common lib types for convenience
export type {
  User,
  Course,
  Quiz,
  QuizQuestion,
  QuizAttempt,
  Enrollment,
  CourseModule,
  CourseLesson,
  QuestionType
} from '@/lib/supabase'

// Authentication types
export type { UserRole } from '@/lib/auth-security'