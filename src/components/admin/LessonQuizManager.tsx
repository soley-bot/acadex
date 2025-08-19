'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit3, Trash2, CheckCircle, Book, Clock, Hash } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface QuizQuestion {
  id?: string
  question: string
  options: string[]
  correct_answer: number
  explanation?: string
  order_index: number
}

interface LessonQuiz {
  id?: string
  title: string
  description: string
  lesson_id?: string
  questions: QuizQuestion[]
  duration_minutes: number
  passing_score: number
}

interface LessonQuizManagerProps {
  lessonId?: string
  lessonTitle: string
  onQuizUpdated?: (quiz: LessonQuiz | null) => void
}

export function LessonQuizManager({ lessonId, lessonTitle, onQuizUpdated }: LessonQuizManagerProps) {
  const { user } = useAuth()
  const [quiz, setQuiz] = useState<LessonQuiz | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load existing quiz for this lesson
  useEffect(() => {
    const loadLessonQuiz = async () => {
      if (!lessonId) return
      
      try {
        const { data, error } = await supabase
          .from('quizzes')
          .select(`
            *,
            quiz_questions (*)
          `)
          .eq('lesson_id', lessonId)
          .single()

        if (error && error.code !== 'PGRST116') {
          throw error
        }

        if (data) {
          setQuiz({
            id: data.id,
            title: data.title,
            description: data.description,
            lesson_id: data.lesson_id,
            duration_minutes: data.duration_minutes,
            passing_score: data.passing_score,
            questions: data.quiz_questions?.map((q: any) => ({
              id: q.id,
              question: q.question,
              options: q.options,
              correct_answer: q.correct_answer,
              explanation: q.explanation,
              order_index: q.order_index
            })) || []
          })
        }
      } catch (err) {
        console.error('Error loading lesson quiz:', err)
      }
    }

    if (lessonId) {
      loadLessonQuiz()
    }
  }, [lessonId])

  const handleCreateQuiz = () => {
    setQuiz({
      title: `${lessonTitle} - Quiz`,
      description: `Test your understanding of ${lessonTitle}`,
      lesson_id: lessonId,
      duration_minutes: 5,
      passing_score: 70,
      questions: [
        {
          question: '',
          options: ['', '', '', ''],
          correct_answer: 0,
          explanation: '',
          order_index: 0
        }
      ]
    })
    setIsCreating(true)
    setIsEditing(true)
  }

  const handleSaveQuiz = async () => {
    if (!quiz || !user) return

    setLoading(true)
    setError(null)

    try {
      // Validate quiz
      if (!quiz.title.trim() || quiz.questions.length === 0) {
        throw new Error('Please provide quiz title and at least one question')
      }

      // Validate questions
      for (const question of quiz.questions) {
        if (!question.question.trim()) {
          throw new Error('All questions must have content')
        }
        if (question.options.some(opt => !opt.trim())) {
          throw new Error('All answer options must be filled')
        }
      }

      let quizId = quiz.id

      if (isCreating || !quizId) {
        // Create new quiz
        const { data, error } = await supabase
          .from('quizzes')
          .insert({
            title: quiz.title,
            description: quiz.description,
            lesson_id: lessonId,
            category: 'lesson-quiz',
            difficulty: 'beginner',
            duration_minutes: quiz.duration_minutes,
            total_questions: quiz.questions.length,
            passing_score: quiz.passing_score,
            max_attempts: 3,
            is_published: true
          })
          .select()
          .single()

        if (error) throw error
        quizId = data.id
      } else {
        // Update existing quiz
        const { error } = await supabase
          .from('quizzes')
          .update({
            title: quiz.title,
            description: quiz.description,
            duration_minutes: quiz.duration_minutes,
            total_questions: quiz.questions.length,
            passing_score: quiz.passing_score
          })
          .eq('id', quizId)

        if (error) throw error
      }

      // Delete existing questions if updating
      if (!isCreating && quizId) {
        await supabase
          .from('quiz_questions')
          .delete()
          .eq('quiz_id', quizId)
      }

      // Insert questions
      const questionsToInsert = quiz.questions.map(q => ({
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

      // Update local state
      setQuiz({ ...quiz, id: quizId })
      setIsCreating(false)
      setIsEditing(false)
      onQuizUpdated?.({ ...quiz, id: quizId })

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteQuiz = async () => {
    if (!quiz?.id || !confirm('Are you sure you want to delete this quiz?')) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', quiz.id)

      if (error) throw error

      setQuiz(null)
      setIsCreating(false)
      setIsEditing(false)
      onQuizUpdated?.(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const addQuestion = () => {
    if (!quiz) return
    
    setQuiz({
      ...quiz,
      questions: [
        ...quiz.questions,
        {
          question: '',
          options: ['', '', '', ''],
          correct_answer: 0,
          explanation: '',
          order_index: quiz.questions.length
        }
      ]
    })
  }

  const updateQuestion = (index: number, field: string, value: any) => {
    if (!quiz) return

    const updatedQuestions = [...quiz.questions]
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value } as QuizQuestion
    setQuiz({ ...quiz, questions: updatedQuestions })
  }

  const updateQuestionOption = (questionIndex: number, optionIndex: number, value: string) => {
    if (!quiz || !quiz.questions[questionIndex]) return

    const updatedQuestions = [...quiz.questions]
    if (!updatedQuestions[questionIndex]) return
    
    const updatedOptions = [...updatedQuestions[questionIndex].options]
    updatedOptions[optionIndex] = value
    updatedQuestions[questionIndex] = { ...updatedQuestions[questionIndex], options: updatedOptions }
    setQuiz({ ...quiz, questions: updatedQuestions })
  }

  const removeQuestion = (index: number) => {
    if (!quiz || quiz.questions.length <= 1) return

    const updatedQuestions = quiz.questions.filter((_, i) => i !== index)
    // Update order indices
    updatedQuestions.forEach((q, i) => {
      q.order_index = i
    })
    setQuiz({ ...quiz, questions: updatedQuestions })
  }

  if (!quiz && !isCreating) {
    return (
      <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-secondary to-secondary/90 rounded-full flex items-center justify-center mx-auto mb-4">
            <Book className="w-8 h-8 text-current" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No Quiz Available</h3>
          <p className="text-gray-600 mb-6">Create a quiz to test student understanding of this lesson.</p>
          <button
            onClick={handleCreateQuiz}
            className="bg-gradient-to-r from-secondary to-secondary/90 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 mx-auto transition-all duration-200 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            Create Lesson Quiz
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-secondary to-secondary/90 rounded-full flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-current" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Lesson Quiz</h3>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{quiz?.duration_minutes || 5} min</span>
              </div>
              <div className="flex items-center gap-1">
                <Hash className="w-4 h-4" />
                <span>{quiz?.questions.length || 0} questions</span>
              </div>
            </div>
          </div>
        </div>
        
        {!isEditing && quiz && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="bg-secondary hover:bg-secondary/90 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={handleDeleteQuiz}
              className="bg-primary hover:bg-primary/90 text-secondary px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-primary/5 border border-destructive/30 rounded-lg p-4 mb-6">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {isEditing ? (
        <div className="space-y-6">
          {/* Quiz Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white/80 rounded-xl border border-white/20">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quiz Title
              </label>
              <input
                type="text"
                value={quiz?.title || ''}
                onChange={(e) => setQuiz(quiz ? { ...quiz, title: e.target.value } : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter quiz title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (minutes)
              </label>
              <input
                type="number"
                value={quiz?.duration_minutes || 5}
                onChange={(e) => setQuiz(quiz ? { ...quiz, duration_minutes: parseInt(e.target.value) || 5 } : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                min="1"
                max="60"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Passing Score (%)
              </label>
              <input
                type="number"
                value={quiz?.passing_score || 70}
                onChange={(e) => setQuiz(quiz ? { ...quiz, passing_score: parseInt(e.target.value) || 70 } : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                min="1"
                max="100"
              />
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-md font-bold text-gray-900">Questions</h4>
              <button
                onClick={addQuestion}
                className="bg-primary text-black px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Question
              </button>
            </div>

            {quiz?.questions.map((question, qIndex) => (
              <div key={qIndex} className="bg-white/80 rounded-xl p-6 border border-white/20">
                <div className="flex items-start justify-between mb-4">
                  <h5 className="font-bold text-gray-900">Question {qIndex + 1}</h5>
                  {quiz.questions.length > 1 && (
                    <button
                      onClick={() => removeQuestion(qIndex)}
                      className="text-primary hover:text-primary/80 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question Text
                    </label>
                    <textarea
                      rows={3}
                      value={question.question}
                      onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter your question"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Answer Options
                    </label>
                    <div className="space-y-2">
                      {question.options.map((option, oIndex) => (
                        <div key={oIndex} className="flex items-center gap-3">
                          <input
                            type="radio"
                            name={`correct-${qIndex}`}
                            checked={question.correct_answer === oIndex}
                            onChange={() => updateQuestion(qIndex, 'correct_answer', oIndex)}
                            className="text-purple-600 focus:ring-purple-500"
                          />
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => updateQuestionOption(qIndex, oIndex, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder={`Option ${oIndex + 1}`}
                          />
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Select the correct answer by clicking the radio button</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Explanation (optional)
                    </label>
                    <textarea
                      rows={2}
                      value={question.explanation || ''}
                      onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Explain why this is the correct answer"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                setIsEditing(false)
                if (isCreating) {
                  setQuiz(null)
                  setIsCreating(false)
                }
              }}
              className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveQuiz}
              disabled={loading}
              className="bg-gradient-to-r from-secondary to-secondary/90 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all duration-200 transform hover:-translate-y-1 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:transform-none"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-300 border-t-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Save Quiz
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white/80 rounded-xl p-6 border border-white/20">
          <h4 className="font-bold text-gray-900 mb-2">{quiz?.title}</h4>
          <p className="text-gray-600 mb-4">{quiz?.description}</p>
          <div className="text-sm text-gray-500">
            <p>• {quiz?.questions.length} questions</p>
            <p>• {quiz?.duration_minutes} minutes duration</p>
            <p>• {quiz?.passing_score}% passing score</p>
          </div>
        </div>
      )}
    </div>
  )
}
