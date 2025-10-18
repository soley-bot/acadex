/**
 * Auth API Helper
 * Adds authentication headers to API requests
 */

import { createSupabaseClient } from './supabase'
import { logger } from './logger'

// Create module-level Supabase client for auth operations
const supabase = createSupabaseClient()

/**
 * Get the current access token
 * Simple and direct - Supabase SDK already handles caching
 */
export async function getAccessToken(): Promise<string | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token || null
  } catch (error: any) {
    logger.error('Failed to get access token:', { error: error?.message || 'Unknown error' })
    return null
  }
}

/**
 * Create headers with authentication for API requests
 */
export async function createAuthHeaders(additionalHeaders: Record<string, string> = {}): Promise<HeadersInit> {
  const token = await getAccessToken()
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...additionalHeaders
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  return headers
}

/**
 * Alias for createAuthHeaders for backward compatibility and consistency
 * Used by React Query hooks throughout the application
 */
export async function getAuthHeaders(): Promise<HeadersInit> {
  return createAuthHeaders()
}

/**
 * Make an authenticated API request
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  logger.debug('🌐 [AUTH_FETCH] Starting fetch to:', { url })
  logger.debug('🌐 [AUTH_FETCH] Options:', { options })

  const authHeaders = await createAuthHeaders()
  logger.debug('🌐 [AUTH_FETCH] Auth headers created')

  const fetchOptions = {
    ...options,
    headers: {
      ...authHeaders,
      ...options.headers
    },
    credentials: 'include' as RequestCredentials // Include cookies as fallback
  }

  logger.debug('🌐 [AUTH_FETCH] About to call fetch with options:', { fetchOptions })

  const response = await fetch(url, fetchOptions)

  logger.debug('🌐 [AUTH_FETCH] Fetch completed with status:', { status: response.status })

  return response
}

/**
 * Make an authenticated GET request
 */
export async function authenticatedGet(url: string): Promise<Response> {
  return authenticatedFetch(url, { method: 'GET' })
}

/**
 * Make an authenticated POST request with optional abort signal
 */
export async function authenticatedPost(
  url: string, 
  data?: any,
  options?: { signal?: AbortSignal }
): Promise<Response> {
  return authenticatedFetch(url, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
    signal: options?.signal
  })
}

/**
 * Make an authenticated PUT request
 */
export async function authenticatedPut(
  url: string, 
  data?: any
): Promise<Response> {
  return authenticatedFetch(url, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined
  })
}

/**
 * Make an authenticated DELETE request
 */
export async function authenticatedDelete(url: string): Promise<Response> {
  return authenticatedFetch(url, { method: 'DELETE' })
}

