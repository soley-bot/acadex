'use client'

/**
 * Comprehensive Security Monitoring System
 * Tracks security events, threats, and system health in real-time
 */

import { logger } from './logger'

export interface SecurityEvent {
  id: string
  type: 'auth_failure' | 'rate_limit' | 'injection_attempt' | 'admin_access' | 'data_breach' | 'suspicious_activity'
  severity: 'low' | 'medium' | 'high' | 'critical'
  timestamp: Date
  userId?: string
  userAgent?: string
  ip?: string
  endpoint?: string
  details: Record<string, any>
  resolved: boolean
}

export interface SecurityMetrics {
  totalEvents: number
  criticalEvents: number
  authFailures: number
  injectionAttempts: number
  rateLimitViolations: number
  lastUpdated: Date
}

class SecurityMonitor {
  private events: SecurityEvent[] = []
  private readonly maxEvents = 1000
  private readonly alertThresholds = {
    authFailures: 5,
    injectionAttempts: 3,
    rateLimitViolations: 10
  }
  private subscribers: Array<(event: SecurityEvent) => void> = []

  // Log security event
  logEvent(event: Omit<SecurityEvent, 'id' | 'timestamp' | 'resolved'>): void {
    const securityEvent: SecurityEvent = {
      ...event,
      id: this.generateEventId(),
      timestamp: new Date(),
      resolved: false
    }

    this.events.unshift(securityEvent)
    
    // Maintain event limit
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(0, this.maxEvents)
    }

    // Log to system logger
    logger.warn('Security Event:', {
      type: securityEvent.type,
      severity: securityEvent.severity,
      userId: securityEvent.userId,
      endpoint: securityEvent.endpoint
    })

    // Check for alert conditions
    this.checkAlertConditions(securityEvent)

    // Notify subscribers
    this.notifySubscribers(securityEvent)
  }

  // Subscribe to security events
  subscribe(callback: (event: SecurityEvent) => void): () => void {
    this.subscribers.push(callback)
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback)
    }
  }

  // Get security metrics
  getMetrics(): SecurityMetrics {
    const now = new Date()
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    
    const recentEvents = this.events.filter(event => event.timestamp > last24Hours)
    
    return {
      totalEvents: recentEvents.length,
      criticalEvents: recentEvents.filter(e => e.severity === 'critical').length,
      authFailures: recentEvents.filter(e => e.type === 'auth_failure').length,
      injectionAttempts: recentEvents.filter(e => e.type === 'injection_attempt').length,
      rateLimitViolations: recentEvents.filter(e => e.type === 'rate_limit').length,
      lastUpdated: now
    }
  }

  // Get events by criteria
  getEvents(filter?: {
    type?: SecurityEvent['type']
    severity?: SecurityEvent['severity']
    userId?: string
    limit?: number
  }): SecurityEvent[] {
    let filteredEvents = [...this.events]

    if (filter?.type) {
      filteredEvents = filteredEvents.filter(e => e.type === filter.type)
    }
    if (filter?.severity) {
      filteredEvents = filteredEvents.filter(e => e.severity === filter.severity)
    }
    if (filter?.userId) {
      filteredEvents = filteredEvents.filter(e => e.userId === filter.userId)
    }

    return filteredEvents.slice(0, filter?.limit || 100)
  }

  // Mark event as resolved
  resolveEvent(eventId: string, resolvedBy?: string): boolean {
    const event = this.events.find(e => e.id === eventId)
    if (event) {
      event.resolved = true
      event.details.resolvedBy = resolvedBy
      event.details.resolvedAt = new Date()
      return true
    }
    return false
  }

  // Check for alert conditions
  private checkAlertConditions(event: SecurityEvent): void {
    const recentEvents = this.getRecentEvents(5) // Last 5 minutes
    
    // Check auth failure threshold
    const authFailures = recentEvents.filter(e => e.type === 'auth_failure').length
    if (authFailures >= this.alertThresholds.authFailures) {
      this.triggerAlert('Multiple authentication failures detected', 'high', {
        count: authFailures,
        timeframe: '5 minutes'
      })
    }

    // Check injection attempt threshold
    const injectionAttempts = recentEvents.filter(e => e.type === 'injection_attempt').length
    if (injectionAttempts >= this.alertThresholds.injectionAttempts) {
      this.triggerAlert('Multiple injection attempts detected', 'critical', {
        count: injectionAttempts,
        timeframe: '5 minutes'
      })
    }

    // Immediate critical alerts
    if (event.severity === 'critical') {
      this.triggerAlert(`Critical security event: ${event.type}`, 'critical', event.details)
    }
  }

  // Get recent events within specified minutes
  private getRecentEvents(minutes: number): SecurityEvent[] {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000)
    return this.events.filter(event => event.timestamp > cutoff)
  }

  // Trigger security alert
  private triggerAlert(message: string, severity: string, details: any): void {
    logger.error('SECURITY ALERT:', { message, severity, details })
    
    // In production, this would integrate with alerting systems
    // For now, we'll use console and could extend to email, Slack, etc.
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.warn(`🚨 SECURITY ALERT [${severity.toUpperCase()}]: ${message}`, details)
    }
  }

  // Generate unique event ID
  private generateEventId(): string {
    return `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Notify all subscribers
  private notifySubscribers(event: SecurityEvent): void {
    this.subscribers.forEach(callback => {
      try {
        callback(event)
      } catch (error) {
        logger.error('Error notifying security event subscriber:', error)
      }
    })
  }

  // Clear old events (for memory management)
  cleanup(): void {
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days
    this.events = this.events.filter(event => event.timestamp > cutoff)
  }
}

// Global security monitor instance
export const securityMonitor = new SecurityMonitor()

// Helper functions for common security events
export const SecurityEventHelpers = {
  authFailure: (userId?: string, details: any = {}) => {
    securityMonitor.logEvent({
      type: 'auth_failure',
      severity: 'medium',
      userId,
      details: {
        reason: 'Invalid credentials',
        ...details
      }
    })
  },

  injectionAttempt: (endpoint: string, payload: string, userId?: string) => {
    securityMonitor.logEvent({
      type: 'injection_attempt',
      severity: 'critical',
      userId,
      endpoint,
      details: {
        payload: payload.substring(0, 500), // Truncate for safety
        blocked: true
      }
    })
  },

  adminAccess: (userId: string, action: string, details: any = {}) => {
    securityMonitor.logEvent({
      type: 'admin_access',
      severity: 'medium',
      userId,
      details: {
        action,
        ...details
      }
    })
  },

  suspiciousActivity: (description: string, severity: SecurityEvent['severity'] = 'medium', details: any = {}) => {
    securityMonitor.logEvent({
      type: 'suspicious_activity',
      severity,
      details: {
        description,
        ...details
      }
    })
  },

  rateLimitViolation: (userId?: string, endpoint?: string, details: any = {}) => {
    securityMonitor.logEvent({
      type: 'rate_limit',
      severity: 'medium',
      userId,
      endpoint,
      details: {
        action: 'Rate limit exceeded',
        ...details
      }
    })
  }
}

// Periodic cleanup
if (typeof window !== 'undefined') {
  setInterval(() => {
    securityMonitor.cleanup()
  }, 60 * 60 * 1000) // Every hour
}