/**
 * Cached Operations - User API Module
 * 
 * Handles user operations with advanced caching integration.
 * Extracted from cachedOperations.ts for better organization and maintainability.
 */

import { createSupabaseClient, User } from '../supabase'
import { userCache } from '../cache'

// Create a shared client instance for this module
const supabase = createSupabaseClient()

export const cachedUserAPI = {
  // Get user profile with caching
  getUserProfile: async (id: string): Promise<User | null> => {
    const cacheKey = `user:${id}`
    
    const cachedData = userCache.get<User>(cacheKey)
    if (cachedData) {
      return cachedData
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw error
    }

    const user = data as User
    userCache.set(cacheKey, user, ['users', `user-${id}`])
    
    return user
  },

  // Update user profile with cache invalidation
  updateUserProfile: async (id: string, updates: Partial<User>): Promise<User> => {
    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    const user = data as User
    userCache.set(`user:${id}`, user, ['users', `user-${id}`])
    
    return user
  }
}