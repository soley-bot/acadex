'use client'

import React, { createContext, useContext, useReducer, ReactNode, useMemo } from 'react'
import { Quiz, QuizQuestion } from '@/lib/supabase'
import { UnifiedValidationError } from '@/types/validation'

// Enhanced types for better type safety
export interface QuizFormData {
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

// Type alias for backward compatibility
export type ValidationError = UnifiedValidationError

interface QuizState {
  // Form state
  formData: QuizFormData
  questions: QuizQuestion[]
  
  // UI state
  activeTab: 'details' | 'questions' | 'settings'
  loading: boolean
  autoSaving: boolean
  unsavedChanges: boolean
  lastSaved: Date | null
  
  // Validation state
  errors: ValidationError[]
  isValid: boolean
  
  // Modal states
  showAIGenerator: boolean
  showCategoryManagement: boolean
  previewMode: boolean
  expandedQuestions: Set<number>
}

type QuizAction =
  | { type: 'SET_FORM_DATA'; payload: Partial<QuizFormData> }
  | { type: 'SET_QUESTIONS'; payload: QuizQuestion[] }
  | { type: 'ADD_QUESTION'; payload: QuizQuestion }
  | { type: 'UPDATE_QUESTION'; payload: { index: number; question: Partial<QuizQuestion> } }
  | { type: 'DELETE_QUESTION'; payload: number }
  | { type: 'REORDER_QUESTIONS'; payload: { fromIndex: number; toIndex: number } }
  | { type: 'SET_ACTIVE_TAB'; payload: 'details' | 'questions' | 'settings' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_AUTO_SAVING'; payload: boolean }
  | { type: 'SET_UNSAVED_CHANGES'; payload: boolean }
  | { type: 'SET_LAST_SAVED'; payload: Date }
  | { type: 'SET_ERRORS'; payload: ValidationError[] }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'TOGGLE_AI_GENERATOR' }
  | { type: 'TOGGLE_CATEGORY_MANAGEMENT' }
  | { type: 'TOGGLE_PREVIEW_MODE' }
  | { type: 'TOGGLE_QUESTION_EXPANDED'; payload: number }
  | { type: 'RESET_FORM' }

const initialState: QuizState = {
  formData: {
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
  },
  questions: [],
  activeTab: 'details',
  loading: false,
  autoSaving: false,
  unsavedChanges: false,
  lastSaved: null,
  errors: [],
  isValid: false,
  showAIGenerator: false,
  showCategoryManagement: false,
  previewMode: false,
  expandedQuestions: new Set()
}

function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'SET_FORM_DATA':
      return {
        ...state,
        formData: { ...state.formData, ...action.payload },
        unsavedChanges: true
      }
    
    case 'SET_QUESTIONS':
      return {
        ...state,
        questions: action.payload,
        unsavedChanges: true
      }
    
    case 'ADD_QUESTION':
      return {
        ...state,
        questions: [...state.questions, action.payload],
        unsavedChanges: true
      }
    
    case 'UPDATE_QUESTION':
      const updatedQuestions = [...state.questions]
      const existingQuestion = updatedQuestions[action.payload.index]
      if (existingQuestion) {
        updatedQuestions[action.payload.index] = {
          ...existingQuestion,
          ...action.payload.question
        } as QuizQuestion
      }
      return {
        ...state,
        questions: updatedQuestions,
        unsavedChanges: true
      }
    
    case 'DELETE_QUESTION':
      return {
        ...state,
        questions: state.questions.filter((_, index) => index !== action.payload),
        unsavedChanges: true
      }
    
    case 'REORDER_QUESTIONS':
      const { fromIndex, toIndex } = action.payload
      const reorderedQuestions = [...state.questions]
      const [movedQuestion] = reorderedQuestions.splice(fromIndex, 1)
      if (movedQuestion) {
        reorderedQuestions.splice(toIndex, 0, movedQuestion)
      }
      
      // Update order_index for all questions
      const questionsWithUpdatedOrder = reorderedQuestions.map((q, index) => ({
        ...q,
        order_index: index
      }))
      
