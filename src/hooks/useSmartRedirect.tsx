/**
 * ADVANCED REDIRECT MANAGER
 * Intelligent redirects with state preservation and performance optimization
 */

'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useCallback, useRef, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { logger } from '@/lib/logger'

interface RedirectOptions {
  preserveState?: boolean
  skipAnimation?: boolean
  replace?: boolean
  timeout?: number
  onRedirect?: (path: string) => void
  onError?: (error: Error) => void
}

interface RedirectRule {
  from: string | RegExp
  to: string | ((pathname: string, searchParams: URLSearchParams) => string)
  condition?: (user: any) => boolean
  priority?: number
}

class RedirectManager {
  private static instance: RedirectManager
  private rules: RedirectRule[] = []
  private cache = new Map<string, string>()
  private pendingRedirects = new Set<string>()

  static getInstance(): RedirectManager {
    if (!RedirectManager.instance) {
      RedirectManager.instance = new RedirectManager()
    }
    return RedirectManager.instance
  }

  // Add redirect rule
  addRule(rule: RedirectRule) {
    this.rules.push(rule)
    this.rules.sort((a, b) => (b.priority || 0) - (a.priority || 0))
  }

  // Remove redirect rule
  removeRule(from: string | RegExp) {
    this.rules = this.rules.filter(rule => rule.from !== from)
  }

  // Find matching redirect
  findRedirect(pathname: string, searchParams: URLSearchParams, user: any): string | null {
    const cacheKey = `${pathname}:${searchParams.toString()}:${user?.id || 'anonymous'}`
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey) || null
    }

    for (const rule of this.rules) {
      let matches = false

      if (typeof rule.from === 'string') {
        matches = pathname === rule.from || pathname.startsWith(rule.from)
      } else {
        matches = rule.from.test(pathname)
      }

      if (matches && (!rule.condition || rule.condition(user))) {
        const destination = typeof rule.to === 'function' 
          ? rule.to(pathname, searchParams)
          : rule.to

        // Cache the result
        this.cache.set(cacheKey, destination)
        
        // Cleanup cache if it gets too large
        if (this.cache.size > 100) {
          const entries = Array.from(this.cache.entries())
          entries.slice(0, 50).forEach(([key]) => this.cache.delete(key))
        }

        return destination
      }
    }

    this.cache.set(cacheKey, '')
    return null
  }

  // Check if redirect is in progress
  isPending(path: string): boolean {
    return this.pendingRedirects.has(path)
  }

  // Mark redirect as pending
  setPending(path: string) {
    this.pendingRedirects.add(path)
    // Auto cleanup after timeout
    setTimeout(() => this.pendingRedirects.delete(path), 5000)
  }

  // Clear redirect cache
  clearCache() {
    this.cache.clear()
  }
}

// Default redirect rules
const defaultRules: RedirectRule[] = [
  // Auth redirects
  {
    from: '/auth/login',
    to: (pathname, searchParams) => {
      const redirectTo = searchParams.get('redirectTo')
      return redirectTo || '/dashboard'
    },
    condition: (user) => !!user,
    priority: 100
  },
  {
    from: '/auth/signup',
    to: '/dashboard',
    condition: (user) => !!user,
    priority: 100
  },
  
  // Admin redirects
  {
    from: /^\/admin/,
    to: '/unauthorized',
    condition: (user) => user?.role !== 'admin',
    priority: 90
  },
  
  // Protected route redirects
  {
    from: /^\/dashboard|^\/profile|^\/courses\/.*\/study/,
    to: (pathname) => `/auth/login?redirectTo=${encodeURIComponent(pathname)}`,
    condition: (user) => !user,
    priority: 80
  },

  // Root redirects
  {
    from: '/',
    to: (pathname, searchParams, user) => {
      if (user) {
        return user.role === 'admin' ? '/admin' : '/dashboard'
      }
      return '/auth/login'
    },
    priority: 50
  }
]

