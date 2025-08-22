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
  autoComplete
}: FormFieldProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [hasBeenTouched, setHasBeenTouched] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const showValidation = hasBeenTouched && validation && value.length > 0
  const showError = hasBeenTouched && error && value.length > 0

  const borderColor = showError 
    ? 'border-destructive focus:border-destructive focus:ring-destructive/20' 
    : showValidation && validation.isValid
    ? 'border-success focus:border-success focus:ring-success/20'
    : isFocused 
    ? 'border-destructive focus:border-destructive focus:ring-destructive/20'
    : 'border-border focus:border-destructive focus:ring-destructive/20'

  const iconColor = showError 
    ? 'text-destructive' 
    : showValidation && validation.isValid
    ? 'text-success'
    : 'text-muted-foreground'

  return (
    <div className="space-y-3">
      <label htmlFor={name} className="block text-sm font-bold text-foreground">
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
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false)
            setHasBeenTouched(true)
          }}
          required={required}
          autoComplete={autoComplete}
          className={`
            w-full px-4 py-3 
            ${icon ? 'pl-10' : ''} 
            ${type === 'password' && onTogglePassword ? 'pr-12' : 'pr-4'}
            border-2 rounded-xl transition-all duration-300
            backdrop-blur-sm bg-background/80 hover:bg-background/90 text-foreground placeholder-muted-foreground font-medium
            focus:outline-none focus:ring-4 shadow-lg hover:shadow-xl
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
        
        {/* Validation Icon */}
        {showValidation && (
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
        <div className="flex items-start gap-2 text-destructive">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}
      
      {/* Validation Message */}
      {showValidation && validation.message && (
        <div className={`flex items-start gap-2 ${validation.isValid ? 'text-success' : 'text-destructive'}`}>
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
