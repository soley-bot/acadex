/**
 * Admin course-related hooks using React Query for optimized caching
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { logger, getAuthHeaders } from '@/lib'
import type { AdminCoursesResponse, Course } from '@/types'

// Category type definition
interface Category {
  id: string
  name: string
  description?: string
  created_at?: string
}

/**
 * Fetch admin categories with optimized caching
 */
export function useAdminCategories() {
  return useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: async (): Promise<{ categories: Category[] }> => {
      const headers = await getAuthHeaders()
      
      const response = await fetch('/api/admin/categories', {
        method: 'GET',
        headers,
        credentials: 'include'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch categories')
      }

      const data = await response.json()
      // Ensure we always return a valid structure
      return {
        categories: data.categories || []
      }
    },
    staleTime: 30 * 60 * 1000, // 30 minutes (categories rarely change)
    gcTime: 2 * 60 * 60 * 1000, // 2 hours (very long retention for static data)
    refetchOnWindowFocus: false, // Categories don't need frequent updates
    refetchOnMount: false, // Use cached data if available
    refetchOnReconnect: false, // Categories are static, no need to refetch
  })
}

/**
 * Fetch admin courses with pagination, search, and category filtering
 */
export function useAdminCourses(page = 1, limit = 50, search = '', category = 'all') {
  return useQuery({
    queryKey: ['admin', 'courses', { page, limit, search, category }],
    queryFn: async (): Promise<AdminCoursesResponse> => {
      logger.debug('🔍 useAdminCourses: Starting fetch', { page, limit, search, category })
      
      try {
        const headers = await getAuthHeaders()
        logger.debug('🔐 useAdminCourses: Auth headers obtained')
        
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          search,
          category
        })

        const url = `/api/admin/courses?${params}`
        logger.debug('🌐 useAdminCourses: Fetching from', { url })

        const response = await fetch(url, {
          method: 'GET',
          headers,
          credentials: 'include'
        })

        logger.debug('📡 useAdminCourses: Response status', { status: response.status, ok: response.ok })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          logger.error('❌ useAdminCourses: Request failed', { status: response.status, errorData })
          throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch courses`)
        }

        const data = await response.json()
        logger.debug('✅ useAdminCourses: Success', { 
          coursesCount: data.data?.length, 
          pagination: data.pagination 
        })
        
        return {
          courses: data.data || [],
          pagination: data.pagination || { page, limit, total: 0, totalPages: 0 },
          success: data.success
        }
      } catch (error: any) {
        logger.error('💥 useAdminCourses: Error in queryFn', { error: error?.message || 'Unknown error' })
        throw error
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes (longer retention for admin workflow)
    refetchOnWindowFocus: true, // Keep course data fresh
    refetchOnMount: false, // Don't refetch if data is fresh
    refetchOnReconnect: true, // Refetch when connection restored
    retry: (failureCount, error) => {
      if (error.message.includes('Authentication') || error.message.includes('Unauthorized')) {
        return false
      }
      return failureCount < 2
    },
    enabled: true, // Always enabled for admin
    placeholderData: (previousData) => previousData || { 
      courses: [], 
      pagination: { page, limit, total: 0, totalPages: 0 },
      success: false
    }
  })
}

/**
 * Create category mutation with cache invalidation
 */
export function useCreateCategory() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (categoryData: Partial<Category>) => {
      const headers = await getAuthHeaders()
      
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(categoryData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create category')
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate categories cache
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] })
      logger.info('✅ Category created and cache invalidated')
    },
    onError: (error) => {
      logger.error('❌ Failed to create category', { error: error?.message || 'Unknown error' })
    }
  })
}