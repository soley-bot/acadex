'use client'

import { logger } from '@/lib/logger'
import { useState, useEffect, useCallback, useRef } from 'react'
import { 
  X, Plus, Save, Trash2, GripVertical, Upload, CheckCircle2, Brain,
  Clock, AlertCircle, Check, Eye, Copy, ChevronDown, ChevronUp,
  Image, FileText, Mic, PlayCircle, RotateCcw, Settings2
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, Quiz } from '@/lib/supabase'
import { AIQuizGenerator, GeneratedQuiz } from './AIQuizGenerator'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'

// Enhanced question types
type QuestionType = 'multiple_choice' | 'single_choice' | 'true_false' | 'fill_blank' | 'essay' | 'matching' | 'ordering'

interface Question {
  id?: string
  question: string
  question_type: QuestionType
  options: string[] | Array<{left: string; right: string}>
  correct_answer: number | string | number[]
  explanation?: string
  order_index: number
  points?: number
  difficulty_level?: 'easy' | 'medium' | 'hard'
  // Media fields that match database schema
  image_url?: string | null
  audio_url?: string | null
  video_url?: string | null
  // UI helper fields for media management
  media_url?: string
  media_type?: 'image' | 'audio' | 'video'
}

interface ValidationError {
  field: string
  message: string
  questionIndex?: number
}

interface QuizFormProps {
  quiz?: Quiz | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  prefilledData?: GeneratedQuiz | null
}

