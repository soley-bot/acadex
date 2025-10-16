import { createSupabaseClient } from '../supabase'
import type { User } from '../supabase'

// Create module-level Supabase client for API functions
const supabase = createSupabaseClient()

export const userAPI = {
  // Get current user profile
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        name,
        avatar_url,
        role,
        created_at,
        updated_at
      `)
      .eq('id', user.id)
      .single()

    return { data, error }
  },

  // Create or update user profile
  async upsertProfile(profile: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .upsert(profile)
      .select()
      .single()

    return { data, error }
  },

  // Update user profile
  async updateProfile(id: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    return { data, error }
  }
}