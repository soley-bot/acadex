import React from 'react'
import { Settings, Wand2, Edit, Eye, Save, CheckCircle, AlertTriangle } from 'lucide-react'
import { QuizBuilderState, useQuizBuilderState } from '@/contexts/QuizBuilderContext'

interface StepIndicatorProps {
  className?: string
}

const STEP_CONFIG = {
  [QuizBuilderState.CONFIGURE_AI]: {
    title: 'AI Configuration',
    description: 'Configure quiz generation settings',
    icon: Settings,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  [QuizBuilderState.GENERATING]: {
    title: 'Generating',
    description: 'AI is creating your quiz',
    icon: Wand2,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100'
  },
  [QuizBuilderState.EDITING]: {
    title: 'Editing',
    description: 'Customize questions and answers',
    icon: Edit,
    color: 'text-green-600',
    bgColor: 'bg-green-100'
  },
  [QuizBuilderState.PREVIEW]: {
    title: 'Preview',
    description: 'Review your quiz',
    icon: Eye,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100'
  },
  [QuizBuilderState.SAVING]: {
    title: 'Saving',
    description: 'Saving your quiz',
    icon: Save,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  [QuizBuilderState.SAVED]: {
    title: 'Saved',
    description: 'Quiz saved successfully',
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-100'
  },
  [QuizBuilderState.ERROR]: {
    title: 'Error',
    description: 'Something went wrong',
    icon: AlertTriangle,
    color: 'text-red-600',
    bgColor: 'bg-red-100'
  }
}

const STEP_ORDER = [
  QuizBuilderState.CONFIGURE_AI,
  QuizBuilderState.GENERATING,
  QuizBuilderState.EDITING,
  QuizBuilderState.PREVIEW,
  QuizBuilderState.SAVING,
  QuizBuilderState.SAVED
]

export const StepIndicator: React.FC<StepIndicatorProps> = ({ className = '' }) => {
  const { state } = useQuizBuilderState()
  
  const currentStepIndex = STEP_ORDER.indexOf(state)
  const isErrorState = state === QuizBuilderState.ERROR

  if (isErrorState) {
    const errorConfig = STEP_CONFIG[QuizBuilderState.ERROR]
    const ErrorIcon = errorConfig.icon
    
    return (
      <div className={`flex items-center justify-center p-4 ${className}`}>
        <div className={`flex items-center space-x-3 px-4 py-2 rounded-lg ${errorConfig.bgColor}`}>
          <ErrorIcon className={`h-5 w-5 ${errorConfig.color}`} />
          <div>
            <div className={`font-medium ${errorConfig.color}`}>{errorConfig.title}</div>
            <div className="text-sm text-gray-600">{errorConfig.description}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`w-full p-4 ${className}`}>
      <div className="flex items-center justify-between">
        {STEP_ORDER.map((stepState, index) => {
          const config = STEP_CONFIG[stepState]
          const Icon = config.icon
          const isActive = stepState === state
          const isCompleted = index < currentStepIndex
          const isUpcoming = index > currentStepIndex

          return (
            <React.Fragment key={stepState}>
              <div className="flex flex-col items-center space-y-2">
                <div
                  className={`
                    flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200
                    ${isActive 
                      ? `${config.bgColor} ${config.color} ring-2 ring-offset-2 ring-blue-500` 
                      : isCompleted 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-gray-100 text-gray-400'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-center">
                  <div
                    className={`
                      text-sm font-medium
                      ${isActive 
                        ? config.color 
                        : isCompleted 
                          ? 'text-green-600' 
                          : 'text-gray-400'
                      }
                    `}
                  >
                    {config.title}
                  </div>
                  <div className="text-xs text-gray-500 max-w-20 mx-auto">
                    {config.description}
                  </div>
                </div>
              </div>
              
              {index < STEP_ORDER.length - 1 && (
                <div className="flex-1 mx-4">
                  <div
                    className={`
                      h-0.5 w-full transition-all duration-200
                      ${isCompleted ? 'bg-green-300' : 'bg-gray-200'}
                    `}
                  />
                </div>
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}

interface StateDisplayProps {
  showDebugInfo?: boolean
  className?: string
}

export const StateDisplay: React.FC<StateDisplayProps> = ({ 
  showDebugInfo = false, 
  className = '' 
}) => {
  const { state, data, canTransition } = useQuizBuilderState()
  const config = STEP_CONFIG[state]
  const Icon = config.icon

  if (!showDebugInfo) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Icon className={`h-4 w-4 ${config.color}`} />
        <span className={`text-sm font-medium ${config.color}`}>
          {config.title}
        </span>
      </div>
    )
  }

  return (
    <div className={`bg-gray-50 rounded-lg p-4 ${className}`}>
      <div className="flex items-center space-x-2 mb-2">
        <Icon className={`h-5 w-5 ${config.color}`} />
        <span className={`font-medium ${config.color}`}>{config.title}</span>
      </div>
      
      <div className="text-sm text-gray-600 space-y-1">
        <div>Questions: {data.questions.length}</div>
        {data.lastGenerated && (
          <div>Last Generated: {data.lastGenerated.toLocaleTimeString()}</div>
        )}
        {data.lastSaved && (
          <div>Last Saved: {data.lastSaved.toLocaleTimeString()}</div>
        )}
        {data.error && (
          <div className="text-red-600">Error: {data.error}</div>
        )}
        
        <div className="mt-2 pt-2 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            Can transition to: {STEP_ORDER.filter(s => canTransition(s)).join(', ')}
          </div>
        </div>
      </div>
    </div>
  )
}
