'use client'

import React, { memo, useMemo } from 'react'
import { cn } from '@/lib/utils'

interface DashboardGridProps {
  children: React.ReactNode
  className?: string
  cols?: {
    default?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  gap?: number
}

export const DashboardGrid = memo<DashboardGridProps>(({
  children,
  className,
  cols = { default: 1, md: 2, lg: 3 },
  gap = 6
}) => {
  const gridClasses = useMemo(() => {
    return [
      `gap-${gap}`,
      cols.default && `grid-cols-${cols.default}`,
      cols.sm && `sm:grid-cols-${cols.sm}`,
      cols.md && `md:grid-cols-${cols.md}`,
      cols.lg && `lg:grid-cols-${cols.lg}`,
      cols.xl && `xl:grid-cols-${cols.xl}`
    ].filter(Boolean).join(' ')
  }, [gap, cols.default, cols.sm, cols.md, cols.lg, cols.xl])

  return (
    <div className={cn("grid", gridClasses, className)}>
      {children}
    </div>
  )
})

DashboardGrid.displayName = 'DashboardGrid'

interface DashboardSectionProps {
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
  headerActions?: React.ReactNode
}

export const DashboardSection = memo<DashboardSectionProps>(({
  title,
  description,
  children,
  className,
  headerActions
}) => {
  return (
    <section className={cn("space-y-6", className)}>
      {(title || description || headerActions) && (
        <div className="flex items-center justify-between">
          <div>
            {title && (
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {description}
              </p>
            )}
          </div>
          {headerActions && (
            <div className="flex items-center space-x-2">
              {headerActions}
            </div>
          )}
        </div>
      )}
      {children}
    </section>
  )
})

DashboardSection.displayName = 'DashboardSection'
