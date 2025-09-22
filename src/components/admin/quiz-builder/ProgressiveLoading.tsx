// Progressive Loading Components for QuizBuilder
// Phase 3B: Lazy loading, suspense boundaries, and code splitting

import React, { Suspense, lazy } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Settings, Edit, Eye, Wand2, AlertTriangle } from 'lucide-react'

// Lazy load heavy components for better initial load performance
const QuestionEditor = lazy(() => 
  import('./QuestionEditor').then(module => ({
    default: module.QuestionEditor
  }))
)

const AIStep = lazy(() => 
  import('./AIStep').then(module => ({
    default: module.AIStep
  }))
)

const QuizPreviewStep = lazy(() => 
  import('./steps/QuizPreviewStep').then(module => ({
    default: module.QuizPreviewStep
  }))
)

const QuizSettingsStep = lazy(() => 
  import('./steps/QuizSettingsStep').then(module => ({
    default: module.QuizSettingsStep
  }))
)

// Loading fallback components optimized for each step
interface LoadingFallbackProps {
  step: 'settings' | 'passage' | 'ai-configuration' | 'quiz-editing' | 'review'
  className?: string
}

export const StepLoadingFallback: React.FC<LoadingFallbackProps> = ({ step, className = '' }) => {
  const stepConfig = {
    'settings': {
      icon: Settings,
      title: 'Loading Quiz Settings...',
      description: 'Preparing quiz configuration interface'
    },
    'passage': {
      icon: Edit,
      title: 'Loading Passage Editor...',
      description: 'Preparing reading passage interface'
    },
    'ai-configuration': {
      icon: Wand2,
      title: 'Loading AI Generator...',
      description: 'Initializing AI quiz generation tools'
    },
    'quiz-editing': {
      icon: Edit,
      title: 'Loading Question Editor...',
      description: 'Preparing advanced question editing interface'
    },
    'review': {
      icon: Eye,
      title: 'Loading Preview...',
      description: 'Preparing quiz review and publishing tools'
    }
  }

  const config = stepConfig[step]
  const Icon = config.icon

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <Icon className="h-12 w-12 text-primary animate-pulse" />
            <Loader2 className="h-6 w-6 text-secondary animate-spin absolute -bottom-1 -right-1" />
          </div>
        </div>
        <CardTitle className="text-xl text-gray-700">{config.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-center text-gray-500 mb-6">{config.description}</p>
        
        {/* Step-specific loading skeleton */}
        <div className="space-y-4">
          {step === 'settings' && (
            <>
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-24 bg-gray-200 rounded animate-pulse"></div>
            </>
          )}
          
          {step === 'passage' && (
            <>
              <div className="h-8 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="h-6 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="h-32 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </>
          )}
          
          {step === 'ai-configuration' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
            </>
          )}
          
          {step === 'quiz-editing' && (
            <>
              <div className="h-8 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            </>
          )}
          
          {step === 'review' && (
            <>
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-20 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
              <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
            </>
          )}
        </div>
        
        <div className="mt-6 text-center">
          <div className="inline-flex items-center text-sm text-gray-400">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Loading optimized components...
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Suspense-wrapped lazy components with error boundaries
interface LazyComponentWrapperProps {
  step: 'settings' | 'passage' | 'ai-configuration' | 'quiz-editing' | 'review'
  children: React.ReactNode
  fallbackClassName?: string
}

export const LazyComponentWrapper: React.FC<LazyComponentWrapperProps> = ({ 
  step, 
  children, 
  fallbackClassName 
}) => (
  <Suspense fallback={<StepLoadingFallback step={step} className={fallbackClassName} />}>
    {children}
  </Suspense>
)

// Enhanced Error Boundary for lazy-loaded components
interface LazyErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

export class LazyComponentErrorBoundary extends React.Component<
  { children: React.ReactNode; step: string },
  LazyErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; step: string }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): LazyErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`Lazy component error in ${this.props.step}:`, error, errorInfo)
    this.setState({ errorInfo })
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Component Loading Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700 mb-4">
              Failed to load the {this.props.step} component. This might be due to a network issue or component error.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => this.setState({ hasError: false, error: undefined })}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
              >
                Retry Loading
              </button>
              <button
                onClick={() => window.location.reload()}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors ml-2"
              >
                Refresh Page
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 text-xs text-red-600">
                <summary>Error Details (Development)</summary>
                <pre className="mt-2 whitespace-pre-wrap">{this.state.error.stack}</pre>
              </details>
            )}
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}

// Progressive loading HOC for quiz builder components
export const withProgressiveLoading = <P extends object>(
  Component: React.ComponentType<P>,
  step: 'settings' | 'passage' | 'ai-configuration' | 'quiz-editing' | 'review',
  displayName?: string
) => {
  const ProgressiveComponent: React.FC<P> = (props) => (
    <LazyComponentErrorBoundary step={step}>
      <LazyComponentWrapper step={step}>
        <Component {...props} />
      </LazyComponentWrapper>
    </LazyComponentErrorBoundary>
  )

  ProgressiveComponent.displayName = displayName || `Progressive${Component.displayName || Component.name}`
  
  return ProgressiveComponent
}

// Export lazy-loaded components for use in QuizBuilder
export { 
  QuestionEditor as LazyQuestionEditor,
  AIStep as LazyAIStep,
  QuizPreviewStep as LazyPreviewStep,
  QuizSettingsStep as LazySettingsStep
}
