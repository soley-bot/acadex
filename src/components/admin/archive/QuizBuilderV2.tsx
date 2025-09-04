'use client'

import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { logger } from '@/lib/logger'
import type { Quiz, QuizQuestion } from '@/lib/supabase'
import { quizDifficulties, quizCategories } from '@/lib/quizConstants'

// Enhanced AI service imports
import { EnhancedQuizGenerationService, EnhancedQuizGenerationRequest } from '@/lib/enhanced-ai-services'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'

// Custom hooks
import { useQuizEditor, QuizWithQuestions } from '@/hooks/useQuizEditor'
import { useAIGeneration } from '@/hooks/useAIGeneration'
import { useQuizValidation } from '@/hooks/useQuizValidation'

// Components
import { 
  ProgressIndicator, 
  AIConfigurationPanel, 
  QuestionEditor 
} from '@/components/admin/QuizStepComponents'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// State Machine Definition
enum QuizBuilderState {
  // Core workflow states
  CONFIGURE_AI = 'configure_ai',
  GENERATING = 'generating', 
  EDITING = 'editing',
  PREVIEW = 'preview',
  
  // Modal states
  CATEGORY_MODAL = 'category_modal',
  
  // Process states
  SAVING = 'saving',
  VALIDATING = 'validating',
  
  // End states
  SAVED = 'saved',
  ERROR = 'error'
}

// Enhanced question types - matching your current system
type QuestionType = 'multiple_choice' | 'true_false' | 'fill_blank' | 'essay' | 'matching' | 'ordering'

// Clean data interfaces
interface QuizBuilderData {
  quiz: Quiz | null
  currentQuiz: QuizWithQuestions | null  // The quiz being worked on with questions
  questions: QuizQuestion[]
  aiConfig: EnhancedQuizGenerationRequest | null
  validation: ValidationError[]
  lastSaved: Date | null
  error: string | null
}

interface ValidationError {
  field: string
  message: string
  questionIndex?: number
}

interface QuizFormData {
  title: string
  description: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration_minutes: number
  image_url: string
  is_published: boolean
  passing_score: number
  max_attempts: number
}

interface QuizBuilderProps {
  quiz?: Quiz | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

// Initial state
const getInitialData = (quiz?: Quiz | null): QuizBuilderData => ({
  quiz: quiz || null,
  currentQuiz: quiz ? { ...quiz, questions: [] } : null,  // Convert Quiz to QuizWithQuestions
  questions: [],
  aiConfig: null,
  validation: [],
  lastSaved: null,
  error: null
})

const getInitialFormData = (quiz?: Quiz | null): QuizFormData => ({
  title: quiz?.title || '',
  description: quiz?.description || '',
  category: quiz?.category || '',
  difficulty: (quiz?.difficulty as 'beginner' | 'intermediate' | 'advanced') || 'beginner',
  duration_minutes: quiz?.duration_minutes || 30,
  image_url: quiz?.image_url || '',
  is_published: quiz?.is_published || false,
  passing_score: quiz?.passing_score || 70,
  max_attempts: quiz?.max_attempts || 0
})

export function QuizBuilderV2({ quiz, isOpen, onClose, onSuccess }: QuizBuilderProps) {
  const { user } = useAuth()
  
  // State machine core
  const [state, setState] = useState<QuizBuilderState>(
    quiz ? QuizBuilderState.EDITING : QuizBuilderState.CONFIGURE_AI
  )
  const [data, setData] = useState<QuizBuilderData>(getInitialData(quiz))
  const [formData, setFormData] = useState<QuizFormData>(getInitialFormData(quiz))

  // Initialize AI service with useMemo to prevent recreation
  const aiService = useMemo(() => new EnhancedQuizGenerationService(), [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear any pending timeouts or intervals
      if (data.lastSaved && typeof window !== 'undefined') {
        // Cancel any pending saves or operations
        logger.info('QuizBuilder cleanup on unmount')
      }
    }
  }, [data.lastSaved])

  // State machine transitions
  const transitionTo = useCallback((newState: QuizBuilderState, updates?: Partial<QuizBuilderData>) => {
    logger.info('State transition', { from: state, to: newState })
    setState(newState)
    if (updates) {
      setData(prev => ({ ...prev, ...updates }))
    }
  }, [state])

