/**
 * Shared UI components for AI Quiz Generators
 */

'use client'

import { forwardRef } from 'react'
import { SUPPORTED_LANGUAGES, QUIZ_SUBJECTS, DIFFICULTY_LEVELS, QUESTION_TYPES, QUESTION_COUNT_OPTIONS } from '@/lib/quiz-constants'

interface LanguageSelectorProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
  label?: string
}

export function LanguageSelector({ value, onChange, disabled, className = '', label = 'Language' }: LanguageSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-2">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground ${className}`}
      >
        {SUPPORTED_LANGUAGES.map(lang => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </option>
        ))}
      </select>
    </div>
  )
}

interface SubjectSelectorProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
  mode?: 'dropdown' | 'input'
  placeholder?: string
}

export function SubjectSelector({ 
  value, 
  onChange, 
  disabled, 
  className = '', 
  mode = 'dropdown',
  placeholder = 'Select or enter a subject...'
}: SubjectSelectorProps) {
  if (mode === 'input') {
    return (
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Subject *
        </label>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-3 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-base bg-background text-foreground ${className}`}
          required
        />
      </div>
    )
  }

  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-2">
        Subject Category *
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground ${className}`}
        required
      >
        <option value="">Select a subject...</option>
        {QUIZ_SUBJECTS.map(subject => (
          <option key={subject} value={subject}>
            {subject}
          </option>
        ))}
      </select>
    </div>
  )
}

interface DifficultyLevelSelectorProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
}

export function DifficultyLevelSelector({ value, onChange, disabled, className = '' }: DifficultyLevelSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-2">
        Difficulty Level
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground ${className}`}
      >
        {DIFFICULTY_LEVELS.map(level => (
          <option key={level.value} value={level.value}>
            {level.label}
          </option>
        ))}
      </select>
    </div>
  )
}

interface QuestionCountSelectorProps {
  value: number
  onChange: (value: number) => void
  disabled?: boolean
  className?: string
}

export function QuestionCountSelector({ value, onChange, disabled, className = '' }: QuestionCountSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-2">
        Number of Questions
      </label>
      <select
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        disabled={disabled}
        className={`w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground ${className}`}
      >
        {QUESTION_COUNT_OPTIONS.map(count => (
          <option key={count} value={count}>
            {count} questions
          </option>
        ))}
      </select>
    </div>
  )
}

interface QuestionTypeCheckboxesProps {
  selectedTypes: string[]
  onChange: (types: string[]) => void
  disabled?: boolean
  className?: string
  maxSelections?: number
}

export function QuestionTypeCheckboxes({ 
  selectedTypes, 
  onChange, 
  disabled, 
  className = '',
  maxSelections
}: QuestionTypeCheckboxesProps) {
  const handleTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      if (maxSelections && selectedTypes.length >= maxSelections) {
        return // Don't allow more selections than maximum
      }
      onChange([...selectedTypes, type])
    } else {
      onChange(selectedTypes.filter(t => t !== type))
    }
  }

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-foreground mb-2">
        Question Types
        {maxSelections && (
          <span className="text-xs text-muted-foreground ml-1">
            (max {maxSelections})
          </span>
        )}
      </label>
      <div className="space-y-2">
        {QUESTION_TYPES.map(type => (
          <div key={type.value} className="flex items-center">
            <input
              type="checkbox"
              id={`question-type-${type.value}`}
              checked={selectedTypes.includes(type.value)}
              onChange={(e) => handleTypeChange(type.value, e.target.checked)}
              disabled={disabled || (maxSelections ? (!selectedTypes.includes(type.value) && selectedTypes.length >= maxSelections) : false)}
              className="w-4 h-4 text-primary bg-background border-input rounded focus:ring-primary focus:ring-2"
            />
            <label 
              htmlFor={`question-type-${type.value}`}
              className="ml-2 text-sm text-foreground cursor-pointer"
            >
              {type.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  )
}

interface ErrorDisplayProps {
  error: string
  className?: string
}

export function ErrorDisplay({ error, className = '' }: ErrorDisplayProps) {
  if (!error) return null

  return (
    <div className={`p-4 bg-destructive/5 border border-destructive/30 rounded-lg ${className}`}>
      <p className="text-destructive text-sm">{error}</p>
    </div>
  )
}
