/**
 * Consolidated API Types - Phase 2: Interface Consolidation
 * 
 * This file consolidates similar interfaces across the codebase to eliminate
 * duplication and provide consistent type definitions for admin operations.
 */

import type { Course, Quiz, User } from '@/lib/supabase'

// ==============================================
// SHARED PAGINATION INTERFACE
// ==============================================

/**
 * Standard pagination metadata used across all admin API responses
 */
export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

// ==============================================
// ADMIN API RESPONSE INTERFACES
// ==============================================

/**
 * Base interface for all admin API responses
 */
export interface BaseAdminResponse {
  success: boolean
  error?: string
  timestamp?: string
}

/**
 * Generic paginated response interface
 */
export interface PaginatedAdminResponse<T> extends BaseAdminResponse {
  data: T[]
  pagination: PaginationMeta
}

/**
 * Admin quizzes response - consolidates AdminQuizzesResponse
 */
export interface AdminQuizzesResponse extends BaseAdminResponse {
  quizzes: Quiz[]
  pagination: PaginationMeta
}

/**
 * Admin courses response - standardizes AdminCoursesResponse
 */
export interface AdminCoursesResponse extends BaseAdminResponse {
  courses: Course[]
  pagination: PaginationMeta
}

/**
 * Admin users response
 */
export interface AdminUsersResponse extends BaseAdminResponse {
  users: User[]
  pagination: PaginationMeta
}

/**
 * Admin dashboard data response
 */
export interface AdminDashboardResponse extends BaseAdminResponse {
  quizzes: Quiz[]
  categories: Array<{
    id: string
    name: string
    type: string
    color: string
  }>
  courses: Course[]
  stats: AdminDashboardStats
  recentActivity?: AdminActivityItem[]
  systemHealth?: SystemHealthStatus
}

// ==============================================
// ADMIN DASHBOARD TYPES
// ==============================================

export interface AdminDashboardStats {
  totalQuizzes: number
  totalCourses: number
  totalStudents: number
  totalInstructors: number
  publishedQuizzes: number
  publishedCourses: number
  activeUsers: number
  recentSignups: number
}

export interface AdminActivityItem {
  id: string
  type: 'quiz_created' | 'course_created' | 'user_registered' | 'enrollment'
  title: string
  description: string
  user_id: string
  user_name: string
  timestamp: string
  metadata?: Record<string, any>
}

export interface SystemHealthStatus {
  database: 'healthy' | 'warning' | 'error'
  storage: 'healthy' | 'warning' | 'error'
  api: 'healthy' | 'warning' | 'error'
  lastChecked: string
}

// ==============================================
// API REQUEST/RESPONSE PATTERNS
// ==============================================

/**
 * Standard API request filters for admin endpoints
 */
export interface AdminListFilters {
  page?: number
  limit?: number
  search?: string
  category?: string
  status?: 'all' | 'published' | 'draft' | 'archived'
  sort_by?: string
  sort_order?: 'asc' | 'desc'
  date_from?: string
  date_to?: string
}

/**
 * Admin bulk operation request
 */
export interface AdminBulkOperationRequest {
  action: 'publish' | 'unpublish' | 'archive' | 'delete'
  ids: string[]
  confirm?: boolean
}

/**
 * Admin bulk operation response
 */
export interface AdminBulkOperationResponse extends BaseAdminResponse {
  processed: number
  failed: number
  errors?: Array<{
    id: string
    error: string
  }>
}

// ==============================================
// TYPE GUARDS AND UTILITIES
// ==============================================

/**
 * Safe type guard to check if a response is paginated
 * Prevents type confusion attacks by validating all required properties
 */
export function isPaginatedResponse<T>(
  response: unknown
): response is PaginatedAdminResponse<T> {
  if (!response || typeof response !== 'object') {
    return false
  }
  
  const obj = response as Record<string, unknown>
  
  // Explicit boolean checks to satisfy TypeScript
  const hasValidSuccess = typeof obj.success === 'boolean'
  const hasValidData = Array.isArray(obj.data)
  const hasPagination = obj.pagination && typeof obj.pagination === 'object' && obj.pagination !== null
  
  if (!hasValidSuccess || !hasValidData || !hasPagination) {
    return false
  }
  
  const pagination = obj.pagination as Record<string, unknown>
  const hasValidPaginationFields = (
    typeof pagination.page === 'number' &&
    typeof pagination.limit === 'number' &&
    typeof pagination.total === 'number' &&
    typeof pagination.totalPages === 'number'
  )
  
  return hasValidPaginationFields
}

/**
 * Safe type guard to check if a response is successful
 * Validates response structure before type assertion
 */
export function isSuccessfulResponse(
  response: unknown
): response is BaseAdminResponse & { success: true } {
  return (
    response !== null &&
    typeof response === 'object' &&
    (response as Record<string, unknown>).success === true
  )
}