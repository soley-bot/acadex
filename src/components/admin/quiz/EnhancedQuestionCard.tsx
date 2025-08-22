import React from 'react'
import { 
  GripVertical, 
  ChevronDown, 
  ChevronRight, 
  AlertCircle, 
  Copy, 
  Trash2, 
  Eye,
  MoreVertical,
  Clock,
  Target
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { QuestionTypeIndicator, QuestionComplexityBadge, QUESTION_TYPE_COLORS, QUESTION_TYPE_INFO } from './QuestionTypeIndicators'
import { FEATURE_FLAGS } from '@/lib/featureFlags'
import type { QuestionType } from '@/lib/supabase'

interface Question {
  id?: string
  question: string
  question_type: QuestionType
  options: string[] | any[]
  correct_answer: any
  explanation?: string
  points?: number
  difficulty_level?: string
  media_type?: 'image' | 'audio' | 'video'
  media_url?: string
}

interface EnhancedQuestionCardProps {
  question: Question
  questionIndex: number
  isExpanded: boolean
  hasErrors: boolean
  errors: Array<{ questionIndex: number; field: string; message: string }>
  isDragging?: boolean
  onToggleExpanded: () => void
  onDuplicate: () => void
  onDelete: () => void
  onPreview?: () => void
  dragHandleProps?: any
  children: React.ReactNode
}

export function EnhancedQuestionCard({
  question,
  questionIndex,
  isExpanded,
  hasErrors,
  errors,
  isDragging = false,
  onToggleExpanded,
  onDuplicate,
  onDelete,
  onPreview,
  dragHandleProps,
  children
}: EnhancedQuestionCardProps) {
  const colors = QUESTION_TYPE_COLORS[question.question_type]
  const questionErrors = errors.filter(e => e.questionIndex === questionIndex)
  
  // Progressive disclosure: only show full details when expanded
  const shouldShowDetails = FEATURE_FLAGS.PROGRESSIVE_DISCLOSURE ? isExpanded : true
  
  return (
    <Card 
      variant={FEATURE_FLAGS.ENHANCED_QUESTION_CARDS ? "interactive" : "base"}
      className={`
        transition-all duration-200 
        ${isDragging ? 'rotate-2 shadow-lg scale-105' : ''}
        ${hasErrors ? 'border-destructive/30 bg-destructive/5' : ''}
        ${FEATURE_FLAGS.ENHANCED_QUESTION_CARDS && isExpanded ? colors.border + ' ' + colors.bg : ''}
        ${FEATURE_FLAGS.ENHANCED_QUESTION_CARDS ? 'hover:shadow-md' : ''}
      `}
    >
      {/* Enhanced Question Header */}
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Drag Handle */}
            <div
              {...dragHandleProps}
              className="cursor-grab hover:cursor-grabbing flex-shrink-0"
            >
              <GripVertical className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </div>

            {/* Question Number & Type Indicator */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="flex items-center justify-center w-7 h-7 bg-primary text-white text-sm font-semibold rounded-full">
                  {questionIndex + 1}
                </span>
                
                {FEATURE_FLAGS.QUESTION_TYPE_INDICATORS && (
                  <QuestionTypeIndicator 
                    questionType={question.question_type} 
                    size="sm"
                  />
                )}
              </div>

              {/* Question Preview */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-gray-900 truncate">
                    {question.question.slice(0, 60) || `Question ${questionIndex + 1}`}
                    {question.question.length > 60 && '...'}
                  </h4>
                  
                  {hasErrors && (
                    <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                  )}
                </div>
                
                {/* Enhanced Question Metadata */}
                {FEATURE_FLAGS.ENHANCED_QUESTION_CARDS && (
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      <span>{question.points || 1} pts</span>
                    </div>
                    
                    {question.difficulty_level && (
                      <QuestionComplexityBadge questionType={question.question_type} />
                    )}
                    
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>~{QUESTION_TYPE_INFO[question.question_type]?.estimatedTime || '30s'}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Question Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {FEATURE_FLAGS.QUICK_EDIT_MODE && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={onDuplicate}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                  title="Duplicate question"
                >
                  <Copy className="h-4 w-4" />
                </button>
                
                {onPreview && (
                  <button
                    type="button"
                    onClick={onPreview}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                    title="Preview question"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                )}
                
                <button
                  type="button"
                  onClick={onDelete}
                  className="p-1.5 text-gray-400 hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                  title="Delete question"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Expand/Collapse Toggle */}
            {FEATURE_FLAGS.PROGRESSIVE_DISCLOSURE && (
              <button
                type="button"
                onClick={onToggleExpanded}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                title={isExpanded ? 'Collapse question' : 'Expand question'}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Error Messages */}
        {hasErrors && questionErrors.length > 0 && (
          <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-destructive mb-1">
                  Please fix the following issues:
                </p>
                <ul className="text-sm text-destructive/80 space-y-1">
                  {questionErrors.map((error, index) => (
                    <li key={index} className="flex items-start gap-1">
                      <span className="text-xs">•</span>
                      <span>{error.message}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardHeader>

      {/* Question Content - Progressive Disclosure */}
      {shouldShowDetails && (
        <CardContent className="pt-0">
          {children}
        </CardContent>
      )}
      
      {/* Collapsed State Preview */}
      {FEATURE_FLAGS.PROGRESSIVE_DISCLOSURE && !isExpanded && (
        <CardContent className="pt-0 pb-4">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-4">
              <span>
                {question.options?.length ? `${question.options.length} options` : 'Text input'}
              </span>
              {question.explanation && (
                <span>Has explanation</span>
              )}
              {question.media_url && (
                <span className="capitalize">{question.media_type} attached</span>
              )}
            </div>
            <span className="text-xs">Click to expand</span>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

// Re-export the type info for use in other components
export { QUESTION_TYPE_INFO } from './QuestionTypeIndicators'
