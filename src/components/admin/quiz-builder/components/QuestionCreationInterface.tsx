import React, { memo, useCallback, useState, Suspense, lazy } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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
          className="bg-red-600 hover:bg-red-700 text-white"
          onClick={() => setShowEnhancedCreation(true)}
        >
          <IconPlus size={16} className="mr-2" />
          Create Question
          <IconChevronDown size={16} className="ml-2" />
        </Button>

        <Dialog open={showEnhancedCreation} onOpenChange={setShowEnhancedCreation}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Create Question</DialogTitle>
            </DialogHeader>
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
          </DialogContent>
        </Dialog>
      </>
    )
  }

  // Fallback to original dropdown
  return <QuestionTypeDropdown onCreateQuestion={onCreateQuestion} />
})

QuestionCreationInterface.displayName = 'QuestionCreationInterface'
