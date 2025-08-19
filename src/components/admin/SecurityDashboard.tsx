/**
 * Security Dashboard Component
 * Admin-only dashboard for viewing security metrics and audit logs
 */

'use client'

import { logger } from '@/lib/logger'
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { SecurityAudit } from '@/lib/security-audit'
import { SECURITY_CONFIG } from '@/lib/security-config'
import { 
  Shield, 
  AlertTriangle, 
  Activity, 
  Users, 
  Eye,
  Download,
  RefreshCw,
  Clock,
  TrendingUp
} from 'lucide-react'

interface SecurityMetrics {
  totalEvents: number
  eventsByType: Record<string, number>
  eventsBySeverity: Record<string, number>
  topIPs: Array<{ ip: string; count: number }>
  recentCritical: any[]
}

export default function SecurityDashboard() {
  const { user, isAdmin } = useAuth()
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null)
  const [recentEvents, setRecentEvents] = useState<any[]>([])
  const [timeRange, setTimeRange] = useState(24)
  const [eventType, setEventType] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  const loadSecurityData = useCallback(() => {
    setLoading(true)
    
    try {
      const metricsData = SecurityAudit.getMetrics(timeRange)
      setMetrics(metricsData)
      
      const eventsData = SecurityAudit.getRecentEvents(50, eventType === 'all' ? undefined : eventType as any)
      setRecentEvents(eventsData)
    } catch (error) {
      logger.error('Failed to load security data:', error)
    }
    
    setLoading(false)
  }, [timeRange, eventType])

  useEffect(() => {
    if (isAdmin()) {
      loadSecurityData()
    }
  }, [loadSecurityData, isAdmin])

  // Redirect non-admin users
  if (!isAdmin()) {
    return (
      <div className="p-6">
        <div className="bg-primary/5 border border-destructive/30 rounded-md p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Access Denied</h3>
              <p className="text-sm text-red-700 mt-1">
                This page requires administrator privileges.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const handleExport = () => {
    const csvData = SecurityAudit.exportEvents('csv')
    const blob = new Blob([csvData], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `security-events-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-primary bg-destructive/20'
      case 'high': return 'text-orange-600 bg-orange-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-muted/40'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'auth': return <Users className="w-4 h-4" />
      case 'access': return <Shield className="w-4 h-4" />
      case 'admin': return <Eye className="w-4 h-4" />
      case 'error': return <AlertTriangle className="w-4 h-4" />
      case 'data': return <Activity className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center">
          <RefreshCw className="w-6 h-6 animate-spin text-secondary" />
          <span className="ml-2">Loading security data...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Shield className="w-6 h-6 mr-2 text-secondary" />
            Security Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Monitor security events and system health</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value={1}>Last Hour</option>
            <option value={24}>Last 24 Hours</option>
            <option value={168}>Last Week</option>
            <option value={720}>Last Month</option>
          </select>
          
          <button
            onClick={handleExport}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          
          <button
            onClick={loadSecurityData}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-secondary hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Metrics Overview */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <Activity className="w-8 h-8 text-secondary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Events</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalEvents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <AlertTriangle className="w-8 h-8 text-primary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Critical Events</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.eventsBySeverity.critical || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Auth Events</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.eventsByType.auth || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Access Events</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.eventsByType.access || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Critical Events Alert */}
      {metrics?.recentCritical && metrics.recentCritical.length > 0 && (
        <div className="bg-primary/5 border border-destructive/30 rounded-md p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                {metrics.recentCritical.length} Critical Security Event(s) Detected
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <ul className="list-disc space-y-1 ml-5">
                  {metrics.recentCritical.slice(0, 3).map((event, index) => (
                    <li key={index}>
                      {event.action} - {new Date(event.timestamp).toLocaleString()}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Events by Type Chart */}
      {metrics && (
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Events by Type</h3>
          <div className="space-y-3">
            {Object.entries(metrics.eventsByType).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center">
                  {getTypeIcon(type)}
                  <span className="ml-2 text-sm font-medium text-gray-900 capitalize">{type}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-32 bg-muted/60 rounded-full h-2 mr-3">
                    <div
                      className="bg-secondary h-2 rounded-full"
                      style={{ width: `${(count / metrics.totalEvents) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-500">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top IPs */}
      {metrics?.topIPs && metrics.topIPs.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top IP Addresses</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event Count
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {metrics.topIPs.map((ip, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {ip.ip}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {ip.count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Events */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Recent Security Events</h3>
          <select
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="all">All Types</option>
            <option value="auth">Authentication</option>
            <option value="access">Access Control</option>
            <option value="admin">Admin Actions</option>
            <option value="error">Errors</option>
            <option value="data">Data Operations</option>
          </select>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentEvents.slice(0, 20).map((event, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 text-gray-400 mr-2" />
                      {new Date(event.timestamp).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getTypeIcon(event.type)}
                      <span className="ml-2 text-sm text-gray-900 capitalize">{event.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {event.action}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(event.severity)}`}>
                      {event.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {event.userEmail || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {event.ip || 'Unknown'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Configuration */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Current Security Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Authentication</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>Max login attempts: {SECURITY_CONFIG.auth.maxLoginAttempts}</li>
              <li>Lockout duration: {SECURITY_CONFIG.auth.lockoutDuration / 60000} minutes</li>
              <li>Password min length: {SECURITY_CONFIG.auth.passwordMinLength}</li>
              <li>Strong password required: {SECURITY_CONFIG.auth.requireStrongPassword ? 'Yes' : 'No'}</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Rate Limiting</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>API requests: {SECURITY_CONFIG.rateLimit.api.general.requests}/min</li>
              <li>Auth requests: {SECURITY_CONFIG.rateLimit.api.auth.requests}/15min</li>
              <li>Admin requests: {SECURITY_CONFIG.rateLimit.api.admin.requests}/min</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
