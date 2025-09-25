import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react'
import { logger } from '@/lib/logger'

// State Machine Types
export enum QuizBuilderState {
  CONFIGURE_AI = 'CONFIGURE_AI',
  GENERATING = 'GENERATING',
  EDITING = 'EDITING',
  PREVIEW = 'PREVIEW',
  SAVING = 'SAVING',
  SAVED = 'SAVED',
  ERROR = 'ERROR'
}

export interface QuizBuilderData {
  questions: any[]
  lastGenerated: Date | null
  lastSaved: Date | null
  error: string | null
  generationConfig: any | null
}

// Action Types
type QuizBuilderAction = 
  | { type: 'TRANSITION'; payload: { state: QuizBuilderState; data?: Partial<QuizBuilderData> } }
  | { type: 'UPDATE_DATA'; payload: Partial<QuizBuilderData> }
  | { type: 'RESET' }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }

// Context Type
interface QuizBuilderContextType {
  state: QuizBuilderState
  data: QuizBuilderData
  transitionTo: (newState: QuizBuilderState, updates?: Partial<QuizBuilderData>) => void
  updateData: (updates: Partial<QuizBuilderData>) => void
  setError: (error: string) => void
  clearError: () => void
  reset: () => void
  canTransition: (to: QuizBuilderState) => boolean
}

// State Machine Reducer
const quizBuilderReducer = (
  state: { currentState: QuizBuilderState; data: QuizBuilderData },
  action: QuizBuilderAction
): { currentState: QuizBuilderState; data: QuizBuilderData } => {
  switch (action.type) {
    case 'TRANSITION':
      const { state: newState, data: newData } = action.payload
      logger.info('State transition', { from: state.currentState, to: newState })
      return {
        currentState: newState,
        data: { ...state.data, ...newData }
      }

    case 'UPDATE_DATA':
      return {
        ...state,
        data: { ...state.data, ...action.payload }
      }

    case 'SET_ERROR':
      return {
        currentState: QuizBuilderState.ERROR,
        data: { ...state.data, error: action.payload }
      }

    case 'CLEAR_ERROR':
      return {
        ...state,
        data: { ...state.data, error: null }
      }

    case 'RESET':
      return {
        currentState: QuizBuilderState.CONFIGURE_AI,
        data: {
          questions: [],
          lastGenerated: null,
          lastSaved: null,
          error: null,
          generationConfig: null
        }
      }

    default:
      return state
  }
}

// Valid state transitions
const VALID_TRANSITIONS: Record<QuizBuilderState, QuizBuilderState[]> = {
  [QuizBuilderState.CONFIGURE_AI]: [QuizBuilderState.GENERATING],
  [QuizBuilderState.GENERATING]: [QuizBuilderState.EDITING, QuizBuilderState.ERROR],
  [QuizBuilderState.EDITING]: [QuizBuilderState.PREVIEW, QuizBuilderState.SAVING, QuizBuilderState.CONFIGURE_AI],
  [QuizBuilderState.PREVIEW]: [QuizBuilderState.EDITING, QuizBuilderState.SAVING],
  [QuizBuilderState.SAVING]: [QuizBuilderState.SAVED, QuizBuilderState.ERROR],
  [QuizBuilderState.SAVED]: [QuizBuilderState.CONFIGURE_AI, QuizBuilderState.EDITING],
  [QuizBuilderState.ERROR]: [QuizBuilderState.CONFIGURE_AI, QuizBuilderState.EDITING]
}

// Context
const QuizBuilderContext = createContext<QuizBuilderContextType | undefined>(undefined)

// Provider Props
interface QuizBuilderProviderProps {
  children: ReactNode
  initialState?: QuizBuilderState
  initialData?: Partial<QuizBuilderData>
}

// Provider Component
export const QuizBuilderProvider: React.FC<QuizBuilderProviderProps> = ({
  children,
  initialState = QuizBuilderState.CONFIGURE_AI,
  initialData = {}
}) => {
  const [state, dispatch] = useReducer(quizBuilderReducer, {
    currentState: initialState,
    data: {
      questions: [],
      lastGenerated: null,
      lastSaved: null,
      error: null,
      generationConfig: null,
      ...initialData
    }
  })

  const canTransition = useCallback((to: QuizBuilderState): boolean => {
    return VALID_TRANSITIONS[state.currentState]?.includes(to) ?? false
  }, [state.currentState])

  const transitionTo = useCallback((newState: QuizBuilderState, updates?: Partial<QuizBuilderData>) => {
    if (!canTransition(newState)) {
      logger.warn('Invalid state transition attempted', {
        from: state.currentState,
        to: newState,
        validTransitions: VALID_TRANSITIONS[state.currentState]
      })
      return
    }

    dispatch({
      type: 'TRANSITION',
      payload: { state: newState, data: updates }
    })
  }, [canTransition, state.currentState])

  const updateData = useCallback((updates: Partial<QuizBuilderData>) => {
    dispatch({ type: 'UPDATE_DATA', payload: updates })
  }, [])

  const setError = useCallback((error: string) => {
    dispatch({ type: 'SET_ERROR', payload: error })
  }, [])

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' })
  }, [])

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' })
  }, [])

  const contextValue: QuizBuilderContextType = {
    state: state.currentState,
    data: state.data,
    transitionTo,
    updateData,
    setError,
    clearError,
    reset,
    canTransition
  }

  return (
    <QuizBuilderContext.Provider value={contextValue}>
      {children}
    </QuizBuilderContext.Provider>
  )
}

// Hook to use the context
export const useQuizBuilderState = (): QuizBuilderContextType => {
  const context = useContext(QuizBuilderContext)
  if (context === undefined) {
    throw new Error('useQuizBuilderState must be used within a QuizBuilderProvider')
  }
  return context
}

// Utility hooks for specific states
export const useIsInState = (targetState: QuizBuilderState): boolean => {
  const { state } = useQuizBuilderState()
  return state === targetState
}

export const useCanTransitionTo = (targetState: QuizBuilderState): boolean => {
  const { canTransition } = useQuizBuilderState()
  return canTransition(targetState)
}

