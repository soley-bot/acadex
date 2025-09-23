'use client'

/**
 * Security Validation System
 * Real-time input validation, sanitization, and attack prevention
 */

import { securityMonitor, SecurityEventHelpers } from './security-monitor'
import { logger } from './logger'

export interface ValidationRule {
  name: string
  pattern?: RegExp
  maxLength?: number
  minLength?: number
  required?: boolean
  sanitize?: boolean
  allowedValues?: string[]
  custom?: (value: any) => boolean | string
}

export interface ValidationResult {
  isValid: boolean
  sanitizedValue?: any
  errors: string[]
  warnings: string[]
  threatLevel: 'none' | 'low' | 'medium' | 'high' | 'critical'
}

class SecurityValidator {
  private readonly sqlInjectionPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
    /(;|\|\||&&|\/\*|\*\/|--|\+|\||&|<|>)/,
    /('|(\\x27)|(\\x2D\\x2D))/i,
    /((\%3D)|(=))[^\n]*((\%27)|(\\x27)|(\'))/i,
    /\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i
  ]

  private readonly xssPatterns = [
    /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
    /<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<img[^>]+src[\\s]*=[\\s]*["\']javascript:/gi,
    /data:text\/html/gi,
    /vbscript:/gi
  ]

  private readonly commandInjectionPatterns = [
    /(\||&|;|\$\(|\`)/,
    /(nc|netcat|wget|curl|bash|sh|cmd|powershell)/i,
    /(\.\.|\/etc\/passwd|\/bin\/|\/usr\/bin\/)/,
    /(\${|`|\$\()/
  ]

  // Validate input against security rules
  validate(input: any, rules: ValidationRule[], context?: string): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      sanitizedValue: input,
      errors: [],
      warnings: [],
      threatLevel: 'none'
    }

    try {
      // Basic type and format validation
      for (const rule of rules) {
        const ruleResult = this.applyRule(input, rule)
        if (!ruleResult.isValid) {
          result.isValid = false
          result.errors.push(...ruleResult.errors)
        }
        if (ruleResult.warnings) {
          result.warnings.push(...ruleResult.warnings)
        }
        if (ruleResult.sanitizedValue !== undefined) {
          result.sanitizedValue = ruleResult.sanitizedValue
        }
      }

      // Security threat detection
      const threatAssessment = this.assessSecurityThreats(input, context)
      result.threatLevel = threatAssessment.level
      
      if (threatAssessment.level !== 'none') {
        result.warnings.push(`Security threat detected: ${threatAssessment.description}`)
        
        // Log security event
        this.logSecurityThreat(threatAssessment, input, context)
      }

      // If threats are critical, mark as invalid
      if (threatAssessment.level === 'critical') {
        result.isValid = false
        result.errors.push('Input blocked due to security threat')
      }

    } catch (error) {
      logger.error('Validation error:', error)
      result.isValid = false
      result.errors.push('Validation system error')
    }

    return result
  }

  // Apply individual validation rule
  private applyRule(value: any, rule: ValidationRule): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      threatLevel: 'none'
    }

    // Required check
    if (rule.required && (value === null || value === undefined || value === '')) {
      result.isValid = false
      result.errors.push(`${rule.name} is required`)
      return result
    }

    // Skip other checks if value is empty and not required
    if (!value && !rule.required) {
      return result
    }

    const stringValue = String(value)

    // Length checks
    if (rule.maxLength && stringValue.length > rule.maxLength) {
      result.isValid = false
      result.errors.push(`${rule.name} must not exceed ${rule.maxLength} characters`)
    }

    if (rule.minLength && stringValue.length < rule.minLength) {
      result.isValid = false
      result.errors.push(`${rule.name} must be at least ${rule.minLength} characters`)
    }

    // Pattern check
    if (rule.pattern && !rule.pattern.test(stringValue)) {
      result.isValid = false
      result.errors.push(`${rule.name} format is invalid`)
    }

    // Allowed values check
    if (rule.allowedValues && !rule.allowedValues.includes(stringValue)) {
      result.isValid = false
      result.errors.push(`${rule.name} must be one of: ${rule.allowedValues.join(', ')}`)
    }

    // Custom validation
    if (rule.custom) {
      const customResult = rule.custom(value)
      if (customResult !== true) {
        result.isValid = false
        result.errors.push(typeof customResult === 'string' ? customResult : `${rule.name} validation failed`)
      }
    }

    // Sanitization
    if (rule.sanitize && result.isValid) {
      result.sanitizedValue = this.sanitizeInput(stringValue)
    }

    return result
  }

  // Assess security threats in input
  private assessSecurityThreats(input: any, context?: string): { level: ValidationResult['threatLevel'], description: string } {
    if (!input) return { level: 'none', description: '' }

    const stringInput = String(input).toLowerCase()

    // SQL Injection detection
    for (const pattern of this.sqlInjectionPatterns) {
      if (pattern.test(stringInput)) {
        return { level: 'critical', description: 'SQL injection attempt detected' }
      }
    }

    // XSS detection
    for (const pattern of this.xssPatterns) {
      if (pattern.test(stringInput)) {
        return { level: 'critical', description: 'XSS attempt detected' }
      }
    }

    // Command injection detection
    for (const pattern of this.commandInjectionPatterns) {
      if (pattern.test(stringInput)) {
        return { level: 'critical', description: 'Command injection attempt detected' }
      }
    }

    // Path traversal detection
    if (stringInput.includes('../') || stringInput.includes('..\\')) {
      return { level: 'high', description: 'Path traversal attempt detected' }
    }

    // Suspicious encoding
    if (stringInput.includes('%') && /(%[0-9a-f]{2}){3,}/i.test(stringInput)) {
      return { level: 'medium', description: 'Suspicious URL encoding detected' }
    }

    // Long input (potential buffer overflow)
    if (stringInput.length > 10000) {
      return { level: 'medium', description: 'Excessively long input detected' }
    }

    return { level: 'none', description: '' }
  }

  // Sanitize input to remove/escape dangerous characters
  private sanitizeInput(input: string): string {
    return input
      .replace(/[<>\"']/g, '') // Remove dangerous HTML chars
      .replace(/javascript:/gi, '') // Remove javascript protocols
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim()
  }

  // Log security threats
  private logSecurityThreat(threat: any, input: any, context?: string): void {
    if (threat.level === 'critical') {
      SecurityEventHelpers.injectionAttempt(
        context || 'unknown',
        String(input).substring(0, 500) // Truncate for safety
      )
    } else {
      SecurityEventHelpers.suspiciousActivity(
        threat.description,
        threat.level === 'high' ? 'high' : 'medium',
        {
          context,
          inputPreview: String(input).substring(0, 100)
        }
      )
    }
  }
}

// Global validator instance
export const securityValidator = new SecurityValidator()

// Common validation rule sets
export const CommonValidationRules = {
  // User input validation
  username: [
    {
      name: 'username',
      pattern: /^[a-zA-Z0-9_-]+$/,
      minLength: 3,
      maxLength: 30,
      required: true,
      sanitize: true
    }
  ] as ValidationRule[],

  email: [
    {
      name: 'email',
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      maxLength: 255,
      required: true,
      sanitize: true
    }
  ] as ValidationRule[],

  password: [
    {
      name: 'password',
      minLength: 8,
      maxLength: 128,
      required: true,
      custom: (value: string) => {
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          return 'Password must contain at least one lowercase letter, one uppercase letter, and one number'
        }
        return true
      }
    }
  ] as ValidationRule[],

  // Content validation
  quizTitle: [
    {
      name: 'quiz title',
      minLength: 3,
      maxLength: 200,
      required: true,
      sanitize: true
    }
  ] as ValidationRule[],

  courseDescription: [
    {
      name: 'course description',
      maxLength: 5000,
      sanitize: true
    }
  ] as ValidationRule[],

  // Admin validation
  adminAction: [
    {
      name: 'admin action',
      allowedValues: ['create', 'update', 'delete', 'view', 'approve', 'reject'],
      required: true
    }
  ] as ValidationRule[],

  // ID validation
  objectId: [
    {
      name: 'object ID',
      pattern: /^[a-f\d]{8}(-[a-f\d]{4}){4}[a-f\d]{8}$/i, // UUID pattern
      required: true
    }
  ] as ValidationRule[]
}

// Helper function for easy validation
export function validateInput(
  input: any, 
  ruleSet: ValidationRule[], 
  context?: string
): ValidationResult {
  return securityValidator.validate(input, ruleSet, context)
}

// Helper function for form validation
export function validateForm(
  formData: Record<string, any>, 
  rules: Record<string, ValidationRule[]>
): Record<string, ValidationResult> {
  const results: Record<string, ValidationResult> = {}
  
  for (const [field, fieldRules] of Object.entries(rules)) {
    results[field] = securityValidator.validate(formData[field], fieldRules, field)
  }
  
  return results
}