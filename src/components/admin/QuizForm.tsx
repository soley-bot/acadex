'use client'

import { logger } from '@/lib/logger'

import { useState, useEffect, useCallback } from 'react'
import { X, Plus, Trash2, Save, GripVertical, Eye, Brain } from 'lucide-react'
import { supabase, Quiz, QuizQuestion } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { uploadQuizImage } from '@/lib/storage'
import { AIQuizGenerator, GeneratedQuiz } from './AIQuizGenerator'

interface Question {
  id?: string
  question: string
  question_type?: 'multiple_choice' | 'true_false' | 'fill_blank'
  options: string[]
  correct_answer: number | string
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
  const [showAIGenerator, setShowAIGenerator] = useState(false)

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
  const [showAddQuestionDropdown, setShowAddQuestionDropdown] = useState(false)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showAddQuestionDropdown) {
        setShowAddQuestionDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showAddQuestionDropdown])

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
        question_type: q.question_type || 'multiple_choice',
        options: q.question_type === 'fill_blank' ? [] : (q.options || []),
        correct_answer: q.question_type === 'fill_blank' ? (q.correct_answer_text || '') : (q.correct_answer || 0),
        explanation: q.explanation,
        order_index: q.order_index,
        points: q.points || 1
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

  const addQuestion = (questionType: 'multiple_choice' | 'true_false' | 'fill_blank' = 'multiple_choice') => {
    const newQuestion: Question = {
      question: '',
      question_type: questionType,
      options: questionType === 'fill_blank' ? [] : 
               questionType === 'true_false' ? ['True', 'False'] : 
               ['', '', '', ''],
      correct_answer: questionType === 'fill_blank' ? '' : -1,
      explanation: '',
      order_index: questions.length,
      points: 1
    }
    setQuestions([...questions, newQuestion])
  }

  const handleAIQuizGenerated = (generatedQuiz: GeneratedQuiz) => {
    // Update form data with generated quiz info
    setFormData(prev => ({
      ...prev,
      title: generatedQuiz.title,
      description: generatedQuiz.description,
      category: generatedQuiz.category,
      difficulty: generatedQuiz.difficulty,
      duration_minutes: generatedQuiz.duration_minutes
    }))

    // Convert generated questions to our format
    const convertedQuestions: Question[] = generatedQuiz.questions.map((q, index) => ({
      question: q.question,
      question_type: q.question_type,
      options: q.options || [],
      correct_answer: q.correct_answer,
      explanation: q.explanation,
      order_index: index,
      points: q.points || 1
    }))

    setQuestions(convertedQuestions)
    setShowAIGenerator(false)
    setActiveTab('questions')
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

        const questionType = q.question_type || 'multiple_choice'

        if (questionType === 'fill_blank') {
          if (!q.correct_answer || (q.correct_answer as string).trim() === '') {
            throw new Error(`Question ${i + 1}: Correct answer is required for fill-in-the-blank questions`)
          }
        } else {
          // Multiple choice or true/false
          if (!q.options || q.options.length === 0) {
            throw new Error(`Question ${i + 1}: Answer options are required`)
          }
          
          if (questionType === 'multiple_choice' && q.options.some(opt => !opt.trim())) {
            throw new Error(`Question ${i + 1}: All options must be filled`)
          }
          
          if (typeof q.correct_answer !== 'number' || q.correct_answer < 0 || q.correct_answer >= q.options.length) {
            throw new Error(`Question ${i + 1}: Please select a correct answer`)
          }
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
      const questionsToInsert = questions.map(q => {
        const questionType = q.question_type || 'multiple_choice'
        return {
          quiz_id: quizId,
          question: q.question,
          question_type: questionType,
          options: questionType === 'fill_blank' ? [] : q.options,
          correct_answer: questionType === 'fill_blank' ? 0 : (q.correct_answer as number),
          correct_answer_text: questionType === 'fill_blank' ? (q.correct_answer as string) : null,
          explanation: q.explanation || null,
          order_index: q.order_index,
          points: q.points || 1
        }
      })

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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="surface-primary rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-subtle">
        {/* Enhanced Header with Better Typography */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">
                {quiz ? 'Edit Quiz' : 'Create New Quiz'}
              </h2>
              <p className="text-purple-100 text-lg mt-1">
                {quiz ? 'Update quiz content and settings' : 'Build interactive assessments for your students'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg absolute top-6 right-6"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Enhanced Tab Navigation */}
        <div className="surface-secondary border-b border-subtle">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-6 py-4 text-sm font-semibold border-b-2 transition-all duration-200 ${
                activeTab === 'details'
                  ? 'border-primary text-primary surface-primary'
                  : 'border-transparent text-tertiary hover:text-secondary hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${activeTab === 'details' ? 'bg-primary' : 'bg-gray-400'}`}></div>
                Quiz Details
              </div>
            </button>
            <button
              onClick={() => setActiveTab('questions')}
              className={`px-6 py-4 text-sm font-semibold border-b-2 transition-all duration-200 ${
                activeTab === 'questions'
                  ? 'border-primary text-primary surface-primary'
                  : 'border-transparent text-tertiary hover:text-secondary hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${activeTab === 'questions' ? 'bg-primary' : 'bg-gray-400'}`}></div>
                Questions
                <span className={`px-2 py-1 rounded-full text-xs ${
                  activeTab === 'questions' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'
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
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowAIGenerator(true)}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 font-semibold text-base hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    <Brain className="h-5 w-5" />
                    AI Generate
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => setShowAddQuestionDropdown(!showAddQuestionDropdown)}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 font-semibold text-base hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                      <Plus className="h-5 w-5" />
                      Add Question
                    </button>
                    {showAddQuestionDropdown && (
                      <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 min-w-48">
                        <button
                          onClick={() => {
                            addQuestion('multiple_choice')
                            setShowAddQuestionDropdown(false)
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-t-lg flex items-center gap-2"
                        >
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          Multiple Choice
                        </button>
                        <button
                          onClick={() => {
                            addQuestion('true_false')
                            setShowAddQuestionDropdown(false)
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          True/False
                        </button>
                        <button
                          onClick={() => {
                            addQuestion('fill_blank')
                            setShowAddQuestionDropdown(false)
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-b-lg flex items-center gap-2"
                        >
                          <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                          Fill in the Blank
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                {questions.map((question, questionIndex) => (
                  <div key={questionIndex} className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <GripVertical className="h-6 w-6 text-gray-400 cursor-move" />
                        <div>
                          <h4 className="font-bold text-gray-900 text-lg">Question {questionIndex + 1}</h4>
                          <span className="text-sm text-gray-500 capitalize">
                            {question.question_type?.replace('_', ' ') || 'Multiple Choice'}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteQuestion(questionIndex)}
                        className="text-red-600 hover:text-red-700 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      {/* Question Type Selector */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Question Type
                        </label>
                        <select
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          value={question.question_type || 'multiple_choice'}
                          onChange={(e) => {
                            const newType = e.target.value as 'multiple_choice' | 'true_false' | 'fill_blank'
                            const updated = [...questions]
                            
                            // Update the question type
                            updated[questionIndex] = { 
                              ...updated[questionIndex], 
                              question_type: newType 
                            } as Question
                            
                            // Reset options and correct answer based on type
                            if (newType === 'true_false') {
                              updated[questionIndex].options = ['True', 'False']
                              updated[questionIndex].correct_answer = 0
                            } else if (newType === 'fill_blank') {
                              updated[questionIndex].options = []
                              updated[questionIndex].correct_answer = ''
                            } else { // multiple_choice
                              updated[questionIndex].options = ['', '', '', '']
                              updated[questionIndex].correct_answer = 0
                            }
                            
                            setQuestions(updated)
                          }}
                        >
                          <option value="multiple_choice">Multiple Choice</option>
                          <option value="true_false">True/False</option>
                          <option value="fill_blank">Fill in the Blank</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Question Text *
                        </label>
                        <textarea
                          rows={4}
                          className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent bg-background/50 backdrop-blur-sm resize-vertical"
                          value={question.question}
                          onChange={(e) => updateQuestion(questionIndex, 'question', e.target.value)}
                          placeholder={
                            question.question_type === 'fill_blank' 
                              ? "Enter your question with a blank space (use _____ for the blank)..."
                              : "Enter your question clearly and concisely..."
                          }
                        />
                      </div>

                      {/* Answer Options - Different UI for each question type */}
                      {question.question_type === 'fill_blank' ? (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Correct Answer *
                          </label>
                          <input
                            type="text"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            value={question.correct_answer as string}
                            onChange={(e) => updateQuestion(questionIndex, 'correct_answer', e.target.value)}
                            placeholder="Enter the correct word/phrase for the blank"
                          />
                        </div>
                      ) : (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Answer Options *
                          </label>
                          <p className="text-sm text-gray-500 mb-3">
                            {question.question_type === 'true_false' 
                              ? 'Select whether the statement is true or false'
                              : 'Select the correct answer by clicking the radio button'
                            }
                          </p>
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
                                {question.question_type === 'true_false' ? (
                                  <span className="text-sm font-medium text-gray-700">{option}</span>
                                ) : (
                                  <input
                                    type="text"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={option}
                                    onChange={(e) => updateQuestionOption(questionIndex, optionIndex, e.target.value)}
                                    placeholder={`Option ${optionIndex + 1}`}
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

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
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={() => setShowAIGenerator(true)}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Brain className="h-4 w-4" />
                        Generate with AI
                      </button>
                      <button
                        onClick={() => addQuestion('multiple_choice')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                      >
                        Add Manually
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Footer */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-t border-gray-200 flex items-center justify-between flex-shrink-0">
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

      {/* AI Quiz Generator Modal */}
      <AIQuizGenerator
        isOpen={showAIGenerator}
        onClose={() => setShowAIGenerator(false)}
        onQuizGenerated={handleAIQuizGenerated}
      />
    </div>
  )
}
