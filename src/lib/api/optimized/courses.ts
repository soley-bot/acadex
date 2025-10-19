/**
 * OPTIMIZED COURSE API
 * Production-ready, high-performance course queries
 * Uses database functions, proper joins, and efficient aggregations
 */

import { createSupabaseClient } from '../../supabase'
import type { Course } from '../../supabase'

export interface CourseWithStats extends Course {
  total_students?: number
  active_students?: number
  completed_students?: number
  average_progress?: number
  average_rating?: number
  total_reviews?: number
}

export interface CourseFilters {
  search?: string
  category?: string
  level?: string
  page?: number
  limit?: number
  useFullTextSearch?: boolean
}

export interface PaginationResult {
  page: number
  limit: number
  total: number
  totalPages: number
  hasMore: boolean
}

export interface CourseListResult {
  courses: CourseWithStats[]
  pagination: PaginationResult
}

/**
 * Get paginated list of courses
 * OPTIMIZED: Uses estimated counts and efficient queries
 */
export async function getCourses(
  filters: CourseFilters = {}
): Promise<CourseListResult> {
  const {
    search = '',
    category,
    level,
    page = 1,
    limit = 12,
    useFullTextSearch = true
  } = filters

  const supabase = createSupabaseClient()
  const from = (page - 1) * limit
  const to = from + limit - 1

  // Use estimated count for better performance
  const countMode = page === 1 ? 'exact' : 'estimated'

  let query = supabase
    .from('courses')
    .select(`
      id,
      title,
      description,
      instructor_id,
      instructor_name,
      category,
      level,
      price,
      duration,
      image_url,
      thumbnail_url,
      video_preview_url,
      tags,
      prerequisites,
      learning_objectives,
      status,
      rating,
      student_count,
      is_published,
      created_at,
      updated_at,
      original_price,
      discount_percentage,
      is_free
    `, { count: countMode })
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .range(from, to)

  // Apply filters
  if (category && category !== 'all') {
    query = query.eq('category', category)
  }

  if (level && level !== 'all') {
    query = query.eq('level', level)
  }

  // Search optimization
  if (search) {
    if (useFullTextSearch) {
      try {
        const { data: searchResults } = await supabase
          .rpc('search_courses', {
            search_query: search,
            category_filter: category || null,
            level_filter: level || null,
            published_only: true,
            result_limit: limit
          })

        if (searchResults) {
          return {
            courses: searchResults,
            pagination: {
              page,
              limit,
              total: searchResults.length,
              totalPages: Math.ceil(searchResults.length / limit),
              hasMore: searchResults.length === limit
            }
          }
        }
      } catch (error) {
        console.warn('Full-text search not available, falling back to ILIKE')
      }
    }

    // Fallback to ILIKE
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
  }

  const { data, error, count } = await query

  if (error) {
    throw new Error(`Failed to fetch courses: ${error.message}`)
  }

  return {
    courses: data || [],
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
      hasMore: (count || 0) > to + 1
    }
  }
}

/**
 * Get single course with full details
 */
export async function getCourse(courseId: string): Promise<Course | null> {
  const supabase = createSupabaseClient()

  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .eq('is_published', true)
    .single()

  if (error || !data) {
    console.error('Failed to fetch course:', error)
    return null
  }

  return data
}

/**
 * Get popular courses
 * OPTIMIZED: Uses student_count column maintained by triggers
 */
export async function getPopularCourses(limit: number = 6): Promise<Course[]> {
  const supabase = createSupabaseClient()

  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('is_published', true)
    .order('student_count', { ascending: false })
    .order('rating', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Failed to fetch popular courses:', error)
    return []
  }

  return data || []
}

/**
 * Get course statistics in batch
 */
export async function getCourseStatsBatch(courseIds: string[]): Promise<any[]> {
  if (courseIds.length === 0) return []

  const supabase = createSupabaseClient()

  try {
    const { data, error } = await supabase.rpc('get_course_stats', {
      course_ids: courseIds
    })

    if (error) throw error
    return data || []
  } catch (error) {
    console.warn('Database function not available')
    return []
  }
}

/**
 * Get user's enrolled courses
 */
export async function getUserCourses(
  userId: string,
  limit: number = 10
): Promise<any[]> {
  const supabase = createSupabaseClient()

  try {
    const { data } = await supabase.rpc('get_user_recent_courses', {
      user_uuid: userId,
      result_limit: limit
    })

    if (data) return data
  } catch (error) {
    console.warn('Database function not available, using fallback')
  }

  // Fallback
  const { data, error } = await supabase
    .from('enrollments')
    .select(`
      course_id,
      progress,
      last_accessed_at,
      enrolled_at,
      courses!inner (
        id,
        title,
        category,
        duration,
        level,
        image_url
      )
    `)
    .eq('user_id', userId)
    .order('last_accessed_at', { ascending: false, nullsFirst: false })
    .limit(limit)

  if (error) {
    console.error('Failed to fetch user courses:', error)
    return []
  }

  return data || []
}

/**
 * Create course enrollment
 */
export async function createEnrollment(enrollment: {
  user_id: string
  course_id: string
  progress?: number
}): Promise<any> {
  const supabase = createSupabaseClient()

  const { data, error } = await supabase
    .from('enrollments')
    .insert({
      ...enrollment,
      progress: enrollment.progress || 0,
      enrolled_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create enrollment: ${error.message}`)
  }

  return data
}

/**
 * Update enrollment progress
 */
export async function updateEnrollmentProgress(
  enrollmentId: string,
  progress: number
): Promise<any> {
  const supabase = createSupabaseClient()

  const { data, error } = await supabase
    .from('enrollments')
    .update({
      progress,
      last_accessed_at: new Date().toISOString()
    })
    .eq('id', enrollmentId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update progress: ${error.message}`)
  }

  return data
}

/**
 * Optimized course API export
 */
export const optimizedCourseAPI = {
  getCourses,
  getCourse,
  getPopularCourses,
  getCourseStatsBatch,
  getUserCourses,
  createEnrollment,
  updateEnrollmentProgress
}
