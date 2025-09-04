/**
 * Shared Form Components
 * Standardized form fields and layouts
 */

'use client'

import { ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Save, Loader2, AlertCircle, Check } from 'lucide-react'
import { ValidationError } from '@/hooks/useUnifiedForm'

// Form Container Component
interface FormContainerProps {
  title: string
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  className?: string
}

export function FormContainer({ title, isOpen, onClose, children, className = "" }: FormContainerProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-hidden ${className}`}>
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto max-h-[calc(95vh-80px)]">
          {children}
        </div>
      </div>
    </div>
  )
}

// Form Section Component
interface FormSectionProps {
  title: string
  description?: string
  children: ReactNode
  className?: string
}

export function FormSection({ title, description, children, className = "" }: FormSectionProps) {
  return (
    <Card variant="base" className={`mb-6 ${className}`}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">{title}</CardTitle>
        {description && (
          <CardDescription className="text-muted-foreground">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
      </CardContent>
    </Card>
  )
}

// Form Field Component
interface FormFieldProps {
  label: string
  error?: string
  required?: boolean
  children: ReactNode
  className?: string
}

export function FormField({ label, error, required, children, className = "" }: FormFieldProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  )
}

// Error Summary Component
interface ErrorSummaryProps {
  errors: ValidationError[]
  className?: string
}

export function ErrorSummary({ errors, className = "" }: ErrorSummaryProps) {
  if (errors.length === 0) return null

  return (
    <Card variant="base" className={`border-destructive bg-destructive/5 mb-6 ${className}`}>
      <CardHeader>
        <CardTitle className="text-destructive flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Please fix the following errors:
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {errors.map((error, index) => (
            <li key={index} className="text-sm text-destructive">
              • {error.message}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

// Auto-save Status Component
interface AutoSaveStatusProps {
  autoSaving: boolean
  lastSaved: Date | null
  unsavedChanges: boolean
  className?: string
}

export function AutoSaveStatus({ autoSaving, lastSaved, unsavedChanges, className = "" }: AutoSaveStatusProps) {
  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      {autoSaving ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span className="text-muted-foreground">Saving...</span>
        </>
      ) : lastSaved ? (
        <>
          <Check className="w-4 h-4 text-success" />
          <span className="text-muted-foreground">
            Last saved: {lastSaved.toLocaleTimeString()}
          </span>
        </>
      ) : unsavedChanges ? (
        <span className="text-muted-foreground">Unsaved changes</span>
      ) : null}
    </div>
  )
}

// Form Actions Component
interface FormActionsProps {
  onSave: () => void
  onCancel: () => void
  onSaveNow?: () => void
  loading: boolean
  saveLabel?: string
  cancelLabel?: string
  className?: string
}

export function FormActions({
  onSave,
  onCancel,
  onSaveNow,
  loading,
  saveLabel = "Save",
  cancelLabel = "Cancel",
  className = ""
}: FormActionsProps) {
  return (
    <div className={`flex justify-between items-center p-6 border-t bg-gray-50 ${className}`}>
      <div className="flex gap-2">
        {onSaveNow && (
          <button
            type="button"
            onClick={onSaveNow}
            disabled={loading}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Save Draft
          </button>
        )}
      </div>
      
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={loading}
          className="px-6 py-2 bg-primary hover:bg-secondary text-white hover:text-black rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {saveLabel}
            </>
          )}
        </button>
      </div>
    </div>
  )
}

// Tab Navigation Component
interface TabNavigationProps {
  tabs: Array<{ key: string; label: string; icon?: ReactNode }>
  activeTab: string
  onTabChange: (tab: string) => void
  className?: string
}

export function TabNavigation({ tabs, activeTab, onTabChange, className = "" }: TabNavigationProps) {
  return (
    <div className={`border-b border-gray-200 mb-6 ${className}`}>
      <nav className="flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
              activeTab === tab.key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
