import { courseCache } from './cache'
import { supabase } from './supabase'
import type { Course, CourseModule, CourseLesson } from './supabase'

import { logger } from '@/lib/logger'

export interface BatchCourseRequest {
  courseIds: string[]
  includeLessons?: boolean
  includeModules?: boolean
}

export interface CourseSearchOptions {
  query?: string
  category?: string
  isPublished?: boolean
  limit?: number
  offset?: number
}

class CoursePreloadingService {
  private preloadQueue: Set<string> = new Set()
  private batchSize = 10
  private batchDelay = 100 // ms
  private processingTimeouts = new Set<NodeJS.Timeout>()
  private isDestroyed = false

  // Preload courses for better UX
  async preloadCourses(courseIds: string[]) {
    if (this.isDestroyed) return
    
    const uncachedIds = courseIds.filter(id => !courseCache.get(`course:${id}`))
    
    if (uncachedIds.length === 0) return

    // Add to queue
    uncachedIds.forEach(id => this.preloadQueue.add(id))

    // Process queue in batches with timeout tracking
    const timeout = setTimeout(() => this.processBatch(), this.batchDelay)
    this.processingTimeouts.add(timeout)
  }

  private async processBatch() {
    if (this.isDestroyed || this.preloadQueue.size === 0) return

    const batch = Array.from(this.preloadQueue).slice(0, this.batchSize)
    this.preloadQueue = new Set([...this.preloadQueue].slice(this.batchSize))

    try {
      await this.batchLoadCourses(batch)
    } catch (error) {
      logger.warn('Batch preload failed:', error)
    }

    // Continue processing if more items in queue and not destroyed
    if (this.preloadQueue.size > 0 && !this.isDestroyed) {
      const timeout = setTimeout(() => this.processBatch(), this.batchDelay)
      this.processingTimeouts.add(timeout)
    }
  }

  destroy() {
    this.isDestroyed = true
    this.processingTimeouts.forEach(timeout => clearTimeout(timeout))
    this.processingTimeouts.clear()
    this.preloadQueue.clear()
  }

  private async batchLoadCourses(courseIds: string[]) {
    const { data: courses, error } = await supabase
      .from('courses')
      .select(`
        *,
        course_modules(
          *,
          course_lessons(*)
        )
      `)
      .in('id', courseIds)

    if (error) throw error

    // Cache each course
    courses?.forEach((course: { id: string }) => {
      if (course?.id) {
        courseCache.set(`course:${course.id}`, course, ['courses', `course:${course.id}`])
      }
    })
  }

  // Smart preloading based on user behavior
  async preloadRelatedCourses(currentCourseId: string) {
    try {
      // Get current course category to find related courses
      const currentCourse = courseCache.get(`course:${currentCourseId}`) as Course | undefined
      if (!currentCourse || !currentCourse.category) return

      const { data: relatedCourses } = await supabase
        .from('courses')
        .select('id, category')
        .eq('category', currentCourse.category)
        .neq('id', currentCourseId)
        .eq('is_published', true)
        .limit(5)

      if (relatedCourses) {
        this.preloadCourses(relatedCourses.map((c: { id: string }) => c.id))
      }
    } catch (error) {
      logger.warn('Related course preloading failed:', error)
    }
  }

  // Preload courses visible in viewport
  async preloadVisibleCourses(visibleCourseIds: string[]) {
    this.preloadCourses(visibleCourseIds)
  }
}

class CourseSearchService {
  private searchCache = new Map<string, { results: Course[], timestamp: number }>()
  private searchTTL = 5 * 60 * 1000 // 5 minutes

  async searchCourses(options: CourseSearchOptions): Promise<Course[]> {
    const cacheKey = this.generateSearchKey(options)
    const cached = this.searchCache.get(cacheKey)

    // Return cached results if still fresh
    if (cached && Date.now() - cached.timestamp < this.searchTTL) {
      return cached.results
    }

    try {
      let query = supabase
        .from('courses')
        .select(`
          *,
          course_modules!inner(
            *,
            course_lessons(*)
          )
        `)

      // Apply filters with proper sanitization to prevent SQL injection
      if (options.query) {
        // Sanitize query to prevent SQL injection - escape special characters
        const sanitizedQuery = options.query
          .replace(/[%_\\]/g, '\\$&') // Escape LIKE wildcards and backslashes
          .replace(/[<>'"&]/g, '') // Remove potential XSS characters
          .trim()
          .substring(0, 100) // Limit length to prevent DoS
        
        if (sanitizedQuery.length > 0) {
          query = query.or(`title.ilike.%${sanitizedQuery}%, description.ilike.%${sanitizedQuery}%`)
        }
      }
      
      if (options.category) {
        query = query.eq('category', options.category)
      }
      
      if (options.isPublished !== undefined) {
        query = query.eq('is_published', options.isPublished)
      }

      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit)
      }
      
      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
      }

      const { data: courses, error } = await query.order('created_at', { ascending: false })

      if (error) throw error

      const results = courses || []

      // Cache results
      this.searchCache.set(cacheKey, {
        results,
        timestamp: Date.now()
      })

      // Also cache individual courses
      results.forEach((course: any) => {
        courseCache.set(`course:${course.id}`, course, ['courses', `course:${course.id}`])
      })

      return results
    } catch (error) {
      logger.error('Course search failed:', error)
      return []
    }
  }

  private generateSearchKey(options: CourseSearchOptions): string {
    return JSON.stringify({
      q: options.query || '',
      cat: options.category || '',
      pub: options.isPublished ?? true,
      limit: options.limit || 10,
      offset: options.offset || 0
    })
  }

  clearSearchCache() {
    this.searchCache.clear()
  }
}

