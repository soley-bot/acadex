'use client'

import { logger } from '@/lib/logger'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { BaseModal } from '@/components/ui/BaseModal'
import Icon from '@/components/ui/Icon'
import { Layers, X } from 'lucide-react'
import { GeneratedQuiz } from './AIQuizGeneratorNew'

interface BulkQuizGenerationRequest {
  topic_base: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  quiz_count: number
  questions_per_quiz: number
  question_types: ('multiple_choice' | 'true_false' | 'fill_blank')[]
  duration_minutes: number
  passing_score: number
  include_explanations: boolean
  subtopics: string[]
}

interface BulkQuizGeneratorProps {
  isOpen: boolean
  onClose: () => void
  onQuizzesGenerated: (quizzes: GeneratedQuiz[]) => void
}

export function BulkQuizGenerator({ isOpen, onClose, onQuizzesGenerated }: BulkQuizGeneratorProps) {
  const { user } = useAuth()
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [generatedCount, setGeneratedCount] = useState(0)

  const [formData, setFormData] = useState<BulkQuizGenerationRequest>({
    topic_base: '',
    category: '',
    difficulty: 'beginner',
    quiz_count: 5,
    questions_per_quiz: 10,
    question_types: ['multiple_choice'],
    duration_minutes: 20,
    passing_score: 70,
    include_explanations: true,
    subtopics: []
  })

  const [currentSubtopic, setCurrentSubtopic] = useState('')

  const addSubtopic = () => {
    if (currentSubtopic.trim() && !formData.subtopics.includes(currentSubtopic.trim())) {
      setFormData(prev => ({
        ...prev,
        subtopics: [...prev.subtopics, currentSubtopic.trim()]
      }))
      setCurrentSubtopic('')
    }
  }

  const removeSubtopic = (index: number) => {
    setFormData(prev => ({
      ...prev,
      subtopics: prev.subtopics.filter((_, i) => i !== index)
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

  const generateBulkQuizzes = async () => {
    if (!user) return

    setGenerating(true)
    setError('')
    setGeneratedCount(0)

    try {
      // Validation
      if (!formData.topic_base.trim() || !formData.category.trim()) {
        throw new Error('Please fill in topic and category')
      }

      if (formData.question_types.length === 0) {
        throw new Error('Please select at least one question type')
      }

      if (formData.quiz_count < 1 || formData.quiz_count > 20) {
        throw new Error('Quiz count must be between 1 and 20')
      }

      const generatedQuizzes: GeneratedQuiz[] = []

      // Generate quizzes one by one
      for (let i = 0; i < formData.quiz_count; i++) {
        const subtopic = formData.subtopics[i % formData.subtopics.length] || formData.topic_base
        const quizNumber = i + 1

        const quizRequest = {
          title: `${formData.topic_base} - Quiz ${quizNumber}: ${subtopic}`,
          description: `Test your knowledge of ${subtopic} within ${formData.topic_base}`,
          category: formData.category,
          difficulty: formData.difficulty,
          topic: subtopic,
          question_count: formData.questions_per_quiz,
          question_types: formData.question_types,
          duration_minutes: formData.duration_minutes,
          passing_score: formData.passing_score,
          include_explanations: formData.include_explanations,
          content_focus: `Focus on ${subtopic} concepts and applications`,
          learning_objectives: [
            `Understand key concepts of ${subtopic}`,
            `Apply ${subtopic} knowledge in practical scenarios`,
            `Identify common patterns and principles in ${subtopic}`
          ]
        }

        const response = await fetch('/api/admin/generate-quiz', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(quizRequest)
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(`Quiz ${quizNumber} failed: ${errorData.error}`)
        }

        const generatedQuiz = await response.json()
        generatedQuizzes.push(generatedQuiz)
        setGeneratedCount(quizNumber)

        // Small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      onQuizzesGenerated(generatedQuizzes)

    } catch (err: any) {
      logger.error('Error generating bulk quizzes:', err)
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setGenerating(false)
    }
  }

  if (!isOpen) return null

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Bulk Quiz Generator"
      subtitle="Generate multiple related quizzes at once"
      size="xl"
      headerIcon={<Layers size={24} color="white" />}
      headerGradient="purple"
      footer={
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {formData.subtopics.length > 0 
              ? `Will create ${formData.quiz_count} quizzes covering different subtopics`
              : `Will create ${formData.quiz_count} quizzes on ${formData.topic_base || 'the main topic'}`
            }
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={generating}
              className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            
            <button
              onClick={generateBulkQuizzes}
              disabled={generating || !formData.topic_base || !formData.category || formData.question_types.length === 0}
              className="px-8 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {generating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Layers size={16} />
                  Generate {formData.quiz_count} Quizzes
                </>
              )}
            </button>
          </div>
        </div>
      }
    >
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {generating && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-6">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
                <span>Generating quiz {generatedCount} of {formData.quiz_count}...</span>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* Basic Configuration */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Main Topic *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={formData.topic_base}
                    onChange={(e) => setFormData(prev => ({ ...prev, topic_base: e.target.value }))}
                    placeholder="e.g., English Grammar"
                    disabled={generating}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    disabled={generating}
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={formData.difficulty}
                    onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as any }))}
                    disabled={generating}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Quizzes
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={formData.quiz_count}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      quiz_count: parseInt(e.target.value) || 5 
                    }))}
                    disabled={generating}
                  />
                </div>
              </div>
            </div>

            {/* Subtopics */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Subtopics</h3>
              <p className="text-gray-600 text-sm mb-4">Add specific subtopics to create focused quizzes for each area</p>
              
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={currentSubtopic}
                  onChange={(e) => setCurrentSubtopic(e.target.value)}
                  placeholder="e.g., Present Perfect Tense"
                  onKeyPress={(e) => e.key === 'Enter' && addSubtopic()}
                  disabled={generating}
                />
                <button
                  type="button"
                  onClick={addSubtopic}
                  disabled={!currentSubtopic.trim() || generating}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>

              {formData.subtopics.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.subtopics.map((subtopic, index) => (
                    <div key={index} className="bg-indigo-50 border border-indigo-200 rounded-full px-3 py-1 flex items-center gap-2">
                      <span className="text-sm text-indigo-700">{subtopic}</span>
                      <button
                        onClick={() => removeSubtopic(index)}
                        className="text-indigo-600 hover:text-indigo-800"
                        disabled={generating}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quiz Configuration */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quiz Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Questions per Quiz
                  </label>
                  <input
                    type="number"
                    min="3"
                    max="30"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={formData.questions_per_quiz}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      questions_per_quiz: parseInt(e.target.value) || 10 
                    }))}
                    disabled={generating}
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      duration_minutes: parseInt(e.target.value) || 20 
                    }))}
                    disabled={generating}
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={formData.passing_score}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      passing_score: parseInt(e.target.value) || 70 
                    }))}
                    disabled={generating}
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Question Types
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { key: 'multiple_choice' as const, label: 'Multiple Choice' },
                    { key: 'true_false' as const, label: 'True/False' },
                    { key: 'fill_blank' as const, label: 'Fill in the Blank' }
                  ].map((type) => (
                    <label key={type.key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.question_types.includes(type.key)}
                        onChange={() => handleQuestionTypeToggle(type.key)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        disabled={generating}
                      />
                      <span className="text-sm text-gray-700">{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-center">
                <input
                  type="checkbox"
                  id="bulk_include_explanations"
                  checked={formData.include_explanations}
                  onChange={(e) => setFormData(prev => ({ ...prev, include_explanations: e.target.checked }))}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  disabled={generating}
                />
                <label htmlFor="bulk_include_explanations" className="ml-2 text-sm text-gray-700">
                  Include detailed explanations for answers
                </label>
              </div>
            </div>
          </div>
    </BaseModal>
  )
}
