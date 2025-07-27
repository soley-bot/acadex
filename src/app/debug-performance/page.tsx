'use client';

import React, { useState, useEffect } from 'react';

interface PerformanceMetrics {
  networkRequests: any[];
  bundleSize: number;
  renderTime: number;
  memoryUsage: number;
  loadTime: number;
}

export default function DebugPerformancePage() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    networkRequests: [],
    bundleSize: 0,
    renderTime: 0,
    memoryUsage: 0,
    loadTime: 0
  });

  useEffect(() => {
    // Monitor network requests
    const originalFetch = window.fetch;
    const requests: any[] = [];
    
    window.fetch = function(...args) {
      const startTime = performance.now();
      return originalFetch.apply(this, args).then(response => {
        const endTime = performance.now();
        requests.push({
          url: args[0],
          duration: endTime - startTime,
          status: response.status,
          timestamp: new Date().toISOString()
        });
        setMetrics(prev => ({ ...prev, networkRequests: [...requests] }));
        return response;
      });
    };

    // Memory usage
    if ('memory' in performance) {
      const memoryInfo = (performance as any).memory;
      setMetrics(prev => ({
        ...prev,
        memoryUsage: memoryInfo.usedJSHeapSize / 1024 / 1024 // MB
      }));
    }

    // Page load time
    window.addEventListener('load', () => {
      setTimeout(() => {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        setMetrics(prev => ({ ...prev, loadTime }));
      }, 0);
    });

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  const clearMetrics = () => {
    setMetrics({
      networkRequests: [],
      bundleSize: 0,
      renderTime: 0,
      memoryUsage: 0,
      loadTime: 0
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Performance Debug Dashboard</h1>
          <button
            onClick={clearMetrics}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Clear Metrics
          </button>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Memory Usage</h3>
            <p className="text-2xl font-bold text-gray-900">{metrics.memoryUsage.toFixed(2)} MB</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Load Time</h3>
            <p className="text-2xl font-bold text-gray-900">{metrics.loadTime} ms</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Network Requests</h3>
            <p className="text-2xl font-bold text-gray-900">{metrics.networkRequests.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Avg Request Time</h3>
            <p className="text-2xl font-bold text-gray-900">
              {metrics.networkRequests.length > 0 
                ? (metrics.networkRequests.reduce((sum, req) => sum + req.duration, 0) / metrics.networkRequests.length).toFixed(0)
                : 0} ms
            </p>
          </div>
        </div>

        {/* Network Requests */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Network Requests</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    URL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {metrics.networkRequests.slice(-20).map((request, index) => (
                  <tr key={index} className={request.duration > 1000 ? 'bg-red-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-xs truncate">
                      {typeof request.url === 'string' ? request.url : JSON.stringify(request.url)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={request.duration > 1000 ? 'text-red-600 font-bold' : request.duration > 500 ? 'text-yellow-600' : 'text-green-600'}>
                        {request.duration.toFixed(0)}ms
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={request.status >= 400 ? 'text-red-600' : request.status >= 300 ? 'text-yellow-600' : 'text-green-600'}>
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(request.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Performance Tips */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Performance Tips</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                <div className="ml-3">
                  <p className="text-sm text-gray-600">
                    <strong>Slow Requests ({'>'}1000ms):</strong> {metrics.networkRequests.filter(r => r.duration > 1000).length} requests
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <div className="ml-3">
                  <p className="text-sm text-gray-600">
                    <strong>Medium Requests (500-1000ms):</strong> {metrics.networkRequests.filter(r => r.duration > 500 && r.duration <= 1000).length} requests
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div className="ml-3">
                  <p className="text-sm text-gray-600">
                    <strong>Fast Requests ({'<'}500ms):</strong> {metrics.networkRequests.filter(r => r.duration <= 500).length} requests
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Optimization Recommendations:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Cache API responses in sessionStorage/localStorage</li>
                <li>• Use React.memo() for expensive components</li>
                <li>• Implement virtual scrolling for long lists</li>
                <li>• Optimize images with next/image</li>
                <li>• Use dynamic imports for code splitting</li>
                <li>• Minimize bundle size with tree shaking</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
