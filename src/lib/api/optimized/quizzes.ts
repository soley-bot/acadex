/**
 * OPTIMIZED QUIZ API
 * Production-ready, high-performance quiz queries
 * Uses database functions, proper joins, and efficient aggregations
 */

import { createSupabaseClient } from '../../supabase'
import type { Quiz, QuizQuestion } from '../../supabase'

export interface QuizWithStats extends Quiz {
  question_count: number
  attempts_count: number
  average_score: number
  pass_rate?: number
  completion_rate?: number
}

export interface QuizWithQuestions extends QuizWithStats {
  questions: QuizQuestion[]
}

export interface QuizFilters {
  search?: string
  category?: string
  difficulty?: string
  published?: boolean
  page?: number
  limit?: number
  useFullTextSearch?: boolean  // Use full-text search if available
}

export interface PaginationResult {
  page: number
  limit: number
  total: number
  totalPages: number
  hasMore: boolean
}

export interface QuizListResult {
  quizzes: QuizWithStats[]
  pagination: PaginationResult
}

/**
 * Get paginated list of quizzes with statistics
 * OPTIMIZED: Uses database aggregation functions instead of loading all attempts
 */
export async function getQuizzesWithStats(
  filters: QuizFilters = {}
): Promise<QuizListResult> {
  const {
    search = '',
    category,
    difficulty,
    published,
    page = 1,
    limit = 12,
    useFullTextSearch = true
  } = filters

  const supabase = createSupabaseClient()
  const from = (page - 1) * limit
  const to = from + limit - 1

  // Use estimated count for better performance on large tables
  const countMode = page === 1 ? 'exact' : 'estimated'

  let query = supabase
    .from('quizzes')
    .select(`
      id,
      title,
      description,
      category,
      difficulty,
      duration_minutes,
      total_questions,
      passing_score,
      max_attempts,
      time_limit_minutes,
      is_published,
      created_at,
      updated_at,
      image_url,
      course_id,
      lesson_id
    `, { count: countMode })
    .order('created_at', { ascending: false })
    .range(from, to)

  // Apply filters
  if (category && category !== 'all') {
    query = query.eq('category', category)
  }

  if (difficulty && difficulty !== 'all') {
    query = query.eq('difficulty', difficulty)
  }

  if (published !== undefined) {
    query = query.eq('is_published', published)
  }

  // Search optimization: Use full-text search if available, fallback to ILIKE
  if (search) {
    if (useFullTextSearch) {
      // Try full-text search first
      try {
        const { data: searchResults } = await supabase
          .rpc('search_quizzes', {
            search_query: search,
            category_filter: category || null,
            difficulty_filter: difficulty || null,
            published_only: published ?? true,
            result_limit: limit
          })

        if (searchResults) {
          // Get quiz stats for search results
          const quizIds = searchResults.map((q: any) => q.id)
          const stats = await getQuizStatsBatch(quizIds)

          const quizzesWithStats = searchResults.map((quiz: any) => {
            const stat = stats.find(s => s.quiz_id === quiz.id)
            return {
              ...quiz,
              question_count: stat?.question_count || quiz.total_questions || 0,
              attempts_count: stat?.attempts_count || 0,
              average_score: stat?.average_score || 0,
              pass_rate: stat?.pass_rate || 0,
              completion_rate: stat?.completion_rate || 100
            }
          })

          return {
            quizzes: quizzesWithStats,
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
        console.warn('Full-text search not available, falling back to ILIKE', error)
      }
    }

    // Fallback to ILIKE search
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
  }

  const { data: quizzes, error, count } = await query

  if (error) {
    throw new Error(`Failed to fetch quizzes: ${error.message}`)
  }

  // Get statistics for all quizzes in one database call
  const quizIds = quizzes?.map(q => q.id) || []
  const stats = quizIds.length > 0 ? await getQuizStatsBatch(quizIds) : []

  // Merge stats with quiz data
  const quizzesWithStats: QuizWithStats[] = (quizzes || []).map(quiz => {
    const stat = stats.find(s => s.quiz_id === quiz.id)
    return {
      ...quiz,
      question_count: stat?.question_count || quiz.total_questions || 0,
      attempts_count: stat?.attempts_count || 0,
      average_score: stat?.average_score || 0,
      pass_rate: stat?.pass_rate || 0,
      completion_rate: stat?.completion_rate || 100
    }
  })

  return {
    quizzes: quizzesWithStats,
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
 * Get quiz statistics in batch using database function
 * OPTIMIZED: Single database call instead of N queries
 */
async function getQuizStatsBatch(quizIds: string[]): Promise<any[]> {
  if (quizIds.length === 0) return []

  const supabase = createSupabaseClient()

  try {
    const { data, error } = await supabase.rpc('get_quiz_stats', {
      quiz_ids: quizIds
    })

    if (error) throw error
    return data || []
  } catch (error) {
    console.warn('Database function not available, using fallback', error)
    // Fallback to manual aggregation
    return getFallbackStats(quizIds)
  }
}

/**
 * Fallback stats calculation if database function not available
 */
async function getFallbackStats(quizIds: string[]): Promise<any[]> {
  const supabase = createSupabaseClient()

  // Get question counts
  const { data: questions } = await supabase
    .from('quiz_questions')
    .select('quiz_id')
    .in('quiz_id', quizIds)

  const questionCounts = questions?.reduce((acc: any, q: any) => {
    acc[q.quiz_id] = (acc[q.quiz_id] || 0) + 1
    return acc
  }, {}) || {}

  // Get attempt stats
  const { data: attempts } = await supabase
    .from('quiz_attempts')
    .select('quiz_id, percentage_score, passed')
    .in('quiz_id', quizIds)
    .not('completed_at', 'is', null)

  const attemptStats = attempts?.reduce((acc: any, attempt: any) => {
    if (!acc[attempt.quiz_id]) {
      acc[attempt.quiz_id] = {
        count: 0,
        totalScore: 0,
        passed: 0
      }
    }
    acc[attempt.quiz_id].count++
    acc[attempt.quiz_id].totalScore += attempt.percentage_score || 0
    if (attempt.passed) acc[attempt.quiz_id].passed++
    return acc
  }, {}) || {}

  return quizIds.map(quizId => ({
    quiz_id: quizId,
    question_count: questionCounts[quizId] || 0,
    attempts_count: attemptStats[quizId]?.count || 0,
    average_score: attemptStats[quizId]?.count > 0
      ? Math.round(attemptStats[quizId].totalScore / attemptStats[quizId].count)
      : 0,
    pass_rate: attemptStats[quizId]?.count > 0
      ? Math.round((attemptStats[quizId].passed / attemptStats[quizId].count) * 100)
      : 0,
    completion_rate: 100
  }))
}

/**
 * Get single quiz with questions
 * OPTIMIZED: Single JOIN query instead of multiple round trips
 */
export async function getQuizWithQuestions(quizId: string): Promise<QuizWithQuestions | null> {
  const supabase = createSupabaseClient()

  // Single query with JOIN - gets quiz and questions together
  const { data, error } = await supabase
    .from('quizzes')
    .select(`
      id,
      title,
      description,
      category,
      difficulty,
      duration_minutes,
      total_questions,
      passing_score,
      max_attempts,
      time_limit_minutes,
      is_published,
      created_at,
      updated_at,
      image_url,
      course_id,
      lesson_id,
      shuffle_questions,
      shuffle_options,
      show_results_immediately,
      allow_review,
      allow_backtrack,
      instructions,
      reading_passage,
      passage_title,
      passage_source,
      passage_audio_url,
      word_count,
      estimated_read_time,
      quiz_questions!inner (
        id,
        quiz_id,
        question,
        question_type,
        options,
        correct_answer,
        correct_answer_text,
        correct_answer_json,
        explanation,
        order_index,
        points,
        difficulty_level,
        image_url,
        audio_url,
        video_url,
        time_limit_seconds,
        randomize_options,
        partial_credit,
        feedback_correct,
        feedback_incorrect,
        hint,
        weight,
        auto_grade
      )
    `)
    .eq('id', quizId)
    .eq('is_published', true)
    .order('order_index', { foreignTable: 'quiz_questions' })
    .single()

  if (error || !data) {
    console.error('Failed to fetch quiz with questions:', error)
    return null
  }

  // Get statistics
  const stats = await getQuizStatsBatch([quizId])
  const stat = stats[0]

  // Transform the nested structure
  return {
    ...data,
    questions: data.quiz_questions || [],
    quiz_questions: undefined,  // Remove the nested field
    question_count: stat?.question_count || data.total_questions || 0,
    attempts_count: stat?.attempts_count || 0,
    average_score: stat?.average_score || 0,
    pass_rate: stat?.pass_rate || 0,
    completion_rate: stat?.completion_rate || 100
  } as QuizWithQuestions
}

/**
 * Get user's quiz attempts with quiz details
 * OPTIMIZED: Single JOIN query
 */
export async function getUserQuizAttempts(
  userId: string,
  filters: { page?: number; limit?: number } = {}
): Promise<{
  attempts: any[]
  pagination: PaginationResult
}> {
  const { page = 1, limit = 10 } = filters
  const from = (page - 1) * limit
  const to = from + limit - 1

  const supabase = createSupabaseClient()

  // Try using database function first
  try {
    const { data } = await supabase.rpc('get_user_recent_quizzes', {
      user_uuid: userId,
      result_limit: limit
    })

    if (data) {
      return {
        attempts: data,
        pagination: {
          page,
          limit,
          total: data.length,
          totalPages: Math.ceil(data.length / limit),
          hasMore: data.length === limit
        }
      }
    }
  } catch (error) {
    console.warn('Database function not available, using fallback')
  }

  // Fallback to direct query
  const { data, error, count } = await supabase
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
        title,
        category,
        difficulty
      )
    `, { count: 'exact' })
    .eq('user_id', userId)
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false })
    .range(from, to)

  if (error) {
    throw new Error(`Failed to fetch quiz attempts: ${error.message}`)
  }

  return {
    attempts: data || [],
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
 * Create quiz attempt
 */
export async function createQuizAttempt(attempt: {
  user_id: string
  quiz_id: string
  score: number
  total_questions: number
  time_taken_seconds: number
  answers: any
  passed: boolean
  percentage_score: number
  attempt_number: number
}): Promise<any> {
  const supabase = createSupabaseClient()

  const { data, error } = await supabase
    .from('quiz_attempts')
    .insert(attempt)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create quiz attempt: ${error.message}`)
  }

  return data
}

/**
 * Get quiz leaderboard
 */
export async function getQuizLeaderboard(
  quizId: string,
  timePeriod: 'all_time' | 'this_month' | 'this_week' = 'all_time',
  limit: number = 10
): Promise<any[]> {
  const supabase = createSupabaseClient()

  try {
    const { data, error } = await supabase.rpc('get_quiz_leaderboard', {
      quiz_uuid: quizId,
      time_period: timePeriod,
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
 * Optimized quiz API export
 */
export const optimizedQuizAPI = {
  getQuizzesWithStats,
  getQuizWithQuestions,
  getUserQuizAttempts,
  createQuizAttempt,
  getQuizLeaderboard
}
