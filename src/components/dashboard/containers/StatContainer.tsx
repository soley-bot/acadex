'use client'

import React from 'react'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'

interface StatContainerProps {
  title: string
  value: string | number
  description?: string
  icon?: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
    label: string
  }
  className?: string
  variant?: 'default' | 'success' | 'warning' | 'error'
  size?: 'xs' | 'sm' | 'md'
}

export function StatContainer({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
  variant = 'default',
  size = 'sm'
}: StatContainerProps) {
  return (
    <div className={cn("stat-card", className)}>
      {/* Header with title and icon */}
      <div className="stat-card-header">
        <h3 className="stat-card-title">
          {title}
        </h3>
        {Icon && (
          <div className="stat-card-icon">
            <Icon className={cn("h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6", `stat-card-icon-${variant}`)} />
          </div>
        )}
      </div>

      {/* Main value */}
      <div className="stat-card-value">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>

      {/* Description and trend - Clean mobile-first design */}
      {(description || trend) && (
        <div className="stat-card-footer">
          {description && (
            <p className="stat-card-description">
              {description}
            </p>
          )}
          {trend && (
            <div className="stat-card-trend">
              {/* Trend percentage - prominent and clean */}
              <div className={trend.isPositive ? "stat-card-trend-positive" : "stat-card-trend-negative"}>
                {trend.isPositive ? "+" : ""}{trend.value}%
              </div>
              {/* Trend label - subtle and clean */}
              <div className="stat-card-trend-label">
                {trend.label}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}