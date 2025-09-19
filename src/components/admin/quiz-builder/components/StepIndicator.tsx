import React, { memo } from 'react'
import { Stepper } from '@mantine/core'
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
    <Stepper
      active={activeStep}
      onStepClick={handleStepClick}
      allowNextStepsSelect={false}
      size="md"
      radius="md"
      completedIcon={<IconCheck size={18} />}
      styles={{
        step: {
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        },
        stepIcon: {
          borderWidth: 2
        }
      }}
    >
      <Stepper.Step
        label="Settings"
        description="Basic quiz information"
        icon={<IconSettings size={18} />}
      />
      
      <Stepper.Step
        label="AI Config"
        description="Generate questions with AI"
        icon={<IconRobotFace size={18} />}
      />
      
      <Stepper.Step
        label="Questions"
        description="Edit and refine questions"
        icon={<IconEdit size={18} />}
      />
      
      <Stepper.Step
        label="Review"
        description="Final review and publish"
        icon={<IconCheck size={18} />}
      />
    </Stepper>
  )
})

StepIndicator.displayName = 'StepIndicator'