class CourseOptimizationService {
  // Lazy load course modules and lessons
  async loadCourseModules(courseId: string): Promise<CourseModule[]> {
    const cacheKey = `course:${courseId}:modules`
    
    // Check cache first
    const cached = courseCache.get<CourseModule[]>(cacheKey)
    if (cached) {
      return cached
    }

    try {
      const { data: modules, error } = await supabase
        .from('course_modules')
        .select(`
          *,
          course_lessons(*)
        `)
        .eq('course_id', courseId)
        .order('order_index')

      if (error) throw error

      const result = modules || []
      courseCache.set(cacheKey, result, ['courses', `course:${courseId}`, 'modules'])
      
      return result
    } catch (error) {
      logger.error('Failed to load course modules:', error)
      return []
    }
  }

  // Lazy load individual lessons
  async loadLesson(lessonId: string): Promise<CourseLesson | null> {
    const cacheKey = `lesson:${lessonId}`
    
    const cached = courseCache.get<CourseLesson>(cacheKey)
    if (cached) {
      return cached
    }

    try {
      const { data: lesson, error } = await supabase
        .from('course_lessons')
        .select('*')
        .eq('id', lessonId)
        .single()

      if (error) throw error

      courseCache.set(cacheKey, lesson, ['lessons', `lesson:${lessonId}`])
      return lesson
    } catch (error) {
      logger.error('Failed to load lesson:', error)
      return null
    }
  }

  // Prefetch next lesson for smooth navigation
  async prefetchNextLesson(currentLessonId: string) {
    try {
      const { data: nextLesson } = await supabase
        .from('course_lessons')
        .select('id, order_index, module_id')
        .eq('id', currentLessonId)
        .single()

      if (nextLesson) {
        // Find next lesson in same module or next module
        const { data: next } = await supabase
          .from('course_lessons')
          .select('*')
          .eq('module_id', nextLesson.module_id)
          .gt('order_index', nextLesson.order_index)
          .order('order_index')
          .limit(1)
          .single()

        if (next) {
          this.loadLesson(next.id) // Prefetch in background
        }
      }
    } catch (error) {
      // Silently fail for prefetching
      logger.debug('Prefetch failed:', error)
    }
  }
}

// Export service instances
export const coursePreloader = new CoursePreloadingService()
export const courseSearch = new CourseSearchService()
export const courseOptimizer = new CourseOptimizationService()

// Utility functions for common operations
export const courseUtils = {
  // Get course with smart caching
  async getCourse(id: string, includeContent = false): Promise<Course | null> {
    const cacheKey = includeContent ? `course:${id}:full` : `course:${id}`
    
    const cached = courseCache.get<Course>(cacheKey)
    if (cached) {
      return cached
    }

    try {
      let selectQuery = '*'
      
      if (includeContent) {
        selectQuery = `
          *,
          course_modules(
            *,
            course_lessons(*)
          )
        `
      }

      const { data, error } = await supabase
        .from('courses')
        .select(selectQuery)
        .eq('id', id)
        .single()

      if (error) throw error
      if (!data) throw new Error('Course not found')

      const course = data as unknown as Course
      courseCache.set(cacheKey, course, ['courses', `course:${id}`])
      return course
    } catch (error) {
      logger.error('Failed to get course:', error)
      return null
    }
  },

  // Invalidate all course-related cache
  invalidateCourse(courseId: string) {
    courseCache.invalidateByTags([`course:${courseId}`])
  },

  // Warm up cache for popular courses
  async warmUpPopularCourses() {
    try {
      const { data: popular } = await supabase
        .from('courses')
        .select('id')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(10)

      if (popular) {
        coursePreloader.preloadCourses(popular.map((c: any) => c.id))
      }
    } catch (error) {
      logger.warn('Failed to warm up popular courses:', error)
    }
  }
}

// Note: Event listener cleanup is handled by the browser on page unload
// No need for manual cleanup here as the destroy() method is called automatically
