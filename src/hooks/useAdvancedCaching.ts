/**
 * Advanced React Query Caching Strategies
 * Week 2 Day 1: Next-level caching implementation
 */

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { useCallback, useEffect } from 'react'
import { logger } from '@/lib/logger'

// ==============================================
// ADVANCED CACHE KEYS FACTORY
// ==============================================

export const cacheKeys = {
  // Hierarchical cache keys for precise invalidation
  all: ['acadex'] as const,
  
  // User-related caches
  users: () => [...cacheKeys.all, 'users'] as const,
  user: (id: string) => [...cacheKeys.users(), id] as const,
  userProfile: (id: string) => [...cacheKeys.user(id), 'profile'] as const,
  userProgress: (id: string) => [...cacheKeys.user(id), 'progress'] as const,
  userQuizzes: (id: string) => [...cacheKeys.user(id), 'quizzes'] as const,
  
  // Quiz-related caches  
  quizzes: () => [...cacheKeys.all, 'quizzes'] as const,
  quiz: (id: string) => [...cacheKeys.quizzes(), id] as const,
  quizQuestions: (id: string) => [...cacheKeys.quiz(id), 'questions'] as const,
  quizAttempts: (quizId: string, userId?: string) => 
    userId 
      ? [...cacheKeys.quiz(quizId), 'attempts', userId] as const
      : [...cacheKeys.quiz(quizId), 'attempts'] as const,
  
  // Course-related caches
  courses: () => [...cacheKeys.all, 'courses'] as const,
  course: (id: string) => [...cacheKeys.courses(), id] as const,
  courseQuizzes: (id: string) => [...cacheKeys.course(id), 'quizzes'] as const,
  
  // Admin caches with fine-grained control
  admin: () => [...cacheKeys.all, 'admin'] as const,
  adminDashboard: () => [...cacheKeys.admin(), 'dashboard'] as const,
  adminUsers: (page?: number) => 
    page ? [...cacheKeys.admin(), 'users', page] as const : [...cacheKeys.admin(), 'users'] as const,
  adminQuizzes: (page?: number, filters?: Record<string, any>) => 
    filters ? [...cacheKeys.admin(), 'quizzes', page, filters] as const : [...cacheKeys.admin(), 'quizzes', page] as const,
  adminCourses: (page?: number, filters?: Record<string, any>) => 
    filters ? [...cacheKeys.admin(), 'courses', page, filters] as const : [...cacheKeys.admin(), 'courses', page] as const,
    
  // Analytics caches
  analytics: () => [...cacheKeys.all, 'analytics'] as const,
  analyticsOverview: () => [...cacheKeys.analytics(), 'overview'] as const,
  analyticsUsers: (dateRange?: string) => [...cacheKeys.analytics(), 'users', dateRange] as const,
  analyticsQuizzes: (dateRange?: string) => [...cacheKeys.analytics(), 'quizzes', dateRange] as const,
}

// ==============================================
// CACHE TIMING STRATEGIES
// ==============================================

export const cacheTimings = {
  // Critical data - very fresh
  realtime: {
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
  },
  
  // Interactive data - moderately fresh  
  interactive: {
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  },
  
  // Background data - can be stale
  background: {
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  },
  
  // Static data - rarely changes
  static: {
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
  },
  
  // Long-term data - very rarely changes
  longterm: {
    staleTime: 2 * 60 * 60 * 1000, // 2 hours
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  }
}

// ==============================================
// SMART CACHE INVALIDATION HOOK
// ==============================================

export function useSmartCacheInvalidation() {
  const queryClient = useQueryClient()
  
  const invalidateQuizRelated = useCallback((quizId: string) => {
    // Invalidate all quiz-related caches in a cascading pattern
    queryClient.invalidateQueries({ queryKey: cacheKeys.quiz(quizId) })
    queryClient.invalidateQueries({ queryKey: cacheKeys.quizzes() })
    queryClient.invalidateQueries({ queryKey: cacheKeys.adminQuizzes() })
    queryClient.invalidateQueries({ queryKey: cacheKeys.analyticsQuizzes() })
    
    logger.info('Smart cache invalidation: Quiz data updated', { quizId })
  }, [queryClient])
  
  const invalidateUserRelated = useCallback((userId: string) => {
    // Invalidate user-specific caches
    queryClient.invalidateQueries({ queryKey: cacheKeys.user(userId) })
    queryClient.invalidateQueries({ queryKey: cacheKeys.adminUsers() })
    queryClient.invalidateQueries({ queryKey: cacheKeys.analyticsUsers() })
    
    logger.info('Smart cache invalidation: User data updated', { userId })
  }, [queryClient])
  
  const invalidateCourseRelated = useCallback((courseId: string) => {
    // Invalidate course-related caches
    queryClient.invalidateQueries({ queryKey: cacheKeys.course(courseId) })
    queryClient.invalidateQueries({ queryKey: cacheKeys.courses() })
    queryClient.invalidateQueries({ queryKey: cacheKeys.adminCourses() })
    
    logger.info('Smart cache invalidation: Course data updated', { courseId })
  }, [queryClient])
  
  const invalidateAnalytics = useCallback(() => {
    // Invalidate all analytics caches
    queryClient.invalidateQueries({ queryKey: cacheKeys.analytics() })
    queryClient.invalidateQueries({ queryKey: cacheKeys.adminDashboard() })
    
    logger.info('Smart cache invalidation: Analytics data updated')
  }, [queryClient])
  
  return {
    invalidateQuizRelated,
    invalidateUserRelated, 
    invalidateCourseRelated,
    invalidateAnalytics,
  }
}

