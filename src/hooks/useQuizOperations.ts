'use client'

import { useCallback, useEffect, useRef, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { logger } from '@/lib/logger'
import { useQuizContext, QuizFormData, ValidationError } from '@/contexts/QuizContext'
import { QuizQuestion } from '@/lib/supabase'

// Enhanced validation with better error messages
export function useQuizValidation() {
  const { state, dispatch } = useQuizContext()

  const validateQuizForm = useCallback((formData: QuizFormData, questions: QuizQuestion[]): ValidationError[] => {
    const errors: ValidationError[] = []

    // Basic form validation
    if (!formData.title.trim()) {
      errors.push({ field: 'title', message: 'Quiz title is required', severity: 'error' })
    } else if (formData.title.length < 3) {
      errors.push({ field: 'title', message: 'Quiz title must be at least 3 characters long', severity: 'error' })
    } else if (formData.title.length > 100) {
      errors.push({ field: 'title', message: 'Quiz title must be less than 100 characters', severity: 'error' })
    }

    if (!formData.description.trim()) {
      errors.push({ field: 'description', message: 'Quiz description is required', severity: 'error' })
    } else if (formData.description.length < 10) {
      errors.push({ field: 'description', message: 'Description must be at least 10 characters long', severity: 'error' })
    }

    if (!formData.category.trim()) {
      errors.push({ field: 'category', message: 'Category is required', severity: 'error' })
    }

    if (formData.duration_minutes < 1) {
      errors.push({ field: 'duration_minutes', message: 'Duration must be at least 1 minute', severity: 'error' })
    } else if (formData.duration_minutes > 480) {
      errors.push({ field: 'duration_minutes', message: 'Duration cannot exceed 8 hours (480 minutes)', severity: 'error' })
    }

    if (formData.passing_score < 0 || formData.passing_score > 100) {
      errors.push({ field: 'passing_score', message: 'Passing score must be between 0 and 100', severity: 'error' })
    }

    if (formData.max_attempts < 0) {
      errors.push({ field: 'max_attempts', message: 'Max attempts cannot be negative', severity: 'error' })
    }

    // Questions validation
    if (questions.length === 0) {
      errors.push({ field: 'questions', message: 'At least one question is required', severity: 'error' })
    } else if (questions.length > 100) {
      errors.push({ field: 'questions', message: 'Cannot have more than 100 questions per quiz', severity: 'error' })
    }

    // Individual question validation
    questions.forEach((question, index) => {
      if (!question.question.trim()) {
        errors.push({
          field: 'question',
          message: 'Question text is required',
          severity: 'error',
          questionIndex: index
        })
      }

      // Validate based on question type
      switch (question.question_type) {
        case 'multiple_choice':
          if (!question.options || question.options.length < 2) {
            errors.push({
              field: 'options',
              message: 'Multiple choice questions need at least 2 options',
              severity: 'error',
              questionIndex: index
            })
          }
          
          const filledOptions = question.options.filter((opt: string) => opt.trim())
          if (filledOptions.length < 2) {
            errors.push({
              field: 'options',
              message: 'At least 2 options must have text',
              severity: 'error',
              questionIndex: index
            })
          }

          if (question.correct_answer < 0 || question.correct_answer >= question.options.length) {
            errors.push({
              field: 'correct_answer',
              message: 'Please select a valid correct answer',
              severity: 'error',
              questionIndex: index
            })
          }
          break

        case 'true_false':
          if (question.correct_answer !== 0 && question.correct_answer !== 1) {
            errors.push({
              field: 'correct_answer',
              message: 'Please select True or False',
              severity: 'error',
              questionIndex: index
            })
          }
          break

        case 'fill_blank':
        case 'essay':
          if (!question.correct_answer_text?.trim()) {
            errors.push({
              field: 'correct_answer_text',
              message: 'Correct answer text is required for this question type',
              severity: 'error',
              questionIndex: index
            })
          }
          break

        case 'matching':
          if (!question.options || question.options.length < 2) {
            errors.push({
              field: 'options',
              message: 'Matching questions need at least 2 pairs',
              severity: 'error',
              questionIndex: index
            })
          }
          break

        case 'ordering':
          if (!question.options || question.options.length < 2) {
            errors.push({
              field: 'options',
              message: 'Ordering questions need at least 2 items',
              severity: 'error',
              questionIndex: index
            })
          }
          break
      }

      // Points validation
      if (question.points < 1 || question.points > 10) {
        errors.push({
          field: 'points',
          message: 'Points must be between 1 and 10',
          severity: 'error',
          questionIndex: index
        })
      }
    })

    return errors
  }, [])

  const validateForm = useCallback(() => {
    const errors = validateQuizForm(state.formData, state.questions)
    dispatch({ type: 'SET_ERRORS', payload: errors })
    return errors.length === 0
  }, [state.formData, state.questions, validateQuizForm, dispatch])

  // Real-time validation with debouncing
  const debouncedValidation = useMemo(() => {
    let timeoutId: NodeJS.Timeout
    return () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(validateForm, 500)
    }
  }, [validateForm])

  useEffect(() => {
    if (state.formData.title || state.questions.length > 0) {
      debouncedValidation()
    }
  }, [state.formData, state.questions, debouncedValidation])

  return {
    validateForm,
    errors: state.errors,
    isValid: state.isValid,
    clearErrors: () => dispatch({ type: 'CLEAR_ERRORS' })
  }
}

