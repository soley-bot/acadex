// Dashboard Shared Types
// Consolidates all dashboard-related TypeScript interfaces

export interface BaseEntity {
  id: string
  created_at?: string
  updated_at?: string
}

// ==============================================
// QUIZ TYPES
// ==============================================

export interface QuizAttempt extends BaseEntity {
  quiz_id: string
  user_id: string
  quiz_title: string
  course_title?: string
  category: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  score: number | null
  total_questions: number
  correct_answers: number | null
  percentage: number
  status: 'in_progress' | 'completed'
  completed_at: string | null
  started_at?: string
  time_taken_minutes: number
  duration?: string // formatted duration like "30 minutes"
  attempt_number: number
  // UI computed fields
  timeSpent: string
}

export interface QuizSummary {
  id: string
  title: string
  description?: string
  category: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  total_questions: number
  duration_minutes: number
  attempts_count: number
  best_score?: number
  is_published: boolean
}

// ==============================================
// COURSE TYPES  
// ==============================================

export interface EnrolledCourse extends BaseEntity {
  course_id: string
  title: string
  description?: string
  category: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  duration: string
  progress_percentage: number
  last_accessed: string
  enrolled_at: string
  // Course details
  image_url?: string
  total_students?: number
  estimated_duration?: string
  // UI computed fields
  total_lessons: number
  completed_lessons: number
  next_lesson?: {
    id: string
    title: string
  }
}

export interface CourseProgress extends BaseEntity {
  course_id: string
  user_id: string
  progress_percentage: number
  completed_lessons: string[] // lesson IDs
  current_lesson_id?: string
  last_accessed: string
  time_spent_minutes: number
}

// ==============================================
// USER PROGRESS & STATS
// ==============================================

export interface UserStats {
  // Enrollment statistics
  active_courses: number
  completed_courses: number
  courses_in_progress: number
  
  // Quiz statistics  
  total_quizzes: number
  quizzes_passed: number
  average_score: number | null
  best_score: number
  score_trend?: number // percentage change
  
  // Learning statistics
  total_study_time: number // in minutes
  current_streak: number | null
  lessons_completed: number
  
  // Time-based metrics
  this_week_hours: number
  this_month_hours: number
  total_login_days: number
}

export interface DashboardData {
  stats: UserStats
  recent_courses: EnrolledCourse[]
  recent_quiz_attempts: QuizAttempt[]
  upcoming_deadlines?: DeadlineItem[]
}

export interface DeadlineItem extends BaseEntity {
  type: 'quiz' | 'assignment' | 'course'
  title: string
  due_date: string
  status: 'upcoming' | 'overdue' | 'completed'
}

// ==============================================
// USER SETTINGS & PREFERENCES
// ==============================================

export interface NotificationSettings {
  course_reminders: boolean
  quiz_deadlines: boolean
  progress_updates: boolean
  email_digest: boolean
}

export interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system'
  language: string
  autoplay_videos: boolean
  sound_effects: boolean
}

export interface PrivacySettings {
  profile_visibility: 'public' | 'private'
  progress_sharing: boolean
  analytics_opt_out: boolean
}

export interface UserSettings {
  user_id: string
  notifications: NotificationSettings
  appearance: AppearanceSettings
  privacy: PrivacySettings
  timezone: string
  updated_at: string
}

// ==============================================
// API RESPONSE TYPES
// ==============================================

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  total_pages: number
  has_more: boolean
}

export interface ApiResponse<T> {
  data: T
  error?: {
    code: string
    message: string
    details?: unknown
  }
  pagination?: PaginationMeta
}

export interface DashboardApiResponse {
  stats: UserStats
  recent_courses: EnrolledCourse[]
  recent_quizzes: QuizAttempt[]
}

// ==============================================
// UI COMPONENT PROPS
// ==============================================

export interface DashboardLayoutProps {
  children: React.ReactNode
  title: string
  description?: string
  show_back_button?: boolean
  actions?: React.ReactNode
}

export interface StatsCardProps {
  title: string
  value: string | number
  description: string
  icon: React.ComponentType<{ className?: string }>
  color_class: string
  trend?: {
    direction: 'up' | 'down' | 'neutral'
    percentage: number
  }
}

export interface CourseCardProps {
  course: EnrolledCourse
  show_progress?: boolean
  show_actions?: boolean
  variant?: 'compact' | 'detailed'
}

export interface QuizCardProps {
  attempt: QuizAttempt
  show_details?: boolean
  variant?: 'compact' | 'detailed'
}

// ==============================================
// FILTER & SORT OPTIONS
// ==============================================

export interface QuizFilters {
  category?: string
  difficulty?: string
  status?: 'all' | 'completed' | 'not-attempted'
  date_range?: {
    start: string
    end: string
  }
}

export interface CourseFilters {
  category?: string
  difficulty?: string
  progress?: 'all' | 'not-started' | 'in-progress' | 'completed'
  enrollment_date?: {
    start: string
    end: string
  }
}

export type SortOption = {
  field: string
  direction: 'asc' | 'desc'
}

// ==============================================
// FORM TYPES
// ==============================================

export interface SettingsFormData {
  notifications: NotificationSettings
  appearance: AppearanceSettings
  privacy: PrivacySettings
  timezone: string
}

// ==============================================
// ERROR HANDLING
// ==============================================

export interface DashboardError {
  type: 'api' | 'auth' | 'validation' | 'network'
  code: string
  message: string
  details?: unknown
  timestamp: string
  user_id?: string
}

export interface ErrorBoundaryState {
  has_error: boolean
  error?: DashboardError
  error_id?: string
}

// ==============================================
// LOADING STATES
// ==============================================

export interface LoadingState {
  dashboard: boolean
  courses: boolean
  quizzes: boolean
  settings: boolean
  stats: boolean
}

// ==============================================
// UTILITY TYPES
// ==============================================

export type DashboardPage = 
  | 'overview' 
  | 'courses' 
  | 'quizzes' 
  | 'results' 
  | 'settings'
  | 'profile'

export type ActionStatus = 'idle' | 'loading' | 'success' | 'error'

// Color utility types for consistent styling
export type ColorVariant = 
  | 'primary' 
  | 'secondary' 
  | 'success' 
  | 'warning' 
  | 'error'
  | 'info'

// ==============================================
// TRANSFORMATION UTILITIES
// ==============================================

export interface DataTransformOptions {
  include_ui_fields?: boolean
  format_dates?: boolean
  calculate_percentages?: boolean
}