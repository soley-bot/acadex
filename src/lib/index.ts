/**
 * Common Library Barrel Export - Phase 2: Import Path Optimization
 * 
 * This file provides centralized imports for the most commonly used 
 * library utilities to reduce import path duplication.
 */

// Core utilities
export { logger } from './logger'

// Database and types
export { createSupabaseClient } from './supabase'
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
} from './supabase'

// Authentication (client-side only)
export {
  getAuthHeaders,
  authenticatedGet,
  authenticatedPost,
  authenticatedPut,
  authenticatedDelete
} from './auth-api'

// NOTE: Server-side auth utilities (withAdminAuth, createAuthenticatedClient, etc.)
// are NOT exported here to prevent "next/headers" import errors in client components.
// Import them directly from './api-auth' in API routes and server components only.

// Image handling
export { uploadImage } from './imageUpload'
export { getHeroImage } from './imageMapping'

// Constants
export { quizDifficulties, quizCategories } from './quiz-constants-unified'
export { levels, statuses } from './courseConstants'