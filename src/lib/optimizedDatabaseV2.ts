// High-performance database operations with caching and batching
import { supabase } from './supabase'
import { logger } from './logger'

// Cache configuration
const CACHE_TTL = {
  courses: 5 * 60 * 1000, // 5 minutes
  quizzes: 3 * 60 * 1000, // 3 minutes
  categories: 30 * 60 * 1000, // 30 minutes
  users: 10 * 60 * 1000, // 10 minutes
}

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

class PerformanceCache {
  private cache = new Map<string, CacheEntry<any>>()
  private maxSize = 100 // Prevent memory leaks

  set<T>(key: string, data: T, ttl: number): void {
    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) return null
    
    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  invalidate(pattern: string): void {
    const keysToDelete = Array.from(this.cache.keys()).filter(key => 
      key.includes(pattern)
    )
    keysToDelete.forEach(key => this.cache.delete(key))
  }

  clear(): void {
    this.cache.clear()
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      keys: Array.from(this.cache.keys()),
    }
  }
}

const cache = new PerformanceCache()

// Batch operation utilities
class BatchOperations {
  private batches = new Map<string, any[]>()
  private timers = new Map<string, NodeJS.Timeout>()
  private readonly BATCH_SIZE = 50
  private readonly BATCH_DELAY = 100 // ms

  add(operation: string, item: any, processor: (items: any[]) => Promise<void>) {
    if (!this.batches.has(operation)) {
      this.batches.set(operation, [])
    }

    const batch = this.batches.get(operation)!
    batch.push(item)

    // Clear existing timer
    if (this.timers.has(operation)) {
      clearTimeout(this.timers.get(operation)!)
    }

    // Process batch when full or after delay
    if (batch.length >= this.BATCH_SIZE) {
      this.processBatch(operation, processor)
    } else {
      const timer = setTimeout(() => {
        this.processBatch(operation, processor)
      }, this.BATCH_DELAY)
      this.timers.set(operation, timer)
    }
  }

  private async processBatch(operation: string, processor: (items: any[]) => Promise<void>) {
    const batch = this.batches.get(operation)
    if (!batch || batch.length === 0) return

    this.batches.set(operation, []) // Clear batch
    this.timers.delete(operation)

    try {
      await processor(batch)
      logger.debug(`Processed batch operation: ${operation}`, { count: batch.length })
    } catch (error) {
      logger.error(`Batch operation failed: ${operation}`, error)
    }
  }
}

const batcher = new BatchOperations()

// Optimized query builders
export class OptimizedDatabase {
  // Courses with intelligent caching and prefetching
  static async getCourses(options: {
    published?: boolean
    category?: string
    limit?: number
    offset?: number
    includeCounts?: boolean
  } = {}) {
    const cacheKey = `courses:${JSON.stringify(options)}`
    const cached = cache.get(cacheKey)
    if (cached) {
      logger.debug('Cache hit for courses query')
      return cached
    }

    let query = supabase
      .from('courses')
      .select(`
        id,
        title,
        description,
        level,
        duration,
        image_url,
        category_id,
        instructor_id,
        is_published,
        price,
        created_at,
        updated_at,
        ${options.includeCounts ? `
          enrollments:enrollments(count),
          modules:course_modules(count)
        ` : ''}
      `)

    if (options.published !== undefined) {
      query = query.eq('is_published', options.published)
    }

    if (options.category) {
      query = query.eq('category_id', options.category)
    }

    if (options.limit) {
      query = query.limit(options.limit)
    }

    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
    }

    query = query.order('created_at', { ascending: false })

    const { data, error } = await query

    if (error) {
      logger.error('Error fetching courses:', error)
      throw error
    }

