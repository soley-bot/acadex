import { logger } from '@/lib/logger'

/**
 * Enhanced Database Operations with Advanced Caching
 * Integrates the new cache system with database operations
 */

import { supabase, Course, Quiz, User } from './supabase'
import { courseCache, quizCache, userCache, useCachedQuery, useCacheMutation } from './cache'
import { courseAPI } from './auth-api'

// ==============================================
// 1. CACHED COURSE OPERATIONS
// ==============================================

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

// ==============================================
// 2. CACHED QUIZ OPERATIONS
// ==============================================

export const cachedQuizAPI = {
  // Get all quizzes with caching
  getQuizzes: async (filters?: {
    category?: string
    difficulty?: string
    course_id?: string
  }): Promise<Quiz[]> => {
    const cacheKey = `quizzes:list:${JSON.stringify(filters || {})}`
    
    const cachedData = quizCache.get<Quiz[]>(cacheKey)
    if (cachedData) {
      return cachedData
    }

    let query = supabase
      .from('quizzes')
      .select('*')
      .order('created_at', { ascending: false })

    // Apply filters
    if (filters?.category) {
      query = query.eq('category', filters.category)
    }
    if (filters?.difficulty) {
      query = query.eq('difficulty', filters.difficulty)
    }
    if (filters?.course_id) {
      query = query.eq('course_id', filters.course_id)
    }

    const { data, error } = await query

    if (error) throw error

    const quizzes = (data || []) as Quiz[]
    quizCache.set(cacheKey, quizzes, ['quizzes', 'quizzes-list'])
    
    // Cache individual quizzes
    quizzes.forEach(quiz => {
      quizCache.set(`quiz:${quiz.id}`, quiz, ['quizzes', `quiz-${quiz.id}`])
    })

    return quizzes
  },

  // Get quiz by ID with caching
  getQuiz: async (id: string): Promise<Quiz | null> => {
    const cacheKey = `quiz:${id}`
    
    const cachedData = quizCache.get<Quiz>(cacheKey)
    if (cachedData) {
      return cachedData
    }

    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw error
    }

    const quiz = data as Quiz
    quizCache.set(cacheKey, quiz, ['quizzes', `quiz-${id}`])
    
    return quiz
  }
}

// ==============================================
// 3. CACHED USER OPERATIONS
// ==============================================

export const cachedUserAPI = {
  // Get user profile with caching
  getUserProfile: async (id: string): Promise<User | null> => {
    const cacheKey = `user:${id}`
    
    const cachedData = userCache.get<User>(cacheKey)
    if (cachedData) {
      return cachedData
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw error
    }

    const user = data as User
    userCache.set(cacheKey, user, ['users', `user-${id}`])
    
    return user
  },

  // Update user profile with cache invalidation
  updateUserProfile: async (id: string, updates: Partial<User>): Promise<User> => {
    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    const user = data as User
    userCache.set(`user:${id}`, user, ['users', `user-${id}`])
    
    return user
  }
}

// ==============================================
// 4. REACT HOOKS FOR CACHED OPERATIONS
// ==============================================

/**
 * Hook for fetching courses with caching
 */
export function useCourses(filters?: {
  category?: string
  level?: string
  is_published?: boolean
  instructor_id?: string
}) {
  const cacheKey = `courses:list:${JSON.stringify(filters || {})}`
  
  return useCachedQuery(
    cacheKey,
    () => cachedCourseAPI.getCourses(filters),
    {
      tags: ['courses', 'courses-list'],
      cache: courseCache,
      staleWhileRevalidate: true
    }
  )
}

/**
 * Hook for fetching a single course with caching
 */
export function useCourse(id: string | null) {
  return useCachedQuery(
    id ? `course:${id}` : 'course:null',
    () => id ? cachedCourseAPI.getCourse(id) : Promise.resolve(null),
    {
      tags: id ? ['courses', `course-${id}`] : [],
      cache: courseCache,
      enabled: !!id,
      staleWhileRevalidate: true
    }
  )
}

/**
 * Hook for course mutations with cache management
 */
