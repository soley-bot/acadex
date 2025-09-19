/**
 * Persistent React Query Storage
 * Week 2 Day 3: IndexedDB persistence for React Query cache
 */

import { indexedDB, CacheManager, STORES } from './indexeddb'
import { logger } from './logger'

// React Query cache key
const REACT_QUERY_CACHE_KEY = 'react-query-cache'

// Simple persister interface
interface PersistedClient {
  clientState: {
    queries: any[]
    mutations: any[]
  }
}

interface Persister {
  persistClient: (client: PersistedClient) => Promise<void>
  restoreClient: () => Promise<PersistedClient | undefined>
  removeClient: () => Promise<void>
}

// IndexedDB persister for React Query
export function createIndexedDBPersister(): Persister {
  return {
    persistClient: async (client: PersistedClient) => {
      try {
        await CacheManager.setCache(
          REACT_QUERY_CACHE_KEY,
          client,
          24 * 60 * 60 * 1000, // 24 hours
          { 
            type: 'react-query-cache',
            version: '1.0',
            persistedAt: Date.now()
          }
        )
        
        logger.info('React Query cache persisted to IndexedDB', {
          clientDataUpdateCount: client.clientState.queries.length,
          mutations: client.clientState.mutations.length
        })
      } catch (error) {
        logger.error('Failed to persist React Query cache', { error })
        throw error
      }
    },
    
    restoreClient: async (): Promise<PersistedClient | undefined> => {
      try {
        const client = await CacheManager.getCache<PersistedClient>(REACT_QUERY_CACHE_KEY)
        
        if (client) {
          logger.info('React Query cache restored from IndexedDB', {
            queries: client.clientState.queries.length,
            mutations: client.clientState.mutations.length
          })
        } else {
          logger.info('No React Query cache found in IndexedDB')
        }
        
        return client || undefined
      } catch (error) {
        logger.error('Failed to restore React Query cache', { error })
        return undefined
      }
    },
    
    removeClient: async () => {
      try {
        await indexedDB.delete(STORES.QUERY_CACHE, REACT_QUERY_CACHE_KEY)
        logger.info('React Query cache cleared from IndexedDB')
      } catch (error) {
        logger.error('Failed to clear React Query cache', { error })
        throw error
      }
    }
  }
}

// Cache synchronization utilities
export class CacheSynchronizer {
  private syncInterval: NodeJS.Timeout | null = null
  private isOnline = navigator.onLine
  
  constructor() {
    this.setupEventListeners()
  }

  private setupEventListeners() {
    window.addEventListener('online', this.handleOnline.bind(this))
    window.addEventListener('offline', this.handleOffline.bind(this))
    
    // Sync periodically when online
    this.startPeriodicSync()
  }

  private handleOnline() {
    this.isOnline = true
    logger.info('Device came online, starting cache sync')
    this.syncPendingChanges()
    this.startPeriodicSync()
  }

  private handleOffline() {
    this.isOnline = false
    logger.info('Device went offline, stopping cache sync')
    this.stopPeriodicSync()
  }

  private startPeriodicSync() {
    if (this.syncInterval) clearInterval(this.syncInterval)
    
    this.syncInterval = setInterval(() => {
      if (this.isOnline) {
        this.cleanExpiredCache()
      }
    }, 5 * 60 * 1000) // Every 5 minutes
  }

