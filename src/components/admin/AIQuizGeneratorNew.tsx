'use client'

import { logger } from '@/lib/logger'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { BaseModal } from '@/components/ui/BaseModal'
import Icon from '@/components/ui/Icon'
import { Brain } from 'lucide-react'

export interface QuizGenerationRequest {
  title: string
  description: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  topic: string
  question_count: number
  question_types: ('multiple_choice' | 'true_false' | 'fill_blank')[]
  duration_minutes: number
  passing_score: number
  include_explanations: boolean
  content_focus: string
  learning_objectives: string[]
  custom_prompt?: string
}

export interface GeneratedQuizQuestion {
  question: string
  question_type: 'multiple_choice' | 'true_false' | 'fill_blank'
  options?: string[]
  correct_answer: string | number
  explanation: string
  order_index: number
  points: number
}

export interface GeneratedQuiz {
  title: string
  description: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration_minutes: number
  passing_score: number
  questions: GeneratedQuizQuestion[]
}

interface AIQuizGeneratorProps {
  isOpen: boolean
  onClose: () => void
  onQuizGenerated: (quiz: GeneratedQuiz) => void
}

export function AIQuizGenerator({ isOpen, onClose, onQuizGenerated }: AIQuizGeneratorProps) {
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState<GeneratedQuiz | null>(null)

  const [formData, setFormData] = useState<QuizGenerationRequest>({
    title: '',
    description: '',
    category: '',
    difficulty: 'beginner',
    topic: '',
    question_count: 10,
    question_types: ['multiple_choice'],
    duration_minutes: 20,
    passing_score: 70,
    include_explanations: true,
    content_focus: '',
    learning_objectives: [],
    custom_prompt: ''
  })

  const [currentObjective, setCurrentObjective] = useState('')

  const addLearningObjective = () => {
    if (currentObjective.trim() && !formData.learning_objectives.includes(currentObjective.trim())) {
      setFormData(prev => ({
        ...prev,
        learning_objectives: [...prev.learning_objectives, currentObjective.trim()]
      }))
      setCurrentObjective('')
    }
  }

  const removeLearningObjective = (index: number) => {
    setFormData(prev => ({
      ...prev,
      learning_objectives: prev.learning_objectives.filter((_, i) => i !== index)
    }))
  }

  const handleQuestionTypeToggle = (type: 'multiple_choice' | 'true_false' | 'fill_blank') => {
    setFormData(prev => ({
      ...prev,
      question_types: prev.question_types.includes(type)
        ? prev.question_types.filter(t => t !== type)
        : [...prev.question_types, type]
    }))
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.title.trim() && formData.category && formData.topic.trim()
      case 2:
        return formData.question_types.length > 0 && formData.question_count >= 3
      case 3:
        return true
      case 4:
        return preview !== null
      default:
        return false
    }
  }

  const generateQuiz = async () => {
    if (!user) return

    setGenerating(true)
    setError('')

    try {
      const response = await fetch('/api/admin/generate-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate quiz')
      }

      const generatedQuiz = await response.json()
      
      if (currentStep === 3) {
        // Generate preview
        setPreview(generatedQuiz)
        setCurrentStep(4)
      } else {
        // Final generation
        onQuizGenerated(generatedQuiz)
      }

    } catch (err: any) {
      logger.error('Error generating quiz:', err)
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setGenerating(false)
    }
  }

  const confirmGeneration = () => {
    if (preview) {
      onQuizGenerated(preview)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quiz Title *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., English Grammar: Present Perfect Tense"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of what this quiz covers..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    >
                      <option value="">Select category</option>
                      <option value="English Grammar">English Grammar</option>
                      <option value="Vocabulary">Vocabulary</option>
                      <option value="Reading Comprehension">Reading Comprehension</option>
                      <option value="Writing Skills">Writing Skills</option>
                      <option value="Speaking Practice">Speaking Practice</option>
                      <option value="Business English">Business English</option>
                      <option value="Academic English">Academic English</option>
                      <option value="General Knowledge">General Knowledge</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulty Level
                    </label>
                    <select
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      value={formData.difficulty}
                      onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as any }))}
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Main Topic *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    value={formData.topic}
                    onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                    placeholder="e.g., Present Perfect Tense, Business Vocabulary, etc."
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Question Configuration</h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Questions
                    </label>
                    <input
                      type="number"
                      min="3"
                      max="30"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      value={formData.question_count}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        question_count: parseInt(e.target.value) || 10 
                      }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="120"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      value={formData.duration_minutes}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        duration_minutes: parseInt(e.target.value) || 20 
                      }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Passing Score (%)
                    </label>
                    <input
                      type="number"
                      min="50"
                      max="100"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      value={formData.passing_score}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        passing_score: parseInt(e.target.value) || 70 
                      }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Question Types *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { key: 'multiple_choice' as const, label: 'Multiple Choice', icon: 'menu' },
                      { key: 'true_false' as const, label: 'True/False', icon: 'check-circle' },
                      { key: 'fill_blank' as const, label: 'Fill in the Blank', icon: 'edit' }
                    ].map((type) => (
                      <label
                        key={type.key}
                        className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          formData.question_types.includes(type.key)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.question_types.includes(type.key)}
                          onChange={() => handleQuestionTypeToggle(type.key)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <Icon name={type.icon as any} size={20} className="text-gray-600" />
                        <span className="font-medium text-gray-900">{type.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="include_explanations"
                    checked={formData.include_explanations}
                    onChange={(e) => setFormData(prev => ({ ...prev, include_explanations: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="include_explanations" className="text-sm font-medium text-gray-700">
                    Include detailed explanations for answers
                  </label>
                </div>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Objectives & Focus</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content Focus
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    rows={3}
                    value={formData.content_focus}
                    onChange={(e) => setFormData(prev => ({ ...prev, content_focus: e.target.value }))}
                    placeholder="Describe what specific aspects or concepts should be emphasized in the quiz..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Learning Objectives
                  </label>
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      value={currentObjective}
                      onChange={(e) => setCurrentObjective(e.target.value)}
                      placeholder="e.g., Students will be able to use present perfect tense correctly"
                      onKeyPress={(e) => e.key === 'Enter' && addLearningObjective()}
                    />
                    <button
                      type="button"
                      onClick={addLearningObjective}
                      disabled={!currentObjective.trim()}
                      className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Add
                    </button>
                  </div>

                  {formData.learning_objectives.length > 0 && (
                    <div className="space-y-2">
                      {formData.learning_objectives.map((objective, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                          <Icon name="target" size={16} className="text-blue-600 flex-shrink-0" />
                          <span className="flex-1 text-sm text-gray-700">{objective}</span>
                          <button
                            onClick={() => removeLearningObjective(index)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                            <Icon name="close" size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quiz Preview</h3>
              {preview ? (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                    <h4 className="text-lg font-semibold text-blue-900 mb-2">{preview.title}</h4>
                    <p className="text-blue-700 mb-4">{preview.description}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-blue-800">Questions:</span>
                        <span className="ml-2 text-blue-700">{preview.questions.length}</span>
                      </div>
                      <div>
                        <span className="font-medium text-blue-800">Duration:</span>
                        <span className="ml-2 text-blue-700">{preview.duration_minutes} min</span>
                      </div>
                      <div>
                        <span className="font-medium text-blue-800">Difficulty:</span>
                        <span className="ml-2 text-blue-700 capitalize">{preview.difficulty}</span>
                      </div>
                      <div>
                        <span className="font-medium text-blue-800">Pass Score:</span>
                        <span className="ml-2 text-blue-700">{preview.passing_score}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h5 className="font-medium text-gray-900">Sample Questions:</h5>
                    {preview.questions.slice(0, 3).map((question, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </span>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 mb-2">{question.question}</p>
                            {question.question_type === 'multiple_choice' && question.options && (
                              <div className="space-y-1">
                                {question.options.map((option, optIndex) => (
                                  <div key={optIndex} className="text-sm text-gray-600">
                                    {String.fromCharCode(65 + optIndex)}. {option}
                                  </div>
                                ))}
                              </div>
                            )}
                            <div className="mt-2 text-xs text-blue-600 capitalize">
                              {question.question_type.replace('_', ' ')} question
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {preview.questions.length > 3 && (
                      <p className="text-sm text-gray-500 text-center">
                        ... and {preview.questions.length - 3} more questions
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Brain size={48} className="text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Generate preview to see quiz structure</p>
                </div>
              )}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="AI Quiz Generator"
      subtitle="Create intelligent quizzes with AI assistance"
      size="xl"
      headerIcon={<Brain size={24} color="white" />}
      headerGradient="purple"
      footer={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  stepNum < currentStep 
                    ? 'bg-green-100 text-green-700 border-2 border-green-300' 
                    : stepNum === currentStep 
                    ? 'bg-blue-100 text-blue-700 border-2 border-blue-300' 
                    : 'bg-gray-100 text-gray-500 border-2 border-gray-200'
                }`}>
                  {stepNum < currentStep ? (
                    <Icon name="check" size={14} />
                  ) : (
                    stepNum
                  )}
                </div>
                {stepNum < 4 && (
                  <div className={`w-8 h-0.5 mx-1 ${
                    stepNum < currentStep ? 'bg-green-300' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            {currentStep > 1 && (
              <button
                onClick={() => setCurrentStep(prev => prev - 1)}
                disabled={generating}
                className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
              >
                Previous
              </button>
            )}
            
            {currentStep < 3 ? (
              <button
                onClick={() => setCurrentStep(prev => prev + 1)}
                disabled={!canProceed() || generating}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            ) : currentStep === 3 ? (
              <button
                onClick={generateQuiz}
                disabled={generating}
                className="px-8 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {generating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating Preview...
                  </>
                ) : (
                  <>
                    <Icon name="eye" size={16} />
                    Generate Preview
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={confirmGeneration}
                disabled={!preview || generating}
                className="px-8 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Icon name="check" size={16} />
                Create Quiz
              </button>
            )}
          </div>
        </div>
      }
    >
      <div className="min-h-[400px]">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
            <div className="flex items-start gap-3">
              <Icon name="warning" size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Error</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {renderStepContent()}
      </div>
    </BaseModal>
  )
}