      return {
        ...state,
        questions: questionsWithUpdatedOrder,
        unsavedChanges: true
      }
    
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload }
    
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    
    case 'SET_AUTO_SAVING':
      return { ...state, autoSaving: action.payload }
    
    case 'SET_UNSAVED_CHANGES':
      return { ...state, unsavedChanges: action.payload }
    
    case 'SET_LAST_SAVED':
      return { 
        ...state, 
        lastSaved: action.payload,
        unsavedChanges: false,
        autoSaving: false
      }
    
    case 'SET_ERRORS':
      return {
        ...state,
        errors: action.payload,
        isValid: action.payload.length === 0
      }
    
    case 'CLEAR_ERRORS':
      return {
        ...state,
        errors: [],
        isValid: true
      }
    
    case 'TOGGLE_AI_GENERATOR':
      return { ...state, showAIGenerator: !state.showAIGenerator }
    
    case 'TOGGLE_CATEGORY_MANAGEMENT':
      return { ...state, showCategoryManagement: !state.showCategoryManagement }
    
    case 'TOGGLE_PREVIEW_MODE':
      return { ...state, previewMode: !state.previewMode }
    
    case 'TOGGLE_QUESTION_EXPANDED':
      const newExpandedQuestions = new Set(state.expandedQuestions)
      if (newExpandedQuestions.has(action.payload)) {
        newExpandedQuestions.delete(action.payload)
      } else {
        newExpandedQuestions.add(action.payload)
      }
      return { ...state, expandedQuestions: newExpandedQuestions }
    
    case 'RESET_FORM':
      return {
        ...initialState,
        lastSaved: null
      }
    
    default:
      return state
  }
}

interface QuizContextType {
  state: QuizState
  dispatch: React.Dispatch<QuizAction>
  
  // Computed values
  hasUnsavedChanges: boolean
  canSave: boolean
  questionCount: number
  
  // Action helpers
  updateFormData: (field: keyof QuizFormData, value: any) => void
  addQuestion: (questionType?: string) => void
  updateQuestion: (index: number, updates: Partial<QuizQuestion>) => void
  deleteQuestion: (index: number) => void
  reorderQuestions: (fromIndex: number, toIndex: number) => void
  setActiveTab: (tab: 'details' | 'questions' | 'settings') => void
  toggleQuestionExpanded: (index: number) => void
  clearErrors: () => void
  markSaved: () => void
  resetForm: () => void
}

const QuizContext = createContext<QuizContextType | undefined>(undefined)

interface QuizProviderProps {
  children: ReactNode
  initialQuiz?: Quiz
}

