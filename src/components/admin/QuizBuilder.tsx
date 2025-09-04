import React, { memo, useCallback, useMemo, Suspense, lazy } from 'react'
import { X, AlertTriangle, CheckCircle, Target } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { usePerformanceMonitor } from '@/hooks/usePerformanceOptimization'
import {
  LazyComponentWrapper,
  LazyComponentErrorBoundary,
  StepLoadingFallback
} from './quiz-builder/ProgressiveLoading'
import type { Quiz, QuizQuestion } from '@/lib/supabase'
import { FrontendQuizData } from '@/lib/simple-ai-quiz-generator'

// Lazy load heavy step components for better performance
const LazyQuizSettingsStep = lazy(() => 
  import('./quiz-builder/steps/QuizSettingsStep').then(module => ({
    default: module.QuizSettingsStep
  }))
)

const LazyEnhancedAIStep = lazy(() => 
  import('./quiz-builder/EnhancedAIStep').then(module => ({
    default: module.EnhancedAIStep
  }))
)

const LazyQuestionEditorFactory = lazy(() => 
  import('./quiz/QuestionEditorFactory').then(module => ({
    default: module.QuestionEditorFactory
  }))
)

const LazyQuizPreviewStep = lazy(() => 
  import('./quiz-builder/steps/QuizPreviewStep').then(module => ({
    default: module.QuizPreviewStep
  }))
)

interface QuizBuilderProps {
  quiz?: Quiz | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  prefilledData?: any // Compatibility with QuizForm interface
}

// Simplified Quiz Builder State
interface QuizBuilderState {
  currentStep: 'settings' | 'ai-configuration' | 'quiz-editing' | 'review'
  quiz: Partial<Quiz>
  questions: QuizQuestion[]
  aiConfig: {
    enabled: boolean
    language: string
    difficulty: string
    questionCount: number
    topics: string[]
    customPrompt: string
  }
  isGenerating: boolean
  isSaving: boolean
  isPublishing: boolean
}

// Initial state
const initialState: QuizBuilderState = {
  currentStep: 'settings',
  quiz: { title: '', description: '', duration_minutes: 10, time_limit_minutes: null },
  questions: [],
  aiConfig: {
    enabled: false,
    language: 'english',
    difficulty: 'intermediate',
    questionCount: 5,
    topics: [],
    customPrompt: ''
  },
  isGenerating: false,
  isSaving: false,
  isPublishing: false
}

// Simple step indicator component
const SimpleStepIndicator = memo<{
  currentStep: string
  onStepClick: (step: string) => void
}>(({ currentStep, onStepClick }) => {
  const steps = [
    { id: 'settings', label: 'Quiz Settings' },
    { id: 'ai-configuration', label: 'AI Configuration' },
    { id: 'quiz-editing', label: 'Edit Questions' },
    { id: 'review', label: 'Review & Publish' }
  ]

  return (
    <div className="flex space-x-4">
      {steps.map((step, index) => (
        <button
          key={step.id}
          onClick={() => onStepClick(step.id)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            currentStep === step.id
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <span className="text-sm font-medium">{index + 1}</span>
          <span>{step.label}</span>
        </button>
      ))}
    </div>
  )
})

SimpleStepIndicator.displayName = 'SimpleStepIndicator'

// Performance-optimized Error Boundary
class QuizBuilderErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('QuizBuilder Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="font-medium">Quiz Builder Error</h3>
            </div>
            <p className="text-red-600 mt-2">
              An error occurred while loading the quiz builder. Please refresh the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Refresh Page
            </button>
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}

// Quiz Settings Component
const QuizSettings = memo<{
  quiz: Partial<Quiz>
  onUpdate: (updates: Partial<Quiz>) => void
}>(({ quiz, onUpdate }) => {
  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ title: e.target.value })
  }, [onUpdate])

  const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({ description: e.target.value })
  }, [onUpdate])

  const handleTimeLimitChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ time_limit_minutes: parseInt(e.target.value) || null })
  }, [onUpdate])

  const handleDurationChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newDuration = parseInt(e.target.value) || 10
    console.log('Duration changed:', newDuration)
    onUpdate({ duration_minutes: newDuration })
  }, [onUpdate])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Target className="h-5 w-5 text-primary" />
          <span>Quiz Settings</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quiz Title *
          </label>
          <input
            type="text"
            value={quiz.title || ''}
            onChange={handleTitleChange}
            placeholder="Enter quiz title"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={quiz.description || ''}
            onChange={handleDescriptionChange}
            placeholder="Enter quiz description"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            📝 Expected Duration (minutes) *
          </label>
          <input
            type="number"
            min="1"
            max="300"
            value={quiz.duration_minutes || 10}
            onChange={handleDurationChange}
            placeholder="10"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            💡 <strong>Estimated time</strong> students need to complete this quiz (shown to students before they start)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ⏰ Time Limit (minutes) - Optional
          </label>
          <input
            type="number"
            min="1"
            max="600"
            value={quiz.time_limit_minutes || ''}
            onChange={handleTimeLimitChange}
            placeholder="Leave empty for no time limit"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            🚨 <strong>Hard deadline</strong> - Quiz auto-submits when time expires. Leave empty for unlimited time.
          </p>
          {quiz.time_limit_minutes && quiz.duration_minutes && quiz.time_limit_minutes < quiz.duration_minutes && (
            <p className="text-xs text-red-600 mt-1 font-medium">
              ⚠️ Warning: Time limit is shorter than expected duration!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
})

