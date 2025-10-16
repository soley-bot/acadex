/**
 * Cached Operations - Course API Module
 * 
 * Handles course operations with advanced caching integration.
 * Extracted from cachedOperations.ts for better organization and maintainability.
 */

import { logger } from '@/lib/logger'
import { createSupabaseClient, Course } from '../supabase'
import { courseCache } from '../cache'
import { courseAPI } from '../auth-api'

// Create a shared client instance for this module
const supabase = createSupabaseClient()

export const cachedCourseAPI = {
  // Get all courses with caching
  getCourses: async (filters?: {
    category?: string
    level?: string
    is_published?: boolean
    instructor_id?: string
  }): Promise<Course[]> => {
    const cacheKey = `courses:list:${JSON.stringify(filters || {})}`
    
    const cachedData = courseCache.get<Course[]>(cacheKey)
    if (cachedData) {
      return cachedData
    }

    let query = supabase
      .from('courses')
      .select(`
        id, title, description, instructor_id, instructor_name,
        category, level, price, duration, image_url, thumbnail_url,
        video_preview_url, tags, prerequisites, learning_objectives,
        status, published_at, archived_at, original_price, 
        discount_percentage, is_free, rating, student_count,
        is_published, created_at, updated_at
      `)
      .order('created_at', { ascending: false })

    // Apply filters
    if (filters?.category) {
      query = query.eq('category', filters.category)
    }
    if (filters?.level) {
      query = query.eq('level', filters.level)
    }
    if (filters?.is_published !== undefined) {
      query = query.eq('is_published', filters.is_published)
    }
    if (filters?.instructor_id) {
      query = query.eq('instructor_id', filters.instructor_id)
    }

    const { data, error } = await query

    if (error) throw error

    const courses = (data || []) as Course[]
    courseCache.set(cacheKey, courses, ['courses', 'courses-list'])
    
    // Also cache individual courses
    courses.forEach(course => {
      courseCache.set(`course:${course.id}`, course, ['courses', `course-${course.id}`])
    })

    return courses
  },

  // Get course by ID with caching
  getCourse: async (id: string): Promise<Course | null> => {
    const cacheKey = `course:${id}`
    
    const cachedData = courseCache.get<Course>(cacheKey)
    if (cachedData) {
      return cachedData
    }

    const { data, error } = await supabase
      .from('courses')
      .select(`
        id, title, description, instructor_id, instructor_name,
        category, level, price, duration, image_url, thumbnail_url,
        video_preview_url, tags, prerequisites, learning_objectives,
        status, published_at, archived_at, original_price, 
        discount_percentage, is_free, rating, student_count,
        is_published, created_at, updated_at
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Course not found
      }
      throw error
    }

    const course = data as Course
    courseCache.set(cacheKey, course, ['courses', `course-${id}`])
    
    return course
  },

  // Create course with cache invalidation
  createCourse: async (courseData: Partial<Course>): Promise<Course> => {
    logger.debug('🔄 [CACHED_API] Creating course via authenticated API')
    logger.debug('📝 [CACHED_API] Course data:', JSON.stringify(courseData, null, 2))
    
    try {
      const response = await courseAPI.createCourse(courseData)
      
      logger.debug('🔍 [CACHED_API] Raw API response:', response)
      
      if (response?.error) {
        logger.error('❌ [CACHED_API] Create course API error:', response.error)
        throw new Error(response.error)
      }
      
      // The courseAPI.createCourse returns the course data directly, not wrapped in a response object
      const course = response as Course
      
      if (!course || !course.id) {
        logger.error('❌ [CACHED_API] Invalid course response - missing course data or ID')
        logger.error('❌ [CACHED_API] Response was:', response)
        throw new Error('Invalid course response from API')
      }
      
      logger.debug('✅ [CACHED_API] Course created successfully:', course.id)
      
      // Invalidate course lists but cache the new course
      courseCache.invalidateByTags(['courses-list'])
      courseCache.set(`course:${course.id}`, course, ['courses', `course-${course.id}`])
      
      return course
    } catch (error) {
      logger.error('❌ [CACHED_API] Create course error:', error)
      throw error
    }
  },

  // Update course with cache invalidation
  updateCourse: async (id: string, updates: Partial<Course>): Promise<Course> => {
    console.log('🎯 [DIRECT_LOG] CACHED API UPDATE COURSE CALLED!!')
    console.log('🎯 [DIRECT_LOG] ID:', id)
    console.log('🎯 [DIRECT_LOG] Updates:', updates)
    
    logger.debug('🔄 [CACHED_API] === STARTING COURSE UPDATE ===')
    logger.debug('🔄 [CACHED_API] Timestamp:', new Date().toISOString())
    logger.debug('🔄 [CACHED_API] Course ID:', id)
    logger.debug('📝 [CACHED_API] Updates to apply:', JSON.stringify(updates, null, 2))

    try {
      logger.debug('🌐 [CACHED_API] Calling authenticated course API...')
      
      const response = await courseAPI.updateCourse(id, updates)
      
      logger.debug('🌐 [CACHED_API] API response received')
      logger.debug('🌐 [CACHED_API] Response:', JSON.stringify(response, null, 2))

      if (response.error || !response.success) {
        logger.error('❌ [CACHED_API] API error occurred:')
        logger.error('❌ [CACHED_API] Error message:', response.error)
        throw new Error(response.error || 'Failed to update course')
      }

      if (!response.data) {
        logger.error('❌ [CACHED_API] No course data returned from API')
        throw new Error('No course data returned from API - course may not exist')
      }

      const course = response.data as Course
      logger.debug('✅ [CACHED_API] Course update successful')
      logger.debug('✅ [CACHED_API] Updated course title:', course.title)
      logger.debug('✅ [CACHED_API] Updated course data:', JSON.stringify(course, null, 2))
      
      logger.debug('🗄️ [CACHED_API] Updating cache...')
      courseCache.set(`course:${id}`, course, ['courses', `course-${id}`])
      logger.debug('🗄️ [CACHED_API] Course cached successfully')
      
      logger.debug('🗑️ [CACHED_API] Invalidating course lists...')
      courseCache.invalidateByTags(['courses-list'])
      logger.debug('🗑️ [CACHED_API] Course lists invalidated')
      
      logger.debug('✅ [CACHED_API] === COURSE UPDATE COMPLETE ===')
      return course
    } catch (error) {
      logger.error('💥 [CACHED_API] === COURSE UPDATE FAILED ===')
      logger.error('💥 [CACHED_API] Error timestamp:', new Date().toISOString())
      logger.error('💥 [CACHED_API] Course ID that failed:', id)
      logger.error('💥 [CACHED_API] Updates that failed:', JSON.stringify(updates, null, 2))
      logger.error('💥 [CACHED_API] Error details:', error)
      
      if (error instanceof Error) {
        logger.error('💥 [CACHED_API] Error message:', error.message)
        logger.error('💥 [CACHED_API] Error stack:', error.stack)
      }
      
      throw error
    }
  },

  // Delete course with cache cleanup
  deleteCourse: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id)

    if (error) throw error

    // Clean up cache
    courseCache.invalidateByTags([`course-${id}`, 'courses-list'])
  }
}