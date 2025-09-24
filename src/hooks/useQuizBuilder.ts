import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import type { Quiz, QuizQuestion } from '@/lib/supabase'
import { validateQuizData, isValidQuiz } from '../components/admin/quiz-builder/utils/QuizBuilderUtils'
import { adminQuizAPI } from '@/lib/api/admin'

// Input validation utilities
const sanitizeString = (input: string | null | undefined, maxLength = 1000): string => {
  if (!input) return ''
  return input.toString().trim().slice(0, maxLength)
}

const validateQuizInput = (quiz: Partial<Quiz>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  if (!quiz.title || quiz.title.trim().length === 0) {
    errors.push('Quiz title is required')
  } else if (quiz.title.length > 200) {
    errors.push('Quiz title must be less than 200 characters')
  }
  
  if (quiz.description && quiz.description.length > 2000) {
    errors.push('Quiz description must be less than 2000 characters')
  }
  
  if (quiz.duration_minutes && (quiz.duration_minutes < 1 || quiz.duration_minutes > 600)) {
    errors.push('Duration must be between 1 and 600 minutes')
  }
  
  return { isValid: errors.length === 0, errors }
}

// Type-safe helper for quiz questions
interface SafeQuiz extends Quiz {
  questions?: QuizQuestion[]
}

const extractQuestionsFromQuiz = (quiz: Quiz | SafeQuiz | null): QuizQuestion[] => {
  if (!quiz) return []
  if ('questions' in quiz && Array.isArray(quiz.questions)) {
    return quiz.questions
  }
  return []
}

// Quiz Builder State Interface
interface QuizBuilderState {
  currentStep: 'settings' | 'ai-configuration' | 'quiz-editing' | 'review'
  quiz: Partial<Quiz>
  questions: QuizQuestion[]
  aiConfig: {
    enabled: boolean
    language: 'english' | 'khmer'
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    questionCount: number
    questionTypes: string[]
    topic: string
    subject: string
    customPrompt: string
  }
  isGenerating: boolean
  isSaving: boolean
  isPublishing: boolean
  error: string | null
}

// Initial state
const initialState: QuizBuilderState = {
  currentStep: 'settings',
  quiz: { 
    title: '', 
    description: '', 
    duration_minutes: 10, 
    time_limit_minutes: null 
  },
  questions: [],
  aiConfig: {
    enabled: false,
    language: 'english',
    difficulty: 'intermediate',
    questionCount: 5,
    questionTypes: ['multiple_choice'],
    topic: '',
    subject: '',
    customPrompt: ''
  },
  isGenerating: false,
  isSaving: false,
  isPublishing: false,
  error: null
}

export interface UseQuizBuilderProps {
  quiz?: Quiz | null
  isOpen: boolean
  onSuccess: () => void
  onClose: () => void
}

