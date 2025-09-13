// Simplified Admin Performance Monitoring System
// Phase 3D - Extended Performance Architecture

import { useCallback, useEffect, useRef, useState } from 'react'
import { logger } from './logger'

// Performance metrics interface
export interface AdminPerformanceMetrics {
  componentName: string
  renderCount: number
  lastRenderTime: number
  averageRenderTime: number
  slowRendersCount: number
  memoryUsage?: number
}

// Admin-specific performance contexts
export type AdminComponentType = 
  | 'QuizBuilder' 
  | 'CourseForm' 
  | 'EnhancedAPICourseForm'
  | 'UserManagement'
  | 'Analytics'
  | 'Dashboard'
  | 'CategoryManagement'

// Performance thresholds by component type
const PERFORMANCE_THRESHOLDS: Record<AdminComponentType, number> = {
  QuizBuilder: 32,        // Complex form with AI
  CourseForm: 28,         // Medium complexity form
  EnhancedAPICourseForm: 35, // Most complex form
  UserManagement: 25,     // Simple list management
  Analytics: 40,          // Data-heavy charts
  Dashboard: 30,          // Multiple widgets
  CategoryManagement: 20  // Simple CRUD
}

// Global performance state
class AdminPerformanceMonitor {
  private metrics = new Map<string, AdminPerformanceMetrics>()
  private observers = new Set<(metrics: AdminPerformanceMetrics[]) => void>()
  
  // Register a component for monitoring
  registerComponent(componentName: string, type: AdminComponentType): void {
    const existingMetrics = this.metrics.get(componentName)
    if (!existingMetrics) {
      this.metrics.set(componentName, {
        componentName,
        renderCount: 0,
        lastRenderTime: 0,
        averageRenderTime: 0,
        slowRendersCount: 0
      })
    }
  }
  
  // Record render performance
  recordRender(componentName: string, renderTime: number, threshold: number): void {
    const metrics = this.metrics.get(componentName)
    if (!metrics) return
    
    metrics.renderCount += 1
    metrics.lastRenderTime = renderTime
    metrics.averageRenderTime = 
      (metrics.averageRenderTime * (metrics.renderCount - 1) + renderTime) / metrics.renderCount
    
    if (renderTime > threshold) {
      metrics.slowRendersCount += 1
      logger.warn(`Slow render detected: ${componentName} took ${renderTime.toFixed(2)}ms`, {
        threshold,
        renderTime,
        componentName
      })
    }
  }
  
  // Record memory usage
  recordMemoryUsage(componentName: string): void {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory
      const metrics = this.metrics.get(componentName)
      if (metrics && memory) {
        metrics.memoryUsage = memory.usedJSHeapSize
      }
    }
  }
  
  // Get all metrics
  getAllMetrics(): AdminPerformanceMetrics[] {
    return Array.from(this.metrics.values())
  }
  
  // Get metrics for specific component
  getComponentMetrics(componentName: string): AdminPerformanceMetrics | undefined {
    return this.metrics.get(componentName)
  }
  
  // Subscribe to performance updates
  subscribe(callback: (metrics: AdminPerformanceMetrics[]) => void): () => void {
    this.observers.add(callback)
    return () => this.observers.delete(callback)
  }
  
  private notifyObservers(): void {
    const allMetrics = this.getAllMetrics()
    this.observers.forEach(callback => callback(allMetrics))
  }
  
  // Performance report for debugging
  generateReport(): string {
    const metrics = this.getAllMetrics()
    const report = metrics.map(m => 
      `${m.componentName}: ${m.renderCount} renders, avg: ${m.averageRenderTime.toFixed(2)}ms, slow: ${m.slowRendersCount}`
    ).join('\n')
    
    return `Admin Performance Report:\n${report}`
  }
}

// Singleton instance
export const adminPerformanceMonitor = new AdminPerformanceMonitor()

