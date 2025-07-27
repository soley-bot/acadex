'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, Plus, Trash2, Save, GripVertical, Eye } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface Question {
  id?: string
  question: string
  options: string[]
  correct_answer: number
  explanation?: string
  order_index: number
}

interface Quiz {
  id: string
  title: string
  description: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration_minutes: number
  total_questions: number
  is_published: boolean
  created_at: string
  updated_at: string
}

interface QuizFormProps {
  quiz?: Quiz | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function QuizForm({ quiz, isOpen, onClose, onSuccess }: QuizFormProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'details' | 'questions'>('details')

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    duration_minutes: 30,
    is_published: false
  })

  const [questions, setQuestions] = useState<Question[]>([])

  // Define loadQuestions before useEffect that uses it
  const loadQuestions = useCallback(async () => {
    if (!quiz?.id) return

    try {
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', quiz.id)
        .order('order_index')

      if (error) throw error

      setQuestions(data.map(q => ({
        id: q.id,
        question: q.question,
        options: q.options,
        correct_answer: q.correct_answer,
        explanation: q.explanation,
        order_index: q.order_index
      })))
    } catch (err) {
      console.error('Error loading questions:', err)
    }
  }, [quiz?.id])

  // Initialize form data when quiz changes
  useEffect(() => {
    if (quiz) {
      setFormData({
        title: quiz.title,
        description: quiz.description,
        category: quiz.category,
        difficulty: quiz.difficulty,
        duration_minutes: quiz.duration_minutes,
        is_published: quiz.is_published
      })
      loadQuestions()
    } else {
      setFormData({
        title: '',
        description: '',
        category: '',
        difficulty: 'beginner',
        duration_minutes: 30,
        is_published: false
      })
      setQuestions([])
    }
    setActiveTab('details')
    setError('')
  }, [quiz, isOpen, loadQuestions])

  const addQuestion = () => {
    const newQuestion: Question = {
      question: '',
      options: ['', '', '', ''],
      correct_answer: -1,
      explanation: '',
      order_index: questions.length
    }
    setQuestions([...questions, newQuestion])
  }

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updated = [...questions]
    updated[index] = { ...updated[index], [field]: value } as Question
    setQuestions(updated)
  }

  const updateQuestionOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...questions]
    if (!updated[questionIndex]) return
    
    const newOptions = [...updated[questionIndex].options]
    newOptions[optionIndex] = value
    updated[questionIndex] = { ...updated[questionIndex], options: newOptions } as Question
    setQuestions(updated)
  }

  const deleteQuestion = (index: number) => {
    const updated = questions.filter((_, i) => i !== index)
    // Update order indices
    updated.forEach((q, i) => {
      q.order_index = i
    })
    setQuestions(updated)
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

      if (questions.length === 0) {
        throw new Error('Please add at least one question')
      }

      // Validate questions
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i]
        if (!q || !q.question.trim()) {
          throw new Error(`Question ${i + 1}: Question text is required`)
        }
        if (q.options.some(opt => !opt.trim())) {
          throw new Error(`Question ${i + 1}: All options must be filled`)
        }
        if (q.correct_answer < 0 || q.correct_answer >= q.options.length) {
          throw new Error(`Question ${i + 1}: Please select a correct answer`)
        }
      }

      let quizId: string

      if (quiz?.id) {
        // Update existing quiz
        const { error } = await supabase
          .from('quizzes')
          .update({
            ...formData,
            total_questions: questions.length,
            updated_at: new Date().toISOString()
          })
          .eq('id', quiz.id)

        if (error) throw error
        quizId = quiz.id
      } else {
        // Create new quiz
        const { data, error } = await supabase
          .from('quizzes')
          .insert({
            ...formData,
            total_questions: questions.length
          })
          .select()
          .single()

        if (error) throw error
        quizId = data.id
      }

      // Delete existing questions if editing
      if (quiz?.id) {
        await supabase
          .from('quiz_questions')
          .delete()
          .eq('quiz_id', quiz.id)
      }

      // Insert questions
      const questionsToInsert = questions.map(q => ({
        quiz_id: quizId,
        question: q.question,
        options: q.options,
        correct_answer: q.correct_answer,
        explanation: q.explanation || null,
        order_index: q.order_index
      }))

      const { error: questionsError } = await supabase
        .from('quiz_questions')
        .insert(questionsToInsert)

      if (questionsError) throw questionsError

      onSuccess()
    } catch (err: any) {
      console.error('Error saving quiz:', err)
      if (err?.message) {
        setError(err.message)
      } else {
        setError('An unexpected error occurred while saving the quiz. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {quiz ? 'Edit Quiz' : 'Create New Quiz'}
            </h2>
            <p className="text-gray-600 mt-1">
              {quiz ? 'Update quiz details and questions' : 'Build an interactive quiz for your students'}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'details'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Quiz Details
            </button>
            <button
              onClick={() => setActiveTab('questions')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'questions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Questions ({questions.length})
            </button>
          </nav>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-400">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'details' ? (
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quiz Title *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter quiz title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="">Select a category</option>
                      <option value="english">English</option>
                      <option value="grammar">Grammar</option>
                      <option value="vocabulary">Vocabulary</option>
                      <option value="pronunciation">Pronunciation</option>
                      <option value="writing">Writing</option>
                      <option value="reading">Reading</option>
                      <option value="listening">Listening</option>
                      <option value="speaking">Speaking</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulty Level
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.duration_minutes}
                      onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe what this quiz covers..."
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_published"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={formData.is_published}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  />
                  <label htmlFor="is_published" className="ml-2 block text-sm text-gray-900">
                    Publish quiz (make it available to students)
                  </label>
                </div>
              </form>
            </div>
          ) : (
            <div className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Quiz Questions</h3>
                  <p className="text-gray-600">Add and manage questions for your quiz</p>
                </div>
                <button
                  onClick={addQuestion}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add Question
                </button>
              </div>

              <div className="space-y-6">
                {questions.map((question, questionIndex) => (
                  <div key={questionIndex} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
                        <h4 className="font-medium text-gray-900">Question {questionIndex + 1}</h4>
                      </div>
                      <button
                        onClick={() => deleteQuestion(questionIndex)}
                        className="text-red-600 hover:text-red-700 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Question Text *
                        </label>
                        <textarea
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={question.question}
                          onChange={(e) => updateQuestion(questionIndex, 'question', e.target.value)}
                          placeholder="Enter your question..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Answer Options *
                        </label>
                        <p className="text-sm text-gray-500 mb-3">Select the correct answer by clicking the radio button</p>
                        <div className="space-y-2">
                          {question.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center gap-3">
                              <input
                                type="radio"
                                name={`correct-${questionIndex}`}
                                checked={question.correct_answer === optionIndex}
                                onChange={() => updateQuestion(questionIndex, 'correct_answer', optionIndex)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                              />
                              <input
                                type="text"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={option}
                                onChange={(e) => updateQuestionOption(questionIndex, optionIndex, e.target.value)}
                                placeholder={`Option ${optionIndex + 1}`}
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Explanation (Optional)
                        </label>
                        <textarea
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={question.explanation || ''}
                          onChange={(e) => updateQuestion(questionIndex, 'explanation', e.target.value)}
                          placeholder="Explain why this is the correct answer..."
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {questions.length === 0 && (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <p className="text-gray-500 mb-4">No questions added yet</p>
                    <button
                      onClick={addQuestion}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                      Add Your First Question
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              {questions.length} question{questions.length !== 1 ? 's' : ''} • ~{formData.duration_minutes} min
            </span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {loading ? 'Saving...' : quiz ? 'Update Quiz' : 'Create Quiz'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
