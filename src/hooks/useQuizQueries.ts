'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createSupabaseClient, Quiz, QuizQuestion } from '@/lib/supabase'
import { logger } from '@/lib/logger'
import { useMemo } from 'react'

// Enhanced quiz interface with computed statistics
export interface QuizWithStats extends Quiz {
  attempts_count?: number
  average_score?: number
  completion_rate?: number
  question_count?: number
  recent_attempts?: Array<{
    id: string
    user_id: string
    score: number
    total_questions: number
    completed_at: string
  }>
}

interface QuizFilters {
  search?: string
  category?: string
  difficulty?: string
  published?: boolean
  page?: number
  limit?: number
}

interface QuizQueryResult {
  quizzes: QuizWithStats[]
  total: number
  totalPages: number
}

// Optimized query function with joins and statistics
async function fetchQuizzesWithStats(filters: QuizFilters = {}): Promise<QuizQueryResult> {
  const {
    search = '',
    category = '',
    difficulty = '',
    published,
    page = 1,
    limit = 12
  } = filters

  const from = (page - 1) * limit
  const to = from + limit - 1

  const supabase = createSupabaseClient()

  let query = supabase
    .from('quizzes')
    .select(`
      *,
      quiz_questions(count),
      quiz_attempts(
        id,
        user_id,
        score,
        total_questions,
        completed_at
      )
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  // Apply filters
  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
  }

  if (category && category !== 'all') {
    query = query.eq('category', category)
  }

  if (difficulty && difficulty !== 'all') {
    query = query.eq('difficulty', difficulty)
  }

  if (published !== undefined) {
    query = query.eq('is_published', published)
  }

  const { data, error, count } = await query

  if (error) {
    logger.error('Error fetching quizzes', { error: error?.message || 'Unknown error' })
    throw error
  }

  // Process quizzes with statistics
  const processedQuizzes: QuizWithStats[] = (data || []).map((quiz: any) => {
    const attempts = quiz.quiz_attempts || []
    const questionCount = quiz.quiz_questions?.[0]?.count || 0

    // Calculate statistics
    const attemptsCount = attempts.length
    const averageScore = attemptsCount > 0
      ? Math.round(attempts.reduce((sum: number, attempt: any) => 
          sum + (attempt.score / attempt.total_questions * 100), 0) / attemptsCount)
      : 0

    const completionRate = attemptsCount > 0 ? 100 : 0 // Simplified for now

    // Recent attempts (last 5)
    const recentAttempts = attempts
      .sort((a: any, b: any) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())
      .slice(0, 5)

    return {
      ...quiz,
      quiz_questions: undefined, // Remove the nested data
      quiz_attempts: undefined,  // Remove the nested data
      question_count: questionCount,
      attempts_count: attemptsCount,
      average_score: averageScore,
      completion_rate: completionRate,
      recent_attempts: recentAttempts
    }
  })

  return {
    quizzes: processedQuizzes,
    total: count || 0,
    totalPages: Math.ceil((count || 0) / limit)
  }
}

// Fetch single quiz with questions and detailed stats
async function fetchQuizWithQuestions(quizId: string): Promise<QuizWithStats & { questions: QuizQuestion[] }> {
  const supabase = createSupabaseClient()

  const { data: quiz, error: quizError } = await supabase
    .from('quizzes')
    .select('*')
    .eq('id', quizId)
    .single()

  if (quizError) throw quizError

  const { data: questions, error: questionsError } = await supabase
    .from('quiz_questions')
    .select('*')
    .eq('quiz_id', quizId)
    .order('order_index')

  if (questionsError) throw questionsError

  const { data: attempts, error: attemptsError } = await supabase
    .from('quiz_attempts')
    .select('id, user_id, score, total_questions, completed_at')
    .eq('quiz_id', quizId)
    .order('completed_at', { ascending: false })

  if (attemptsError) throw attemptsError

  // Calculate detailed statistics
  const attemptsCount = attempts.length
  const averageScore = attemptsCount > 0
    ? Math.round(attempts.reduce((sum: number, attempt: any) => 
        sum + (attempt.score / attempt.total_questions * 100), 0) / attemptsCount)
    : 0

  return {
    ...quiz,
    questions: questions || [],
    question_count: questions?.length || 0,
    attempts_count: attemptsCount,
    average_score: averageScore,
    completion_rate: 100, // Simplified
    recent_attempts: attempts.slice(0, 10)
  }
}

// Delete quiz with all related data
async function deleteQuizWithRelations(quizId: string): Promise<void> {
  const supabase = createSupabaseClient()

  // Delete in correct order due to foreign key constraints
  const { error: attemptsError } = await supabase
    .from('quiz_attempts')
    .delete()
    .eq('quiz_id', quizId)

  if (attemptsError) throw attemptsError

  const { error: questionsError } = await supabase
    .from('quiz_questions')
    .delete()
    .eq('quiz_id', quizId)

  if (questionsError) throw questionsError

  const { error: quizError } = await supabase
    .from('quizzes')
    .delete()
    .eq('id', quizId)

  if (quizError) throw quizError
}

// Toggle quiz publication status
async function toggleQuizPublication(quizId: string, isPublished: boolean): Promise<Quiz> {
  const supabase = createSupabaseClient()

  const { data, error } = await supabase
    .from('quizzes')
    .update({ is_published: isPublished, updated_at: new Date().toISOString() })
    .eq('id', quizId)
    .select()
    .single()

  if (error) throw error
  return data
}

// React Query hooks
export function useQuizzes(filters: QuizFilters = {}) {
  return useQuery({
    queryKey: ['quizzes', filters],
    queryFn: () => fetchQuizzesWithStats(filters),
    staleTime: 10 * 60 * 1000, // 10 minutes - increased for better caching
    gcTime: 15 * 60 * 1000,    // 15 minutes - increased garbage collection time
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
    refetchOnMount: false,       // Only refetch if data is stale
    retry: 1,                    // Reduced retry attempts
    retryDelay: 1000,           // 1 second retry delay
    networkMode: 'online'        // Only fetch when online
  })
}

export function useQuiz(quizId: string | undefined) {
  return useQuery({
    queryKey: ['quiz', quizId],
    queryFn: () => quizId ? fetchQuizWithQuestions(quizId) : null,
    enabled: !!quizId,
    staleTime: 5 * 60 * 1000,   // 5 minutes - increased for quiz details
    gcTime: 10 * 60 * 1000,     // 10 minutes 
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
    retryDelay: 1000,
    networkMode: 'online'
  })
}

export function useQuizMutations() {
  const queryClient = useQueryClient()

  const deleteQuizMutation = useMutation({
    mutationFn: deleteQuizWithRelations,
    onSuccess: () => {
      // Invalidate and refetch quiz lists
      queryClient.invalidateQueries({ queryKey: ['quizzes'] })
    },
    onError: (error) => {
      logger.error('Failed to delete quiz', { error: error?.message || 'Unknown error' })
    }
  })

  const togglePublicationMutation = useMutation({
    mutationFn: ({ quizId, isPublished }: { quizId: string; isPublished: boolean }) =>
      toggleQuizPublication(quizId, isPublished),
    onMutate: async ({ quizId, isPublished }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['quizzes'] })

      // Snapshot the previous value
      const previousQuizzes = queryClient.getQueryData<QuizQueryResult>(['quizzes'])

      // Optimistically update
      if (previousQuizzes) {
        queryClient.setQueryData<QuizQueryResult>(['quizzes'], {
          ...previousQuizzes,
          quizzes: previousQuizzes.quizzes.map(quiz =>
            quiz.id === quizId ? { ...quiz, is_published: isPublished } : quiz
          )
        })
      }

      return { previousQuizzes }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousQuizzes) {
        queryClient.setQueryData(['quizzes'], context.previousQuizzes)
      }
      logger.error('Failed to toggle quiz publication:', err)
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['quizzes'] })
    }
  })

  return {
    deleteQuiz: deleteQuizMutation,
    togglePublication: togglePublicationMutation
  }
}

// Hook for quiz statistics
export function useQuizStats() {
  const { data: quizzesData } = useQuizzes()

  const stats = useMemo(() => {
    if (!quizzesData?.quizzes) {
      return {
        total: 0,
        published: 0,
        draft: 0,
        totalQuestions: 0,
        averagePassingScore: 0,
        totalAttempts: 0,
        averageScore: 0
      }
    }

    const quizzes = quizzesData.quizzes
    const totalAttempts = quizzes.reduce((sum, q) => sum + (q.attempts_count || 0), 0)
    const totalScoreWeighted = quizzes.reduce((sum, q) => 
      sum + ((q.average_score || 0) * (q.attempts_count || 0)), 0)

    return {
      total: quizzes.length,
      published: quizzes.filter(q => q.is_published).length,
      draft: quizzes.filter(q => !q.is_published).length,
      totalQuestions: quizzes.reduce((sum, q) => sum + (q.question_count || 0), 0),
      averagePassingScore: quizzes.length > 0 
        ? Math.round(quizzes.reduce((sum, q) => sum + (q.passing_score || 70), 0) / quizzes.length)
        : 0,
      totalAttempts,
      averageScore: totalAttempts > 0 ? Math.round(totalScoreWeighted / totalAttempts) : 0
    }
  }, [quizzesData])

  return stats
}

// Hook for categories (extracted from quizzes)
export function useQuizCategories() {
  const { data: quizzesData } = useQuizzes()

  const categories = useMemo(() => {
    if (!quizzesData?.quizzes) return []
    
    const categorySet = new Set(quizzesData.quizzes.map(q => q.category))
    return Array.from(categorySet).sort()
  }, [quizzesData])

  return categories
}

// Hook for real-time quiz updates (optional - for collaborative editing)
export function useQuizRealtimeUpdates(quizId?: string) {
  const queryClient = useQueryClient()

  // This could be extended with Supabase real-time subscriptions
  // For now, we'll implement periodic refetching for active quizzes
  
  return useMemo(() => {
    if (!quizId) return null

    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['quiz', quizId] })
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [quizId, queryClient])
}
