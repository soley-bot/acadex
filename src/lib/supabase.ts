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
  description?: string
  instructor_id: string
  price?: number
  duration_hours?: number
  level: 'beginner' | 'intermediate' | 'advanced'
  category?: string
  image_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
  // Computed fields
  instructor_name?: string
  rating?: number
  student_count?: number
}

export interface Quiz {
  id: string
  title: string
  description?: string
  course_id?: string
  difficulty: 'easy' | 'medium' | 'hard'
  time_limit?: number
  is_active: boolean
  created_at: string
  updated_at: string
  // Computed fields
  course_title?: string
  question_count?: number
  attempts?: number
  avg_score?: number
}

export interface QuizQuestion {
  id: string
  quiz_id: string
  question: string
  options: string[]
  correct_answer: number
  explanation?: string
  order_index: number
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

export interface Enrollment {
  id: string
  user_id: string
  course_id: string
  progress: number
  completed_at?: string
  enrolled_at: string
}
