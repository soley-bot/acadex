'use client'

import React from 'react'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
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
}

const variantStyles = {
  default: 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
  success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
  warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
  error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
}

const iconStyles = {
  default: 'text-gray-600 dark:text-gray-400',
  success: 'text-green-600 dark:text-green-400',
  warning: 'text-yellow-600 dark:text-yellow-400',
  error: 'text-red-600 dark:text-red-400'
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
  variant = 'default'
}: StatsCardProps) {
  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md",
      variantStyles[variant],
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </h3>
        {Icon && (
          <Icon className={cn("h-4 w-4", iconStyles[variant])} />
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {(description || trend) && (
            <div className="flex items-center justify-between text-xs">
              {description && (
                <p className="text-gray-500 dark:text-gray-400">
                  {description}
                </p>
              )}
              {trend && (
                <p className={cn(
                  "font-medium",
                  trend.isPositive ? "text-green-600" : "text-red-600"
                )}>
                  {trend.isPositive ? "+" : ""}{trend.value}% {trend.label}
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}