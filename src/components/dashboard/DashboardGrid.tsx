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
    // Static class mappings for Tailwind JIT compiler
    const colMapping: Record<number, string> = {
      1: 'grid-cols-1',
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4',
      5: 'grid-cols-5',
      6: 'grid-cols-6',
    }

    const smMapping: Record<number, string> = {
      1: 'sm:grid-cols-1',
      2: 'sm:grid-cols-2',
      3: 'sm:grid-cols-3',
      4: 'sm:grid-cols-4',
      5: 'sm:grid-cols-5',
      6: 'sm:grid-cols-6',
    }

    const mdMapping: Record<number, string> = {
      1: 'md:grid-cols-1',
      2: 'md:grid-cols-2',
      3: 'md:grid-cols-3',
      4: 'md:grid-cols-4',
      5: 'md:grid-cols-5',
      6: 'md:grid-cols-6',
    }

    const lgMapping: Record<number, string> = {
      1: 'lg:grid-cols-1',
      2: 'lg:grid-cols-2',
      3: 'lg:grid-cols-3',
      4: 'lg:grid-cols-4',
      5: 'lg:grid-cols-5',
      6: 'lg:grid-cols-6',
    }

    const xlMapping: Record<number, string> = {
      1: 'xl:grid-cols-1',
      2: 'xl:grid-cols-2',
      3: 'xl:grid-cols-3',
      4: 'xl:grid-cols-4',
      5: 'xl:grid-cols-5',
      6: 'xl:grid-cols-6',
    }

    const gapMapping: Record<number, string> = {
      1: 'gap-1',
      2: 'gap-2',
      3: 'gap-3',
      4: 'gap-4',
      5: 'gap-5',
      6: 'gap-6',
      7: 'gap-7',
      8: 'gap-8',
    }

    return [
      gapMapping[gap] || 'gap-6',
      cols.default && colMapping[cols.default],
      cols.sm && smMapping[cols.sm],
      cols.md && mdMapping[cols.md],
      cols.lg && lgMapping[cols.lg],
      cols.xl && xlMapping[cols.xl]
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
