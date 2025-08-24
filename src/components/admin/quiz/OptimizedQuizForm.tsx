'use client'

import React, { useRef, Suspense } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle2, Save, X, Eye, Loader2 } from 'lucide-react'
import { QuizProvider, useQuizContext, useQuizUI } from '@/contexts/QuizContext'
import { useQuizValidation, useQuizAutoSave, useQuizDraft } from '@/hooks/useQuizOperations'
import { GeneratedQuiz } from '@/components/admin/AIQuizGenerator'
import { BasicDetailsSection } from './sections/BasicDetailsSection'
import { QuestionsSection } from './sections/QuestionsSection'
import { SettingsSection } from './sections/SettingsSection'
import { CategorySelectorRef } from '@/components/admin/CategorySelector'
import { Quiz } from '@/lib/supabase'

// Lazy load heavy components
const AIQuizGenerator = React.lazy(() => import('@/components/admin/AIQuizGenerator').then(module => ({ default: module.AIQuizGenerator })))
const CategoryManagement = React.lazy(() => import('@/components/admin/CategoryManagement').then(module => ({ default: module.CategoryManagement })))

interface QuizFormProps {
  quiz?: Quiz
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  prefilledData?: any
}

// Main QuizForm component with provider
export function QuizForm(props: QuizFormProps) {
  return (
    <QuizProvider initialQuiz={props.quiz}>
      <QuizFormContent {...props} />
    </QuizProvider>
  )
}

// Internal form content component
const QuizFormContent = React.memo(({ quiz, isOpen, onClose, onSuccess, prefilledData }: QuizFormProps) => {
  const {
    state,
    hasUnsavedChanges,
    canSave,
    questionCount
  } = useQuizContext()

  const {
    activeTab,
    loading,
    autoSaving,
    previewMode,
    showAIGenerator,
    showCategoryManagement,
    setActiveTab,
    setLoading,
    toggleAIGenerator,
    toggleCategoryManagement
  } = useQuizUI()

  const { validateForm, errors, isValid } = useQuizValidation()
  const { lastSaved, saveNow } = useQuizAutoSave(quiz?.id)
  const { loadDraft, clearDraft, hasDraft } = useQuizDraft(quiz?.id)

  const categorySelectorRef = useRef<CategorySelectorRef>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      setActiveTab('details') // Navigate to first tab with errors
      return
    }

    try {
      setLoading(true)
      await saveNow()
      clearDraft()
      onSuccess()
    } catch (error) {
      console.error('Failed to save quiz:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (hasUnsavedChanges) {
      const shouldClose = window.confirm('You have unsaved changes. Are you sure you want to close?')
      if (!shouldClose) return
    }
    onClose()
  }

  const handleLoadDraft = () => {
    const loaded = loadDraft()
    if (loaded) {
      alert('Draft loaded successfully!')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <QuizFormHeader
          quiz={quiz}
          loading={loading}
          autoSaving={autoSaving}
          lastSaved={lastSaved}
          hasUnsavedChanges={hasUnsavedChanges}
          hasDraft={hasDraft()}
          onLoadDraft={handleLoadDraft}
          onClose={handleClose}
        />

        {/* Validation Errors */}
        {errors.length > 0 && (
          <div className="mx-6 mt-4 p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-destructive mb-2">Please fix the following issues:</h4>
                <ul className="text-sm text-destructive space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>
                      {error.questionIndex !== undefined 
                        ? `Question ${error.questionIndex + 1}: ${error.message}`
                        : error.message
                      }
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <QuizFormTabs 
          activeTab={activeTab}
          questionCount={questionCount}
          hasErrors={errors.length > 0}
          onTabChange={setActiveTab}
        />

        {/* Form Content */}
        <div className="flex-1 overflow-auto">
          <form onSubmit={handleSubmit} className="p-6">
            {activeTab === 'details' && (
              <BasicDetailsSection
                categorySelectorRef={categorySelectorRef}
                onManageCategories={toggleCategoryManagement}
              />
            )}

            {activeTab === 'questions' && (
              <QuestionsSection onShowAIGenerator={toggleAIGenerator} />
            )}

            {activeTab === 'settings' && <SettingsSection />}
          </form>
        </div>

        {/* Footer */}
        <QuizFormFooter
          canSave={canSave}
          loading={loading}
          questionCount={questionCount}
          onSubmit={handleSubmit}
          onClose={handleClose}
        />

        {/* Modals */}
        <Suspense fallback={<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="bg-white p-6 rounded-lg">
            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
            <p className="mt-2 text-sm text-gray-600">Loading...</p>
          </div>
        </div>}>
          {showAIGenerator && (
            <AIQuizGenerator
              isOpen={showAIGenerator}
              onClose={toggleAIGenerator}
              onQuizGenerated={(generatedQuiz: GeneratedQuiz) => {
                // Handle AI generated quiz
                toggleAIGenerator()
              }}
            />
          )}

          {showCategoryManagement && (
            <CategoryManagement
              isOpen={showCategoryManagement}
              onClose={toggleCategoryManagement}
              onCategoryCreated={() => {
                categorySelectorRef.current?.refreshCategories()
                toggleCategoryManagement()
              }}
            />
          )}
        </Suspense>
      </div>
    </div>
  )
})

// Header Component
const QuizFormHeader = React.memo(({
  quiz,
  loading,
  autoSaving,
  lastSaved,
  hasUnsavedChanges,
  hasDraft,
  onLoadDraft,
  onClose
}: any) => {
  return (
    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {quiz ? 'Edit Quiz' : 'Create New Quiz'}
          </h2>
          <div className="flex items-center gap-4 mt-1">
            {autoSaving && (
              <div className="flex items-center gap-2 text-blue-600 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                Auto-saving...
              </div>
            )}
            {!autoSaving && lastSaved && (
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <CheckCircle2 className="h-4 w-4" />
                Saved {lastSaved.toLocaleTimeString()}
              </div>
            )}
            {hasUnsavedChanges && !autoSaving && (
              <div className="flex items-center gap-2 text-amber-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                Unsaved changes
              </div>
            )}
            {hasDraft && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onLoadDraft}
                className="text-xs"
              >
                Load Draft
              </Button>
            )}
          </div>
        </div>
        
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          className="p-2"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
})

// Tab Navigation Component
const QuizFormTabs = React.memo(({
  activeTab,
  questionCount,
  hasErrors,
  onTabChange
}: any) => {
  const tabs = [
    { id: 'details', label: 'Details', icon: '📝' },
    { id: 'questions', label: `Questions (${questionCount})`, icon: '❓' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ]

  return (
    <div className="border-b border-gray-200 bg-white">
      <nav className="flex space-x-8 px-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id as any)}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
            {hasErrors && tab.id === 'details' && (
              <AlertCircle className="h-4 w-4 text-destructive" />
            )}
          </button>
        ))}
      </nav>
    </div>
  )
})

// Footer Component
const QuizFormFooter = React.memo(({
  canSave,
  loading,
  questionCount,
  onSubmit,
  onClose
}: any) => {
  return (
    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          <span className="font-medium">{questionCount}</span> question{questionCount !== 1 ? 's' : ''} ready
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          
          <Button
            type="submit"
            onClick={onSubmit}
            disabled={!canSave || loading}
            className="bg-primary hover:bg-secondary text-white hover:text-black"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Quiz
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
})

QuizFormContent.displayName = 'QuizFormContent'
QuizFormHeader.displayName = 'QuizFormHeader'
QuizFormTabs.displayName = 'QuizFormTabs'
QuizFormFooter.displayName = 'QuizFormFooter'
