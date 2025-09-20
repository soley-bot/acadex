/**
 * Public-facing API hooks for students and general users
 */
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib'
import type { Course } from '@/types'

// Auth helper
async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    throw new Error('Authentication required')
  }
  
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`
  }
}

// Type definitions
interface CourseFilters {
  page?: number
  limit?: number
  category?: string
  level?: string
  search?: string
}

interface PublicCoursesResponse {
  data: Course[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasMore: boolean
  }
}

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  type: string
  points: number
  explanation?: string
}

interface QuizResponse {
  id: string
  title: string
  description: string
  questions: QuizQuestion[]
  timeLimit: number | null
  passingScore: number
}

/**
 * Fetch public courses with filtering and pagination
 */
export function usePublicCourses(filters: CourseFilters = {}) {
  const { page = 1, limit = 9, category, level, search } = filters
  
  return useQuery({
    queryKey: ['public', 'courses', { page, limit, category, level, search }],
    queryFn: async (): Promise<PublicCoursesResponse> => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(category && { category }),
        ...(level && { level }),
        ...(search && { search })
      })
      
      const response = await fetch(`/api/courses?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch courses')
      }

      return response.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes (courses don't change frequently)
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false, // Don't refetch when switching tabs
    refetchOnMount: false, // Use cached data if available
  })
}

/**
 * Fetch course categories for public use
 */
export function usePublicCategories() {
  return useQuery({
    queryKey: ['public', 'categories'],
    queryFn: async (): Promise<string[]> => {
      const response = await fetch('/api/courses/categories')
      
      if (!response.ok) {
        throw new Error('Failed to fetch categories')
      }

      const data = await response.json()
      return data.categories || []
    },
    staleTime: 30 * 60 * 1000, // 30 minutes (categories rarely change)
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })
}

/**
 * Quiz taking hook for students
 */
export function useQuizForTaking(quizId: string | null) {
  return useQuery({
    queryKey: ['quiz', 'taking', quizId],
    queryFn: async (): Promise<QuizResponse> => {
      if (!quizId) throw new Error('Quiz ID required')
      
      const response = await fetch(`/api/quizzes/${quizId}/take`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch quiz')
      }

      return response.json()
    },
    enabled: !!quizId,
    staleTime: 10 * 60 * 1000, // 10 minutes (quiz content shouldn't change during session)
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false, // Don't refetch during quiz taking
    refetchOnMount: false,
  })
}