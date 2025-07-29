/**
 * Enhanced Database Operations with Advanced Caching
 * Integrates the new cache system with database operations
 */

import { supabase, Course, Quiz, User } from './supabase'
import { courseCache, quizCache, userCache, useCachedQuery, useCacheMutation } from './cache'

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
    const { data, error } = await supabase
      .from('courses')
      .insert([{
        ...courseData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) throw error

    const course = data as Course
    
    // Invalidate course lists but cache the new course
    courseCache.invalidateByTags(['courses-list'])
    courseCache.set(`course:${course.id}`, course, ['courses', `course-${course.id}`])
    
    return course
  },

  // Update course with cache invalidation
  updateCourse: async (id: string, updates: Partial<Course>): Promise<Course> => {
    console.log('🔄 [DATABASE_API] === STARTING DATABASE UPDATE ===')
    console.log('🔄 [DATABASE_API] Timestamp:', new Date().toISOString())
    console.log('🔄 [DATABASE_API] Course ID:', id)
    console.log('� [DATABASE_API] Updates to apply:', JSON.stringify(updates, null, 2))

    try {
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      }
      
      console.log('📝 [DATABASE_API] Final update data:', JSON.stringify(updateData, null, 2))
      console.log('🌐 [DATABASE_API] Calling Supabase update...')

      const { data, error } = await supabase
        .from('courses')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      console.log('🌐 [DATABASE_API] Supabase response received')
      console.log('🌐 [DATABASE_API] Error:', error)
      console.log('🌐 [DATABASE_API] Data:', data)

      if (error) {
        console.error('❌ [DATABASE_API] Database error occurred:')
        console.error('❌ [DATABASE_API] Error code:', error.code)
        console.error('❌ [DATABASE_API] Error message:', error.message)
        console.error('❌ [DATABASE_API] Error details:', JSON.stringify(error, null, 2))
        throw error
      }

      if (!data) {
        console.error('❌ [DATABASE_API] No data returned from update')
        console.error('❌ [DATABASE_API] This might indicate the course was not found')
        throw new Error('No data returned from database - course may not exist')
      }

      const course = data as Course
      console.log('✅ [DATABASE_API] Database update successful')
      console.log('✅ [DATABASE_API] Updated course title:', course.title)
      console.log('✅ [DATABASE_API] Updated course data:', JSON.stringify(course, null, 2))
      
      console.log('🗄️ [DATABASE_API] Updating cache...')
      courseCache.set(`course:${id}`, course, ['courses', `course-${id}`])
      console.log('🗄️ [DATABASE_API] Course cached successfully')
      
      console.log('🗑️ [DATABASE_API] Invalidating course lists...')
      courseCache.invalidateByTags(['courses-list'])
      console.log('🗑️ [DATABASE_API] Course lists invalidated')
      
      console.log('✅ [DATABASE_API] === DATABASE UPDATE COMPLETE ===')
      return course
    } catch (error) {
      console.error('💥 [DATABASE_API] === DATABASE UPDATE FAILED ===')
      console.error('💥 [DATABASE_API] Error timestamp:', new Date().toISOString())
      console.error('💥 [DATABASE_API] Course ID that failed:', id)
      console.error('💥 [DATABASE_API] Updates that failed:', JSON.stringify(updates, null, 2))
      console.error('💥 [DATABASE_API] Error details:', error)
      console.error('💥 [DATABASE_API] Error type:', typeof error)
      console.error('💥 [DATABASE_API] Error constructor:', error?.constructor?.name)
      
      if (error instanceof Error) {
        console.error('💥 [DATABASE_API] Error message:', error.message)
        console.error('💥 [DATABASE_API] Error stack:', error.stack)
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
        console.log('✅ Course created successfully:', data.title)
      },
      onError: (error) => {
        console.error('❌ Failed to create course:', error.message)
      }
    }
  )

  const updateMutation = useCacheMutation(
    ({ id, updates }: { id: string; updates: Partial<Course> }) => {
      console.log('🔄 [COURSE_MUTATIONS] === UPDATE MUTATION STARTED ===')
      console.log('🔄 [COURSE_MUTATIONS] Course ID:', id)
      console.log('🔄 [COURSE_MUTATIONS] Updates:', JSON.stringify(updates, null, 2))
      console.log('🔄 [COURSE_MUTATIONS] Calling cachedCourseAPI.updateCourse...')
      
      return cachedCourseAPI.updateCourse(id, updates)
    },
    {
      invalidateTags: ['courses-list'],
      cache: courseCache,
      onSuccess: (data) => {
        console.log('✅ [COURSE_MUTATIONS] UPDATE SUCCESS')
        console.log('✅ [COURSE_MUTATIONS] Updated course:', data.title)
        console.log('✅ [COURSE_MUTATIONS] Full course data:', JSON.stringify(data, null, 2))
      },
      onError: (error) => {
        console.error('❌ [COURSE_MUTATIONS] UPDATE ERROR')
        console.error('❌ [COURSE_MUTATIONS] Error message:', error.message)
        console.error('❌ [COURSE_MUTATIONS] Full error:', error)
      }
    }
  )

  const deleteMutation = useCacheMutation(
    (id: string) => cachedCourseAPI.deleteCourse(id),
    {
      invalidateTags: ['courses-list'],
      cache: courseCache,
      onSuccess: () => {
        console.log('✅ Course deleted successfully')
      },
      onError: (error) => {
        console.error('❌ Failed to delete course:', error.message)
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
    console.log('🔄 Preloading popular courses...')
    try {
      await cachedCourseAPI.getCourses({ is_published: true })
      console.log('✅ Popular courses preloaded')
    } catch (error) {
      console.warn('⚠️ Failed to preload popular courses:', error)
    }
  },

  // Preload course details when user hovers
  preloadCourse: async (id: string) => {
    try {
      await cachedCourseAPI.getCourse(id)
    } catch (error) {
      console.warn(`⚠️ Failed to preload course ${id}:`, error)
    }
  },

  // Preload user dashboard data
  preloadDashboard: async (userId: string) => {
    console.log('🔄 Preloading dashboard data...')
    try {
      await Promise.all([
        cachedCourseAPI.getCourses({ instructor_id: userId }),
        cachedUserAPI.getUserProfile(userId),
        cachedQuizAPI.getQuizzes()
      ])
      console.log('✅ Dashboard data preloaded')
    } catch (error) {
      console.warn('⚠️ Failed to preload dashboard data:', error)
    }
  }
}

// ==============================================
// 6. CACHE WARMING ON APP START
// ==============================================

export const initializeCache = async () => {
  console.log('🚀 Initializing cache system...')
  
  // Preload critical data
  try {
    await cachePreloader.preloadPopularCourses()
    console.log('✅ Cache system initialized successfully')
  } catch (error) {
    console.warn('⚠️ Cache initialization warning:', error)
  }
}

// Auto-initialize if in browser
if (typeof window !== 'undefined') {
  // Initialize cache after a short delay to not block initial render
  setTimeout(initializeCache, 1000)
}