export function useCourseMutations() {
  const createMutation = useCacheMutation(
    (courseData: Partial<Course>) => cachedCourseAPI.createCourse(courseData),
    {
      invalidateTags: ['courses-list'],
      cache: courseCache,
      onSuccess: (data) => {
        logger.debug('✅ Course created successfully:', data.title)
        // Note: Modules saving will be handled by the form component
      },
      onError: (error) => {
        logger.error('❌ Failed to create course:', error.message)
      }
    }
  )

  const updateMutation = useCacheMutation(
    ({ id, updates }: { id: string; updates: Partial<Course> }) => {
      console.log('🎯 [DIRECT_LOG] UPDATE MUTATION FUNCTION CALLED!!')
      console.log('🎯 [DIRECT_LOG] ID:', id)
      console.log('🎯 [DIRECT_LOG] Updates:', updates)
      
      logger.debug('🔄 [COURSE_MUTATIONS] === UPDATE MUTATION STARTED ===')
      logger.debug('🔄 [COURSE_MUTATIONS] Course ID:', id)
      logger.debug('🔄 [COURSE_MUTATIONS] Updates:', JSON.stringify(updates, null, 2))
      logger.debug('🔄 [COURSE_MUTATIONS] Calling cachedCourseAPI.updateCourse...')
      
      return cachedCourseAPI.updateCourse(id, updates)
    },
    {
      invalidateTags: ['courses-list'],
      cache: courseCache,
      onSuccess: (data) => {
        logger.debug('✅ [COURSE_MUTATIONS] UPDATE SUCCESS')
        logger.debug('✅ [COURSE_MUTATIONS] Updated course:', data.title)
        logger.debug('✅ [COURSE_MUTATIONS] Full course data:', JSON.stringify(data, null, 2))
      },
      onError: (error) => {
        logger.error('❌ [COURSE_MUTATIONS] UPDATE ERROR')
        logger.error('❌ [COURSE_MUTATIONS] Error message:', error.message)
        logger.error('❌ [COURSE_MUTATIONS] Full error:', error)
      }
    }
  )

  const deleteMutation = useCacheMutation(
    (id: string) => cachedCourseAPI.deleteCourse(id),
    {
      invalidateTags: ['courses-list'],
      cache: courseCache,
      onSuccess: () => {
        logger.debug('✅ Course deleted successfully')
      },
      onError: (error) => {
        logger.error('❌ Failed to delete course:', error.message)
      }
    }
  )

  return {
    createCourse: createMutation.mutate,
    updateCourse: updateMutation.mutate,
    deleteCourse: deleteMutation.mutate,
    isCreating: createMutation.isLoading,
    isUpdating: updateMutation.isLoading,
    isDeleting: deleteMutation.isLoading,
    error: createMutation.error || updateMutation.error || deleteMutation.error
  }
}

/**
 * Hook for fetching quizzes with caching
 */
export function useQuizzes(filters?: {
  category?: string
  difficulty?: string
  course_id?: string
}) {
  const cacheKey = `quizzes:list:${JSON.stringify(filters || {})}`
  
  return useCachedQuery(
    cacheKey,
    () => cachedQuizAPI.getQuizzes(filters),
    {
      tags: ['quizzes', 'quizzes-list'],
      cache: quizCache,
      staleWhileRevalidate: true
    }
  )
}

/**
 * Hook for fetching user profile with caching
 */
export function useUserProfile(id: string | null) {
  return useCachedQuery(
    id ? `user:${id}` : 'user:null',
    () => id ? cachedUserAPI.getUserProfile(id) : Promise.resolve(null),
    {
      tags: id ? ['users', `user-${id}`] : [],
      cache: userCache,
      enabled: !!id,
      staleWhileRevalidate: true
    }
  )
}

// ==============================================
// 5. PRELOADING UTILITIES
// ==============================================

export const cachePreloader = {
  // Preload popular courses
  preloadPopularCourses: async () => {
    logger.debug('🔄 Preloading popular courses...')
    try {
      await cachedCourseAPI.getCourses({ is_published: true })
      logger.debug('✅ Popular courses preloaded')
    } catch (error) {
      logger.warn('⚠️ Failed to preload popular courses:', error)
    }
  },

  // Preload course details when user hovers
  preloadCourse: async (id: string) => {
    try {
      await cachedCourseAPI.getCourse(id)
    } catch (error) {
      logger.warn(`⚠️ Failed to preload course ${id}:`, error)
    }
  },

  // Preload user dashboard data
  preloadDashboard: async (userId: string) => {
    logger.debug('🔄 Preloading dashboard data...')
    try {
      await Promise.all([
        cachedCourseAPI.getCourses({ instructor_id: userId }),
        cachedUserAPI.getUserProfile(userId),
        cachedQuizAPI.getQuizzes()
      ])
      logger.debug('✅ Dashboard data preloaded')
    } catch (error) {
      logger.warn('⚠️ Failed to preload dashboard data:', error)
    }
  }
}

// ==============================================
// 6. CACHE WARMING ON APP START
// ==============================================

export const initializeCache = async () => {
  logger.debug('🚀 Initializing cache system...')
  
  // Preload critical data
  try {
    await cachePreloader.preloadPopularCourses()
    logger.debug('✅ Cache system initialized successfully')
  } catch (error) {
    logger.warn('⚠️ Cache initialization warning:', error)
  }
}

// Auto-initialize if in browser
if (typeof window !== 'undefined') {
  // Initialize cache after a short delay to not block initial render
  setTimeout(initializeCache, 1000)
}
