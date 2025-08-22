import React, { useState, useCallback } from 'react'
import { TemplateLibrary, QuickTemplateSelector } from './TemplateLibrary'
import { SmartSuggestions } from './SmartSuggestions'
import { BulkOperations } from './BulkOperations'
import { 
  QUESTION_TEMPLATES, 
  applyTemplate, 
  type QuestionTemplate 
} from './QuestionTemplates'
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

interface SmartSuggestion {
  id: string
  type: 'balance' | 'difficulty' | 'engagement' | 'coverage' | 'flow' | 'accessibility'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  action: string
  suggestedQuestionType?: QuestionType
  suggestedContent?: Partial<Question>
  reasoning: string
  impact: string
  estimatedTime?: number
}

interface Phase3SmartFlowProps {
  questions: Question[]
  onAddQuestion: (question: Partial<Question>) => void
  onUpdateQuestions: (questions: Question[]) => void
  onBulkOperation: (operation: string, data?: any) => void
  quizTitle?: string
  quizCategory?: string
  targetDifficulty?: 'easy' | 'medium' | 'hard'
  targetAudience?: 'beginner' | 'intermediate' | 'advanced'
  className?: string
}

export function Phase3SmartFlow({
  questions,
  onAddQuestion,
  onUpdateQuestions,
  onBulkOperation,
  quizTitle,
  quizCategory,
  targetDifficulty = 'medium',
  targetAudience = 'intermediate',
  className = ''
}: Phase3SmartFlowProps) {
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false)
  const [selectedQuestions, setSelectedQuestions] = useState<Set<number>>(new Set())
  const [activeTab, setActiveTab] = useState<'suggestions' | 'templates' | 'bulk'>('suggestions')

  // Handle template selection
  const handleSelectTemplate = useCallback((template: QuestionTemplate) => {
    trackFormEvent('template_applied', {
      templateId: template.id,
      templateType: template.questionType,
      templateCategory: template.category
    })

    // For now, apply template with placeholder values
    // In a real implementation, you'd show a form to fill in the placeholders
    const mockVariables = generateMockVariables(template)
    const appliedTemplate = applyTemplate(template, mockVariables)
    
    onAddQuestion({
      question: appliedTemplate.question,
      question_type: template.questionType,
      options: appliedTemplate.options,
      correct_answer: appliedTemplate.correct_answer,
      explanation: appliedTemplate.explanation,
      points: appliedTemplate.points,
      difficulty_level: template.difficulty
    })

    setShowTemplateLibrary(false)
  }, [onAddQuestion])

  // Handle smart suggestion application
  const handleApplySuggestion = useCallback((suggestion: SmartSuggestion) => {
    switch (suggestion.type) {
      case 'balance':
        if (suggestion.suggestedQuestionType) {
          // Add a template question of the suggested type
          const templates = QUESTION_TEMPLATES.filter(t => t.questionType === suggestion.suggestedQuestionType)
          if (templates.length > 0 && templates[0]) {
            handleSelectTemplate(templates[0])
          }
        }
        break
        
      case 'accessibility':
        // Add explanations to questions that don't have them
        const updatedQuestions = questions.map(q => 
          !q.explanation ? { ...q, explanation: 'Add explanation here...' } : q
        )
        onUpdateQuestions(updatedQuestions)
        break
        
      case 'coverage':
        // Suggest adding more questions
        setShowTemplateLibrary(true)
        break
        
      default:
        // Handle other suggestion types
        console.log('Applying suggestion:', suggestion)
    }
  }, [questions, onUpdateQuestions, handleSelectTemplate])

  // Handle bulk operations
  const handleBulkOperation = useCallback((operation: string, data?: any) => {
    onBulkOperation(operation, data)
    
    // Clear selection after operation
    if (['delete', 'duplicate'].includes(operation)) {
      setSelectedQuestions(new Set())
    }
  }, [onBulkOperation])

  // Question selection handlers
  const handleSelectQuestion = useCallback((index: number) => {
    setSelectedQuestions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }, [])

  const handleSelectAll = useCallback(() => {
    setSelectedQuestions(new Set(questions.map((_, index) => index)))
  }, [questions])

  const handleDeselectAll = useCallback(() => {
    setSelectedQuestions(new Set())
  }, [])

  if (!FEATURE_FLAGS.QUESTION_TEMPLATES && !FEATURE_FLAGS.BULK_OPERATIONS) {
    return null
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {FEATURE_FLAGS.QUESTION_TEMPLATES && (
            <>
              <button
                onClick={() => setActiveTab('suggestions')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'suggestions'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Smart Suggestions
              </button>
              <button
                onClick={() => setActiveTab('templates')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'templates'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Templates
              </button>
            </>
          )}
          {FEATURE_FLAGS.BULK_OPERATIONS && (
            <button
              onClick={() => setActiveTab('bulk')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'bulk'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Bulk Operations
            </button>
          )}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {activeTab === 'suggestions' && FEATURE_FLAGS.QUESTION_TEMPLATES && (
          <SmartSuggestions
            questions={questions}
            quizTitle={quizTitle}
            quizCategory={quizCategory}
            targetDifficulty={targetDifficulty}
            targetAudience={targetAudience}
            onApplySuggestion={handleApplySuggestion}
          />
        )}

        {activeTab === 'templates' && FEATURE_FLAGS.QUESTION_TEMPLATES && (
          <div className="space-y-4">
            <TemplateLibrary
              onSelectTemplate={handleSelectTemplate}
              preferredCategory={quizCategory}
            />
          </div>
        )}

        {activeTab === 'bulk' && FEATURE_FLAGS.BULK_OPERATIONS && (
          <BulkOperations
            questions={questions}
            selectedQuestions={selectedQuestions}
            onSelectQuestion={handleSelectQuestion}
            onSelectAll={handleSelectAll}
            onDeselectAll={handleDeselectAll}
            onBulkOperation={handleBulkOperation}
          />
        )}
      </div>

      {/* Template Library Modal */}
      {showTemplateLibrary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <TemplateLibrary
              onSelectTemplate={handleSelectTemplate}
              onClose={() => setShowTemplateLibrary(false)}
              preferredCategory={quizCategory}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// Quick access component for existing question creation flow
interface QuickSmartActionsProps {
  questions: Question[]
  currentQuestionType?: QuestionType
  onAddQuestion: (question: Partial<Question>) => void
  onShowTemplates: () => void
  className?: string
}

export function QuickSmartActions({
  questions,
  currentQuestionType = 'multiple_choice',
  onAddQuestion,
  onShowTemplates,
  className = ''
}: QuickSmartActionsProps) {
  const handleSelectTemplate = useCallback((template: QuestionTemplate) => {
    const mockVariables = generateMockVariables(template)
    const appliedTemplate = applyTemplate(template, mockVariables)
    
    onAddQuestion({
      question: appliedTemplate.question,
      question_type: template.questionType,
      options: appliedTemplate.options,
      correct_answer: appliedTemplate.correct_answer,
      explanation: appliedTemplate.explanation,
      points: appliedTemplate.points,
      difficulty_level: template.difficulty
    })
  }, [onAddQuestion])

  if (!FEATURE_FLAGS.QUESTION_TEMPLATES) {
    return null
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Quick Templates for Current Type */}
      <QuickTemplateSelector
        questionType={currentQuestionType}
        onSelectTemplate={handleSelectTemplate}
      />

      {/* Quick Actions */}
      <div className="flex gap-2">
        <button
          onClick={onShowTemplates}
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          Browse All Templates
        </button>
      </div>
    </div>
  )
}

// Helper function to generate mock variables for template preview
function generateMockVariables(template: QuestionTemplate): Record<string, any> {
  const mockData: Record<string, any> = {}
  
  if (template.placeholders) {
    template.placeholders.forEach(placeholder => {
      switch (placeholder) {
        case 'target_word':
          mockData[placeholder] = 'example'
        case 'correct_synonym':
          mockData[placeholder] = 'sample'
        case 'distractor_1':
          mockData[placeholder] = 'option A'
        case 'distractor_2':
          mockData[placeholder] = 'option B'
        case 'distractor_3':
          mockData[placeholder] = 'option C'
        case 'definition':
          mockData[placeholder] = 'a representative form or pattern'
        case 'sentence_start':
          mockData[placeholder] = 'The students'
        case 'sentence_end':
          mockData[placeholder] = 'their homework yesterday'
        case 'correct_form':
          mockData[placeholder] = 'completed'
        case 'essay_topic':
          mockData[placeholder] = 'The importance of education in modern society'
        case 'correct_index':
          mockData[placeholder] = 0
        case 'correct_answer_text':
          mockData[placeholder] = 'true'
        default:
          mockData[placeholder] = `[${placeholder}]`
      }
    })
  }
  
  return mockData
}

// Export all Phase 3 components for individual use
export {
  TemplateLibrary,
  QuickTemplateSelector,
  SmartSuggestions,
  BulkOperations
}