export function useSmartRedirect(options: RedirectOptions = {}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { user, loading } = useAuth()
  const redirectManager = RedirectManager.getInstance()
  const lastRedirectRef = useRef<string>('')
  const timeoutRef = useRef<NodeJS.Timeout>()

  // Initialize default rules
  useEffect(() => {
    defaultRules.forEach(rule => redirectManager.addRule(rule))
  }, [redirectManager])

  // Smart redirect logic
  const performRedirect = useCallback((destination: string, redirectOptions: RedirectOptions = {}) => {
    const {
      replace = true,
      timeout = 100,
      onRedirect,
      onError
    } = { ...options, ...redirectOptions }

    // Prevent redirect loops
    if (lastRedirectRef.current === destination || pathname === destination) {
      return
    }

    // Check if redirect is already pending
    if (redirectManager.isPending(destination)) {
      return
    }

    try {
      lastRedirectRef.current = destination
      redirectManager.setPending(destination)

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Perform redirect with small delay to prevent flash
      timeoutRef.current = setTimeout(() => {
        logger.debug('Smart redirect executing', { 
          from: pathname, 
          to: destination,
          replace 
        })

        if (replace) {
          router.replace(destination)
        } else {
          router.push(destination)
        }

        onRedirect?.(destination)
      }, timeout)

    } catch (error: any) {
      logger.error('Redirect failed', { destination, error })
      onError?.(error)
    }
  }, [pathname, router, options, redirectManager])

  // Check for redirects when auth state or route changes
  useEffect(() => {
    if (loading) return

    const destination = redirectManager.findRedirect(pathname, searchParams, user)
    
    if (destination) {
      logger.debug('Smart redirect found', { 
        from: pathname, 
        to: destination,
        userRole: user?.role 
      })
      performRedirect(destination)
    }
  }, [pathname, searchParams, user, loading, redirectManager, performRedirect])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return {
    redirect: performRedirect,
    addRule: (rule: RedirectRule) => redirectManager.addRule(rule),
    removeRule: (from: string | RegExp) => redirectManager.removeRule(from),
    clearCache: () => redirectManager.clearCache(),
    isPending: (path: string) => redirectManager.isPending(path)
  }
}

/**
 * REDIRECT COMPONENT for declarative redirects
 */
interface SmartRedirectProps {
  to: string
  condition?: boolean
  replace?: boolean
  preserveQuery?: boolean
  delay?: number
  children?: React.ReactNode
}

export function SmartRedirect({ 
  to, 
  condition = true, 
  replace = true,
  preserveQuery = false,
  delay = 0,
  children 
}: SmartRedirectProps) {
  const { redirect } = useSmartRedirect()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!condition) return

    const destination = preserveQuery && searchParams.toString()
      ? `${to}?${searchParams.toString()}`
      : to

    if (delay > 0) {
      const timer = setTimeout(() => redirect(destination, { replace }), delay)
      return () => clearTimeout(timer)
    } else {
      redirect(destination, { replace })
    }
  }, [condition, to, replace, preserveQuery, delay, redirect, searchParams])

  return children ? <>{children}</> : null
}

/**
 * PRESERVE STATE REDIRECT - Maintains form data and scroll position
 */
export function useStatePreservingRedirect() {
  const { redirect } = useSmartRedirect()

  const redirectWithState = useCallback((destination: string, state: any = {}) => {
    // Store state in sessionStorage
    const stateKey = `redirect-state-${Date.now()}`
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(stateKey, JSON.stringify({
        ...state,
        scrollPosition: window.scrollY,
        timestamp: Date.now()
      }))
    }

    // Add state key to destination
    const url = new URL(destination, window.location.origin)
    url.searchParams.set('state', stateKey)

    redirect(url.toString(), { preserveState: true })
  }, [redirect])

  const restoreState = useCallback((stateKey?: string) => {
    if (typeof window === 'undefined') return null

    const key = stateKey || new URLSearchParams(window.location.search).get('state')
    if (!key) return null

    try {
      const stored = sessionStorage.getItem(key)
      if (stored) {
        const state = JSON.parse(stored)
        
        // Restore scroll position
        if (state.scrollPosition) {
          window.scrollTo(0, state.scrollPosition)
        }

        // Clean up
        sessionStorage.removeItem(key)
        
        return state
      }
    } catch (error) {
      logger.error('Failed to restore state:', error)
    }

    return null
  }, [])

  return { redirectWithState, restoreState }
}

/**
 * ROUTE TRANSITION MANAGER - Smooth transitions between routes
 */
export function useRouteTransition() {
  const [isTransitioning, setIsTransitioning] = useState(false)
  const { redirect } = useSmartRedirect()

  const transitionTo = useCallback(async (destination: string, duration = 300) => {
    setIsTransitioning(true)

    // Add transition class to body
    if (typeof window !== 'undefined') {
      document.body.classList.add('route-transitioning')
    }

    // Wait for transition
    await new Promise(resolve => setTimeout(resolve, duration / 2))

    // Perform redirect
    redirect(destination, { skipAnimation: true })

    // Complete transition
    setTimeout(() => {
      setIsTransitioning(false)
      if (typeof window !== 'undefined') {
        document.body.classList.remove('route-transitioning')
      }
    }, duration / 2)
  }, [redirect])

  return { transitionTo, isTransitioning }
}
