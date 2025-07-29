// Hook to load full course data including modules and lessons
import { useState, useEffect } from 'react'
import { Course } from '@/lib/supabase'

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
  const [course, setCourse] = useState<EnhancedCourse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (courseId) {
      loadCourse(courseId)
    }
  }, [courseId])

  const loadCourse = async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/admin/courses/enhanced?id=${id}`)
      const result = await response.json()
      
      if (result.success) {
        setCourse(result.data)
      } else {
        setError(result.error || 'Failed to load course')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load course')
    } finally {
      setLoading(false)
    }
  }

  return { course, loading, error, refetch: () => courseId && loadCourse(courseId) }
}
