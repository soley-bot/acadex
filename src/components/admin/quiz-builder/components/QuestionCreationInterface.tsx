import React, { memo, useCallback, useState, Suspense, lazy } from 'react'
import {
  Button,
  Modal
} from '@mantine/core'
import { IconPlus, IconChevronDown } from '@tabler/icons-react'
import { useFeatureFlag } from '@/lib/featureFlags'
import type { Quiz, QuizQuestion } from '@/lib/supabase'
import { QuestionTypeDropdown } from './QuestionTypeDropdown'
import { StepLoadingFallback } from '../ProgressiveLoading'

// Lazy load the enhanced question creation component
const LazyQuestionCreation = lazy(() => 
  import('../../QuestionCreation').then(module => ({
    default: module.QuestionCreation
  }))
)

interface QuestionCreationInterfaceProps {
  onCreateQuestion: (type: string, data?: any) => void
  quizData?: Partial<Quiz>
  existingQuestions: QuizQuestion[]
}

export const QuestionCreationInterface = memo<QuestionCreationInterfaceProps>(({
  onCreateQuestion,
  quizData,
  existingQuestions
}) => {
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
        <Button
          variant="filled"
          color="red"
          leftSection={<IconPlus size={16} />}
          rightSection={<IconChevronDown size={16} />}
          onClick={() => setShowEnhancedCreation(true)}
        >
          Create Question
        </Button>

        <Modal
          opened={showEnhancedCreation}
          onClose={() => setShowEnhancedCreation(false)}
          size="xl"
          title="Create Question"
          centered
        >
          <Suspense fallback={<StepLoadingFallback step="quiz-editing" />}>
            <LazyQuestionCreation
              topic={quizData?.title || ''}
              category={quizData?.category || ''}
              difficulty={quizData?.difficulty as any || 'intermediate'}
              existingQuestions={existingQuestions}
              onCreateQuestion={handleCreateQuestion}
              onClose={() => setShowEnhancedCreation(false)}
            />
          </Suspense>
        </Modal>
      </>
    )
  }

  // Fallback to original dropdown
  return <QuestionTypeDropdown onCreateQuestion={onCreateQuestion} />
})

QuestionCreationInterface.displayName = 'QuestionCreationInterface'