  // Event handlers with state machine logic
  const handleAIGeneration = useCallback(async (config: EnhancedQuizGenerationRequest) => {
    if (state !== QuizBuilderState.CONFIGURE_AI) {
      logger.warn('Invalid state for AI generation', { currentState: state })
      return
    }

    transitionTo(QuizBuilderState.GENERATING, { aiConfig: config, error: null })

    try {
      logger.info('Starting AI quiz generation', { config })
      const result = await aiService.generateQuiz(config)
      
      if (result.success && result.quiz) {
        // Convert AI result to our format
        const generatedQuiz: Quiz = {
          id: '',
          title: result.quiz.title,
          description: result.quiz.description,
          category: result.quiz.category,
          difficulty: result.quiz.difficulty,
          duration_minutes: result.quiz.duration_minutes,
          passing_score: 70,
          max_attempts: 0,
          image_url: '',
          is_published: false,
          total_questions: result.quiz.questions.length,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        const generatedQuestions: QuizQuestion[] = result.quiz.questions.map((q: any, index: number) => ({
          id: '',
          quiz_id: '',
          question: q.question,
          question_type: q.question_type as QuestionType,
          options: q.options || [],
          correct_answer: typeof q.correct_answer === 'number' ? q.correct_answer : 0,
          correct_answer_text: q.correct_answer_text || null,
          correct_answer_json: q.correct_answer_json || null,
          explanation: q.explanation || '',
          order_index: index,
          points: 1,
          difficulty_level: 'medium',
          image_url: null,
          audio_url: null,
          video_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }))

        // Create composite QuizWithQuestions object
        const quizWithQuestions: QuizWithQuestions = {
          ...generatedQuiz,
          questions: generatedQuestions
        }

        // Update form data and transition to editing
        setFormData({
          title: generatedQuiz.title,
          description: generatedQuiz.description,
          category: generatedQuiz.category,
          difficulty: generatedQuiz.difficulty,
          duration_minutes: generatedQuiz.duration_minutes,
          image_url: generatedQuiz.image_url || '',  // Handle null/undefined
          is_published: generatedQuiz.is_published,
          passing_score: generatedQuiz.passing_score,
          max_attempts: generatedQuiz.max_attempts
        })

        transitionTo(QuizBuilderState.EDITING, {
          quiz: generatedQuiz,
          currentQuiz: quizWithQuestions,  // Set the working quiz with questions
          questions: generatedQuestions,
          error: null
        })
      } else {
        transitionTo(QuizBuilderState.ERROR, { error: result.error || 'Failed to generate quiz' })
      }
    } catch (error: any) {
      logger.error('AI generation failed', error)
      transitionTo(QuizBuilderState.ERROR, { error: error.message })
    }
  }, [state, aiService, transitionTo])

  const handleSaveQuiz = useCallback(async () => {
    if (state !== QuizBuilderState.EDITING && state !== QuizBuilderState.PREVIEW) {
      logger.warn('Invalid state for saving', { currentState: state })
      return
    }

    if (!user) {
      transitionTo(QuizBuilderState.ERROR, { error: 'User not authenticated' })
      return
    }

    transitionTo(QuizBuilderState.SAVING, { error: null })

    try {
      let quizId: string

      if (quiz?.id) {
        // Update existing quiz
        logger.info('Updating existing quiz', { quizId: quiz.id })
        const { error } = await supabase
          .from('quizzes')
          .update({
            title: formData.title,
            description: formData.description,
            category: formData.category,
            difficulty: formData.difficulty,
            duration_minutes: formData.duration_minutes,
            passing_score: formData.passing_score,
            max_attempts: formData.max_attempts,
            image_url: formData.image_url,
            is_published: formData.is_published,
            total_questions: data.questions.length,
            updated_at: new Date().toISOString()
          })
          .eq('id', quiz.id)

        if (error) throw error
        quizId = quiz.id
      } else {
        // Create new quiz
        logger.info('Creating new quiz')
        const { data: newQuiz, error } = await supabase
          .from('quizzes')
          .insert({
            title: formData.title,
            description: formData.description,
            category: formData.category,
            difficulty: formData.difficulty,
            duration_minutes: formData.duration_minutes,
            passing_score: formData.passing_score,
            max_attempts: formData.max_attempts,
            image_url: formData.image_url,
            is_published: formData.is_published,
            total_questions: data.questions.length
          })
          .select()
          .single()

        if (error) throw error
        quizId = newQuiz.id
      }

      // Save questions
      if (data.questions.length > 0) {
        // Delete existing questions if updating
        if (quiz?.id) {
          await supabase.from('quiz_questions').delete().eq('quiz_id', quizId)
        }

        // Insert new questions
        const questionsToSave = data.questions.map((q, index) => ({
          quiz_id: quizId,
          question: q.question,
          question_type: q.question_type,
          options: q.options,
          correct_answer: ['fill_blank', 'essay'].includes(q.question_type) ? 0 : q.correct_answer,
          correct_answer_text: ['fill_blank', 'essay'].includes(q.question_type) ? 
            (q.correct_answer_text || '') : null,
          correct_answer_json: ['matching', 'ordering'].includes(q.question_type) ? 
            q.correct_answer_json : null,
          explanation: q.explanation,
          order_index: index,
          points: q.points || 1,
          difficulty_level: q.difficulty_level || 'medium',
          image_url: q.image_url,
          audio_url: q.audio_url,
          video_url: q.video_url
        }))

        const { error: questionsError } = await supabase
          .from('quiz_questions')
          .insert(questionsToSave)

        if (questionsError) throw questionsError
      }

      logger.info('Quiz saved successfully', { quizId })
      transitionTo(QuizBuilderState.SAVED, { lastSaved: new Date() })

      // Auto-close after success
      setTimeout(() => {
        onSuccess()
      }, 1000)

    } catch (error: any) {
      logger.error('Save failed', error)
      transitionTo(QuizBuilderState.ERROR, { error: error.message })
    }
  }, [state, user, quiz, formData, data.questions, transitionTo, onSuccess])

  const handleReturnToEditing = useCallback(() => {
    transitionTo(QuizBuilderState.EDITING, { error: null })
  }, [transitionTo])

  const handleStartOver = useCallback(() => {
    setData(getInitialData())
    setFormData(getInitialFormData())
    transitionTo(QuizBuilderState.CONFIGURE_AI, { error: null })
  }, [transitionTo])

  // Render logic based on state
  if (!isOpen) return null

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        logger.error('QuizBuilder error', { error, errorInfo })
      }}
    >
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {quiz ? 'Edit Quiz' : 'Create New Quiz'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              State: {state.replace('_', ' ').toUpperCase()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        {/* Content based on state */}
        <div className="p-6">
          {state === QuizBuilderState.CONFIGURE_AI && (
            <AIConfigurationStep onGenerate={handleAIGeneration} />
          )}

          {state === QuizBuilderState.GENERATING && (
            <GeneratingStep />
          )}

          {state === QuizBuilderState.EDITING && data.currentQuiz && (
            <EditingStep
              quiz={data.currentQuiz}
              onSave={handleSaveQuiz}
              onPreview={() => transitionTo(QuizBuilderState.PREVIEW)}
            />
          )}

          {state === QuizBuilderState.PREVIEW && data.currentQuiz && (
            <PreviewStep
              quiz={data.currentQuiz}
              onBack={() => transitionTo(QuizBuilderState.EDITING)}
              onSave={handleSaveQuiz}
            />
          )}

          {state === QuizBuilderState.SAVING && data.currentQuiz && (
            <SavingStep quiz={data.currentQuiz} />
          )}

          {state === QuizBuilderState.SAVED && (
            <SavedStep onClose={onSuccess} />
          )}

          {state === QuizBuilderState.ERROR && (
            <ErrorStep
              error={data.error}
              onRetry={handleReturnToEditing}
              onStartOver={handleStartOver}
            />
          )}
        </div>
      </div>
      </div>
    </ErrorBoundary>
  )
}

