/**
 * Refactored QuizForm using Unified Form System
 * This is the modernized version using useUnifiedForm hook and shared components
 */

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
import { ImageUpload } from '@/components/ui/ImageUpload'
import { uploadImage } from '@/lib/imageUpload'
import { AIQuizGenerator, GeneratedQuiz } from './AIQuizGenerator'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { quizCategories, quizDifficulties, getCategoryInfo } from '@/lib/quizConstants'

// Unified Form System Imports
import { useUnifiedForm, ValidationError } from '@/hooks/useUnifiedForm'
import {
  FormContainer,
  FormSection,
  FormField,
  ErrorSummary,
  AutoSaveStatus,
  FormActions,
  TabNavigation
} from '@/components/ui/FormComponents'
import {
  TextInput,
  NumberInput,
  TextareaInput,
  SelectInput,
  CheckboxInput,
  FileUpload,
  ImagePreview,
  TagInput,
  RichTextEditor
} from '@/components/ui/FormInputs'

// Legacy imports (to be gradually replaced)
import { featureFlags } from '@/components/admin/quiz-enhancements/featureFlags'
import { validateQuizData, validateQuestion } from '@/components/admin/quiz-enhancements/quizValidation'
import { initializeMonitoring, trackQuizFormEvent, trackValidationResults, trackPerformance } from '@/components/admin/quiz-enhancements/quizFormMonitoring'
import { Phase2Enhancements } from '@/components/admin/quiz-enhancements/Phase2Enhancements'
import { CategorySelector, CategorySelectorRef } from '@/components/admin/CategorySelector'
import { CategoryManagement } from '@/components/admin/CategoryManagement'

// Enhanced question types - All types except single_choice (consolidated into multiple_choice)
type QuestionType = 'multiple_choice' | 'true_false' | 'fill_blank' | 'essay' | 'matching' | 'ordering'

interface Question {
  id?: string
  question: string
  question_type: QuestionType
  options: string[] | Array<{left: string; right: string}>
  correct_answer: number | string | number[] | string[]
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

interface QuizFormProps {
  quiz?: Quiz | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  prefilledData?: GeneratedQuiz | null
}

// Quiz Form Data Interface
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
  time_limit_type: 'quiz' | 'question' | 'none'
}

