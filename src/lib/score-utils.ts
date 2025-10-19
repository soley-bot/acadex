/**
 * Standardized score utilities for consistent scoring UI across the application
 *
 * Score Thresholds:
 * - Excellent: >= 80%
 * - Good: >= 60%
 * - Needs Improvement: < 60%
 */

export const SCORE_THRESHOLDS = {
  EXCELLENT: 80,
  GOOD: 60,
} as const

export type ScoreLevel = 'excellent' | 'good' | 'needs-improvement'

/**
 * Get the score level based on percentage
 */
export function getScoreLevel(percentage: number): ScoreLevel {
  if (percentage >= SCORE_THRESHOLDS.EXCELLENT) return 'excellent'
  if (percentage >= SCORE_THRESHOLDS.GOOD) return 'good'
  return 'needs-improvement'
}

/**
 * Get Tailwind classes for score badges (for dashboard/progress pages)
 */
export function getScoreBadgeClasses(percentage: number): string {
  const level = getScoreLevel(percentage)

  switch (level) {
    case 'excellent':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'good':
      return 'bg-amber-100 text-amber-800 border-amber-200'
    case 'needs-improvement':
      return 'bg-red-100 text-red-800 border-red-200'
  }
}

/**
 * Get color class for score text (for inline displays)
 */
export function getScoreTextColor(percentage: number): string {
  const level = getScoreLevel(percentage)

  switch (level) {
    case 'excellent':
      return 'text-green-600'
    case 'good':
      return 'text-amber-600'
    case 'needs-improvement':
      return 'text-red-600'
  }
}

/**
 * Get background color class for score displays
 */
export function getScoreBackgroundColor(percentage: number): string {
  const level = getScoreLevel(percentage)

  switch (level) {
    case 'excellent':
      return 'bg-green-100 text-green-700'
    case 'good':
      return 'bg-amber-100 text-amber-700'
    case 'needs-improvement':
      return 'bg-red-100 text-red-700'
  }
}

/**
 * Validate and normalize score percentage
 * Returns a number between 0-100, or 0 if invalid
 */
export function normalizeScore(score: number | null | undefined): number {
  if (score == null || isNaN(score)) return 0
  return Math.max(0, Math.min(100, Math.round(score)))
}

/**
 * Calculate percentage from score and total
 * Safe division with validation
 */
export function calculatePercentage(score: number, total: number): number {
  if (!total || total <= 0) return 0
  if (!score || score < 0) return 0
  return Math.round((score / total) * 100)
}

/**
 * Format score display as "X/Y (Z%)"
 */
export function formatScore(score: number, total: number): string {
  const percentage = calculatePercentage(score, total)
  return `${score}/${total} (${percentage}%)`
}
