import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types
export interface User {
  id: string
  email: string
  name: string
  avatar_url?: string
  role: 'student' | 'instructor' | 'admin'
  created_at: string
  updated_at: string
}

export interface Course {
  id: string
  title: string
  description: string
  instructor_id: string
  instructor_name: string
  price: number // numeric in DB, handled as number in JS
  original_price?: number
  discount_percentage?: number
  is_free?: boolean
  duration: string
  level: 'beginner' | 'intermediate' | 'advanced'
  category: string
  image_url?: string
  video_preview_url?: string
  tags?: string[]
  prerequisites?: string[]
  learning_objectives?: string[]
  status?: 'draft' | 'review' | 'published' | 'archived'
  published_at?: string
  archived_at?: string
  rating?: number // numeric in DB
  student_count: number // integer in DB
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface Quiz {
  id: string
  title: string
  description: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration_minutes: number
  total_questions: number
  is_published: boolean
  created_at: string
  updated_at: string
  // Computed fields
  question_count?: number
  attempts?: number
  avg_score?: number
}

export interface QuizQuestion {
  id: string
  quiz_id: string
  question: string
  options: any[] // JSONB array
  correct_answer: number
  explanation?: string
  order_index: number
}

export interface Question {
  id: string
  quiz_id: string
  question_text: string
  question_type: 'multiple_choice' | 'true_false' | 'fill_blank'
  options?: any // JSONB
  correct_answer: string
  explanation?: string
  points: number
  created_at: string
}

export interface QuizAttempt {
  id: string
  user_id: string
  quiz_id: string
  score: number
  total_questions: number
  time_taken_seconds: number
  answers: Record<string, number>
  completed_at: string
}

// Enhanced Course Content Types
export interface CourseModule {
  id: string
  course_id: string
  title: string
  description?: string
  order_index: number
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface CourseLesson {
  id: string
  module_id: string
  title: string
  description?: string
  content?: string
  video_url?: string
  duration_minutes: number
  order_index: number
  is_published: boolean
  is_free_preview: boolean
  created_at: string
  updated_at: string
}

export interface CourseResource {
  id: string
  course_id?: string
  lesson_id?: string
  title: string
  description?: string
  file_url: string
  file_type: string
  file_size_bytes?: number
  is_downloadable: boolean
  created_at: string
}

export interface LessonProgress {
  id: string
  user_id: string
  lesson_id: string
  is_completed: boolean
  watch_time_minutes: number
  last_position_seconds: number
  completed_at?: string
  started_at: string
}

export interface CourseReview {
  id: string
  course_id: string
  user_id: string
  rating: number
  review_text?: string
  is_verified_purchase: boolean
  is_featured: boolean
  created_at: string
  updated_at: string
}

export interface Enrollment {
  id: string
  user_id: string
  course_id: string
  progress: number // integer with check constraint 0-100
  completed_at?: string
  enrolled_at: string
}
