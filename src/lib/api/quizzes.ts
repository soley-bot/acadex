import { supabase } from '../supabase'
import type { QuizAttempt } from '../supabase'

export const quizAPI = {
  // Get paginated published quizzes
  async getQuizzes(filters?: { 
    category?: string; 
    difficulty?: string; 
    page?: number; 
    limit?: number 
  }) {
    const page = filters?.page || 1
    const limit = filters?.limit || 12
    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = supabase
      .from('quizzes')
      .select(`
        id,
        title,
        description,
        category,
        difficulty,
        duration_minutes,
        is_published,
        created_at,
        quiz_questions(count)
      `, { count: 'exact' })
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (filters?.category) {
      query = query.eq('category', filters.category)
    }

    if (filters?.difficulty) {
      query = query.eq('difficulty', filters.difficulty)
    }

    const { data, error, count } = await query
    
    // Transform data to include actual question count
    const transformedData = data?.map((quiz: any) => ({
      ...quiz,
      total_questions: quiz.quiz_questions[0]?.count || 0
    })) || []
    
    return { 
      data: transformedData, 
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

  // Get single quiz with questions
  async getQuizWithQuestions(id: string) {
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select(`
        id,
        title,
        description,
        category,
        difficulty,
        duration_minutes,
        total_questions,
        course_id,
        lesson_id,
        passing_score,
        max_attempts,
        time_limit_minutes,
        image_url,
        is_published,
        created_at,
        updated_at,
        reading_passage,
        passage_title,
        passage_source,
        passage_audio_url,
        word_count,
        estimated_read_time
      `)
      .eq('id', id)
      .eq('is_published', true)
      .single()

    if (quizError) return { data: null, error: quizError }

    const { data: questions, error: questionsError } = await supabase
      .from('quiz_questions')
      .select(`
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
        randomize_options,
        partial_credit,
        feedback_correct,
        feedback_incorrect,
        hint,
        time_limit_seconds,
        weight,
        auto_grade,
        question_metadata
      `)
      .eq('quiz_id', id)
      .order('order_index')

    return { 
      data: quiz ? { ...quiz, questions } : null, 
      error: questionsError 
    }
  },

  // Create quiz attempt
  async createQuizAttempt(attempt: Omit<QuizAttempt, 'id' | 'completed_at'>) {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .insert(attempt)
      .select()
      .single()

    return { data, error }
  },

  // Get user's quiz attempts
  async getUserQuizAttempts(userId: string, filters?: {
    page?: number;
    limit?: number;
  }) {
    const page = filters?.page || 1
    const limit = filters?.limit || 10
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await supabase
      .from('quiz_attempts')
      .select(`
        *,
        quizzes (
          title,
          category,
          difficulty
        )
      `, { count: 'exact' })
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .range(from, to)

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

  // Get quiz statistics
  async getQuizStats(quizId: string) {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .select('score, total_questions')
      .eq('quiz_id', quizId)

    if (error) return { data: null, error }

    const attempts = data.length
    const avgScore = attempts > 0 
      ? data.reduce((sum: number, attempt: any) => sum + (attempt.score / attempt.total_questions), 0) / attempts * 100
      : 0

    return { 
      data: { 
        totalAttempts: attempts, 
        averageScore: Math.round(avgScore) 
      }, 
      error: null 
    }
  }
}