/**
 * Cached Operations - Quiz API Module
 * 
 * Handles quiz operations with advanced caching integration.
 * Extracted from cachedOperations.ts for better organization and maintainability.
 */

import { supabase, Quiz } from '../supabase'
import { quizCache } from '../cache'

export const cachedQuizAPI = {
  // Get all quizzes with caching
  getQuizzes: async (filters?: {
    category?: string
    difficulty?: string
    course_id?: string
  }): Promise<Quiz[]> => {
    const cacheKey = `quizzes:list:${JSON.stringify(filters || {})}`
    
    const cachedData = quizCache.get<Quiz[]>(cacheKey)
    if (cachedData) {
      return cachedData
    }

    let query = supabase
      .from('quizzes')
      .select('*')
      .order('created_at', { ascending: false })

    // Apply filters
    if (filters?.category) {
      query = query.eq('category', filters.category)
    }
    if (filters?.difficulty) {
      query = query.eq('difficulty', filters.difficulty)
    }
    if (filters?.course_id) {
      query = query.eq('course_id', filters.course_id)
    }

    const { data, error } = await query

    if (error) throw error

    const quizzes = (data || []) as Quiz[]
    quizCache.set(cacheKey, quizzes, ['quizzes', 'quizzes-list'])
    
    // Cache individual quizzes
    quizzes.forEach(quiz => {
      quizCache.set(`quiz:${quiz.id}`, quiz, ['quizzes', `quiz-${quiz.id}`])
    })

    return quizzes
  },

  // Get quiz by ID with caching
  getQuiz: async (id: string): Promise<Quiz | null> => {
    const cacheKey = `quiz:${id}`
    
    const cachedData = quizCache.get<Quiz>(cacheKey)
    if (cachedData) {
      return cachedData
    }

    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw error
    }

    const quiz = data as Quiz
    quizCache.set(cacheKey, quiz, ['quizzes', `quiz-${id}`])
    
    return quiz
  }
}