  private stopPeriodicSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
  }

  // Sync pending changes when coming back online
  private async syncPendingChanges() {
    try {
      // Get all pending progress updates
      const allProgress = await indexedDB.getAll(STORES.USER_PROGRESS)
      const pendingProgress = allProgress.filter((progress: any) => 
        progress.pending_sync || progress.updated_at > (progress.synced_at || 0)
      )

      logger.info('Syncing pending progress updates', { 
        count: pendingProgress.length 
      })

      // Sync each pending progress
      for (const progress of pendingProgress) {
        try {
          await this.syncProgressToServer(progress)
        } catch (error) {
          logger.error('Failed to sync progress', { 
            error, 
            progressId: (progress as any).id 
          })
        }
      }

      // Get all pending quiz attempts
      const allAttempts = await indexedDB.getAll(STORES.QUIZ_ATTEMPTS)
      const pendingAttempts = allAttempts.filter((attempt: any) => 
        attempt.pending_sync || attempt.submitted_at > (attempt.synced_at || 0)
      )

      logger.info('Syncing pending quiz attempts', { 
        count: pendingAttempts.length 
      })

      // Sync each pending attempt
      for (const attempt of pendingAttempts) {
        try {
          await this.syncAttemptToServer(attempt)
        } catch (error) {
          logger.error('Failed to sync attempt', { 
            error, 
            attemptId: (attempt as any).id 
          })
        }
      }
      
    } catch (error) {
      logger.error('Failed to sync pending changes', { error })
    }
  }

  private async syncProgressToServer(progress: any): Promise<void> {
    const response = await fetch('/api/quiz-progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quizId: progress.quiz_id,
        userId: progress.user_id,
        answers: progress.answers,
        currentQuestion: progress.current_question
      })
    })

    if (!response.ok) {
      throw new Error(`Sync failed: ${response.status}`)
    }

    // Mark as synced
    await indexedDB.put(STORES.USER_PROGRESS, {
      ...progress,
      synced_at: Date.now(),
      pending_sync: false
    })
  }

  private async syncAttemptToServer(attempt: any): Promise<void> {
    const response = await fetch('/api/quiz-submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quizId: attempt.quiz_id,
        userId: attempt.user_id,
        answers: attempt.answers,
        timeSpent: attempt.time_spent
      })
    })

    if (!response.ok) {
      throw new Error(`Sync failed: ${response.status}`)
    }

    // Mark as synced
    await indexedDB.put(STORES.QUIZ_ATTEMPTS, {
      ...attempt,
      synced_at: Date.now(),
      pending_sync: false
    })
  }

  private async cleanExpiredCache() {
    try {
      const deletedCount = await CacheManager.cleanExpired()
      if (deletedCount > 0) {
        logger.info('Cleaned expired cache entries', { count: deletedCount })
      }
    } catch (error) {
      logger.error('Failed to clean expired cache', { error })
    }
  }

  // Manual sync trigger
  async forcSync(): Promise<void> {
    if (!this.isOnline) {
      throw new Error('Cannot sync while offline')
    }
    
    await this.syncPendingChanges()
    await this.cleanExpiredCache()
  }

  // Get sync status
  async getSyncStatus(): Promise<{
    isOnline: boolean
    pendingProgressCount: number
    pendingAttemptCount: number
    cacheSize: number
  }> {
    const allProgress = await indexedDB.getAll(STORES.USER_PROGRESS)
    const allAttempts = await indexedDB.getAll(STORES.QUIZ_ATTEMPTS)
    const storageInfo = await indexedDB.getStorageInfo()

    const pendingProgressCount = allProgress.filter((p: any) => 
      p.pending_sync || p.updated_at > (p.synced_at || 0)
    ).length

    const pendingAttemptCount = allAttempts.filter((a: any) => 
      a.pending_sync || a.submitted_at > (a.synced_at || 0)
    ).length

    return {
      isOnline: this.isOnline,
      pendingProgressCount,
      pendingAttemptCount,
      cacheSize: storageInfo.usage
    }
  }

  // Cleanup
  destroy() {
    this.stopPeriodicSync()
    window.removeEventListener('online', this.handleOnline.bind(this))
    window.removeEventListener('offline', this.handleOffline.bind(this))
  }
}

// Singleton cache synchronizer
export const cacheSynchronizer = new CacheSynchronizer()

// Export CacheManager from indexeddb
export { CacheManager } from './indexeddb'

