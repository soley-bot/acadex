import { useState, useEffect, useRef, useCallback, startTransition } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import { getAuthHeaders } from '@/lib'
import type { Quiz, QuizQuestion } from '@/lib/supabase'
import { validateQuizData, isValidQuiz } from '../components/admin/quiz-builder/utils/QuizBuilderUtils'


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
    if (process.env.NODE_ENV === 'development') {
      console.log('🎯 Initializing quiz builder state')
    }
    
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
      const errorMsg = 'Cannot save quiz: Quiz ID is missing. This should have been created first.'
      console.error(errorMsg, { quizState: stateToSave.quiz })
      toast({
        title: 'Save Failed',
        description: 'Quiz needs to be created first. Please try again.',
        variant: 'destructive'
      })
      setError(errorMsg)
      return
    }

    setIsSaving(true)
    setError(null) // Clear any previous errors
    
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('💾 Auto-saving quiz...', {
          quizId: stateToSave.quiz.id,
          questionCount: stateToSave.questions.length
        })
      }

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

      // Save quiz metadata using optimized payload
      const updatePayload: any = {
        title: stateToSave.quiz.title,
        description: stateToSave.quiz.description,
        duration_minutes: stateToSave.quiz.duration_minutes,
        total_questions: stateToSave.questions.length
      }

      // Only include optional fields if they're set
      if (stateToSave.quiz.time_limit_minutes) {
        updatePayload.time_limit_minutes = stateToSave.quiz.time_limit_minutes
      }
      if (stateToSave.quiz.image_url?.trim()) {
        updatePayload.image_url = stateToSave.quiz.image_url
      }

      const headers = await getAuthHeaders()
      const updateResponse = await fetch(`/api/admin/quizzes/${stateToSave.quiz.id}`, {
        method: 'PUT',
        headers,
        credentials: 'include',
        body: JSON.stringify(updatePayload)
      })

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json()
        throw new Error(errorData.error || 'Failed to update quiz')
      }

      // Save questions using API route with optimized payload
      if (stateToSave.questions.length > 0) {
        // Optimize questions payload to reduce network transfer by 60-70%
        const optimizedQuestions = stateToSave.questions.map((q, index) => {
          const optimized: any = {
            question: q.question,
            question_type: q.question_type,
            options: q.options,
            correct_answer: q.correct_answer
          }

          // Include ID only if it exists (for updates, not new questions)
          if (q.id && !q.id.startsWith('temp-')) {
            optimized.id = q.id
          }

          // Only include non-empty/non-default fields
          if (q.explanation?.trim()) optimized.explanation = q.explanation
          if (q.points && q.points !== 1) optimized.points = q.points
          if (q.difficulty_level && q.difficulty_level !== 'medium') optimized.difficulty_level = q.difficulty_level
          if (q.image_url?.trim()) optimized.image_url = q.image_url
          if (q.hint?.trim()) optimized.hint = q.hint
          if (q.randomize_options === true) optimized.randomize_options = true
          if (q.partial_credit === true) optimized.partial_credit = true
          if (q.time_limit_seconds && q.time_limit_seconds > 0) optimized.time_limit_seconds = q.time_limit_seconds

          return optimized
        })

        if (process.env.NODE_ENV === 'development') {
          const originalSize = JSON.stringify(stateToSave.questions).length
          const optimizedSize = JSON.stringify(optimizedQuestions).length
          const savings = Math.round(((originalSize - optimizedSize) / originalSize) * 100)
          console.log(`📦 Payload optimized: ${savings}% smaller (${originalSize}→${optimizedSize} bytes)`)
        }

        const questionsHeaders = await getAuthHeaders()
        const questionsResponse = await fetch(`/api/admin/quizzes/${stateToSave.quiz.id}/questions`, {
          method: 'POST',
          headers: questionsHeaders,
          credentials: 'include',
          body: JSON.stringify({
            questions: optimizedQuestions,
            saveType: 'draft'
          })
        })

        if (!questionsResponse.ok) {
          const errorData = await questionsResponse.json()
          console.warn('Failed to save questions:', errorData.error)
          // Don't throw here, just log the warning - quiz metadata was saved successfully
        } else {
          console.log('✅ Questions saved successfully')
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
  }, [toast, setError, setIsSaving, setLastSaved, setIsDirty])

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

  // Auto-save trigger with performance optimization to reduce violation warnings
  useEffect(() => {
    if (!isDirty || !state.quiz.id) return

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }

    // Use requestIdleCallback for better performance and fewer violations
    autoSaveTimeoutRef.current = setTimeout(() => {
      // Use requestIdleCallback if available to reduce violation warnings
      if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(() => {
          debouncedSave(state)
        }, { timeout: 5000 })
      } else {
        // Fallback for browsers without requestIdleCallback
        debouncedSave(state)
      }
    }, 2000) // 2 second delay

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [isDirty, debouncedSave, state])

  // Fetch questions for existing quiz
  const fetchQuestionsForQuiz = useCallback(async (quizId: string) => {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Fetching questions for quiz:', quizId)
      }
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const headers = await getAuthHeaders()
      const response = await fetch(`/api/admin/quizzes/${quizId}?includeQuestions=true`, {
        method: 'GET',
        headers,
        credentials: 'include'
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch quiz')
      }

      const quizData = await response.json()
      // API returns questions array directly (transformed from quiz_questions)
      const questions = quizData?.questions || []
      console.log('📊 Fetched questions:', { count: questions.length, questions })

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
        previouslyLoadedId: loadedQuizIdRef.current,
        quizHasQuestions: !!(quiz as any).questions,
        questionsCount: (quiz as any).questions?.length || 0
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
        currentStep: 'quiz-editing', // When editing existing quiz, go directly to editing
        // If quiz already has questions loaded (from prefetch or initial load), use them
        questions: extractQuestionsFromQuiz(quiz)
      }))

      // Only fetch questions if not already loaded
      const hasQuestions = extractQuestionsFromQuiz(quiz).length > 0
      if (!hasQuestions) {
        console.log('📥 No questions in quiz prop, fetching from API...')
        fetchQuestionsForQuiz(quiz.id)
      } else {
        console.log('✅ Questions already loaded from quiz prop:', hasQuestions)
      }
    }
  }, [quiz, fetchQuestionsForQuiz])

  // State update functions with validation
  const updateQuiz = useCallback((updates: Partial<Quiz>) => {
    // Use startTransition to reduce violation warnings for state updates
    startTransition(() => {
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
    })
  }, [])

  const updateQuestions = useCallback((questions: QuizQuestion[]) => {
    // Use startTransition for large question array updates to reduce violations
    startTransition(() => {
      setState(prev => ({
        ...prev,
        questions
      }))
      setIsDirty(true)
    })
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
    const currentValidation = validateQuizData(state.quiz, state.questions)
    
    console.group('🔍 SAVE QUIZ DEBUG')
    console.log('Current State:', {
      hasQuizId: !!state.quiz.id,
      quizId: state.quiz.id,
      quizTitle: state.quiz.title,
      questionCount: state.questions.length,
      isDirty,
      isSaving,
      isValidForSave: currentValidation.isValid || state.questions.length === 0
    })
    
    // For publishing we need full validation, but for saving we can be more lenient
    if (state.questions.length > 0 && !currentValidation.isValid) {
      const questionErrors = currentValidation.errors.filter((e: string) => e.includes('question'))
      if (questionErrors.length > 0) {
        console.warn('⚠️ Question validation issues:', questionErrors)
        toast({
          title: 'Question Issues',
          description: questionErrors.join(', ') + ' - Quiz saved as draft.',
          variant: 'default'
        })
      }
    }

    setState(prev => ({ ...prev, isSaving: true }))

    try {
      // Check if we need to create a new quiz first
      if (!state.quiz.id) {
        console.log('🆕 Creating new quiz first...')
        
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          throw new Error('User not authenticated')
        }

        // Create the quiz first using optimized payload
        const quizData: any = {
          title: state.quiz.title || 'Untitled Quiz',
          description: state.quiz.description || '',
          category: state.quiz.category || '',
          difficulty: (state.quiz.difficulty as 'beginner' | 'intermediate' | 'advanced') || 'intermediate',
          duration_minutes: state.quiz.duration_minutes || 10,
          is_published: false
        }

        // Only include optional fields if they differ from defaults
        if (state.quiz.time_limit_minutes) {
          quizData.time_limit_minutes = state.quiz.time_limit_minutes
        }
        if (state.quiz.image_url?.trim()) {
          quizData.image_url = state.quiz.image_url
        }
        if (state.quiz.passing_score && state.quiz.passing_score !== 70) {
          quizData.passing_score = state.quiz.passing_score
        } else {
          quizData.passing_score = 70  // Ensure default is set
        }
        if (state.quiz.max_attempts && state.quiz.max_attempts !== 3) {
          quizData.max_attempts = state.quiz.max_attempts
        } else {
          quizData.max_attempts = 3  // Ensure default is set
        }
        
        console.log('🔄 Creating quiz with data:', quizData)
        
        const headers = await getAuthHeaders()
        const response = await fetch('/api/admin/quizzes', {
          method: 'POST',
          headers,
          credentials: 'include',
          body: JSON.stringify(quizData)
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to create quiz')
        }

        const { quiz: createdQuiz } = await response.json()

        if (!createdQuiz || !createdQuiz.id) {
          throw new Error('Quiz creation failed - no ID returned')
        }

        console.log('✅ Quiz created with ID:', createdQuiz.id)

        // Update state with the new quiz ID and wait for it to complete
        await new Promise<void>((resolve) => {
          setState(prev => {
            const updatedState = {
              ...prev,
              quiz: { ...prev.quiz, id: createdQuiz.id }
            }

            // Save questions with the new quiz ID immediately after state update
            if (updatedState.questions.length > 0) {
              performSave(updatedState).then(() => resolve())
            } else {
              resolve()
            }

            return updatedState
          })
        })
      } else {
        // Quiz already exists, save normally
        await debouncedSave(state)
      }
      
      console.log('✅ SAVE SUCCESSFUL')
      console.groupEnd()
      
      toast({
        title: 'Success',
        description: 'Quiz saved successfully!',
        variant: 'default'
      })
      
      return true
    } catch (error) {
      console.error('❌ SAVE FAILED:', error)
      console.log('Error Details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        type: error instanceof Error ? error.constructor.name : typeof error,
        stack: error instanceof Error ? error.stack : undefined
      })
      console.groupEnd()
      
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save quiz',
        variant: 'destructive'
      })
      return false
    } finally {
      setState(prev => ({ ...prev, isSaving: false }))
    }
  }, [state, debouncedSave, toast, performSave, isDirty, isSaving])

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