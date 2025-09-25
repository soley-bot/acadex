'use client'

import React from 'react'
import { BookOpen, Clock, Trophy, TrendingUp, Users, Target } from 'lucide-react'
import { StatContainer } from './containers/StatContainer'
import { DashboardGrid } from './DashboardGrid'
import { UserStats } from '@/types/dashboard'

interface DashboardStatsProps {
  stats: UserStats
  className?: string
  compact?: boolean
}

export function DashboardStats({ stats, className, compact = false }: DashboardStatsProps) {
  const statsConfig = [
    {
      title: 'Active Courses',
      value: stats.active_courses,
      description: 'Currently enrolled',
      icon: BookOpen,
      variant: 'default' as const
    },
    {
      title: 'Completed Courses',
      value: stats.completed_courses,
      description: 'Successfully finished',
      icon: Trophy,
      variant: 'success' as const
    },
    {
      title: 'Quizzes Taken',
      value: stats.total_quizzes,
      description: 'All attempts',
      icon: Target,
      variant: 'default' as const
    },
    {
      title: 'Average Score',
      value: stats.average_score ? `${Math.round(stats.average_score)}%` : 'N/A',
      description: 'Quiz performance',
      icon: TrendingUp,
      variant: (stats.average_score && stats.average_score >= 80 ? 'success' : 
               stats.average_score && stats.average_score >= 60 ? 'warning' : 'error') as 'success' | 'warning' | 'error',
      trend: stats.score_trend ? {
        value: Math.round(stats.score_trend),
        isPositive: stats.score_trend > 0,
        label: 'vs last month'
      } : undefined
    },
    {
      title: 'Study Time',
      value: stats.total_study_time ? `${Math.round(stats.total_study_time / 60)}h` : '0h',
      description: 'Hours spent learning',
      icon: Clock,
      variant: 'default' as const
    },
    {
      title: 'Streak',
      value: `${stats.current_streak || 0} days`,
      description: 'Current learning streak',
      icon: Users,
      variant: (stats.current_streak && stats.current_streak >= 7 ? 'success' : 'default') as 'success' | 'default',
    }
  ]

  return (
    <DashboardGrid 
      className={className}
      cols={{ 
        default: compact ? 2 : 1, 
        sm: compact ? 3 : 2, 
        lg: compact ? 6 : 3, 
        xl: 6 
      }}
      gap={compact ? 3 : 4}
    >
      {statsConfig.map((stat, index) => (
        <StatContainer
          key={index}
          title={stat.title}
          value={stat.value}
          description={stat.description}
          icon={stat.icon}
          variant={stat.variant}
          trend={stat.trend}
          size={compact ? 'xs' : 'sm'}
        />
      ))}
    </DashboardGrid>
  )
}
