// Optimized Dashboard Containers - lightweight alternatives to heavy cards
export { StatContainer } from './StatContainer'
export { OptimizedCourseCard } from './OptimizedCourseCard'
export { OptimizedQuizCard } from './OptimizedQuizCard'

// Re-export UI components for convenience
export { ContentContainer, UnifiedCard } from '@/components/ui/CardVariants'

// Re-export types
export type { 
  EnrolledCourse, 
  QuizAttempt 
} from '@/types/dashboard'