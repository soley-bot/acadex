/**
 * Unified Form Hook for Quiz and Course Creation
 * Eliminates redundancy and standardizes form behavior
 */

'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { logger } from '@/lib/logger'
import { useAuth } from '@/contexts/AuthContext'

export interface ValidationError {
  field: string
  message: string
  index?: number
}

export interface FormOptions<T> {
  initialData: T
  validationRules?: (data: T) => ValidationError[]
  autoSaveKey: string
  autoSaveDelay?: number
  onSave?: (data: T) => Promise<void>
  enableAutoSave?: boolean
}

export function useUnifiedForm<T extends Record<string, any>>({
  initialData,
  validationRules,
  autoSaveKey,
  autoSaveDelay = 3000,
  onSave,
  enableAutoSave = true
}: FormOptions<T>) {
  const { user } = useAuth()
  
  // Core form state
  const [formData, setFormData] = useState<T>(initialData)
  const [errors, setErrors] = useState<ValidationError[]>([])
  const [loading, setLoading] = useState(false)
  const [autoSaving, setAutoSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [unsavedChanges, setUnsavedChanges] = useState(false)
  
  // Refs for auto-save
  const autoSaveTimer = useRef<NodeJS.Timeout>()
  const hasInitialized = useRef(false)
  
  // Validation function
  const validateForm = useCallback((): ValidationError[] => {
    if (!validationRules) return []
    
    const newErrors = validationRules(formData)
    setErrors(newErrors)
    return newErrors
  }, [formData, validationRules])

  // Auto-save functionality
  const autoSave = useCallback(async () => {
    if (!user || !unsavedChanges || loading || !enableAutoSave) return

    try {
      setAutoSaving(true)
      
      // Save to localStorage as backup
      localStorage.setItem(`form-draft-${autoSaveKey}`, JSON.stringify({
        formData,
        timestamp: new Date().toISOString()
      }))

      // Call custom save function if provided
      if (onSave) {
        await onSave(formData)
      }

      setLastSaved(new Date())
      setUnsavedChanges(false)
      
      logger.info('Form auto-saved successfully', { key: autoSaveKey })
    } catch (error) {
      logger.error('Auto-save failed:', error)
    } finally {
      setAutoSaving(false)
    }
  }, [user, unsavedChanges, loading, enableAutoSave, formData, autoSaveKey, onSave])

  // Set up auto-save timer
  useEffect(() => {
    if (unsavedChanges && enableAutoSave) {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current)
      }
      autoSaveTimer.current = setTimeout(autoSave, autoSaveDelay)
    }

    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current)
      }
    }
  }, [unsavedChanges, autoSave, autoSaveDelay, enableAutoSave])

  // Update form data and mark as unsaved
  const updateFormData = useCallback((updates: Partial<T> | ((prev: T) => T)) => {
    setFormData(prev => {
      const newData = typeof updates === 'function' ? updates(prev) : { ...prev, ...updates }
      
      // Mark as unsaved if initialized
      if (hasInitialized.current) {
        setUnsavedChanges(true)
      }
      
      return newData
    })
  }, [])

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setFormData(initialData)
    setErrors([])
    setUnsavedChanges(false)
    setLastSaved(null)
    hasInitialized.current = false
  }, [initialData])

  // Load from localStorage if available
  const loadFromDraft = useCallback(() => {
    try {
      const saved = localStorage.getItem(`form-draft-${autoSaveKey}`)
      if (saved) {
        const { formData: savedData, timestamp } = JSON.parse(saved)
        const saveDate = new Date(timestamp)
        
        // Only load if saved within last 24 hours
        if (Date.now() - saveDate.getTime() < 24 * 60 * 60 * 1000) {
          setFormData(savedData)
          setLastSaved(saveDate)
          return true
        }
      }
    } catch (error) {
      logger.warn('Failed to load draft from localStorage:', error)
    }
    return false
  }, [autoSaveKey])

  // Clear draft from localStorage
  const clearDraft = useCallback(() => {
    localStorage.removeItem(`form-draft-${autoSaveKey}`)
  }, [autoSaveKey])

  // Manual save function (for form submission)
  const save = useCallback(async () => {
    const validationErrors = validateForm()
    setErrors(validationErrors)
    
    if (validationErrors.length > 0) {
      throw new Error('Please fix validation errors before saving')
    }
    
    if (!onSave) {
      throw new Error('No save function provided')
    }
    
    setLoading(true)
    try {
      await onSave(formData)
      setUnsavedChanges(false)
      setLastSaved(new Date())
      clearDraft()
    } catch (error) {
      logger.error('Manual save failed:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [formData, validateForm, onSave, clearDraft])

  // Manual save (for auto-save)
  const saveNow = useCallback(async () => {
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current)
    }
    await autoSave()
  }, [autoSave])

  // Initialize
  useEffect(() => {
    hasInitialized.current = true
  }, [])

  return {
    // Form state
    formData,
    errors,
    loading,
    autoSaving,
    lastSaved,
    unsavedChanges,
    
    // Actions
    updateFormData,
    validateForm,
    resetForm,
    loadFromDraft,
    clearDraft,
    save,
    saveNow,
    
    // Setters for external control
    setLoading,
    setErrors
  }
}
