/**
 * Unified Quiz Constants
 * Consolidates quiz-constants.ts and quizConstants.ts into single source
 */

// ==============================================
// CORE DIFFICULTY LEVELS (unified)
// ==============================================

export const quizDifficulties = [
  'beginner',
  'intermediate', 
  'advanced'
] as const

export const DIFFICULTY_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' }
] as const

export type QuizDifficulty = typeof quizDifficulties[number]
export type DifficultyLevel = typeof DIFFICULTY_LEVELS[number]['value']

// ==============================================
// ENGLISH LEARNING PLATFORM CATEGORIES
// ==============================================

export const quizCategories = [
  'Grammar',
  'Vocabulary', 
  'Pronunciation',
  'Speaking',
  'Listening',
  'Reading',
  'Writing',
  'Business English',
  'Test Preparation',
  'Literature',
  'Conversation',
  'Other'
] as const

export const quizCategoryInfo = {
  'Grammar': {
    label: 'Grammar',
    description: 'English grammar rules, structures, and usage',
    icon: '📝'
  },
  'Vocabulary': {
    label: 'Vocabulary',
    description: 'Word meanings, synonyms, and language expansion',
    icon: '📚'
  },
  'Pronunciation': {
    label: 'Pronunciation',
    description: 'Speaking and phonetic practice',
    icon: '🗣️'
  },
  'Speaking': {
    label: 'Speaking',
    description: 'Oral communication and fluency',
    icon: '🎙️'
  },
  'Listening': {
    label: 'Listening',
    description: 'Audio comprehension and understanding',
    icon: '👂'
  },
  'Reading': {
    label: 'Reading',
    description: 'Text comprehension and analysis',
    icon: '📖'
  },
  'Writing': {
    label: 'Writing',
    description: 'Written composition and expression',
    icon: '✍️'
  },
  'Business English': {
    label: 'Business English',
    description: 'Professional communication and workplace language',
    icon: '💼'
  },
  'Test Preparation': {
    label: 'Test Preparation',
    description: 'IELTS, TOEFL, and other English proficiency tests',
    icon: '🎯'
  },
  'Literature': {
    label: 'Literature',
    description: 'English literature and literary analysis',
    icon: '📜'
  },
  'Conversation': {
    label: 'Conversation',
    description: 'Everyday communication and dialogue practice',
    icon: '💬'
  },
  'Other': {
    label: 'Other',
    description: 'Miscellaneous English learning topics',
    icon: '🌟'
  }
} as const

export type QuizCategory = typeof quizCategories[number]

export function getCategoryInfo(category: string) {
  return quizCategoryInfo[category as QuizCategory] || quizCategoryInfo['Other']
}

// ==============================================
// AI QUIZ GENERATOR CONSTANTS
// ==============================================

// Supported Languages
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

// Subject Categories
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

// Question Types
export const QUESTION_TYPES = [
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'true_false', label: 'True/False' },
  { value: 'fill_in_the_blank', label: 'Fill in the Blank' },
  { value: 'short_answer', label: 'Short Answer' },
  { value: 'essay', label: 'Essay' },
  { value: 'matching', label: 'Matching' },
  { value: 'ordering', label: 'Ordering' }
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

// ==============================================
// TYPES
// ==============================================

export type QuestionType = typeof QUESTION_TYPES[number]['value']
export type LanguageCode = typeof SUPPORTED_LANGUAGES[number]['code']
export type SubjectCategory = typeof QUIZ_SUBJECTS[number]

// Form data interfaces
export interface BaseQuizFormData {
  topic: string
  subject: string
  questionCount: number
  difficulty: DifficultyLevel
  language: LanguageCode
  questionTypes: string[]
  focusArea?: string
}

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