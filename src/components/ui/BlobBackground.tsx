import React from 'react'

interface BlobBackgroundProps {
  variant?: 'default' | 'subtle' | 'vibrant'
  className?: string
}

/**
 * Standardized animated blob background component
 *
 * Design System Standards:
 * - Uses semantic colors: primary, secondary, warning from design system
 * - Consistent sizing: 80x80, 64x64, 48x48 (following 4px/8dp grid)
 * - Standard opacity levels: 20-30% for subtle backgrounds
 * - Consistent animation timing: 7s with staggered delays
 * - Professional positioning using design system spacing
 */
export function BlobBackground({ variant = 'default', className = '' }: BlobBackgroundProps) {
  const variants = {
    // Default: Marketing/landing pages - balanced visual impact
    default: (
      <>
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-primary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-warning/30 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-6000"></div>
      </>
    ),

    // Subtle: Functional pages - reduced visual distraction
    subtle: (
      <>
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/20 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob"></div>
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-secondary/15 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob animation-delay-3000"></div>
        <div className="absolute top-32 left-32 w-48 h-48 bg-warning/20 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-6000"></div>
      </>
    ),

    // Vibrant: Interactive/engagement pages - high visual impact
    vibrant: (
      <>
        <div className="absolute -top-48 -right-48 w-96 h-96 bg-primary/35 rounded-full mix-blend-multiply filter blur-xl opacity-80 animate-blob"></div>
        <div className="absolute -bottom-48 -left-48 w-96 h-96 bg-secondary/25 rounded-full mix-blend-multiply filter blur-xl opacity-80 animate-blob animation-delay-2000"></div>
        <div className="absolute top-48 left-48 w-80 h-80 bg-warning/35 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/3 right-1/3 w-72 h-72 bg-primary/25 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-6000"></div>
      </>
    )
  }

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {variants[variant]}
    </div>
  )
}

/**
 * Usage Examples:
 *
 * // Landing page sections
 * <BlobBackground variant="default" />
 *
 * // Functional pages (dashboard, settings)
 * <BlobBackground variant="subtle" />
 *
 * // Interactive experiences (quizzes, games)
 * <BlobBackground variant="vibrant" />
 */
