/**
 * Security Configuration
 * Central configuration for all security settings
 */

export const SECURITY_CONFIG = {
  // Authentication settings
  auth: {
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
    passwordMinLength: 8,
    requireStrongPassword: true,
    requireEmailVerification: true
  },

  // Rate limiting settings
  rateLimit: {
    api: {
      general: { requests: 100, windowMs: 60 * 1000 }, // 100 per minute
      auth: { requests: 5, windowMs: 15 * 60 * 1000 }, // 5 per 15 minutes
      admin: { requests: 200, windowMs: 60 * 1000 } // 200 per minute for admin
    },
    page: {
      general: { requests: 60, windowMs: 60 * 1000 } // 60 per minute
    }
  },

  // Role-based access control
  roles: {
    student: {
      permissions: [
        'courses:read',
        'courses:enroll',
        'quizzes:take',
        'profile:read',
        'profile:update'
      ],
      routes: [
        '/dashboard',
        '/courses',
        '/courses/*/study',
        '/profile',
        '/quizzes'
      ]
    },
    admin: {
      permissions: [
        'courses:*',
        'quizzes:*',
        'users:*',
        'admin:*',
        'analytics:*'
      ],
      routes: [
        '/admin',
        '/admin/*',
        '*' // Admin has access to everything
      ]
    }
  },

  // Input validation settings
  validation: {
    maxFileSize: 50 * 1024 * 1024, // 50MB
    allowedFileTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/webm',
      'application/pdf',
      'text/plain'
    ],
    maxStringLength: 10000,
    allowedDomains: [
      'localhost',
      'acadex.vercel.app',
      process.env.NEXT_PUBLIC_SITE_URL
    ].filter(Boolean)
  },

  // Content Security Policy
  csp: {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'unsafe-inline'",
      "'unsafe-eval'",
      "https://js.stripe.com",
      "https://checkout.stripe.com",
      "https://maps.googleapis.com"
    ],
    'style-src': [
      "'self'",
      "'unsafe-inline'",
      "https://fonts.googleapis.com"
    ],
    'font-src': [
      "'self'",
      "https://fonts.gstatic.com"
    ],
    'img-src': [
      "'self'",
      "data:",
      "blob:",
      "https:"
    ],
    'media-src': [
      "'self'",
      "blob:",
      "https:"
    ],
    'connect-src': [
      "'self'",
      "https://*.supabase.co",
      "https://api.stripe.com"
    ],
    'frame-src': [
      "'self'",
      "https://js.stripe.com",
      "https://checkout.stripe.com"
    ],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
    'upgrade-insecure-requests': []
  },

  // Security headers
  headers: {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-XSS-Protection': '1; mode=block',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
  },

  // Logging and monitoring
  logging: {
    enableSecurityLog: true,
    logFailedAttempts: true,
    logSuccessfulAuth: true,
    logAdminActions: true,
    retentionDays: 90
  },

  // Feature flags
  features: {
    enableTwoFactor: false, // Future feature
    enableSSO: false, // Future feature
    enableEmailNotifications: true,
    enableSecurityAlerts: true
  }
} as const

// Type helpers for role checking
export type UserRole = keyof typeof SECURITY_CONFIG.roles
export type Permission = string

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  const rolePermissions = SECURITY_CONFIG.roles[role]?.permissions || []
  
  return rolePermissions.some((p: string) => {
    if (p === permission) return true
    if (p.endsWith('*')) {
      const prefix = p.slice(0, -1)
      return permission.startsWith(prefix)
    }
    return false
  })
}

/**
 * Check if a role can access a specific route
 */
export function canAccessRoute(role: UserRole, route: string): boolean {
  const roleRoutes = SECURITY_CONFIG.roles[role]?.routes || []
  
  return roleRoutes.some(r => {
    if (r === '*') return true
    if (r === route) return true
    if (r.endsWith('*')) {
      const prefix = r.slice(0, -1)
      return route.startsWith(prefix)
    }
    if (r.includes('*')) {
      const pattern = r.replace(/\*/g, '[^/]+')
      return new RegExp(`^${pattern}$`).test(route)
    }
    return route.startsWith(r)
  })
}

/**
 * Get Content Security Policy header value
 */
export function getCSPHeader(): string {
  return Object.entries(SECURITY_CONFIG.csp)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
    .join('; ')
}
