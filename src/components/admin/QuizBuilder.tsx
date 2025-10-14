'use client'

import React, { memo, useMemo, Suspense, useCallback } from 'react'
import { X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Quiz, QuizQuestion } from '@/lib/supabase'

// Import extracted components
import { QuizSummaryCard } from '@/components/admin/quiz-builder/components/QuizSummaryCard'
import { QuizBuilderErrorBoundary, QuizBuilderLoadingFallback } from '@/components/admin/quiz-builder/utils/QuizBuilderUtils'

// Import our custom hook
import { useQuizBuilder } from '@/hooks/useQuizBuilder'

// Lazy load heavy components
const LazyQuizSettingsStep = React.lazy(() =>
  import('@/components/admin/quiz-builder/steps/QuizSettingsStep').then(module => ({
    default: module.QuizSettingsStep
  }))
)

const LazyAIConfigurationStep = React.lazy(() =>
  import('@/components/admin/quiz-builder/steps/AIConfigurationStep').then(module => ({
    default: module.AIConfigurationStep
  }))
)

const LazyQuizQuestions = React.lazy(() =>
  import('@/components/admin/quiz-builder/components/QuizQuestionsStep').then(module => ({
    default: module.QuizQuestions
  }))
)

const LazyQuizPreviewStep = React.lazy(() =>
  import('@/components/admin/quiz-builder/steps/QuizPreviewStep').then(module => ({
    default: module.QuizPreviewStep
  }))
)

interface QuizBuilderProps {
  quiz?: Quiz | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  prefilledData?: any
}

