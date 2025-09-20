import { supabase } from '../supabase'
import type { Course } from '../supabase'

export const courseAPI = {
  // Get paginated published courses
  async getCourses(filters?: { 
    category?: string; 
    level?: string; 
    search?: string;
    page?: number;
    limit?: number
  }) {
    const page = filters?.page || 1
    const limit = filters?.limit || 12
    const from = (page - 1) * limit
    const to = from + limit - 1

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
        rating,
        student_count,
        is_published,
        created_at,
        updated_at
      `, { count: 'exact' })
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (filters?.category) {
      query = query.eq('category', filters.category)
    }

    if (filters?.level) {
      query = query.eq('level', filters.level)
    }

    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    const { data, error, count } = await query
    
    return { 
      data, 
      error, 
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
        hasMore: (count || 0) > to + 1
      }
    }
  },

  // Get single course
  async getCourse(id: string) {
    const { data, error } = await supabase
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
        published_at,
        original_price,
        discount_percentage,
        is_free,
        rating,
        student_count,
        is_published,
        created_at,
        updated_at
      `)
      .eq('id', id)
      .eq('is_published', true)
      .single()

    return { data, error }
  },

  // Create new course (instructors only)
  async createCourse(course: Omit<Course, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('courses')
      .insert(course)
      .select()
      .single()

    return { data, error }
  },

  // Update course
  async updateCourse(id: string, updates: Partial<Course>) {
    const { data, error } = await supabase
      .from('courses')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    return { data, error }
  },

  // Get popular courses
  async getPopularCourses(limit = 6) {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        enrollments(count)
      `)
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(limit)

    // Calculate student count from enrollments if not set
    const coursesWithCounts = data?.map((course: any) => ({
      ...course,
      student_count: course.student_count || course.enrollments?.length || 0,
      rating: course.rating || 4.5 // Default rating if not set
    }))

    return { data: coursesWithCounts, error }
  }
}