/**
 * IndexedDB Storage System
 * Week 2 Day 3: Client-side caching with persistent storage
 */

// Database schema configuration
const DB_NAME = 'AcadexCache'
const DB_VERSION = 1

// Object store names
export const STORES = {
  QUIZZES: 'quizzes',
  QUIZ_QUESTIONS: 'quiz_questions',
  USER_PROGRESS: 'user_progress',
  QUIZ_ATTEMPTS: 'quiz_attempts',
  COURSES: 'courses',
  QUERY_CACHE: 'query_cache',
  APP_SETTINGS: 'app_settings'
} as const

export type StoreName = typeof STORES[keyof typeof STORES]

// Cache entry interface
interface CacheEntry<T = any> {
  key: string
  data: T
  timestamp: number
  expiresAt: number
  version: string
  metadata?: Record<string, any>
}

// IndexedDB wrapper class
class IndexedDBManager {
  private db: IDBDatabase | null = null
  private initPromise: Promise<IDBDatabase> | null = null

  constructor() {
    this.init()
  }

  // Initialize database connection
  private async init(): Promise<IDBDatabase> {
    if (this.db) return this.db
    
    if (this.initPromise) return this.initPromise

    this.initPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB not supported'))
        return
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve(this.db)
      }
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        
        // Create object stores
        this.createObjectStores(db)
      }
    })

    return this.initPromise
  }

  // Create all object stores during upgrade
  private createObjectStores(db: IDBDatabase) {
    // Quizzes store
    if (!db.objectStoreNames.contains(STORES.QUIZZES)) {
      const quizStore = db.createObjectStore(STORES.QUIZZES, { keyPath: 'id' })
      quizStore.createIndex('category', 'category', { unique: false })
      quizStore.createIndex('updated_at', 'updated_at', { unique: false })
    }

    // Quiz questions store
    if (!db.objectStoreNames.contains(STORES.QUIZ_QUESTIONS)) {
      const questionStore = db.createObjectStore(STORES.QUIZ_QUESTIONS, { keyPath: 'id' })
      questionStore.createIndex('quiz_id', 'quiz_id', { unique: false })
      questionStore.createIndex('question_order', 'question_order', { unique: false })
    }

    // User progress store
    if (!db.objectStoreNames.contains(STORES.USER_PROGRESS)) {
      const progressStore = db.createObjectStore(STORES.USER_PROGRESS, { keyPath: 'id' })
      progressStore.createIndex('user_id', 'user_id', { unique: false })
      progressStore.createIndex('quiz_id', 'quiz_id', { unique: false })
      progressStore.createIndex('updated_at', 'updated_at', { unique: false })
    }

    // Quiz attempts store
    if (!db.objectStoreNames.contains(STORES.QUIZ_ATTEMPTS)) {
      const attemptStore = db.createObjectStore(STORES.QUIZ_ATTEMPTS, { keyPath: 'id' })
      attemptStore.createIndex('user_id', 'user_id', { unique: false })
      attemptStore.createIndex('quiz_id', 'quiz_id', { unique: false })
      attemptStore.createIndex('submitted_at', 'submitted_at', { unique: false })
    }

    // Courses store
    if (!db.objectStoreNames.contains(STORES.COURSES)) {
      const courseStore = db.createObjectStore(STORES.COURSES, { keyPath: 'id' })
      courseStore.createIndex('category', 'category', { unique: false })
      courseStore.createIndex('updated_at', 'updated_at', { unique: false })
    }

    // Query cache store (for React Query persistence)
    if (!db.objectStoreNames.contains(STORES.QUERY_CACHE)) {
      const cacheStore = db.createObjectStore(STORES.QUERY_CACHE, { keyPath: 'key' })
      cacheStore.createIndex('expiresAt', 'expiresAt', { unique: false })
      cacheStore.createIndex('timestamp', 'timestamp', { unique: false })
    }

    // App settings store
    if (!db.objectStoreNames.contains(STORES.APP_SETTINGS)) {
      db.createObjectStore(STORES.APP_SETTINGS, { keyPath: 'key' })
    }
  }

  // Get database instance
  async getDB(): Promise<IDBDatabase> {
    return this.init()
  }

  // Generic get operation
  async get<T>(storeName: StoreName, key: string): Promise<T | null> {
    const db = await this.getDB()
    const transaction = db.transaction([storeName], 'readonly')
    const store = transaction.objectStore(storeName)
    
    return new Promise((resolve, reject) => {
      const request = store.get(key)
      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(request.error)
    })
  }

  // Generic put operation
  async put<T>(storeName: StoreName, data: T): Promise<void> {
    const db = await this.getDB()
    const transaction = db.transaction([storeName], 'readwrite')
    const store = transaction.objectStore(storeName)
    
    return new Promise((resolve, reject) => {
      const request = store.put(data)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  // Generic delete operation
  async delete(storeName: StoreName, key: string): Promise<void> {
    const db = await this.getDB()
    const transaction = db.transaction([storeName], 'readwrite')
    const store = transaction.objectStore(storeName)
    
    return new Promise((resolve, reject) => {
      const request = store.delete(key)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  // Get all items from store
  async getAll<T>(storeName: StoreName): Promise<T[]> {
    const db = await this.getDB()
    const transaction = db.transaction([storeName], 'readonly')
    const store = transaction.objectStore(storeName)
    
    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    })
  }

  // Query by index
  async getByIndex<T>(
    storeName: StoreName, 
    indexName: string, 
    value: any
  ): Promise<T[]> {
    const db = await this.getDB()
    const transaction = db.transaction([storeName], 'readonly')
    const store = transaction.objectStore(storeName)
    const index = store.index(indexName)
    
    return new Promise((resolve, reject) => {
      const request = index.getAll(value)
      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    })
  }

  // Clear store
  async clear(storeName: StoreName): Promise<void> {
    const db = await this.getDB()
    const transaction = db.transaction([storeName], 'readwrite')
    const store = transaction.objectStore(storeName)
    
    return new Promise((resolve, reject) => {
      const request = store.clear()
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  // Clean expired cache entries
  async cleanExpiredCache(): Promise<number> {
    const db = await this.getDB()
    const transaction = db.transaction([STORES.QUERY_CACHE], 'readwrite')
    const store = transaction.objectStore(STORES.QUERY_CACHE)
    const index = store.index('expiresAt')
    
    const now = Date.now()
    let deletedCount = 0
    
    return new Promise((resolve, reject) => {
      const request = index.openCursor(IDBKeyRange.upperBound(now))
      
      request.onsuccess = () => {
        const cursor = request.result
        if (cursor) {
          cursor.delete()
          deletedCount++
          cursor.continue()
        } else {
          resolve(deletedCount)
        }
      }
      
      request.onerror = () => reject(request.error)
    })
  }

  // Get storage usage information
  async getStorageInfo(): Promise<{
    usage: number
    quota: number
    stores: Record<StoreName, number>
  }> {
    const stores: Record<string, number> = {}
    
    for (const store of Object.values(STORES)) {
      const items = await this.getAll(store)
      stores[store] = items.length
    }

    let usage = 0
    let quota = 0

    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate()
      usage = estimate.usage || 0
      quota = estimate.quota || 0
    }

    return {
      usage,
      quota,
      stores: stores as Record<StoreName, number>
    }
  }
}

// Singleton instance
export const indexedDB = new IndexedDBManager()

// Cache management utilities
export class CacheManager {
  private static generateKey(prefix: string, id: string): string {
    return `${prefix}:${id}`
  }

  // Store cache entry with expiration
  static async setCache<T>(
    key: string, 
    data: T, 
    expirationMs: number = 5 * 60 * 1000, // 5 minutes default
    metadata?: Record<string, any>
  ): Promise<void> {
    const entry: CacheEntry<T> = {
      key,
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + expirationMs,
      version: '1.0',
      metadata
    }

    await indexedDB.put(STORES.QUERY_CACHE, entry)
  }

  // Get cache entry if not expired
  static async getCache<T>(key: string): Promise<T | null> {
    const entry = await indexedDB.get<CacheEntry<T>>(STORES.QUERY_CACHE, key)
    
    if (!entry) return null
    
    // Check if expired
    if (entry.expiresAt < Date.now()) {
      await indexedDB.delete(STORES.QUERY_CACHE, key)
      return null
    }
    
    return entry.data
  }

  // Store quiz data
  static async cacheQuiz(quiz: any): Promise<void> {
    await indexedDB.put(STORES.QUIZZES, {
      ...quiz,
      cached_at: Date.now()
    })
  }

  // Get cached quiz
  static async getCachedQuiz(quizId: string): Promise<any | null> {
    return indexedDB.get(STORES.QUIZZES, quizId)
  }

  // Cache quiz questions
  static async cacheQuizQuestions(quizId: string, questions: any[]): Promise<void> {
    const questionsWithCache = questions.map(q => ({
      ...q,
      quiz_id: quizId,
      cached_at: Date.now()
    }))

    for (const question of questionsWithCache) {
      await indexedDB.put(STORES.QUIZ_QUESTIONS, question)
    }
  }

  // Get cached quiz questions
  static async getCachedQuizQuestions(quizId: string): Promise<any[]> {
    return indexedDB.getByIndex(STORES.QUIZ_QUESTIONS, 'quiz_id', quizId)
  }

  // Cache user progress
  static async cacheUserProgress(userId: string, quizId: string, progress: any): Promise<void> {
    const progressEntry = {
      id: `${userId}:${quizId}`,
      user_id: userId,
      quiz_id: quizId,
      ...progress,
      cached_at: Date.now(),
      updated_at: Date.now()
    }

    await indexedDB.put(STORES.USER_PROGRESS, progressEntry)
  }

  // Get cached user progress
  static async getCachedUserProgress(userId: string, quizId: string): Promise<any | null> {
    return indexedDB.get(STORES.USER_PROGRESS, `${userId}:${quizId}`)
  }

  // Clear all caches
  static async clearAllCaches(): Promise<void> {
    await Promise.all([
      indexedDB.clear(STORES.QUIZZES),
      indexedDB.clear(STORES.QUIZ_QUESTIONS),
      indexedDB.clear(STORES.USER_PROGRESS),
      indexedDB.clear(STORES.QUIZ_ATTEMPTS),
      indexedDB.clear(STORES.COURSES),
      indexedDB.clear(STORES.QUERY_CACHE)
    ])
  }

  // Clean expired entries
  static async cleanExpired(): Promise<number> {
    return indexedDB.cleanExpiredCache()
  }
}