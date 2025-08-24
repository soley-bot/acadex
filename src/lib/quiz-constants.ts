/**
 * Shared constants and types for AI Quiz Generators
 * Ensures consistency across Basic and Enhanced generators
 */

// Supported Languages (matches existing implementation)
export const SUPPORTED_LANGUAGES = [
  { code: 'english', name: 'English', flag: '🇺🇸' },
  { code: 'spanish', name: 'Spanish', flag: '🇪🇸' },
  { code: 'french', name: 'French', flag: '🇫🇷' },
  { code: 'german', name: 'German', flag: '🇩🇪' },
  { code: 'italian', name: 'Italian', flag: '🇮🇹' },
  { code: 'portuguese', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'chinese', name: 'Chinese', flag: '🇨🇳' },
  { code: 'japanese', name: 'Japanese', flag: '🇯🇵' },
  { code: 'korean', name: 'Korean', flag: '🇰🇷' },
  { code: 'arabic', name: 'Arabic', flag: '🇸🇦' },
  { code: 'russian', name: 'Russian', flag: '🇷🇺' },
  { code: 'hindi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'khmer', name: 'ខ្មែរ (Khmer)', flag: '🇰🇭' },
  { code: 'indonesian', name: 'Bahasa Indonesia', flag: '🇮🇩' }
] as const

// Subject Categories (shared between generators)
export const QUIZ_SUBJECTS = [
  'General Knowledge',
  'Mathematics',
  'Science',
  'Physics', 
  'Chemistry',
  'Biology',
  'History',
  'Geography',
  'English Language',
  'Literature',
  'Computer Science',
  'Programming',
  'Business',
  'Economics',
  'Psychology',
  'Philosophy',
  'Art',
  'Music',
  'Health',
  'Sports'
] as const

// Question Types (standardized)
export const QUESTION_TYPES = [
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'true_false', label: 'True/False' },
  { value: 'fill_in_the_blank', label: 'Fill in the Blank' },
  { value: 'short_answer', label: 'Short Answer' },
  { value: 'essay', label: 'Essay' },
  { value: 'matching', label: 'Matching' },
  { value: 'ordering', label: 'Ordering' }
] as const

// Difficulty Levels (consistent across both)
export const DIFFICULTY_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' }
] as const

// Question Count Options
export const QUESTION_COUNT_OPTIONS = [3, 5, 10, 15, 20, 25] as const

// Validation Constants
export const VALIDATION_RULES = {
  MIN_QUESTIONS: 3,
  MAX_QUESTIONS: 25,
  MIN_TOPIC_LENGTH: 3,
  MAX_TOPIC_LENGTH: 200,
  MIN_SUBJECT_LENGTH: 2,
  MAX_SUBJECT_LENGTH: 100
} as const

// Common Types
export type DifficultyLevel = typeof DIFFICULTY_LEVELS[number]['value']
export type QuestionType = typeof QUESTION_TYPES[number]['value']
export type LanguageCode = typeof SUPPORTED_LANGUAGES[number]['code']
export type SubjectCategory = typeof QUIZ_SUBJECTS[number]

// Base form data interface (for consistency)
export interface BaseQuizFormData {
  topic: string
  subject: string
  questionCount: number
  difficulty: DifficultyLevel
  language: LanguageCode
  questionTypes: string[] // Use string[] for flexibility with API
  focusArea?: string
}

// Enhanced form data (extends base)
export interface EnhancedQuizFormData extends BaseQuizFormData {
  category: string
  customSystemPrompt: string
  customInstructions: string
  teachingStyle: string
  focusAreas: string[]
  includeExamples: boolean
  realWorldApplications: boolean
  complexityLevel: string
  assessmentType: string
  quizLanguage: LanguageCode
  explanationLanguage: LanguageCode
  includeTranslations: boolean
  includeDebugInfo: boolean
}
