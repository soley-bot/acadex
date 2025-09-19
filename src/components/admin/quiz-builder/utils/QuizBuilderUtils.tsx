import React from 'react'
import { Alert, Text, Button, Stack } from '@mantine/core'
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
        <Alert 
          icon={<IconAlertTriangle size={16} />} 
          color="red" 
          variant="filled"
          style={{ margin: '20px' }}
        >
          <Stack gap="md">
            <div>
              <Text size="lg" fw={600} mb="xs">
                Quiz Builder Error
              </Text>
              <Text size="sm">
                Something went wrong while building your quiz. This is usually a temporary issue.
              </Text>
            </div>
            
            {this.state.error && (
              <Text size="xs" c="red.1" style={{ fontFamily: 'monospace' }}>
                {this.state.error.message}
              </Text>
            )}
            
            <Button
              variant="white"
              leftSection={<IconRefresh size={16} />}
              onClick={this.handleRetry}
              size="sm"
            >
              Try Again
            </Button>
          </Stack>
        </Alert>
      )
    }

    return this.props.children
  }
}

// Loading fallback component
export const QuizBuilderLoadingFallback = ({ message = "Loading..." }: { message?: string }) => (
  <div style={{ 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: '40px 20px',
    minHeight: '200px'
  }}>
    <Stack align="center" gap="md">
      <div style={{
        width: '32px',
        height: '32px',
        border: '3px solid #e0e7ff',
        borderTop: '3px solid #3b82f6',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <Text size="sm" c="dimmed">{message}</Text>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </Stack>
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