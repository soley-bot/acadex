// Quiz category constants - aligned with English learning platform
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

// Map quiz categories to display names with descriptions
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

// Difficulty levels for quizzes
export const quizDifficulties = [
  'beginner',
  'intermediate', 
  'advanced'
] as const

export type QuizDifficulty = typeof quizDifficulties[number]

// Helper function to get category info
export function getCategoryInfo(category: string) {
  return quizCategoryInfo[category as QuizCategory] || quizCategoryInfo['Other']
}
