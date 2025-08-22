import React from 'react'
import { EnhancedQuestionCard } from './EnhancedQuestionCard'
import { SmartQuestionState, useQuestionState } from './SmartQuestionState'
import { QuizProgressIndicator } from './QuizProgressIndicator'
import { FEATURE_FLAGS } from '@/lib/featureFlags'
import { trackFormEvent } from '@/lib/quizFormMonitoring'
import type { QuestionType } from '@/lib/supabase'

interface Question {
  id?: string
  question: string
  question_type: QuestionType
  options: string[] | any[]
  correct_answer: any
  explanation?: string
  points?: number
  difficulty_level?: string
  media_type?: 'image' | 'audio' | 'video'
  media_url?: string
}

interface Phase2QuizFormEnhancementsProps {
  questions: Question[]
  errors: Array<{ questionIndex: number; field: string; message: string }>
  expandedQuestions: Set<number>
  onToggleExpanded: (index: number) => void
  onDuplicateQuestion: (index: number) => void
  onDeleteQuestion: (index: number) => void
  onPreviewQuestion?: (index: number) => void
  children: (props: {
    renderQuestionCard: (
      question: Question,
      questionIndex: number,
      dragHandleProps: any,
      children: React.ReactNode
    ) => React.ReactNode
  }) => React.ReactNode
}

export function Phase2QuizFormEnhancements({
  questions,
  errors,
  expandedQuestions,
  onToggleExpanded,
  onDuplicateQuestion,
  onDeleteQuestion,
  onPreviewQuestion,
  children
}: Phase2QuizFormEnhancementsProps) {
  const { state, updateState, setErrorCount } = useQuestionState()

  // Update error count when errors change
  React.useEffect(() => {
    setErrorCount(errors.length)
  }, [errors.length, setErrorCount])

  // Track form events for monitoring
  React.useEffect(() => {
    if (FEATURE_FLAGS.ENHANCED_QUESTION_CARDS) {
      trackFormEvent('enhanced_cards_enabled', { 
        questionCount: questions.length,
        errorCount: errors.length
      })
    }
  }, [questions.length, errors.length])

  const renderQuestionCard = (
    question: Question,
    questionIndex: number,
    dragHandleProps: any,
    children: React.ReactNode
  ) => {
    const hasErrors = errors.some(e => e.questionIndex === questionIndex)
    const isExpanded = expandedQuestions.has(questionIndex)
    const questionErrors = errors.filter(e => e.questionIndex === questionIndex)

    // Use enhanced card if feature flag is enabled, otherwise fallback to standard rendering
    if (FEATURE_FLAGS.ENHANCED_QUESTION_CARDS) {
      return (
        <EnhancedQuestionCard
          question={question}
          questionIndex={questionIndex}
          isExpanded={isExpanded}
          hasErrors={hasErrors}
          errors={questionErrors}
          onToggleExpanded={() => {
            onToggleExpanded(questionIndex)
            trackFormEvent('question_toggled', { 
              questionIndex, 
              expanded: !isExpanded,
              questionType: question.question_type
            })
          }}
          onDuplicate={() => {
            onDuplicateQuestion(questionIndex)
            trackFormEvent('question_duplicated', { 
              questionIndex,
              questionType: question.question_type
            })
          }}
          onDelete={() => {
            onDeleteQuestion(questionIndex)
            trackFormEvent('question_deleted', { 
              questionIndex,
              questionType: question.question_type
            })
          }}
          onPreview={onPreviewQuestion ? () => {
            onPreviewQuestion(questionIndex)
            trackFormEvent('question_previewed', { 
              questionIndex,
              questionType: question.question_type
            })
          } : undefined}
          dragHandleProps={dragHandleProps}
        >
          {children}
        </EnhancedQuestionCard>
      )
    }

    // Fallback to original card structure for backward compatibility
    return (
      <div className="bg-white rounded-xl border-2 border-gray-100 hover:border-gray-200 transition-all duration-200">
        <div className="p-4">
          {children}
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Quiz Progress Indicator */}
      {FEATURE_FLAGS.PROGRESS_INDICATORS && (
        <div className="mb-6">
          <QuizProgressIndicator
            questions={questions}
            errors={errors}
          />
        </div>
      )}

      {/* Smart State Indicator */}
      {FEATURE_FLAGS.SMART_QUESTION_STATES && (
        <div className="mb-4 flex justify-end">
          <SmartQuestionState
            state={state}
            errors={errors.length}
            autoSaveEnabled={true}
            isOnline={navigator.onLine}
          />
        </div>
      )}

      {/* Render the form with enhanced question cards */}
      {children({ renderQuestionCard })}
    </>
  )
}

// Helper component for legacy QuizForm integration
interface LegacyQuizFormWrapperProps {
  questions: Question[]
  errors: Array<{ questionIndex: number; field: string; message: string }>
  children: React.ReactNode
}

export function LegacyQuizFormWrapper({
  questions,
  errors,
  children
}: LegacyQuizFormWrapperProps) {
  // Minimal wrapper that adds progress indicator without changing existing structure
  return (
    <>
      {FEATURE_FLAGS.PROGRESS_INDICATORS && (
        <div className="mb-6">
          <QuizProgressIndicator
            questions={questions}
            errors={errors}
          />
        </div>
      )}
      {children}
    </>
  )
}

// Export all components for individual use
export {
  EnhancedQuestionCard,
  SmartQuestionState,
  QuizProgressIndicator,
  useQuestionState
}
