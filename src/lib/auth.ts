/**
 * Server-side auth utilities for protecting pages
 * Use these in Server Components to verify auth and permissions
 */

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import type { User } from '@/lib/supabase'

/**
 * Get authenticated user or redirect to login
 * Use in any protected page
 */
export async function requireAuth(redirectTo?: string) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    const params = redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ''
    redirect(`/auth?tab=signin${params}`)
  }

  return user
}

/**
 * Get authenticated user with full profile or redirect
 * Use when you need the complete user profile
 */
export async function requireAuthWithProfile(redirectTo?: string): Promise<User> {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    const params = redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ''
    redirect(`/auth?tab=signin${params}`)
  }

  // Fetch full profile from users table
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    // User has auth but no profile - create fallback
    return {
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.name || 
            user.user_metadata?.full_name ||
            user.email?.split('@')[0] || 
            'User',
      avatar_url: user.user_metadata?.avatar_url || null,
      role: 'student',
      created_at: user.created_at,
      updated_at: new Date().toISOString()
    }
  }

  return profile as User
}

/**
 * Require admin role or redirect to unauthorized
 * Use in admin-only pages
 */
export async function requireAdmin(redirectTo?: string): Promise<User> {
  const profile = await requireAuthWithProfile(redirectTo)

  if (profile.role !== 'admin') {
    redirect('/unauthorized')
  }

  return profile
}

/**
 * Require instructor or admin role
 * Use in instructor-only pages
 */
export async function requireInstructor(redirectTo?: string): Promise<User> {
  const profile = await requireAuthWithProfile(redirectTo)

  if (profile.role !== 'instructor' && profile.role !== 'admin') {
    redirect('/unauthorized')
  }

  return profile
}

/**
 * Get current user without redirecting (optional auth)
 * Use for pages that work both with and without auth
 */
export async function getOptionalUser(): Promise<User | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return {
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
      avatar_url: user.user_metadata?.avatar_url || null,
      role: 'student',
      created_at: user.created_at,
      updated_at: new Date().toISOString()
    }
  }

  return profile as User
}