// Enhanced usePerformanceMonitor hook for admin components
export function useAdminPerformanceMonitor(
  componentName: string,
  componentType: AdminComponentType,
  options: {
    logSlowRenders?: boolean
    trackMemory?: boolean
    customThreshold?: number
  } = {}
) {
  const {
    logSlowRenders = process.env.NODE_ENV === 'development',
    trackMemory = true,
    customThreshold
  } = options
  
  const threshold = customThreshold || PERFORMANCE_THRESHOLDS[componentType]
  const renderStartTime = useRef<number>(0)
  const [metrics, setMetrics] = useState<AdminPerformanceMetrics | undefined>()
  
  // Register component on mount
  useEffect(() => {
    adminPerformanceMonitor.registerComponent(componentName, componentType)
    
    // Subscribe to metrics updates
    const unsubscribe = adminPerformanceMonitor.subscribe((allMetrics) => {
      const componentMetrics = allMetrics.find(m => m.componentName === componentName)
      setMetrics(componentMetrics)
    })
    
    return unsubscribe
  }, [componentName, componentType])
  
  // Performance measurement hooks
  const startRender = useCallback(() => {
    renderStartTime.current = performance.now()
  }, [])
  
  const endRender = useCallback(() => {
    if (renderStartTime.current > 0) {
      const renderTime = performance.now() - renderStartTime.current
      adminPerformanceMonitor.recordRender(componentName, renderTime, threshold)
      
      if (trackMemory) {
        adminPerformanceMonitor.recordMemoryUsage(componentName)
      }
      
      renderStartTime.current = 0
    }
  }, [componentName, threshold, trackMemory])
  
  // Auto-measure renders
  useEffect(() => {
    startRender()
    endRender()
  })
  
  // Performance utilities
  const logPerformanceReport = useCallback(() => {
    if (process.env.NODE_ENV === 'development') {
      logger.info(adminPerformanceMonitor.generateReport())
    }
  }, [])
  
  const getGlobalMetrics = useCallback(() => {
    return adminPerformanceMonitor.getAllMetrics()
  }, [])
  
  return {
    metrics,
    threshold,
    startRender,
    endRender,
    logPerformanceReport,
    getGlobalMetrics,
    isSlowComponent: metrics ? metrics.slowRendersCount > 0 : false,
    performanceScore: metrics ? Math.max(0, 100 - (metrics.slowRendersCount * 10)) : 100
  }
}

// Component-specific hooks
export const useQuizBuilderPerformance = () => 
  useAdminPerformanceMonitor('QuizBuilder', 'QuizBuilder')

export const useCourseFormPerformance = () => 
  useAdminPerformanceMonitor('CourseForm', 'CourseForm')

export const useUserManagementPerformance = () => 
  useAdminPerformanceMonitor('UserManagement', 'UserManagement')

export const useAnalyticsPerformance = () => 
  useAdminPerformanceMonitor('Analytics', 'Analytics')

export const useDashboardPerformance = () => 
  useAdminPerformanceMonitor('Dashboard', 'Dashboard')

// Performance debugging utilities
export function logAdminPerformanceReport() {
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Admin Performance Report:')
    console.table(adminPerformanceMonitor.getAllMetrics())
  }
}

// Performance analytics for production
export function getAdminPerformanceAnalytics() {
  const metrics = adminPerformanceMonitor.getAllMetrics()
  return {
    totalComponents: metrics.length,
    slowComponents: metrics.filter(m => m.slowRendersCount > 0).length,
    averageRenderTime: metrics.reduce((sum, m) => sum + m.averageRenderTime, 0) / metrics.length || 0,
    totalSlowRenders: metrics.reduce((sum, m) => sum + m.slowRendersCount, 0),
    performanceScore: Math.round(100 - (metrics.reduce((sum, m) => sum + m.slowRendersCount, 0) * 2))
  }
}

// Bundle size monitoring
export function trackBundleSize(componentName: string, size: number) {
  if (process.env.NODE_ENV === 'development') {
    logger.info(`Bundle size for ${componentName}: ${(size / 1024).toFixed(2)}KB`)
  }
}

// Preloading strategies for admin components
export const preloadAdminComponents = () => {
  const componentsToPreload = [
    () => import('@/components/admin/CourseForm'),
    () => import('@/components/admin/CategoryManagement')
  ]
  
  componentsToPreload.forEach((importFunc, index) => {
    setTimeout(() => {
      importFunc().catch(error => {
        logger.warn('Failed to preload admin component:', error)
      })
    }, index * 100)
  })
}
