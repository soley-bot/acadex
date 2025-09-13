import React, { memo, useCallback, useMemo, Suspense, lazy, useState, useEffect, useRef } from 'react'
import { X, AlertTriangle, CheckCircle, Target, Plus, ChevronDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { useFeatureFlag } from '@/lib/featureFlags'
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

const LazyEnhancedQuestionCreation = lazy(() => 
  import('./EnhancedQuestionCreation').then(module => ({
    default: module.EnhancedQuestionCreation
  }))
)

// Template functionality temporarily disabled
// const LazyTemplateLibrary = lazy(() => 
//   import('./TemplateLibrary').then(module => ({
//     default: module.TemplateLibrary
//   }))
// )

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
    language: 'english' | 'khmer'
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    questionCount: number
    questionTypes: string[] // Add question types to interface
    topic: string // Add topic field
    subject: string // Add subject field
    customPrompt: string
  }
  isGenerating: boolean
  isSaving: boolean
  isPublishing: boolean
  error: string | null
}

// AI Configuration Step Component
const AIConfigurationStep = React.memo<{
  aiConfig: QuizBuilderState['aiConfig']
  onConfigUpdate: (updates: Partial<QuizBuilderState['aiConfig']>) => void
  onGenerateQuestions: () => void
  isGenerating: boolean
}>(({ aiConfig, onConfigUpdate, onGenerateQuestions, isGenerating }) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Configuration</h2>
        <p className="text-gray-600">Configure your AI quiz generation settings</p>
      </div>

      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-purple-900 flex items-center gap-2">
            🤖 AI Generation Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Topic */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Topic *
              </label>
              <input
                type="text"
                value={aiConfig.topic}
                onChange={(e) => onConfigUpdate({ topic: e.target.value })}
                placeholder="e.g., Business English, Grammar, Reading Comprehension"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <input
                type="text"
                value={aiConfig.subject}
                onChange={(e) => onConfigUpdate({ subject: e.target.value })}
                placeholder="e.g., English, Mathematics, Science"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Question Count */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Question Count
              </label>
              <select
                value={aiConfig.questionCount}
                onChange={(e) => onConfigUpdate({ questionCount: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              >
                <option value={3}>3 questions</option>
                <option value={5}>5 questions</option>
                <option value={8}>8 questions</option>
                <option value={10}>10 questions</option>
                <option value={15}>15 questions</option>
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty
              </label>
              <select
                value={aiConfig.difficulty}
                onChange={(e) => onConfigUpdate({ difficulty: e.target.value as 'beginner' | 'intermediate' | 'advanced' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Language
              </label>
              <select
                value={aiConfig.language}
                onChange={(e) => onConfigUpdate({ language: e.target.value as 'english' | 'khmer' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              >
                <option value="english">English</option>
                <option value="khmer">Khmer</option>
              </select>
            </div>
          </div>

          {/* Question Types */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question Types to Generate
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { type: 'multiple_choice', label: 'Multiple Choice', icon: '☑️' },
                { type: 'true_false', label: 'True/False', icon: '✓' },
                { type: 'fill_blank', label: 'Fill in Blank', icon: '📝' },
                { type: 'essay', label: 'Essay', icon: '📄' }
              ].map(({ type, label, icon }) => (
                <button
                  key={type}
                  onClick={() => {
                    const currentTypes = aiConfig.questionTypes || ['multiple_choice']
                    const newTypes = currentTypes.includes(type)
                      ? currentTypes.filter((t: string) => t !== type)
                      : [...currentTypes, type]
                    onConfigUpdate({ questionTypes: newTypes })
                  }}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors flex items-center gap-2 ${
                    aiConfig.questionTypes.includes(type)
                      ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                  }`}
                >
                  <span>{icon}</span>
                  {label}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Select one or more question types. At least one type must be selected.
            </p>
          </div>

          {/* Custom Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Custom Instructions (Optional)
            </label>
            <textarea
              value={aiConfig.customPrompt}
              onChange={(e) => onConfigUpdate({ customPrompt: e.target.value })}
              placeholder="e.g., Focus on business scenarios, include academic vocabulary, test specific skills..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm resize-none"
            />
          </div>

          {/* Generate Button */}
          <div className="flex justify-center pt-4">
            <button
              onClick={() => {
                const validTypes = aiConfig.questionTypes.filter((type: string) => type.trim())
                if (validTypes.length === 0) {
                  alert('Please select at least one question type before generating.')
                  return
                }
                if (!aiConfig.topic.trim()) {
                  alert('Please enter a topic before generating questions.')
                  return
                }
                onGenerateQuestions()
              }}
              disabled={isGenerating}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  Generating Questions...
                </>
              ) : (
                <>
                  <span>🚀</span>
                  Generate AI Questions
                </>
              )}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
})

AIConfigurationStep.displayName = 'AIConfigurationStep'

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
    questionTypes: ['multiple_choice'], // Default to only multiple choice
    topic: '',
    subject: '',
    customPrompt: ''
  },
  isGenerating: false,
  isSaving: false,
  isPublishing: false,
  error: null
}

// Simple question type dropdown - replaces modal
const QuestionTypeDropdown = memo<{ 
  onCreateQuestion: (type: string, templateData?: any) => void 
}>(({ onCreateQuestion }) => {
  const [isOpen, setIsOpen] = useState(false)
  // Template functionality temporarily disabled
  // const [showTemplates, setShowTemplates] = useState(false)
  const templatesEnabled = useFeatureFlag('QUESTION_TEMPLATES')
  
  const questionTypes = [
    { type: 'multiple_choice', label: 'Multiple Choice (Single Answer)', icon: '☑️' },
    { type: 'true_false', label: 'True/False', icon: '✓' },
    { type: 'fill_blank', label: 'Fill in the Blank', icon: '📝' },
    { type: 'essay', label: 'Essay Question', icon: '📄' },
    { type: 'matching', label: 'Matching', icon: '🔗' },
    { type: 'ordering', label: 'Ordering', icon: '🔢' }
  ]

  const handleSelect = (type: string) => {
    onCreateQuestion(type)
    setIsOpen(false)
  }

  // Template handlers temporarily disabled
  // const handleTemplateSelect = () => {
  //   setShowTemplates(true)
  //   setIsOpen(false)
  // }

  // const handleTemplateUse = (template: any) => {
  //   onCreateQuestion(template.question_type, template.template_data)
  //   setShowTemplates(false)
  // }

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-primary hover:bg-secondary text-white hover:text-black px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Question
          <ChevronDown className="h-4 w-4" />
        </button>
        
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute top-full left-0 mt-1 w-72 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto">
              <div className="py-1">
                {templatesEnabled && (
                  <>
                    {/* Template option temporarily disabled */}
                    <div className="border-b border-gray-100 mb-1">
                      <div className="px-4 py-2 text-xs text-gray-500 uppercase tracking-wide">
                        Create Question
                      </div>
                    </div>
                  </>
                )}
                {questionTypes.map(({ type, label, icon }) => (
                  <button
                    key={type}
                    onClick={() => handleSelect(type)}
                    className="w-full px-4 py-3 text-left flex items-center gap-3 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-lg">{icon}</span>
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Template functionality temporarily disabled */}
      {/* 
      {showTemplates && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">Select Template</h3>
                  <p className="text-sm text-gray-600 mt-1">Pick a template to get started quickly</p>
                </div>
                <button
                  onClick={() => setShowTemplates(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <Suspense fallback={<div className="text-center py-8">Loading templates...</div>}>
                <LazyTemplateLibrary
                  onSelectTemplate={handleTemplateUse}
                  showCreateButton={false}
                  compactView={true}
                />
              </Suspense>
            </div>
          </div>
        </div>
      )}
      */}
    </>
  )
})
QuestionTypeDropdown.displayName = 'QuestionTypeDropdown'

// Enhanced question creation wrapper with feature flag
const QuestionCreationInterface = memo<{
  onCreateQuestion: (type: string, data?: any) => void
  quizData?: Partial<Quiz>
  existingQuestions: QuizQuestion[]
}>(({ onCreateQuestion, quizData, existingQuestions }) => {
  const [showEnhancedCreation, setShowEnhancedCreation] = useState(false)
  const enhancedQuestionCreationEnabled = useFeatureFlag('ENHANCED_QUESTION_CREATION')

  const handleCreateQuestion = useCallback((type: string, data?: any) => {
    if (data) {
      // Enhanced creation with additional data
      onCreateQuestion(type, data)
    } else {
      // Standard creation
      onCreateQuestion(type)
    }
    setShowEnhancedCreation(false)
  }, [onCreateQuestion])

  // Use enhanced creation if feature flag is enabled
  if (enhancedQuestionCreationEnabled) {
    return (
      <>
        <button
          onClick={() => setShowEnhancedCreation(true)}
          className="bg-primary hover:bg-secondary text-white hover:text-black px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create Question
          <ChevronDown className="h-4 w-4" />
        </button>

        {showEnhancedCreation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-auto">
              <Suspense fallback={<StepLoadingFallback step="quiz-editing" />}>
                <LazyEnhancedQuestionCreation
                  topic={quizData?.title || ''}
                  category={quizData?.category || ''}
                  difficulty={quizData?.difficulty as any || 'intermediate'}
                  existingQuestions={existingQuestions}
                  onCreateQuestion={handleCreateQuestion}
                  onClose={() => setShowEnhancedCreation(false)}
                />
              </Suspense>
            </div>
          </div>
        )}
      </>
    )
  }

  // Fallback to original dropdown
  return <QuestionTypeDropdown onCreateQuestion={onCreateQuestion} />
})
QuestionCreationInterface.displayName = 'QuestionCreationInterface'

// Modern step indicator component
const SimpleStepIndicator = memo<{
  currentStep: string
  onStepClick: (step: string) => void
}>(({ currentStep, onStepClick }) => {
  const steps = [
    { id: 'settings', label: 'Settings', icon: '⚙️' },
    { id: 'ai-configuration', label: 'AI Config', icon: '🤖' },
    { id: 'quiz-editing', label: 'Questions', icon: '📝' },
    { id: 'review', label: 'Review', icon: '✅' }
  ]

  const currentIndex = steps.findIndex(step => step.id === currentStep)

  return (
    <div className="flex items-center justify-center">
      <div className="flex items-center space-x-2">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <button
              onClick={() => onStepClick(step.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                currentStep === step.id
                  ? 'bg-primary text-white shadow-sm'
                  : index < currentIndex
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              <span className="text-sm">{step.icon}</span>
              <span className="text-sm font-medium">{step.label}</span>
              {index < currentIndex && (
                <CheckCircle className="h-4 w-4 text-green-600" />
              )}
            </button>
            {index < steps.length - 1 && (
              <div className={`w-8 h-0.5 ${index < currentIndex ? 'bg-green-300' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        ))}
      </div>
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
  onAdd: (questionType: string) => void
  onDuplicate: (index: number) => void
  onRemove: (index: number) => void
  onGenerateAI?: () => void
  isGenerating?: boolean
  aiConfig?: any
  onAIConfigChange?: (config: any) => void
  quizData?: Partial<Quiz>
}>(({ questions, onUpdate, onAdd, onDuplicate, onRemove, onGenerateAI, isGenerating, aiConfig, onAIConfigChange, quizData }) => {
  const questionsWithValidation = useMemo(() => {
    return questions.map((question: QuizQuestion, index: number) => {
      const errors: string[] = []
      
      // Basic validation
      if (!question.question.trim()) errors.push('Question text is required')
      
      // Type-specific validation
      switch (question.question_type) {
        case 'multiple_choice':
        case 'single_choice':
          if (!question.options || question.options.length < 2) {
            errors.push('At least 2 options required for multiple choice')
          }
          if (question.correct_answer === null || question.correct_answer === undefined) {
            errors.push('Correct answer must be selected')
          }
          break
          
        case 'true_false':
          if (question.correct_answer === null || question.correct_answer === undefined) {
            errors.push('Please select True or False as the correct answer')
          }
          break
          
        case 'fill_blank':
          if (!question.correct_answer_text || question.correct_answer_text.toString().trim() === '') {
            errors.push('Correct answer is required for fill in the blank')
          }
          break
          
        case 'essay':
          // Essay questions only need question text (no specific validation)
          break
          
        case 'matching':
        case 'ordering':
          if (!question.options || question.options.length < 2) {
            errors.push('At least 2 options required')
          }
          break
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
        <div className="flex items-center gap-3">
          {onGenerateAI && (
            <button
              onClick={() => {
                const validTypes = (aiConfig?.questionTypes || ['multiple_choice']).filter((type: string) => type.trim())
                if (validTypes.length === 0) {
                  alert('Please select at least one question type before generating.')
                  return
                }
                onGenerateAI()
              }}
              disabled={isGenerating}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-2.5 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  🚀 Generate with AI
                </>
              )}
            </button>
          )}
          <QuestionCreationInterface 
            onCreateQuestion={onAdd} 
            quizData={quizData}
            existingQuestions={questions}
          />
        </div>
      </div>

      {/* AI Configuration Panel - Always Visible */}
      {onGenerateAI && (
        <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-purple-900 flex items-center gap-2">
              🤖 AI Generation Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Question Count */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question Count
                </label>
                <select
                  value={aiConfig?.questionCount || 5}
                  onChange={(e) => onAIConfigChange?.({ ...aiConfig, questionCount: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                >
                  <option value={3}>3 questions</option>
                  <option value={5}>5 questions</option>
                  <option value={8}>8 questions</option>
                  <option value={10}>10 questions</option>
                  <option value={15}>15 questions</option>
                </select>
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Difficulty
                </label>
                <select
                  value={aiConfig?.difficulty || 'intermediate'}
                  onChange={(e) => onAIConfigChange?.({ ...aiConfig, difficulty: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              {/* Language */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Language
                </label>
                <select
                  value={aiConfig?.language || 'english'}
                  onChange={(e) => onAIConfigChange?.({ ...aiConfig, language: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                >
                  <option value="english">English</option>
                  <option value="khmer">Khmer</option>
                  <option value="french">French</option>
                  <option value="spanish">Spanish</option>
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject Area
                </label>
                <input
                  type="text"
                  value={aiConfig?.subject || ''}
                  onChange={(e) => onAIConfigChange?.({ ...aiConfig, subject: e.target.value })}
                  placeholder="e.g., Business English, Mathematics"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            {/* Question Types */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Types to Generate
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { type: 'multiple_choice', label: 'Multiple Choice', icon: '☑️' },
                  { type: 'true_false', label: 'True/False', icon: '✓' },
                  { type: 'fill_blank', label: 'Fill in Blank', icon: '📝' },
                  { type: 'essay', label: 'Essay', icon: '📄' }
                ].map(({ type, label, icon }) => (
                  <button
                    key={type}
                    onClick={() => {
                      const currentTypes = aiConfig?.questionTypes || ['multiple_choice']
                      const newTypes = currentTypes.includes(type)
                        ? currentTypes.filter((t: string) => t !== type)
                        : [...currentTypes, type]
                      onAIConfigChange?.({ ...aiConfig, questionTypes: newTypes })
                    }}
                    className={`px-3 py-2 text-sm rounded-lg border transition-colors flex items-center gap-2 ${
                      (aiConfig?.questionTypes || ['multiple_choice']).includes(type)
                        ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                    }`}
                  >
                    <span>{icon}</span>
                    {label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Select one or more question types. At least one type must be selected.
              </p>
            </div>

            {/* Custom Instructions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custom Instructions (Optional)
              </label>
              <textarea
                value={aiConfig?.customPrompt || ''}
                onChange={(e) => onAIConfigChange?.({ ...aiConfig, customPrompt: e.target.value })}
                placeholder="e.g., Focus on IELTS task 1 topics, include business scenarios, use academic vocabulary..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm resize-none"
              />
            </div>
          </CardContent>
        </Card>
      )}

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
            <QuestionCreationInterface 
              onCreateQuestion={onAdd} 
              quizData={quizData}
              existingQuestions={questions}
            />
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

// Type guard functions for safe casting
const isValidQuestionType = (type: any): type is 'multiple_choice' | 'single_choice' | 'true_false' | 'fill_blank' | 'essay' | 'matching' | 'ordering' => {
  return ['multiple_choice', 'single_choice', 'true_false', 'fill_blank', 'essay', 'matching', 'ordering'].includes(type)
}

const isValidDifficultyLevel = (level: any): level is 'easy' | 'medium' | 'hard' => {
  return ['easy', 'medium', 'hard'].includes(level)
}

// Main QuizBuilder Component
export const QuizBuilder = memo<QuizBuilderProps>(({ quiz, isOpen, onClose, onSuccess, prefilledData }) => {
  const [state, setState] = React.useState<QuizBuilderState>(() => ({
    ...initialState,
    // If editing existing quiz, start on quiz-editing step
    currentStep: quiz ? 'quiz-editing' : 'settings',
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
      time_limit_minutes: quiz.time_limit_minutes ?? null, // Consistent null handling
      image_url: quiz.image_url,
      is_published: quiz.is_published || false,
      created_at: quiz.created_at,
      updated_at: quiz.updated_at
    } : initialState.quiz,
    // IMPORTANT: Initialize questions from quiz prop if editing existing quiz
    questions: quiz && (quiz as any).questions ? (quiz as any).questions : []
  }))

  // Auto-save functionality with debouncing
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>()
  const saveLockRef = useRef<Promise<any> | null>(null) // Prevent concurrent saves
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setIsDirty(false)
      setLastSaved(null)
      setIsSaving(false)
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [isOpen])

  // Debounced auto-save function with save conflict protection
  const debouncedSave = useCallback(async (stateToSave: QuizBuilderState) => {
    if (!stateToSave.quiz.id || stateToSave.questions.length === 0) {
      return
    }

    // Wait for any existing save operation to complete
    if (saveLockRef.current) {
      await saveLockRef.current
    }

    // Get current session for authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) {
      return
    }

    // Create save promise and store it
    const savePromise = performSave(stateToSave)
    saveLockRef.current = savePromise
    
    try {
      await savePromise
    } finally {
      saveLockRef.current = null
    }
  }, [])

  // Extracted save logic to avoid duplication
  const performSave = async (stateToSave: QuizBuilderState) => {
    setIsSaving(true)
    try {
      // Get session inside the function
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('No authentication session')
      }

      const questionsData = stateToSave.questions.map((q, index) => ({
        id: q.id,
        quiz_id: stateToSave.quiz.id,
        question: q.question,
        question_type: q.question_type,
        options: q.options || [],
        correct_answer: q.correct_answer,
        correct_answer_text: q.correct_answer_text,
        explanation: q.explanation,
        order_index: q.order_index !== undefined ? q.order_index : index, // Preserve existing order
        points: q.points || 1,
        difficulty_level: q.difficulty_level || 'medium'
      }))

      const response = await fetch(`/api/admin/quizzes/${stateToSave.quiz.id}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        credentials: 'include',
        body: JSON.stringify({ questions: questionsData })
      })

      if (response.ok) {
        setLastSaved(new Date())
        setIsDirty(false)
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Auto-save failed:', errorData)
      }
    } catch (error) {
      console.error('Auto-save failed:', error)
    } finally {
      setIsSaving(false)
    }
  }

  // Auto-save effect when questions change
  useEffect(() => {
    if (!isDirty) return

    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }

    // Set new timeout for auto-save (2 seconds of inactivity)
    autoSaveTimeoutRef.current = setTimeout(() => {
      debouncedSave(state)
    }, 2000)

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [state, isDirty, debouncedSave])

  // Mark as dirty when state changes (only after user interactions)
  useEffect(() => {
    // Only mark dirty if:
    // 1. We have an existing quiz ID (not creating new)
    // 2. We have questions 
    // 3. The modal has been open for a bit (to avoid immediate auto-save on load)
    if (state.questions.length > 0 && state.quiz.id && isOpen) {
      // Add a small delay to avoid marking dirty immediately on load
      const timeoutId = setTimeout(() => {
        setIsDirty(true)
      }, 1000) // 1 second delay before marking as dirty

      return () => clearTimeout(timeoutId)
    }
  }, [state.questions, state.quiz, isOpen])

  // Track if we've fetched questions for this quiz to prevent duplicate fetches
  const fetchedQuizRef = React.useRef<string | null>(null)

  // Separate function to fetch questions (memoized to prevent unnecessary re-renders)
  const fetchQuestionsForQuiz = React.useCallback(async (quizId: string) => {
    try {
      setState(prev => ({ ...prev, isGenerating: true }))
      
      // Get session for authentication
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setState(prev => ({ ...prev, isGenerating: false }))
        return
      }

      // Fetch quiz with questions using the edit API endpoint
      const response = await fetch(`/api/admin/quizzes/${quizId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        credentials: 'include'
      })

      if (!response.ok) {
        const errorData = await response.json()
        setState(prev => ({ ...prev, isGenerating: false }))
        return
      }

      const result = await response.json()

      // Update state with fetched questions
      setState(prev => ({
        ...prev,
        questions: result.questions || [],
        isGenerating: false
      }))

    } catch (error) {
      console.error('❌ QuizBuilder: Error fetching questions:', error)
      setState(prev => ({ ...prev, isGenerating: false }))
    }
  }, [])

  // Update state when quiz prop changes (for async loading)
  React.useEffect(() => {
    if (quiz) {
      console.log('🔄 QuizBuilder useEffect: Updating from quiz prop', {
        quizId: quiz.id,
        title: quiz.title,
        hasQuestions: !!(quiz as any).questions,
        questionsCount: (quiz as any).questions ? (quiz as any).questions.length : 0,
        questionsData: (quiz as any).questions ? (quiz as any).questions.slice(0, 1) : []
      })
      
      setState(prev => {
        const newState = {
          ...prev,
          // Set to quiz-editing step when editing existing quiz
          currentStep: 'quiz-editing' as const,
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
        }
        
        return newState
      })

      // Fetch questions if needed (only once per quiz)
      if (quiz.id && !(quiz as any).questions && fetchedQuizRef.current !== quiz.id) {
        fetchedQuizRef.current = quiz.id
        fetchQuestionsForQuiz(quiz.id)
      }
    }
  }, [quiz, fetchQuestionsForQuiz])

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

  const handleAddQuestion = useCallback((questionType: string, enhancedData?: any) => {
    const newQuestion: QuizQuestion = {
      id: `temp-${Date.now()}`,
      quiz_id: quiz?.id || '',
      question: enhancedData?.question || '',
      question_type: questionType as any,
      options: enhancedData?.options || (questionType === 'multiple_choice' ? ['', ''] : undefined),
      correct_answer: enhancedData?.correct_answer ?? (questionType === 'multiple_choice' ? 0 : 
                     questionType === 'true_false' ? true : '') as any,
      explanation: enhancedData?.explanation || '',
      order_index: state.questions.length,
      points: 1,
      difficulty_level: enhancedData?.difficulty_level || 'medium',
      image_url: null,
      audio_url: null,
      video_url: null
    }
    
    setState(prev => ({ 
      ...prev, 
      questions: [...prev.questions, newQuestion]
    }))
  }, [quiz?.id, state.questions.length])

  const handleQuestionTypeSelect = useCallback((questionType: string) => {
    const newQuestion: QuizQuestion = {
      id: `temp-${Date.now()}`,
      quiz_id: 'temp',
      question: '',
      question_type: questionType as any,
      options: questionType === 'multiple_choice' || questionType === 'single_choice' ? ['', ''] : [],
      correct_answer: 0, // Always use 0 as default for all question types
      explanation: '',
      order_index: state.questions.length,
      points: 1,
      difficulty_level: 'medium'
    }
    setState(prev => ({ 
      ...prev, 
      questions: [...prev.questions, newQuestion]
    }))
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
          topic: state.aiConfig.topic || 'General Knowledge',
          subject: state.aiConfig.subject || 'General Knowledge', 
          questionCount: state.aiConfig.questionCount || 5,
          difficulty: state.aiConfig.difficulty || 'intermediate',
          questionTypes: state.aiConfig.questionTypes || ['multiple_choice'],
          language: state.aiConfig.language || 'english',
          explanationLanguage: state.aiConfig.language || 'english',
          customPrompt: state.aiConfig.customPrompt
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

        // Add generated questions to the quiz and move to next step
        setState(prev => ({
          ...prev,
          questions: [...prev.questions, ...generatedQuestions],
          isGenerating: false,
          currentStep: 'quiz-editing', // Auto-advance to quiz editing
          // Auto-fill quiz settings based on AI config
          quiz: {
            ...prev.quiz,
            title: prev.quiz.title || `${state.aiConfig.topic} Quiz`,
            description: prev.quiz.description || `A ${state.aiConfig.difficulty} level quiz about ${state.aiConfig.topic}${state.aiConfig.subject ? ` in ${state.aiConfig.subject}` : ''}.`,
            category: prev.quiz.category || state.aiConfig.subject || 'General',
            difficulty: state.aiConfig.difficulty,
            duration_minutes: Math.max(generatedQuestions.length * 2, 10), // 2 minutes per question, minimum 10
          }
        }))
      } else {
        console.error('AI generation failed:', result.error)
        setState(prev => ({ 
          ...prev, 
          isGenerating: false,
          error: result.error || 'AI generation failed. Please try again.'
        }))
      }
    } catch (error) {
      console.error('AI generation error:', error)
      const errorMessage = error instanceof Error ? error.message : 'AI generation failed. Please try again.'
      setState(prev => ({ 
        ...prev, 
        isGenerating: false,
        error: errorMessage
      }))
    }
  }, [state.aiConfig])

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
          id: q.id || `generated_${crypto.randomUUID()}`,
          quiz_id: prev.quiz.id || 'temp_quiz_id', // Temporary ID for new quizzes
          question: q.question,
          question_type: isValidQuestionType(q.question_type) ? q.question_type : 'multiple_choice',
          options: q.options || [],
          correct_answer: typeof q.correct_answer === 'number' ? q.correct_answer : 0,
          correct_answer_text: q.correct_answer_text,
          explanation: q.explanation,
          points: q.points || 1,
          order_index: q.order_index || index,
          difficulty_level: isValidDifficultyLevel(q.difficulty_level) ? q.difficulty_level : 'medium'
        })),
        currentStep: 'quiz-editing', // Move to editing step
        isGenerating: false
      }))
    } catch (error) {
      console.error('Error processing AI generated quiz:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to process AI generated quiz. Please try again.'
      setState(prev => ({ 
        ...prev, 
        isGenerating: false,
        error: errorMessage
      }))
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
      }

      // Now save the questions
      const quizId = result.quiz?.id || quiz?.id
      if (quizId && state.questions.length > 0) {
        
        // Prepare questions data
        const questionsData = state.questions.map((q, index) => ({
          quiz_id: quizId,
          question: q.question,
          question_type: q.question_type,
          options: q.options || [],
          correct_answer: q.correct_answer,
          correct_answer_text: q.correct_answer_text,
          explanation: q.explanation,
          order_index: q.order_index !== undefined ? q.order_index : index, // Preserve existing order
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
          console.error('Quiz questions save failed:', errorData)
          throw new Error(
            errorData.details 
              ? `Failed to save questions: ${errorData.details}` 
              : errorData.error || 'Failed to save questions'
          )
        }

        const questionsResult = await questionsResponse.json()
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
              <AIConfigurationStep
                aiConfig={state.aiConfig}
                onConfigUpdate={(updates) => setState(prev => ({
                  ...prev,
                  aiConfig: { ...prev.aiConfig, ...updates }
                }))}
                onGenerateQuestions={handleGenerateQuestions}
                isGenerating={state.isGenerating}
              />
            </Suspense>
          </LazyComponentErrorBoundary>
        )

      case 'quiz-editing':
        return (
          <div className="space-y-6">
            <LazyComponentErrorBoundary step="quiz-editing">
              <Suspense fallback={<StepLoadingFallback step="quiz-editing" />}>
                <QuizQuestions
                  questions={state.questions}
                  onUpdate={handleQuestionUpdate}
                  onAdd={handleAddQuestion}
                  onDuplicate={handleDuplicateQuestion}
                  onRemove={handleRemoveQuestion}
                  quizData={state.quiz}
                />
              </Suspense>
            </LazyComponentErrorBoundary>
          </div>
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
    state.aiConfig,
    state.questions,
    state.quiz,
    state.isSaving,
    state.isPublishing,
    state.isGenerating,
    handleQuestionUpdate,
    handleAddQuestion,
    handleDuplicateQuestion,
    handleRemoveQuestion,
    handleGenerateQuestions,
    handleSave,
    handlePublish,
    handleQuizUpdate,
    setState
  ])

  if (!isOpen) return null

  return (
    <QuizBuilderErrorBoundary>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col overflow-hidden">
          {/* Compact Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Quiz Builder</h2>
                <p className="text-sm text-gray-500 mt-0.5">Create and manage your quiz content</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 p-2 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Clean Step Navigation */}
          <div className="px-6 py-3 bg-white border-b border-gray-100">
            <SimpleStepIndicator
              currentStep={state.currentStep}
              onStepClick={handleStepChange}
            />
          </div>

          {/* Error Display */}
          {state.error && (
            <div className="px-6 py-3 bg-red-50 border-b border-red-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-red-800">
                  <X className="h-4 w-4" />
                  <span className="text-sm font-medium">Error:</span>
                  <span className="text-sm">{state.error}</span>
                </div>
                <button
                  onClick={() => setState(prev => ({ ...prev, error: null }))}
                  className="text-red-600 hover:text-red-800 p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Main Content - Optimized spacing */}
          <div className="flex-1 overflow-auto">
            <div className="p-6">
              {renderCurrentStep}
            </div>
          </div>

          {/* Compact Footer */}
          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50">
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500 flex items-center gap-4">
                <span>
                  {state.questions.length} question{state.questions.length !== 1 ? 's' : ''}
                </span>
                <span>
                  {state.questions.reduce((sum: number, q: QuizQuestion) => sum + (q.points || 1), 0)} total points
                </span>
                {/* Auto-save status */}
                {state.quiz.id && (
                  <span className="flex items-center gap-1">
                    {isSaving ? (
                      <>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <span className="text-blue-600">Saving...</span>
                      </>
                    ) : isDirty ? (
                      <>
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span className="text-yellow-600">Unsaved changes</span>
                      </>
                    ) : lastSaved ? (
                      <>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-green-600">
                          Saved {new Intl.DateTimeFormat('en', { 
                            hour: 'numeric', 
                            minute: '2-digit' 
                          }).format(lastSaved)}
                        </span>
                      </>
                    ) : null}
                  </span>
                )}
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg"
                >
                  Cancel
                </button>
                
                <button
                  onClick={handleSave}
                  disabled={state.isSaving}
                  className="px-4 py-2 text-sm bg-primary hover:bg-secondary text-white hover:text-black rounded-lg transition-colors disabled:opacity-50"
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
