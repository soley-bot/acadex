'use client'

import { useState } from 'react'
import { BaseModal } from '@/components/ui/BaseModal'
import { Brain, Loader2 } from 'lucide-react'

// Simplified interfaces to match the updated generator
export interface QuizGenerationRequest {
  topic: string
  question_count: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

export interface GeneratedQuizQuestion {
  question: string
  question_type: 'multiple_choice' | 'true_false'
  options?: string[]
  correct_answer: string | number
  explanation: string
}

export interface GeneratedQuiz {
  title: string
  description: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration_minutes: number
  questions: GeneratedQuizQuestion[]
}

interface AIQuizGeneratorProps {
  isOpen: boolean
  onClose: () => void
  onQuizGenerated: (quiz: GeneratedQuiz) => void
}

export function AIQuizGenerator({ isOpen, onClose, onQuizGenerated }: AIQuizGeneratorProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState<QuizGenerationRequest>({
    topic: '',
    question_count: 10,
    difficulty: 'beginner'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.topic.trim()) {
      setError('Please enter a topic for the quiz')
      return
    }

    if (formData.question_count < 3 || formData.question_count > 20) {
      setError('Question count must be between 3 and 20')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to generate quiz')
      }

      onQuizGenerated(result.quiz)
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to generate quiz')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <BaseModal 
      isOpen={isOpen} 
      onClose={onClose}
      title="AI Quiz Generator"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Topic Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quiz Topic *
          </label>
          <input
            type="text"
            value={formData.topic}
            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
            placeholder="e.g., Present Perfect Tense, Vocabulary, Grammar Basics"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
            required
          />
        </div>

        {/* Question Count */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Questions
          </label>
          <select
            value={formData.question_count}
            onChange={(e) => setFormData({ ...formData, question_count: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          >
            <option value={5}>5 Questions</option>
            <option value={10}>10 Questions</option>
            <option value={15}>15 Questions</option>
            <option value={20}>20 Questions</option>
          </select>
        </div>

        {/* Difficulty Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Difficulty Level
          </label>
          <select
            value={formData.difficulty}
            onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        {/* Info Box */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Brain className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">AI Quiz Generation</h4>
              <p className="text-sm text-blue-700 mt-1">
                The AI will create a mix of multiple choice and true/false questions 
                about your chosen topic with explanations for each answer.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !formData.topic.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4" />
                Generate Quiz
              </>
            )}
          </button>
        </div>
      </form>
    </BaseModal>
  )
}
