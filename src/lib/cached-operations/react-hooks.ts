/**
 * Cached Operations - React Hooks Module
 * 
 * React hooks for cached operations with advanced cache management.
 * Extracted from cachedOperations.ts for better organization and maintainability.
 */

import { logger } from '@/lib/logger'
import { Course } from '../supabase'
import { courseCache, quizCache, userCache, useCachedQuery, useCacheMutation } from '../cache'
import { cachedCourseAPI } from './course-operations'
import { cachedQuizAPI } from './quiz-operations'
import { cachedUserAPI } from './user-operations'

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