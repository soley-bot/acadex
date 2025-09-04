import React, { memo, useCallback, useMemo } from 'react'
import { X, AlertTriangle, CheckCircle, Clock, Target } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { QuizBuilderProvider, QuizBuilderState, useQuizBuilderState } from '@/contexts/QuizBuilderContext'
import { OptimizedAIStep } from './quiz-builder/OptimizedAIStep'
import { OptimizedQuestionEditor } from './quiz-builder/OptimizedQuestionEditor'
import { usePerformanceMonitor } from '@/hooks/usePerformanceOptimization'
import type { Quiz, QuizQuestion } from '@/lib/supabase'

interface QuizBuilderV3Props {
  quiz?: Quiz | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

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

// Memoized Quiz Settings Component
const QuizSettings = memo(() => {
  // Performance monitoring
  const { metrics } = usePerformanceMonitor({
    componentName: 'QuizSettings',
    threshold: 16,
    logSlowRenders: process.env.NODE_ENV === 'development'
  })

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
            placeholder="Enter quiz title"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            placeholder="Enter quiz description"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Time Limit (minutes)
          </label>
          <input
            type="number"
            min="1"
            placeholder="No time limit"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        
        {process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-gray-500">
            QuizSettings - {metrics.renderCount} renders
          </div>
        )}
      </CardContent>
    </Card>
  )
}, () => true) // Pure component optimization

QuizSettings.displayName = 'QuizSettings'

// Memoized Quiz Questions Component
const QuizQuestions = memo(() => {
  // Performance monitoring
  const { metrics } = usePerformanceMonitor({
    componentName: 'QuizQuestions',
    threshold: 16,
    logSlowRenders: process.env.NODE_ENV === 'development'
  })

  const sampleQuestions: QuizQuestion[] = []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          Quiz Questions ({sampleQuestions.length})
        </h3>
        <button
          className="bg-primary hover:bg-secondary text-white hover:text-black px-4 py-2 rounded-lg transition-colors"
        >
          Add Question
        </button>
      </div>

      {sampleQuestions.length === 0 ? (
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
              className="bg-primary hover:bg-secondary text-white hover:text-black px-4 py-2 rounded-lg transition-colors"
            >
              Add First Question
            </button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Questions will be rendered here */}
        </div>
      )}
      
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500">
          QuizQuestions - {metrics.renderCount} renders
        </div>
      )}
    </div>
  )
}, () => true) // Pure component optimization

QuizQuestions.displayName = 'QuizQuestions'

// Memoized Quiz Summary Component
const QuizSummary = memo(() => {
  // Performance monitoring
  const { metrics } = usePerformanceMonitor({
    componentName: 'QuizSummary',
    threshold: 16,
    logSlowRenders: process.env.NODE_ENV === 'development'
  })

  const summaryStats = {
    totalQuestions: 0,
    validQuestions: 0,
    totalPoints: 0,
    estimatedTime: 0,
    isValid: false
  }

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
        </div>

        <div className="flex space-x-3">
          <button
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            Save Draft
          </button>
          
          <button
            disabled={!summaryStats.isValid}
            className="flex-1 bg-primary hover:bg-secondary text-white hover:text-black px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Publish Quiz
          </button>
        </div>
        
        {process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-gray-500">
            QuizSummary - {metrics.renderCount} renders
          </div>
        )}
      </CardContent>
    </Card>
  )
}, () => true) // Pure component optimization

QuizSummary.displayName = 'QuizSummary'

// Memoized Step Indicator Component
const StepIndicator = memo<{ currentState: QuizBuilderState }>(({ currentState }) => (
  <div className="flex items-center space-x-4">
    <div className={`px-3 py-1 rounded text-sm ${
      currentState === QuizBuilderState.CONFIGURE_AI ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
    }`}>
      AI Setup
    </div>
    <div className={`px-3 py-1 rounded text-sm ${
      currentState === QuizBuilderState.EDITING ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
    }`}>
      Edit Questions
    </div>
    <div className={`px-3 py-1 rounded text-sm ${
      currentState === QuizBuilderState.PREVIEW ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
    }`}>
      Preview
    </div>
  </div>
))

StepIndicator.displayName = 'StepIndicator'

// Memoized Main Content Component
const QuizBuilderContent = memo<Omit<QuizBuilderV3Props, 'quiz'>>(({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { state, transitionTo } = useQuizBuilderState()
  
  // Performance monitoring for main component
  const { metrics } = usePerformanceMonitor({
    componentName: 'QuizBuilderContent',
    threshold: 32,
    logSlowRenders: process.env.NODE_ENV === 'development'
  })

  // Memoized current step rendering
  const currentStepContent = useMemo(() => {
    switch (state) {
      case QuizBuilderState.CONFIGURE_AI:
        return (
          <OptimizedAIStep
            isGenerating={false}
            aiConfig={{
              enabled: false,
              language: 'english',
              difficulty: 'intermediate',
              questionCount: 5,
              topics: [],
              customPrompt: ''
            }}
            onConfigChange={() => {}}
            onGenerate={() => {}}
          />
        )

      case QuizBuilderState.EDITING:
        return <QuizQuestions />

      case QuizBuilderState.PREVIEW:
        return <QuizSummary />

      default:
        return <QuizSettings />
    }
  }, [state])

  if (!isOpen) return null

  return (
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
          <StepIndicator currentState={state} />
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-6">
          {currentStepContent}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              0 questions • 0 total points
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              
              <button
                onClick={() => transitionTo(QuizBuilderState.EDITING)}
                className="px-4 py-2 bg-primary hover:bg-secondary text-white hover:text-black rounded-lg transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}, (prevProps, nextProps) => {
  // Custom comparison for optimal re-rendering
  return prevProps.isOpen === nextProps.isOpen
})

QuizBuilderContent.displayName = 'QuizBuilderContent'

// Main QuizBuilderV3 Component with Provider and Error Boundary
export const QuizBuilderV3 = memo<QuizBuilderV3Props>(({ quiz, isOpen, onClose, onSuccess }) => {
  // Determine initial state based on whether we're editing or creating
  const initialState = quiz ? QuizBuilderState.EDITING : QuizBuilderState.CONFIGURE_AI

  return (
    <QuizBuilderErrorBoundary>
      <QuizBuilderProvider initialState={initialState}>
        <QuizBuilderContent
          isOpen={isOpen}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      </QuizBuilderProvider>
    </QuizBuilderErrorBoundary>
  )
}, (prevProps, nextProps) => {
  return (
    prevProps.isOpen === nextProps.isOpen &&
    prevProps.quiz?.id === nextProps.quiz?.id
  )
})

QuizBuilderV3.displayName = 'QuizBuilderV3'