// Quiz-specific API helpers
export const quizAPI = {
  /**
   * Get all quizzes with pagination and filters
   */
  async getQuizzes(params: {
    page?: number
    limit?: number
    search?: string
    category?: string
    difficulty?: string
  } = {}) {
    const searchParams = new URLSearchParams()
    
    if (params.page) searchParams.set('page', params.page.toString())
    if (params.limit) searchParams.set('limit', params.limit.toString())
    if (params.search) searchParams.set('search', params.search)
    if (params.category) searchParams.set('category', params.category)
    if (params.difficulty) searchParams.set('difficulty', params.difficulty)
    
    const response = await authenticatedGet(`/api/admin/quizzes?${searchParams}`)
    return response.json()
  },

  /**
   * Create a new quiz with timeout
   */
  async createQuiz(quizData: any) {
    logger.debug('🚀 [QUIZ_API] Creating new quiz:', { title: quizData.title })

    try {
      // Add timeout to prevent hanging
      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        logger.debug('⏰ [QUIZ_API] Quiz creation timeout - aborting request')
        controller.abort()
      }, 30000) // 30 second timeout

      logger.debug('📝 [QUIZ_API] Sending quiz creation payload:', { quizData })

      const response = await authenticatedPost('/api/admin/quizzes', quizData, {
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      logger.debug('📡 [QUIZ_API] Response status:', { status: response.status })

      if (!response.ok) {
        const errorText = await response.text()
        logger.error('❌ [QUIZ_API] Quiz creation failed:', { errorText })
        throw new Error(`Quiz creation failed: ${errorText}`)
      }

      const result = await response.json()
      logger.debug('✅ [QUIZ_API] Quiz created successfully:', { result })

      if (!result.quiz) {
        throw new Error(result.error || 'Quiz creation failed')
      }

      return result
    } catch (error: any) {
      logger.error('💥 [QUIZ_API] Quiz creation error:', { error: error?.message || 'Unknown error' })

      if (error.name === 'AbortError') {
        throw new Error('Quiz creation timed out. Please try again.')
      }

      throw error
    }
  },

  /**
   * Update an existing quiz with timeout
   */
  async updateQuiz(quizData: any) {
    logger.debug('🚀 [QUIZ_API] Updating quiz:', { id: quizData.id })

    try {
      // Add timeout to prevent hanging
      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        logger.debug('⏰ [QUIZ_API] Quiz update timeout - aborting request')
        controller.abort()
      }, 30000) // 30 second timeout

      logger.debug('📝 [QUIZ_API] Sending quiz update payload:', { quizData })

      const response = await authenticatedPut('/api/admin/quizzes', quizData)

      clearTimeout(timeoutId)

      logger.debug('📡 [QUIZ_API] Response status:', { status: response.status })

      if (!response.ok) {
        const errorText = await response.text()
        logger.error('❌ [QUIZ_API] Quiz update failed:', { errorText })
        throw new Error(`Quiz update failed: ${errorText}`)
      }

      const result = await response.json()
      logger.debug('✅ [QUIZ_API] Quiz updated successfully:', { result })

      if (!result.quiz) {
        throw new Error(result.error || 'Quiz update failed')
      }

      return result
    } catch (error: any) {
      logger.error('💥 [QUIZ_API] Quiz update error:', { error: error?.message || 'Unknown error' })

      if (error.name === 'AbortError') {
        throw new Error('Quiz update timed out. Please try again.')
      }

      throw error
    }
  },

  /**
   * Delete a quiz
   */
  async deleteQuiz(quizId: string) {
    const response = await authenticatedDelete(`/api/admin/quizzes?id=${quizId}`)
    return response.json()
  },

  /**
   * Get published quizzes for public consumption (no auth required)
   */
  async getPublishedQuizzes(params: {
    page?: number
    limit?: number
    category?: string
    difficulty?: string
  } = {}) {
    const searchParams = new URLSearchParams()
    
    if (params.page) searchParams.set('page', params.page.toString())
    if (params.limit) searchParams.set('limit', params.limit.toString())
    if (params.category) searchParams.set('category', params.category)
    if (params.difficulty) searchParams.set('difficulty', params.difficulty)
    
    // Use regular fetch since this doesn't require auth
    const response = await fetch(`/api/quizzes?${searchParams}`)
    return response.json()
  }
}

