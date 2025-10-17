'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Save, Trash2, GripVertical, Clock, BookOpen, Zap, Upload, X, FileText, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { createSupabaseClient } from '@/lib/supabase'
import type { Quiz, QuizQuestion } from '@/lib/supabase'
import { toast } from 'sonner'
import { quizAPI, authenticatedPost, authenticatedGet } from '@/lib/auth-api'

interface QuizBuilderProps {
  quiz?: Quiz | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function QuizBuilder({ quiz, isOpen, onClose, onSuccess }: QuizBuilderProps) {
  const [quizData, setQuizData] = useState<Partial<Quiz>>({
    title: '',
    description: '',
    category: '',
    difficulty: 'intermediate',
    duration_minutes: 15,
    total_questions: 0,
    passing_score: 70,
    max_attempts: 3,
    time_limit_minutes: 15,
    image_url: '',
    is_published: false,
    reading_passage: '',
    passage_title: ''
  })

  const [questions, setQuestions] = useState<Partial<QuizQuestion>[]>([])
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false)

  const isReadingQuiz = quizData.reading_passage && quizData.reading_passage.length > 0

  // Question type configurations
  const questionTypes = [
    { value: 'multiple_choice', label: 'Multiple Choice', icon: '○', color: 'blue' },
    { value: 'true_false', label: 'True/False', icon: '✓', color: 'green' },
    { value: 'fill_blank', label: 'Fill in Blank', icon: '✎', color: 'purple' },
    { value: 'essay', label: 'Essay', icon: '📝', color: 'orange' }
  ]

  // Load quiz data and questions when editing
  useEffect(() => {
    if (quiz?.id && isOpen) {
      setQuizData(quiz)
      setImagePreview(quiz.image_url || '')
      loadQuestions(quiz.id)
    } else if (isOpen && !quiz) {
      // Reset for new quiz
      setQuizData({
        title: '',
        description: '',
        category: '',
        difficulty: 'intermediate',
        duration_minutes: 15,
        total_questions: 0,
        passing_score: 70,
        max_attempts: 3,
        time_limit_minutes: 15,
        image_url: '',
        is_published: false,
        reading_passage: '',
        passage_title: ''
      })
      setQuestions([])
      setImagePreview('')
      setActiveQuestionId(null)
    }
  }, [quiz, isOpen])

