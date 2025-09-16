'use client'

import { useState, useEffect } from 'react'
import { Check, X } from 'lucide-react'

interface PasswordStrengthMeterProps {
  password: string
  onValidationChange?: (isValid: boolean) => void
  isInputFocused?: boolean
}

interface PasswordRequirement {
  id: string
  label: string
  regex: RegExp
  met: boolean
}

export function PasswordStrengthMeter({ password, onValidationChange, isInputFocused = false }: PasswordStrengthMeterProps) {
  const [requirements, setRequirements] = useState<PasswordRequirement[]>([
    { id: 'length', label: 'At least 8 characters', regex: /.{8,}/, met: false },
    { id: 'uppercase', label: 'One uppercase letter', regex: /[A-Z]/, met: false },
    { id: 'lowercase', label: 'One lowercase letter', regex: /[a-z]/, met: false },
    { id: 'number', label: 'One number', regex: /\d/, met: false },
    { id: 'special', label: 'One special character (!@#$%^&*)', regex: /[!@#$%^&*(),.?":{}|<>]/, met: false }
  ])

  const [strength, setStrength] = useState(0)
  const [strengthLabel, setStrengthLabel] = useState('')
  const [strengthColor, setStrengthColor] = useState('')

  useEffect(() => {
    const baseRequirements = [
      { id: 'length', label: 'At least 8 characters', regex: /.{8,}/, met: false },
      { id: 'uppercase', label: 'One uppercase letter (A-Z)', regex: /[A-Z]/, met: false },
      { id: 'lowercase', label: 'One lowercase letter (a-z)', regex: /[a-z]/, met: false },
      { id: 'number', label: 'One number (0-9)', regex: /\d/, met: false },
      { id: 'special', label: 'One special character (!@#$%^&*)', regex: /[!@#$%^&*(),.?":{}|<>]/, met: false }
    ]

    const updatedRequirements = baseRequirements.map(req => ({
      ...req,
      met: password.length > 0 ? req.regex.test(password) : false
    }))

    const metCount = updatedRequirements.filter(req => req.met).length
    const strengthPercentage = password.length > 0 ? (metCount / baseRequirements.length) * 100 : 0

    setRequirements(updatedRequirements)
    setStrength(strengthPercentage)

    // Determine strength label and color using semantic tokens
    if (strengthPercentage === 0) {
      setStrengthLabel('')
      setStrengthColor('bg-muted')
    } else if (strengthPercentage < 40) {
      setStrengthLabel('Weak')
      setStrengthColor('bg-destructive')
    } else if (strengthPercentage < 80) {
      setStrengthLabel('Good')
      setStrengthColor('bg-warning')
    } else {
      setStrengthLabel('Strong')
      setStrengthColor('bg-success')
    }

    // Notify parent of validation status - require at least 4 out of 5 criteria
    const isValid = metCount >= 4
    onValidationChange?.(isValid)
  }, [password, onValidationChange])

  if (password.length === 0) return null

  return (
    <div className="mt-3 space-y-3">
      {/* Strength Meter */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="form-label">Password Strength</span>
          {strengthLabel && (
            <span className={`text-sm font-medium ${
              strengthLabel === 'Weak' ? 'text-destructive' :
              strengthLabel === 'Good' ? 'text-warning' :
              'text-success'
            }`}>
              {strengthLabel}
            </span>
          )}
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${strengthColor}`}
            style={{ width: `${strength}%` }}
          />
        </div>
      </div>

      {/* Requirements Checklist - Show less detail when typing */}
      {!isInputFocused && (
        <div className="surface-elevated-1 p-4 space-y-3">
          <span className="form-label">Password Requirements:</span>
          <div className="grid grid-cols-1 gap-2">
            {requirements.map((req) => (
              <div 
                key={req.id} 
                className={`flex items-center gap-3 p-2 rounded-md transition-all duration-200 ${
                  req.met 
                    ? 'bg-success/10 border border-success/20' 
                    : password.length > 0 
                      ? 'bg-destructive/10 border border-destructive/20' 
                      : 'surface-secondary border border-border'
                }`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold ${
                  req.met 
                    ? 'bg-success text-success-foreground' 
                    : password.length > 0
                      ? 'bg-destructive text-destructive-foreground'
                      : 'bg-muted text-muted-foreground'
                }`}>
                  {req.met ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <X className="w-3 h-3" />
                  )}
                </div>
                <span className={`text-sm font-medium ${
                  req.met 
                    ? 'text-success' 
                    : password.length > 0 
                      ? 'text-destructive' 
                      : 'text-muted-foreground'
                }`}>
                  {req.label}
                </span>
              </div>
            ))}
          </div>
          
          {/* Summary Message */}
          {password.length > 0 && (
            <div className={`text-center p-2 rounded-md text-sm font-medium ${
              requirements.filter(req => req.met).length >= 4
                ? 'bg-success/10 text-success border border-success/20'
                : 'bg-warning/10 text-warning border border-warning/20'
            }`}>
              {requirements.filter(req => req.met).length >= 4 
                ? '✓ Password meets requirements' 
                : `${5 - requirements.filter(req => req.met).length} more requirement${5 - requirements.filter(req => req.met).length === 1 ? '' : 's'} needed`
              }
            </div>
          )}
        </div>
      )}

      {/* Simplified view when typing */}
      {isInputFocused && password.length > 0 && (
        <div className="text-center">
          <span className={`text-sm font-medium ${
            requirements.filter(req => req.met).length >= 4
              ? 'text-success'
              : 'text-muted-foreground'
          }`}>
            {requirements.filter(req => req.met).length >= 4 
              ? '✓ Password meets requirements' 
              : `${requirements.filter(req => req.met).length}/5 requirements met`
            }
          </span>
        </div>
      )}
    </div>
  )
}
