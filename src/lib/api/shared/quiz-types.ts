import type { Quiz, QuizQuestion, QuizAttempt } from '@/lib/supabase'

// Shared Quiz Types
export type { Quiz, QuizQuestion, QuizAttempt }

// API Request Types
export interface QuizFilters {
  category?: string
  difficulty?: string
  page?: number
  limit?: number
  search?: string
}

export interface AdminQuizFilters extends QuizFilters {
  userId?: string
  is_published?: boolean
  created_after?: string
  created_before?: string
}

export interface CreateQuizRequest {
  title: string
  description?: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration_minutes?: number
  time_limit_minutes?: number
  passing_score?: number
  max_attempts?: number
  image_url?: string
  course_id?: string
  lesson_id?: string
  is_published?: boolean
}

export interface UpdateQuizRequest extends Partial<CreateQuizRequest> {}

export interface CreateQuestionRequest {
  quiz_id: string
  question: string
  question_type: 'multiple_choice' | 'single_choice' | 'true_false' | 'fill_blank' | 'essay' | 'matching' | 'ordering'
  options?: any
  correct_answer: any
  correct_answer_text?: string
  correct_answer_json?: any
  explanation?: string
  order_index: number
  points?: number
  difficulty_level?: 'easy' | 'medium' | 'hard'
  image_url?: string
  audio_url?: string
  video_url?: string
}

export interface UpdateQuestionRequest extends Partial<Omit<CreateQuestionRequest, 'quiz_id'>> {}

// API Response Types
export interface ServiceResponse<T> {
  data: T | null
  error: any
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasMore: boolean
  }
}

export interface QuizWithQuestions extends Quiz {
  questions: QuizQuestion[]
}