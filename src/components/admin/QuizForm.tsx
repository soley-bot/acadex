'use client'

import { logger } from '@/lib/logger'

import { useState, useEffect, useCallback } from 'react'
import { X, Plus, Trash2, Save, GripVertical, Eye } from 'lucide-react'
import { supabase, Quiz, QuizQuestion } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { uploadQuizImage } from '@/lib/storage'

interface Question {
  id?: string
  question: string
  options: string[]
  correct_answer: number
  explanation?: string
  order_index: number
  points?: number
  difficulty_level?: 'easy' | 'medium' | 'hard'
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
    image_url: '',
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
      logger.error('Error loading questions:', err)
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
        image_url: quiz.image_url || '',
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
        image_url: '',
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
      logger.error('Error saving quiz:', err)
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
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-200">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between p-6 sm:p-8 border-b bg-gradient-to-r from-gray-50 via-white to-purple-50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                {quiz ? 'Edit Quiz' : 'Create New Quiz'}
              </h2>
              <p className="text-gray-600 text-lg mt-1">
                {quiz ? 'Update quiz content and settings' : 'Build interactive assessments for your students'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-white/50 rounded-lg"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Enhanced Tab Navigation */}
        <div className="bg-gray-50 border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-6 py-4 text-sm font-semibold border-b-2 transition-all duration-200 ${
                activeTab === 'details'
                  ? 'border-purple-500 text-purple-600 bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${activeTab === 'details' ? 'bg-purple-500' : 'bg-gray-400'}`}></div>
                Quiz Details
              </div>
            </button>
            <button
              onClick={() => setActiveTab('questions')}
              className={`px-6 py-4 text-sm font-semibold border-b-2 transition-all duration-200 ${
                activeTab === 'questions'
                  ? 'border-purple-500 text-purple-600 bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${activeTab === 'questions' ? 'bg-purple-500' : 'bg-gray-400'}`}></div>
                Questions
                <span className={`px-2 py-1 rounded-full text-xs ${
                  activeTab === 'questions' ? 'bg-purple-100 text-purple-700' : 'bg-gray-200 text-gray-600'
                }`}>
                  {questions.length}
                </span>
              </div>
            </button>
          </nav>
        </div>

        {/* Enhanced Error Display */}
        {error && (
          <div className="p-4 bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-400">
            <div className="flex items-center">
              <div className="bg-red-500 p-1 rounded-full mr-3">
                <X className="h-4 w-4 text-white" />
              </div>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'details' ? (
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-base font-semibold text-gray-800 mb-3">
                      Quiz Title *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-4 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors font-medium"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter quiz title"
                    />
                  </div>

                  <div>
                    <label className="block text-base font-semibold text-gray-800 mb-3">
                      Category *
                    </label>
                    <select
                      required
                      className="w-full px-4 py-4 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors font-medium"
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
                    <label className="block text-base font-semibold text-gray-800 mb-3">
                      Difficulty Level
                    </label>
                    <select
                      className="w-full px-4 py-4 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors font-medium"
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-base font-semibold text-gray-800 mb-3">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="180"
                      className="w-full px-4 py-4 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors font-medium"
                      value={formData.duration_minutes}
                      onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-base font-semibold text-gray-800 mb-3">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={5}
                    className="w-full px-4 py-4 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors font-medium resize-vertical"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe what this quiz covers, difficulty level, and learning objectives..."
                  />
                </div>

                <div>
                  <label className="block text-base font-semibold text-gray-800 mb-3">
                    Quiz Image
                  </label>
                  <ImageUpload
                    value={formData.image_url}
                    onChange={(url) => setFormData({ ...formData, image_url: url || '' })}
                    onFileUpload={async (file) => {
                      // We'll use a temporary ID for new quizzes
                      const tempId = quiz?.id || 'temp-' + Date.now()
                      const result = await uploadQuizImage(file, tempId)
                      if (result.error) {
                        throw new Error(result.error)
                      }
                      return result.url!
                    }}
                    placeholder="Upload quiz image or enter URL"
                  />
                </div>

                <div className="flex items-center p-4 bg-purple-50 rounded-xl border border-purple-200">
                  <input
                    type="checkbox"
                    id="is_published"
                    className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    checked={formData.is_published}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  />
                  <label htmlFor="is_published" className="ml-3 block text-base font-medium text-gray-900">
                    Publish quiz (make it available to students)
                  </label>
                </div>
              </form>
            </div>
          ) : (
            <div className="p-8">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Quiz Questions</h3>
                  <p className="text-gray-600 text-base">Add and manage questions for your quiz</p>
                </div>
                <button
                  onClick={addQuestion}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 font-semibold text-base hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <Plus className="h-5 w-5" />
                  Add Question
                </button>
              </div>

              <div className="space-y-8">
                {questions.map((question, questionIndex) => (
                  <div key={questionIndex} className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <GripVertical className="h-6 w-6 text-gray-400 cursor-move" />
                        <h4 className="font-bold text-gray-900 text-lg">Question {questionIndex + 1}</h4>
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
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Question Text *
                        </label>
                        <textarea
                          rows={4}
                          className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent bg-background/50 backdrop-blur-sm resize-vertical"
                          value={question.question}
                          onChange={(e) => updateQuestion(questionIndex, 'question', e.target.value)}
                          placeholder="Enter your question clearly and concisely..."
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
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Explanation (Optional)
                        </label>
                        <textarea
                          rows={3}
                          className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent bg-background/50 backdrop-blur-sm resize-vertical"
                          value={question.explanation || ''}
                          onChange={(e) => updateQuestion(questionIndex, 'explanation', e.target.value)}
                          placeholder="Explain why this is the correct answer and provide additional context..."
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

        {/* Enhanced Footer */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">
                {questions.length} question{questions.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">
                ~{formData.duration_minutes} minutes
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-300 border-t-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {quiz ? 'Update Quiz' : 'Create Quiz'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
