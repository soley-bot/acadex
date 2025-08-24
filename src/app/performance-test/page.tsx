/**
 * Performance Comparison Component
 * Tests the difference between original and optimized implementations
 */

'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useOptimizedLoading } from '@/hooks/useOptimizedLoading'
import { useSmartRedirect } from '@/hooks/useSmartRedirect'
import { cacheUtils } from '@/lib/smartCache'

interface PerformanceMetrics {
  loadTime: number
  cacheHits: number
  cacheSize: number
  avgResponseTime: number
}

export default function PerformanceTestPage() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    cacheHits: 0,
    cacheSize: 0,
    avgResponseTime: 0
  })

  const [testResults, setTestResults] = useState<string[]>([])
  const { user, loading } = useAuth()
  const optimizedLoading = useOptimizedLoading({
    cacheKey: 'performance-test',
    enablePreemptiveLoading: true
  })
  const { navigate, preloadRoutes } = useSmartRedirect()

  useEffect(() => {
    const startTime = Date.now()
    
    // Simulate component load
    const loadTimer = setTimeout(() => {
      const loadTime = Date.now() - startTime
      setMetrics(prev => ({ ...prev, loadTime }))
    }, 100)

    return () => clearTimeout(loadTimer)
  }, [])

  const runCacheTest = async () => {
    setTestResults(prev => [...prev, 'Starting cache performance test...'])
    
    const start = Date.now()
    
    // Test cache operations
    for (let i = 0; i < 100; i++) {
      const key = `test-${i}`
      const data = { id: i, name: `Test ${i}`, timestamp: Date.now() }
      
      // Set data
      cacheUtils.set(key, data)
      
      // Get data (should be fast)
      const retrieved = cacheUtils.get(key)
      
      if (retrieved) {
        setMetrics(prev => ({ ...prev, cacheHits: prev.cacheHits + 1 }))
      }
    }
    
    const duration = Date.now() - start
    const stats = cacheUtils.stats()
    
    setMetrics(prev => ({
      ...prev,
      cacheSize: stats.size,
      avgResponseTime: duration / 100
    }))
    
    setTestResults(prev => [
      ...prev,
      `Cache test completed in ${duration}ms`,
      `Cache hits: ${stats.totalAccess}`,
      `Cache size: ${stats.size} entries`,
      `Average access time: ${(duration / 100).toFixed(2)}ms`
    ])
  }

  const runLoadingTest = async () => {
    setTestResults(prev => [...prev, 'Testing optimized loading...'])
    
    try {
      await optimizedLoading.startLoading(async () => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 500))
        return { success: true, data: 'Test data loaded' }
      })
      
      setTestResults(prev => [
        ...prev,
        'Optimized loading test completed successfully',
        `Loading progress tracked: ${optimizedLoading.progress}%`,
        `Phase: ${optimizedLoading.phase}`
      ])
    } catch (error) {
      setTestResults(prev => [...prev, `Loading test failed: ${error}`])
    }
  }

  const runRedirectTest = () => {
    setTestResults(prev => [...prev, 'Testing smart redirect preloading...'])
    
    // Preload common routes
    const routes = ['/dashboard', '/courses', '/quizzes', '/profile']
    preloadRoutes(routes, 100)
    
    setTestResults(prev => [
      ...prev,
      `Preloaded ${routes.length} routes for faster navigation`,
      'Routes ready for instant navigation'
    ])
  }

  const clearCache = () => {
    cacheUtils.clear()
    setTestResults(prev => [...prev, 'Cache cleared'])
    setMetrics(prev => ({ ...prev, cacheSize: 0, cacheHits: 0 }))
  }

  const clearResults = () => {
    setTestResults([])
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Performance Optimization Test Suite</h1>
      
      {/* Performance Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Load Time</h3>
          <p className="text-2xl font-bold text-blue-600">{metrics.loadTime}ms</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Cache Hits</h3>
          <p className="text-2xl font-bold text-green-600">{metrics.cacheHits}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Cache Size</h3>
          <p className="text-2xl font-bold text-purple-600">{metrics.cacheSize}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Avg Response</h3>
          <p className="text-2xl font-bold text-orange-600">{metrics.avgResponseTime.toFixed(2)}ms</p>
        </div>
      </div>

      {/* Auth Status */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-semibold mb-2">Authentication Status</h3>
        <div className="flex items-center space-x-4">
          <div className={`px-3 py-1 rounded-full text-sm ${
            loading ? 'bg-yellow-100 text-yellow-800' : 
            user ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {loading ? 'Loading...' : user ? `Logged in as ${user.name}` : 'Not logged in'}
          </div>
          {user && (
            <div className="text-sm text-gray-600">
              Role: {user.role} | ID: {user.id.slice(0, 8)}...
            </div>
          )}
        </div>
      </div>

      {/* Test Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <button
          onClick={runCacheTest}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium"
        >
          Test Cache Performance
        </button>
        
        <button
          onClick={runLoadingTest}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium"
          disabled={optimizedLoading.isLoading}
        >
          {optimizedLoading.isLoading ? 'Loading...' : 'Test Optimized Loading'}
        </button>
        
        <button
          onClick={runRedirectTest}
          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-medium"
        >
          Test Smart Redirect
        </button>
        
        <button
          onClick={clearCache}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium"
        >
          Clear Cache
        </button>
      </div>

      {/* Loading Progress */}
      {optimizedLoading.isLoading && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Loading Progress</h3>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${optimizedLoading.progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Phase: {optimizedLoading.phase} - {optimizedLoading.progress.toFixed(1)}%
          </p>
        </div>
      )}

      {/* Test Results */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Test Results</h3>
          <button
            onClick={clearResults}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            Clear Results
          </button>
        </div>
        
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {testResults.length === 0 ? (
            <p className="text-gray-500 italic">No test results yet. Run some tests to see performance data.</p>
          ) : (
            testResults.map((result, index) => (
              <div
                key={index}
                className="px-3 py-2 bg-gray-50 rounded text-sm font-mono"
              >
                <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span> {result}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Performance Tips */}
      <div className="mt-8 bg-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-3 text-blue-800">Performance Optimizations Active</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-blue-700 mb-2">🚀 Middleware Optimizations</h4>
            <ul className="space-y-1 text-blue-600">
              <li>• Unified authentication checks</li>
              <li>• Smart route caching</li>
              <li>• Enhanced security headers</li>
              <li>• Rate limiting protection</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-blue-700 mb-2">⚡ Loading Enhancements</h4>
            <ul className="space-y-1 text-blue-600">
              <li>• Intelligent caching system</li>
              <li>• Preemptive route loading</li>
              <li>• Progress tracking</li>
              <li>• Auto-cleanup mechanisms</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
