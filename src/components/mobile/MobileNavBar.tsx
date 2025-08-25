'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Home, ChevronLeft, Brain, BookOpen, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCallback } from 'react'

interface MobileNavBarProps {
  /**
   * The URL to navigate back to when back button is pressed
   */
  backHref?: string
  /**
   * Custom back button label (optional)
   */
  backLabel?: string
  /**
   * Whether to show home button (default: true)
   */
  showHome?: boolean
  /**
   * Whether to show back button (default: true)
   */
  showBack?: boolean
  /**
   * Custom home URL (default: /dashboard for authenticated users, / for public)
   */
  homeHref?: string
  /**
   * Page title to display in center
   */
  title?: string
  /**
   * Custom className for styling
   */
  className?: string
}

/**
 * Mobile Navigation Bar at the top with glass effect
 * For pages that need prominent navigation
 */
export function MobileNavBar({
  backHref,
  backLabel,
  showHome = true,
  showBack = true,
  homeHref,
  title,
  className = ''
}: MobileNavBarProps) {
  const router = useRouter()

  const handleBack = () => {
    if (backHref) {
      router.push(backHref)
    } else {
      router.back()
    }
  }

  const defaultHomeHref = homeHref || '/dashboard'

  return (
    <>
      {/* Mobile Navigation Bar - Only visible on small screens */}
      <div className={`md:hidden fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-border shadow-sm ${className}`}>
        <div className="flex items-center justify-between h-14 px-4">
          {/* Back Button */}
          {showBack && (
            <button
              onClick={handleBack}
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground p-2 h-auto min-w-0 transition-colors duration-150 active:scale-95 touch-manipulation"
            >
              <ChevronLeft className="h-5 w-5" />
              {backLabel && (
                <span className="text-sm font-medium truncate max-w-[80px]">
                  {backLabel}
                </span>
              )}
            </button>
          )}

          {/* Page Title - Center */}
          {title && (
            <div className="flex-1 text-center">
              <h1 className="text-sm font-semibold text-foreground truncate px-2">
                {title}
              </h1>
            </div>
          )}

          {/* Home Button */}
          {showHome && (
            <Link href={defaultHomeHref} className="flex items-center gap-1 text-muted-foreground hover:text-foreground p-2 h-auto transition-colors duration-150 active:scale-95 touch-manipulation">
              <Home className="h-5 w-5" />
            </Link>
          )}

          {/* Spacer when no home button */}
          {!showHome && !title && <div className="w-10" />}
        </div>
      </div>

      {/* Spacer to prevent content from being hidden behind fixed navbar */}
      <div className="md:hidden h-14" />
    </>
  )
}

/**
 * Mobile Bottom Navigation Bar - App-like bottom navigation
 * Fixed 3-button layout: Back | Home | Dashboard
 * Optimized for fast, responsive interactions
 */
export function MobileBottomNavBar({
  className = ''
}: {
  className?: string
}) {
  const router = useRouter()

  // Use browser back for intuitive navigation
  const handleBack = useCallback(() => {
    router.back()
  }, [router])

  return (
    <>
      {/* Mobile Bottom Navigation - Only visible on small screens */}
      <div className={`md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-border shadow-lg ${className}`}>
        <div className="flex items-center justify-around h-16 px-4">
          {/* Back Button - Uses browser history */}
          <button
            onClick={handleBack}
            className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground p-2 h-auto min-w-0 transition-colors duration-150 active:scale-95 touch-manipulation"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-xs font-medium">Back</span>
          </button>

          {/* Home Button - Landing page */}
          <Link 
            href="/" 
            prefetch={true}
            className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground p-2 h-auto transition-colors duration-150 active:scale-95 touch-manipulation"
          >
            <Home className="h-5 w-5" />
            <span className="text-xs font-medium">Home</span>
          </Link>

          {/* Dashboard Button - Main app hub */}
          <Link 
            href="/dashboard" 
            prefetch={true}
            className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground p-2 h-auto transition-colors duration-150 active:scale-95 touch-manipulation"
          >
            <LayoutDashboard className="h-5 w-5" />
            <span className="text-xs font-medium">Dashboard</span>
          </Link>
        </div>
      </div>

      {/* Spacer to prevent content from being hidden behind fixed bottom nav */}
      <div className="md:hidden h-16" />
    </>
  )
}

/**
 * Mobile Navigation Bar with minimal design for immersive experiences
 * (like quiz taking or course study) - Floating buttons
 * Optimized for performance
 */
export function MobileNavBarMinimal({
  backHref,
  showHome = false,
  homeHref,
  className = ''
}: Pick<MobileNavBarProps, 'backHref' | 'showHome' | 'homeHref' | 'className'>) {
  const router = useRouter()

  const handleBack = () => {
    if (backHref) {
      router.push(backHref)
    } else {
      router.back()
    }
  }

  const defaultHomeHref = homeHref || '/dashboard'

  return (
    <>
      {/* Minimal Mobile Navigation - Floating buttons, only visible on small screens */}
      <div className={`md:hidden fixed top-4 left-4 right-4 z-50 flex items-center justify-between ${className}`}>
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="bg-white/90 backdrop-blur-sm border border-white/20 shadow-lg hover:bg-white/95 p-3 h-auto rounded-full transition-all duration-150 active:scale-95 touch-manipulation"
        >
          <ArrowLeft className="h-4 w-4 text-gray-700" />
        </button>

        {/* Home Button */}
        {showHome && (
          <Link href={defaultHomeHref} className="bg-white/90 backdrop-blur-sm border border-white/20 shadow-lg hover:bg-white/95 p-3 h-auto rounded-full transition-all duration-150 active:scale-95 touch-manipulation">
            <Home className="h-4 w-4 text-gray-700" />
          </Link>
        )}
      </div>

      {/* Small top margin to account for floating buttons */}
      <div className="md:hidden h-4" />
    </>
  )
}
