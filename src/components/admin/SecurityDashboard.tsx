'use client'

/**
 * Enhanced Security Dashboard Component
 * Real-time security monitoring and testing interface
 */

import React, { useState, useEffect } from 'react'
import { securityMonitor, SecurityEvent, SecurityMetrics } from '@/lib/security-monitor'
import { securityTester, SecurityTestSuite } from '@/lib/security-tester'
import { Shield, AlertTriangle, Activity, RefreshCw, Play } from 'lucide-react'

interface SecurityDashboardProps {
  className?: string
}

export function SecurityDashboard({ className = '' }: SecurityDashboardProps) {
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null)
  const [recentEvents, setRecentEvents] = useState<SecurityEvent[]>([])
  const [testResults, setTestResults] = useState<SecurityTestSuite[]>([])
  const [isRunningTests, setIsRunningTests] = useState(false)
  const [selectedTab, setSelectedTab] = useState<'overview' | 'events' | 'tests'>('overview')

  // Load initial data
  useEffect(() => {
    loadMetrics()
    loadRecentEvents()
    
    // Set up real-time updates
    const unsubscribe = securityMonitor.subscribe((event) => {
      loadMetrics()
      loadRecentEvents()
    })

    return unsubscribe
  }, [])

  const loadMetrics = () => {
    setMetrics(securityMonitor.getMetrics())
  }

  const loadRecentEvents = () => {
    setRecentEvents(securityMonitor.getEvents({ limit: 10 }))
  }

  const runSecurityTests = async () => {
    setIsRunningTests(true)
    try {
      const results = await securityTester.runAllTests()
      setTestResults(results)
    } catch (error) {
      console.error('Failed to run security tests:', error)
    } finally {
      setIsRunningTests(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50'
      case 'high': return 'text-orange-600 bg-orange-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-blue-600 bg-blue-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getTestStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'text-green-600 bg-green-50'
      case 'failed': return 'text-red-600 bg-red-50'
      case 'warning': return 'text-yellow-600 bg-yellow-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-3">
          <Shield className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Security Dashboard</h2>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Real-time security monitoring and testing
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex px-6">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'events', label: 'Security Events', icon: AlertTriangle },
            { id: 'tests', label: 'Security Tests', icon: Shield }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`flex items-center space-x-2 py-4 px-4 border-b-2 font-medium text-sm ${
                selectedTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {selectedTab === 'overview' && (
          <div className="space-y-6">
            {/* Metrics Overview */}
            {metrics && (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{metrics.totalEvents}</div>
                  <div className="text-sm text-blue-800">Total Events (24h)</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{metrics.criticalEvents}</div>
                  <div className="text-sm text-red-800">Critical Events</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{metrics.authFailures}</div>
                  <div className="text-sm text-orange-800">Auth Failures</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{metrics.injectionAttempts}</div>
                  <div className="text-sm text-purple-800">Injection Attempts</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{metrics.rateLimitViolations}</div>
                  <div className="text-sm text-yellow-800">Rate Limit Violations</div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex gap-4">
              <button
                onClick={runSecurityTests}
                disabled={isRunningTests}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                <Play className="h-4 w-4" />
                <span>{isRunningTests ? 'Running Tests...' : 'Run Security Tests'}</span>
              </button>
              <button
                onClick={loadMetrics}
                className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh Metrics</span>
              </button>
            </div>

            {/* Recent Events Summary */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Security Events</h3>
              {recentEvents.length > 0 ? (
                <div className="space-y-2">
                  {recentEvents.slice(0, 5).map((event) => (
                    <div key={event.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(event.severity)}`}>
                          {event.severity.toUpperCase()}
                        </span>
                        <span className="text-sm font-medium">{event.type.replace('_', ' ').toUpperCase()}</span>
                        {event.userId && (
                          <span className="text-xs text-gray-600">User: {event.userId}</span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {event.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-600 text-center py-4">No recent security events</div>
              )}
            </div>
          </div>
        )}

        {selectedTab === 'events' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Security Events</h3>
              <button
                onClick={loadRecentEvents}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </button>
            </div>
            
            {recentEvents.length > 0 ? (
              <div className="space-y-3">
                {recentEvents.map((event) => (
                  <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(event.severity)}`}>
                            {event.severity.toUpperCase()}
                          </span>
                          <span className="font-medium">{event.type.replace('_', ' ').toUpperCase()}</span>
                          {event.resolved && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                              RESOLVED
                            </span>
                          )}
                        </div>
                        
                        <div className="text-sm text-gray-600 space-y-1">
                          {event.userId && <div>User ID: {event.userId}</div>}
                          {event.endpoint && <div>Endpoint: {event.endpoint}</div>}
                          {event.ip && <div>IP: {event.ip}</div>}
                          {event.userAgent && <div>User Agent: {event.userAgent}</div>}
                        </div>
                        
                        {Object.keys(event.details).length > 0 && (
                          <div className="mt-2 text-xs text-gray-500">
                            <details>
                              <summary className="cursor-pointer">Details</summary>
                              <pre className="mt-1 bg-gray-50 p-2 rounded text-xs overflow-x-auto">
                                {JSON.stringify(event.details, null, 2)}
                              </pre>
                            </details>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-xs text-gray-500 ml-4">
                        {event.timestamp.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-600">
                No security events recorded
              </div>
            )}
          </div>
        )}

        {selectedTab === 'tests' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Security Tests</h3>
              <button
                onClick={runSecurityTests}
                disabled={isRunningTests}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                <Play className="h-4 w-4" />
                <span>{isRunningTests ? 'Running...' : 'Run Tests'}</span>
              </button>
            </div>

            {testResults.length > 0 ? (
              <div className="space-y-4">
                {testResults.map((suite, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">{suite.name}</h4>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getTestStatusColor(suite.overallStatus)}`}>
                        {suite.overallStatus.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      {suite.results.map((result, resultIndex) => (
                        <div key={resultIndex} className="flex items-center justify-between py-1">
                          <div className="flex items-center space-x-3">
                            <span className={result.passed ? 'text-green-600' : 'text-red-600'}>
                              {result.passed ? '✓' : '✗'}
                            </span>
                            <span className="text-sm">{result.testName}</span>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs ${getSeverityColor(result.severity)}`}>
                            {result.severity.toUpperCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-600">
                No test results available. Run security tests to see results.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default SecurityDashboard