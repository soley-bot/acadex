/**
 * Simple Auth Helpers
 * Clean, minimal authentication utilities
 */

import type { User } from './supabase'

/**
 * Valid roles in the system
 */
export type UserRole = 'student' | 'instructor' | 'admin'

/**
 * Admin email whitelist
 */
export const ADMIN_EMAILS = [
  'admin@acadex.com',
  'arika.krisnadevi@gmail.com',
]

/**
 * Determine user role based on email
 */
export function determineRole(email: string): UserRole {
  const normalized = email.toLowerCase().trim()
  
  if (ADMIN_EMAILS.includes(normalized)) {
    return 'admin'
  }
  
  // Development mode: allow emails containing "admin"
  if (process.env.NODE_ENV === 'development' && normalized.includes('admin')) {
    return 'admin'
  }
  
  return 'student'
}

/**
 * Simple role checks
 */
export function isAdmin(user: User | null): boolean {
  return user?.role === 'admin'
}

export function isInstructor(user: User | null): boolean {
  return user?.role === 'instructor' || user?.role === 'admin'
}

export function isStudent(user: User | null): boolean {
  return user !== null // All authenticated users can access student features
}

export function isAuthenticated(user: User | null): boolean {
  return user !== null
}

/**
 * Check if user can edit a resource
 */
export function canEdit(user: User | null, ownerId?: string): boolean {
  if (!user) return false
  if (user.role === 'admin') return true
  return ownerId ? user.id === ownerId : false
}

/**
 * Check if user can delete a resource
 */
export function canDelete(user: User | null, ownerId?: string): boolean {
  if (!user) return false
  if (user.role === 'admin') return true
  return ownerId ? user.id === ownerId : false
}
