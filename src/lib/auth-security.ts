/**
 * Enhanced Authentication Security
 * Provides secure role-based authentication utilities for Student/Admin system
 */

import { logger } from './logger'
import type { User } from './supabase'
import { sanitizeRedirectUrl, SAFE_REDIRECTS } from './redirect-security'

// Valid roles in our system (keeping it simple)
export type UserRole = 'student' | 'instructor' | 'admin'

// Security configuration
export const AUTH_CONFIG = {
  // Admin access configuration
  ADMIN_EMAILS: [
    'admin@acadex.com',
    'arika.krisnadevi@gmail.com',
    // Add more admin emails here as needed
  ] as string[],
  
  // Instructor access configuration
  INSTRUCTOR_EMAILS: [
    'instructor01@acadex.com',
    // Add more instructor emails here as needed
  ] as string[],
  
  // Session security
  SESSION_TIMEOUT: 8 * 60 * 60 * 1000, // 8 hours in milliseconds
  REMEMBER_ME_TIMEOUT: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
  
  // Rate limiting
  MAX_LOGIN_ATTEMPTS: 5,
  LOGIN_COOLDOWN: 15 * 60 * 1000, // 15 minutes
  
  // Password requirements
  MIN_PASSWORD_LENGTH: 8,
  REQUIRE_SPECIAL_CHARS: true,
  REQUIRE_NUMBERS: true,
  REQUIRE_UPPERCASE: true,
} as const

// Security utilities
export class AuthSecurity {
  /**
   * Determines user role based on email (simple but secure)
   */
  static determineRole(email: string): UserRole {
    const normalizedEmail = email.toLowerCase().trim()
    
    // Check against hardcoded admin emails first
    if (AUTH_CONFIG.ADMIN_EMAILS.includes(normalizedEmail)) {
      logger.info('Admin access granted (hardcoded)', { email: normalizedEmail })
      return 'admin'
    }

    // Development mode: allow emails containing "admin" (but not ALL emails)
    if (process.env.NODE_ENV === 'development' && normalizedEmail.includes('admin')) {
      logger.info('Admin access granted (development pattern)', { email: normalizedEmail })
      return 'admin'
    }

    if (AUTH_CONFIG.INSTRUCTOR_EMAILS.includes(normalizedEmail)) {
      logger.info('Instructor access granted', { email: normalizedEmail })
      return 'instructor'
    }
    
    return 'student'
  }

  /**
   * Validates if user has admin privileges
   */
  static isAdmin(user: User | null): boolean {
    if (!user) return false
    return user.role === 'admin'
  }

  /**
   * Validates if user has instructor privileges
   */
  static isInstructor(user: User | null): boolean {
    if (!user) return false
    return user.role === 'instructor' || user.role === 'admin' // Admin can access instructor features
  }

  /**
   * Validates if user has student privileges (all authenticated users)
   */
  static isStudent(user: User | null): boolean {
    if (!user) return false
    return user.role === 'student' || user.role === 'instructor' || user.role === 'admin' // All roles can access student features
  }

  /**
   * Validates if user is authenticated
   */
  static isAuthenticated(user: User | null): boolean {
    return user !== null && user.id !== undefined
  }

  /**
   * Sanitizes user data for safe client-side usage
   */
  static sanitizeUser(user: User): Omit<User, 'email'> & { email: string } {
    return {
      id: user.id,
      email: user.email.toLowerCase().trim(),
      name: user.name?.trim() || '',
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at
    }
  }

