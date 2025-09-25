// Hook to load full course data including modules and lessons
import { useState, useEffect, useCallback } from 'react'
import { Course } from '@/lib/supabase'
import { useAsyncState } from './useAsyncState'

interface EnhancedCourse extends Course {
  course_modules?: Array<{
    id: string
    title: string
    description: string
    order_index: number
    course_lessons: Array<{
      id: string
      title: string
      content: string
      video_url?: string
      duration?: string
      order_index: number
      is_preview: boolean
    }>
  }>
}

export function useEnhancedCourse(courseId?: string) {
  // 🔄 CONSOLIDATED: Replaced duplicate loading/error state with unified hook
  const { data: course, loading, error, execute } = useAsyncState<EnhancedCourse>()

  const loadCourse = useCallback(async (id: string) => {
    // 🔄 CONSOLIDATED: Using unified async execution
    await execute(async () => {
      const response = await fetch(`/api/admin/courses/enhanced?id=${id}`)
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to load course')
      }
      
      return result.data
    })
  }, [execute])

  useEffect(() => {
    if (courseId) {
      loadCourse(courseId)
    }
  }, [courseId, loadCourse])

  return { course, loading, error, refetch: () => courseId && loadCourse(courseId) }
}
