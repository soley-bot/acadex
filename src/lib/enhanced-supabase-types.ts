// ===============================================
// ENHANCED QUIZ SYSTEM TYPESCRIPT INTERFACES
// ===============================================
// Updated interfaces matching the enhanced database schema

import { QuizAttempt } from './supabase'

// Enhanced Quiz interface with new fields
export interface EnhancedQuiz {
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
  
  // New enhanced fields
  shuffle_questions: boolean
  shuffle_options: boolean
  show_results_immediately: boolean
  allow_review: boolean
  allow_backtrack: boolean
  randomize_questions: boolean
  questions_per_page: number
  show_progress: boolean
  auto_submit: boolean
  instructions?: string | null
  tags: string[]
  estimated_time_minutes?: number | null
  retake_policy: {
    allowed: boolean
    max_attempts: number
    cooldown_hours: number
  }
  grading_policy: {
    method: 'highest' | 'latest' | 'average'
    show_correct_answers: boolean
    partial_credit: boolean
  }
  availability_window: {
    start_date?: string | null
    end_date?: string | null
    timezone: string
  }
  proctoring_settings: {
    enabled: boolean
    webcam: boolean
    screen_lock: boolean
    time_warnings: number[]
  }
  certificate_template_id?: string | null
  analytics_enabled: boolean
  public_results: boolean
  allow_anonymous: boolean
  
  created_at: string
  updated_at: string
}

// Enhanced Question interface
export interface EnhancedQuizQuestion {
  id: string
  quiz_id: string
  question: string
  question_type: 'multiple_choice' | 'single_choice' | 'true_false' | 'fill_blank' | 'essay' | 'matching' | 'ordering' | 'drag_drop' | 'hotspot' | 'numeric' | 'slider'
  options: any[] // JSONB array
  correct_answer: number | string | number[]
  correct_answer_text?: string | null
  explanation?: string | null
  order_index: number
  points: number
  difficulty_level: 'easy' | 'medium' | 'hard'
  
  // Media fields
  image_url?: string | null
  audio_url?: string | null
  video_url?: string | null
  
  // New enhanced fields
  tags: string[]
  time_limit_seconds?: number | null
  required: boolean
  randomize_options: boolean
  partial_credit: boolean
  feedback_correct?: string | null
  feedback_incorrect?: string | null
  hint?: string | null
  question_metadata: Record<string, any>
  conditional_logic?: Record<string, any> | null
  weight: number
  auto_grade: boolean
  rubric?: Record<string, any> | null
}

