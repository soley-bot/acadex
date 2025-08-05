'use client'

import { logger } from '@/lib/logger'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { BaseModal } from '@/components/ui/BaseModal'
import Icon from '@/components/ui/Icon'
import { Brain, X } from 'lucide-react'

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
  options?: string[] // For multiple choice
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
  const [generating, setGenerating] = useState(false)
  const [step, setStep] = useState(1)
  const [error, setError] = useState('')
  const [apiConnected, setApiConnected] = useState<boolean | null>(null)

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

  const testAPIConnection = async () => {
    try {
      const response = await fetch('/api/admin/generate-quiz', {
        method: 'GET',
        credentials: 'include'
      })
      const data = await response.json()
      setApiConnected(data.success)
      if (!data.success) {
        setError(data.message || 'AI API not configured')
      }
    } catch (err) {
      setApiConnected(false)
      setError('Failed to test AI connection')
    }
  }

  const handleQuestionTypeToggle = (type: 'multiple_choice' | 'true_false' | 'fill_blank') => {
    setFormData(prev => ({
      ...prev,
      question_types: prev.question_types.includes(type)
        ? prev.question_types.filter(t => t !== type)
        : [...prev.question_types, type]
    }))
  }

  const addLearningObjective = () => {
    if (currentObjective.trim()) {
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

  const generateQuiz = async () => {
    if (!user) return

    setGenerating(true)
    setError('')

    try {
      // Validation
      if (!formData.title.trim() || !formData.topic.trim() || !formData.category.trim()) {
        throw new Error('Please fill in all required fields')
      }

      if (formData.question_types.length === 0) {
        throw new Error('Please select at least one question type')
      }

      if (formData.question_count < 3 || formData.question_count > 50) {
        throw new Error('Question count must be between 3 and 50')
      }

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
      
      // Debug: Log the generated quiz
      console.log('✅ Generated Quiz:', generatedQuiz)
      console.log('📝 Custom Prompt Used:', formData.custom_prompt ? 'Yes' : 'No')
      
      onQuizGenerated(generatedQuiz)
      onClose() // Close the modal after successful generation

    } catch (err: any) {
      logger.error('Error generating quiz:', err)
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setGenerating(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Brain size={24} color="white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">AI Quiz Generator</h2>
                <p className="text-white/80 text-sm">Create engaging quizzes with artificial intelligence</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <X size={20} color="white" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-4 mt-6">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNum ? 'bg-white text-purple-600' : 'bg-white/20 text-white/60'
                }`}>
                  {stepNum}
                </div>
                {stepNum < 3 && (
                  <div className={`w-12 h-0.5 mx-2 ${
                    step > stepNum ? 'bg-white' : 'bg-white/20'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Basic Quiz Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quiz Title *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., English Grammar Fundamentals"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                    Difficulty Level *
                  </label>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    value={formData.difficulty}
                    onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as any }))}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Topic/Subject *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    value={formData.topic}
                    onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                    placeholder="e.g., Present Perfect Tense"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of what this quiz covers..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content Focus
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={formData.content_focus}
                  onChange={(e) => setFormData(prev => ({ ...prev, content_focus: e.target.value }))}
                  placeholder="e.g., Real-world applications, Exam preparation, Conversational skills"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom AI Prompt
                  <span className="text-gray-500 text-xs ml-2">(Optional - Leave empty to use default prompt)</span>
                </label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={4}
                  value={formData.custom_prompt}
                  onChange={(e) => setFormData(prev => ({ ...prev, custom_prompt: e.target.value }))}
                  placeholder="Create practical grammar questions that test correct usage in real situations. Focus on common mistakes students make with Present Simple tense. Include questions about daily routines, habits, and facts. Test ability to choose correct verb forms in context rather than asking about grammar rules. Examples: 'She ___ to work every day' (go/goes), or 'Which sentence is correct?' with real conversation examples."
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 Tip: Be specific about the type of questions you want. Focus on practical usage rather than theoretical concepts for better learning outcomes.
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Quiz Configuration */}
          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Quiz Configuration</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Questions
                  </label>
                  <input
                    type="number"
                    min="3"
                    max="50"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                    max="180"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                    { key: 'multiple_choice' as const, label: 'Multiple Choice', desc: '4 options to choose from' },
                    { key: 'true_false' as const, label: 'True/False', desc: 'Simple true or false questions' },
                    { key: 'fill_blank' as const, label: 'Fill in the Blank', desc: 'Complete the sentence' }
                  ].map((type) => (
                    <div
                      key={type.key}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        formData.question_types.includes(type.key)
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onClick={() => handleQuestionTypeToggle(type.key)}
                    >
                      <div className="flex items-center mb-2">
                        <input
                          type="checkbox"
                          checked={formData.question_types.includes(type.key)}
                          onChange={() => handleQuestionTypeToggle(type.key)}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 text-sm font-medium text-gray-700">
                          {type.label}
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">{type.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="include_explanations"
                  checked={formData.include_explanations}
                  onChange={(e) => setFormData(prev => ({ ...prev, include_explanations: e.target.checked }))}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="include_explanations" className="ml-2 text-sm text-gray-700">
                  Include detailed explanations for answers
                </label>
              </div>
            </div>
          )}

          {/* Step 3: Learning Objectives */}
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Learning Objectives</h3>
              <p className="text-gray-600">Define what students should achieve after taking this quiz</p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Learning Objective
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    value={currentObjective}
                    onChange={(e) => setCurrentObjective(e.target.value)}
                    placeholder="e.g., Students will be able to identify correct grammar usage"
                    onKeyPress={(e) => e.key === 'Enter' && addLearningObjective()}
                  />
                  <button
                    type="button"
                    onClick={addLearningObjective}
                    disabled={!currentObjective.trim()}
                    className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>
              </div>

              {formData.learning_objectives.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Objectives
                  </label>
                  <div className="space-y-2">
                    {formData.learning_objectives.map((objective, index) => (
                      <div key={index} className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
                        <Icon name="check" size={16} className="text-green-600" />
                        <span className="flex-1 text-sm">{objective}</span>
                        <button
                          onClick={() => removeLearningObjective(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Icon name="close" size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quiz Preview */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl border border-purple-200">
                <h4 className="font-medium text-gray-900 mb-4">Quiz Preview</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Title:</span>
                    <p className="font-medium">{formData.title || 'Quiz Title'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Category:</span>
                    <p className="font-medium">{formData.category || 'Category'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Questions:</span>
                    <p className="font-medium">{formData.question_count} questions</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Duration:</span>
                    <p className="font-medium">{formData.duration_minutes} minutes</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Question Types:</span>
                    <p className="font-medium">{formData.question_types.join(', ')}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Passing Score:</span>
                    <p className="font-medium">{formData.passing_score}%</p>
                  </div>
                </div>
                {formData.custom_prompt && (
                  <div className="mt-4 pt-4 border-t border-purple-200">
                    <span className="text-gray-600 text-sm">Custom Prompt:</span>
                    <p className="text-sm text-gray-700 mt-1 bg-white/50 p-2 rounded border italic">
                      {formData.custom_prompt.substring(0, 150)}
                      {formData.custom_prompt.length > 150 ? '...' : ''}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="border-t p-6 bg-gray-50 flex items-center justify-between flex-shrink-0">
          <div className="flex gap-3">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Previous
              </button>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium"
            >
              Cancel
            </button>
            
            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
              >
                Next
              </button>
            ) : (
              <button
                onClick={generateQuiz}
                disabled={generating || !formData.title || !formData.topic || !formData.category}
                className="px-8 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {generating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Brain size={16} />
                    Generate Quiz
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
