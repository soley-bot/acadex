import { useState, useEffect } from 'react'
import { createSupabaseClient } from '@/lib/supabase'

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  color?: string
  icon?: string
  level?: number
  is_active?: boolean
}

interface UseCategoriesReturn {
  categories: Category[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export const useCategories = (): UseCategoriesReturn => {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const supabase = createSupabaseClient()
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug, description, color, icon, level, is_active')
        .eq('is_active', true)
        .order('level', { ascending: true })
        .order('name', { ascending: true })

      if (error) {
        throw error
      }

      setCategories(data || [])
    } catch (err) {
      console.error('Error fetching categories:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch categories')
      
      // Fallback to hardcoded categories if DB fetch fails
      setCategories([
        { id: 'fallback-ielts', name: 'IELTS', slug: 'ielts' },
        { id: 'fallback-toefl', name: 'TOEFL', slug: 'toefl' },
        { id: 'fallback-english', name: 'English', slug: 'english' },
        { id: 'fallback-business', name: 'Business English', slug: 'business' },
        { id: 'fallback-grammar', name: 'Grammar', slug: 'grammar' },
        { id: 'fallback-vocabulary', name: 'Vocabulary', slug: 'vocabulary' },
        { id: 'fallback-listening', name: 'Listening', slug: 'listening' },
        { id: 'fallback-reading', name: 'Reading', slug: 'reading' },
        { id: 'fallback-writing', name: 'Writing', slug: 'writing' },
        { id: 'fallback-speaking', name: 'Speaking', slug: 'speaking' }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  return {
    categories,
    isLoading,
    error,
    refetch: fetchCategories
  }
}