  const loadQuestions = async (quizId: string) => {
    setIsLoadingQuestions(true)
    try {
      const response = await authenticatedGet(`/api/admin/quizzes/${quizId}/questions`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to load questions')
      }

      setQuestions(result.questions || [])
    } catch (error: any) {
      console.error('Error loading questions:', error)
      toast.error(error.message || 'Failed to load questions')
    } finally {
      setIsLoadingQuestions(false)
    }
  }

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const supabase = createSupabaseClient()

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `quiz-covers/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('public')
        .getPublicUrl(filePath)

      setImagePreview(publicUrl)
      setQuizData({ ...quizData, image_url: publicUrl })
      toast.success('Image uploaded successfully')
    } catch (error: any) {
      console.error('Error uploading image:', error)
      toast.error('Failed to upload image')
    }
  }

  const removeImage = () => {
    setImagePreview('')
    setQuizData({ ...quizData, image_url: '' })
  }

  const addQuestion = (type: string) => {
    const newQuestion: Partial<QuizQuestion> = {
      id: `temp-${Date.now()}`,
      quiz_id: quiz?.id || 'temp',
      question: '',
      question_type: type as any,
      points: 1,
      explanation: '',
      order_index: questions.length,
      difficulty_level: 'medium',
      correct_answer: 0
    }

    if (type === 'multiple_choice') {
      newQuestion.options = ['', '']
      newQuestion.correct_answer = 0
    } else if (type === 'true_false') {
      newQuestion.options = ['True', 'False']
      newQuestion.correct_answer = 0
    } else if (type === 'fill_blank') {
      newQuestion.correct_answer_text = ''
    }

    setQuestions([...questions, newQuestion])
    setActiveQuestionId(newQuestion.id!)
  }

  const updateQuestion = (id: string, updates: Partial<QuizQuestion>) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q))
  }

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id))
    if (activeQuestionId === id) {
      setActiveQuestionId(null)
    }
  }

  const duplicateQuestion = (id: string) => {
    const question = questions.find(q => q.id === id)
    if (question) {
      const duplicated = { ...question, id: `temp-${Date.now()}` }
      const index = questions.findIndex(q => q.id === id)
      const newQuestions = [...questions]
      newQuestions.splice(index + 1, 0, duplicated)
      setQuestions(newQuestions)
    }
  }

  const handleSave = async () => {
    // Validation
    if (!quizData.title?.trim()) {
      toast.error('Please enter a quiz title')
      return
    }

    if (questions.length === 0) {
      toast.error('Please add at least one question')
      return
    }

    setIsSaving(true)

    // Show progress toast
    const toastId = toast.loading(quiz ? 'Updating quiz...' : 'Creating quiz...')

    try {
      let quizId = quiz?.id

      // Prepare quiz data for API
      const quizPayload = {
        ...quizData,
        total_questions: questions.length
      }

      // Save/Update Quiz using API
      if (quizId) {
        // Update existing quiz
        toast.loading('Saving quiz details...', { id: toastId })
        const result = await quizAPI.updateQuiz({ id: quizId, ...quizPayload })

        if (!result.quiz) {
          throw new Error(result.error || 'Failed to update quiz')
        }
      } else {
        // Create new quiz
        toast.loading('Creating new quiz...', { id: toastId })
        const result = await quizAPI.createQuiz(quizPayload)

        if (!result.quiz) {
          throw new Error(result.error || 'Failed to create quiz')
        }

        quizId = result.quiz.id
      }

      // Save Questions using API
      if (quizId) {
        toast.loading(`Saving ${questions.length} question${questions.length !== 1 ? 's' : ''}...`, { id: toastId })

        const questionsPayload = questions.map((q, index) => ({
          id: q.id?.startsWith('temp-') ? undefined : q.id, // Don't send temp IDs
          quiz_id: quizId,
          question: q.question,
          question_type: q.question_type,
          options: q.options || null,
          correct_answer: q.correct_answer ?? 0,
          correct_answer_text: q.correct_answer_text || null,
          correct_answer_json: q.correct_answer_json || null,
          explanation: q.explanation || null,
          order_index: index,
          points: q.points || 1,
          difficulty_level: q.difficulty_level || 'medium',
          image_url: q.image_url || null,
          audio_url: q.audio_url || null,
          video_url: q.video_url || null
        }))

        const questionsResponse = await authenticatedPost(
          `/api/admin/quizzes/${quizId}/questions`,
          { questions: questionsPayload }
        )

        const questionsResult = await questionsResponse.json()

        if (!questionsResponse.ok || !questionsResult.success) {
          throw new Error(questionsResult.error || 'Failed to save questions')
        }
      }

      // Show success message
      toast.success(
        quiz
          ? `Quiz updated successfully! ${questions.length} question${questions.length !== 1 ? 's' : ''} saved.`
          : `Quiz created successfully with ${questions.length} question${questions.length !== 1 ? 's' : ''}!`,
        { id: toastId, duration: 3000 }
      )

      // Small delay to let user see success message
      await new Promise(resolve => setTimeout(resolve, 500))

      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Error saving quiz:', error)
      toast.error(error.message || 'Failed to save quiz', { id: toastId })
    } finally {
      setIsSaving(false)
    }
  }

  const renderQuestionEditor = (question: Partial<QuizQuestion>) => {
    return (
      <div className="space-y-4">
        {/* Question Text */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Question
          </label>
          <textarea
            value={question.question || ''}
            onChange={(e) => updateQuestion(question.id!, { question: e.target.value })}
            placeholder="Type your question here..."
            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
            rows={3}
          />
        </div>

        {/* Multiple Choice */}
        {question.question_type === 'multiple_choice' && (
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Answer Options
            </label>
            <div className="space-y-2">
              {(question.options as string[] || ['', '']).map((option: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={question.correct_answer === idx}
                    onChange={() => updateQuestion(question.id!, { correct_answer: idx })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...(question.options as string[] || [])]
                      newOptions[idx] = e.target.value
                      updateQuestion(question.id!, { options: newOptions })
                    }}
                    placeholder={`Option ${idx + 1}`}
                    className="flex-1 p-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                  {(question.options as string[] || []).length > 2 && (
                    <button
                      onClick={() => {
                        const newOptions = (question.options as string[] || []).filter((_: any, i: number) => i !== idx)
                        updateQuestion(question.id!, { options: newOptions })
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newOptions = [...(question.options as string[] || []), '']
                  updateQuestion(question.id!, { options: newOptions })
                }}
                className="mt-2"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Option
              </Button>
            </div>
          </div>
        )}

        {/* True/False */}
        {question.question_type === 'true_false' && (
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Correct Answer
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => updateQuestion(question.id!, { correct_answer: 0 })}
                className={cn(
                  "flex-1 p-3 rounded-lg border-2 font-medium transition-all",
                  question.correct_answer === 0
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                )}
              >
                True
              </button>
              <button
                onClick={() => updateQuestion(question.id!, { correct_answer: 1 })}
                className={cn(
                  "flex-1 p-3 rounded-lg border-2 font-medium transition-all",
                  question.correct_answer === 1
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                )}
              >
                False
              </button>
            </div>
          </div>
        )}

        {/* Fill in Blank */}
        {question.question_type === 'fill_blank' && (
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Correct Answer
            </label>
            <input
              type="text"
              value={question.correct_answer_text || ''}
              onChange={(e) => updateQuestion(question.id!, { correct_answer_text: e.target.value })}
              placeholder="Type the correct answer..."
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>
        )}

        {/* Essay */}
        {question.question_type === 'essay' && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> Essay questions require manual grading. Students will type their response in a text area.
            </p>
          </div>
        )}

        {/* Explanation & Points */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Explanation (Optional)
            </label>
            <textarea
              value={question.explanation || ''}
              onChange={(e) => updateQuestion(question.id!, { explanation: e.target.value })}
              placeholder="Explain why this is the correct answer..."
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
              rows={2}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Points
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={question.points || 1}
              onChange={(e) => updateQuestion(question.id!, { points: parseInt(e.target.value) || 1 })}
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {quiz ? 'Edit Quiz' : 'Create New Quiz'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {questions.length} question{questions.length !== 1 ? 's' : ''} • {questions.reduce((sum, q) => sum + (q.points || 0), 0)} total points
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Quiz
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 sm:px-6 max-w-7xl py-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Panel - Quiz Settings */}
              <div className="lg:col-span-1">
                <Card className="sticky top-6">
                  <div className="p-6 space-y-5">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Quiz Details
                    </h3>

                    {/* Quiz Type Toggle */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Quiz Type
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setQuizData({ ...quizData, reading_passage: '', passage_title: '' })}
                          className={cn(
                            "p-3 rounded-lg border-2 text-sm font-medium transition-all",
                            !isReadingQuiz
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                          )}
                        >
                          <div className="text-lg mb-1">📝</div>
                          <div>Standard</div>
                        </button>
                        <button
                          onClick={() => setQuizData({ ...quizData, reading_passage: ' ' })}
                          className={cn(
                            "p-3 rounded-lg border-2 text-sm font-medium transition-all",
                            isReadingQuiz
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                          )}
                        >
                          <div className="text-lg mb-1">📖</div>
                          <div>Reading</div>
                        </button>
                      </div>
                    </div>

                    {/* Title */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Quiz Title *
                      </label>
                      <input
                        type="text"
                        value={quizData.title || ''}
                        onChange={(e) => setQuizData({ ...quizData, title: e.target.value })}
                        placeholder="Enter quiz title..."
                        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    {/* Cover Image */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Cover Image
                      </label>
                      {imagePreview || quizData.image_url ? (
                        <div className="relative">
                          <img
                            src={imagePreview || quizData.image_url || ''}
                            alt="Quiz cover"
                            className="w-full h-40 object-cover rounded-lg border-2 border-gray-200"
                          />
                          <button
                            onClick={removeImage}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600 font-medium">Upload Image</p>
                            <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                          </div>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageUpload}
                          />
                        </label>
                      )}
                    </div>

                    {/* Description */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Description
                      </label>
                      <textarea
                        value={quizData.description || ''}
                        onChange={(e) => setQuizData({ ...quizData, description: e.target.value })}
                        placeholder="Brief description..."
                        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
                        rows={3}
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Category
                      </label>
                      <input
                        type="text"
                        value={quizData.category || ''}
                        onChange={(e) => setQuizData({ ...quizData, category: e.target.value })}
                        placeholder="e.g., Math, Science, History..."
                        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    {/* Difficulty */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Difficulty Level
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {['beginner', 'intermediate', 'advanced'].map((level) => (
                          <button
                            key={level}
                            onClick={() => setQuizData({ ...quizData, difficulty: level as any })}
                            className={cn(
                              "p-2 rounded-lg border-2 text-sm font-medium capitalize transition-all",
                              quizData.difficulty === level
                                ? "border-blue-500 bg-blue-50 text-blue-700"
                                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                            )}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Duration */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        <Clock className="w-4 h-4 inline mr-1" />
                        Duration (minutes)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="180"
                        value={quizData.duration_minutes || 15}
                        onChange={(e) => setQuizData({ ...quizData, duration_minutes: parseInt(e.target.value) || 15 })}
                        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    {/* Stats */}
                    <div className="pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {questions.length}
                          </div>
                          <div className="text-xs text-blue-700 mt-1">
                            Questions
                          </div>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {questions.reduce((sum, q) => sum + (q.points || 0), 0)}
                          </div>
                          <div className="text-xs text-green-700 mt-1">
                            Total Points
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Right Panel - Questions */}
              <div className="lg:col-span-2 space-y-6">
                {/* Reading Passage Editor (only for reading quizzes) */}
                {isReadingQuiz && (
                  <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
                    <div className="p-6 space-y-4">
                      <div className="flex items-center gap-2 mb-3">
                        <BookOpen className="w-5 h-5 text-purple-600" />
                        <h3 className="text-lg font-semibold text-gray-900">
                          Reading Passage
                        </h3>
                      </div>

                      {/* Passage Title */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Passage Title (Optional)
                        </label>
                        <input
                          type="text"
                          value={quizData.passage_title || ''}
                          onChange={(e) => setQuizData({ ...quizData, passage_title: e.target.value })}
                          placeholder="e.g., The History of Ancient Rome"
                          className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                        />
                      </div>

                      {/* Passage Content */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Passage Content
                        </label>
                        <textarea
                          value={quizData.reading_passage || ''}
                          onChange={(e) => setQuizData({ ...quizData, reading_passage: e.target.value })}
                          placeholder="Paste or type the reading passage here. Students will read this before answering the questions..."
                          className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none resize-none font-serif"
                          rows={8}
                        />
                        <div className="flex items-center justify-between mt-2 text-xs text-gray-600">
                          <span>Word count: {(quizData.reading_passage || '').split(/\s+/).filter(Boolean).length}</span>
                          <span>Est. reading time: {Math.ceil((quizData.reading_passage || '').split(/\s+/).filter(Boolean).length / 200)} min</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Add Question Toolbar */}
                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
                  <div className="p-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-blue-600" />
                      Add Question
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {questionTypes.map((type) => (
                        <button
                          key={type.value}
                          onClick={() => addQuestion(type.value)}
                          className={cn(
                            "p-3 rounded-lg border-2 transition-all hover:scale-105",
                            "bg-white hover:bg-blue-50 border-gray-200 hover:border-blue-300"
                          )}
                        >
                          <div className="text-2xl mb-1">{type.icon}</div>
                          <div className="text-xs font-medium text-gray-700">
                            {type.label}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </Card>

                {/* Questions List */}
                {isLoadingQuestions ? (
                  <Card className="p-12">
                    <div className="flex flex-col items-center justify-center">
                      <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
                      <p className="text-sm text-gray-600">Loading questions...</p>
                    </div>
                  </Card>
                ) : questions.length === 0 ? (
                  <Card className="border-2 border-dashed border-gray-300">
                    <div className="p-12 text-center">
                      <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No questions yet
                      </h3>
                      <p className="text-sm text-gray-600">
                        Click on a question type above to get started
                      </p>
                    </div>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {questions.map((question, index) => {
                      const isActive = activeQuestionId === question.id
                      const typeConfig = questionTypes.find(t => t.value === question.question_type)

                      return (
                        <Card
                          key={question.id}
                          className={cn(
                            "border-2 transition-all",
                            isActive
                              ? "border-blue-500 shadow-lg"
                              : "border-gray-200 hover:border-gray-300"
                          )}
                        >
                          <div className="p-6">
                            {/* Question Header */}
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <button className="cursor-move text-gray-400 hover:text-gray-600">
                                  <GripVertical className="w-5 h-5" />
                                </button>
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary" className="text-xs">
                                    Q{index + 1}
                                  </Badge>
                                  <Badge variant="outline">
                                    {typeConfig?.icon} {typeConfig?.label}
                                  </Badge>
                                  <Badge variant="outline" className="text-amber-700 bg-amber-50 border-amber-200">
                                    {question.points} {question.points === 1 ? 'pt' : 'pts'}
                                  </Badge>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setActiveQuestionId(isActive ? null : question.id!)}
                                  className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                  {isActive ? 'Collapse' : 'Edit'}
                                </button>
                                <button
                                  onClick={() => duplicateQuestion(question.id!)}
                                  className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                  Copy
                                </button>
                                <button
                                  onClick={() => deleteQuestion(question.id!)}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {/* Question Preview/Editor */}
                            {isActive ? (
                              <div className="border-t pt-4">
                                {renderQuestionEditor(question)}
                              </div>
                            ) : (
                              <div className="pl-8">
                                <p className="text-gray-900 font-medium">
                                  {question.question || <span className="text-gray-400 italic">No question text</span>}
                                </p>
                                {question.question_type === 'multiple_choice' && question.options && (
                                  <div className="mt-2 space-y-1">
                                    {(question.options as string[]).map((opt: string, idx: number) => (
                                      <div key={idx} className="text-sm flex items-center gap-2">
                                        <div className={cn(
                                          "w-4 h-4 rounded-full border-2",
                                          question.correct_answer === idx
                                            ? "bg-green-500 border-green-500"
                                            : "border-gray-300"
                                        )} />
                                        <span className={question.correct_answer === idx ? "font-medium text-green-700" : "text-gray-600"}>
                                          {opt || <span className="text-gray-400 italic">Empty option</span>}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