QuizSettings.displayName = 'QuizSettings'

// Quiz Questions Component
const QuizQuestions = memo<{
  questions: QuizQuestion[]
  onUpdate: (index: number, updates: Partial<QuizQuestion>) => void
  onAdd: () => void
  onDuplicate: (index: number) => void
  onRemove: (index: number) => void
}>(({ questions, onUpdate, onAdd, onDuplicate, onRemove }) => {
  const questionsWithValidation = useMemo(() => {
    return questions.map((question: QuizQuestion, index: number) => {
      const errors: string[] = []
      if (!question.question.trim()) errors.push('Question text is required')
      if (question.question_type === 'multiple_choice' && (!question.options || question.options.length < 2)) {
        errors.push('At least 2 options required for multiple choice')
      }
      if (question.question_type === 'multiple_choice' && (question.correct_answer === null || question.correct_answer === undefined)) {
        errors.push('Correct answer must be selected')
      }
      
      return { question, errors, index }
    })
  }, [questions])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          Quiz Questions ({questions.length})
        </h3>
        <button
          onClick={onAdd}
          className="bg-primary hover:bg-secondary text-white hover:text-black px-4 py-2 rounded-lg transition-colors"
        >
          Add Question
        </button>
      </div>

      {questionsWithValidation.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Target className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Questions Yet</h3>
            <p className="text-gray-600 mb-4">
              Start building your quiz by adding your first question
            </p>
            <button
              onClick={onAdd}
              className="bg-primary hover:bg-secondary text-white hover:text-black px-4 py-2 rounded-lg transition-colors"
            >
              Add First Question
            </button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {questionsWithValidation.map(({ question, errors, index }) => (
            <Suspense key={question.id || `question-${index}`} fallback={<StepLoadingFallback step="quiz-editing" />}>
              <LazyQuestionEditorFactory
                question={question}
                onChange={(updates) => onUpdate(index, updates)}
                onRemove={() => onRemove(index)}
                isValid={Object.keys(errors).length === 0}
                errors={errors}
              />
            </Suspense>
          ))}
        </div>
      )}
    </div>
  )
})

QuizQuestions.displayName = 'QuizQuestions'

