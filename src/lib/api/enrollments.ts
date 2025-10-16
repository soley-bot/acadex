import { createSupabaseClient } from '../supabase'

// Create module-level Supabase client for API functions
const supabase = createSupabaseClient()

export const enrollmentAPI = {
  // Enroll in course
  async enrollInCourse(userId: string, courseId: string) {
    const { data, error } = await supabase
      .from('enrollments')
      .insert({
        user_id: userId,
        course_id: courseId,
        progress: 0
      })
      .select()
      .single()

    // Update course student count
    if (!error) {
      // supabase.rpc('increment_student_count', { course_id: courseId })
    }

    return { data, error }
  },

  // Get user enrollments
  async getUserEnrollments(userId: string) {
    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        *,
        courses (
          title,
          description,
          instructor_name,
          category,
          level,
          image_url,
          duration
        )
      `)
      .eq('user_id', userId)
      .order('enrolled_at', { ascending: false })

    return { data, error }
  },

  // Update enrollment progress
  async updateProgress(enrollmentId: string, progress: number) {
    const updates: any = { progress }
    if (progress >= 100) {
      updates.completed_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('enrollments')
      .update(updates)
      .eq('id', enrollmentId)
      .select()
      .single()

    return { data, error }
  },

  // Check if user is enrolled
  async isEnrolled(userId: string, courseId: string) {
    const { data, error } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single()

    return { enrolled: !!data, error }
  }
}