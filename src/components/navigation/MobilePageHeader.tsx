'use client'

import { cn } from '@/lib/utils'
import { ContextualBackButton } from './ContextualBackButton'

interface MobilePageHeaderProps {
  /**
   * Page title to display
   */
  title: string
  /**
   * Optional subtitle/description
   */
  subtitle?: string
  /**
   * Back navigation URL
   */
  backHref?: string
  /**
   * Back button label
   */
  backLabel?: string
  /**
   * Additional actions to show on the right
   */
  actions?: React.ReactNode
  /**
   * Custom className
   */
  className?: string
}

/**
 * Mobile-First Page Header
 * - Shows contextual back button
 * - Displays page title prominently
 * - Follows mobile usability guidelines
 * - Responsive design (enhanced on desktop)
 */
export function MobilePageHeader({
  title,
  subtitle,
  backHref,
  backLabel,
  actions,
  className = ''
}: MobilePageHeaderProps) {
  return (
    <div className={cn("mb-6", className)}>
      {/* Back Navigation */}
      {(backHref || backLabel) && (
        <div className="mb-4">
          <ContextualBackButton 
            href={backHref}
            label={backLabel}
            mobileProminent={true}
          />
        </div>
      )}

      {/* Page Title Section */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
        
        {/* Actions */}
        {actions && (
          <div className="flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}