export function QuizForm({ quiz, isOpen, onClose, onSuccess, prefilledData }: QuizFormProps) {
  const { user } = useAuth()
  
  // Initial form data
  const initialFormData: QuizFormData = {
    title: '',
    description: '',
    category: '',
    difficulty: quizDifficulties[0] as 'beginner' | 'intermediate' | 'advanced',
    duration_minutes: 30,
    image_url: '',
    is_published: false,
    passing_score: 70,
    max_attempts: 0, // 0 = unlimited
    time_limit_type: 'quiz' as 'quiz' | 'question' | 'none'
  }

  const [questions, setQuestions] = useState<Question[]>([])
  const [activeTab, setActiveTab] = useState<'details' | 'questions' | 'settings'>('details')
  const [showAIGenerator, setShowAIGenerator] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [showCategoryManagement, setShowCategoryManagement] = useState(false)
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set())

  // Refs
  const categorySelectorRef = useRef<CategorySelectorRef>(null)

  // Custom validation function for quiz data
  const customValidation = useCallback((formData: QuizFormData): ValidationError[] => {
    let errors: ValidationError[] = []

    // Enhanced validation if enabled
    if (featureFlags.enableFoundation && featureFlags.enableEnhancedValidation) {
      try {
        const quizValidation = validateQuizData(formData)
        const questionValidations = questions.map((q, index) => 
          validateQuestion(q, index)
        ).flat()
        
        errors = [...quizValidation, ...questionValidations]
        
        // Track validation results for monitoring
        trackValidationResults({
          totalErrors: errors.length,
          errorTypes: errors.map(e => e.field),
          questionCount: questions.length,
          quizId: quiz?.id
        })
        
      } catch (error) {
        logger.error('Enhanced validation failed, falling back to basic validation:', error)
      }
    }

    // Basic validation (fallback or additional)
    if (!formData.title.trim()) {
      errors.push({ field: 'title', message: 'Quiz title is required' })
    }
    if (!formData.description.trim()) {
      errors.push({ field: 'description', message: 'Quiz description is required' })
    }
    if (!formData.category) {
      errors.push({ field: 'category', message: 'Please select a category' })
    }
    if (formData.duration_minutes < 1) {
      errors.push({ field: 'duration_minutes', message: 'Duration must be at least 1 minute' })
    }

    // Question validation
    if (questions.length === 0) {
      errors.push({ field: 'questions', message: 'Add at least one question' })
    }

    questions.forEach((q, index) => {
      if (!q.question.trim()) {
        errors.push({ 
          field: 'question', 
          message: 'Question text is required',
          index: index 
        })
      }

      // Validate options and correct answers based on question type
      if (q.question_type === 'multiple_choice') {
        if (!q.options || q.options.length < 2) {
          errors.push({ 
            field: 'options', 
            message: 'At least 2 options required',
            index: index 
          })
        }
        
        const stringOptions = q.options as string[]
        if (stringOptions.some(opt => !opt?.trim?.())) {
          errors.push({ 
            field: 'options', 
            message: 'All options must have text',
            index: index 
          })
        }
        
        if (typeof q.correct_answer !== 'number' || q.correct_answer < 0) {
          errors.push({ 
            field: 'correct_answer', 
            message: 'Select one correct answer',
            index: index 
          })
        }
      }

      if (q.question_type === 'true_false') {
        if (!q.options || q.options.length !== 2) {
          errors.push({ 
            field: 'options', 
            message: 'True/False must have exactly 2 options',
            index: index 
          })
        }
        if (typeof q.correct_answer !== 'number' || q.correct_answer < 0) {
          errors.push({ 
            field: 'correct_answer', 
            message: 'Select the correct answer (True or False)',
            index: index 
          })
        }
      }

      if (q.question_type === 'matching') {
        const matchingOptions = q.options as Array<{left: string; right: string}>
        if (!matchingOptions || matchingOptions.length < 2) {
          errors.push({ 
            field: 'options', 
            message: 'At least 2 matching pairs required',
            index: index 
          })
        } else if (matchingOptions.some(pair => !pair?.left?.trim() || !pair?.right?.trim())) {
          errors.push({ 
            field: 'options', 
            message: 'All matching pairs must have text',
            index: index 
          })
        }
      }

      if (q.question_type === 'ordering') {
        const stringOptions = q.options as string[]
        if (!stringOptions || stringOptions.length < 2) {
          errors.push({ 
            field: 'options', 
            message: 'At least 2 items required for ordering',
            index: index 
          })
        } else if (stringOptions.some(opt => !opt?.trim?.())) {
          errors.push({ 
            field: 'options', 
            message: 'All ordering items must have text',
            index: index 
          })
        }
      }

      if (q.question_type === 'fill_blank') {
        if (!q.correct_answer || typeof q.correct_answer !== 'string' || q.correct_answer.trim() === '') {
          errors.push({ 
            field: 'correct_answer', 
            message: 'Fill-in-the-blank answer required',
            index: index 
          })
        }
      }
    })

    return errors
  }, [questions, quiz?.id])

  // Custom save function for quiz data
  const customSave = useCallback(async (formData: QuizFormData): Promise<void> => {
    if (!user) throw new Error('User not authenticated')

    const quizData = {
      ...formData,
      user_id: user.id,
      questions: questions.map((q, index) => ({
        ...q,
        order_index: index
      }))
    }

    // Determine API endpoint
    const endpoint = quiz?.id ? `/api/admin/quizzes/${quiz.id}` : '/api/admin/quizzes'
    const method = quiz?.id ? 'PUT' : 'POST'

    const response = await fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(quizData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to save quiz')
    }

    const savedQuiz = await response.json()
    logger.info('Quiz saved successfully:', { quizId: savedQuiz.id })
    
    // Track save event if monitoring enabled
    if (featureFlags.enableFoundation) {
      trackQuizFormEvent('quiz_saved', {
        quizId: savedQuiz.id,
        questionCount: questions.length,
        isEdit: !!quiz?.id
      })
    }

    onSuccess()
  }, [user, questions, quiz?.id, onSuccess])

  // Use the unified form hook
  const {
    formData,
    errors,
    loading,
    autoSaving,
    lastSaved,
    unsavedChanges,
    updateFormData,
    save,
    saveNow,
    clearDraft,
    setLoading,
    setErrors
  } = useUnifiedForm<QuizFormData>({
    initialData: initialFormData,
    validationRules: customValidation,
    autoSaveKey: `quiz-draft-${quiz?.id || 'new'}`,
    autoSaveDelay: 3000,
    onSave: customSave,
    enableAutoSave: true
  })

  // Helper function to update individual fields
  const updateField = useCallback((field: keyof QuizFormData, value: any) => {
    updateFormData({ [field]: value })
  }, [updateFormData])

  // Initialize form data when quiz prop changes
  useEffect(() => {
    if (quiz && isOpen) {
      // Load existing quiz data
      const loadedData: QuizFormData = {
        title: quiz.title || '',
        description: quiz.description || '',
        category: quiz.category || '',
        difficulty: (quiz.difficulty as 'beginner' | 'intermediate' | 'advanced') || 'beginner',
        duration_minutes: quiz.duration_minutes || 30,
        image_url: quiz.image_url || '',
        is_published: quiz.is_published || false,
        passing_score: quiz.passing_score || 70,
        max_attempts: quiz.max_attempts || 0,
        time_limit_type: 'quiz' as 'quiz' | 'question' | 'none' // Default value since not in DB
      }

      // Update form data
      Object.entries(loadedData).forEach(([key, value]) => {
        updateField(key as keyof QuizFormData, value)
      })

      // Note: Questions need to be loaded separately via API call
      // TODO: Load questions for existing quiz if needed
    } else if (prefilledData && isOpen) {
      // Load AI-generated data
      const aiData: QuizFormData = {
        title: prefilledData.title || '',
        description: prefilledData.description || '',
        category: prefilledData.category || '',
        difficulty: (prefilledData.difficulty as 'beginner' | 'intermediate' | 'advanced') || 'beginner',
        duration_minutes: prefilledData.duration_minutes || 30,
        image_url: '', // GeneratedQuiz doesn't include image_url
        is_published: false,
        passing_score: 70, // Default value since not in GeneratedQuiz
        max_attempts: 0,
        time_limit_type: 'quiz'
      }

      Object.entries(aiData).forEach(([key, value]) => {
        updateField(key as keyof QuizFormData, value)
      })

      if (prefilledData.questions) {
        // Convert GeneratedQuizQuestion to Question format
        const convertedQuestions: Question[] = prefilledData.questions.map((q, index) => ({
          question: q.question,
          question_type: q.question_type,
          options: q.options || [],
          correct_answer: q.correct_answer,
          explanation: q.explanation,
          order_index: index, // Add missing order_index
          points: 1, // Default points
          difficulty_level: 'medium' // Default difficulty
        }))
        setQuestions(convertedQuestions)
      }
    }
  }, [quiz, prefilledData, isOpen, updateFormData, updateField])

  // Initialize monitoring
  useEffect(() => {
    if (featureFlags.enableFoundation && isOpen) {
      initializeMonitoring()
      trackQuizFormEvent('form_opened', { 
        quizId: quiz?.id, 
        isEdit: !!quiz,
        userId: user?.id 
      })
    }
  }, [quiz?.id, quiz, user?.id, isOpen])

  // Tab navigation configuration
  const tabs = [
    { key: 'details', label: 'Quiz Details', icon: <FileText className="w-4 h-4" /> },
    { key: 'questions', label: 'Questions', icon: <Brain className="w-4 h-4" /> },
    { key: 'settings', label: 'Settings', icon: <Settings2 className="w-4 h-4" /> }
  ]

  // Helper functions for questions management
  const addQuestion = () => {
    const newQuestion: Question = {
      question: '',
      question_type: 'multiple_choice',
      options: ['', ''],
      correct_answer: -1,
      order_index: questions.length,
      points: 1,
      difficulty_level: 'medium'
    }
    setQuestions([...questions, newQuestion])
    setExpandedQuestions(prev => new Set([...prev, questions.length]))
  }

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updated = [...questions]
    if (!updated[index]) return
    updated[index] = { ...updated[index], [field]: value } as Question
    setQuestions(updated)
  }

  const removeQuestion = (index: number) => {
    const updated = questions.filter((_, i) => i !== index)
    setQuestions(updated.map((q, i) => ({ ...q, order_index: i })))
    setExpandedQuestions(prev => {
      const newSet = new Set(prev)
      newSet.delete(index)
      return newSet
    })
  }

  const toggleQuestionExpansion = (index: number) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }

  if (!isOpen) return null

  return (
    <FormContainer
      title={quiz ? 'Edit Quiz' : 'Create New Quiz'}
      isOpen={isOpen}
      onClose={() => {
        clearDraft()
        onClose()
      }}
    >
      <div className="p-6">
        {/* Auto-save Status */}
        <div className="mb-4">
          <AutoSaveStatus
            autoSaving={autoSaving}
            lastSaved={lastSaved}
            unsavedChanges={unsavedChanges}
          />
        </div>

        {/* Error Summary */}
        <ErrorSummary errors={errors} />

        {/* Tab Navigation */}
        <TabNavigation
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab as 'details' | 'questions' | 'settings')}
        />

        {/* Quiz Details Tab */}
        {activeTab === 'details' && (
          <div className="space-y-6">
            <FormSection title="Basic Information" description="Enter the basic details for your quiz">
              <FormField
                label="Quiz Title"
                required
                error={errors.find(e => e.field === 'title')?.message}
              >
                <TextInput
                  value={formData.title}
                  onChange={(value) => updateField('title', value)}
                  placeholder="Enter quiz title..."
                />
              </FormField>

              <FormField
                label="Description"
                required
                error={errors.find(e => e.field === 'description')?.message}
              >
                <TextareaInput
                  value={formData.description}
                  onChange={(value) => updateField('description', value)}
                  placeholder="Describe what this quiz covers..."
                  rows={4}
                />
              </FormField>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Category"
                  required
                  error={errors.find(e => e.field === 'category')?.message}
                >
                  <SelectInput
                    value={formData.category}
                    onChange={(value) => updateField('category', value)}
                    options={quizCategories.map(cat => ({ value: cat, label: cat }))}
                    placeholder="Select category..."
                  />
                </FormField>

                <FormField
                  label="Difficulty Level"
                  error={errors.find(e => e.field === 'difficulty')?.message}
                >
                  <SelectInput
                    value={formData.difficulty}
                    onChange={(value) => updateField('difficulty', value as 'beginner' | 'intermediate' | 'advanced')}
                    options={quizDifficulties.map(diff => ({ value: diff, label: diff.charAt(0).toUpperCase() + diff.slice(1) }))}
                  />
                </FormField>
              </div>

              <FormField
                label="Quiz Image"
                error={errors.find(e => e.field === 'image_url')?.message}
              >
                {formData.image_url ? (
                  <ImagePreview
                    src={formData.image_url}
                    alt="Quiz image"
                    onRemove={() => updateField('image_url', '')}
                  />
                ) : (
                  <FileUpload
                    onFileSelect={async (file) => {
                      try {
                        const imageUrl = await uploadImage(file, 'quiz-images')
                        updateField('image_url', imageUrl)
                      } catch (error) {
                        logger.error('Failed to upload image:', error)
                      }
                    }}
                    accept="image/*"
                  />
                )}
              </FormField>
            </FormSection>
          </div>
        )}

        {/* Questions Tab */}
        {activeTab === 'questions' && (
          <div className="space-y-6">
            <FormSection 
              title="Quiz Questions" 
              description={`Manage your quiz questions (${questions.length} questions)`}
            >
              <div className="flex justify-between items-center mb-4">
                <button
                  type="button"
                  onClick={addQuestion}
                  className="bg-primary hover:bg-secondary text-white hover:text-black px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Question
                </button>

                <button
                  type="button"
                  onClick={() => setShowAIGenerator(true)}
                  className="border border-primary text-primary hover:bg-primary hover:text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Brain className="w-4 h-4" />
                  AI Generator
                </button>
              </div>

              {questions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Brain className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>No questions yet. Add your first question to get started.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Question items would go here - this is a simplified version */}
                  {questions.map((question, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-white">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium">Question {index + 1}</span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => toggleQuestionExpansion(index)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            {expandedQuestions.has(index) ? 
                              <ChevronUp className="w-4 h-4" /> : 
                              <ChevronDown className="w-4 h-4" />
                            }
                          </button>
                          <button
                            type="button"
                            onClick={() => removeQuestion(index)}
                            className="p-1 hover:bg-red-100 text-red-600 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      {expandedQuestions.has(index) && (
                        <div className="space-y-4">
                          <FormField label="Question Text" required>
                            <TextareaInput
                              value={question.question}
                              onChange={(value) => updateQuestion(index, 'question', value)}
                              placeholder="Enter your question..."
                              rows={3}
                            />
                          </FormField>

                          <FormField label="Question Type">
                            <SelectInput
                              value={question.question_type}
                              onChange={(value) => updateQuestion(index, 'question_type', value as QuestionType)}
                              options={[
                                { value: 'multiple_choice', label: 'Multiple Choice' },
                                { value: 'true_false', label: 'True/False' },
                                { value: 'fill_blank', label: 'Fill in the Blank' },
                                { value: 'essay', label: 'Essay' },
                                { value: 'matching', label: 'Matching' },
                                { value: 'ordering', label: 'Ordering' }
                              ]}
                            />
                          </FormField>

                          {/* Question-specific options would be rendered here based on question_type */}
                          <div className="text-sm text-muted-foreground">
                            [Question options for {question.question_type} would be rendered here]
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </FormSection>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <FormSection title="Quiz Settings" description="Configure quiz behavior and scoring">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Duration (minutes)"
                  required
                  error={errors.find(e => e.field === 'duration_minutes')?.message}
                >
                  <NumberInput
                    value={formData.duration_minutes}
                    onChange={(value) => updateField('duration_minutes', value || 30)}
                    min={1}
                    placeholder="30"
                  />
                </FormField>

                <FormField
                  label="Passing Score (%)"
                  error={errors.find(e => e.field === 'passing_score')?.message}
                >
                  <NumberInput
                    value={formData.passing_score}
                    onChange={(value) => updateField('passing_score', value || 70)}
                    min={0}
                    max={100}
                    placeholder="70"
                  />
                </FormField>

                <FormField
                  label="Maximum Attempts"
                  error={errors.find(e => e.field === 'max_attempts')?.message}
                >
                  <NumberInput
                    value={formData.max_attempts}
                    onChange={(value) => updateField('max_attempts', value || 0)}
                    min={0}
                    placeholder="0 (unlimited)"
                  />
                </FormField>

                <FormField
                  label="Time Limit Type"
                  error={errors.find(e => e.field === 'time_limit_type')?.message}
                >
                  <SelectInput
                    value={formData.time_limit_type}
                    onChange={(value) => updateField('time_limit_type', value as 'quiz' | 'question' | 'none')}
                    options={[
                      { value: 'quiz', label: 'Entire Quiz' },
                      { value: 'question', label: 'Per Question' },
                      { value: 'none', label: 'No Time Limit' }
                    ]}
                  />
                </FormField>
              </div>

              <div className="pt-4">
                <CheckboxInput
                  checked={formData.is_published}
                  onChange={(checked) => updateField('is_published', checked)}
                  label="Publish quiz immediately"
                />
              </div>
            </FormSection>
          </div>
        )}
      </div>

      {/* Form Actions */}
      <FormActions
        onSave={save}
        onCancel={() => {
          clearDraft()
          onClose()
        }}
        onSaveNow={saveNow}
        loading={loading}
        saveLabel={quiz ? 'Update Quiz' : 'Create Quiz'}
      />

      {/* AI Generator Modal */}
      {showAIGenerator && (
        <AIQuizGenerator
          isOpen={showAIGenerator}
          onClose={() => setShowAIGenerator(false)}
          onQuizGenerated={(generatedQuiz: GeneratedQuiz) => {
            // Handle AI generated quiz
            setShowAIGenerator(false)
          }}
        />
      )}
    </FormContainer>
  )
}
