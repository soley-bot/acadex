// Question Templates System Types
export interface QuestionTemplate {
  id: string
  title: string
  description?: string
  category: string
  question_type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'essay' | 'matching' | 'ordering'
  difficulty_level: 'easy' | 'medium' | 'hard'
  template_data: TemplateData
  language: string
  subject_area?: string
  tags: string[]
  usage_count: number
  is_featured: boolean
  is_active: boolean
  created_by?: string
  is_public: boolean
  created_at: string
  updated_at: string
}

// Template data structure - can be any valid question data
export interface TemplateData {
  question: string
  points?: number
  time_limit?: number | null
  explanation?: string
  
  // Multiple choice specific
  options?: string[]
  correct_answer?: number | boolean
  randomize_options?: boolean
  partial_credit?: boolean
  
  // Fill blank specific
  correct_answers?: string[]
  case_sensitive?: boolean
  
  // Essay specific
  sample_answer?: string
  word_limit?: number
  rubric?: Array<{ criteria: string; points: number }>
  
  // Matching specific
  pairs?: Array<{ left: string; right: string }>
  
  // True/False specific - uses correct_answer: boolean
  
  // Additional fields for flexibility
  [key: string]: any
}

// API Response types
export interface TemplatesResponse {
  success: boolean
  data: QuestionTemplate
  message?: string
}

export interface PaginatedTemplatesResponse {
  success: boolean
  data: QuestionTemplate[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  message?: string
}

// Template creation request
export interface CreateTemplateRequest {
  title: string
  description?: string
  category: string
  question_type: QuestionTemplate['question_type']
  difficulty_level: QuestionTemplate['difficulty_level']
  template_data: TemplateData
  language?: string
  subject_area?: string
  tags: string[]
  is_public?: boolean
}

export interface UpdateTemplateRequest extends Partial<CreateTemplateRequest> {
  id: string
}

// Template search and filtering
export interface TemplateFilters {
  category?: string
  question_type?: string
  difficulty_level?: string
  language?: string
  subject_area?: string
  tags?: string[]
  is_featured?: boolean
  search_query?: string
  created_by?: string
  is_public?: boolean
}

// Template usage tracking
export interface TemplateUsage {
  template_id: string
  used_by: string
  used_at: string
  quiz_id?: string
  question_id?: string
}

// Template application result
export interface AppliedTemplate {
  question: string
  question_type: string
  options?: string[]
  correct_answer?: any
  correct_answer_text?: string
  explanation?: string
  difficulty_level: string
  points: number
  template_id: string
  template_variables: Record<string, any>
}

// Popular templates response
export interface PopularTemplatesResponse {
  templates: Array<{
    id: string
    title: string
    description?: string
    category: string
    question_type: string
    difficulty_level: string
    usage_count: number
    is_featured: boolean
  }>
  total: number
}

// Template categories with metadata
export interface TemplateCategory {
  id: string
  name: string
  description: string
  icon: string
  color: string
  template_count: number
  difficulty_distribution: {
    easy: number
    medium: number
    hard: number
  }
}

// Template validation result
export interface TemplateValidation {
  is_valid: boolean
  errors: string[]
  warnings: string[]
  suggestions: string[]
}

// Template variable types for dynamic content
export interface TemplateVariable {
  name: string
  type: 'string' | 'number' | 'array' | 'boolean' | 'object'
  description: string
  required: boolean
  default_value?: any
  validation_pattern?: string
  options?: any[] // For dropdown/select variables
}

// Template preview for UI
export interface TemplatePreview {
  template_id: string
  rendered_question: string
  rendered_options?: string[]
  rendered_explanation?: string
  sample_variables: Record<string, any>
  estimated_difficulty: string
}

// Batch template operations
export interface BatchTemplateOperation {
  action: 'activate' | 'deactivate' | 'delete' | 'feature' | 'unfeature' | 'duplicate'
  template_ids: string[]
  parameters?: Record<string, any>
}

// Bulk template operations for API
export interface BulkTemplateRequest {
  template_ids: string[]
  action: 'delete' | 'update' | 'toggle_public' | 'toggle_featured'
  data?: {
    is_public?: boolean
    is_featured?: boolean
    category?: string
    difficulty_level?: string
    tags?: string[]
    [key: string]: any
  }
}

// Template export format
export interface TemplateExport {
  templates: QuestionTemplate[]
  metadata: {
    exported_at: string
    exported_by: string
    total_templates: number
    categories: string[]
    languages: string[]
  }
  version: string
}

// Template import result
export interface TemplateImportResult {
  success: boolean
  imported_count: number
  skipped_count: number
  error_count: number
  errors: Array<{
    template_title: string
    error_message: string
  }>
  warnings: string[]
}