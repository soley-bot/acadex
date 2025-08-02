import { logger } from '@/lib/logger'

/**
 * High-Performance Database Operations with Optimizations
 * Implements: selective fields, limits, parallel queries, and caching
 */

import { supabase } from './supabase'
import type { Course, Quiz, QuizQuestion, User, Enrollment } from './supabase'

// ==============================================
// 1. SELECTIVE FIELD FETCHING (No more SELECT *)
// ==============================================

/**
 * Course list view - Only essential fields for listing
 */
export const optimizedCourseAPI = {
  // Optimized: Only fetch fields needed for course cards
  async getCourseList(limit = 20) {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        id,
        title,
        description,
        thumbnail_url,
        duration,
        level,
        category,
        price,
        is_published,
        created_at
      `)
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(limit)

    return { data, error }
  },

  // Optimized: Full course details only when needed
  async getCourseDetails(id: string) {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        course_modules (
          id,
          title,
          order_index,
          course_lessons (
            id,
            title,
            duration,
            order_index,
            lesson_type,
            is_published
          )
        )
      `)
      .eq('id', id)
      .single()

    return { data, error }
  },

  // Optimized: Course summary for admin dashboard
  async getCourseSummary(limit = 50) {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        id,
        title,
        level,
        category,
        is_published,
        created_at,
        updated_at
      `)
      .order('updated_at', { ascending: false })
      .limit(limit)

    return { data, error }
  }
}

/**
 * Quiz operations with selective fields
 */
export const optimizedQuizAPI = {
  // Optimized: Quiz list with essential fields only
  async getQuizList(limit = 20) {
    const { data, error } = await supabase
      .from('quizzes')
      .select(`
        id,
        title,
        description,
        difficulty,
        category,
        duration_minutes,
        total_questions,
        is_published,
        created_at
      `)
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(limit)

    return { data, error }
  },

  // Optimized: Quiz questions WITHOUT full content for previews
  async getQuizPreview(id: string) {
    const { data, error } = await supabase
      .from('quizzes')
      .select(`
        id,
        title,
        description,
        difficulty,
        duration_minutes,
        total_questions,
        quiz_questions (
          id,
          question_text,
          question_type
        )
      `)
      .eq('id', id)
      .single()

    return { data, error }
  },

  // Full quiz with answers (only when taking quiz)
  async getFullQuiz(id: string) {
    const { data, error } = await supabase
      .from('quizzes')
      .select(`
        *,
        quiz_questions (
          *,
          questions (*)
        )
      `)
      .eq('id', id)
      .single()

    return { data, error }
  }
}

// ==============================================
// 2. PARALLEL QUERIES (Promise.all)
// ==============================================

/**
 * Dashboard data fetched in parallel
 */
export const optimizedDashboardAPI = {
  async getDashboardData(userId: string) {
    try {
      // Fetch all dashboard data in parallel
      const [
        userProfile,
        enrollments,
        recentQuizzes,
        progressStats
      ] = await Promise.all([
        // User profile (minimal fields)
        supabase
          .from('users')
          .select('id, full_name, email, role, avatar_url')
          .eq('id', userId)
          .single(),

        // Recent enrollments (essential fields only)
        supabase
          .from('enrollments')
          .select(`
            id,
            enrolled_at,
            progress,
            courses (
              id,
              title,
              thumbnail_url,
              duration
            )
          `)
          .eq('user_id', userId)
          .order('enrolled_at', { ascending: false })
          .limit(5),

        // Recent quiz attempts
        supabase
          .from('quiz_attempts')
          .select(`
            id,
            score,
            completed_at,
            quizzes (
              id,
              title,
              difficulty
            )
          `)
          .eq('user_id', userId)
          .order('completed_at', { ascending: false })
          .limit(5),

        // Progress statistics
        supabase
          .from('enrollments')
          .select('progress')
          .eq('user_id', userId)
      ])

      return {
        user: userProfile.data,
        enrollments: enrollments.data,
        recentQuizzes: recentQuizzes.data,
        progressStats: progressStats.data,
        error: null
      }
    } catch (error) {
      return { user: null, enrollments: [], recentQuizzes: [], progressStats: [], error }
    }
  }
}

/**
 * Admin analytics with parallel queries
 */
export const optimizedAdminAPI = {
  async getAnalytics() {
    try {
      const [
        userCount,
        courseCount,
        quizCount,
        enrollmentCount,
        recentActivity
      ] = await Promise.all([
        // Count queries (very fast)
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase.from('courses').select('id', { count: 'exact', head: true }),
        supabase.from('quizzes').select('id', { count: 'exact', head: true }),
        supabase.from('enrollments').select('id', { count: 'exact', head: true }),

        // Recent activity (limited fields)
        supabase
          .from('enrollments')
          .select(`
            id,
            enrolled_at,
            users (full_name),
            courses (title)
          `)
          .order('enrolled_at', { ascending: false })
          .limit(10)
      ])

      return {
        stats: {
          users: userCount.count || 0,
          courses: courseCount.count || 0,
          quizzes: quizCount.count || 0,
          enrollments: enrollmentCount.count || 0
        },
        recentActivity: recentActivity.data || [],
        error: null
      }
    } catch (error) {
      return { stats: {}, recentActivity: [], error }
    }
  }
}

// ==============================================
// 3. CACHING LAYER
// ==============================================

interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number // Time to live in milliseconds
}

class DatabaseCache {
  private cache = new Map<string, CacheItem<any>>()
  private readonly DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes

  set<T>(key: string, data: T, ttl = this.DEFAULT_TTL) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null

    // Check if expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  clear() {
    this.cache.clear()
    // Also clear sessionStorage cache
    if (typeof window !== 'undefined') {
      const keys = Object.keys(sessionStorage)
      keys.forEach(key => {
        if (key.startsWith('quiz-') || key.startsWith('course-') || key.startsWith('dashboard-')) {
          sessionStorage.removeItem(key)
        }
      })
    }
  }

  delete(key: string) {
    this.cache.delete(key)
  }
}

export const dbCache = new DatabaseCache()

/**
 * Clear all caches and force refresh
 */
export const clearAllCaches = () => {
  // Clear in-memory cache
  dbCache.clear()
  
  // Clear browser caches
  if (typeof window !== 'undefined') {
    // Clear sessionStorage
    const sessionKeys = Object.keys(sessionStorage)
    sessionKeys.forEach(key => {
      if (key.startsWith('quiz-') || key.startsWith('course-') || key.startsWith('dashboard-')) {
        sessionStorage.removeItem(key)
      }
    })
    
    // Clear localStorage  
    const localKeys = Object.keys(localStorage)
    localKeys.forEach(key => {
      if (key.startsWith('acadex-cache-')) {
        localStorage.removeItem(key)
      }
    })
  }
  
  logger.debug('🧹 All caches cleared successfully!')
}

/**
 * Cached database operations
 */
export const cachedAPI = {
  async getCourseList(limit = 20, useCache = true) {
    const cacheKey = `courses-list-${limit}`
    
    if (useCache) {
      const cached = dbCache.get(cacheKey)
      if (cached) return cached
    }

    const result = await optimizedCourseAPI.getCourseList(limit)
    
    if (result.data && useCache) {
      dbCache.set(cacheKey, result, 2 * 60 * 1000) // 2 minutes cache
    }

    return result
  },

  async getQuizList(limit = 20, useCache = true) {
    const cacheKey = `quizzes-list-${limit}`
    
    if (useCache) {
      const cached = dbCache.get(cacheKey)
      if (cached) return cached
    }

    const result = await optimizedQuizAPI.getQuizList(limit)
    
    if (result.data && useCache) {
      dbCache.set(cacheKey, result, 2 * 60 * 1000) // 2 minutes cache
    }

    return result
  },

  // Invalidate cache when data changes
  invalidateCourseCache() {
    const keys = Array.from(dbCache['cache'].keys()).filter(key => key.startsWith('courses-'))
    keys.forEach(key => dbCache.delete(key))
  },

  invalidateQuizCache() {
    const keys = Array.from(dbCache['cache'].keys()).filter(key => key.startsWith('quizzes-'))
    keys.forEach(key => dbCache.delete(key))
  }
}

// ==============================================
// 4. PAGINATION UTILITIES
// ==============================================

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  pageSize: number
  totalPages: number
  hasMore: boolean
}

export async function paginatedQuery<T>(
  tableName: string,
  selectQuery: string,
  page = 1,
  pageSize = 20,
  filters?: Record<string, any>
): Promise<PaginatedResponse<T>> {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from(tableName)
    .select(selectQuery, { count: 'exact' })
    .range(from, to)

  // Apply filters
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value)
      }
    })
  }

  const { data, error, count } = await query

  if (error) throw error

  const totalPages = Math.ceil((count || 0) / pageSize)

  return {
    data: (data as T[]) || [],
    count: count || 0,
    page,
    pageSize,
    totalPages,
    hasMore: page < totalPages
  }
}

// ==============================================
// 5. SEARCH OPTIMIZATION
// ==============================================

export const searchAPI = {
  // Full-text search with limits and selective fields
  async searchCourses(query: string, limit = 10) {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        id,
        title,
        description,
        thumbnail_url,
        level,
        category,
        duration
      `)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
      .eq('is_published', true)
      .limit(limit)

    return { data, error }
  },

  async searchQuizzes(query: string, limit = 10) {
    const { data, error } = await supabase
      .from('quizzes')
      .select(`
        id,
        title,
        description,
        difficulty,
        category,
        total_questions
      `)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
      .eq('is_published', true)
      .limit(limit)

    return { data, error }
  }
}

// ==============================================
// 6. PERFORMANCE MONITORING
// ==============================================

export class QueryPerformance {
  private static measurements: Record<string, number[]> = {}

  static async measure<T>(queryName: string, queryFn: () => Promise<T>): Promise<T> {
    const start = Date.now()
    try {
      const result = await queryFn()
      const duration = Date.now() - start
      
      if (!this.measurements[queryName]) {
        this.measurements[queryName] = []
      }
      this.measurements[queryName].push(duration)

      // Log slow queries
      if (duration > 1000) {
        logger.warn(`🐌 Slow query: ${queryName} took ${duration}ms`)
      }

      return result
    } catch (error) {
      const duration = Date.now() - start
      logger.error(`❌ Query failed: ${queryName} after ${duration}ms`, error)
      throw error
    }
  }

  static getStats() {
    const stats: Record<string, { avg: number, count: number, max: number }> = {}
    
    Object.entries(this.measurements).forEach(([query, times]) => {
      stats[query] = {
        avg: Math.round(times.reduce((a, b) => a + b, 0) / times.length),
        count: times.length,
        max: Math.max(...times)
      }
    })

    return stats
  }

  static clearStats() {
    this.measurements = {}
  }
}