// Quiz Summary Component
const QuizSummary = memo<{
  quiz: Partial<Quiz>
  questions: QuizQuestion[]
  onSave: () => void
  onPublish: () => void
  isSaving: boolean
  isPublishing: boolean
}>(({ quiz, questions, onSave, onPublish, isSaving, isPublishing }) => {
  const summaryStats = useMemo(() => {
    const totalQuestions = questions.length
    const totalPoints = questions.reduce((sum: number, q: QuizQuestion) => sum + (q.points || 1), 0)
    const estimatedTime = Math.ceil(totalQuestions * 1.5) // 1.5 minutes per question estimate
    
    const validQuestions = questions.filter((q: QuizQuestion) => {
      if (!q.question.trim()) return false
      if (q.question_type === 'multiple_choice') {
        return q.options && q.options.length >= 2 && q.correct_answer !== null
      }
      return true
    }).length

    return {
      totalQuestions,
      validQuestions,
      totalPoints,
      estimatedTime,
      isValid: validQuestions === totalQuestions && totalQuestions > 0 && (quiz.title?.trim() || false)
    }
  }, [questions, quiz.title])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-primary" />
          <span>Quiz Summary</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-primary">{summaryStats.totalQuestions}</div>
            <div className="text-sm text-gray-600">Total Questions</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{summaryStats.validQuestions}</div>
            <div className="text-sm text-gray-600">Valid Questions</div>
          </div>
          
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{summaryStats.totalPoints}</div>
            <div className="text-sm text-gray-600">Total Points</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{summaryStats.estimatedTime}m</div>
            <div className="text-sm text-gray-600">Est. Time</div>
          </div>
        </div>

        <div className={`p-4 rounded-lg border ${
          summaryStats.isValid 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center space-x-2">
            {summaryStats.isValid ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-600" />
            )}
            <span className={`font-medium ${
              summaryStats.isValid ? 'text-green-800' : 'text-red-800'
            }`}>
              {summaryStats.isValid ? 'Quiz Ready to Publish' : 'Quiz Needs Attention'}
            </span>
          </div>
          
          {!summaryStats.isValid && (
            <ul className="mt-2 text-sm text-red-700 space-y-1">
              {!quiz.title?.trim() && <li>• Quiz title is required</li>}
              {summaryStats.totalQuestions === 0 && <li>• At least one question is required</li>}
              {summaryStats.validQuestions !== summaryStats.totalQuestions && 
                <li>• {summaryStats.totalQuestions - summaryStats.validQuestions} question(s) need to be completed</li>
              }
            </ul>
          )}
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onSave}
            disabled={isSaving}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Draft'}
          </button>
          
          <button
            onClick={onPublish}
            disabled={!summaryStats.isValid || isPublishing}
            className="flex-1 bg-primary hover:bg-secondary text-white hover:text-black px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPublishing ? 'Publishing...' : 'Publish Quiz'}
          </button>
        </div>
      </CardContent>
    </Card>
  )
})

QuizSummary.displayName = 'QuizSummary'

// Main QuizBuilder Component
export const QuizBuilder = memo<QuizBuilderProps>(({ quiz, isOpen, onClose, onSuccess, prefilledData }) => {
  const [state, setState] = React.useState<QuizBuilderState>(() => ({
    ...initialState,
    quiz: quiz ? { 
      // Only copy valid quiz table fields, exclude 'questions' and other non-table fields
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      category: quiz.category,
      difficulty: quiz.difficulty || 'intermediate',
      duration_minutes: quiz.duration_minutes ?? 10,
      total_questions: quiz.total_questions || 0,
      course_id: quiz.course_id,
      lesson_id: quiz.lesson_id,
      passing_score: quiz.passing_score || 70,
      max_attempts: quiz.max_attempts || 3,
      time_limit_minutes: quiz.time_limit_minutes,
      image_url: quiz.image_url,
      is_published: quiz.is_published || false,
      created_at: quiz.created_at,
      updated_at: quiz.updated_at
    } : initialState.quiz,
    // IMPORTANT: Initialize questions from quiz prop if editing existing quiz
    questions: quiz && (quiz as any).questions ? (quiz as any).questions : []
  }))

  // Performance monitoring
  const { metrics } = usePerformanceMonitor({
    componentName: 'QuizBuilder',
    threshold: 32,
    logSlowRenders: process.env.NODE_ENV === 'development'
  })

  // Update state when quiz prop changes (for async loading)
  React.useEffect(() => {
    if (quiz) {
      console.log('QuizBuilder: Updating from quiz prop', {
        quizId: quiz.id,
        hasQuestions: !!(quiz as any).questions
      })
      setState(prev => ({
        ...prev,
        quiz: {
          // Only copy valid quiz table fields, exclude 'questions' and other non-table fields
          id: quiz.id,
          title: quiz.title,
          description: quiz.description,
          category: quiz.category,
          difficulty: quiz.difficulty || 'intermediate',
          duration_minutes: quiz.duration_minutes ?? 10,
          total_questions: quiz.total_questions || 0,
          course_id: quiz.course_id,
          lesson_id: quiz.lesson_id,
          passing_score: quiz.passing_score || 70,
          max_attempts: quiz.max_attempts || 3,
          time_limit_minutes: quiz.time_limit_minutes,
          image_url: quiz.image_url,
          is_published: quiz.is_published || false,
          created_at: quiz.created_at,
          updated_at: quiz.updated_at
        },
        questions: (quiz as any).questions ? (quiz as any).questions : prev.questions
      }))
    }
  }, [quiz])

  // Handlers
  const handleStepChange = useCallback((step: string) => {
    setState(prev => ({ ...prev, currentStep: step as any }))
  }, [])

  const handleQuizUpdate = useCallback((updates: Partial<Quiz>) => {
    setState(prev => ({ ...prev, quiz: { ...prev.quiz, ...updates } }))
  }, [])

  const handleAIConfigUpdate = useCallback((config: any) => {
    setState(prev => ({ ...prev, aiConfig: config }))
  }, [])

  const handleQuestionUpdate = useCallback((index: number, updates: Partial<QuizQuestion>) => {
    setState(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => i === index ? { ...q, ...updates } : q)
    }))
  }, [])

  const handleAddQuestion = useCallback(() => {
    const newQuestion: QuizQuestion = {
      id: `temp-${Date.now()}`,
      quiz_id: 'temp',
      question: '',
      question_type: 'multiple_choice',
      options: ['', ''],
      correct_answer: 0,
      explanation: '',
      order_index: state.questions.length,
      points: 1,
      difficulty_level: 'medium'
    }
    setState(prev => ({ ...prev, questions: [...prev.questions, newQuestion] }))
  }, [state.questions.length])

  const handleDuplicateQuestion = useCallback((index: number) => {
    const questionToDuplicate = state.questions[index]
    if (!questionToDuplicate) return
    
    const duplicatedQuestion: QuizQuestion = { 
      ...questionToDuplicate, 
      id: `temp-${Date.now()}`,
      quiz_id: questionToDuplicate.quiz_id || 'temp',
      question: questionToDuplicate.question || 'New Question',
      order_index: index + 1
    }
    setState(prev => ({
      ...prev,
      questions: [...prev.questions.slice(0, index + 1), duplicatedQuestion, ...prev.questions.slice(index + 1)]
    }))
  }, [state.questions])

  const handleRemoveQuestion = useCallback((index: number) => {
    setState(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }))
  }, [])

  const handleGenerateQuestions = useCallback(async () => {
    setState(prev => ({ ...prev, isGenerating: true }))
    
    try {
      // Use our consolidated AI generation API
      const response = await fetch('/api/simple-ai-generation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: state.aiConfig.customPrompt || state.quiz.title || 'General Knowledge',
          subject: state.quiz.category || 'General Knowledge',
          questionCount: state.aiConfig.questionCount || 5,
          difficulty: state.aiConfig.difficulty || 'intermediate',
          questionTypes: ['multiple_choice', 'true_false', 'fill_blank'], // Default question types
          language: state.aiConfig.language || 'english',
          explanationLanguage: state.aiConfig.language || 'english'
        })
      })

      const result = await response.json()

      if (result.success && result.quiz && result.quiz.questions) {
        // Convert AI generated questions to quiz builder format
        const generatedQuestions = result.quiz.questions.map((q: any, index: number) => ({
          id: `generated_${Date.now()}_${index}`,
          question: q.question,
          question_type: q.question_type,
          options: q.options || [],
          correct_answer: q.correct_answer,
          correct_answer_text: q.correct_answer_text,
          explanation: q.explanation,
          points: q.points || 1,
          order_index: index,
          difficulty_level: q.difficulty_level || 'medium',
          time_limit_seconds: q.time_limit_seconds,
          tags: q.tags || []
        }))

        // Add generated questions to the quiz
        setState(prev => ({
          ...prev,
          questions: [...prev.questions, ...generatedQuestions],
          isGenerating: false
        }))
      } else {
        console.error('AI generation failed:', result.error)
        setState(prev => ({ ...prev, isGenerating: false }))
        // You could add error notification here
      }
    } catch (error) {
      console.error('AI generation error:', error)
      setState(prev => ({ ...prev, isGenerating: false }))
      // You could add error notification here
    }
  }, [state.aiConfig, state.quiz])

  // Handle full quiz generation from enhanced AI system
  const handleAIQuizGenerated = useCallback((generatedQuiz: FrontendQuizData) => {
    try {
      // Update quiz metadata
      setState(prev => ({
        ...prev,
        quiz: {
          ...prev.quiz,
          title: generatedQuiz.title,
          description: generatedQuiz.description,
          category: generatedQuiz.category,
          difficulty: generatedQuiz.difficulty,
          duration_minutes: generatedQuiz.duration_minutes,
          passing_score: generatedQuiz.passing_score,
          max_attempts: generatedQuiz.max_attempts
        },
        questions: generatedQuiz.questions.map((q, index) => ({
          id: q.id || `generated_${Date.now()}_${index}`,
          quiz_id: prev.quiz.id || 'temp_quiz_id', // Temporary ID for new quizzes
          question: q.question,
          question_type: q.question_type as 'multiple_choice' | 'single_choice' | 'true_false' | 'fill_blank' | 'essay' | 'matching' | 'ordering',
          options: q.options || [],
          correct_answer: typeof q.correct_answer === 'number' ? q.correct_answer : 0,
          correct_answer_text: q.correct_answer_text,
          explanation: q.explanation,
          points: q.points || 1,
          order_index: q.order_index || index,
          difficulty_level: (q.difficulty_level as 'easy' | 'medium' | 'hard') || 'medium'
        })),
        currentStep: 'quiz-editing', // Move to editing step
        isGenerating: false
      }))
    } catch (error) {
      console.error('Error processing AI generated quiz:', error)
      setState(prev => ({ ...prev, isGenerating: false }))
    }
  }, [])

  const handleSave = useCallback(async () => {
    setState(prev => ({ ...prev, isSaving: true }))

    try {
      // Get current session for authentication
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Authentication required')
      }

      // Prepare quiz data for API - only include valid quiz table columns
      const quizData = {
        title: state.quiz.title,
        description: state.quiz.description,
        category: state.quiz.category,
        difficulty: state.quiz.difficulty,
        duration_minutes: state.quiz.duration_minutes,
        total_questions: state.questions.length,
        course_id: state.quiz.course_id,
        lesson_id: state.quiz.lesson_id,
        passing_score: state.quiz.passing_score,
        max_attempts: state.quiz.max_attempts,
        time_limit_minutes: state.quiz.time_limit_minutes,
        image_url: state.quiz.image_url,
        is_published: state.quiz.is_published
        // Exclude any extra fields like 'questions' that don't belong in the quizzes table
      }

      // Debug: Log what we're sending
      console.log('Sending quiz data:', quizData)
      console.log('Duration in state:', state.quiz.duration_minutes)
      console.log('Full state.quiz:', state.quiz)

      let response: Response
      let result: any

      if (quiz?.id) {
        // Update existing quiz
        response = await fetch(`/api/admin/quizzes/${quiz.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          credentials: 'include',
          body: JSON.stringify(quizData)
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to update quiz')
        }

        result = await response.json()
        console.log('Quiz updated successfully:', result)
      } else {
        // Create new quiz
        response = await fetch('/api/admin/quizzes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          credentials: 'include',
          body: JSON.stringify(quizData)
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to create quiz')
        }

        result = await response.json()
        console.log('Quiz created successfully:', result)
      }

      // Now save the questions
      const quizId = result.quiz?.id || quiz?.id
      if (quizId && state.questions.length > 0) {
        console.log('Saving questions for quiz:', quizId)
        
        // Prepare questions data
        const questionsData = state.questions.map((q, index) => ({
          quiz_id: quizId,
          question: q.question,
          question_type: q.question_type,
          options: q.options || [],
          correct_answer: q.correct_answer,
          correct_answer_text: q.correct_answer_text,
          explanation: q.explanation,
          order_index: index,
          points: q.points || 1,
          difficulty_level: q.difficulty_level || 'medium'
        }))

        // Save questions via API
        const questionsResponse = await fetch(`/api/admin/quizzes/${quizId}/questions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          credentials: 'include',
          body: JSON.stringify({ questions: questionsData })
        })

        if (!questionsResponse.ok) {
          const errorData = await questionsResponse.json()
          throw new Error(errorData.error || 'Failed to save questions')
        }

        const questionsResult = await questionsResponse.json()
        console.log('Questions saved successfully:', questionsResult)
      }

      // Call onSuccess to notify parent component
      onSuccess()

    } catch (error: any) {
      console.error('Save failed:', error)
      // You might want to show an error toast here
      alert(`Save failed: ${error.message}`)
    } finally {
      setState(prev => ({ ...prev, isSaving: false }))
    }
  }, [state.quiz, state.questions, quiz?.id, onSuccess])

  const handlePublish = useCallback(() => {
    setState(prev => ({ ...prev, isPublishing: true }))
    // Simulate publishing
    setTimeout(() => {
      setState(prev => ({ ...prev, isPublishing: false }))
      onSuccess()
    }, 1000)
  }, [onSuccess])

  // Render current step content with progressive loading
  const renderCurrentStep = useMemo(() => {
    switch (state.currentStep) {
      case 'settings':
        return (
          <LazyComponentErrorBoundary step="settings">
            <Suspense fallback={<StepLoadingFallback step="settings" />}>
              <LazyQuizSettingsStep
                quiz={state.quiz}
                onQuizUpdate={handleQuizUpdate}
                isValid={true}
                errors={[]}
              />
            </Suspense>
          </LazyComponentErrorBoundary>
        )

      case 'ai-configuration':
        return (
          <LazyComponentErrorBoundary step="ai-configuration">
            <Suspense fallback={<StepLoadingFallback step="ai-configuration" />}>
              <LazyEnhancedAIStep
                isGenerating={state.isGenerating}
                aiConfig={state.aiConfig}
                onConfigChange={handleAIConfigUpdate}
                onGenerate={handleGenerateQuestions}
                onAIQuizGenerated={handleAIQuizGenerated}
              />
            </Suspense>
          </LazyComponentErrorBoundary>
        )

      case 'quiz-editing':
        return (
          <LazyComponentErrorBoundary step="quiz-editing">
            <Suspense fallback={<StepLoadingFallback step="quiz-editing" />}>
              <QuizQuestions
                questions={state.questions}
                onUpdate={handleQuestionUpdate}
                onAdd={handleAddQuestion}
                onDuplicate={handleDuplicateQuestion}
                onRemove={handleRemoveQuestion}
              />
            </Suspense>
          </LazyComponentErrorBoundary>
        )

      case 'review':
        return (
          <LazyComponentErrorBoundary step="review">
            <Suspense fallback={<StepLoadingFallback step="review" />}>
              <LazyQuizPreviewStep
                quiz={state.quiz}
                questions={state.questions}
                onSave={handleSave}
                onPublish={handlePublish}
                isSaving={state.isSaving}
                isPublishing={state.isPublishing}
              />
            </Suspense>
          </LazyComponentErrorBoundary>
        )

      default:
        return (
          <LazyComponentErrorBoundary step="settings">
            <Suspense fallback={<StepLoadingFallback step="settings" />}>
              <LazyQuizSettingsStep
                quiz={state.quiz}
                onQuizUpdate={handleQuizUpdate}
                isValid={true}
                errors={[]}
              />
            </Suspense>
          </LazyComponentErrorBoundary>
        )
    }
  }, [
    state.currentStep,
    state.isGenerating,
    state.aiConfig,
    state.questions,
    state.quiz,
    state.isSaving,
    state.isPublishing,
    handleAIConfigUpdate,
    handleGenerateQuestions,
    handleAIQuizGenerated,
    handleQuestionUpdate,
    handleAddQuestion,
    handleDuplicateQuestion,
    handleRemoveQuestion,
    handleSave,
    handlePublish,
    handleQuizUpdate
  ])

  if (!isOpen) return null

  return (
    <QuizBuilderErrorBoundary>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Quiz Builder</h2>
              <p className="text-gray-600 mt-1">Create and manage your quiz content</p>
              {process.env.NODE_ENV === 'development' && (
                <span className="text-xs text-gray-500">
                  Renders: {metrics.renderCount} | Avg: {metrics.averageRenderTime.toFixed(2)}ms
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Step Navigation */}
          <div className="px-6 py-4 border-b border-gray-200">
            <SimpleStepIndicator
              currentStep={state.currentStep}
              onStepClick={handleStepChange}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-auto p-6">
            {renderCurrentStep}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {state.questions.length} question{state.questions.length !== 1 ? 's' : ''} • 
                {state.questions.reduce((sum: number, q: QuizQuestion) => sum + (q.points || 1), 0)} total points
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                
                <button
                  onClick={handleSave}
                  disabled={state.isSaving}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {state.isSaving ? 'Saving...' : 'Save Draft'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </QuizBuilderErrorBoundary>
  )
})

QuizBuilder.displayName = 'QuizBuilder'
