import type { Course, CourseModule, CourseLesson, Quiz } from '@/lib/supabase'

export interface QuizOption {
  id: string
  title: string
  description?: string
}

export interface LessonData {
  id?: string
  title: string
  description: string
  content: string
  video_url?: string
  video_type?: 'upload' | 'youtube'
  duration_minutes?: number
  order_index: number
  is_free_preview: boolean
  quiz_id?: string
}

export interface ModuleData {
  id?: string
  title: string
  description: string
  order_index: number
  lessons: LessonData[]
}

export interface EnhancedCourseData {
  title: string
  description: string
  instructor_name: string
  price: number
  category: string
  level: 'beginner' | 'intermediate' | 'advanced'
  duration: string
  image_url: string
  is_published: boolean
  learning_objectives: string[]
  modules: ModuleData[]
}

export interface CourseFormProps {
  course?: Course
  isOpen: boolean
  onClose: () => void
  onSuccess: (updatedCourse?: Course) => void
  embedded?: boolean
}

export type TabType = 'basic' | 'modules'