// Enhanced auto-save with conflict resolution
export function useQuizAutoSave(quizId?: string) {
  const { state, dispatch, markSaved } = useQuizContext()
  const { user } = useAuth()
  const autoSaveTimer = useRef<NodeJS.Timeout>()
  const lastSaveData = useRef<string>('')

  const saveToDatabase = useCallback(async () => {
    if (!user || !state.isValid) return

    try {
      dispatch({ type: 'SET_AUTO_SAVING', payload: true })

      // Prepare quiz data
      const quizData = {
        title: state.formData.title,
        description: state.formData.description,
        category: state.formData.category,
        difficulty: state.formData.difficulty,
        duration_minutes: state.formData.duration_minutes,
        passing_score: state.formData.passing_score,
        max_attempts: state.formData.max_attempts,
        image_url: state.formData.image_url,
        is_published: state.formData.is_published,
        total_questions: state.questions.length,
        updated_at: new Date().toISOString()
      }

      let savedQuizId = quizId

      if (quizId) {
        // Update existing quiz
        const { error } = await supabase
          .from('quizzes')
          .update(quizData)
          .eq('id', quizId)

        if (error) throw error
      } else {
        // Create new quiz
        const { data, error } = await supabase
          .from('quizzes')
          .insert(quizData)
          .select()
          .single()

        if (error) throw error
        savedQuizId = data.id
      }

      // Save questions if we have a quiz ID
      if (savedQuizId && state.questions.length > 0) {
        // Delete existing questions
        await supabase
          .from('quiz_questions')
          .delete()
          .eq('quiz_id', savedQuizId)

        // Insert new questions
        const questionsToSave = state.questions.map((q, index) => ({
          quiz_id: savedQuizId,
          question: q.question,
          question_type: q.question_type,
          options: q.options,
          correct_answer: ['fill_blank', 'essay'].includes(q.question_type) ? 0 : q.correct_answer,
          correct_answer_text: ['fill_blank', 'essay'].includes(q.question_type) ? 
            (q.correct_answer_text || '') : null,
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

      markSaved()
      logger.info('Quiz auto-saved successfully', { quizId: savedQuizId })

    } catch (error) {
      logger.error('Auto-save failed:', error)
      // Don't throw error for auto-save failures - just log them
    } finally {
      dispatch({ type: 'SET_AUTO_SAVING', payload: false })
    }
  }, [user, state.isValid, state.formData, state.questions, quizId, dispatch, markSaved])

  const triggerAutoSave = useCallback(() => {
    if (!state.unsavedChanges || !state.isValid) return

    // Check if data actually changed
    const currentData = JSON.stringify({ formData: state.formData, questions: state.questions })
    if (currentData === lastSaveData.current) return

    lastSaveData.current = currentData

    // Clear existing timer
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current)
    }

    // Set new timer for auto-save (5 seconds delay)
    autoSaveTimer.current = setTimeout(() => {
      saveToDatabase()
    }, 5000)
  }, [state.unsavedChanges, state.isValid, state.formData, state.questions, saveToDatabase])

  // Trigger auto-save when data changes
  useEffect(() => {
    triggerAutoSave()
    
    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current)
      }
    }
  }, [triggerAutoSave])

  // Save before page unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (state.unsavedChanges) {
        e.preventDefault()
        e.returnValue = ''
        // Try to save immediately
        saveToDatabase()
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [state.unsavedChanges, saveToDatabase])

  return {
    autoSaving: state.autoSaving,
    lastSaved: state.lastSaved,
    hasUnsavedChanges: state.unsavedChanges,
    saveNow: saveToDatabase,
    triggerAutoSave
  }
}

