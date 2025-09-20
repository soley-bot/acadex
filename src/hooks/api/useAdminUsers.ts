/**
 * Admin user and enrollment management hooks
 */
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib'
import type { UserRole } from '@/types'

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
interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface AdminUser {
  id: string
  name: string
  email: string
  role: UserRole
  created_at: string
  updated_at: string
  last_sign_in_at?: string
  is_active: boolean
}

interface AdminEnrollment {
  id: string
  user_id: string
  course_id: string
  enrolled_at: string
  status: 'active' | 'completed' | 'suspended'
  progress_percentage: number
  last_accessed?: string
  completed_at?: string
  courses: {
    title: string
    instructor_name: string
    price: number
    level: string
  }
  users: {
    name: string
    email: string
  }
}

interface EnrollmentStats {
  totalEnrollments: number
  activeEnrollments: number
  completedEnrollments: number
  totalRevenue: number
}

/**
 * Admin Users Management
 */
export function useAdminUsers(page: number = 1, limit: number = 10, search?: string, roleFilter?: string) {
  return useQuery({
    queryKey: ['admin', 'users', { page, limit, search, roleFilter }],
    queryFn: async (): Promise<{ data: AdminUser[], pagination: PaginationMeta }> => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(roleFilter && roleFilter !== 'all' && { role: roleFilter })
      })

      const response = await fetch(`/api/admin/users?${params}`, {
        headers: await getAuthHeaders()
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to fetch users')
      }

      return response.json()
    },
    staleTime: 2 * 60 * 1000, // 2 minutes (user data changes less frequently)
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  })
}

/**
 * Admin Enrollments Management
 */
export function useAdminEnrollments(page: number = 1, limit: number = 10, search?: string, statusFilter?: string) {
  return useQuery({
    queryKey: ['admin', 'enrollments', { page, limit, search, statusFilter }],
    queryFn: async (): Promise<{ data: AdminEnrollment[], pagination: PaginationMeta, stats: EnrollmentStats }> => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(statusFilter && statusFilter !== 'all' && { status: statusFilter })
      })

      const response = await fetch(`/api/admin/enrollments?${params}`, {
        headers: await getAuthHeaders()
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to fetch enrollments')
      }

      return response.json()
    },
    staleTime: 3 * 60 * 1000, // 3 minutes (enrollment data changes moderately)
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
  })
}