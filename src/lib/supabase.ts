import { createClient } from '@supabase/supabase-js'
import type { UserRole } from './auth-security'

/**
 * Cookie-based storage adapter for when localStorage is blocked
 * Used as fallback on mobile Safari private mode
 */
function createCookieStorage() {
  return {
    getItem: (key: string): string | null => {
      if (typeof document === 'undefined') return null

      const value = document.cookie
        .split('; ')
        .find(row => row.startsWith(`${key}=`))
        ?.split('=')[1]

      return value ? decodeURIComponent(value) : null
    },
    setItem: (key: string, value: string): void => {
      if (typeof document === 'undefined') return

      // Use 30 days expiry, Secure flag, and Lax SameSite for better compatibility
      const maxAge = 30 * 24 * 60 * 60 // 30 days in seconds
      document.cookie = `${key}=${encodeURIComponent(value)}; max-age=${maxAge}; path=/; SameSite=Lax; Secure`
      console.log('[Supabase] Saved to cookie:', key)
    },
    removeItem: (key: string): void => {
      if (typeof document === 'undefined') return

      document.cookie = `${key}=; max-age=0; path=/; SameSite=Lax; Secure`
      console.log('[Supabase] Removed from cookie:', key)
    }
  }
}

/**
 * Check if localStorage is available and working
 * Mobile browsers (especially Safari) may block it in private mode
 * Falls back to cookie-based storage for persistence
 */
function getStorageAdapter() {
  if (typeof window === 'undefined') return undefined

  try {
    const testKey = '__storage_test__'
    window.localStorage.setItem(testKey, 'test')
    window.localStorage.removeItem(testKey)
    console.log('[Supabase] localStorage available')
    return window.localStorage
  } catch (e) {
    console.warn('[Supabase] localStorage blocked - using cookie storage fallback (mobile Safari private mode)')
    // Return cookie-based storage instead of undefined to maintain persistence
    return createCookieStorage() as any
  }
}

// Client-side singleton to ensure single instance across all components
let clientInstance: any = null

function createSupabaseClient() {
  // Only use singleton on client-side
  if (typeof window !== 'undefined') {
    if (clientInstance) {
      console.log('[Supabase] Returning existing client instance')
      return clientInstance
    }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl) {
    if (typeof window === 'undefined') {
      // During build/prerender, return a mock client that won't be used
      console.warn('[Supabase] Missing NEXT_PUBLIC_SUPABASE_URL during build')
      return {} as any
    }
    console.error('[Supabase] Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable. Please check your .env.local file.')
  }

  if (!supabaseAnonKey) {
    if (typeof window === 'undefined') {
      // During build/prerender, return a mock client that won't be used
      console.warn('[Supabase] Missing NEXT_PUBLIC_SUPABASE_ANON_KEY during build')
      return {} as any
    }
    console.error('[Supabase] Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable. Please check your .env.local file.')
  }

  try {
    const storage = getStorageAdapter()

    const client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'acadex-auth-token',
        storage: storage,
        flowType: 'pkce'
      },
      global: {
        headers: {
          'x-application-name': 'Acadex'
        }
      },
      db: {
        schema: 'public'
      }
    })

    // Only store singleton on client-side, never on server
    if (typeof window !== 'undefined') {
      clientInstance = client

      const storageType = storage === window.localStorage
        ? 'with localStorage'
        : storage
          ? 'with cookie storage (localStorage blocked)'
          : 'with memory storage (no persistence)'
      console.log('[Supabase] NEW client created and stored as singleton', storageType)
    } else {
      console.log('[Supabase] Server-side client created (no singleton)')
    }

    return client
  } catch (error) {
    console.error('[Supabase] Failed to create client:', error)
    if (typeof window === 'undefined') {
      // During build, return mock client
      return {} as any
    }
    throw error
  }
}

/**
 * FINAL FIX: Export the factory function instead of a singleton
 * 
 * WHY THIS WORKS:
 * - Components can call createSupabaseClient() in their own lifecycle
 * - React components only run on client after hydration
 * - No module-level initialization = no SSR issues
 * 
 * AuthContext creates its own client in useEffect for client-side only auth.
 * Other files should use createSupabaseClient() directly or useAuth() hook.
 */

