'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Brain, X, Save } from 'lucide-react'
import { logger } from '@/lib/logger'

interface SimpleAIQuizCreatorProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function SimpleAIQuizCreator({ isOpen, onClose, onSuccess }: SimpleAIQuizCreatorProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    duration_minutes: 30,
    is_published: false,
    // AI-specific fields
    ai_prompt: '',
    question_count: 10,
    question_types: ['multiple_choice'] as ('multiple_choice' | 'true_false' | 'fill_blank')[],
    include_explanations: true
  })

  const handleQuestionTypeToggle = (type: 'multiple_choice' | 'true_false' | 'fill_blank') => {
    setFormData(prev => ({
      ...prev,
      question_types: prev.question_types.includes(type)
        ? prev.question_types.filter(t => t !== type)
        : [...prev.question_types, type]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setError('')

    try {
      // Validation
      if (!formData.title.trim() || !formData.description.trim() || !formData.category) {
        throw new Error('Please fill in all required fields')
      }

      if (!formData.ai_prompt.trim()) {
        throw new Error('Please provide an AI prompt for question generation')
      }

      if (formData.question_types.length === 0) {
        throw new Error('Please select at least one question type')
      }

      // Generate quiz using AI
      const aiRequest = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        difficulty: formData.difficulty,
        topic: formData.title, // Use title as topic
        question_count: formData.question_count,
        question_types: formData.question_types,
        duration_minutes: formData.duration_minutes,
        passing_score: 70,
        include_explanations: formData.include_explanations,
        content_focus: '',
        learning_objectives: [],
        custom_prompt: formData.ai_prompt
      }

      logger.info('Sending AI generation request', { title: formData.title })

      // Add timeout to prevent infinite loading
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

      const response = await fetch('/api/admin/generate-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(aiRequest),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate quiz')
      }

      const generatedQuiz = await response.json()
      logger.info('AI quiz generated successfully', { questionsCount: generatedQuiz.questions?.length })

      // Save the quiz to database
      logger.info('Saving quiz to database...')
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .insert({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          difficulty: formData.difficulty,
          duration_minutes: formData.duration_minutes,
          is_published: formData.is_published,
          total_questions: generatedQuiz.questions.length
        })
        .select()
        .single()

      if (quizError) {
        logger.error('Quiz insertion failed', { error: quizError })
        throw quizError
      }

      logger.info('Quiz saved successfully', { quizId: quizData.id })

      // Save the generated questions
      logger.info('Saving questions to database...')
      const questionsToInsert = generatedQuiz.questions.map((q: any, index: number) => ({
        quiz_id: quizData.id,
        question: q.question,
        question_type: q.question_type,
        options: q.question_type === 'fill_blank' ? [] : q.options,
        correct_answer: q.question_type === 'fill_blank' ? 0 : (q.correct_answer as number),
        correct_answer_text: q.question_type === 'fill_blank' ? (q.correct_answer as string) : null,
        explanation: q.explanation || null,
        order_index: index,
        points: q.points || 1
      }))

      const { error: questionsError } = await supabase
        .from('quiz_questions')
        .insert(questionsToInsert)

      if (questionsError) {
        logger.error('Questions insertion failed', { error: questionsError })
        throw questionsError
      }

      logger.info('Questions saved successfully', { questionsCount: questionsToInsert.length })

      logger.info('AI Quiz created successfully', { quizId: quizData.id, questionsCount: questionsToInsert.length })
      onSuccess()
      onClose()

    } catch (err: any) {
      logger.error('Error creating AI quiz:', err)
      if (err.name === 'AbortError') {
        setError('Request timed out. Please try again with a shorter prompt or fewer questions.')
      } else {
        setError(err.message || 'An unexpected error occurred')
      }
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Brain size={24} color="white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Create Quiz with AI</h2>
                <p className="text-white/80 text-sm">Generate questions automatically using AI</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <X size={20} color="white" />
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Quiz Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Quiz Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quiz Title *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Present Simple Grammar Quiz"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="180"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) || 30 }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of what this quiz covers..."
                />
              </div>
            </div>

            {/* AI Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">AI Configuration</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AI Prompt for Question Generation *
                </label>
                <textarea
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={5}
                  value={formData.ai_prompt}
                  onChange={(e) => setFormData(prev => ({ ...prev, ai_prompt: e.target.value }))}
                  placeholder="Create practical grammar questions that test correct usage in real situations. Focus on common mistakes students make with Present Simple tense. Include questions about daily routines, habits, and facts. Test ability to choose correct verb forms in context rather than asking about grammar rules."
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 Be specific about what type of questions you want. Focus on practical usage for better learning outcomes.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Questions
                  </label>
                  <input
                    type="number"
                    min="3"
                    max="50"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    value={formData.question_count}
                    onChange={(e) => setFormData(prev => ({ ...prev, question_count: parseInt(e.target.value) || 10 }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Include Explanations
                  </label>
                  <div className="flex items-center mt-2">
                    <input
                      type="checkbox"
                      id="include_explanations"
                      checked={formData.include_explanations}
                      onChange={(e) => setFormData(prev => ({ ...prev, include_explanations: e.target.checked }))}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label htmlFor="include_explanations" className="ml-2 text-sm text-gray-700">
                      Include detailed explanations
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Question Types *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { key: 'multiple_choice' as const, label: 'Multiple Choice' },
                    { key: 'true_false' as const, label: 'True/False' },
                    { key: 'fill_blank' as const, label: 'Fill in the Blank' }
                  ].map((type) => (
                    <div
                      key={type.key}
                      className={`border rounded-lg p-3 cursor-pointer transition-all ${
                        formData.question_types.includes(type.key)
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onClick={() => handleQuestionTypeToggle(type.key)}
                    >
                      <div className="flex items-center">
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
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_published"
                  checked={formData.is_published}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_published: e.target.checked }))}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="is_published" className="ml-2 text-sm text-gray-700">
                  Publish quiz immediately
                </label>
              </div>
            </div>
          </form>
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="border-t p-6 bg-gray-50 flex items-center justify-between flex-shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium"
          >
            Cancel
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={loading || !formData.title || !formData.description || !formData.category || !formData.ai_prompt}
            className="px-8 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating Quiz...
              </>
            ) : (
              <>
                <Save size={16} />
                Create Quiz with AI
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
