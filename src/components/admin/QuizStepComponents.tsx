import React, { useState, useCallback } from 'react'
import { Settings, Wand2, Plus, Trash2, ArrowLeft, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EnhancedQuizGenerationRequest } from '@/lib/enhanced-ai-services'
import type { QuizQuestion } from '@/lib/supabase'
import { useQuizValidation } from '@/hooks/useQuizValidation'

interface QuizWithQuestions {
  id?: string
  title: string
  description: string
  questions: QuizQuestion[]
  category?: string
  difficulty?: string
  duration_minutes?: number
}

// Progress Indicator Component
interface ProgressIndicatorProps {
  currentStep: number
  totalSteps: number
  stepNames: string[]
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ 
  currentStep, 
  totalSteps, 
  stepNames 
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      {stepNames.map((name, index) => (
        <div key={index} className="flex items-center">
          <div className={`
            w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
            ${index < currentStep 
              ? 'bg-green-500 text-white' 
              : index === currentStep 
                ? 'bg-primary text-white' 
                : 'bg-gray-200 text-gray-500'
            }
          `}>
            {index + 1}
          </div>
          <span className={`ml-2 text-sm ${
            index === currentStep ? 'text-primary font-medium' : 'text-gray-500'
          }`}>
            {name}
          </span>
          {index < totalSteps - 1 && (
            <div className={`w-8 h-0.5 ml-4 ${
              index < currentStep ? 'bg-green-500' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  )
}

// AI Configuration Panel Component
interface AIConfigurationPanelProps {
  config: EnhancedQuizGenerationRequest
  onConfigChange: (updates: Partial<EnhancedQuizGenerationRequest>) => void
  onGenerate: () => void
  isGenerating: boolean
}

export const AIConfigurationPanel: React.FC<AIConfigurationPanelProps> = ({
  config,
  onConfigChange,
  onGenerate,
  isGenerating
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const updateConfig = useCallback((updates: Partial<EnhancedQuizGenerationRequest>) => {
    onConfigChange(updates)
  }, [onConfigChange])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          <CardTitle>AI Quiz Configuration</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
            <input
              type="text"
              value={config.subject}
              onChange={(e) => updateConfig({ subject: e.target.value })}
              placeholder="e.g., English Grammar"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
            <input
              type="text"
              value={config.topic}
              onChange={(e) => updateConfig({ topic: e.target.value })}
              placeholder="e.g., Present Perfect Tense"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Question Count</label>
            <input
              type="number"
              min="1"
              max="50"
              value={config.questionCount}
              onChange={(e) => updateConfig({ questionCount: parseInt(e.target.value) || 10 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
            <select
              value={config.difficulty}
              onChange={(e) => updateConfig({ difficulty: e.target.value as 'beginner' | 'intermediate' | 'advanced' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
            <select
              value={config.quizLanguage || 'english'}
              onChange={(e) => updateConfig({ quizLanguage: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="english">English</option>
              <option value="khmer">Khmer</option>
              <option value="spanish">Spanish</option>
              <option value="french">French</option>
              <option value="arabic">Arabic</option>
            </select>
          </div>
        </div>

        {/* Advanced Configuration Toggle */}
        <div>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-primary hover:text-secondary font-medium text-sm flex items-center gap-1"
          >
            <Settings className="w-4 h-4" />
            {showAdvanced ? 'Hide' : 'Show'} Advanced Options
          </button>
        </div>

        {/* Advanced Configuration */}
        {showAdvanced && (
          <div className="space-y-4 border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Teaching Style</label>
                <select
                  value={config.teachingStyle || ''}
                  onChange={(e) => {
                    const value = e.target.value
                    updateConfig({ 
                      teachingStyle: value === '' ? undefined : value as 'academic' | 'practical' | 'conversational' | 'professional'
                    })
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Default</option>
                  <option value="academic">Academic</option>
                  <option value="practical">Practical</option>
                  <option value="conversational">Conversational</option>
                  <option value="professional">Professional</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assessment Focus</label>
                <select
                  value={config.assessmentType || ''}
                  onChange={(e) => {
                    const value = e.target.value
                    updateConfig({ 
                      assessmentType: value === '' ? undefined : value as 'knowledge_recall' | 'application' | 'analysis' | 'synthesis'
                    })
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Default</option>
                  <option value="knowledge_recall">Knowledge Recall</option>
                  <option value="application">Application</option>
                  <option value="analysis">Analysis</option>
                  <option value="synthesis">Synthesis</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Additional Context</label>
              <textarea
                value={config.customInstructions || ''}
                onChange={(e) => updateConfig({ customInstructions: e.target.value })}
                placeholder="Any specific requirements or context for the quiz..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Generate Button */}
        <div className="flex justify-end">
          <button
            onClick={onGenerate}
            disabled={isGenerating || !config.subject.trim() || !config.topic.trim()}
            className="bg-primary hover:bg-secondary text-white hover:text-black px-6 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Wand2 className="w-4 h-4" />
            {isGenerating ? 'Generating...' : 'Generate Quiz'}
          </button>
        </div>
      </CardContent>
    </Card>
  )
}

// Question Editor Component
interface QuestionEditorProps {
  question: QuizQuestion
  index: number
  onUpdate: (updates: Partial<QuizQuestion>) => void
  onRemove: () => void
  onDuplicate?: () => void
}

export const QuestionEditor: React.FC<QuestionEditorProps> = ({
  question,
  index,
  onUpdate,
  onRemove,
  onDuplicate
}) => {
  const { validateQuestion } = useQuizValidation()
  const validationErrors = validateQuestion(question)
  const errors = validationErrors.filter(e => e.severity === 'error')
  const warnings = validationErrors.filter(e => e.severity === 'warning')

  return (
    <Card className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Question {index + 1}</CardTitle>
          <div className="flex items-center gap-2">
            {onDuplicate && (
              <button
                onClick={onDuplicate}
                className="text-gray-600 hover:text-primary p-1"
                title="Duplicate question"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onRemove}
              className="text-red-600 hover:text-red-700 p-1"
              title="Remove question"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Validation Indicators */}
        {(errors.length > 0 || warnings.length > 0) && (
          <div className="space-y-1">
            {errors.map((error, i) => (
              <div key={i} className="text-red-600 text-sm flex items-center gap-1">
                <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                {error.message}
              </div>
            ))}
            {warnings.map((warning, i) => (
              <div key={i} className="text-yellow-600 text-sm flex items-center gap-1">
                <span className="w-1 h-1 bg-yellow-600 rounded-full"></span>
                {warning.message}
              </div>
            ))}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Question Type and Points */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Question Type</label>
            <select
              value={question.question_type}
              onChange={(e) => onUpdate({ question_type: e.target.value as QuizQuestion['question_type'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="multiple_choice">Multiple Choice</option>
              <option value="single_choice">Single Choice</option>
              <option value="true_false">True/False</option>
              <option value="fill_blank">Fill in the Blank</option>
              <option value="essay">Essay</option>
              <option value="matching">Matching</option>
              <option value="ordering">Ordering</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Points</label>
            <input
              type="number"
              min="1"
              value={question.points}
              onChange={(e) => onUpdate({ points: parseInt(e.target.value) || 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        {/* Question Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
          <textarea
            value={question.question}
            onChange={(e) => onUpdate({ question: e.target.value })}
            placeholder="Enter your question here..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Options for Multiple Choice */}
        {question.question_type === 'multiple_choice' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
            <div className="space-y-2">
              {question.options?.map((option: string, optionIndex: number) => (
                <div key={optionIndex} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`correct-${question.id}`}
                    checked={question.correct_answer === optionIndex}
                    onChange={() => onUpdate({ correct_answer: optionIndex })}
                    className="text-primary"
                  />
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const options = [...(question.options || [])]
                      options[optionIndex] = e.target.value
                      onUpdate({ options })
                    }}
                    placeholder={`Option ${optionIndex + 1}`}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* True/False Options */}
        {question.question_type === 'true_false' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Correct Answer</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`tf-${question.id}`}
                  checked={question.correct_answer === 1}
                  onChange={() => onUpdate({ correct_answer: 1 })}
                  className="text-primary"
                />
                True
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`tf-${question.id}`}
                  checked={question.correct_answer === 0}
                  onChange={() => onUpdate({ correct_answer: 0 })}
                  className="text-primary"
                />
                False
              </label>
            </div>
          </div>
        )}

        {/* Text Answer for Fill-in-the-blank and Essay */}
        {(question.question_type === 'fill_blank' || question.question_type === 'essay') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {question.question_type === 'essay' ? 'Sample Answer' : 'Correct Answer'}
            </label>
            <textarea
              value={question.correct_answer_text || ''}
              onChange={(e) => onUpdate({ correct_answer_text: e.target.value })}
              placeholder={question.question_type === 'essay' ? 'Provide a sample answer or key points...' : 'Enter the correct answer...'}
              rows={question.question_type === 'essay' ? 4 : 2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        )}

        {/* Explanation */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Explanation (Optional)</label>
          <textarea
            value={question.explanation || ''}
            onChange={(e) => onUpdate({ explanation: e.target.value })}
            placeholder="Explain why this is the correct answer..."
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </CardContent>
    </Card>
  )
}

export type { 
  QuizWithQuestions,
  ProgressIndicatorProps,
  AIConfigurationPanelProps,
  QuestionEditorProps
}
