// Export the main CourseForm component
export { CourseForm } from './CourseForm'

// Export types for external use
export type { 
  CourseFormProps, 
  EnhancedCourseData, 
  ModuleData, 
  LessonData, 
  QuizOption 
} from './types'

// Export individual steps for advanced usage
export { BasicInfoStep } from './steps/BasicInfoStep'

// Export hooks for custom implementations
export { useCourseForm } from './hooks/useCourseForm'