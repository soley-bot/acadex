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
// AI GENERATION CONSOLIDATED INTERFACES
// ==============================================

/**
 * Base AI generation request interface
 */
export interface BaseAIGenerationRequest {
  title: string
  description: string
  level: 'beginner' | 'intermediate' | 'advanced'
  language?: string
  custom_prompt?: string
  ai_provider?: 'gemini' | 'claude' | 'openai'
}

/**
 * Unified course generation request - consolidates multiple CourseGenerationRequest interfaces
 */
export interface CourseGenerationRequest extends BaseAIGenerationRequest {
  duration: string
  topics: string[]
  learning_objectives: string[]
  module_count: number
  lessons_per_module: number
  course_format: 'text' | 'mixed' | 'interactive'
  subject_area?: string
  content_depth?: 'basic' | 'detailed' | 'comprehensive'
  content_style?: 'academic' | 'practical' | 'conversational'
  include_examples?: boolean
  include_exercises?: boolean
  rich_text_format?: boolean
  content_length?: 'short' | 'medium' | 'long'
  language_focus?: 'general' | 'business' | 'academic' | 'conversational'
  // Quiz integration options
  include_lesson_quizzes?: boolean
  quiz_questions_per_lesson?: number
  quiz_difficulty?: 'easy' | 'medium' | 'hard'
}

/**
 * Unified quiz generation request - consolidates multiple quiz generation interfaces
 */
export interface QuizGenerationRequest extends BaseAIGenerationRequest {
  topic: string
  question_count: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  question_types?: ('multiple_choice' | 'single_choice' | 'true_false' | 'fill_blank' | 'essay' | 'matching' | 'ordering')[]
  subject?: string
  duration_minutes?: number
  passing_score?: number
  additional_instructions?: string
}

// ==============================================
// GENERATED CONTENT INTERFACES
// ==============================================

/**
 * Generated quiz question - unified interface
 */
export interface GeneratedQuizQuestion {
  question: string
  question_type: 'multiple_choice' | 'single_choice' | 'true_false' | 'fill_blank' | 'essay' | 'matching' | 'ordering'
  options?: string[]
  correct_answer?: number
  correct_answer_text?: string
  correct_answer_json?: Record<string, any>
  explanation: string
  order_index: number
  points?: number
  difficulty_level?: 'easy' | 'medium' | 'hard'
}

/**
 * Generated quiz - unified interface
 */
export interface GeneratedQuiz {
  title: string
  description: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration_minutes: number
  passing_score: number
  questions: GeneratedQuizQuestion[]
}

/**
 * Generated lesson interface
 */
export interface GeneratedLesson {
  title: string
  content: string
  order_index: number
  duration_minutes: number
  lesson_type: string
  learning_objectives: string[]
  is_published: boolean
  quiz?: GeneratedQuiz
}

/**
 * Generated module interface
 */
export interface GeneratedModule {
  title: string
  description: string
  order_index: number
  lessons: GeneratedLesson[]
}

/**
 * Generated course data - consolidated interface
 */
export interface GeneratedCourseData {
  title: string
  description: string
  level: 'beginner' | 'intermediate' | 'advanced'
  duration: string
  price: number
  is_published: boolean
  learning_objectives: string[]
  prerequisites: string[]
  what_you_will_learn: string[]
  course_includes: string[]
  target_audience: string[]
  category: string
}

/**
 * Complete generated course - unified interface
 */
export interface GeneratedCourse {
  course: GeneratedCourseData
  modules: GeneratedModule[]
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