// ==============================================
// BACKGROUND SYNC HOOK
// ==============================================

export function useBackgroundSync() {
  const queryClient = useQueryClient()
  
  useEffect(() => {
    // Set up background sync for critical data
    const syncCriticalData = () => {
      // Silently refetch important data in the background
      queryClient.refetchQueries({
        queryKey: cacheKeys.adminDashboard(),
        type: 'active', // Only refetch if component is mounted
      })
      
      queryClient.refetchQueries({
        queryKey: cacheKeys.analyticsOverview(),
        type: 'active',
      })
    }
    
    // Sync every 5 minutes when page is visible
    const interval = setInterval(() => {
      if (!document.hidden) {
        syncCriticalData()
      }
    }, 5 * 60 * 1000) // 5 minutes
    
    // Sync when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        syncCriticalData()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [queryClient])
}

// ==============================================
// PREFETCHING STRATEGIES
// ==============================================

export function usePrefetchingStrategy() {
  const queryClient = useQueryClient()
  
  const prefetchQuizQuestions = useCallback((quizId: string) => {
    queryClient.prefetchQuery({
      queryKey: cacheKeys.quizQuestions(quizId),
      queryFn: () => fetch(`/api/quizzes/${quizId}/questions`).then(r => r.json()),
      ...cacheTimings.interactive,
    })
  }, [queryClient])
  
  const prefetchUserProgress = useCallback((userId: string) => {
    queryClient.prefetchQuery({
      queryKey: cacheKeys.userProgress(userId),
      queryFn: () => fetch(`/api/users/${userId}/progress`).then(r => r.json()),
      ...cacheTimings.background,
    })
  }, [queryClient])
  
  const prefetchCourseQuizzes = useCallback((courseId: string) => {
    queryClient.prefetchQuery({
      queryKey: cacheKeys.courseQuizzes(courseId),
      queryFn: () => fetch(`/api/courses/${courseId}/quizzes`).then(r => r.json()),
      ...cacheTimings.background,
    })
  }, [queryClient])
  
  return {
    prefetchQuizQuestions,
    prefetchUserProgress,
    prefetchCourseQuizzes,
  }
}

// ==============================================
// OPTIMISTIC UPDATES HELPER
// ==============================================

export function useOptimisticUpdates() {
  const queryClient = useQueryClient()
  
  const updateQuizOptimistically = useCallback((quizId: string, updates: Partial<any>) => {
    queryClient.setQueryData(cacheKeys.quiz(quizId), (oldData: any) => {
      if (!oldData) return oldData
      return { ...oldData, ...updates }
    })
    
    // Also update in lists
    queryClient.setQueriesData({ queryKey: cacheKeys.quizzes() }, (oldData: any) => {
      if (!oldData?.quizzes) return oldData
      return {
        ...oldData,
        quizzes: oldData.quizzes.map((quiz: any) => 
          quiz.id === quizId ? { ...quiz, ...updates } : quiz
        )
      }
    })
  }, [queryClient])
  
  const updateUserOptimistically = useCallback((userId: string, updates: Partial<any>) => {
    queryClient.setQueryData(cacheKeys.user(userId), (oldData: any) => {
      if (!oldData) return oldData
      return { ...oldData, ...updates }
    })
  }, [queryClient])
  
  return {
    updateQuizOptimistically,
    updateUserOptimistically,
  }
}

// ==============================================
// CACHE HEALTH MONITORING
// ==============================================

export function useCacheHealthMonitoring() {
  const queryClient = useQueryClient()
  
  useEffect(() => {
    // Monitor cache health and clean up stale entries
    const monitorCache = () => {
      const cache = queryClient.getQueryCache()
      const queries = cache.getAll()
      
      const staleQueries = queries.filter(query => query.isStale())
      const errorQueries = queries.filter(query => query.state.error)
      
      logger.info('Cache health check', {
        totalQueries: queries.length,
        staleQueries: staleQueries.length,
        errorQueries: errorQueries.length,
        cacheSize: cache.getAll().length
      })
      
      // Clean up error queries older than 1 hour
      errorQueries.forEach(query => {
        const lastUpdated = query.state.dataUpdatedAt
        const oneHourAgo = Date.now() - 60 * 60 * 1000
        
        if (lastUpdated && lastUpdated < oneHourAgo) {
          queryClient.removeQueries({ queryKey: query.queryKey })
        }
      })
    }
    
    // Check cache health every 15 minutes
    const interval = setInterval(monitorCache, 15 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [queryClient])
}