/**
 * Optimized public quiz hooks using dedicated API endpoints
 * Replaces direct Supabase queries with performance-optimized API calls
 */

'use client'

import { useQuery } from '@tanstack/react-query'
import { logger } from '@/lib/logger'
import { useMemo } from 'react'

export interface PublicQuiz {
  id: string
  title: string
  description: string
  category: string
  difficulty: string
  duration_minutes: number
  image_url?: string
  is_published: boolean
  created_at: string
  passing_score: number
  instructions?: string
  tags?: string[]
  // Reading quiz fields
  reading_passage?: string
  passage_title?: string
  passage_source?: string
  passage_audio_url?: string
  word_count?: number
  estimated_read_time?: number
  // Statistics (loaded separately)
  question_count?: number
  attempts_count?: number
  average_score?: number
}

interface QuizFilters {
  search?: string
  category?: string
  difficulty?: string
  page?: number
  limit?: number
}

interface QuizQueryResult {
  quizzes: PublicQuiz[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasMore: boolean
  }
}

interface QuizStats {
  [quizId: string]: {
    question_count: number
    attempts_count: number
    average_score: number
  }
}

/**
 * Optimized hook for fetching public quizzes with performance optimizations
 */
export function usePublicQuizzes(filters: QuizFilters = {}) {
  const {
    search = '',
    category = '',
    difficulty = '',
    page = 1,
    limit = 12
  } = filters

  return useQuery({
    queryKey: ['public-quizzes', { search, category, difficulty, page, limit }],
    queryFn: async (): Promise<QuizQueryResult> => {
      logger.debug('🚀 Fetching public quizzes with optimized API')
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        mode: 'list' // Use fast list mode
      })
      
      if (search.trim()) params.append('search', search.trim())
      if (category && category !== 'all') params.append('category', category)
      if (difficulty && difficulty !== 'all') params.append('difficulty', difficulty)

      const response = await fetch(`/api/quizzes?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch quizzes')
      }

      return {
        quizzes: data.quizzes || [],
        pagination: data.pagination || {
          page: 1,
          limit: 12,
          total: 0,
          totalPages: 0,
          hasMore: false
        }
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - public content changes less frequently
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on client errors
      if (error.message.includes('400') || error.message.includes('404')) {
        return false
      }
      return failureCount < 2
    },
    placeholderData: (previousData) => previousData, // Keep previous data while fetching
  })
}

/**
 * Lazy-load quiz statistics for better performance
 * Only call this when you need to show statistics
 */
export function usePublicQuizStatistics(quizIds: string[]) {
  return useQuery({
    queryKey: ['public-quiz-statistics', quizIds.sort()], // Sort for consistent cache key
    queryFn: async (): Promise<QuizStats> => {
      if (quizIds.length === 0) return {}
      
      logger.debug(`📊 Lazy loading statistics for ${quizIds.length} quizzes`)
      
      const response = await fetch(`/api/quizzes/stats?quizIds=${quizIds.join(',')}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch quiz statistics')
      }

      return data.stats || {}
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - stats change less frequently
    gcTime: 15 * 60 * 1000, // 15 minutes
    enabled: quizIds.length > 0, // Only run if we have quiz IDs
    retry: 1, // Statistics are not critical, fail fast
  })
}

/**
 * Get quiz categories from the current quiz data (no separate API call needed)
 */
export function usePublicQuizCategories(quizzes: PublicQuiz[] = []) {
  return useMemo(() => {
    const categorySet = new Set<string>()
    
    quizzes.forEach(quiz => {
      if (quiz.category && quiz.category.trim()) {
        categorySet.add(quiz.category)
      }
    })
    
    return Array.from(categorySet).sort()
  }, [quizzes])
}

/**
 * Enhanced quiz with statistics (combines quiz data + stats)
 */
export interface EnhancedPublicQuiz extends PublicQuiz {
  question_count: number
  attempts_count: number
  average_score: number
}

/**
 * Hook that combines quiz data with statistics for enhanced display
 * Use this when you need both quiz data and statistics
 */
export function usePublicQuizzesWithStats(filters: QuizFilters = {}) {
  const quizzesQuery = usePublicQuizzes(filters)
  
  // Extract quiz IDs from the current page
  const quizIds = useMemo(() => 
    quizzesQuery.data?.quizzes?.map(q => q.id) || [], 
    [quizzesQuery.data?.quizzes]
  )
  
  const statsQuery = usePublicQuizStatistics(quizIds)

  // Combine the data
  const enhancedQuizzes = useMemo((): EnhancedPublicQuiz[] => {
    if (!quizzesQuery.data?.quizzes || !statsQuery.data) {
      return []
    }
    
    return quizzesQuery.data.quizzes.map(quiz => ({
      ...quiz,
      question_count: statsQuery.data[quiz.id]?.question_count || 0,
      attempts_count: statsQuery.data[quiz.id]?.attempts_count || 0,
      average_score: statsQuery.data[quiz.id]?.average_score || 0
    }))
  }, [quizzesQuery.data?.quizzes, statsQuery.data])

  return {
    data: quizzesQuery.data ? {
      ...quizzesQuery.data,
      quizzes: enhancedQuizzes
    } : undefined,
    isLoading: quizzesQuery.isLoading,
    isLoadingStats: statsQuery.isLoading,
    error: quizzesQuery.error || statsQuery.error,
    refetch: () => {
      quizzesQuery.refetch()
      if (quizIds.length > 0) {
        statsQuery.refetch()
      }
    }
  }
}