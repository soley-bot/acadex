/**
 * Enhanced Search Performance Optimizations
 * Targeting: 110ms → <100ms (10% improvement)
 */

import { useMemo, useCallback } from 'react'
import { useDebounce } from '@/lib/performance'

// 1. REDUCE DEBOUNCE DELAY
// Current: 300ms → Target: 150ms
const OPTIMIZED_SEARCH_DELAY = 150

// 2. IMPLEMENT SEARCH RESULT CACHING
class SearchCache {
  private cache = new Map<string, { results: any[], timestamp: number }>()
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  get(query: string): any[] | null {
    const cached = this.cache.get(query.toLowerCase())
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.results
    }
    return null
  }

  set(query: string, results: any[]): void {
    this.cache.set(query.toLowerCase(), {
      results: [...results], // Clone to prevent mutations
      timestamp: Date.now()
    })
    
    // Cleanup old entries (prevent memory leaks)
    if (this.cache.size > 100) {
      const oldestKey = this.cache.keys().next().value
      if (oldestKey) {
        this.cache.delete(oldestKey)
      }
    }
  }

  clear(): void {
    this.cache.clear()
  }
}

const searchCache = new SearchCache()

// 3. OPTIMIZED SEARCH HOOK
export function useOptimizedSearch<T>(
  items: T[],
  searchTerm: string,
  searchKeys: (keyof T)[],
  options: {
    debounceMs?: number
    enableCache?: boolean
    maxResults?: number
  } = {}
) {
  const {
    debounceMs = OPTIMIZED_SEARCH_DELAY,
    enableCache = true,
    maxResults = 20
  } = options

  const debouncedSearchTerm = useDebounce(searchTerm, debounceMs)

  const filteredItems = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return []

    // Check cache first
    if (enableCache) {
      const cacheKey = `${debouncedSearchTerm}:${searchKeys.join(',')}`
      const cached = searchCache.get(cacheKey)
      if (cached) return cached
    }

    const startTime = performance.now()
    const lowercaseSearchTerm = debouncedSearchTerm.toLowerCase()

    // Optimized search with scoring
    const scored = items
      .map(item => {
        let score = 0
        let matchFound = false

        searchKeys.forEach((key, index) => {
          const value = String(item[key]).toLowerCase()
          if (value.includes(lowercaseSearchTerm)) {
            matchFound = true
            // Higher score for exact matches and title matches
            score += key === 'title' ? 10 : 5
            // Bonus for exact word match
            if (value.split(' ').some(word => word.startsWith(lowercaseSearchTerm))) {
              score += 3
            }
          }
        })

        return matchFound ? { item, score } : null
      })
      .filter(Boolean)
      .sort((a, b) => (b?.score || 0) - (a?.score || 0))
      .slice(0, maxResults)
      .map(scored => scored!.item)

    const endTime = performance.now()
    console.log(`Search took ${(endTime - startTime).toFixed(2)}ms`)

    // Cache results
    if (enableCache) {
      const cacheKey = `${debouncedSearchTerm}:${searchKeys.join(',')}`
      searchCache.set(cacheKey, scored)
    }

    return scored
  }, [items, debouncedSearchTerm, searchKeys, enableCache, maxResults])

  return filteredItems
}

// 4. PRE-COMPUTED SEARCH INDEXES
export class SearchIndexBuilder<T> {
  private index = new Map<string, T[]>()

  constructor(items: T[], searchKeys: (keyof T)[]) {
    this.buildIndex(items, searchKeys)
  }

  private buildIndex(items: T[], searchKeys: (keyof T)[]): void {
    items.forEach(item => {
      searchKeys.forEach(key => {
        const value = String(item[key]).toLowerCase()
        const words = value.split(/\s+/)
        
        words.forEach(word => {
          // Index by word prefixes for fast prefix matching
          for (let i = 1; i <= word.length; i++) {
            const prefix = word.substring(0, i)
            if (!this.index.has(prefix)) {
              this.index.set(prefix, [])
            }
            this.index.get(prefix)!.push(item)
          }
        })
      })
    })
  }

  search(query: string, limit: number = 20): T[] {
    const results = new Set<T>()
    const queryWords = query.toLowerCase().split(/\s+/)
    
    queryWords.forEach(word => {
      const matches = this.index.get(word) || []
      matches.slice(0, limit).forEach(item => results.add(item))
    })
    
    return Array.from(results).slice(0, limit)
  }
}

export { searchCache }