export function QuizProvider({ children, initialQuiz }: QuizProviderProps) {
  const [state, dispatch] = useReducer(quizReducer, {
    ...initialState,
    formData: initialQuiz ? {
      title: initialQuiz.title,
      description: initialQuiz.description,
      category: initialQuiz.category,
      difficulty: initialQuiz.difficulty,
      duration_minutes: initialQuiz.duration_minutes,
      image_url: initialQuiz.image_url || '',
      is_published: initialQuiz.is_published,
      passing_score: initialQuiz.passing_score || 70,
      max_attempts: initialQuiz.max_attempts || 0,
      time_limit_type: 'quiz'
    } : initialState.formData
  })

  // Computed values
  const hasUnsavedChanges = state.unsavedChanges
  const canSave = state.isValid && !state.loading && hasUnsavedChanges
  const questionCount = state.questions.length

  // Action helpers
  const updateFormData = useMemo(() => (field: keyof QuizFormData, value: any) => {
    dispatch({ type: 'SET_FORM_DATA', payload: { [field]: value } })
  }, [])

  const addQuestion = useMemo(() => (questionType: string = 'multiple_choice') => {
    const newQuestion: QuizQuestion = {
      id: `temp_${Date.now()}`,
      quiz_id: '',
      question: '',
      question_type: questionType as any,
      options: questionType === 'multiple_choice' ? ['', '', '', ''] : [],
      correct_answer: 0,
      correct_answer_text: null,
      explanation: '',
      order_index: state.questions.length,
      points: 1,
      difficulty_level: 'medium',
      image_url: null,
      audio_url: null,
      video_url: null
    }
    dispatch({ type: 'ADD_QUESTION', payload: newQuestion })
  }, [state.questions.length])

  const updateQuestion = useMemo(() => (index: number, updates: Partial<QuizQuestion>) => {
    dispatch({ type: 'UPDATE_QUESTION', payload: { index, question: updates } })
  }, [])

  const deleteQuestion = useMemo(() => (index: number) => {
    dispatch({ type: 'DELETE_QUESTION', payload: index })
  }, [])

  const reorderQuestions = useMemo(() => (fromIndex: number, toIndex: number) => {
    dispatch({ type: 'REORDER_QUESTIONS', payload: { fromIndex, toIndex } })
  }, [])

  const setActiveTab = useMemo(() => (tab: 'details' | 'questions' | 'settings') => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: tab })
  }, [])

  const toggleQuestionExpanded = useMemo(() => (index: number) => {
    dispatch({ type: 'TOGGLE_QUESTION_EXPANDED', payload: index })
  }, [])

  const clearErrors = useMemo(() => () => {
    dispatch({ type: 'CLEAR_ERRORS' })
  }, [])

  const markSaved = useMemo(() => () => {
    dispatch({ type: 'SET_LAST_SAVED', payload: new Date() })
  }, [])

  const resetForm = useMemo(() => () => {
    dispatch({ type: 'RESET_FORM' })
  }, [])

  const contextValue = useMemo<QuizContextType>(() => ({
    state,
    dispatch,
    hasUnsavedChanges,
    canSave,
    questionCount,
    updateFormData,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    reorderQuestions,
    setActiveTab,
    toggleQuestionExpanded,
    clearErrors,
    markSaved,
    resetForm
  }), [
    state,
    hasUnsavedChanges,
    canSave,
    questionCount,
    updateFormData,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    reorderQuestions,
    setActiveTab,
    toggleQuestionExpanded,
    clearErrors,
    markSaved,
    resetForm
  ])

  return (
    <QuizContext.Provider value={contextValue}>
      {children}
    </QuizContext.Provider>
  )
}

// Custom hook to use the quiz context
export function useQuizContext() {
  const context = useContext(QuizContext)
  if (context === undefined) {
    throw new Error('useQuizContext must be used within a QuizProvider')
  }
  return context
}

// Convenience hooks for specific parts of the state
export function useQuizForm() {
  const { state, updateFormData } = useQuizContext()
  return { formData: state.formData, updateFormData, errors: state.errors }
}

export function useQuizQuestions() {
  const { 
    state, 
    addQuestion, 
    updateQuestion, 
    deleteQuestion, 
    reorderQuestions,
    toggleQuestionExpanded 
  } = useQuizContext()
  
  return {
    questions: state.questions,
    expandedQuestions: state.expandedQuestions,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    reorderQuestions,
    toggleQuestionExpanded
  }
}

export function useQuizUI() {
  const { state, setActiveTab, dispatch } = useQuizContext()
  
  return {
    activeTab: state.activeTab,
    loading: state.loading,
    autoSaving: state.autoSaving,
    previewMode: state.previewMode,
    showAIGenerator: state.showAIGenerator,
    showCategoryManagement: state.showCategoryManagement,
    setActiveTab,
    setLoading: (loading: boolean) => dispatch({ type: 'SET_LOADING', payload: loading }),
    setAutoSaving: (autoSaving: boolean) => dispatch({ type: 'SET_AUTO_SAVING', payload: autoSaving }),
    togglePreviewMode: () => dispatch({ type: 'TOGGLE_PREVIEW_MODE' }),
    toggleAIGenerator: () => dispatch({ type: 'TOGGLE_AI_GENERATOR' }),
    toggleCategoryManagement: () => dispatch({ type: 'TOGGLE_CATEGORY_MANAGEMENT' })
  }
}

