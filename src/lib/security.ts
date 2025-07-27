/**
 * Security utilities for input sanitization and validation
 */

/**
 * Sanitize HTML input to prevent XSS attacks
 */
export function sanitizeHtml(input: string): string {
  if (typeof input !== 'string') return ''
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

/**
 * Sanitize user input for database operations
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return ''
  
  // Remove potentially dangerous characters
  return input
    .trim()
    .replace(/[<>\"'%;()&+]/g, '') // Remove dangerous characters
    .slice(0, 1000) // Limit length
}

/**
 * Validate and sanitize email addresses
 */
export function sanitizeEmail(email: string): string | null {
  if (typeof email !== 'string') return null
  
  const cleaned = email.toLowerCase().trim()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  if (!emailRegex.test(cleaned) || cleaned.length > 254) {
    return null
  }
  
  return cleaned
}

/**
 * Rate limiting for API calls (simple in-memory implementation)
 */
class RateLimiter {
  private requests: Map<string, number[]> = new Map()
  
  isAllowed(identifier: string, limit: number, windowMs: number): boolean {
    const now = Date.now()
    const windowStart = now - windowMs
    
    // Get existing requests for this identifier
    const existingRequests = this.requests.get(identifier) || []
    
    // Filter out old requests
    const recentRequests = existingRequests.filter(time => time > windowStart)
    
    // Check if limit exceeded
    if (recentRequests.length >= limit) {
      return false
    }
    
    // Add current request
    recentRequests.push(now)
    this.requests.set(identifier, recentRequests)
    
    return true
  }
  
  clear() {
    this.requests.clear()
  }
}

export const rateLimiter = new RateLimiter()

/**
 * Validate file uploads for security
 */
export function validateFileUpload(file: File): { isValid: boolean; error?: string } {
  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    return { isValid: false, error: 'File too large (max 10MB)' }
  }
  
  // Check file type
  const allowedTypes = [
    'image/jpeg',
    'image/png', 
    'image/webp',
    'application/pdf',
    'text/plain'
  ]
  
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'File type not allowed' }
  }
  
  // Check filename for dangerous patterns
  const dangerousPatterns = [
    /\.(exe|bat|cmd|scr|pif|com)$/i,
    /[<>:"|?*]/,
    /^\./,
    /\.{2,}/
  ]
  
  if (dangerousPatterns.some(pattern => pattern.test(file.name))) {
    return { isValid: false, error: 'Invalid filename' }
  }
  
  return { isValid: true }
}

/**
 * Generate secure random strings for IDs, tokens, etc.
 */
export function generateSecureId(length: number = 16): string {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
  let result = ''
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return result
}

/**
 * Validate UUIDs
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

/**
 * Content Security Policy helpers
 */
export const cspDirectives = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'", "'unsafe-inline'"],
  styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
  imgSrc: ["'self'", "data:", "https://images.unsplash.com", "https://*.supabase.co"],
  fontSrc: ["'self'", "https://fonts.gstatic.com"],
  connectSrc: ["'self'", "https://*.supabase.co"]
}

/**
 * Environment variable validation
 */
export function validateEnvironment(): { isValid: boolean; missing: string[] } {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ]
  
  const missing = required.filter(key => !process.env[key])
  
  return {
    isValid: missing.length === 0,
    missing
  }
}