// Course-specific API helpers
export const courseAPI = {
  /**
   * Get all courses with pagination and filters
   */
  async getCourses(params: {
    page?: number
    limit?: number
    search?: string
    category?: string
    level?: string
    is_published?: boolean
  } = {}) {
    const searchParams = new URLSearchParams()
    
    if (params.page) searchParams.set('page', params.page.toString())
    if (params.limit) searchParams.set('limit', params.limit.toString())
    if (params.search) searchParams.set('search', params.search)
    if (params.category) searchParams.set('category', params.category)
    if (params.level) searchParams.set('level', params.level)
    if (params.is_published !== undefined) searchParams.set('is_published', params.is_published.toString())
    
    const response = await authenticatedGet(`/api/admin/courses?${searchParams}`)
    return response.json()
  },

  /**
   * Create a new course with timeout and better error handling
   */
  async createCourse(courseData: any) {
    logger.debug('🚀 [COURSE_API] Creating new course:', { title: courseData.title })

    try {
      // Add timeout to prevent hanging
      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        logger.debug('⏰ [COURSE_API] Course creation timeout - aborting request')
        controller.abort()
      }, 30000) // 30 second timeout

      const payload = {
        action: 'create',
        courseData: {
          ...courseData,
          instructor_id: courseData.instructor_id // Ensure instructor_id is included
        }
      }

      logger.debug('📝 [COURSE_API] Sending course creation payload:', { payload })

      const response = await authenticatedPost('/api/admin/courses', payload, {
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      logger.debug('📡 [COURSE_API] Response status:', { status: response.status })

      if (!response.ok) {
        const errorText = await response.text()
        logger.error('❌ [COURSE_API] Course creation failed:', { errorText })
        throw new Error(`Course creation failed: ${errorText}`)
      }

      const result = await response.json()
      logger.debug('✅ [COURSE_API] Course created successfully:', { result })

      if (!result.success) {
        throw new Error(result.error || 'Course creation failed')
      }

      return result.data || result
    } catch (error: any) {
      logger.error('💥 [COURSE_API] Course creation error:', { error: error?.message || 'Unknown error' })

      if (error.name === 'AbortError') {
        throw new Error('Course creation timed out. Please try again.')
      }

      throw error
    }
  },

  /**
   * Update an existing course
   */
  async updateCourse(courseId: string, courseData: any) {
    logger.debug('🚀 courseAPI.updateCourse called with:', { courseId, courseData })

    try {
      // Ensure we don't send conflicting IDs
      const { id, ...cleanCourseData } = courseData
      if (id && id !== courseId) {
        logger.warn('⚠️ ID mismatch - Using courseId', { courseId, dataid: id })
      }

      const payload = { id: courseId, ...cleanCourseData }
      logger.debug('📝 Sending PUT request with payload:', { payload })

      const response = await authenticatedPut('/api/admin/courses', payload)

      logger.debug('📡 PUT response status:', { status: response.status })
      logger.debug('📡 PUT response ok:', { ok: response.ok })

      const result = await response.json()
      logger.debug('📋 PUT response data:', { result })

      if (!response.ok) {
        logger.error('❌ PUT request failed:', { result })
        throw new Error(result.error || 'Failed to update course')
      }

      logger.debug('✅ Course updated successfully via courseAPI')
      return result
    } catch (error: any) {
      logger.error('courseAPI.updateCourse error:', { error: error?.message || 'Unknown error' })
      throw error
    }
  },

  /**
   * Delete a course
   */
  async deleteCourse(courseId: string) {
    const response = await authenticatedDelete(`/api/admin/courses?id=${courseId}`)
    return response.json()
  },

  /**
   * Get a specific course by ID
   */
  async getCourse(courseId: string) {
    const response = await authenticatedGet(`/api/admin/courses/${courseId}`)
    return response.json()
  },

  /**
   * Toggle course publish status
   */
  async togglePublish(courseId: string, isPublished: boolean) {
    const response = await authenticatedPost('/api/admin/courses/toggle-publish', { 
      courseId, 
      isPublished 
    })
    return response.json()
  },

  /**
   * Save course modules and lessons
   */
  async saveModulesAndLessons(courseId: string, modules: any[]) {
    logger.debug('🎯 [DIRECT_LOG] courseAPI.saveModulesAndLessons called!!')
    logger.debug('🎯 [DIRECT_LOG] Course ID:', { courseId })
    logger.debug('🎯 [DIRECT_LOG] Modules:', { modules })

    try {
      logger.debug('🎯 [DIRECT_LOG] About to call authenticatedPost...')
      const response = await authenticatedPost('/api/admin/courses/modules', {
        courseId,
        modules
      })

      logger.debug('🎯 [DIRECT_LOG] authenticatedPost response status:', { status: response.status })
      logger.debug('🎯 [DIRECT_LOG] authenticatedPost response ok:', { ok: response.ok })

      const result = await response.json()
      logger.debug('🎯 [DIRECT_LOG] authenticatedPost result:', { result })

      return result
    } catch (error: any) {
      logger.error('🎯 [DIRECT_LOG] ERROR in courseAPI.saveModulesAndLessons:', { error: error?.message || 'Unknown error' })
      throw error
    }
  }
}