  /**
   * Validates password strength
   */
  static validatePassword(password: string): {
    isValid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    if (password.length < AUTH_CONFIG.MIN_PASSWORD_LENGTH) {
      errors.push(`Password must be at least ${AUTH_CONFIG.MIN_PASSWORD_LENGTH} characters long`)
    }

    if (AUTH_CONFIG.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    }

    if (AUTH_CONFIG.REQUIRE_NUMBERS && !/\d/.test(password)) {
      errors.push('Password must contain at least one number')
    }

    if (AUTH_CONFIG.REQUIRE_SPECIAL_CHARS && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Creates secure user session data
   */
  static createSecureSession(user: User) {
    const sessionData = {
      ...this.sanitizeUser(user),
      sessionCreated: Date.now(),
      lastActivity: Date.now()
    }

    logger.info('Secure session created', {
      userId: user.id,
      role: user.role,
      sessionCreated: sessionData.sessionCreated
    })

    return sessionData
  }

  /**
   * Validates session timeout
   */
  static isSessionValid(sessionCreated: number, rememberMe: boolean = false): boolean {
    const now = Date.now()
    const timeout = rememberMe ? AUTH_CONFIG.REMEMBER_ME_TIMEOUT : AUTH_CONFIG.SESSION_TIMEOUT
    
    return (now - sessionCreated) < timeout
  }

  /**
   * Generates secure route protection metadata
   */
  static getRouteProtection(route: string): {
    requiresAuth: boolean
    allowedRoles: UserRole[]
    isPublic: boolean
  } {
    // Public routes (no authentication required)
    const publicRoutes = [
      '/',
      '/about',
      '/contact',
      '/login',
      '/signup',
      '/courses', // Public course listing
      '/quizzes', // Public quiz listing
    ]

    // Admin-only routes
    const adminRoutes = [
      '/admin',
      '/admin/analytics',
      '/admin/courses',
      '/admin/quizzes',
      '/admin/users',
      '/admin/settings',
    ]

    // Student routes (includes admin access) - using regex patterns for dynamic routes
    const studentRoutes = [
      '/dashboard',
      '/profile',
      { pattern: /^\/courses\/[^\/]+\/study/, path: '/courses/[id]/study' },
      { pattern: /^\/quizzes\/[^\/]+\/take/, path: '/quizzes/[id]/take' },
      { pattern: /^\/quizzes\/[^\/]+\/results/, path: '/quizzes/[id]/results' },
    ]

    // Check public routes
    if (publicRoutes.some(publicRoute => route === publicRoute || route.startsWith(publicRoute))) {
      return {
        requiresAuth: false,
        allowedRoles: ['student', 'admin'],
        isPublic: true
      }
    }

    // Check admin routes
    if (adminRoutes.some(adminRoute => route.startsWith(adminRoute))) {
      return {
        requiresAuth: true,
        allowedRoles: ['admin'],
        isPublic: false
      }
    }

    // Check student routes with dynamic route support
    const matchesStudentRoute = studentRoutes.some(studentRoute => {
      if (typeof studentRoute === 'string') {
        return route === studentRoute || route.startsWith(studentRoute)
      } else {
        return studentRoute.pattern.test(route)
      }
    })

    if (matchesStudentRoute) {
      return {
        requiresAuth: true,
        allowedRoles: ['student', 'admin'], // Admin can access student features
        isPublic: false
      }
    }

    // Default: require authentication, allow all roles
    return {
      requiresAuth: true,
      allowedRoles: ['student', 'admin'],
      isPublic: false
    }
  }

  /**
   * Validates route access for user
   */
  static canAccessRoute(user: User | null, route: string): {
    canAccess: boolean
    reason?: string
    redirectTo?: string
  } {
    const protection = this.getRouteProtection(route)

    // Public routes are always accessible
    if (protection.isPublic) {
      return { canAccess: true }
    }

    // Check authentication requirement
    if (protection.requiresAuth && !this.isAuthenticated(user)) {
      return {
        canAccess: false,
        reason: 'Authentication required',
        redirectTo: SAFE_REDIRECTS.LOGIN
      }
    }

    // Check role permissions
    if (user && !protection.allowedRoles.includes(user.role)) {
      const secureRedirect = user.role === 'admin' ? SAFE_REDIRECTS.ADMIN : SAFE_REDIRECTS.DASHBOARD
      return {
        canAccess: false,
        reason: `Access denied. Required role: ${protection.allowedRoles.join(' or ')}`,
        redirectTo: secureRedirect
      }
    }

    return { canAccess: true }
  }

  /**
   * Security audit logging
   */
  static auditSecurityEvent(event: string, user: User | null, details?: any) {
    logger.warn(event, {
      userId: user?.id,
      userRole: user?.role,
      userEmail: user?.email,
      timestamp: Date.now(),
      ...details
    })
  }
}

// Rate limiting for authentication attempts
class AuthRateLimiter {
  private attempts: Map<string, { count: number; lastAttempt: number }> = new Map()

  isBlocked(identifier: string): boolean {
    const record = this.attempts.get(identifier)
    if (!record) return false

    const now = Date.now()
    const timeSinceLastAttempt = now - record.lastAttempt

    // Reset if cooldown period has passed
    if (timeSinceLastAttempt > AUTH_CONFIG.LOGIN_COOLDOWN) {
      this.attempts.delete(identifier)
      return false
    }

    return record.count >= AUTH_CONFIG.MAX_LOGIN_ATTEMPTS
  }

  recordAttempt(identifier: string, success: boolean) {
    const now = Date.now()
    
    if (success) {
      // Clear attempts on successful login
      this.attempts.delete(identifier)
      return
    }

    const record = this.attempts.get(identifier) || { count: 0, lastAttempt: 0 }
    
    // Reset count if enough time has passed
    if (now - record.lastAttempt > AUTH_CONFIG.LOGIN_COOLDOWN) {
      record.count = 0
    }

    record.count++
    record.lastAttempt = now
    this.attempts.set(identifier, record)

    logger.warn('Failed login attempt', {
      identifier,
      attempts: record.count,
      blocked: record.count >= AUTH_CONFIG.MAX_LOGIN_ATTEMPTS
    })
  }

  getRemainingCooldown(identifier: string): number {
    const record = this.attempts.get(identifier)
    if (!record) return 0

    const now = Date.now()
    const elapsed = now - record.lastAttempt
    return Math.max(0, AUTH_CONFIG.LOGIN_COOLDOWN - elapsed)
  }
}

export const authRateLimiter = new AuthRateLimiter()
