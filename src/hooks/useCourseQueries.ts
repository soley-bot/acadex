/**
 * Optimized course queries using direct Supabase calls
 * Similar to quiz queries for better performance
 */

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Course } from '@/lib/supabase'

// Query keys for consistency
export const COURSE_QUERY_KEYS = {
  all: ['courses'] as const,
  lists: () => [...COURSE_QUERY_KEYS.all, 'list'] as const,
  list: (filters: string) => [...COURSE_QUERY_KEYS.lists(), filters] as const,
  details: () => [...COURSE_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...COURSE_QUERY_KEYS.details(), id] as const,
  categories: () => [...COURSE_QUERY_KEYS.all, 'categories'] as const,
}

interface CourseFilters {
  page?: number
  limit?: number
  category?: string
  level?: string
  search?: string
}

interface CoursesResponse {
  data: Course[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasMore: boolean
  }
}

/**
 * Fetch courses using direct Supabase queries (faster than API route)
 */
export function useOptimizedCourses(filters: CourseFilters = {}) {
  const { page = 1, limit = 9, category, level, search } = filters
  
  return useQuery({
    queryKey: COURSE_QUERY_KEYS.list(JSON.stringify(filters)),
    queryFn: async (): Promise<CoursesResponse> => {
      try {
        // Check if Supabase client is available
        if (!supabase || typeof supabase.from !== 'function') {
          throw new Error('Supabase client is not properly initialized. Please check your environment variables.')
        }

        let query = supabase
          .from('courses')
          .select(`
            id,
            title,
            description,
            image_url,
            category,
            level,
            duration,
            price,
            status,
            instructor_name,
            rating,
            student_count,
            is_published,
            is_free,
            original_price,
            created_at,
            updated_at
          `, { count: 'exact' })
          .eq('is_published', true)

      // Apply filters
      if (category && category !== 'all') {
        query = query.eq('category', category)
      }

      if (level && level !== 'all') {
        query = query.eq('level', level)
      }

      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
      }

      // Apply pagination
      const from = (page - 1) * limit
      const to = from + limit - 1
      query = query.range(from, to)

      // Order by created_at desc for consistent ordering
      query = query.order('created_at', { ascending: false })

        const { data, error, count } = await query

        if (error) {
          console.error('Supabase query error:', error)
          throw new Error(`Failed to fetch courses: ${error.message}`)
        }

        const total = count || 0
        const totalPages = Math.ceil(total / limit)

        return {
          data: data || [],
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasMore: page < totalPages
          }
        }
      } catch (error) {
        console.error('Error in useOptimizedCourses:', error)
        // Re-throw with more context
        if (error instanceof Error) {
          throw error
        }
        throw new Error('An unexpected error occurred while fetching courses')
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })
}

/**
 * Fetch course categories directly from Supabase
 */
export function useOptimizedCategories() {
  return useQuery({
    queryKey: COURSE_QUERY_KEYS.categories(),
    queryFn: async (): Promise<string[]> => {
      try {
        // Check if Supabase client is available
        if (!supabase || typeof supabase.from !== 'function') {
          console.error('Supabase client not initialized in useOptimizedCategories')
          return [] // Return empty array instead of throwing
        }

        const { data, error } = await supabase
          .from('courses')
          .select('category')
          .eq('is_published', true)
          .not('category', 'is', null)

        if (error) {
          console.error('Error fetching categories:', error)
          throw new Error(`Failed to fetch categories: ${error.message}`)
        }

        // Extract unique categories
        const categories = [...new Set(
          data?.map((course: any) => course.category).filter(Boolean) || []
        )] as string[]

        return categories.sort()
      } catch (error) {
        console.error('Error in useOptimizedCategories:', error)
        // Don't fail the entire page if categories fail, just return empty
        return []
      }
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })
}

/**
 * Fetch single course by ID
 */
export function useOptimizedCourse(id: string) {
  return useQuery({
    queryKey: COURSE_QUERY_KEYS.detail(id),
    queryFn: async (): Promise<Course | null> => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .eq('is_published', true)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null // Course not found
        }
        throw new Error(error.message)
      }

      return data
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
  })
}

/**
 * Prefetch courses for better performance
 */
export function usePrefetchCourses() {
  const queryClient = useQueryClient()

  return {
    prefetchNextPage: async (currentPage: number, filters: CourseFilters) => {
      const nextPage = currentPage + 1
      const nextFilters = { ...filters, page: nextPage }
      
      await queryClient.prefetchQuery({
        queryKey: COURSE_QUERY_KEYS.list(JSON.stringify(nextFilters)),
        queryFn: async () => {
          // Recreate the query logic for prefetch
          let query = supabase
            .from('courses')
            .select(`
              id,
              title,
              description,
              image_url,
              category,
              level,
              duration,
              price,
              status,
              instructor_name,
              rating,
              student_count,
              is_published,
              is_free,
              original_price,
              created_at,
              updated_at
            `, { count: 'exact' })
            .eq('is_published', true)

          // Apply same filters
          if (nextFilters.category && nextFilters.category !== 'all') {
            query = query.eq('category', nextFilters.category)
          }

          if (nextFilters.level && nextFilters.level !== 'all') {
            query = query.eq('level', nextFilters.level)
          }

          if (nextFilters.search) {
            query = query.or(`title.ilike.%${nextFilters.search}%,description.ilike.%${nextFilters.search}%`)
          }

          const limit = nextFilters.limit || 9
          const from = (nextPage - 1) * limit
          const to = from + limit - 1
          query = query.range(from, to).order('created_at', { ascending: false })

          const { data, error, count } = await query
          if (error) throw new Error(error.message)

          const total = count || 0
          return {
            data: data || [],
            pagination: {
              page: nextPage,
              limit,
              total,
              totalPages: Math.ceil(total / limit),
              hasMore: nextPage < Math.ceil(total / limit)
            }
          }
        },
        staleTime: 5 * 60 * 1000,
      })
    },
    
    prefetchCourse: async (courseId: string) => {
      await queryClient.prefetchQuery({
        queryKey: COURSE_QUERY_KEYS.detail(courseId),
        queryFn: async () => {
          const { data, error } = await supabase
            .from('courses')
            .select('*')
            .eq('id', courseId)
            .eq('is_published', true)
            .single()

          if (error) {
            if (error.code === 'PGRST116') return null
            throw new Error(error.message)
          }
          return data
        },
        staleTime: 10 * 60 * 1000,
      })
    }
  }
}