// Clean QuizBuilder Component
export const QuizBuilder = memo<QuizBuilderProps>(({ 
  quiz, 
  isOpen, 
  onClose, 
  onSuccess, 
  prefilledData
}) => {
  // Use the extracted quiz builder hook
  const {
    state,
    isDirty,
    isSaving,
    lastSaved,
    updateQuiz,
    updateQuestions,
    updateAIConfig,
    setCurrentStep,
    setError,
    saveQuiz,
    publishQuiz,
    validation
  } = useQuizBuilder({ quiz, isOpen, onSuccess, onClose });

  // Handler adapters to map hook functions to component handlers
  const handleQuizUpdate = useCallback((updates: Partial<Quiz>) => {
    updateQuiz(updates);
  }, [updateQuiz]);

  const handleAIConfigUpdate = useCallback((config: any) => {
    updateAIConfig(config);
  }, [updateAIConfig]);
  
  const handleQuestionUpdate = useCallback((index: number, updates: Partial<QuizQuestion>) => {
    const updatedQuestions = state.questions.map((q, i) => 
      i === index ? { ...q, ...updates } : q
    );
    updateQuestions(updatedQuestions);
  }, [state.questions, updateQuestions]);
  
  const handleAddQuestion = useCallback((questionType: string, enhancedData?: any) => {
    const newQuestion: QuizQuestion = {
      id: `temp-${Date.now()}`,
      quiz_id: state.quiz.id || 'temp',
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
    };
    updateQuestions([...state.questions, newQuestion]);
  }, [state.questions, state.quiz.id, updateQuestions]);

  const handleDuplicateQuestion = useCallback((index: number) => {
    const questionToDuplicate = state.questions[index];
    if (!questionToDuplicate) return;
    
    const duplicated = { 
      ...questionToDuplicate, 
      id: `temp-${Date.now()}`,
      order_index: index + 1
    };
    const newQuestions = [
      ...state.questions.slice(0, index + 1), 
      duplicated, 
      ...state.questions.slice(index + 1)
    ];
    updateQuestions(newQuestions);
  }, [state.questions, updateQuestions]);

  const handleRemoveQuestion = useCallback((index: number) => {
    updateQuestions(state.questions.filter((_, i) => i !== index));
  }, [state.questions, updateQuestions]);

  const handleGenerateQuestions = useCallback(async () => {
    // This would need to be implemented with the AI generation logic
    setError('AI generation needs to be implemented in the hook');
  }, [setError]);

  const handleSave = useCallback(() => saveQuiz(), [saveQuiz]);
  const handlePublish = useCallback(() => publishQuiz(), [publishQuiz]);

  // Handle close with unsaved changes warning
  const handleClose = useCallback(() => {
    if (isDirty) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to close? Your changes will be lost.'
      );
      if (!confirmed) return;
    }
    onClose();
  }, [isDirty, onClose]);

  // Render current step content with progressive loading
  const renderCurrentStep = useMemo(() => {
    switch (state.currentStep) {
      case 'settings':
        return (
          <QuizBuilderErrorBoundary>
            <Suspense fallback={<QuizBuilderLoadingFallback />}>
              <LazyQuizSettingsStep
                quiz={state.quiz}
                onQuizUpdate={handleQuizUpdate}
                isValid={validation.isValid}
                errors={validation.errors}
              />
            </Suspense>
          </QuizBuilderErrorBoundary>
        )

      case 'ai-configuration':
        return (
          <QuizBuilderErrorBoundary>
            <Suspense fallback={<QuizBuilderLoadingFallback />}>
              <LazyAIConfigurationStep
                aiConfig={state.aiConfig}
                onConfigUpdate={handleAIConfigUpdate}
                onGenerateQuestions={handleGenerateQuestions}
                isGenerating={state.isGenerating}
              />
            </Suspense>
          </QuizBuilderErrorBoundary>
        )

      case 'quiz-editing':
        return (
          <div className="space-y-6">
            <QuizBuilderErrorBoundary>
              <Suspense fallback={<QuizBuilderLoadingFallback />}>
                <LazyQuizQuestions
                  questions={state.questions}
                  onUpdate={handleQuestionUpdate}
                  onAdd={handleAddQuestion}
                  onDuplicate={handleDuplicateQuestion}
                  onRemove={handleRemoveQuestion}
                  quizData={state.quiz}
                />
              </Suspense>
            </QuizBuilderErrorBoundary>
          </div>
        )

      case 'review':
        return (
          <QuizBuilderErrorBoundary>
            <Suspense fallback={<QuizBuilderLoadingFallback />}>
              <LazyQuizPreviewStep
                quiz={state.quiz}
                questions={state.questions}
                onSave={handleSave}
                onPublish={handlePublish}
                isSaving={isSaving}
                isPublishing={state.isPublishing}
              />
            </Suspense>
          </QuizBuilderErrorBoundary>
        )

      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-500">Unknown step: {state.currentStep}</p>
          </div>
        )
    }
  }, [
    state.currentStep,
    state.quiz,
    state.questions,
    state.aiConfig,
    state.isGenerating,
    state.isPublishing,
    validation.isValid,
    validation.errors,
    handleQuizUpdate,
    handleAIConfigUpdate,
    handleGenerateQuestions,
    handleQuestionUpdate,
    handleAddQuestion,
    handleDuplicateQuestion,
    handleRemoveQuestion,
    handleSave,
    handlePublish,
    isSaving
  ])

  const steps = [
    { id: 'settings', label: 'Quiz Settings', description: 'Basic quiz information' },
    { id: 'ai-configuration', label: 'AI Configuration', description: 'Generate questions with AI' },
    { id: 'quiz-editing', label: 'Edit Questions', description: 'Create and edit questions' },
    { id: 'review', label: 'Review & Publish', description: 'Final review and publish' }
  ]

  const currentStepIndex = steps.findIndex(step => step.id === state.currentStep)

  if (!isOpen) return null

  return (
    <QuizBuilderErrorBoundary>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden">
          {/* Compact Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {quiz ? 'Edit Quiz' : 'Create New Quiz'}
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {isDirty && <span className="text-orange-600 font-medium">● Unsaved changes</span>}
                  {!isDirty && lastSaved && <span className="text-green-600">✓ Saved {new Date(lastSaved).toLocaleTimeString()}</span>}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 p-2 rounded-lg hover:bg-gray-200 transition-colors"
              title={isDirty ? 'You have unsaved changes' : 'Close'}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="px-4 py-2 bg-white border-b border-gray-100">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-center ${
                    index < steps.length - 1 ? 'flex-1' : 'flex-none'
                  }`}
                >
                  <button
                    onClick={() => setCurrentStep(step.id as any)}
                    className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                      step.id === state.currentStep
                        ? 'bg-primary/10 text-primary'
                        : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        index <= currentStepIndex
                          ? 'bg-primary text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <span className="text-xs mt-1 text-center max-w-20">{step.label}</span>
                  </button>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 ${
                        index < currentStepIndex ? 'bg-primary' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Unsaved Changes Warning */}
          {isDirty && (
            <div className="px-6 py-3 bg-orange-50 border-b border-orange-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-orange-800 font-medium text-sm">⚠️ You have unsaved changes</span>
                </div>
                <button
                  onClick={handleSave}
                  disabled={isSaving || !validation.isValid}
                  className="px-4 py-1.5 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Saving...' : 'Save Now'}
                </button>
              </div>
            </div>
          )}

          {/* Error Display */}
          {state.error && (
            <div className="px-6 py-2 bg-red-50 border-b border-red-200">
              <div className="text-red-800 text-sm">{state.error}</div>
            </div>
          )}

          {/* Main Content Area - Adaptive Layout */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Compact Quiz Summary Header - Always visible */}
            <div className="px-4 py-2 bg-gray-50/50 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-sm font-medium text-gray-900">
                    {state.quiz.title || 'New Quiz'}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    <span>{state.questions.length} questions</span>
                    <span>•</span>
                    <span>{state.quiz.category || 'No category'}</span>
                    <span>•</span>
                    <span>{state.quiz.duration_minutes || 0} min</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSave}
                    disabled={isSaving || !isDirty}
                    className={`px-4 py-2 text-sm rounded-lg font-medium transition-all flex items-center gap-2 ${
                      isSaving
                        ? 'bg-blue-500 text-white cursor-wait'
                        : isDirty
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                    title={!isDirty ? 'No changes to save' : 'Save changes'}
                  >
                    {isSaving && <span className="animate-spin">⏳</span>}
                    {!isSaving && isDirty && <span>●</span>}
                    {!isSaving && !isDirty && <span>✓</span>}
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content - Full Width */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {renderCurrentStep}
            </div>
          </div>
        </div>
      </div>
    </QuizBuilderErrorBoundary>
  )
})

QuizBuilder.displayName = 'QuizBuilder'