// Quiz Categories
export interface QuizCategory {
  id: string
  name: string
  description?: string | null
  color: string
  icon?: string | null
  parent_id?: string | null
  sort_order: number
  is_active: boolean
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

// Quiz Templates
export interface QuizTemplate {
  id: string
  name: string
  description?: string | null
  template_data: Record<string, any>
  category_id?: string | null
  created_by: string
  is_public: boolean
  usage_count: number
  rating: number
  tags: string[]
  thumbnail_url?: string | null
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

// Question Analytics
export interface QuestionAnalytics {
  id: string
  question_id: string
  total_attempts: number
  correct_attempts: number
  average_time_seconds: number
  difficulty_rating: number
  discrimination_index: number
  last_updated: string
  metadata: Record<string, any>
}

// Question Attempts (detailed tracking)
export interface QuestionAttempt {
  id: string
  quiz_attempt_id: string
  question_id: string
  user_answer: Record<string, any>
  is_correct: boolean
  points_earned: number
  points_possible: number
  time_spent_seconds: number
  attempts_count: number
  flagged: boolean
  confidence_level?: number | null
  feedback_shown: boolean
  hint_used: boolean
  metadata: Record<string, any>
  created_at: string
}

// Quiz Sessions
export interface QuizSession {
  id: string
  quiz_attempt_id: string
  user_id: string
  quiz_id: string
  session_data: Record<string, any>
  started_at: string
  last_activity_at: string
  ended_at?: string | null
  is_active: boolean
  user_agent?: string | null
  ip_address?: string | null
  browser_info: Record<string, any>
}

// Media Library
export interface MediaLibrary {
  id: string
  filename: string
  original_name?: string | null
  file_path: string
  file_type?: string | null
  file_size?: number | null
  mime_type?: string | null
  alt_text?: string | null
  tags: string[]
  is_public: boolean
  folder_path: string
  thumbnail_url?: string | null
  metadata: Record<string, any>
  created_by?: string | null
  created_at: string
  updated_at: string
}

// Question Media Relationships
export interface QuestionMedia {
  id: string
  question_id: string
  media_id: string
  media_role: 'question' | 'option' | 'explanation' | 'feedback'
  display_order: number
  is_required: boolean
  metadata: Record<string, any>
  created_at: string
}

// Learning Paths
export interface LearningPath {
  id: string
  name: string
  description?: string | null
  quiz_ids: string[]
  prerequisites: string[]
  completion_criteria: {
    pass_rate: number
    min_score: number
  }
  estimated_hours?: number | null
  difficulty_level: string
  category_id?: string | null
  is_public: boolean
  created_by: string
  tags: string[]
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

// Learning Path Progress
export interface LearningPathProgress {
  id: string
  user_id: string
  learning_path_id: string
  current_quiz_index: number
  completed_quizzes: string[]
  progress_percentage: number
  started_at: string
  completed_at?: string | null
  last_activity_at: string
  metadata: Record<string, any>
}

// Adaptive Quiz Settings
export interface AdaptiveQuizSettings {
  id: string
  quiz_id: string
  enabled: boolean
  difficulty_adjustment: boolean
  min_questions: number
  max_questions: number
  target_accuracy: number
  stopping_criteria: {
    confidence: number
    standard_error: number
  }
  item_selection_algorithm: string
  theta_estimation_method: string
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

// Badges
export interface Badge {
  id: string
  name: string
  description?: string | null
  icon_url?: string | null
  criteria: Record<string, any>
  points: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  category?: string | null
  is_active: boolean
  auto_award: boolean
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

// User Badges
export interface UserBadge {
  id: string
  user_id: string
  badge_id: string
  earned_at: string
  quiz_attempt_id?: string | null
  learning_path_id?: string | null
  progress_data: Record<string, any>
  is_featured: boolean
  metadata: Record<string, any>
}

// Leaderboards
export interface Leaderboard {
  id: string
  name: string
  description?: string | null
  quiz_id?: string | null
  category_id?: string | null
  learning_path_id?: string | null
  leaderboard_type: 'score' | 'time' | 'streak' | 'points'
  time_period: 'daily' | 'weekly' | 'monthly' | 'all_time'
  max_entries: number
  is_public: boolean
  reset_frequency?: string | null
  last_reset?: string | null
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

// Leaderboard Entries
export interface LeaderboardEntry {
  id: string
  leaderboard_id: string
  user_id: string
  score: number
  additional_data: Record<string, any>
  rank_position?: number | null
  created_at: string
  updated_at: string
}

// User Stats
export interface UserStats {
  id: string
  user_id: string
  total_points: number
  current_streak: number
  longest_streak: number
  quizzes_completed: number
  questions_answered: number
  correct_answers: number
  total_time_spent_minutes: number
  achievements_count: number
  last_activity_date: string
  level_id?: string | null
  experience_points: number
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

// Quiz Permissions
export interface QuizPermission {
  id: string
  quiz_id: string
  user_id: string
  permission_level: 'view' | 'edit' | 'admin' | 'owner'
  granted_by?: string | null
  granted_at: string
  expires_at?: string | null
  is_active: boolean
  metadata: Record<string, any>
}

// Quiz Groups
export interface QuizGroup {
  id: string
  name: string
  description?: string | null
  created_by: string
  is_public: boolean
  join_code?: string | null
  max_members: number
  settings: Record<string, any>
  created_at: string
  updated_at: string
}

// Quiz Group Members
export interface QuizGroupMember {
  id: string
  group_id: string
  user_id: string
  role: 'member' | 'moderator' | 'admin'
  joined_at: string
  is_active: boolean
  metadata: Record<string, any>
}

// Quiz Feedback
export interface QuizFeedback {
  id: string
  quiz_id: string
  user_id: string
  rating?: number | null
  comment?: string | null
  is_public: boolean
  is_verified: boolean
  helpful_count: number
  reply_to_id?: string | null
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

// Notifications
export interface Notification {
  id: string
  user_id: string
  title: string
  message?: string | null
  notification_type: string
  related_entity_id?: string | null
  related_entity_type?: string | null
  is_read: boolean
  action_url?: string | null
  priority: 'low' | 'normal' | 'high' | 'urgent'
  delivery_method: string[]
  scheduled_for: string
  sent_at?: string | null
  metadata: Record<string, any>
  created_at: string
}

// View Interfaces for common queries
export interface QuizStatistics {
  id: string
  title: string
  category: string
  difficulty: string
  total_attempts: number
  unique_users: number
  average_score: number
  average_time_seconds: number
  passed_attempts: number
  pass_rate: number
  last_attempt_date?: string | null
  created_at: string
  is_published: boolean
}

export interface UserPerformance {
  user_id: string
  email: string
  total_points: number
  current_streak: number
  quizzes_completed: number
  questions_answered: number
  correct_answers: number
  accuracy_percentage: number
  badges_earned: number
  last_activity_date?: string | null
  stats_created_at: string
}

export interface QuestionDifficultyAnalysis {
  id: string
  quiz_id: string
  question: string
  question_type: string
  difficulty_level: string
  points: number
  total_attempts: number
  correct_attempts: number
  success_rate: number
  avg_time_seconds: number
  avg_points_earned: number
}

// API Response Types
export interface QuizListResponse {
  quizzes: EnhancedQuiz[]
  total: number
  page: number
  pageSize: number
  filters: {
    category?: string
    difficulty?: string
    tags?: string[]
    search?: string
  }
}

export interface QuizAnalyticsResponse {
  quiz: EnhancedQuiz
  statistics: QuizStatistics
  questions: QuestionDifficultyAnalysis[]
  recentAttempts: QuizAttempt[]
  topPerformers: UserPerformance[]
}

// Form Types for creating/editing
export interface CreateQuizRequest {
  title: string
  description: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration_minutes: number
  passing_score: number
  max_attempts: number
  image_url?: string
  is_published: boolean
  shuffle_questions?: boolean
  shuffle_options?: boolean
  show_results_immediately?: boolean
  allow_review?: boolean
  instructions?: string
  tags?: string[]
  questions: CreateQuestionRequest[]
}

export interface CreateQuestionRequest {
  question: string
  question_type: string
  options: any[]
  correct_answer: number | string | number[]
  explanation?: string
  points?: number
  difficulty_level?: string
  image_url?: string
  audio_url?: string
  video_url?: string
  tags?: string[]
  hint?: string
  feedback_correct?: string
  feedback_incorrect?: string
}

// Export all interfaces as a module
export type {
  EnhancedQuiz as Quiz,
  EnhancedQuizQuestion as QuizQuestion
}
