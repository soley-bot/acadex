/**
 * Common Library Barrel Export - Phase 2: Import Path Optimization
 * 
 * This file provides centralized imports for the most commonly used 
 * library utilities to reduce import path duplication.
 */

// Core utilities
export { logger } from './logger'

// Database and types
export { supabase } from './supabase'
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

// Authentication
export { 
  authenticatedGet, 
  authenticatedPost, 
  authenticatedPut, 
  authenticatedDelete 
} from './auth-api'

export { 
  withAdminAuth, 
  withAuth, 
  createAuthenticatedClient,
  createServiceClient,
  verifyAdminAuth
} from './api-auth'

// Image handling
export { uploadImage } from './imageUpload'
export { getHeroImage } from './imageMapping'

// Constants
export { quizDifficulties, quizCategories } from './quizConstants'
export { levels, statuses } from './courseConstants'

// Cache utilities (if still used)
export { cacheUtils, withCache } from './smartCache'