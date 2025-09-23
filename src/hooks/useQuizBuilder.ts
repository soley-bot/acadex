import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import type { Quiz, QuizQuestion } from '@/lib/supabase'
import { validateQuizData, isValidQuiz } from '../components/admin/quiz-builder/utils/QuizBuilderUtils'

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
      questions: quiz && (quiz as any).questions ? (quiz as any).questions : []
    }
  })

  // Auto-save functionality
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>()
  const saveLockRef = useRef<Promise<any> | null>(null)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setIsDirty(false)
      setLastSaved(null)
      setIsSaving(false)
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [isOpen])

  // Save function - defined first to avoid dependency issues
  const performSave = useCallback(async (stateToSave: QuizBuilderState) => {
    if (!stateToSave.quiz.id) return

    setIsSaving(true)
    
    try {
      console.log('💾 Auto-saving quiz...', {
        quizId: stateToSave.quiz.id,
        questionCount: stateToSave.questions.length
      })

      // Save quiz metadata
      const { error: quizError } = await supabase
        .from('quizzes')
        .update({
          title: stateToSave.quiz.title,
          description: stateToSave.quiz.description,
          duration_minutes: stateToSave.quiz.duration_minutes,
          time_limit_minutes: stateToSave.quiz.time_limit_minutes,
          total_questions: stateToSave.questions.length,
          updated_at: new Date().toISOString()
        })
        .eq('id', stateToSave.quiz.id)

      if (quizError) throw quizError

      // Save questions if they exist
      if (stateToSave.questions.length > 0) {
        // Delete existing questions first
        const { error: deleteError } = await supabase
          .from('quiz_questions')
          .delete()
          .eq('quiz_id', stateToSave.quiz.id)

        if (deleteError) throw deleteError

        // Insert new questions
        const questionsToInsert = stateToSave.questions.map((q, index) => ({
          ...q,
          quiz_id: stateToSave.quiz.id,
          order_index: index,
          id: undefined // Let database generate new IDs
        }))

        const { error: insertError } = await supabase
          .from('quiz_questions')
          .insert(questionsToInsert)

        if (insertError) throw insertError
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
  }, [toast])

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
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) {
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
  }, [performSave])

  // Auto-save trigger with debouncing
  useEffect(() => {
    if (!isDirty || !state.quiz.id) return

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      debouncedSave(state)
    }, 2000) // 2 second delay

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [state, isDirty, debouncedSave])

  // Fetch questions for existing quiz
  const fetchQuestionsForQuiz = useCallback(async (quizId: string) => {
    try {
      console.log('🔄 Fetching questions for quiz:', quizId)
      
      const { data: questions, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', quizId)
        .order('order_index')

      if (error) throw error

      console.log('📊 Fetched questions:', { count: questions?.length || 0 })

      setState(prev => ({
        ...prev,
        questions: questions || []
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
    if (quiz?.id && (!state.questions.length || state.quiz.id !== quiz.id)) {
      console.log('🔄 Quiz prop changed, updating state:', {
        quizId: quiz.id,
        hasExistingQuestions: state.questions.length > 0
      })

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
  }, [quiz, fetchQuestionsForQuiz, state.quiz.id, state.questions.length])

  // State update functions
  const updateQuiz = useCallback((updates: Partial<Quiz>) => {
    setState(prev => ({
      ...prev,
      quiz: { ...prev.quiz, ...updates }
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

  const setError = useCallback((error: string | null) => {
    setState(prev => ({
      ...prev,
      error
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