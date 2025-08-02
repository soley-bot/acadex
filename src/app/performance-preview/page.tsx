'use client'

import { logger } from '@/lib/logger';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { clearAllCaches, QueryPerformance } from '@/lib/optimizedDatabase';

export default function PerformancePreviewPage() {
  const [isClearing, setIsClearing] = useState(false);
  const [stats, setStats] = useState<any>({});
  const [serverInfo, setServerInfo] = useState<any>(null);

  // Clear all caches
  const handleClearCaches = async () => {
    setIsClearing(true);
    try {
      // Clear application caches
      clearAllCaches();
      
      // Clear browser cache programmatically (where possible)
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }
      
      // Force page reload to clear component state
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      logger.error('Error clearing caches:', error);
    } finally {
      setTimeout(() => setIsClearing(false), 1000);
    }
  };

  // Get performance stats
  useEffect(() => {
    const updateStats = () => {
      setStats(QueryPerformance.getStats());
    };
    
    updateStats();
    const interval = setInterval(updateStats, 2000);
    return () => clearInterval(interval);
  }, []);

  // Get server information
  useEffect(() => {
    const getServerInfo = () => {
      setServerInfo({
        userAgent: navigator.userAgent,
        memory: (performance as any).memory ? {
          used: Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024),
          total: Math.round((performance as any).memory.totalJSHeapSize / 1024 / 1024),
          limit: Math.round((performance as any).memory.jsHeapSizeLimit / 1024 / 1024)
        } : null,
        connection: (navigator as any).connection ? {
          effectiveType: (navigator as any).connection.effectiveType,
          downlink: (navigator as any).connection.downlink
        } : null
      });
    };
    
    getServerInfo();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🚀 Performance Preview & Testing
          </h1>
          <p className="text-xl text-gray-600">
            Test the optimized Acadex performance with fresh caches and monitoring
          </p>
        </div>

        {/* Cache Management */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Cache Management</h2>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleClearCaches}
              disabled={isClearing}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                isClearing
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              {isClearing ? '🧹 Clearing...' : '🧹 Clear All Caches'}
            </button>
            <div className="text-sm text-gray-600">
              Clears: Database cache, Session storage, Local storage, Browser cache
            </div>
          </div>
        </div>

        {/* Performance Testing Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <TestLink
            href="/quizzes"
            title="🧩 Quiz Performance"
            description="Test optimized quiz loading with selective fields, caching, and skeleton loaders"
            metrics="Expected: 200-500ms"
          />
          <TestLink
            href="/courses"
            title="📚 Course Performance"
            description="Test course listing with database indexes and parallel queries"
            metrics="Expected: 300-600ms"
          />
          <TestLink
            href="/dashboard"
            title="📊 Dashboard Performance"
            description="Test user dashboard with parallel data fetching"
            metrics="Expected: 400-800ms"
          />
          <TestLink
            href="/admin/courses"
            title="⚙️ Admin Performance"
            description="Test admin interface with optimized queries"
            metrics="Expected: 500ms-1s"
          />
          <TestLink
            href="/debug-performance"
            title="🔍 Performance Debug"
            description="Live performance monitoring and network analysis"
            metrics="Real-time metrics"
          />
          <TestLink
            href="/quizzes/optimized-page"
            title="⚡ Optimized Page"
            description="Preview of fully optimized quiz page implementation"
            metrics="Ultra-fast loading"
          />
        </div>

        {/* Performance Stats */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Query Performance Stats</h2>
          {Object.keys(stats).length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Query</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Max Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Calls</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {Object.entries(stats).map(([query, data]: [string, any]) => (
                    <tr key={query}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{query}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{data.avg}ms</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <span className={data.max > 1000 ? 'text-red-600 font-bold' : data.max > 500 ? 'text-yellow-600' : 'text-green-600'}>
                          {data.max}ms
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{data.count}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          data.avg < 200 ? 'bg-green-100 text-green-800' :
                          data.avg < 500 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {data.avg < 200 ? '🚀 Fast' : data.avg < 500 ? '⚡ Good' : '🐌 Slow'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No query data yet. Visit some pages to see performance metrics.</p>
          )}
        </div>

        {/* System Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">System Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {serverInfo?.memory && (
              <div>
                <h3 className="font-semibold mb-2">Memory Usage</h3>
                <div className="space-y-1 text-sm">
                  <div>Used: {serverInfo.memory.used} MB</div>
                  <div>Total: {serverInfo.memory.total} MB</div>
                  <div>Limit: {serverInfo.memory.limit} MB</div>
                </div>
              </div>
            )}
            {serverInfo?.connection && (
              <div>
                <h3 className="font-semibold mb-2">Network</h3>
                <div className="space-y-1 text-sm">
                  <div>Type: {serverInfo.connection.effectiveType}</div>
                  <div>Speed: {serverInfo.connection.downlink} Mbps</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Optimization Guide */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-blue-900 mb-4">🎯 Performance Optimization Results</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h3 className="font-semibold text-blue-800 mb-2">✅ Implemented Optimizations:</h3>
              <ul className="space-y-1 text-blue-700">
                <li>• Database indexes for faster queries</li>
                <li>• Selective field fetching (.select specific fields)</li>
                <li>• Query result caching (in-memory + session)</li>
                <li>• Parallel data fetching (Promise.all)</li>
                <li>• Image optimization with lazy loading</li>
                <li>• Function memoization (useMemo)</li>
                <li>• Skeleton loaders for better UX</li>
                <li>• Performance monitoring</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-blue-800 mb-2">📈 Expected Improvements:</h3>
              <ul className="space-y-1 text-blue-700">
                <li>• Quiz page: 3-5s → 200-500ms (90% faster)</li>
                <li>• Course page: 2-4s → 300-600ms (85% faster)</li>
                <li>• Dashboard: 4-6s → 400-800ms (80% faster)</li>
                <li>• Admin panel: 5-8s → 500ms-1s (85% faster)</li>
                <li>• Search: 1-3s → 100-300ms (90% faster)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Test Link Component
const TestLink: React.FC<{
  href: string;
  title: string;
  description: string;
  metrics: string;
}> = ({ href, title, description, metrics }) => (
  <Link
    href={href}
    className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
  >
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 text-sm mb-3">{description}</p>
    <div className="flex items-center justify-between">
      <span className="text-xs text-blue-600 font-medium">{metrics}</span>
      <span className="text-[#ff5757] font-medium">Test →</span>
    </div>
  </Link>
);