export const useQuizBuilder = ({
  quiz,
  isOpen,
  onSuccess,
  onClose
}: UseQuizBuilderProps) => {
  const { toast } = useToast()
  
  // Track which quiz ID we've loaded questions for to prevent re-fetching
  const loadedQuizIdRef = useRef<string | null>(null)
  
  // Core state management
  const [state, setState] = useState<QuizBuilderState>(() => {
    console.log('🎯 Initializing quiz builder state')
    
    return {
      ...initialState,
      // Determine initial step based on whether we have a quiz
      currentStep: quiz ? 'quiz-editing' : 'settings',
      quiz: quiz ? { 
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        category: quiz.category,
        difficulty: quiz.difficulty || 'intermediate',
        duration_minutes: quiz.duration_minutes ?? 10,
        total_questions: quiz.total_questions || 0,
        course_id: quiz.course_id,
        lesson_id: quiz.lesson_id,
        passing_score: quiz.passing_score || 70,
        max_attempts: quiz.max_attempts || 3,
        time_limit_minutes: quiz.time_limit_minutes ?? null,
        image_url: quiz.image_url,
        is_published: quiz.is_published || false,
        created_at: quiz.created_at,
        updated_at: quiz.updated_at
      } : initialState.quiz,
      // Initialize questions from quiz prop if editing existing quiz
      questions: extractQuestionsFromQuiz(quiz || null)
    }
  })

  // Auto-save functionality
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>()
  const saveLockRef = useRef<Promise<void> | null>(null)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setIsDirty(false)
      setLastSaved(null)
      setIsSaving(false)
      loadedQuizIdRef.current = null // Reset loaded quiz tracking
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [isOpen])

  // Error setter function - defined early for use in callbacks
  const setError = useCallback((error: string | null) => {
    setState(prev => ({
      ...prev,
      error
    }))
  }, [])

  // Save function - defined first to avoid dependency issues
  const performSave = useCallback(async (stateToSave: QuizBuilderState) => {
    // Validate prerequisites
    if (!stateToSave.quiz.id) {
      const errorMsg = 'Cannot save quiz: Quiz ID is missing'
      console.error(errorMsg)
      toast({
        title: 'Save Failed',
        description: errorMsg,
        variant: 'destructive'
      })
      setError(errorMsg)
      return
    }

    setIsSaving(true)
    setError(null) // Clear any previous errors
    
    try {
      console.log('💾 Auto-saving quiz...', {
        quizId: stateToSave.quiz.id,
        questionCount: stateToSave.questions.length
      })

      // Validate input before saving
      const validation = validateQuizInput(stateToSave.quiz)
      if (!validation.isValid) {
        setError(`Validation failed: ${validation.errors.join(', ')}`)
        return
      }

      // Get current user for authorization
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      // Save quiz metadata using admin API (includes ownership verification)
      const quizUpdateResult = await adminQuizAPI.updateQuiz(
        stateToSave.quiz.id!,
        {
          title: stateToSave.quiz.title,
          description: stateToSave.quiz.description,
          duration_minutes: stateToSave.quiz.duration_minutes,
          time_limit_minutes: stateToSave.quiz.time_limit_minutes,
          total_questions: stateToSave.questions.length
        },
        user.id
      )

      if (quizUpdateResult.error) {
        throw new Error(quizUpdateResult.error.message || 'Failed to update quiz')
      }

      // Save questions using admin API for better error handling and consistency
      if (stateToSave.questions.length > 0) {
        // Use individual operations for better error tracking and handling
        // This gives us better error handling and logging
        const existingQuestions = await adminQuizAPI.getQuizForEditing(stateToSave.quiz.id!)
        const existingQuestionIds = new Set(
          existingQuestions.data?.questions?.map(q => q.id) || []
        )

        // Process each question individually for better error tracking
        for (let i = 0; i < stateToSave.questions.length; i++) {
          const question = stateToSave.questions[i]
          const questionData = {
            ...question,
            quiz_id: stateToSave.quiz.id,
            order_index: i
          }

          try {
            if (question.id && !question.id.startsWith('temp-') && existingQuestionIds.has(question.id)) {
              // Update existing question
              const updateResult = await adminQuizAPI.updateQuestion(question.id, questionData, user.id)
              if (updateResult.error) {
                console.warn('Failed to update question:', question.id, updateResult.error)
              }
            } else {
              // Add new question (remove temp id)
              const { id, ...questionWithoutId } = questionData
              const addResult = await adminQuizAPI.addQuestionToQuiz(
                stateToSave.quiz.id!, 
                questionWithoutId, 
                user.id
              )
              if (addResult.error) {
                console.warn('Failed to add question:', addResult.error)
              }
            }
          } catch (error) {
            console.warn('Error processing question:', error)
          }
        }

        // Clean up orphaned questions (questions that were removed from the current set)
        if (existingQuestions.data?.questions) {
          const currentQuestionIds = new Set(
            stateToSave.questions
              .filter(q => q.id && !q.id.startsWith('temp-'))
              .map(q => q.id)
          )

          for (const existingQuestion of existingQuestions.data.questions) {
            if (!currentQuestionIds.has(existingQuestion.id)) {
              try {
                const deleteResult = await adminQuizAPI.deleteQuestion(existingQuestion.id, user.id)
                if (deleteResult.error) {
                  console.warn('Failed to delete orphaned question:', existingQuestion.id, deleteResult.error)
                }
              } catch (error) {
                console.warn('Error deleting orphaned question:', existingQuestion.id, error)
              }
            }
          }
        }
      } else {
        // If no questions, clean up any existing ones
        const existingQuestions = await adminQuizAPI.getQuizForEditing(stateToSave.quiz.id!)
        if (existingQuestions.data?.questions) {
          for (const question of existingQuestions.data.questions) {
            try {
              await adminQuizAPI.deleteQuestion(question.id, user.id)
            } catch (error) {
              console.warn('Failed to clean up question:', question.id, error)
            }
          }
        }
      }

      setLastSaved(new Date())
      setIsDirty(false)
      
      console.log('✅ Quiz auto-saved successfully')

    } catch (error) {
      console.error('❌ Auto-save failed:', error)
      toast({
        title: 'Auto-save Failed',
        description: 'Your changes may not be saved. Please save manually.',
        variant: 'destructive'
      })
    } finally {
      setIsSaving(false)
    }
  }, [toast, setError])

  // Debounced auto-save function
  const debouncedSave = useCallback(async (stateToSave: QuizBuilderState) => {
    if (!stateToSave.quiz.id || stateToSave.questions.length === 0) {
      return
    }

    // Wait for any existing save operation to complete
    if (saveLockRef.current) {
      await saveLockRef.current
    }

    // Get current session for authentication
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) {
      console.error('Session check failed:', sessionError)
      setError('Authentication error. Please refresh the page.')
      return
    }
    
    if (!session?.access_token) {
      console.warn('Session expired during auto-save')
      setError('Session expired. Please log in again to continue editing.')
      toast({
        title: 'Session Expired',
        description: 'Please log in again to save your changes.',
        variant: 'destructive'
      })
      return
    }

    // Create save promise and store it
    const savePromise = performSave(stateToSave)
    saveLockRef.current = savePromise

    try {
      await savePromise
    } catch (error) {
      console.error('Auto-save failed:', error)
    } finally {
      saveLockRef.current = null
    }
  }, [performSave, setError, toast])

  // Auto-save trigger with optimized memory usage
  useEffect(() => {
    if (!isDirty || !state.quiz.id) return

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }

    // Extract only necessary data to avoid capturing entire state in closure
    const saveData = {
      quiz: {
        id: state.quiz.id,
        title: state.quiz.title,
        description: state.quiz.description,
        duration_minutes: state.quiz.duration_minutes,
        time_limit_minutes: state.quiz.time_limit_minutes
      },
      questions: state.questions.map(q => ({
        id: q.id,
        quiz_id: q.quiz_id,
        question: q.question,
        question_type: q.question_type,
        options: q.options,
        correct_answer: q.correct_answer,
        explanation: q.explanation,
        order_index: q.order_index,
        points: q.points,
        difficulty_level: q.difficulty_level
      }))
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      debouncedSave({
        ...state,
        quiz: saveData.quiz,
        questions: saveData.questions
      })
    }, 2000) // 2 second delay

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [state.quiz.id, state.quiz.title, state.quiz.description, state.quiz.duration_minutes, state.quiz.time_limit_minutes, state.questions, isDirty, debouncedSave, state])

  // Fetch questions for existing quiz
  const fetchQuestionsForQuiz = useCallback(async (quizId: string) => {
    try {
      console.log('🔄 Fetching questions for quiz:', quizId)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const result = await adminQuizAPI.getQuizForEditing(quizId)
      
      if (result.error) {
        throw new Error(result.error.message || 'Failed to fetch quiz')
      }

      const questions = result.data?.questions || []
      console.log('📊 Fetched questions:', { count: questions.length })

      setState(prev => ({
        ...prev,
        questions: questions
      }))

    } catch (error) {
      console.error('❌ Failed to fetch questions:', error)
      setState(prev => ({
        ...prev,
        error: 'Failed to load quiz questions'
      }))
    }
  }, [])

  // Effect to load questions when quiz changes
  useEffect(() => {
    if (quiz?.id && loadedQuizIdRef.current !== quiz.id) {
      console.log('🔄 Quiz prop changed, updating state:', {
        quizId: quiz.id,
        previouslyLoadedId: loadedQuizIdRef.current
      })

      // Mark this quiz ID as being loaded
      loadedQuizIdRef.current = quiz.id

      // Update quiz data
      setState(prev => ({
        ...prev,
        quiz: {
          id: quiz.id,
          title: quiz.title,
          description: quiz.description,
          category: quiz.category,
          difficulty: quiz.difficulty || 'intermediate',
          duration_minutes: quiz.duration_minutes ?? 10,
          total_questions: quiz.total_questions || 0,
          course_id: quiz.course_id,
          lesson_id: quiz.lesson_id,
          passing_score: quiz.passing_score || 70,
          max_attempts: quiz.max_attempts || 3,
          time_limit_minutes: quiz.time_limit_minutes ?? null,
          image_url: quiz.image_url,
          is_published: quiz.is_published || false,
          created_at: quiz.created_at,
          updated_at: quiz.updated_at
        },
        currentStep: 'quiz-editing' // When editing existing quiz, go directly to editing
      }))

      // Load questions
      fetchQuestionsForQuiz(quiz.id)
    }
  }, [quiz, fetchQuestionsForQuiz])

  // State update functions with validation
  const updateQuiz = useCallback((updates: Partial<Quiz>) => {
    // Sanitize string inputs
    const sanitizedUpdates = {
      ...updates,
      ...(updates.title !== undefined && { title: sanitizeString(updates.title, 200) }),
      ...(updates.description !== undefined && { description: sanitizeString(updates.description, 2000) }),
      ...(updates.category !== undefined && { category: sanitizeString(updates.category, 100) })
    }
    
    setState(prev => ({
      ...prev,
      quiz: { ...prev.quiz, ...sanitizedUpdates }
    }))
    setIsDirty(true)
  }, [])

  const updateQuestions = useCallback((questions: QuizQuestion[]) => {
    setState(prev => ({
      ...prev,
      questions
    }))
    setIsDirty(true)
  }, [])

  const updateAIConfig = useCallback((updates: Partial<QuizBuilderState['aiConfig']>) => {
    setState(prev => ({
      ...prev,
      aiConfig: { ...prev.aiConfig, ...updates }
    }))
  }, [])

  const setCurrentStep = useCallback((step: QuizBuilderState['currentStep']) => {
    setState(prev => ({
      ...prev,
      currentStep: step
    }))
  }, [])

  // Save functions
  const saveQuiz = useCallback(async () => {
    const validation = validateQuizData(state.quiz, state.questions)
    
    if (!validation.isValid) {
      toast({
        title: 'Validation Error',
        description: validation.errors.join(', '),
        variant: 'destructive'
      })
      return false
    }

    setState(prev => ({ ...prev, isSaving: true }))

    try {
      // Implementation would go here
      await debouncedSave(state)
      
      toast({
        title: 'Success',
        description: 'Quiz saved successfully!',
        variant: 'default'
      })
      
      return true
    } catch (error) {
      console.error('Save failed:', error)
      toast({
        title: 'Error',
        description: 'Failed to save quiz',
        variant: 'destructive'
      })
      return false
    } finally {
      setState(prev => ({ ...prev, isSaving: false }))
    }
  }, [state, debouncedSave, toast])

  const publishQuiz = useCallback(async () => {
    const validation = validateQuizData(state.quiz, state.questions)
    
    if (!validation.isValid) {
      toast({
        title: 'Cannot Publish',
        description: 'Please fix all validation errors before publishing',
        variant: 'destructive'
      })
      return false
    }

    setState(prev => ({ ...prev, isPublishing: true }))

    try {
      // Save first
      const saved = await saveQuiz()
      if (!saved) return false

      // Then publish
      const { error } = await supabase
        .from('quizzes')
        .update({ is_published: true, updated_at: new Date().toISOString() })
        .eq('id', state.quiz.id)

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Quiz published successfully!',
        variant: 'default'
      })

      onSuccess()
      return true
      
    } catch (error) {
      console.error('Publish failed:', error)
      toast({
        title: 'Error',
        description: 'Failed to publish quiz',
        variant: 'destructive'
      })
      return false
    } finally {
      setState(prev => ({ ...prev, isPublishing: false }))
    }
  }, [state, saveQuiz, onSuccess, toast])

  return {
    // State
    state,
    isDirty,
    isSaving,
    lastSaved,
    
    // Actions
    updateQuiz,
    updateQuestions,
    updateAIConfig,
    setCurrentStep,
    setError,
    saveQuiz,
    publishQuiz,
    
    // Utilities
    validation: validateQuizData(state.quiz, state.questions)
  }
}