/**
 * Reusable Statistics Cards Component
 * Eliminates duplicate Card patterns for dashboard statistics display
 * Now using ShadCN UI components for better design
 * 
 * Replaces 4+ duplicate Card variant='interactive' patterns with single component
 */

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export interface StatCardData {
  id: string
  label: string
  value: number | string
  description: string
  icon: React.ComponentType<{ size?: string | number }>
  colorTheme: 'blue' | 'green' | 'orange' | 'violet' | 'red'
  trend?: {
    value: number
    isPositive: boolean
    label: string
  }
}

interface StatsCardsProps {
  stats: StatCardData[]
  className?: string
}

const getThemeColors = (theme: string) => {
  const colors = {
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    green: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300', 
    orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    violet: 'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300',
    red: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
  }
  return colors[theme as keyof typeof colors] || colors.blue
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  stats,
  className = ""
}) => {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      {stats.map(({ id, label, value, description, icon: Icon, colorTheme, trend }) => (
        <Card key={id} className="cursor-pointer hover:shadow-lg transition-all duration-200 border">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {label}
                  </p>
                  <p className="text-2xl font-bold">
                    {value}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {description}
                  </p>
                </div>
                
                <div className={cn(
                  "p-2 rounded-lg",
                  getThemeColors(colorTheme)
                )}>
                  <Icon size={24} />
                </div>
              </div>

              {trend && (
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={trend.isPositive ? "secondary" : "destructive"}
                    className="text-xs"
                  >
                    {trend.isPositive ? '+' : ''}{trend.value}%
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    {trend.label}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
