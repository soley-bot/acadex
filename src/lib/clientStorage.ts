/**
 * Client-Side Storage & Caching System
 * Handles localStorage, sessionStorage, cookies, and auto-save functionality
 */

// Types for storage
export interface QuizProgress {
  quizId: string
  userId: string
  attemptId: string
  answers: Record<string, string | number | boolean | string[] | number[]>
  currentQuestionIndex: number
  startTime: string
  timeLeft: number
  lastSaved: string
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: 'en' | 'km'
  autoSave: boolean
  autoSaveInterval: number // seconds
  fontSize: 'small' | 'medium' | 'large'
  highContrast: boolean
}

export interface CachedQuizData {
  quizId: string
  quiz: {
    id: string
    title: string
    description?: string
    category?: string
    difficulty?: string
    time_limit?: number
  }
  questions: Array<{
    id: string
    question: string
    question_type: string
    options: string[] | Array<{left: string; right: string}>
    correct_answer?: string | number | number[]
    explanation?: string
    points?: number
  }>
  cachedAt: string
  expiresAt: string
}

class ClientStorage {
  private static instance: ClientStorage
  private autoSaveTimers: Map<string, NodeJS.Timeout> = new Map()

  static getInstance(): ClientStorage {
    if (!ClientStorage.instance) {
      ClientStorage.instance = new ClientStorage()
    }
    return ClientStorage.instance
  }

  // ========================================
  // QUIZ PROGRESS AUTO-SAVE
  // ========================================

  saveQuizProgress(progress: QuizProgress): void {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        return
      }
      
