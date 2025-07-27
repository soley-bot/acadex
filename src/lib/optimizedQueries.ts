/**
 * Optimized database queries with caching and batch operations
 */

import { supabase } from './supabase'
import { logger } from './logger'
import type { Course, Quiz, User } from './supabase'

// Simple in-memory cache for frequently accessed data
class SimpleCache {
  private cache = new Map<string, { data: any; timestamp: number }>()
  private ttl = 5 * 60 * 1000 // 5 minutes

  set(key: string, data: any) {
    this.cache.set(key, { data, timestamp: Date.now() })
  }

  get(key: string) {
    const cached = this.cache.get(key)
    if (!cached) return null

    // Check if expired
    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(key)
      return null
    }

    return cached.data
  }

  clear() {
    this.cache.clear()
  }
}

const cache = new SimpleCache()

/**
 * Optimized course operations
 */
export const optimizedCourseAPI = {
  /**
   * Get courses with optimized query and caching
   */
  async getCourses(filters?: { category?: string; level?: string; search?: string }) {
    const cacheKey = `courses_${JSON.stringify(filters || {})}`
    const cached = cache.get(cacheKey)
    if (cached) {
      logger.debug('Returning cached courses')
      return { data: cached, error: null }
    }

    try {
      let query = supabase
        .from('courses')
        .select(`
          id,
          title,
          description,
          instructor_name,
          price,
          duration,
          level,
          category,
          image_url,
          rating,
          student_count,
          is_published,
          created_at
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false })

      if (filters?.category && filters.category !== 'all') {
        query = query.eq('category', filters.category)
      }

      if (filters?.level && filters.level !== 'all') {
        query = query.eq('level', filters.level)
      }

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
      }

      const { data, error } = await query

      if (!error && data) {
        cache.set(cacheKey, data)
      }

      return { data, error }
    } catch (error) {
      logger.error('Error fetching courses', error)
      return { data: null, error }
    }
  },

  /**
   * Batch create/update courses
   */
  async batchUpdateCourses(courses: Partial<Course>[]) {
    try {
      const { data, error } = await supabase
        .from('courses')
        .upsert(courses)
        .select()

      if (!error) {
        cache.clear() // Clear course cache after updates
      }

      return { data, error }
    } catch (error) {
      logger.error('Error batch updating courses', error)
      return { data: null, error }
    }
  }
}

/**
 * Optimized quiz operations
 */
export const optimizedQuizAPI = {
  /**
   * Get quiz with questions in single query
   */
  async getQuizWithQuestions(id: string) {
    const cacheKey = `quiz_${id}`
    const cached = cache.get(cacheKey)
    if (cached) {
      logger.debug('Returning cached quiz')
      return { data: cached, error: null }
    }

    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select(`
          *,
          quiz_questions (
            id,
            question,
            options,
            correct_answer,
            explanation,
            order_index
          )
        `)
        .eq('id', id)
        .eq('is_published', true)
        .single()

      if (!error && data) {
        cache.set(cacheKey, data)
      }

      return { data, error }
    } catch (error) {
      logger.error('Error fetching quiz with questions', error)
      return { data: null, error }
    }
  }
}

/**
 * Optimized user statistics
 */
export const optimizedUserAPI = {
  /**
   * Get comprehensive user dashboard data in minimal queries
   */
  async getUserDashboardData(userId: string) {
    const cacheKey = `user_dashboard_${userId}`
    const cached = cache.get(cacheKey)
    if (cached) {
      return { data: cached, error: null }
    }

    try {
      // Single query to get all user data
      const [enrollmentsResult, attemptsResult] = await Promise.all([
        supabase
          .from('enrollments')
          .select(`
            id,
            progress,
            enrolled_at,
            completed_at,
            courses!inner (
              id,
              title,
              image_url,
              instructor_name
            )
          `)
          .eq('user_id', userId),
        
        supabase
          .from('quiz_attempts')
          .select(`
            id,
            score,
            completed_at,
            quizzes!inner (
              title,
              category
            )
          `)
          .eq('user_id', userId)
          .order('completed_at', { ascending: false })
          .limit(10)
      ])

      if (enrollmentsResult.error || attemptsResult.error) {
        throw enrollmentsResult.error || attemptsResult.error
      }

      const dashboardData = {
        enrollments: enrollmentsResult.data || [],
        recentAttempts: attemptsResult.data || [],
        stats: {
          coursesEnrolled: enrollmentsResult.data?.length || 0,
          coursesCompleted: enrollmentsResult.data?.filter(e => e.progress === 100).length || 0,
          quizzesTaken: attemptsResult.data?.length || 0,
          averageScore: attemptsResult.data?.length 
            ? Math.round(attemptsResult.data.reduce((sum, a) => sum + a.score, 0) / attemptsResult.data.length)
            : 0
        }
      }

      cache.set(cacheKey, dashboardData)
      return { data: dashboardData, error: null }

    } catch (error) {
      logger.error('Error fetching user dashboard data', error)
      return { data: null, error }
    }
  }
}

// Clear cache periodically
setInterval(() => {
  cache.clear()
  logger.debug('Cache cleared')
}, 10 * 60 * 1000) // Clear every 10 minutes
