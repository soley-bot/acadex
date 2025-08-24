// Enhanced types for different question types with specific properties

export interface BaseQuestionData {
  id: string
  quiz_id: string
  question: string
  explanation?: string | null
  order_index: number
  points: number
  difficulty_level: 'easy' | 'medium' | 'hard'
  image_url?: string | null
  audio_url?: string | null
  video_url?: string | null
}

// Multiple Choice specific data
export interface MultipleChoiceData extends BaseQuestionData {
  question_type: 'multiple_choice'
  options: string[]
  correct_answer: number
  allow_multiple: boolean
  shuffle_options: boolean
}

// Single Choice specific data  
export interface SingleChoiceData extends BaseQuestionData {
  question_type: 'single_choice'
  options: string[]
  correct_answer: number
  shuffle_options: boolean
}

// True/False specific data
export interface TrueFalseData extends BaseQuestionData {
  question_type: 'true_false'
  correct_answer: boolean
}

// Fill in the Blank specific data
export interface FillBlankData extends BaseQuestionData {
  question_type: 'fill_blank'
  text_with_blanks: string
  correct_answers: string[]
  case_sensitive: boolean
  allow_partial_credit: boolean
}

// Essay specific data
export interface EssayData extends BaseQuestionData {
  question_type: 'essay'
  min_words?: number
  max_words?: number
  rubric_criteria?: RubricCriterion[]
  auto_grade: boolean
}

// Matching specific data
export interface MatchingData extends BaseQuestionData {
  question_type: 'matching'
  left_column: MatchingItem[]
  right_column: MatchingItem[]
  correct_pairs: MatchingPair[]
  shuffle_options: boolean
}

// Ordering specific data
export interface OrderingData extends BaseQuestionData {
  question_type: 'ordering'
  items: OrderingItem[]
  correct_order: number[]
  allow_partial_credit: boolean
}

// Supporting interfaces
export interface RubricCriterion {
  id: string
  criterion: string
  max_points: number
  description: string
}

export interface MatchingItem {
  id: string
  content: string
  media_url?: string
}

export interface MatchingPair {
  left_id: string
  right_id: string
}

export interface OrderingItem {
  id: string
  content: string
  correct_position: number
  media_url?: string
}

// Union type for all question data
export type QuestionData = 
  | MultipleChoiceData
  | SingleChoiceData
  | TrueFalseData
  | FillBlankData
  | EssayData
  | MatchingData
  | OrderingData

// Props for admin editors
export interface QuestionEditorProps<T extends QuestionData> {
  question: T
  onChange: (updatedQuestion: Partial<T>) => void
  onRemove: () => void
  isValid: boolean
  errors: Record<string, string>
}

// Props for student renderers
export interface QuestionRendererProps<T extends QuestionData> {
  question: T
  userAnswer?: any
  onAnswerChange: (answer: any) => void
  isSubmitted: boolean
  showCorrectAnswer: boolean
  isReview: boolean
}
