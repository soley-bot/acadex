/**
 * Security Audit Utilities
 * Provides security monitoring and audit capabilities
 */

import { logger } from './logger'
import type { User } from './supabase'

export interface SecurityEvent {
  type: 'auth' | 'access' | 'error' | 'admin' | 'data'
  action: string
  userId?: string
  userEmail?: string
  userRole?: string
  ip?: string
  userAgent?: string
  resource?: string
  metadata?: Record<string, any>
  timestamp: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export class SecurityAudit {
  private static events: SecurityEvent[] = []
  private static readonly MAX_EVENTS = 10000

  /**
   * Log a security event
   */
  static logEvent(event: Omit<SecurityEvent, 'timestamp'>): void {
    const securityEvent: SecurityEvent = {
      ...event,
      timestamp: new Date().toISOString()
    }

    // Add to in-memory store
    this.events.unshift(securityEvent)
    
    // Keep only recent events
    if (this.events.length > this.MAX_EVENTS) {
      this.events = this.events.slice(0, this.MAX_EVENTS)
    }

    // Log to external logger
    logger.security(event.action, {
      type: event.type,
      severity: event.severity,
      userId: event.userId,
      userEmail: event.userEmail,
      userRole: event.userRole,
      ip: event.ip,
      userAgent: event.userAgent,
      resource: event.resource,
      metadata: event.metadata
    })

    // Send alerts for critical events
    if (event.severity === 'critical') {
      this.sendAlert(securityEvent)
    }
  }

  /**
   * Authentication events
   */
  static auth = {
    loginSuccess: (user: User, ip?: string, userAgent?: string) => {
      this.logEvent({
        type: 'auth',
        action: 'login_success',
        userId: user.id,
        userEmail: user.email,
        userRole: user.role,
        ip,
        userAgent,
        severity: 'low'
      })
    },

    loginFailed: (email: string, reason: string, ip?: string, userAgent?: string) => {
      this.logEvent({
        type: 'auth',
        action: 'login_failed',
        userEmail: email,
        ip,
        userAgent,
        metadata: { reason },
        severity: 'medium'
      })
    },

    loginBlocked: (email: string, ip?: string, userAgent?: string) => {
      this.logEvent({
        type: 'auth',
        action: 'login_blocked',
        userEmail: email,
        ip,
        userAgent,
        metadata: { reason: 'Too many failed attempts' },
        severity: 'high'
      })
    },

    logout: (user: User, ip?: string) => {
      this.logEvent({
        type: 'auth',
        action: 'logout',
        userId: user.id,
        userEmail: user.email,
        userRole: user.role,
        ip,
        severity: 'low'
      })
    },

    passwordChanged: (user: User, ip?: string) => {
      this.logEvent({
        type: 'auth',
        action: 'password_changed',
        userId: user.id,
        userEmail: user.email,
        userRole: user.role,
        ip,
        severity: 'medium'
      })
    }
  }

  /**
   * Access control events
   */
  static access = {
    authorized: (user: User, resource: string, action: string, ip?: string) => {
      this.logEvent({
        type: 'access',
        action: 'access_granted',
        userId: user.id,
        userEmail: user.email,
        userRole: user.role,
        resource,
        ip,
        metadata: { action },
        severity: 'low'
      })
    },

    denied: (user: User | null, resource: string, reason: string, ip?: string) => {
      this.logEvent({
        type: 'access',
        action: 'access_denied',
        userId: user?.id,
        userEmail: user?.email,
        userRole: user?.role,
        resource,
        ip,
        metadata: { reason },
        severity: user ? 'medium' : 'high'
      })
    },

    adminAccess: (user: User, resource: string, action: string, ip?: string) => {
      this.logEvent({
        type: 'admin',
        action: 'admin_access',
        userId: user.id,
        userEmail: user.email,
        userRole: user.role,
        resource,
        ip,
        metadata: { action },
        severity: 'medium'
      })
    }
  }

  /**
   * Data events
   */
  static data = {
    created: (user: User, resource: string, resourceId: string, ip?: string) => {
      this.logEvent({
        type: 'data',
        action: 'data_created',
        userId: user.id,
        userEmail: user.email,
        userRole: user.role,
        resource,
        ip,
        metadata: { resourceId },
        severity: 'low'
      })
    },

    updated: (user: User, resource: string, resourceId: string, changes: string[], ip?: string) => {
      this.logEvent({
        type: 'data',
        action: 'data_updated',
        userId: user.id,
        userEmail: user.email,
        userRole: user.role,
        resource,
        ip,
        metadata: { resourceId, changes },
        severity: 'low'
      })
    },

    deleted: (user: User, resource: string, resourceId: string, ip?: string) => {
      this.logEvent({
        type: 'data',
        action: 'data_deleted',
        userId: user.id,
        userEmail: user.email,
        userRole: user.role,
        resource,
        ip,
        metadata: { resourceId },
        severity: 'medium'
      })
    },

    exported: (user: User, resource: string, filter?: string, ip?: string) => {
      this.logEvent({
        type: 'data',
        action: 'data_exported',
        userId: user.id,
        userEmail: user.email,
        userRole: user.role,
        resource,
        ip,
        metadata: { filter },
        severity: 'medium'
      })
    }
  }

  /**
   * Error events
   */
  static error = {
    suspiciousActivity: (description: string, ip?: string, userAgent?: string, metadata?: Record<string, any>) => {
      this.logEvent({
        type: 'error',
        action: 'suspicious_activity',
        ip,
        userAgent,
        metadata: { description, ...metadata },
        severity: 'high'
      })
    },

    securityViolation: (description: string, user?: User, ip?: string, metadata?: Record<string, any>) => {
      this.logEvent({
        type: 'error',
        action: 'security_violation',
        userId: user?.id,
        userEmail: user?.email,
        userRole: user?.role,
        ip,
        metadata: { description, ...metadata },
        severity: 'critical'
      })
    },

    rateLimitExceeded: (ip: string, endpoint: string, userAgent?: string) => {
      this.logEvent({
        type: 'error',
        action: 'rate_limit_exceeded',
        ip,
        userAgent,
        resource: endpoint,
        severity: 'medium'
      })
    }
  }

  /**
   * Get recent security events
   */
  static getRecentEvents(limit = 100, type?: SecurityEvent['type']): SecurityEvent[] {
    let events = this.events

    if (type) {
      events = events.filter(event => event.type === type)
    }

    return events.slice(0, limit)
  }

  /**
   * Get security metrics
   */
  static getMetrics(hours = 24): {
    totalEvents: number
    eventsByType: Record<string, number>
    eventsBySeverity: Record<string, number>
    topIPs: Array<{ ip: string; count: number }>
    recentCritical: SecurityEvent[]
  } {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
    const recentEvents = this.events.filter(event => event.timestamp >= since)

    const eventsByType: Record<string, number> = {}
    const eventsBySeverity: Record<string, number> = {}
    const ipCounts: Record<string, number> = {}

    recentEvents.forEach(event => {
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1
      eventsBySeverity[event.severity] = (eventsBySeverity[event.severity] || 0) + 1
      
      if (event.ip) {
        ipCounts[event.ip] = (ipCounts[event.ip] || 0) + 1
      }
    })

    const topIPs = Object.entries(ipCounts)
      .map(([ip, count]) => ({ ip, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    const recentCritical = recentEvents
      .filter(event => event.severity === 'critical')
      .slice(0, 20)

    return {
      totalEvents: recentEvents.length,
      eventsByType,
      eventsBySeverity,
      topIPs,
      recentCritical
    }
  }

  /**
   * Send alert for critical events
   */
  private static async sendAlert(event: SecurityEvent): Promise<void> {
    // In production, this would send to monitoring service, email, Slack, etc.
    logger.warn('🚨 CRITICAL SECURITY EVENT:', {
      action: event.action,
      userId: event.userId,
      userEmail: event.userEmail,
      ip: event.ip,
      timestamp: event.timestamp,
      metadata: event.metadata
    })

    // For now, just log to console
    // TODO: Integrate with monitoring service (DataDog, Sentry, etc.)
  }

  /**
   * Export events for analysis
   */
  static exportEvents(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      const headers = ['timestamp', 'type', 'action', 'severity', 'userId', 'userEmail', 'userRole', 'ip', 'resource']
      const rows = this.events.map(event => [
        event.timestamp,
        event.type,
        event.action,
        event.severity,
        event.userId || '',
        event.userEmail || '',
        event.userRole || '',
        event.ip || '',
        event.resource || ''
      ])

      return [headers, ...rows].map(row => row.join(',')).join('\n')
    }

    return JSON.stringify(this.events, null, 2)
  }

  /**
   * Clear old events
   */
  static clearOldEvents(days = 90): number {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
    const initialLength = this.events.length
    
    this.events = this.events.filter(event => event.timestamp >= cutoff)
    
    return initialLength - this.events.length
  }
}

// Auto-cleanup old events daily
if (typeof globalThis !== 'undefined') {
  setInterval(() => {
    const removed = SecurityAudit.clearOldEvents()
    if (removed > 0) {
      logger.info(`Cleaned up ${removed} old security events`)
    }
  }, 24 * 60 * 60 * 1000) // Daily
}