// Enhanced draft management with versioning
export function useQuizDraft(quizId?: string) {
  const { state, dispatch } = useQuizContext()
  const draftKey = `quiz_draft_${quizId || 'new'}`

  const saveDraft = useCallback(() => {
    try {
      const draft = {
        formData: state.formData,
        questions: state.questions,
        timestamp: new Date().toISOString(),
        version: '2.0' // Version for compatibility checking
      }
      
      localStorage.setItem(draftKey, JSON.stringify(draft))
      logger.info('Draft saved to localStorage', { draftKey })
    } catch (error) {
      logger.error('Failed to save draft:', error)
    }
  }, [state.formData, state.questions, draftKey])

  const loadDraft = useCallback(() => {
    try {
      const savedDraft = localStorage.getItem(draftKey)
      if (!savedDraft) return false

      const draft = JSON.parse(savedDraft)
      
      // Check version compatibility
      if (draft.version !== '2.0') {
        logger.warn('Draft version mismatch, skipping load')
        return false
      }

      // Check if draft is recent (within 24 hours)
      const draftTime = new Date(draft.timestamp)
      const now = new Date()
      const hoursDiff = (now.getTime() - draftTime.getTime()) / (1000 * 60 * 60)
      
      if (hoursDiff > 24) {
        logger.info('Draft too old, removing')
        localStorage.removeItem(draftKey)
        return false
      }

      dispatch({ type: 'SET_FORM_DATA', payload: draft.formData })
      dispatch({ type: 'SET_QUESTIONS', payload: draft.questions })
      dispatch({ type: 'SET_UNSAVED_CHANGES', payload: true })
      
      logger.info('Draft loaded successfully', { draftKey })
      return true
    } catch (error) {
      logger.error('Failed to load draft:', error)
      return false
    }
  }, [draftKey, dispatch])

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(draftKey)
      logger.info('Draft cleared', { draftKey })
    } catch (error) {
      logger.error('Failed to clear draft:', error)
    }
  }, [draftKey])

  const hasDraft = useCallback(() => {
    try {
      const savedDraft = localStorage.getItem(draftKey)
      return !!savedDraft
    } catch {
      return false
    }
  }, [draftKey])

  // Auto-save draft every 30 seconds
  useEffect(() => {
    if (state.unsavedChanges) {
      const interval = setInterval(saveDraft, 30000)
      return () => clearInterval(interval)
    }
  }, [state.unsavedChanges, saveDraft])

  return {
    saveDraft,
    loadDraft,
    clearDraft,
    hasDraft
  }
}
