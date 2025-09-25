'use client'

import { useState, useRef, useEffect } from 'react'
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react'

interface FormFieldProps {
  label: string
  name: string
  type: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  error?: string
  placeholder?: string
  required?: boolean
  icon?: React.ReactNode
  showPassword?: boolean
  onTogglePassword?: () => void
  validation?: {
    isValid: boolean
    message?: string
  }
  autoComplete?: string
  onFocus?: () => void
  onBlur?: () => void
}

export function FormField({
  label,
  name,
  type,
  value,
  onChange,
  error,
  placeholder,
  required = false,
  icon,
  showPassword,
  onTogglePassword,
  validation,
  autoComplete,
  onFocus,
  onBlur
}: FormFieldProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [hasBeenTouched, setHasBeenTouched] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Only show validation/error states when not actively typing (user has stopped interacting)
  const showValidation = hasBeenTouched && !isFocused && validation && value.length > 0
  const showError = hasBeenTouched && !isFocused && error && value.length > 0

  // Simplified border color logic - consistent neutral colors during focus/typing
  const borderColor = showError 
    ? 'border-destructive focus:border-destructive focus:ring-destructive/20' 
    : showValidation && validation.isValid
    ? 'border-success focus:border-success focus:ring-success/20'
    : 'border-border focus:border-primary focus:ring-primary/20'

  // Simplified icon color - no distracting color changes during typing
  const iconColor = showError 
    ? 'text-destructive' 
    : showValidation && validation.isValid
    ? 'text-success'
    : 'text-muted-foreground'

  return (
    <div className="space-y-3">
      <label htmlFor={name} className="form-label">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      
      <div className="relative">
        {/* Icon */}
        {icon && (
          <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${iconColor} transition-colors`}>
            {icon}
          </div>
        )}
        
        {/* Input */}
        <input
          ref={inputRef}
          type={type === 'password' && showPassword ? 'text' : type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => {
            setIsFocused(true)
            onFocus?.()
          }}
          onBlur={() => {
            setIsFocused(false)
            setHasBeenTouched(true)
            onBlur?.()
          }}
          required={required}
          autoComplete={autoComplete}
          className={`
            input focus-ring
            ${icon ? 'pl-10' : ''} 
            ${type === 'password' && onTogglePassword ? 'pr-12' : 'pr-4'}
            font-medium bg-white text-gray-900 border-2 border-gray-300 placeholder:text-gray-600
            ${borderColor}
          `}
          placeholder={placeholder}
        />
        
        {/* Password Toggle */}
        {type === 'password' && onTogglePassword && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
        
        {/* Validation Icon - only show when not focused (not typing) */}
        {showValidation && !isFocused && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {validation.isValid ? (
              <CheckCircle className="w-5 h-5 text-success" />
            ) : (
              <AlertCircle className="w-5 h-5 text-destructive" />
            )}
          </div>
        )}
      </div>
      
      {/* Error Message */}
      {showError && (
        <div className="form-message-error">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}
      
      {/* Validation Message */}
      {showValidation && validation.message && (
        <div className={`form-message ${validation.isValid ? 'form-message-success' : 'form-message-error'}`}>
          {validation.isValid ? (
            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          )}
          <span className="text-sm">{validation.message}</span>
        </div>
      )}
    </div>
  )
}

// Pre-configured form fields for common use cases
export function EmailField(props: Omit<FormFieldProps, 'type' | 'icon' | 'autoComplete'>) {
  return (
    <FormField
      {...props}
      type="email"
      icon={<Mail className="w-5 h-5" />}
      autoComplete="email"
    />
  )
}

export function PasswordField(props: Omit<FormFieldProps, 'type' | 'icon' | 'autoComplete'>) {
  return (
    <FormField
      {...props}
      type="password"
      icon={<Lock className="w-5 h-5" />}
      autoComplete={props.name === 'password' ? 'new-password' : 'current-password'}
    />
  )
}

