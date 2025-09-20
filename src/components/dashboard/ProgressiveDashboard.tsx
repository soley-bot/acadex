/**
 * Progressive Dashboard Component
 * Week 2 Day 2: Advanced loading states and background sync
 */

'use client'

import React, { useMemo, useTransition } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatTimeSpent } from '@/lib/date-utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Award,
  RefreshCw,
  Wifi,
  WifiOff,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { 
  useProgressiveLoading,
  useBackgroundSyncStatus,
  useNetworkAwareOperations
} from '@/hooks/useProgressiveEnhancement'
import { 
  useSmartCacheInvalidation,
  useCacheHealthMonitoring,
  useBackgroundSync
} from '@/hooks/useAdvancedCaching'
import { AdaptiveSkeleton } from '@/components/ui/enhanced-skeletons'

interface DashboardStats {
  totalQuizzes: number
  completedQuizzes: number
  averageScore: number
  totalTimeSpent: number
  currentStreak: number
  bestCategory: string
  recentActivity: Array<{
    id: string
    type: 'quiz_completed' | 'lesson_viewed' | 'achievement_unlocked'
    title: string
    timestamp: string
    score?: number
  }>
}

interface ProgressiveDashboardProps {
  userId: string
}

export function ProgressiveDashboard({ userId }: ProgressiveDashboardProps) {
  const [isPending, startTransition] = useTransition()
  
  // Network status
  const { isOnline, isSlowConnection, queueOperation } = useNetworkAwareOperations()
  const { syncStatus, startSync, completeSync } = useBackgroundSyncStatus()
  
  // Dashboard data query with smart caching
  const { 
    data: dashboardData, 
    isLoading, 
    error,
    refetch,
    isFetching,
    dataUpdatedAt
  } = useQuery({
    queryKey: ['dashboard', userId],
    queryFn: async (): Promise<DashboardStats> => {
      const response = await fetch(`/api/dashboard/${userId}`)
      if (!response.ok) throw new Error('Failed to fetch dashboard data')
      return await response.json()
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: isOnline && !isSlowConnection ? 5 * 60 * 1000 : false, // 5 minutes if online
    refetchOnWindowFocus: true,
    retry: (failureCount, error) => {
      // Smart retry logic
      if (!isOnline) return false
      return failureCount < 3
    },
  })
  
  // Progressive loading states
  const { showSkeleton, showContent, fadeIn } = useProgressiveLoading(
    dashboardData,
    isLoading,
    !!error
  )
  
  // Manual refresh with optimistic updates
  const handleRefresh = async () => {
    startSync()
    startTransition(async () => {
      try {
        if (isOnline) {
          await refetch()
          completeSync(true)
        } else {
          // Queue for when back online
          queueOperation(() => refetch())
          completeSync(false)
        }
      } catch (error) {
        completeSync(false)
      }
    })
  }
  
  // Calculate completion percentage
  const completionPercentage = useMemo(() => {
    if (!dashboardData) return 0
    return Math.round((dashboardData.completedQuizzes / dashboardData.totalQuizzes) * 100)
  }, [dashboardData])
  
  // Get activity icon
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'quiz_completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'lesson_viewed':
        return <BarChart3 className="w-4 h-4 text-blue-500" />
      case 'achievement_unlocked':
        return <Award className="w-4 h-4 text-yellow-500" />
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />
    }
  }
  
  if (showSkeleton) {
    return <AdaptiveSkeleton type="dashboard" />
  }
  
  if (error) {
    return (
      <div className="text-center space-y-4 p-8">
        <AlertTriangle className="w-12 h-12 text-destructive mx-auto" />
        <h3 className="text-lg font-semibold">Unable to load dashboard</h3>
        <p className="text-muted-foreground">
          {!isOnline ? 'You appear to be offline' : 'Something went wrong'}
        </p>
        <Button onClick={handleRefresh} disabled={!isOnline}>
          <RefreshCw className={cn("w-4 h-4 mr-2", isPending && "animate-spin")} />
          Try Again
        </Button>
      </div>
    )
  }
  
  if (!showContent || !dashboardData) return null
  
  return (
    <div className={cn("space-y-6", fadeIn && "animate-in fade-in-0 duration-300")}>
      {/* Header with Status Indicators */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Track your learning progress
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Sync Status */}
          {syncStatus === 'syncing' && (
            <Badge variant="secondary" className="animate-pulse">
              <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
              Syncing
            </Badge>
          )}
          
          {/* Network Status */}
          <Badge variant={isOnline ? "default" : "destructive"}>
            {isOnline ? (
              <Wifi className="w-3 h-3 mr-1" />
            ) : (
              <WifiOff className="w-3 h-3 mr-1" />
            )}
            {isOnline ? (isSlowConnection ? 'Slow' : 'Online') : 'Offline'}
          </Badge>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isPending || (!isOnline && syncStatus !== 'idle')}
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", (isPending || isFetching) && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className={cn("transition-all duration-300", isPending && "opacity-70")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quizzes</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalQuizzes}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.completedQuizzes} completed
            </p>
          </CardContent>
        </Card>
        
        <Card className={cn("transition-all duration-300", isPending && "opacity-70")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.averageScore}%</div>
            <p className="text-xs text-muted-foreground">
              Across all quizzes
            </p>
          </CardContent>
        </Card>
        
        <Card className={cn("transition-all duration-300", isPending && "opacity-70")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Spent</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatTimeSpent(dashboardData.totalTimeSpent)}
            </div>
            <p className="text-xs text-muted-foreground">
              Learning time
            </p>
          </CardContent>
        </Card>
        
        <Card className={cn("transition-all duration-300", isPending && "opacity-70")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.currentStreak}</div>
            <p className="text-xs text-muted-foreground">
              Days in a row
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Progress Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Overall Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Completion Rate</span>
                <span>{completionPercentage}%</span>
              </div>
              <Progress value={completionPercentage} className="h-2" />
            </div>
            
            <div className="pt-2 border-t">
              <p className="text-sm text-muted-foreground">
                <strong>Best Category:</strong> {dashboardData.bestCategory}
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.recentActivity.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  {getActivityIcon(activity.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {activity.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleDateString()}
                      {activity.score && ` • ${activity.score}%`}
                    </p>
                  </div>
                </div>
              ))}
              
              {dashboardData.recentActivity.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent activity
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}