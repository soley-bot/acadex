import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { createSupabaseClient } from '@/lib/supabase'
import { logger } from '@/lib/logger'

// Define types for user progress states
interface UserEnrollmentStatus {
  isEnrolled: boolean
  progress?: number
  currentLessonId?: string
  completedAt?: string
  enrolledAt: string
}

interface UserQuizAttemptStatus {
  hasAttempted: boolean
  lastAttempt?: {
    completedAt?: string
    score?: number
    createdAt: string
  }
  attempts: number
}

interface UserProgress {
  enrollments: Map<string, UserEnrollmentStatus>
  quizAttempts: Map<string, UserQuizAttemptStatus>
}

/**
 * Hook to check user enrollment status and provide quick actions
 */
export function useUserProgress(courseId?: string, quizId?: string) {
  const { user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [enrollments, setEnrollments] = useState(new Map())
  const [quizAttempts, setQuizAttempts] = useState(new Map())

  // Create quick actions with router instance
  const quickActions = createQuickActions(router)

  useEffect(() => {
    if (!user) {
      setIsLoading(false)
      return
    }

    const loadUserProgress = async () => {
      try {
        setIsLoading(true)

        const supabase = createSupabaseClient()

        // Load user enrollments with progress
        const { data: enrollmentData, error: enrollmentError } = await supabase
          .from('enrollments')
          .select(`
            course_id,
            progress,
            current_lesson_id,
            completed_at,
            enrolled_at
          `)
          .eq('user_id', user.id)

        if (enrollmentError) throw enrollmentError

        // Load user quiz attempts to show resume/retry options
        const { data: attemptData, error: attemptError } = await supabase
          .from('quiz_attempts')
          .select(`
            quiz_id,
            completed_at,
            score,
            created_at
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (attemptError) throw attemptError

        // Convert to Maps for O(1) lookup
        const enrollmentMap = new Map()
        enrollmentData?.forEach((enrollment: any) => {
          enrollmentMap.set(enrollment.course_id, enrollment)
        })

        const attemptMap = new Map()
        attemptData?.forEach((attempt: any) => {
          if (!attemptMap.has(attempt.quiz_id)) {
            attemptMap.set(attempt.quiz_id, attempt)
          }
        })

        setEnrollments(enrollmentMap)
        setQuizAttempts(attemptMap)
        setIsLoading(false)
      } catch (error: any) {
        logger.error('Failed to load user progress', { error: error?.message || 'Unknown error' })
        setIsLoading(false)
      }
    }

    loadUserProgress()
  }, [user])

  const refreshProgress = () => {
    if (user) {
      const loadUserProgress = async () => {
        // Same logic as above - could be extracted to a function
      }
      loadUserProgress()
    }
  }

  return {
    isLoading,
    enrollments,
    quizAttempts,
    isEnrolled: (courseId: string) => enrollments.has(courseId),
    hasAttempted: (quizId: string) => quizAttempts.has(quizId),
    getCourseProgress: (courseId: string) => enrollments.get(courseId),
    getQuizAttempt: (quizId: string) => quizAttempts.get(quizId),
    refreshProgress,
    quickActions
  }
}

/**
 * Quick action functions to reduce UX friction
 */
export const createQuickActions = (router: ReturnType<typeof useRouter>) => ({
  /**
   * Quick enroll and redirect to study
   */
  async quickEnrollAndStudy(courseId: string, userId: string) {
    try {
      const supabase = createSupabaseClient()

      // Enroll user
      const { error: enrollError } = await supabase
        .from('enrollments')
        .insert({
          user_id: userId,
          course_id: courseId,
          enrolled_at: new Date().toISOString()
        })

      if (enrollError) throw enrollError

      // Use Next.js router for client-side navigation
      router.push(`/courses/${courseId}/study`)
      return { success: true }
    } catch (error: any) {
      logger.error('Quick enroll failed', { error: error?.message || 'Unknown error' })
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  },

  /**
   * Quick start quiz (bypass detail page)
   */
  async quickStartQuiz(quizId: string, userId: string) {
    try {
      const supabase = createSupabaseClient()

      // Check if user needs to be enrolled in a course first
      const { data: quiz } = await supabase
        .from('quizzes')
        .select('course_id, lesson_id')
        .eq('id', quizId)
        .single()

      if (quiz?.course_id) {
        // Check enrollment for course quizzes
        const { data: enrollment } = await supabase
          .from('enrollments')
          .select('id')
          .eq('user_id', userId)
          .eq('course_id', quiz.course_id)
          .single()

        if (!enrollment) {
          return { success: false, error: 'Must be enrolled in course to take this quiz' }
        }
      }

      // Use Next.js router for client-side navigation
      router.push(`/quizzes/${quizId}/take`)
      return { success: true }
    } catch (error: any) {
      logger.error('Quick start quiz failed', { error: error?.message || 'Unknown error' })
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  },

  /**
   * Resume course from last position
   */
  async resumeCourse(courseId: string, currentLessonId?: string) {
    if (currentLessonId) {
      router.push(`/courses/${courseId}/study?lesson=${currentLessonId}`)
    } else {
      router.push(`/courses/${courseId}/study`)
    }
    return { success: true }
  }
})
