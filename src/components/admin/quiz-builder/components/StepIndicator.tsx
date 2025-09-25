import React, { memo } from 'react'
import { cn } from '@/lib/utils'
import { 
  IconSettings, 
  IconRobotFace, 
  IconEdit, 
  IconCheck 
} from '@tabler/icons-react'

interface StepIndicatorProps {
  currentStep: string
  onStepClick: (step: string) => void
}

const stepMapping = {
  'settings': 0,
  'ai-configuration': 1,
  'quiz-editing': 2,
  'review': 3
}

const stepNames = ['settings', 'ai-configuration', 'quiz-editing', 'review']

const steps = [
  {
    name: 'Settings',
    description: 'Basic quiz information',
    icon: IconSettings
  },
  {
    name: 'AI Config', 
    description: 'Generate questions with AI',
    icon: IconRobotFace
  },
  {
    name: 'Questions',
    description: 'Edit and refine questions',
    icon: IconEdit
  },
  {
    name: 'Review',
    description: 'Final review and publish', 
    icon: IconCheck
  }
]

export const StepIndicator = memo<StepIndicatorProps>(({ 
  currentStep, 
  onStepClick 
}) => {
  const activeStep = stepMapping[currentStep as keyof typeof stepMapping] ?? 0

  const handleStepClick = (stepIndex: number) => {
    const stepName = stepNames[stepIndex]
    if (stepName) {
      onStepClick(stepName)
    }
  }

  return (
    <div className="flex items-center justify-between w-full max-w-3xl mx-auto p-4">
      {steps.map((step, index) => {
        const Icon = step.icon
        const isActive = index === activeStep
        const isCompleted = index < activeStep
        
        return (
          <div key={index} className="flex flex-col items-center relative flex-1">
            {/* Connector line */}
            {index < steps.length - 1 && (
              <div 
                className={cn(
                  "absolute top-6 left-1/2 w-full h-0.5 -translate-y-1/2 z-0",
                  isCompleted ? "bg-blue-500" : "bg-gray-200"
                )}
                style={{ 
                  left: '50%',
                  width: 'calc(100% - 24px)',
                  marginLeft: '12px'
                }}
              />
            )}
            
            {/* Step circle */}
            <button
              onClick={() => handleStepClick(index)}
              className={cn(
                "relative z-10 w-12 h-12 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105",
                isActive 
                  ? "bg-blue-500 border-blue-500 text-white" 
                  : isCompleted
                    ? "bg-green-500 border-green-500 text-white"
                    : "bg-white border-gray-300 text-gray-400 hover:border-gray-400"
              )}
            >
              {isCompleted ? (
                <IconCheck size={18} />
              ) : (
                <Icon size={18} />
              )}
            </button>
            
            {/* Step labels */}
            <div className="mt-3 text-center">
              <p className={cn(
                "text-sm font-medium",
                isActive ? "text-blue-600" : isCompleted ? "text-green-600" : "text-gray-500"
              )}>
                {step.name}
              </p>
              <p className="text-xs text-gray-400 mt-1 max-w-[120px]">
                {step.description}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
})

StepIndicator.displayName = 'StepIndicator'
