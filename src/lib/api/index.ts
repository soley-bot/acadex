// Re-export all API modules for backward compatibility and easy access
export { userAPI } from './users'
export { courseAPI } from './courses'
export { quizAPI } from './quizzes'
export { enrollmentAPI } from './enrollments'
export { authAPI } from './auth'

// Legacy exports for backward compatibility
import { courseAPI } from './courses'
import { quizAPI } from './quizzes'
import { supabase } from '../supabase'
import { logger } from '../logger'

export async function getCourses(filters?: { category?: string; level?: string; search?: string }) {
  return courseAPI.getCourses(filters)
}

export async function getQuizzes(filters?: { category?: string; difficulty?: string }) {
  let query = supabase
    .from('quizzes')
    .select(`
      *,
      question_count:quiz_questions(count)
    `)
    .eq('is_published', true)

  if (filters?.category) {
    query = query.eq('category', filters.category)
  }

  if (filters?.difficulty) {
    query = query.eq('difficulty', filters.difficulty)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    logger.error('Error fetching quizzes:', error)
    return []
  }

  // Transform the data to include question_count as a number
  return data?.map((quiz: any) => ({
    ...quiz,
    question_count: quiz.question_count?.[0]?.count || 0
  })) || []
}

export async function getRandomQuizQuestions(limit: number = 3) {
  // Get a few random questions from different categories for preview
  const { data, error } = await supabase
    .from('quiz_questions')
    .select(`
      *,
      quiz:quizzes(title, category, difficulty)
    `)
    .limit(limit)

  if (error) {
    logger.error('Error fetching random quiz questions:', error)
    return []
  }

  return data || []
}

// Additional functions for new pages
export const getCourseById = async (courseId: string) => {
  const { data, error } = await supabase
    .from('courses')
    .select(`
      *,
      users!courses_instructor_id_fkey(name)
    `)
    .eq('id', courseId)
    .eq('is_published', true)
    .single()

  if (data) {
    data.instructor_name = data.users?.name || 'Unknown Instructor'
  }

  return { data, error }
}