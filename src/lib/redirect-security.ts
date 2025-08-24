/**
 * Redirect Security Utilities
 * Prevents open redirect vulnerabilities by validating redirect URLs
 */

/**
 * Validates if a redirect URL is safe to use
 * Only allows same-origin redirects to prevent open redirect attacks
 */
export function validateRedirectUrl(url: string, baseUrl?: string): boolean {
  try {
    // Handle relative URLs (safe by default)
    if (url.startsWith('/')) {
      // Ensure it's not a protocol-relative URL (//evil.com)
      return !url.startsWith('//')
    }

    // Handle absolute URLs
    const redirectUrl = new URL(url)
    const currentOrigin = baseUrl ? new URL(baseUrl).origin : window.location.origin
    
    // Only allow same-origin redirects
    return redirectUrl.origin === currentOrigin
  } catch {
    // Invalid URL format
    return false
  }
}

/**
 * Sanitizes a redirect URL to ensure it's safe
 * Returns a safe redirect URL or a fallback
 */
export function sanitizeRedirectUrl(
  url: string, 
  fallback: string = '/dashboard',
  baseUrl?: string
): string {
  if (!url) return fallback
  
  // Validate the URL
  if (validateRedirectUrl(url, baseUrl)) {
    return url
  }
  
  // If invalid, return fallback
  console.warn('Invalid redirect URL blocked:', url)
  return fallback
}

/**
 * Common safe redirect destinations
 */
export const SAFE_REDIRECTS = {
  DASHBOARD: '/dashboard',
  LOGIN: '/auth/login',
  ADMIN: '/admin',
  HOME: '/',
  COURSES: '/courses',
  QUIZZES: '/quizzes'
} as const

/**
 * Validates redirect URL with role-based fallbacks
 */
export function getSecureRedirect(
  redirectUrl: string | null,
  userRole: string | null = null,
  baseUrl?: string
): string {
  // If no redirect URL provided, use role-based default
  if (!redirectUrl) {
    return userRole === 'admin' ? SAFE_REDIRECTS.ADMIN : SAFE_REDIRECTS.DASHBOARD
  }

  // Sanitize the provided URL
  const fallback = userRole === 'admin' ? SAFE_REDIRECTS.ADMIN : SAFE_REDIRECTS.DASHBOARD
  return sanitizeRedirectUrl(redirectUrl, fallback, baseUrl)
}