// AI Configuration Step - Preserves all your advanced features
const AIConfigurationStep: React.FC<{ onGenerate: (config: EnhancedQuizGenerationRequest) => void }> = ({ onGenerate }) => {
  const [config, setConfig] = useState<EnhancedQuizGenerationRequest>({
    subject: '',
    topic: '',
    questionCount: 10,
    difficulty: 'intermediate',
    category: '',
    questionTypes: ['multiple_choice', 'true_false'],
    
    // Advanced customization - all your features preserved
    teachingStyle: 'practical',
    assessmentType: 'application',
    complexityLevel: 'intermediate',
    quizLanguage: 'english',
    explanationLanguage: 'english',
    customInstructions: '',
    focusAreas: [],
    includeExamples: true,
    realWorldApplications: true,
    includeTranslations: false
  })

  const [showAdvanced, setShowAdvanced] = useState(false)

  const updateConfig = useCallback((updates: Partial<EnhancedQuizGenerationRequest>) => {
    setConfig(prev => ({ ...prev, ...updates }))
  }, [])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (config.topic.trim() && config.subject.trim()) {
      onGenerate(config)
    }
  }, [config, onGenerate])

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Quiz Configuration</h3>
        <p className="text-gray-600">Configure your AI-generated quiz with advanced customization options</p>
      </div>

      {/* Basic Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
          <input
            type="text"
            value={config.subject}
            onChange={(e) => updateConfig({ subject: e.target.value })}
            placeholder="e.g., Mathematics, English, Science"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
          <input
            type="text"
            value={config.topic}
            onChange={(e) => updateConfig({ topic: e.target.value })}
            placeholder="e.g., Quadratic Equations, Present Simple Tense"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Number of Questions</label>
          <select
            value={config.questionCount}
            onChange={(e) => updateConfig({ questionCount: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {[5, 10, 15, 20, 25].map(count => (
              <option key={count} value={count}>{count} Questions</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
          <select
            value={config.difficulty}
            onChange={(e) => updateConfig({ difficulty: e.target.value as 'beginner' | 'intermediate' | 'advanced' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* Question Types */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Question Types</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {(['multiple_choice', 'true_false', 'fill_blank', 'essay', 'matching', 'ordering'] as const).map(type => (
            <label key={type} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.questionTypes?.includes(type) || false}
                onChange={(e) => {
                  const types = config.questionTypes || []
                  if (e.target.checked) {
                    updateConfig({ questionTypes: [...types, type] })
                  } else {
                    updateConfig({ questionTypes: types.filter(t => t !== type) })
                  }
                }}
                className="rounded"
              />
              <span className="text-sm">{type.replace('_', ' ')}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Advanced Settings Toggle */}
      <div className="border-t pt-4">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium"
        >
          {showAdvanced ? '🔼' : '🔽'} Advanced Settings & Customization
        </button>
      </div>

      {/* Advanced Settings - All your features preserved */}
      {showAdvanced && (
        <div className="space-y-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h4 className="font-medium text-gray-800">Advanced Configuration</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Teaching Style</label>
              <select
                value={config.teachingStyle || ''}
                onChange={(e) => {
                  const value = e.target.value
                  updateConfig({ 
                    teachingStyle: value === '' ? undefined : value as 'academic' | 'practical' | 'conversational' | 'professional'
                  })
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Default</option>
                <option value="academic">Academic</option>
                <option value="practical">Practical</option>
                <option value="conversational">Conversational</option>
                <option value="professional">Professional</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Assessment Focus</label>
              <select
                value={config.assessmentType || ''}
                onChange={(e) => {
                  const value = e.target.value
                  updateConfig({ 
                    assessmentType: value === '' ? undefined : value as 'knowledge_recall' | 'application' | 'analysis' | 'synthesis'
                  })
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Default</option>
                <option value="knowledge_recall">Knowledge Recall</option>
                <option value="application">Application</option>
                <option value="analysis">Analysis</option>
                <option value="synthesis">Synthesis</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quiz Language</label>
              <select
                value={config.quizLanguage || 'english'}
                onChange={(e) => updateConfig({ quizLanguage: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="english">English</option>
                <option value="khmer">Khmer (ខ្មែរ)</option>
                <option value="spanish">Spanish</option>
                <option value="french">French</option>
                <option value="arabic">Arabic</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Complexity Level</label>
              <select
                value={config.complexityLevel || 'intermediate'}
                onChange={(e) => updateConfig({ complexityLevel: e.target.value as 'basic' | 'intermediate' | 'advanced' | 'expert' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="basic">Basic</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
            </div>
          </div>

          {/* Content Options */}
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.includeExamples || false}
                onChange={(e) => updateConfig({ includeExamples: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm">Include Examples</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.realWorldApplications || false}
                onChange={(e) => updateConfig({ realWorldApplications: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm">Real-World Applications</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.includeTranslations || false}
                onChange={(e) => updateConfig({ includeTranslations: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm">Include Translations</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.includeDiagrams || false}
                onChange={(e) => updateConfig({ includeDiagrams: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm">Include Diagrams</span>
            </label>
          </div>

          {/* Custom Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Custom Instructions</label>
            <textarea
              value={config.customInstructions || ''}
              onChange={(e) => updateConfig({ customInstructions: e.target.value })}
              placeholder="Add specific instructions for the AI (e.g., 'Focus on practical applications', 'Include step-by-step solutions')"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              rows={3}
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-6 border-t">
        <button
          type="submit"
          disabled={!config.topic.trim() || !config.subject.trim()}
          className="bg-primary hover:bg-secondary text-white hover:text-black px-6 py-3 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          🤖 Generate Quiz with AI
        </button>
      </div>
    </form>
  )
}

const GeneratingStep: React.FC = () => {
  return <div>Generating quiz...</div>
}

const EditingStep: React.FC<{ 
  quiz: QuizWithQuestions, 
  onSave: (quiz: QuizWithQuestions) => void, 
  onPreview: () => void 
}> = ({ quiz, onSave, onPreview }) => {
  const [editingQuiz, setEditingQuiz] = useState<QuizWithQuestions>(quiz)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const updateQuiz = useCallback((updates: Partial<QuizWithQuestions>) => {
    setEditingQuiz(prev => ({ ...prev, ...updates }))
  }, [])

  const updateQuestion = useCallback((index: number, updates: Partial<QuizQuestion>) => {
    const questions = [...editingQuiz.questions]
    if (questions[index]) {
      questions[index] = { ...questions[index], ...updates }
      setEditingQuiz(prev => ({ ...prev, questions }))
    }
  }, [editingQuiz.questions])

  const addQuestion = useCallback(() => {
    const newQuestion: QuizQuestion = {
      id: `q_${Date.now()}`,
      quiz_id: '',
      question: '',  // Correct field name
      question_type: 'multiple_choice',
      points: 1,
      options: ['', '', '', ''],
      correct_answer: 0,  // Correct type: number
      correct_answer_text: null,
      correct_answer_json: null,
      explanation: '',
      order_index: editingQuiz.questions.length,
      difficulty_level: 'medium',
      image_url: null,
      audio_url: null,
      video_url: null
    }
    setEditingQuiz(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }))
  }, [editingQuiz.questions.length])

  const removeQuestion = useCallback((index: number) => {
    const questions = editingQuiz.questions.filter((_, i) => i !== index)
    setEditingQuiz(prev => ({ ...prev, questions }))
  }, [editingQuiz.questions])

  const moveQuestion = (fromIndex: number, toIndex: number) => {
    const questions = [...editingQuiz.questions]
    const [movedQuestion] = questions.splice(fromIndex, 1)
    if (movedQuestion) {
      questions.splice(toIndex, 0, movedQuestion)
      setEditingQuiz(prev => ({ ...prev, questions }))
    }
  }

  const validateQuiz = useCallback((): string[] => {
    const errors: string[] = []
    
    if (!editingQuiz.title.trim()) errors.push('Quiz title is required')
    if (!editingQuiz.description.trim()) errors.push('Quiz description is required')
    if (editingQuiz.questions.length === 0) errors.push('At least one question is required')
    
    editingQuiz.questions.forEach((question: QuizQuestion, index: number) => {
      if (!question.question.trim()) {  // Use 'question' field
        errors.push(`Question ${index + 1}: Question text is required`)
      }
      if (question.correct_answer === null || question.correct_answer === undefined) {  // Check for number
        errors.push(`Question ${index + 1}: Correct answer is required`)
      }
      if (question.question_type === 'multiple_choice' && question.options?.some((opt: any) => !opt.trim())) {
        errors.push(`Question ${index + 1}: All multiple choice options must be filled`)
      }
    })
    
    return errors
  }, [editingQuiz])

  const handleSave = useCallback(() => {
    const errors = validateQuiz()
    setValidationErrors(errors)
    
    if (errors.length === 0) {
      onSave(editingQuiz)
    }
  }, [editingQuiz, onSave, validateQuiz])

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Edit Your Quiz</h3>
        <p className="text-gray-600">Make final adjustments before saving</p>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="text-red-800 font-medium mb-2">Please fix these issues:</h4>
          <ul className="text-red-700 text-sm space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Quiz Metadata */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-medium text-gray-800 mb-4">Quiz Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quiz Title</label>
            <input
              type="text"
              value={editingQuiz.title}
              onChange={(e) => updateQuiz({ title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <input
              type="text"
              value={editingQuiz.category || ''}
              onChange={(e) => updateQuiz({ category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={editingQuiz.description}
              onChange={(e) => updateQuiz({ description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="font-medium text-gray-800">Questions ({editingQuiz.questions.length})</h4>
          <button
            onClick={addQuestion}
            className="bg-primary hover:bg-secondary text-white hover:text-black px-4 py-2 rounded-lg transition-colors text-sm"
          >
            ➕ Add Question
          </button>
        </div>

        {editingQuiz.questions.map((question, index) => (
          <div key={question.id} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <span className="text-sm font-medium text-gray-500">Question {index + 1}</span>
              <div className="flex gap-2">
                {index > 0 && (
                  <button
                    onClick={() => moveQuestion(index, index - 1)}
                    className="text-gray-400 hover:text-gray-600 text-sm"
                  >
                    ⬆️
                  </button>
                )}
                {index < editingQuiz.questions.length - 1 && (
                  <button
                    onClick={() => moveQuestion(index, index + 1)}
                    className="text-gray-400 hover:text-gray-600 text-sm"
                  >
                    ⬇️
                  </button>
                )}
                <button
                  onClick={() => removeQuestion(index)}
                  className="text-red-400 hover:text-red-600 text-sm"
                >
                  🗑️
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Question Text</label>
                <textarea
                  value={question.question}
                  onChange={(e) => updateQuestion(index, { question: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Question Type</label>
                  <select
                    value={question.question_type}
                    onChange={(e) => updateQuestion(index, { question_type: e.target.value as 'multiple_choice' | 'true_false' | 'fill_blank' | 'essay' | 'matching' | 'ordering' | 'single_choice' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="true_false">True/False</option>
                    <option value="fill_blank">Fill in the Blank</option>
                    <option value="essay">Essay</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Points</label>
                  <input
                    type="number"
                    min="1"
                    value={question.points}
                    onChange={(e) => updateQuestion(index, { points: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              {/* Options for Multiple Choice */}
              {question.question_type === 'multiple_choice' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Answer Options</label>
                  <div className="space-y-2">
                    {question.options?.map((option: any, optIndex: number) => (
                      <div key={optIndex} className="flex gap-2">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => {
                            const options = [...(question.options || [])]
                            options[optIndex] = e.target.value
                            updateQuestion(index, { options })
                          }}
                          placeholder={`Option ${optIndex + 1}`}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                        <input
                          type="radio"
                          name={`correct_${index}`}
                          checked={question.correct_answer === optIndex}
                          onChange={() => updateQuestion(index, { correct_answer: optIndex })}
                          className="mt-3"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Correct Answer for other types */}
              {question.question_type !== 'multiple_choice' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Correct Answer</label>
                  <input
                    type="text"
                    value={question.correct_answer_text || ''}
                    onChange={(e) => updateQuestion(index, { correct_answer_text: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Explanation (Optional)</label>
                <textarea
                  value={question.explanation || ''}
                  onChange={(e) => updateQuestion(index, { explanation: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  rows={2}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-6 border-t">
        <button
          onClick={onPreview}
          className="border-2 border-primary text-primary hover:bg-primary hover:text-white px-6 py-3 rounded-lg transition-colors font-medium"
        >
          👁️ Preview Quiz
        </button>
        <button
          onClick={handleSave}
          className="bg-primary hover:bg-secondary text-white hover:text-black px-6 py-3 rounded-lg transition-colors font-medium"
        >
          💾 Save Quiz
        </button>
      </div>
    </div>
  )
}

const PreviewStep: React.FC<{ 
  quiz: QuizWithQuestions, 
  onBack: () => void, 
  onSave: () => void 
}> = ({ quiz, onBack, onSave }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({})
  const [showAnswers, setShowAnswers] = useState(false)

  const handleAnswer = useCallback((questionId: string, answer: string) => {
    setUserAnswers(prev => ({ ...prev, [questionId]: answer }))
  }, [])

  const currentQuestion = quiz.questions[currentQuestionIndex]
  
  if (!currentQuestion) {
    return <div>No question found</div>
  }
  const isCorrect = (question: QuizQuestion) => {
    const userAnswer = userAnswers[question.id]
    if (!userAnswer) return false
    
    // For multiple choice, compare with the option at the correct index
    if (question.question_type === 'multiple_choice') {
      const correctOption = question.options?.[question.correct_answer]
      return userAnswer === correctOption
    }
    
    // For other types, compare with correct_answer_text
    return userAnswer === question.correct_answer_text
  }

  const totalPoints = quiz.questions.reduce((sum: number, q: QuizQuestion) => sum + (q.points || 1), 0)
  const userScore = quiz.questions.reduce((sum: number, q: QuizQuestion) =>
    sum + (isCorrect(q) ? (q.points || 1) : 0), 0
  )

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Quiz Preview</h3>
        <p className="text-gray-600">Test your quiz before saving</p>
      </div>

      {/* Quiz Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{quiz.title}</h2>
        <p className="text-gray-600 mb-4">{quiz.description}</p>
        <div className="flex justify-center gap-6 text-sm text-gray-500">
          <span>📊 {quiz.questions.length} Questions</span>
          <span>⭐ {totalPoints} Points Total</span>
          <span>🎯 {quiz.difficulty || 'Intermediate'}</span>
          {quiz.category && <span>📚 {quiz.category}</span>}
        </div>
      </div>

      {/* Question Navigation */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-medium text-gray-800">Question {currentQuestionIndex + 1} of {quiz.questions.length}</h4>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
              disabled={currentQuestionIndex === 0}
              className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              ← Previous
            </button>
            <button
              onClick={() => setCurrentQuestionIndex(Math.min(quiz.questions.length - 1, currentQuestionIndex + 1))}
              disabled={currentQuestionIndex === quiz.questions.length - 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next →
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300" 
            style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
          />
        </div>

        {/* Current Question */}
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-medium text-gray-900 flex-1">
              {currentQuestion.question}
            </h3>
            <span className="text-sm text-gray-500 ml-4">
              {currentQuestion.points || 1} point{(currentQuestion.points || 1) > 1 ? 's' : ''}
            </span>
          </div>

          {/* Answer Options */}
          <div className="space-y-3">
            {currentQuestion.question_type === 'multiple_choice' && (
              currentQuestion.options?.map((option: any, index: number) => {
                const isCorrectOption = index === currentQuestion.correct_answer
                const isUserChoice = userAnswers[currentQuestion.id] === option
                return (
                  <label key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name={`preview_${currentQuestion.id}`}
                      value={option}
                      checked={isUserChoice}
                      onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                      className="text-primary focus:ring-primary"
                    />
                    <span className="flex-1">{option}</span>
                    {showAnswers && (
                      <span className={`text-sm font-medium ${
                        isCorrectOption
                          ? 'text-green-600' 
                          : isUserChoice && !isCorrectOption
                          ? 'text-red-600'
                          : 'text-gray-400'
                      }`}>
                        {isCorrectOption ? '✓' : 
                         isUserChoice && !isCorrectOption ? '✗' : ''}
                      </span>
                    )}
                  </label>
                )
              })
            )}

            {currentQuestion.question_type === 'true_false' && (
              ['True', 'False'].map((option) => {
                const isCorrectOption = option === currentQuestion.correct_answer_text
                const isUserChoice = userAnswers[currentQuestion.id] === option
                return (
                  <label key={option} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name={`preview_${currentQuestion.id}`}
                      value={option}
                      checked={isUserChoice}
                      onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                      className="text-primary focus:ring-primary"
                    />
                    <span className="flex-1">{option}</span>
                    {showAnswers && (
                      <span className={`text-sm font-medium ${
                        isCorrectOption
                          ? 'text-green-600' 
                          : isUserChoice && !isCorrectOption
                          ? 'text-red-600'
                          : 'text-gray-400'
                      }`}>
                        {isCorrectOption ? '✓' : 
                         isUserChoice && !isCorrectOption ? '✗' : ''}
                      </span>
                    )}
                  </label>
                )
              })
            )}

            {(currentQuestion.question_type === 'fill_blank' || currentQuestion.question_type === 'essay') && (
              <textarea
                value={userAnswers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                placeholder="Type your answer here..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                rows={currentQuestion.question_type === 'essay' ? 4 : 2}
              />
            )}
          </div>

          {/* Explanation */}
          {showAnswers && currentQuestion.explanation && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <h4 className="font-medium text-blue-900 mb-2">Explanation:</h4>
              <p className="text-blue-800">{currentQuestion.explanation}</p>
            </div>
          )}
        </div>
      </div>

      {/* Question Grid Navigation */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-800 mb-3">Question Overview</h4>
        <div className="grid grid-cols-10 gap-2">
          {quiz.questions.map((question: QuizQuestion, index: number) => (
            <button
              key={question.id}
              onClick={() => setCurrentQuestionIndex(index)}
              className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                index === currentQuestionIndex
                  ? 'bg-primary text-white'
                  : userAnswers[question.id]
                  ? 'bg-green-100 text-green-800 border border-green-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Results Summary (when showing answers) */}
      {showAnswers && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="font-medium text-gray-800 mb-4">Preview Results</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{Object.keys(userAnswers).length}</div>
              <div className="text-sm text-blue-600">Questions Answered</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">{userScore}</div>
              <div className="text-sm text-green-600">Points Scored</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600">{Math.round((userScore / totalPoints) * 100)}%</div>
              <div className="text-sm text-purple-600">Accuracy</div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between pt-6 border-t">
        <button
          onClick={onBack}
          className="border-2 border-gray-300 text-gray-600 hover:bg-gray-50 px-6 py-3 rounded-lg transition-colors font-medium"
        >
          ← Back to Edit
        </button>
        
        <div className="flex gap-3">
          <button
            onClick={() => setShowAnswers(!showAnswers)}
            className="border-2 border-primary text-primary hover:bg-primary hover:text-white px-6 py-3 rounded-lg transition-colors font-medium"
          >
            {showAnswers ? '🔍 Hide Answers' : '💡 Show Answers'}
          </button>
          <button
            onClick={onSave}
            className="bg-primary hover:bg-secondary text-white hover:text-black px-6 py-3 rounded-lg transition-colors font-medium"
          >
            💾 Save Quiz
          </button>
        </div>
      </div>
    </div>
  )
}

const SavingStep: React.FC<{ quiz: QuizWithQuestions }> = ({ quiz }) => {
  return (
    <div className="text-center space-y-4">
      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
      <h3 className="text-xl font-semibold text-gray-900">Saving Your Quiz...</h3>
      <p className="text-gray-600">
        Saving &ldquo;{quiz.title}&rdquo; with {quiz.questions.length} questions
      </p>
    </div>
  )
}

const SavedStep: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="text-center">
      <div className="text-green-600 text-6xl mb-4">✓</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">Quiz Saved Successfully!</h3>
      <p className="text-gray-600 mb-4">Your quiz has been saved and is ready to use.</p>
      <button
        onClick={onClose}
        className="bg-primary hover:bg-secondary text-white hover:text-black px-6 py-2 rounded-lg"
      >
        Close
      </button>
    </div>
  )
}

const ErrorStep: React.FC<{ error: string | null; onRetry: () => void; onStartOver: () => void }> = ({ error, onRetry, onStartOver }) => {
  return (
    <div className="text-center">
      <div className="text-red-600 text-6xl mb-4">⚠</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h3>
      <p className="text-gray-600 mb-4">{error || 'An unexpected error occurred'}</p>
      <div className="flex gap-4 justify-center">
        <button
          onClick={onRetry}
          className="bg-primary hover:bg-secondary text-white hover:text-black px-6 py-2 rounded-lg"
        >
          Try Again
        </button>
        <button
          onClick={onStartOver}
          className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg"
        >
          Start Over
        </button>
      </div>
    </div>
  )
}