    cache.set(cacheKey, data, CACHE_TTL.courses)
    return data
  }

  // Optimized quiz fetching with related data
  static async getQuizzesWithDetails(options: {
    lessonId?: string
    category?: string
    published?: boolean
    withQuestions?: boolean
    withAttempts?: boolean
    limit?: number
  } = {}) {
    const cacheKey = `quizzes:detailed:${JSON.stringify(options)}`
    const cached = cache.get(cacheKey)
    if (cached) return cached

    let selectClause = `
      id,
      title,
      description,
      lesson_id,
      category,
      difficulty,
      duration_minutes,
      passing_score,
      max_attempts,
      is_published,
      image_url,
      created_by,
      created_at,
      updated_at
    `

    if (options.withQuestions) {
      selectClause += `,
        questions:quiz_questions(
          id,
          question,
          question_type,
          options,
          correct_answer,
          explanation,
          order_index,
          points
        )
      `
    }

    if (options.withAttempts) {
      selectClause += `,
        attempts_count:quiz_attempts(count),
        avg_score:quiz_attempts.score.avg()
      `
    }

    let query = supabase.from('quizzes').select(selectClause)

    if (options.lessonId) {
      query = query.eq('lesson_id', options.lessonId)
    }

    if (options.category) {
      query = query.eq('category', options.category)
    }

    if (options.published !== undefined) {
      query = query.eq('is_published', options.published)
    }

    if (options.limit) {
      query = query.limit(options.limit)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error

    cache.set(cacheKey, data, CACHE_TTL.quizzes)
    return data
  }

  // Batch user enrollment operations
  static async batchEnrollUsers(enrollments: Array<{ userId: string; courseId: string }>) {
    return new Promise<void>((resolve, reject) => {
      batcher.add('enrollments', enrollments, async (batch) => {
        try {
          const flatBatch = batch.flat()
          const { error } = await supabase
            .from('enrollments')
            .upsert(flatBatch, { onConflict: 'user_id,course_id' })

          if (error) throw error

          // Invalidate related caches
          cache.invalidate('enrollments')
          cache.invalidate('courses')
          
          resolve()
        } catch (error) {
          reject(error)
        }
      })
    })
  }

  // Optimized question operations with bulk operations
  static async bulkUpdateQuestions(quizId: string, questions: any[]) {
    const startTime = performance.now()

    try {
      // Delete existing questions
      await supabase
        .from('quiz_questions')
        .delete()
        .eq('quiz_id', quizId)

      // Batch insert new questions
      if (questions.length > 0) {
        const chunks = this.chunkArray(questions, 50) // Process in chunks of 50
        
        for (const chunk of chunks) {
          const { error } = await supabase
            .from('quiz_questions')
            .insert(chunk)

          if (error) throw error
        }
      }

      // Invalidate caches
      cache.invalidate(`quiz:${quizId}`)
      cache.invalidate('quizzes')

      const duration = performance.now() - startTime
      logger.debug('Bulk question update completed', { 
        quizId, 
        questionsCount: questions.length, 
        durationMs: duration 
      })

    } catch (error) {
      logger.error('Bulk question update failed', error)
      throw error
    }
  }

  // Analytics queries with heavy caching
  static async getAnalyticsData(timeRange: '7d' | '30d' | '90d' | 'all') {
    const cacheKey = `analytics:${timeRange}`
    const cached = cache.get(cacheKey)
    if (cached) return cached

    const dateFilter = this.getDateFilter(timeRange)

    const [courseStats, quizStats, userStats] = await Promise.all([
      this.getCourseAnalytics(dateFilter),
      this.getQuizAnalytics(dateFilter),
      this.getUserAnalytics(dateFilter),
    ])

    const analyticsData = {
      courses: courseStats,
      quizzes: quizStats,
      users: userStats,
      lastUpdated: new Date(),
    }

    // Cache analytics for 5 minutes
    cache.set(cacheKey, analyticsData, 5 * 60 * 1000)
    return analyticsData
  }

  // Utility methods
  private static chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size))
    }
    return chunks
  }

  private static getDateFilter(timeRange: string) {
    const now = new Date()
    switch (timeRange) {
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString()
      default:
        return null
    }
  }

  private static async getCourseAnalytics(dateFilter: string | null) {
    let query = supabase
      .from('courses')
      .select(`
        id,
        created_at,
        is_published,
        enrollments:enrollments(count)
      `)

    if (dateFilter) {
      query = query.gte('created_at', dateFilter)
    }

    const { data } = await query
    return data
  }

  private static async getQuizAnalytics(dateFilter: string | null) {
    let query = supabase
      .from('quiz_attempts')
      .select(`
        id,
        score,
        created_at,
        quiz:quizzes(id, title, category)
      `)

    if (dateFilter) {
      query = query.gte('created_at', dateFilter)
    }

    const { data } = await query
    return data
  }

  private static async getUserAnalytics(dateFilter: string | null) {
    let query = supabase
      .from('users')
      .select('id, created_at, role')

    if (dateFilter) {
      query = query.gte('created_at', dateFilter)
    }

    const { data } = await query
    return data
  }

  // Cache management
  static clearCache(pattern?: string) {
    if (pattern) {
      cache.invalidate(pattern)
    } else {
      cache.clear()
    }
  }

  static getCacheStats() {
    return cache.getStats()
  }
}

// Export for use in components
export { cache, batcher }
