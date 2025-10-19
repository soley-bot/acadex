/**
 * OPTIMIZED DASHBOARD API
 * Single-call dashboard data retrieval using database functions
 * Replaces multiple sequential queries with one efficient call
 */

import { createSupabaseClient } from '../../supabase'

export interface DashboardStats {
  total_courses: number
  completed_courses: number
  in_progress_courses: number
  total_quizzes: number
  passed_quizzes: number
  average_quiz_score: number
  total_study_hours: number
  current_streak_days: number
  total_badges: number
  total_points: number
}

export interface RecentCourse {
  course_id: string
  course_title: string
  course_category: string
  course_duration: string
  course_level: string
  progress: number
  last_accessed_at: string
  enrolled_at: string
}

export interface RecentQuiz {
  attempt_id: string
  quiz_id: string
  quiz_title: string
  score: number
  total_questions: number
  percentage_score: number
  passed: boolean
  completed_at: string
}

export interface DashboardData {
  stats: DashboardStats
  recentCourses: RecentCourse[]
  recentQuizzes: RecentQuiz[]
}

/**
 * Get complete dashboard data in optimized way
 * OPTIMIZED: Uses database functions for single-query retrieval
 */
export async function getUserDashboard(userId: string): Promise<DashboardData> {
  const supabase = createSupabaseClient()

  try {
    // Try using optimized database functions
    const [statsResult, coursesResult, quizzesResult] = await Promise.allSettled([
      supabase.rpc('get_user_dashboard_stats', { user_uuid: userId }).single(),
      supabase.rpc('get_user_recent_courses', { user_uuid: userId, result_limit: 5 }),
      supabase.rpc('get_user_recent_quizzes', { user_uuid: userId, result_limit: 5 })
    ])

    // Check if all database functions succeeded
    if (
      statsResult.status === 'fulfilled' && statsResult.value.data &&
      coursesResult.status === 'fulfilled' && coursesResult.value.data &&
      quizzesResult.status === 'fulfilled' && quizzesResult.value.data
    ) {
      return {
        stats: normalizeStats(statsResult.value.data),
        recentCourses: coursesResult.value.data || [],
        recentQuizzes: quizzesResult.value.data || []
      }
    }

    // If any function failed, fall back to manual queries
    console.warn('Database functions not available, using fallback queries')
    return await getDashboardFallback(userId)

  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    // Fall back to manual queries
    return await getDashboardFallback(userId)
  }
}

/**
 * Normalize stats from database function
 */
function normalizeStats(dbStats: any): DashboardStats {
  return {
    total_courses: Number(dbStats.total_courses || 0),
    completed_courses: Number(dbStats.completed_courses || 0),
    in_progress_courses: Number(dbStats.in_progress_courses || 0),
    total_quizzes: Number(dbStats.total_quizzes || 0),
    passed_quizzes: Number(dbStats.passed_quizzes || 0),
    average_quiz_score: Number(dbStats.average_quiz_score || 0),
    total_study_hours: Number(dbStats.total_study_hours || 0),
    current_streak_days: Number(dbStats.current_streak_days || 0),
    total_badges: Number(dbStats.total_badges || 0),
    total_points: Number(dbStats.total_points || 0)
  }
}

/**
 * Fallback dashboard retrieval using direct queries
 * Used when database functions are not available
 */
async function getDashboardFallback(userId: string): Promise<DashboardData> {
  const supabase = createSupabaseClient()

  // Execute all queries in parallel
  const [coursesResult, quizzesResult, statsResult] = await Promise.allSettled([
    // Fetch user courses
    supabase
      .from('enrollments')
      .select(`
        course_id,
        progress,
        last_accessed_at,
        enrolled_at,
        total_watch_time_minutes,
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
      .limit(5),

    // Fetch quiz attempts
    supabase
      .from('quiz_attempts')
      .select(`
        id,
        quiz_id,
        score,
        total_questions,
        percentage_score,
        passed,
        completed_at,
        quizzes!inner (
          id,
          title
        )
      `)
      .eq('user_id', userId)
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(5),

    // Fetch user stats
    supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single()
  ])

  // Process results
  const courses = coursesResult.status === 'fulfilled' ? coursesResult.value.data || [] : []
  const quizzes = quizzesResult.status === 'fulfilled' ? quizzesResult.value.data || [] : []
  const userStats = statsResult.status === 'fulfilled' ? statsResult.value.data : null

  // Calculate stats from raw data
  const completedCourses = courses.filter((c: any) => c.progress >= 100).length
  const inProgressCourses = courses.filter((c: any) => c.progress > 0 && c.progress < 100).length
  const passedQuizzes = quizzes.filter((q: any) => q.passed).length
  const averageScore = quizzes.length > 0
    ? Math.round(quizzes.reduce((sum: number, q: any) => sum + (q.percentage_score || 0), 0) / quizzes.length)
    : 0
  const studyHours = courses.reduce((sum: number, c: any) =>
    sum + (c.total_watch_time_minutes || 0), 0) / 60

  const stats: DashboardStats = {
    total_courses: courses.length,
    completed_courses: completedCourses,
    in_progress_courses: inProgressCourses,
    total_quizzes: quizzes.length,
    passed_quizzes: passedQuizzes,
    average_quiz_score: averageScore,
    total_study_hours: Math.round(studyHours * 10) / 10,
    current_streak_days: userStats?.study_streak_days || 0,
    total_badges: userStats?.badges_earned || 0,
    total_points: userStats?.total_points || 0
  }

  const recentCourses: RecentCourse[] = courses.map((enrollment: any) => ({
    course_id: enrollment.courses.id,
    course_title: enrollment.courses.title,
    course_category: enrollment.courses.category || 'General',
    course_duration: enrollment.courses.duration || '4 weeks',
    course_level: enrollment.courses.level || 'beginner',
    progress: Math.round(enrollment.progress || 0),
    last_accessed_at: enrollment.last_accessed_at
      ? new Date(enrollment.last_accessed_at).toISOString()
      : new Date(enrollment.enrolled_at).toISOString(),
    enrolled_at: new Date(enrollment.enrolled_at).toISOString()
  }))

  const recentQuizzes: RecentQuiz[] = quizzes.map((attempt: any) => ({
    attempt_id: attempt.id,
    quiz_id: attempt.quiz_id,
    quiz_title: attempt.quizzes?.title || 'Unknown Quiz',
    score: attempt.score || 0,
    total_questions: attempt.total_questions || 0,
    percentage_score: attempt.percentage_score || 0,
    passed: attempt.passed || false,
    completed_at: new Date(attempt.completed_at).toISOString()
  }))

  return {
    stats,
    recentCourses,
    recentQuizzes
  }
}

/**
 * Get global leaderboard
 */
export async function getGlobalLeaderboard(limit: number = 10): Promise<any[]> {
  const supabase = createSupabaseClient()

  try {
    const { data, error } = await supabase.rpc('get_global_leaderboard', {
      result_limit: limit
    })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error)
    return []
  }
}

/**
 * Get category statistics
 */
export async function getCategoryStats(): Promise<any[]> {
  const supabase = createSupabaseClient()

  try {
    const { data, error } = await supabase.rpc('get_category_stats')

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Failed to fetch category stats:', error)
    return []
  }
}

/**
 * Optimized dashboard API export
 */
export const optimizedDashboardAPI = {
  getUserDashboard,
  getGlobalLeaderboard,
  getCategoryStats
}