      const key = `quiz_progress_${progress.quizId}_${progress.userId}`
      const progressData = {
        ...progress,
        lastSaved: new Date().toISOString()
      }
      localStorage.setItem(key, JSON.stringify(progressData))
      console.log('Quiz progress saved:', key)
    } catch (error) {
      console.error('Failed to save quiz progress:', error)
    }
  }

  getQuizProgress(quizId: string, userId: string): QuizProgress | null {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        return null
      }
      
      const key = `quiz_progress_${quizId}_${userId}`
      const stored = localStorage.getItem(key)
      if (stored) {
        const progress = JSON.parse(stored) as QuizProgress
        // Check if progress is recent (within 24 hours)
        const lastSaved = new Date(progress.lastSaved)
        const now = new Date()
        const hoursSinceSave = (now.getTime() - lastSaved.getTime()) / (1000 * 60 * 60)
        
        if (hoursSinceSave < 24) {
          return progress
        } else {
          // Remove expired progress
          this.clearQuizProgress(quizId, userId)
        }
      }
    } catch (error) {
      console.error('Failed to get quiz progress:', error)
    }
    return null
  }

  clearQuizProgress(quizId: string, userId: string): void {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        return
      }
      
      const key = `quiz_progress_${quizId}_${userId}`
      localStorage.removeItem(key)
      
      // Clear any active auto-save timer
      const timerId = this.autoSaveTimers.get(key)
      if (timerId) {
        clearInterval(timerId)
        this.autoSaveTimers.delete(key)
      }
    } catch (error) {
      console.error('Failed to clear quiz progress:', error)
    }
  }

  startAutoSave(
    quizId: string, 
    userId: string, 
    getProgressData: () => Partial<QuizProgress>,
    intervalSeconds: number = 30
  ): void {
    const key = `quiz_progress_${quizId}_${userId}`
    
    // Clear existing timer if any
    const existingTimer = this.autoSaveTimers.get(key)
    if (existingTimer) {
      clearInterval(existingTimer)
    }

    // Start new timer
    const timer = setInterval(() => {
      const progressData = getProgressData()
      if (progressData.answers && Object.keys(progressData.answers).length > 0) {
        this.saveQuizProgress({
          quizId,
          userId,
          attemptId: progressData.attemptId || '',
          answers: progressData.answers,
          currentQuestionIndex: progressData.currentQuestionIndex || 0,
          startTime: progressData.startTime || new Date().toISOString(),
          timeLeft: progressData.timeLeft || 0,
          lastSaved: new Date().toISOString()
        })
      }
    }, intervalSeconds * 1000)

    this.autoSaveTimers.set(key, timer)
    console.log(`Auto-save started for quiz ${quizId} (every ${intervalSeconds}s)`)
  }

  stopAutoSave(quizId: string, userId: string): void {
    const key = `quiz_progress_${quizId}_${userId}`
    const timer = this.autoSaveTimers.get(key)
    if (timer) {
      clearInterval(timer)
      this.autoSaveTimers.delete(key)
      console.log(`Auto-save stopped for quiz ${quizId}`)
    }
  }

  // ========================================
  // USER PREFERENCES
  // ========================================

  saveUserPreferences(preferences: Partial<UserPreferences>): void {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        return
      }
      
      const existing = this.getUserPreferences()
      const updated = { ...existing, ...preferences }
      localStorage.setItem('user_preferences', JSON.stringify(updated))
      console.log('User preferences saved')
    } catch (error) {
      console.error('Failed to save user preferences:', error)
    }
  }

  getUserPreferences(): UserPreferences {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        return this.getDefaultPreferences()
      }
      
      const stored = localStorage.getItem('user_preferences')
      if (stored) {
        return { ...this.getDefaultPreferences(), ...JSON.parse(stored) }
      }
    } catch (error) {
      console.error('Failed to get user preferences:', error)
    }
    return this.getDefaultPreferences()
  }

  private getDefaultPreferences(): UserPreferences {
    return {
      theme: 'system',
      language: 'en',
      autoSave: true,
      autoSaveInterval: 30,
      fontSize: 'medium',
      highContrast: false
    }
  }

  // ========================================
  // QUIZ DATA CACHING
  // ========================================

  cacheQuizData(
    quizId: string, 
    quiz: CachedQuizData['quiz'], 
    questions: CachedQuizData['questions'], 
    ttlMinutes: number = 30
  ): void {
    try {
      const cachedData: CachedQuizData = {
        quizId,
        quiz,
        questions,
        cachedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + ttlMinutes * 60 * 1000).toISOString()
      }
      sessionStorage.setItem(`quiz_cache_${quizId}`, JSON.stringify(cachedData))
      console.log(`Quiz data cached for ${quizId} (expires in ${ttlMinutes} minutes)`)
    } catch (error) {
      console.error('Failed to cache quiz data:', error)
    }
  }

  getCachedQuizData(quizId: string): Pick<CachedQuizData, 'quiz' | 'questions'> | null {
    try {
      const cached = sessionStorage.getItem(`quiz_cache_${quizId}`)
      if (cached) {
        const data = JSON.parse(cached) as CachedQuizData
        const now = new Date()
        const expires = new Date(data.expiresAt)
        
        if (now < expires) {
          console.log(`Using cached quiz data for ${quizId}`)
          return { quiz: data.quiz, questions: data.questions }
        } else {
          // Remove expired cache
          sessionStorage.removeItem(`quiz_cache_${quizId}`)
        }
      }
    } catch (error) {
      console.error('Failed to get cached quiz data:', error)
    }
    return null
  }

  // ========================================
  // OFFLINE DETECTION & NETWORK STATE
  // ========================================

  isOnline(): boolean {
    return navigator.onLine
  }

  onNetworkChange(callback: (online: boolean) => void): () => void {
    const handleOnline = () => callback(true)
    const handleOffline = () => callback(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Return cleanup function
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }

  // ========================================
  // COOKIE UTILITIES
  // ========================================

  setCookie(name: string, value: string, days: number = 30): void {
    const expires = new Date()
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000))
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`
  }

  getCookie(name: string): string | null {
    const nameEQ = name + "="
    const ca = document.cookie.split(';')
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i]
      if (!c) continue
      while (c.charAt(0) === ' ') c = c.substring(1, c.length)
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
    }
    return null
  }

  deleteCookie(name: string): void {
    document.cookie = `${name}=; Max-Age=-99999999; path=/`
  }

  // ========================================
  // CLEANUP & MAINTENANCE
  // ========================================

  cleanup(): void {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      return
    }
    
    // Clear expired quiz progress
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith('quiz_progress_')) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}')
          if (data.lastSaved) {
            const saved = new Date(data.lastSaved)
            const now = new Date()
            const hoursSinceSave = (now.getTime() - saved.getTime()) / (1000 * 60 * 60)
            
            if (hoursSinceSave > 24) {
              localStorage.removeItem(key)
              console.log(`Cleaned up expired progress: ${key}`)
            }
          }
        } catch (error) {
          console.error(`Error cleaning up ${key}:`, error)
        }
      }
    })

    // Clear expired session cache
    const sessionKeys = Object.keys(sessionStorage)
    sessionKeys.forEach(key => {
      if (key.startsWith('quiz_cache_')) {
        try {
          const data = JSON.parse(sessionStorage.getItem(key) || '{}')
          if (data.expiresAt) {
            const expires = new Date(data.expiresAt)
            const now = new Date()
            
            if (now > expires) {
              sessionStorage.removeItem(key)
              console.log(`Cleaned up expired cache: ${key}`)
            }
          }
        } catch (error) {
          console.error(`Error cleaning up ${key}:`, error)
        }
      }
    })
  }
}

export const clientStorage = ClientStorage.getInstance()

// Auto-cleanup on page load
if (typeof window !== 'undefined') {
  clientStorage.cleanup()
}