export function QuizForm({ quiz, isOpen, onClose, onSuccess, prefilledData }: QuizFormProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<ValidationError[]>([])
  const [activeTab, setActiveTab] = useState<'details' | 'questions' | 'settings'>('details')
  const [showAIGenerator, setShowAIGenerator] = useState(false)
  const [autoSaving, setAutoSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [unsavedChanges, setUnsavedChanges] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set())

  // Auto-save timer ref
  const autoSaveTimer = useRef<NodeJS.Timeout>()
  const hasInitialized = useRef(false)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    duration_minutes: 30,
    image_url: '',
    is_published: false,
    passing_score: 70,
    max_attempts: 0, // 0 = unlimited
    time_limit_type: 'quiz' as 'quiz' | 'question' | 'none'
  })

  const [questions, setQuestions] = useState<Question[]>([])

  // Real-time validation
  const validateForm = useCallback((): ValidationError[] => {
    const newErrors: ValidationError[] = []

    // Basic form validation
    if (!formData.title.trim()) {
      newErrors.push({ field: 'title', message: 'Quiz title is required' })
    }
    if (!formData.description.trim()) {
      newErrors.push({ field: 'description', message: 'Quiz description is required' })
    }
    if (!formData.category) {
      newErrors.push({ field: 'category', message: 'Please select a category' })
    }
    if (formData.duration_minutes < 1) {
      newErrors.push({ field: 'duration_minutes', message: 'Duration must be at least 1 minute' })
    }

    // Question validation
    if (questions.length === 0) {
      newErrors.push({ field: 'questions', message: 'Add at least one question' })
    }

    questions.forEach((q, index) => {
      if (!q.question.trim()) {
        newErrors.push({ 
          field: 'question', 
          message: 'Question text is required',
          questionIndex: index 
        })
      }

      if (['multiple_choice', 'single_choice'].includes(q.question_type)) {
        if (!q.options || q.options.length < 2) {
          newErrors.push({ 
            field: 'options', 
            message: 'At least 2 options required',
            questionIndex: index 
          })
        }
        
        // Validate options based on question type
        if (['multiple_choice', 'single_choice', 'true_false', 'ordering'].includes(q.question_type)) {
          const stringOptions = q.options as string[]
          if (stringOptions.some(opt => !opt?.trim?.())) {
            newErrors.push({ 
              field: 'options', 
              message: 'All options must have text',
              questionIndex: index 
            })
          }
        } else if (q.question_type === 'matching') {
          const matchingOptions = q.options as Array<{left: string; right: string}>
          if (matchingOptions.some(pair => !pair?.left?.trim() || !pair?.right?.trim())) {
            newErrors.push({ 
              field: 'options', 
              message: 'All matching pairs must have text',
              questionIndex: index 
            })
          }
        }
        if (typeof q.correct_answer !== 'number' || q.correct_answer < 0) {
          newErrors.push({ 
            field: 'correct_answer', 
            message: 'Select a correct answer',
            questionIndex: index 
          })
        }
      }

      if (q.question_type === 'fill_blank') {
        if (!q.correct_answer || (q.correct_answer as string).trim() === '') {
          newErrors.push({ 
            field: 'correct_answer', 
            message: 'Fill-in-the-blank answer required',
            questionIndex: index 
          })
        }
      }
    })

    return newErrors
  }, [formData, questions])

  // Auto-save functionality
  const autoSave = useCallback(async () => {
    if (!user || !unsavedChanges || loading) return

    const validationErrors = validateForm()
    if (validationErrors.length > 0) return // Don't auto-save if there are validation errors

    try {
      setAutoSaving(true)
      
      // Save to localStorage as backup
      localStorage.setItem(`quiz-draft-${quiz?.id || 'new'}`, JSON.stringify({
        formData,
        questions,
        timestamp: new Date().toISOString()
      }))

      setLastSaved(new Date())
      setUnsavedChanges(false)
    } catch (error) {
      logger.error('Auto-save failed:', error)
    } finally {
      setAutoSaving(false)
    }
  }, [user, unsavedChanges, loading, formData, questions, quiz?.id, validateForm])

  // Set up auto-save timer
  useEffect(() => {
    if (unsavedChanges) {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current)
      }
      autoSaveTimer.current = setTimeout(autoSave, 3000) // Auto-save after 3 seconds of inactivity
    }

    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current)
      }
    }
  }, [unsavedChanges, autoSave])

  // Mark changes as unsaved
  const markUnsaved = useCallback(() => {
    if (hasInitialized.current) {
      setUnsavedChanges(true)
    }
  }, [])

  // Load existing quiz data
  const loadQuestions = useCallback(async () => {
    if (!quiz?.id) return

    try {
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', quiz.id)
        .order('order_index')

      if (error) throw error

      setQuestions(data.map(q => {
        // Determine media type and URL from database fields
        let media_type: 'image' | 'audio' | 'video' | undefined
        let media_url: string | undefined
        
        if (q.image_url) {
          media_type = 'image'
          media_url = q.image_url
        } else if (q.audio_url) {
          media_type = 'audio'
          media_url = q.audio_url
        } else if (q.video_url) {
          media_type = 'video'
          media_url = q.video_url
        }

        return {
          id: q.id,
          question: q.question,
          question_type: q.question_type || 'multiple_choice',
          options: q.question_type === 'fill_blank' ? [] : (q.options || []),
          correct_answer: q.question_type === 'fill_blank' ? (q.correct_answer_text || '') : (q.correct_answer || 0),
          explanation: q.explanation,
          order_index: q.order_index,
          points: q.points || 1,
          difficulty_level: q.difficulty_level,
          image_url: q.image_url,
          audio_url: q.audio_url,
          video_url: q.video_url,
          media_url,
          media_type
        }
      }))
    } catch (err) {
      logger.error('Error loading questions:', err)
    }
  }, [quiz?.id])

  // Initialize form
  useEffect(() => {
    // Check for draft in localStorage
    const draftKey = `quiz-draft-${quiz?.id || 'new'}`
    const savedDraft = localStorage.getItem(draftKey)

    if (prefilledData) {
      // Use AI generated data
      setFormData(prev => ({
        ...prev,
        title: prefilledData.title,
        description: prefilledData.description,
        category: prefilledData.category,
        difficulty: prefilledData.difficulty,
        duration_minutes: prefilledData.duration_minutes,
      }))
      
      const convertedQuestions: Question[] = prefilledData.questions.map((q, index) => ({
        question: q.question,
        question_type: q.question_type as QuestionType,
        options: q.options || [],
        correct_answer: q.correct_answer,
        explanation: q.explanation || '',
        order_index: index,
        points: 1
      }))
      
      setQuestions(convertedQuestions)
    } else if (savedDraft && !quiz) {
      // Load draft for new quiz
      try {
        const draft = JSON.parse(savedDraft)
        setFormData(draft.formData)
        setQuestions(draft.questions)
      } catch (error) {
        logger.error('Error loading draft:', error)
      }
    } else if (quiz) {
      // Load existing quiz
      setFormData({
        title: quiz.title,
        description: quiz.description,
        category: quiz.category,
        difficulty: quiz.difficulty,
        duration_minutes: quiz.duration_minutes,
        image_url: quiz.image_url || '',
        is_published: quiz.is_published,
        passing_score: quiz.passing_score || 70,
        max_attempts: quiz.max_attempts || 0,
        time_limit_type: 'quiz'
      })
      loadQuestions()
    } else {
      // Reset form for new quiz
      setFormData({
        title: '',
        description: '',
        category: '',
        difficulty: 'beginner',
        duration_minutes: 30,
        image_url: '',
        is_published: false,
        passing_score: 70,
        max_attempts: 0,
        time_limit_type: 'quiz'
      })
      setQuestions([])
    }

    setActiveTab('details')
    setErrors([])
    setUnsavedChanges(false)
    
    // Mark as initialized after a short delay
    setTimeout(() => {
      hasInitialized.current = true
    }, 100)
  }, [quiz, isOpen, loadQuestions, prefilledData])

  // Real-time validation
  useEffect(() => {
    const validationErrors = validateForm()
    setErrors(validationErrors)
  }, [validateForm])

  // Question management functions
  const addQuestion = useCallback((questionType: QuestionType = 'multiple_choice') => {
    const newQuestion: Question = {
      question: '',
      question_type: questionType,
      options: questionType === 'fill_blank' || questionType === 'essay' ? [] : 
               questionType === 'true_false' ? ['True', 'False'] : 
               ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
      correct_answer: questionType === 'fill_blank' || questionType === 'essay' ? '' : 
                     questionType === 'multiple_choice' ? [] : 0,
      explanation: '',
      order_index: questions.length,
      points: 1,
      difficulty_level: 'medium'
    }
    setQuestions(prev => [...prev, newQuestion])
    setExpandedQuestions(prev => new Set([...prev, questions.length]))
    markUnsaved()
  }, [questions.length, markUnsaved])

  const updateQuestion = useCallback((index: number, field: string, value: any) => {
    setQuestions(prev => {
      const updated = [...prev]
      if (!updated[index]) return prev
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
    markUnsaved()
  }, [markUnsaved])

  const deleteQuestion = useCallback((index: number) => {
    setQuestions(prev => {
      const updated = prev.filter((_, i) => i !== index)
      // Update order indices
      updated.forEach((q, i) => {
        q.order_index = i
      })
      return updated
    })
    setExpandedQuestions(prev => {
      const newSet = new Set(prev)
      newSet.delete(index)
      // Adjust indices for remaining questions
      const adjustedSet = new Set<number>()
      newSet.forEach(i => {
        if (i > index) adjustedSet.add(i - 1)
        else if (i < index) adjustedSet.add(i)
      })
      return adjustedSet
    })
    markUnsaved()
  }, [markUnsaved])

  const duplicateQuestion = useCallback((index: number) => {
    setQuestions(prev => {
      const questionToCopy = prev[index]
      if (!questionToCopy) return prev
      
      const newQuestion: Question = {
        ...questionToCopy,
        id: undefined, // Remove ID so it gets a new one
        order_index: prev.length,
        question: `${questionToCopy.question} (Copy)`,
        question_type: questionToCopy.question_type || 'multiple_choice',
        options: questionToCopy.options || [],
        correct_answer: questionToCopy.correct_answer || ''
      }
      return [...prev, newQuestion]
    })
    markUnsaved()
  }, [markUnsaved])

  // Drag and drop functionality
  const onDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return

    const sourceIndex = result.source.index
    const destIndex = result.destination.index

    setQuestions(prev => {
      const updated = Array.from(prev)
      const [reorderedItem] = updated.splice(sourceIndex, 1)
      if (!reorderedItem) return prev
      
      updated.splice(destIndex, 0, reorderedItem)
      
      // Update order indices
      updated.forEach((q, i) => {
        q.order_index = i
      })
      
      return updated
    })
    markUnsaved()
  }, [markUnsaved])

  // Toggle question expansion
  const toggleQuestionExpansion = useCallback((index: number) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }, [])

  // Form field update helper
  const updateFormData = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    markUnsaved()
  }, [markUnsaved])

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    setLoading(true)

    // Add timeout to prevent infinite loading
    const saveTimeout = setTimeout(() => {
      logger.error('Quiz save operation timed out')
      setLoading(false)
      setErrors([{ field: 'general', message: 'Save operation timed out. Please try again.' }])
    }, 30000) // 30 second timeout

    try {
      logger.info('Starting quiz save operation', { quizId: quiz?.id, questionsCount: questions.length })

      let quizId: string

      if (quiz?.id) {
        logger.info('Updating existing quiz', { quizId: quiz.id })
        // Update existing quiz - only include fields that exist in database
        const quizUpdateData = {
          title: formData.title,
          description: formData.description,
          category: formData.category,
          difficulty: formData.difficulty,
          duration_minutes: formData.duration_minutes,
          passing_score: formData.passing_score,
          max_attempts: formData.max_attempts,
          image_url: formData.image_url,
          is_published: formData.is_published,
          total_questions: questions.length,
          updated_at: new Date().toISOString()
        }

        const { error } = await supabase
          .from('quizzes')
          .update(quizUpdateData)
          .eq('id', quiz.id)

        if (error) {
          console.error('Quiz update error:', error)
          throw error
        }
        quizId = quiz.id
      } else {
        logger.info('Creating new quiz')
        // Create new quiz - only include fields that exist in database
        const quizInsertData = {
          title: formData.title,
          description: formData.description,
          category: formData.category,
          difficulty: formData.difficulty,
          duration_minutes: formData.duration_minutes,
          passing_score: formData.passing_score,
          max_attempts: formData.max_attempts,
          image_url: formData.image_url,
          is_published: formData.is_published,
          total_questions: questions.length
        }

        const { data, error } = await supabase
          .from('quizzes')
          .insert(quizInsertData)
          .select()
          .single()

        if (error) {
          console.error('Quiz creation error:', error)
          throw error
        }
        quizId = data.id
      }

      logger.info('Quiz operation successful, handling questions', { quizId })

      // Delete existing questions if editing
      if (quiz?.id) {
        logger.info('Deleting existing questions')
        const { error: deleteError } = await supabase
          .from('quiz_questions')
          .delete()
          .eq('quiz_id', quiz.id)
        
        if (deleteError) {
          console.error('Error deleting existing questions:', deleteError)
          throw deleteError
        }
      }

      // Insert questions
      logger.info('Inserting questions', { questionsCount: questions.length })
      const questionsToInsert = questions.map(q => {
        const questionType = q.question_type
        
        // Handle different correct_answer formats based on question type
        let correctAnswer: number = 0
        let correctAnswerText: string | null = null
        
        if (['fill_blank', 'essay'].includes(questionType)) {
          // Text-based answers
          correctAnswer = 0
          correctAnswerText = q.correct_answer as string
        } else if (['matching', 'ordering'].includes(questionType)) {
          // Array-based answers - serialize to JSON
          correctAnswer = 0
          correctAnswerText = JSON.stringify(q.correct_answer)
        } else {
          // Single numeric answers (multiple_choice, single_choice, true_false)
          correctAnswer = typeof q.correct_answer === 'number' ? q.correct_answer : 0
          correctAnswerText = null
        }
        
        return {
          quiz_id: quizId,
          question: q.question,
          question_type: questionType,
          options: ['fill_blank', 'essay'].includes(questionType) ? [] : q.options,
          correct_answer: correctAnswer,
          correct_answer_text: correctAnswerText,
          explanation: q.explanation || null,
          order_index: q.order_index,
          points: q.points || 1,
          difficulty_level: q.difficulty_level || 'medium',
          image_url: q.media_type === 'image' ? q.media_url || null : null,
          audio_url: q.media_type === 'audio' ? q.media_url || null : null,
          video_url: q.media_type === 'video' ? q.media_url || null : null
        }
      })

      const { error: questionsError } = await supabase
        .from('quiz_questions')
        .insert(questionsToInsert)

      if (questionsError) {
        console.error('Questions insert error:', questionsError)
        throw questionsError
      }

      logger.info('Quiz save completed successfully')
      
      // Clear draft from localStorage
      localStorage.removeItem(`quiz-draft-${quiz?.id || 'new'}`)
      
      setUnsavedChanges(false)
      onSuccess()
    } catch (err: any) {
      console.error('Quiz save error:', err)
      logger.error('Error saving quiz:', err)
      if (err?.message) {
        setErrors([{ field: 'general', message: err.message }])
      } else {
        setErrors([{ field: 'general', message: 'An unexpected error occurred while saving the quiz. Please try again.' }])
      }
    } finally {
      clearTimeout(saveTimeout)
      logger.debug('Setting loading to false')
      setLoading(false)
    }
  }

  const handleAIQuizGenerated = (generatedQuiz: GeneratedQuiz) => {
    setFormData(prev => ({
      ...prev,
      title: generatedQuiz.title,
      description: generatedQuiz.description,
      category: generatedQuiz.category,
      difficulty: generatedQuiz.difficulty,
      duration_minutes: generatedQuiz.duration_minutes
    }))

    const convertedQuestions: Question[] = generatedQuiz.questions.map((q, index) => ({
      question: q.question,
      question_type: q.question_type as QuestionType,
      options: q.options || [],
      correct_answer: q.correct_answer,
      explanation: q.explanation || '',
      order_index: index,
      points: 1
    }))

    setQuestions(convertedQuestions)
    setShowAIGenerator(false)
    markUnsaved()
  }

  if (!isOpen) return null

  const questionTypeLabels = {
    multiple_choice: 'Multiple Choice',
    single_choice: 'Single Choice',
    true_false: 'True/False',
    fill_blank: 'Fill in the Blank',
    essay: 'Essay',
    matching: 'Matching',
    ordering: 'Ordering'
  }

  return (
    <div className="w-full max-w-none p-8">
      {/* Auto-save status */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {autoSaving && (
            <div className="flex items-center gap-2 text-blue-600 text-sm">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-300 border-t-blue-600"></div>
              Auto-saving...
            </div>
          )}
          {!autoSaving && lastSaved && (
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <CheckCircle2 className="h-4 w-4" />
              Saved {lastSaved.toLocaleTimeString()}
            </div>
          )}
          {!autoSaving && unsavedChanges && (
            <div className="flex items-center gap-2 text-amber-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              Unsaved changes
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setPreviewMode(!previewMode)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Eye className="h-4 w-4" />
          {previewMode ? 'Edit Mode' : 'Preview Mode'}
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {['details', 'questions', 'settings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 capitalize ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab === 'questions' ? `Questions (${questions.length})` : tab}
              {tab === 'questions' && errors.some(e => e.questionIndex !== undefined) && (
                <span className="ml-2 inline-flex items-center justify-center w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Error Summary */}
      {errors.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-800 font-medium mb-2">
            <AlertCircle className="h-5 w-5" />
            Please fix the following issues:
          </div>
          <ul className="text-red-700 text-sm space-y-1">
            {errors.map((error, index) => (
              <li key={index}>
                {error.questionIndex !== undefined ? 
                  `Question ${error.questionIndex + 1}: ${error.message}` : 
                  error.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {activeTab === 'details' && (
          <div className="space-y-6">
            {/* Basic Quiz Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quiz Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => updateFormData('title', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.some(e => e.field === 'title') ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Enter quiz title"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => updateFormData('category', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.some(e => e.field === 'category') ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="grammar">Grammar</option>
                    <option value="vocabulary">Vocabulary</option>
                    <option value="reading">Reading</option>
                    <option value="listening">Listening</option>
                    <option value="speaking">Speaking</option>
                    <option value="writing">Writing</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                rows={4}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.some(e => e.field === 'description') ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Describe what this quiz covers..."
                required
              />
            </div>

            {/* Settings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => updateFormData('difficulty', e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  value={formData.duration_minutes}
                  onChange={(e) => updateFormData('duration_minutes', parseInt(e.target.value) || 30)}
                  min="1"
                  max="180"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.some(e => e.field === 'duration_minutes') ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Passing Score (%)
                </label>
                <input
                  type="number"
                  value={formData.passing_score}
                  onChange={(e) => updateFormData('passing_score', parseInt(e.target.value) || 70)}
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Publishing */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_published"
                checked={formData.is_published}
                onChange={(e) => updateFormData('is_published', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_published" className="ml-2 block text-sm text-gray-900">
                Publish quiz (make visible to students)
              </label>
            </div>
          </div>
        )}

        {activeTab === 'questions' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Questions</h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAIGenerator(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-700 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors"
                >
                  <Brain className="h-4 w-4" />
                  Generate with AI
                </button>
                
                <div className="relative group">
                  <button
                    type="button"
                    onClick={() => addQuestion('multiple_choice')}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Add Question
                  </button>
                  
                  {/* Question type dropdown */}
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                    <div className="p-2">
                      {Object.entries(questionTypeLabels).map(([type, label]) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => addQuestion(type as QuestionType)}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {questions.length === 0 && (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="max-w-sm mx-auto">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No questions added yet</p>
                  <p className="text-sm text-gray-400 mb-6">Start building your quiz by adding questions or generate them with AI</p>
                  <div className="flex gap-3 justify-center">
                    <button
                      type="button"
                      onClick={() => setShowAIGenerator(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-700 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors"
                    >
                      <Brain className="h-4 w-4" />
                      Generate with AI
                    </button>
                    <button
                      type="button"
                      onClick={() => addQuestion('multiple_choice')}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      Add Question
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Questions List */}
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="questions">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                    {questions.map((question, questionIndex) => (
                      <Draggable 
                        key={questionIndex} 
                        draggableId={questionIndex.toString()} 
                        index={questionIndex}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`bg-white rounded-xl border-2 transition-all duration-200 ${
                              snapshot.isDragging 
                                ? 'border-blue-300 shadow-lg rotate-2' 
                                : expandedQuestions.has(questionIndex)
                                ? 'border-gray-200 shadow-sm'
                                : 'border-gray-100 hover:border-gray-200'
                            } ${
                              errors.some(e => e.questionIndex === questionIndex) 
                                ? 'border-red-200 bg-red-50/30' 
                                : ''
                            }`}
                          >
                            {/* Question Header */}
                            <div className="flex items-center justify-between p-4 border-b border-gray-100">
                              <div className="flex items-center gap-3">
                                <div
                                  {...provided.dragHandleProps}
                                  className="cursor-grab hover:cursor-grabbing"
                                >
                                  <GripVertical className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-2">
                                    <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                      {questionIndex + 1}
                                    </span>
                                    <div>
                                      <h4 className="font-semibold text-gray-900">
                                        {question.question.slice(0, 50) || `Question ${questionIndex + 1}`}
                                        {question.question.length > 50 && '...'}
                                      </h4>
                                      <span className="text-sm text-gray-500 capitalize">
                                        {questionTypeLabels[question.question_type]}
                                      </span>
                                    </div>
                                  </div>
                                  {errors.some(e => e.questionIndex === questionIndex) && (
                                    <AlertCircle className="h-4 w-4 text-red-500" />
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => duplicateQuestion(questionIndex)}
                                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                                  title="Duplicate question"
                                >
                                  <Copy className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => toggleQuestionExpansion(questionIndex)}
                                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                                >
                                  {expandedQuestions.has(questionIndex) ? 
                                    <ChevronUp className="h-4 w-4" /> : 
                                    <ChevronDown className="h-4 w-4" />
                                  }
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deleteQuestion(questionIndex)}
                                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>

                            {/* Question Content */}
                            {expandedQuestions.has(questionIndex) && (
                              <div className="p-6 space-y-4">
                                {/* Question Text */}
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Question Text *
                                  </label>
                                  <textarea
                                    value={question.question}
                                    onChange={(e) => updateQuestion(questionIndex, 'question', e.target.value)}
                                    rows={3}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                                      errors.some(e => e.questionIndex === questionIndex && e.field === 'question') 
                                        ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                    }`}
                                    placeholder="Enter your question..."
                                  />
                                </div>

                                {/* Question Settings Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Question Type
                                    </label>
                                    <select
                                      value={question.question_type || 'multiple_choice'}
                                      onChange={(e) => {
                                        const newType = e.target.value as QuestionType
                                        updateQuestion(questionIndex, 'question_type', newType)
                                        
                                        // Reset options and correct answer when changing type
                                        if (newType === 'true_false') {
                                          updateQuestion(questionIndex, 'options', ['True', 'False'])
                                          updateQuestion(questionIndex, 'correct_answer', 0)
                                        } else if (newType === 'multiple_choice' || newType === 'single_choice') {
                                          updateQuestion(questionIndex, 'options', ['Option 1', 'Option 2', 'Option 3', 'Option 4'])
                                          updateQuestion(questionIndex, 'correct_answer', 0)
                                        } else if (['fill_blank', 'essay'].includes(newType)) {
                                          updateQuestion(questionIndex, 'options', [])
                                          updateQuestion(questionIndex, 'correct_answer', '')
                                        } else if (newType === 'matching') {
                                          updateQuestion(questionIndex, 'options', [
                                            { left: 'Item 1', right: 'Match 1' },
                                            { left: 'Item 2', right: 'Match 2' }
                                          ])
                                          updateQuestion(questionIndex, 'correct_answer', [0, 1])
                                        } else if (newType === 'ordering') {
                                          updateQuestion(questionIndex, 'options', ['Item 1', 'Item 2', 'Item 3'])
                                          updateQuestion(questionIndex, 'correct_answer', [0, 1, 2])
                                        }
                                      }}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                      {Object.entries(questionTypeLabels).map(([value, label]) => (
                                        <option key={value} value={value}>{label}</option>
                                      ))}
                                    </select>
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Points
                                    </label>
                                    <input
                                      type="number"
                                      value={question.points || 1}
                                      onChange={(e) => updateQuestion(questionIndex, 'points', parseInt(e.target.value) || 1)}
                                      min="1"
                                      max="10"
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Difficulty
                                    </label>
                                    <select
                                      value={question.difficulty_level || 'medium'}
                                      onChange={(e) => updateQuestion(questionIndex, 'difficulty_level', e.target.value)}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                      <option value="easy">Easy</option>
                                      <option value="medium">Medium</option>
                                      <option value="hard">Hard</option>
                                    </select>
                                  </div>
                                </div>

                                {/* Options for Multiple Choice/Single Choice/True False */}
                                {['multiple_choice', 'single_choice', 'true_false'].includes(question.question_type) && (
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Answer Options *
                                    </label>
                                    <div className="space-y-3">
                                      {(question.options as string[]).map((option, optionIndex) => (
                                        <div key={optionIndex} className="flex items-center gap-3">
                                          <input
                                            type={question.question_type === 'multiple_choice' ? 'checkbox' : 'radio'}
                                            name={`correct_${questionIndex}`}
                                            checked={
                                              question.question_type === 'multiple_choice'
                                                ? Array.isArray(question.correct_answer) && question.correct_answer.includes(optionIndex)
                                                : question.correct_answer === optionIndex
                                            }
                                            onChange={() => {
                                              if (question.question_type === 'multiple_choice') {
                                                const currentAnswers = Array.isArray(question.correct_answer) ? question.correct_answer : []
                                                const newAnswers = currentAnswers.includes(optionIndex)
                                                  ? currentAnswers.filter(i => i !== optionIndex)
                                                  : [...currentAnswers, optionIndex]
                                                updateQuestion(questionIndex, 'correct_answer', newAnswers)
                                              } else {
                                                updateQuestion(questionIndex, 'correct_answer', optionIndex)
                                              }
                                            }}
                                            className="h-4 w-4 text-blue-600"
                                          />
                                          <input
                                            type="text"
                                            value={option}
                                            onChange={(e) => {
                                              const newOptions = [...(question.options as string[])]
                                              newOptions[optionIndex] = e.target.value
                                              updateQuestion(questionIndex, 'options', newOptions)
                                            }}
                                            className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                                              errors.some(e => e.questionIndex === questionIndex && e.field === 'options') 
                                                ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                            }`}
                                            placeholder={`Option ${optionIndex + 1}`}
                                          />
                                          {question.question_type === 'multiple_choice' && question.options.length > 2 && (
                                            <button
                                              type="button"
                                              onClick={() => {
                                                const newOptions = question.options.filter((_, i) => i !== optionIndex)
                                                updateQuestion(questionIndex, 'options', newOptions)
                                                // Update correct answers
                                                const currentAnswers = Array.isArray(question.correct_answer) ? question.correct_answer : []
                                                const newAnswers = currentAnswers
                                                  .filter(i => i !== optionIndex)
                                                  .map(i => i > optionIndex ? i - 1 : i)
                                                updateQuestion(questionIndex, 'correct_answer', newAnswers)
                                              }}
                                              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </button>
                                          )}
                                        </div>
                                      ))}
                                      
                                      {question.question_type === 'multiple_choice' && question.options.length < 6 && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const newOptions = [...question.options, `Option ${question.options.length + 1}`]
                                            updateQuestion(questionIndex, 'options', newOptions)
                                          }}
                                          className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-300 hover:text-blue-500 transition-colors"
                                        >
                                          + Add Option
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Matching Question Type */}
                                {question.question_type === 'matching' && (
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Matching Pairs *
                                    </label>
                                    <p className="text-sm text-gray-600 mb-3">
                                      <strong>How it works:</strong> Students will see items mixed up and need to match each left item to its correct right item. Each pair you create below becomes a correct match.
                                    </p>
                                    
                                    <div className="space-y-3">
                                      <div className="grid grid-cols-2 gap-4 mb-2">
                                        <div className="text-sm font-medium text-gray-600">Left Side</div>
                                        <div className="text-sm font-medium text-gray-600">Right Side</div>
                                      </div>
                                      {(Array.isArray(question.options) && question.options.length && typeof question.options[0] === 'object' 
                                        ? question.options as Array<{left: string; right: string}>
                                        : [{ left: '', right: '' }]
                                      ).map((pair, pairIndex) => (
                                        <div key={pairIndex} className="grid grid-cols-2 gap-4">
                                          <input
                                            type="text"
                                            value={pair?.left || ''}
                                            onChange={(e) => {
                                              const newOptions = Array.isArray(question.options) && typeof question.options[0] === 'object' 
                                                ? [...(question.options as Array<{left: string; right: string}>)]
                                                : [{ left: '', right: '' }]
                                              if (!newOptions[pairIndex]) {
                                                newOptions[pairIndex] = { left: '', right: '' }
                                              }
                                              newOptions[pairIndex] = { ...newOptions[pairIndex], left: e.target.value }
                                              updateQuestion(questionIndex, 'options', newOptions)
                                            }}
                                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder={`Left item ${pairIndex + 1}`}
                                          />
                                          <div className="flex gap-2">
                                            <input
                                              type="text"
                                              value={pair?.right || ''}
                                              onChange={(e) => {
                                                const newOptions = Array.isArray(question.options) && typeof question.options[0] === 'object' 
                                                  ? [...(question.options as Array<{left: string; right: string}>)]
                                                  : [{ left: '', right: '' }]
                                                if (!newOptions[pairIndex]) {
                                                  newOptions[pairIndex] = { left: '', right: '' }
                                                }
                                                newOptions[pairIndex] = { ...newOptions[pairIndex], right: e.target.value }
                                                updateQuestion(questionIndex, 'options', newOptions)
                                              }}
                                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                              placeholder={`Right item ${pairIndex + 1}`}
                                            />
                                            {(Array.isArray(question.options) && typeof question.options[0] === 'object' 
                                              ? question.options as Array<{left: string; right: string}>
                                              : [{ left: '', right: '' }]
                                            ).length > 1 && (
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  const currentOptions = Array.isArray(question.options) && typeof question.options[0] === 'object' 
                                                    ? question.options as Array<{left: string; right: string}>
                                                    : [{ left: '', right: '' }]
                                                  const newOptions = currentOptions.filter((_, i) => i !== pairIndex)
                                                  updateQuestion(questionIndex, 'options', newOptions)
                                                }}
                                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                              >
                                                <Trash2 className="h-4 w-4" />
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const currentOptions = Array.isArray(question.options) && typeof question.options[0] === 'object' 
                                            ? question.options as Array<{left: string; right: string}>
                                            : []
                                          const newOptions = [...currentOptions, { left: '', right: '' }]
                                          updateQuestion(questionIndex, 'options', newOptions)
                                        }}
                                        className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-300 hover:text-blue-500 transition-colors"
                                      >
                                        + Add Matching Pair
                                      </button>
                                    </div>
                                  </div>
                                )}

                                {/* Ordering Question Type */}
                                {question.question_type === 'ordering' && (
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Items to Order * <span className="text-sm text-gray-500">(drag to reorder)</span>
                                    </label>
                                    <p className="text-sm text-gray-600 mb-3">
                                      <strong>How it works:</strong> Students will see these items scrambled and need to put them in the correct order. Enter items below in the correct sequence - the system compares the student&apos;s order to yours.
                                    </p>
                                    
                                    <div className="space-y-2">
                                      {(question.options as string[]).map((item, itemIndex) => (
                                        <div key={itemIndex} className="flex items-center gap-3">
                                          <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded text-sm font-medium">
                                            {itemIndex + 1}
                                          </div>
                                          <input
                                            type="text"
                                            value={item}
                                            onChange={(e) => {
                                              const newOptions = [...(question.options as string[])]
                                              newOptions[itemIndex] = e.target.value
                                              updateQuestion(questionIndex, 'options', newOptions)
                                            }}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder={`Item ${itemIndex + 1} (correct order)`}
                                          />
                                          <div className="flex gap-1">
                                            {itemIndex > 0 && (
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  const newOptions = [...(question.options as string[])]
                                                  const temp = newOptions[itemIndex]
                                                  const prev = newOptions[itemIndex - 1]
                                                  if (temp && prev) {
                                                    newOptions[itemIndex] = prev
                                                    newOptions[itemIndex - 1] = temp
                                                    updateQuestion(questionIndex, 'options', newOptions)
                                                  }
                                                }}
                                                className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                                                title="Move up"
                                              >
                                                ↑
                                              </button>
                                            )}
                                            {itemIndex < (question.options as string[]).length - 1 && (
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  const newOptions = [...(question.options as string[])]
                                                  const temp = newOptions[itemIndex]
                                                  const next = newOptions[itemIndex + 1]
                                                  if (temp && next) {
                                                    newOptions[itemIndex] = next
                                                    newOptions[itemIndex + 1] = temp
                                                    updateQuestion(questionIndex, 'options', newOptions)
                                                  }
                                                }}
                                                className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                                                title="Move down"
                                              >
                                                ↓
                                              </button>
                                            )}
                                            {(question.options as string[]).length > 2 && (
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  const newOptions = (question.options as string[]).filter((_, i) => i !== itemIndex)
                                                  updateQuestion(questionIndex, 'options', newOptions)
                                                }}
                                                className="p-2 text-gray-400 hover:text-red-500 transition-colors bg-gray-50 rounded border"
                                                title="Remove item"
                                              >
                                                <Trash2 className="h-4 w-4" />
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const newOptions = [...(question.options as string[]), `Item ${(question.options as string[]).length + 1}`]
                                          updateQuestion(questionIndex, 'options', newOptions)
                                        }}
                                        className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-300 hover:text-blue-500 transition-colors"
                                      >
                                        + Add Item
                                      </button>
                                    </div>
                                  </div>
                                )}

                                {/* Fill in the blank answer */}
                                {question.question_type === 'fill_blank' && (
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Correct Answer *
                                    </label>
                                    <input
                                      type="text"
                                      value={question.correct_answer as string}
                                      onChange={(e) => updateQuestion(questionIndex, 'correct_answer', e.target.value)}
                                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                                        errors.some(e => e.questionIndex === questionIndex && e.field === 'correct_answer') 
                                          ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                      }`}
                                      placeholder="Enter the correct answer..."
                                    />
                                  </div>
                                )}

                                {/* Essay question */}
                                {question.question_type === 'essay' && (
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Sample Answer / Grading Rubric
                                    </label>
                                    <textarea
                                      value={question.correct_answer as string}
                                      onChange={(e) => updateQuestion(questionIndex, 'correct_answer', e.target.value)}
                                      rows={4}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                      placeholder="Provide a sample answer or grading criteria..."
                                    />
                                  </div>
                                )}

                                {/* Explanation */}
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Explanation (Optional)
                                  </label>
                                  <textarea
                                    value={question.explanation || ''}
                                    onChange={(e) => updateQuestion(questionIndex, 'explanation', e.target.value)}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Explain why this answer is correct..."
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Advanced Settings</h3>
            
            {/* Attempt Settings */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-medium text-gray-900 mb-4">Attempt Settings</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Attempts
                  </label>
                  <select
                    value={formData.max_attempts}
                    onChange={(e) => updateFormData('max_attempts', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={0}>Unlimited</option>
                    <option value={1}>1 attempt</option>
                    <option value={2}>2 attempts</option>
                    <option value={3}>3 attempts</option>
                    <option value={5}>5 attempts</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Limit Type
                  </label>
                  <select
                    value={formData.time_limit_type}
                    onChange={(e) => updateFormData('time_limit_type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="quiz">Entire Quiz</option>
                    <option value="question">Per Question</option>
                    <option value="none">No Time Limit</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-between items-center pt-8 mt-8 border-t border-gray-200">
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="font-medium">{questions.length}</span>
              <span>question{questions.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="font-medium">~{formData.duration_minutes}</span>
              <span>minutes</span>
            </div>
            {questions.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="font-medium">{questions.reduce((sum, q) => sum + (q.points || 1), 0)}</span>
                <span>total points</span>
              </div>
            )}
          </div>
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || errors.length > 0}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-300 border-t-white"></div>
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
      </form>

      {/* AI Quiz Generator Modal */}
      <AIQuizGenerator
        isOpen={showAIGenerator}
        onClose={() => setShowAIGenerator(false)}
        onQuizGenerated={handleAIQuizGenerated}
      />
    </div>
  )
}