// Export ONLY the factory function - no module-level instance
export { createSupabaseClient }

// Database Types matching exact schema
export interface User {
  id: string
  email: string
  name: string
  avatar_url?: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Course {
  id: string
  title: string
  description: string
  instructor_id: string
  instructor_name: string
  category: string
  level: 'beginner' | 'intermediate' | 'advanced'
  price: number // numeric in DB, handled as number in JS
  duration: string
  image_url?: string | null
  thumbnail_url?: string | null
  video_preview_url?: string | null
  tags?: string[] | null
  prerequisites?: string[] | null
  learning_objectives?: string[] | null
  status: 'draft' | 'review' | 'published' | 'archived'
  published_at?: string | null
  archived_at?: string | null
  original_price?: number | null
  discount_percentage?: number | null
  is_free: boolean
  rating?: number | null // numeric in DB
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
  course_id?: string | null
  lesson_id?: string | null
  passing_score: number
  max_attempts: number
  time_limit_minutes?: number | null
  image_url?: string | null
  is_published: boolean
  created_at: string
  updated_at: string
  
  // Reading quiz fields
  reading_passage?: string | null
  passage_title?: string | null
  passage_source?: string | null
  passage_audio_url?: string | null
  word_count?: number | null
  estimated_read_time?: number | null
}

// Type aliases for easier importing
export type QuestionType = 'multiple_choice' | 'single_choice' | 'true_false' | 'fill_blank' | 'essay' | 'matching' | 'ordering'

export interface QuizQuestion {
  id: string
  quiz_id: string
  question: string
  question_type: 'multiple_choice' | 'single_choice' | 'true_false' | 'fill_blank' | 'essay' | 'matching' | 'ordering'
  options: any // JSONB array
  correct_answer: number
  correct_answer_text?: string | null
  correct_answer_json?: any | null  // New: For complex question types (matching, ordering)
  explanation?: string | null
  order_index: number
  points: number                    // Now required with default 1
  difficulty_level: 'easy' | 'medium' | 'hard'
  image_url?: string | null
  audio_url?: string | null
  video_url?: string | null
  
  // Database fields (matching actual schema)
  randomize_options?: boolean
  partial_credit?: boolean
  feedback_correct?: string | null
  feedback_incorrect?: string | null
  hint?: string | null
  time_limit_seconds?: number | null
  weight?: number
  auto_grade?: boolean
  question_metadata?: any
}

export interface Question {
  id: string
  quiz_id: string
  question_text: string
  question_type: 'multiple_choice' | 'true_false' | 'fill_blank'
  options?: any | null // JSONB
  correct_answer: string
  explanation?: string | null
  points: number
  created_at: string
}

export interface QuizAttempt {
  id: string
  user_id: string
  quiz_id: string
  total_questions: number
  answers: any // JSONB
  score: number
  time_taken_seconds: number
  created_at: string
  completed_at: string
  passed: boolean
  percentage_score?: number | null
  attempt_number: number
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
  enrolled_at: string
  completed_at?: string | null
  last_accessed_at?: string | null
  current_lesson_id?: string | null
  total_watch_time_minutes: number
  certificate_issued_at?: string | null
}

// Additional interfaces to match your schema
export interface Certificate {
  id: string
  user_id: string
  course_id: string
  certificate_number: string
  issued_at: string
  expires_at?: string | null
  pdf_url?: string | null
  is_valid: boolean
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'enrollment' | 'assignment' | 'achievement' | 'announcement' | 'reminder'
  action_url?: string | null
  is_read: boolean
  created_at: string
}

export interface Order {
  id: string
  user_id: string
  total_amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded'
  payment_method?: string | null
  payment_intent_id?: string | null
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  course_id: string
  price_paid: number
  created_at: string
}

export interface AdminActivityLog {
  id: string
  admin_user_id: string
  action: string
  resource_type: string
  resource_id: string
  old_values?: any | null // JSONB
  new_values?: any | null // JSONB
  ip_address?: string | null
  user_agent?: string | null
  created_at: string
}
