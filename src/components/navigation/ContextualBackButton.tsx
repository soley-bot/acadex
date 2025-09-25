'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ContextualBackButtonProps {
  /**
   * URL to navigate back to
   */
  href?: string
  /**
   * Label for the back button (e.g., "Back to Quizzes")
   */
  label?: string
  /**
   * Custom className for styling
   */
  className?: string
  /**
   * Whether to show as prominent button on mobile (default: true)
   */
  mobileProminent?: boolean
}

/**
 * Contextual Back Button following NN Group guidelines
 * - Shows as simple link on desktop
 * - Shows as prominent button on mobile
 * - Uses browser back if no href provided
 */
export function ContextualBackButton({
  href,
  label = "Back",
  className = '',
  mobileProminent = true
}: ContextualBackButtonProps) {
  const router = useRouter()

  const handleBack = () => {
    if (href) {
      router.push(href)
    } else {
      router.back()
    }
  }

  const baseClasses = "inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-200"
  
  // Mobile prominent style (follows touch target guidelines)
  const mobileClasses = mobileProminent 
    ? "sm:text-sm sm:font-normal text-base font-medium sm:p-0 p-3 sm:bg-transparent bg-white/10 sm:rounded-none rounded-lg sm:border-none border border-border/30 sm:shadow-none shadow-sm min-h-[44px] touch-manipulation active:scale-95"
    : ""

  const combinedClasses = cn(baseClasses, mobileClasses, className)

  if (href) {
    return (
      <Link href={href} className={combinedClasses}>
        <ArrowLeft className="h-4 w-4" />
        <span>{label}</span>
      </Link>
    )
  }

  return (
    <button onClick={handleBack} className={combinedClasses}>
      <ArrowLeft className="h-4 w-4" />
      <span>{label}</span>
    </button>
  )
}
