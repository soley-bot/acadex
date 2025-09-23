import React from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { IconAlertTriangle, IconRefresh } from '@tabler/icons-react'

// Type guard functions for safe casting
export const isValidQuestionType = (type: any): type is 'multiple_choice' | 'single_choice' | 'true_false' | 'fill_blank' | 'essay' | 'matching' | 'ordering' => {
  return [
    'multiple_choice', 
    'single_choice', 
    'true_false', 
    'fill_blank', 
    'essay', 
    'matching', 
    'ordering'
  ].includes(type)
}

export const isValidQuiz = (quiz: any): boolean => {
  return quiz && 
         typeof quiz.title === 'string' && 
         quiz.title.trim().length > 0 &&
         typeof quiz.duration_minutes === 'number' &&
         quiz.duration_minutes > 0
}

export const isValidQuestion = (question: any): boolean => {
  if (!question || !question.question || !question.question.trim()) {
    return false
  }

  if (!isValidQuestionType(question.question_type)) {
    return false
  }

  // Validate based on question type
  switch (question.question_type) {
    case 'multiple_choice':
    case 'single_choice':
      return question.options && 
             Array.isArray(question.options) && 
             question.options.length >= 2 &&
             question.correct_answer !== null &&
             question.correct_answer !== undefined
    
    case 'true_false':
      return question.correct_answer === true || question.correct_answer === false
    
    case 'fill_blank':
    case 'essay':
      return typeof question.correct_answer === 'string' && 
             question.correct_answer.trim().length > 0
    
    case 'matching':
      return question.pairs && 
             Array.isArray(question.pairs) && 
             question.pairs.length >= 2
    
    case 'ordering':
      return question.items && 
             Array.isArray(question.items) && 
             question.items.length >= 2
    
    default:
      return false
  }
}

// Quiz validation utilities
export const validateQuizData = (quiz: any, questions: any[]) => {
  const errors: string[] = []
  
  if (!quiz.title?.trim()) {
    errors.push('Quiz title is required')
  }
  
  if (!quiz.duration_minutes || quiz.duration_minutes <= 0) {
    errors.push('Duration must be greater than 0 minutes')
  }
  
  if (questions.length === 0) {
    errors.push('At least one question is required')
  }
  
  const invalidQuestions = questions.filter(q => !isValidQuestion(q))
  if (invalidQuestions.length > 0) {
    errors.push(`${invalidQuestions.length} question(s) are invalid or incomplete`)
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Enhanced quiz statistics calculation with validation
export const calculateQuizStats = (quiz: any, questions: any[]) => {
  const totalQuestions = questions.length
  const totalPoints = questions.reduce((sum: number, q: any) => sum + (q.points || 1), 0)
  const estimatedTime = Math.ceil(totalQuestions * 1.5) // 1.5 minutes per question estimate
  
  const validQuestions = questions.filter((q: any) => {
    if (!q.question?.trim()) return false
    if (q.question_type === 'multiple_choice') {
      return q.options && q.options.length >= 2 && q.correct_answer !== null
    }
    if (q.question_type === 'true_false') {
      return q.correct_answer !== null && q.correct_answer !== undefined
    }
    if (q.question_type === 'single_choice') {
      return q.options && q.options.length >= 2
    }
    return true
  }).length

  const completionRate = totalQuestions > 0 ? (validQuestions / totalQuestions) * 100 : 0
  
  // Question type breakdown
  const questionTypes = questions.reduce((acc: Record<string, number>, q: any) => {
    const type = q.question_type || 'multiple_choice'
    acc[type] = (acc[type] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const isValid = validQuestions === totalQuestions && 
                 totalQuestions > 0 && 
                 Boolean(quiz.title?.trim())

  return {
    totalQuestions,
    validQuestions,
    totalPoints,
    estimatedTime,
    completionRate,
    questionTypes,
    isValid
  }
}

// Error Boundary Component for QuizBuilder
interface QuizBuilderErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

export class QuizBuilderErrorBoundary extends React.Component<
  { 
    children: React.ReactNode
    onRetry?: () => void
  },
  QuizBuilderErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; onRetry?: () => void }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): QuizBuilderErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 QuizBuilder Error Boundary caught an error:', error, errorInfo)
    this.setState({ error, errorInfo })
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
    this.props.onRetry?.()
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert className="m-5">
          <IconAlertTriangle size={16} />
          <AlertDescription className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">
                Quiz Builder Error
              </h3>
              <p className="text-sm text-muted-foreground">
                Something went wrong while building your quiz. This is usually a temporary issue.
              </p>
            </div>
            
            {this.state.error && (
              <p className="text-xs text-red-600 font-mono">
                {this.state.error.message}
              </p>
            )}
            
            <Button
              variant="outline"
              onClick={this.handleRetry}
              size="sm"
              className="mt-4"
            >
              <IconRefresh size={16} className="mr-2" />
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      )
    }

    return this.props.children
  }
}

// Loading fallback component
export const QuizBuilderLoadingFallback = ({ message = "Loading..." }: { message?: string }) => (
  <div className="flex items-center justify-center p-10 min-h-[200px]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-8 h-8 border-3 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  </div>
)

// Question type utilities
export const getQuestionTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    'multiple_choice': 'Multiple Choice',
    'single_choice': 'Single Choice', 
    'true_false': 'True/False',
    'fill_blank': 'Fill in the Blank',
    'essay': 'Essay',
    'matching': 'Matching',
    'ordering': 'Ordering'
  }
  
  return labels[type] || type
}

export const getQuestionTypeIcon = (type: string): string => {
  const icons: Record<string, string> = {
    'multiple_choice': '☑️',
    'single_choice': '🔘', 
    'true_false': '✅',
    'fill_blank': '📝',
    'essay': '✍️',
    'matching': '🔗',
    'ordering': '📋'
  }
  
  return icons[type] || '❓'
}

// Quiz statistics utilities
export const calculateQuizStatistics = (questions: any[]) => {
  const totalQuestions = questions.length
  const validQuestions = questions.filter(isValidQuestion).length
  const totalPoints = questions.reduce((sum, q) => sum + (q.points || 1), 0)
  const estimatedTime = Math.ceil(totalQuestions * 1.5)
  
  const questionTypeStats = questions.reduce((acc, q) => {
    const type = q.question_type || 'unknown'
    acc[type] = (acc[type] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  return {
    totalQuestions,
    validQuestions,
    invalidQuestions: totalQuestions - validQuestions,
    totalPoints,
    estimatedTime,
    completionRate: totalQuestions > 0 ? (validQuestions / totalQuestions) * 100 : 0,
    questionTypeStats
  }
}