// Offline storage utilities
export class OfflineStorage {
  // Store quiz for offline access
  static async storeQuizForOffline(quizId: string): Promise<void> {
    try {
      // Fetch quiz data
      const quizResponse = await fetch(`/api/quizzes/${quizId}`)
      if (!quizResponse.ok) throw new Error('Failed to fetch quiz')
      
      const quiz = await quizResponse.json()
      await CacheManager.cacheQuiz(quiz)

      // Fetch and store questions
      const questionsResponse = await fetch(`/api/quizzes/${quizId}/questions`)
      if (!questionsResponse.ok) throw new Error('Failed to fetch questions')
      
      const questions = await questionsResponse.json()
      await CacheManager.cacheQuizQuestions(quizId, questions)

      logger.info('Quiz stored for offline access', { quizId })
    } catch (error) {
      logger.error('Failed to store quiz for offline', { error, quizId })
      throw error
    }
  }

  // Check if quiz is available offline
  static async isQuizAvailableOffline(quizId: string): Promise<boolean> {
    try {
      const quiz = await CacheManager.getCachedQuiz(quizId)
      const questions = await CacheManager.getCachedQuizQuestions(quizId)
      
      return !!(quiz && questions.length > 0)
    } catch (error) {
      logger.error('Failed to check offline availability', { error, quizId })
      return false
    }
  }

  // Get offline quiz data
  static async getOfflineQuiz(quizId: string): Promise<{
    quiz: any
    questions: any[]
  } | null> {
    try {
      const [quiz, questions] = await Promise.all([
        CacheManager.getCachedQuiz(quizId),
        CacheManager.getCachedQuizQuestions(quizId)
      ])

      if (!quiz || !questions.length) return null

      return { quiz, questions }
    } catch (error) {
      logger.error('Failed to get offline quiz', { error, quizId })
      return null
    }
  }

  // Save progress offline
  static async saveProgressOffline(
    userId: string, 
    quizId: string, 
    progress: any
  ): Promise<void> {
    try {
      await CacheManager.cacheUserProgress(userId, quizId, {
        ...progress,
        pending_sync: true,
        offline_saved: true
      })

      logger.info('Progress saved offline', { userId, quizId })
    } catch (error) {
      logger.error('Failed to save progress offline', { error, userId, quizId })
      throw error
    }
  }

  // Submit quiz attempt offline (queue for sync)
  static async submitQuizOffline(
    userId: string,
    quizId: string,
    answers: Record<string, any>,
    timeSpent: number
  ): Promise<string> {
    try {
      const attemptId = `offline-${Date.now()}-${Math.random().toString(36).substring(2)}`
      
      const attempt = {
        id: attemptId,
        user_id: userId,
        quiz_id: quizId,
        answers,
        time_spent: timeSpent,
        submitted_at: Date.now(),
        pending_sync: true,
        offline_submission: true,
        score: 0 // Will be calculated on server sync
      }

      await indexedDB.put(STORES.QUIZ_ATTEMPTS, attempt)
      
      logger.info('Quiz attempt queued for offline sync', { 
        attemptId, 
        userId, 
        quizId 
      })

      return attemptId
    } catch (error) {
      logger.error('Failed to submit quiz offline', { error, userId, quizId })
      throw error
    }
  }

  // Get cached storage statistics
  static async getStorageStats(): Promise<{
    totalQuizzes: number
    totalQuestions: number
    totalProgress: number
    totalAttempts: number
    storageUsed: number
    storageQuota: number
  }> {
    const storageInfo = await indexedDB.getStorageInfo()
    
    return {
      totalQuizzes: storageInfo.stores.quizzes || 0,
      totalQuestions: storageInfo.stores.quiz_questions || 0,
      totalProgress: storageInfo.stores.user_progress || 0,
      totalAttempts: storageInfo.stores.quiz_attempts || 0,
      storageUsed: storageInfo.usage,
      storageQuota: storageInfo.quota
    }
  }
}