/**
 * Optimized loading hook with preemptive loading and caching
 * Provides faster loading states with predictive caching
 */

import { useState, useEffect, useCallback, useRef } from 'react';

interface LoadingState {
  isLoading: boolean;
  progress: number;
  phase: 'initial' | 'loading' | 'complete' | 'error';
  error?: string;
}

interface UseOptimizedLoadingOptions {
  timeout?: number;
  enablePreemptiveLoading?: boolean;
  cacheKey?: string;
  onProgress?: (progress: number) => void;
}

// Simple cache for loading states
const loadingCache = new Map<string, any>();

export function useOptimizedLoading(options: UseOptimizedLoadingOptions = {}) {
  const {
    timeout = 10000,
    enablePreemptiveLoading = true,
    cacheKey,
    onProgress
  } = options;

  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    progress: 0,
    phase: 'initial'
  });

  const timeoutRef = useRef<NodeJS.Timeout>();
  const progressRef = useRef<NodeJS.Timeout>();

  // Check cache first
  const getCachedData = useCallback((key: string) => {
    if (!key) return null;
    return loadingCache.get(key);
  }, []);

  // Cache data for future use
  const setCachedData = useCallback((key: string, data: any) => {
    if (!key) return;
    loadingCache.set(key, data);
    
    // Auto-cleanup cache after 5 minutes
    setTimeout(() => {
      loadingCache.delete(key);
    }, 5 * 60 * 1000);
  }, []);

  // Simulate progress for better UX
  const startProgress = useCallback(() => {
    let progress = 0;
    const increment = () => {
      progress += Math.random() * 15 + 5; // Random increment between 5-20%
      if (progress < 90) {
        setState(prev => ({ ...prev, progress: Math.min(progress, 90) }));
        onProgress?.(Math.min(progress, 90));
        progressRef.current = setTimeout(increment, 200 + Math.random() * 300);
      }
    };
    increment();
  }, [onProgress]);

  // Main loading function
  const startLoading = useCallback(async <T>(
    loadFunction: () => Promise<T>,
    options?: { skipCache?: boolean }
  ): Promise<T> => {
    // Check cache first
    if (cacheKey && !options?.skipCache) {
      const cached = getCachedData(cacheKey);
      if (cached) {
        setState({
          isLoading: false,
          progress: 100,
          phase: 'complete'
        });
        return cached;
      }
    }

    setState({
      isLoading: true,
      progress: 0,
      phase: 'loading'
    });

    startProgress();

    // Setup timeout
    timeoutRef.current = setTimeout(() => {
      setState(prev => ({
        ...prev,
        phase: 'error',
        error: 'Request timeout'
      }));
    }, timeout);

    try {
      const result = await loadFunction();
      
      // Clear progress simulation
      if (progressRef.current) {
        clearTimeout(progressRef.current);
      }

      setState({
        isLoading: false,
        progress: 100,
        phase: 'complete'
      });

      // Cache the result
      if (cacheKey) {
        setCachedData(cacheKey, result);
      }

      return result;
    } catch (error) {
      setState({
        isLoading: false,
        progress: 0,
        phase: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    } finally {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (progressRef.current) {
        clearTimeout(progressRef.current);
      }
    }
  }, [cacheKey, getCachedData, setCachedData, startProgress, timeout]);

  // Preemptive loading for common routes
  const preload = useCallback(async <T>(
    loadFunction: () => Promise<T>,
    preloadKey: string
  ) => {
    if (!enablePreemptiveLoading) return;
    
    try {
      const result = await loadFunction();
      setCachedData(preloadKey, result);
    } catch (error) {
      // Silent fail for preloading
      console.warn('Preload failed:', error);
    }
  }, [enablePreemptiveLoading, setCachedData]);

  // Reset loading state
  const reset = useCallback(() => {
    setState({
      isLoading: false,
      progress: 0,
      phase: 'initial'
    });
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (progressRef.current) {
      clearTimeout(progressRef.current);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (progressRef.current) {
        clearTimeout(progressRef.current);
      }
    };
  }, []);

  return {
    ...state,
    startLoading,
    preload,
    reset,
    hasCachedData: cacheKey ? loadingCache.has(cacheKey) : false
  };
}

// Helper hook for route-specific loading
export function useRouteLoading(routePath: string) {
  return useOptimizedLoading({
    cacheKey: `route:${routePath}`,
    enablePreemptiveLoading: true,
    timeout: 8000
  });
}

// Helper hook for API loading
export function useApiLoading(endpoint: string) {
  return useOptimizedLoading({
    cacheKey: `api:${endpoint}`,
    enablePreemptiveLoading: false,
    timeout: 15000
  });
}
