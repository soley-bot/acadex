/**
 * Auth API Helper
 * Adds authentication headers to API requests
 */

import { supabase } from './supabase'
import { ErrorHandler } from './errorHandler'

/**
 * Get the current access token - optimized to check localStorage first (fast path)
 */
export async function getAccessToken(): Promise<string | null> {
  console.log('🔑 [GET_ACCESS_TOKEN] Starting...')

  // FAST PATH: Check localStorage first (avoids slow getSession call)
  try {
    if (typeof window !== 'undefined') {
      const authData = localStorage.getItem('acadex-auth-token')
      if (authData) {
        const parsed = JSON.parse(authData)
        const token = parsed?.access_token
        const expiresAt = parsed?.expires_at

        // Verify token exists and hasn't expired
        if (token && expiresAt) {
          const expiryDate = new Date(expiresAt * 1000)
          const now = new Date()

          if (expiryDate > now) {
            console.log('✅ [GET_ACCESS_TOKEN] Using valid token from localStorage (fast)')
            return token
          } else {
            console.log('⚠️ [GET_ACCESS_TOKEN] Token expired, will refresh via session')
          }
        }
      }
    }
  } catch (storageError) {
    console.warn('⚠️ [GET_ACCESS_TOKEN] localStorage check failed:', storageError)
  }

  // SLOW PATH: Fallback to getSession with timeout (only if localStorage failed)
  try {
    console.log('🔄 [GET_ACCESS_TOKEN] Fetching from Supabase session...')

    const timeoutPromise = new Promise<any>((_, reject) => {
      setTimeout(() => reject(new Error('Session fetch timed out')), 5000)
    })

    const sessionPromise = supabase.auth.getSession()
    const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise])

    if (session?.access_token) {
      console.log('✅ [GET_ACCESS_TOKEN] Got token from session')
      return session.access_token
    }

    return null
  } catch (error) {
    console.error('❌ [GET_ACCESS_TOKEN] Session fetch failed:', error)
    ErrorHandler.handleError(error, 'auth-api.getAccessToken')
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
  console.log('🌐 [AUTH_FETCH] Starting fetch to:', url)
  console.log('🌐 [AUTH_FETCH] Options:', options)

  const authHeaders = await createAuthHeaders()
  console.log('🌐 [AUTH_FETCH] Auth headers created')

  const fetchOptions = {
    ...options,
    headers: {
      ...authHeaders,
      ...options.headers
    },
    credentials: 'include' as RequestCredentials // Include cookies as fallback
  }

  console.log('🌐 [AUTH_FETCH] About to call fetch with options:', fetchOptions)

  const response = await fetch(url, fetchOptions)

  console.log('🌐 [AUTH_FETCH] Fetch completed with status:', response.status)

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
    console.log('🚀 [QUIZ_API] Creating new quiz:', quizData.title)

    try {
      // Add timeout to prevent hanging
      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        console.log('⏰ [QUIZ_API] Quiz creation timeout - aborting request')
        controller.abort()
      }, 30000) // 30 second timeout

      console.log('📝 [QUIZ_API] Sending quiz creation payload:', quizData)

      const response = await authenticatedPost('/api/admin/quizzes', quizData, {
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      console.log('📡 [QUIZ_API] Response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ [QUIZ_API] Quiz creation failed:', errorText)
        throw new Error(`Quiz creation failed: ${errorText}`)
      }

      const result = await response.json()
      console.log('✅ [QUIZ_API] Quiz created successfully:', result)

      if (!result.quiz) {
        throw new Error(result.error || 'Quiz creation failed')
      }

      return result
    } catch (error: any) {
      console.error('💥 [QUIZ_API] Quiz creation error:', error)

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
    console.log('🚀 [QUIZ_API] Updating quiz:', quizData.id)

    try {
      // Add timeout to prevent hanging
      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        console.log('⏰ [QUIZ_API] Quiz update timeout - aborting request')
        controller.abort()
      }, 30000) // 30 second timeout

      console.log('📝 [QUIZ_API] Sending quiz update payload:', quizData)

      const response = await authenticatedPut('/api/admin/quizzes', quizData)

      clearTimeout(timeoutId)

      console.log('📡 [QUIZ_API] Response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ [QUIZ_API] Quiz update failed:', errorText)
        throw new Error(`Quiz update failed: ${errorText}`)
      }

      const result = await response.json()
      console.log('✅ [QUIZ_API] Quiz updated successfully:', result)

      if (!result.quiz) {
        throw new Error(result.error || 'Quiz update failed')
      }

      return result
    } catch (error: any) {
      console.error('💥 [QUIZ_API] Quiz update error:', error)

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
    console.log('🚀 [COURSE_API] Creating new course:', courseData.title)
    
    try {
      // Add timeout to prevent hanging
      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        console.log('⏰ [COURSE_API] Course creation timeout - aborting request')
        controller.abort()
      }, 30000) // 30 second timeout
      
      const payload = {
        action: 'create',
        courseData: {
          ...courseData,
          instructor_id: courseData.instructor_id // Ensure instructor_id is included
        }
      }
      
      console.log('📝 [COURSE_API] Sending course creation payload:', payload)
      
      const response = await authenticatedPost('/api/admin/courses', payload, {
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      console.log('📡 [COURSE_API] Response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ [COURSE_API] Course creation failed:', errorText)
        throw new Error(`Course creation failed: ${errorText}`)
      }
      
      const result = await response.json()
      console.log('✅ [COURSE_API] Course created successfully:', result)
      
      if (!result.success) {
        throw new Error(result.error || 'Course creation failed')
      }
      
      return result.data || result
    } catch (error: any) {
      console.error('💥 [COURSE_API] Course creation error:', error)
      
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
    console.log('🚀 courseAPI.updateCourse called with:', { courseId, courseData })
    
    try {
      // Ensure we don't send conflicting IDs
      const { id, ...cleanCourseData } = courseData
      if (id && id !== courseId) {
        console.warn('⚠️ ID mismatch - courseId:', courseId, 'courseData.id:', id, 'Using courseId')
      }
      
      const payload = { id: courseId, ...cleanCourseData }
      console.log('📝 Sending PUT request with payload:', payload)
      
      const response = await authenticatedPut('/api/admin/courses', payload)
      
      console.log('📡 PUT response status:', response.status)
      console.log('📡 PUT response ok:', response.ok)
      
      const result = await response.json()
      console.log('📋 PUT response data:', result)
      
      if (!response.ok) {
        console.error('❌ PUT request failed:', result)
        throw new Error(result.error || 'Failed to update course')
      }
      
      console.log('✅ Course updated successfully via courseAPI')
      return result
    } catch (error) {
      ErrorHandler.handleError(error, 'courseAPI.updateCourse')
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
    console.log('🎯 [DIRECT_LOG] courseAPI.saveModulesAndLessons called!!')
    console.log('🎯 [DIRECT_LOG] Course ID:', courseId)
    console.log('🎯 [DIRECT_LOG] Modules:', modules)
    
    try {
      console.log('🎯 [DIRECT_LOG] About to call authenticatedPost...')
      const response = await authenticatedPost('/api/admin/courses/modules', {
        courseId,
        modules
      })
      
      console.log('🎯 [DIRECT_LOG] authenticatedPost response status:', response.status)
      console.log('🎯 [DIRECT_LOG] authenticatedPost response ok:', response.ok)
      
      const result = await response.json()
      console.log('🎯 [DIRECT_LOG] authenticatedPost result:', result)
      
      return result
    } catch (error) {
      console.error('🎯 [DIRECT_LOG] ERROR in courseAPI.saveModulesAndLessons:', error)
      throw error
    }
  }
}
