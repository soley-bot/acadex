import { supabase } from '../supabase'
import { logger } from '../logger'
import { userAPI } from './users'

/**
 * Authentication API Operations Module
 * 
 * Extracted from database-backup.ts for better organization and maintainability.
 * Handles all authentication-related operations including sign up, sign in,
 * session management, and additional legacy functions for backward compatibility.
 */
export const authAPI = {
  // Sign up
  async signUp(email: string, password: string, name: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    })

    if (data.user && !error) {
      // Create user profile
      await userAPI.upsertProfile({
        id: data.user.id,
        email,
        name,
        role: 'student'
      })
    }

    return { data, error }
  },

  // Sign in
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    return { data, error }
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Get session
  async getSession() {
    const { data, error } = await supabase.auth.getSession()
    return { data, error }
  }
}