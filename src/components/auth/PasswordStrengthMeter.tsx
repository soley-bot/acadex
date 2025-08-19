'use client'

import { useState, useEffect } from 'react'
import { Check, X } from 'lucide-react'

interface PasswordStrengthMeterProps {
  password: string
  onValidationChange?: (isValid: boolean) => void
}

interface PasswordRequirement {
  id: string
  label: string
  regex: RegExp
  met: boolean
}

export function PasswordStrengthMeter({ password, onValidationChange }: PasswordStrengthMeterProps) {
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

    // Determine strength label and color
    if (strengthPercentage === 0) {
      setStrengthLabel('')
      setStrengthColor('bg-muted/60')
    } else if (strengthPercentage < 40) {
      setStrengthLabel('Weak')
      setStrengthColor('bg-primary/50')
    } else if (strengthPercentage < 80) {
      setStrengthLabel('Good')
      setStrengthColor('bg-yellow-500')
    } else {
      setStrengthLabel('Strong')
      setStrengthColor('bg-green-500')
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
          <span className="text-sm font-medium text-gray-700">Password Strength</span>
          {strengthLabel && (
            <span className={`text-sm font-medium ${
              strengthLabel === 'Weak' ? 'text-primary' :
              strengthLabel === 'Good' ? 'text-yellow-600' :
              'text-green-600'
            }`}>
              {strengthLabel}
            </span>
          )}
        </div>
        <div className="w-full bg-muted/60 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${strengthColor}`}
            style={{ width: `${strength}%` }}
          />
        </div>
      </div>

      {/* Requirements Checklist */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
        <span className="text-sm font-semibold text-gray-700">Password Requirements:</span>
        <div className="grid grid-cols-1 gap-2">
          {requirements.map((req) => (
            <div 
              key={req.id} 
              className={`flex items-center gap-3 p-2 rounded-md transition-all duration-200 ${
                req.met 
                  ? 'bg-green-50 border border-green-200' 
                  : password.length > 0 
                    ? 'bg-primary/5 border border-destructive/30' 
                    : 'bg-white border border-gray-100'
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold ${
                req.met 
                  ? 'bg-green-500 text-white' 
                  : password.length > 0
                    ? 'bg-primary text-black'
                    : 'bg-muted text-gray-500'
              }`}>
                {req.met ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <X className="w-3 h-3" />
                )}
              </div>
              <span className={`text-sm font-medium ${
                req.met 
                  ? 'text-green-700' 
                  : password.length > 0 
                    ? 'text-red-700' 
                    : 'text-gray-500'
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
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
          }`}>
            {requirements.filter(req => req.met).length >= 4 
              ? '✓ Password meets requirements' 
              : `${5 - requirements.filter(req => req.met).length} more requirement${5 - requirements.filter(req => req.met).length === 1 ? '' : 's'} needed`
            }
          </div>
        )}
      </div>
    </div>
  )
}
