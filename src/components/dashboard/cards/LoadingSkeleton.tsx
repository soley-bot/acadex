'use client'

import React from 'react'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface LoadingSkeletonProps {
  className?: string
  variant?: 'card' | 'list' | 'stats' | 'table'
  count?: number
}

function SkeletonBase({ className }: { className?: string }) {
  return (
    <div className={cn(
      "animate-pulse bg-gray-200 dark:bg-gray-700 rounded",
      className
    )} />
  )
}

export function LoadingSkeleton({ 
  className, 
  variant = 'card', 
  count = 1 
}: LoadingSkeletonProps) {
  const renderSkeleton = () => {
    switch (variant) {
      case 'stats':
        return (
          <Card className={cn("p-6", className)}>
            <div className="flex items-center justify-between mb-4">
              <SkeletonBase className="h-4 w-24" />
              <SkeletonBase className="h-4 w-4 rounded-full" />
            </div>
            <SkeletonBase className="h-8 w-20 mb-2" />
            <SkeletonBase className="h-3 w-32" />
          </Card>
        )

      case 'list':
        return (
          <div className={cn("space-y-4", className)}>
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                <SkeletonBase className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <SkeletonBase className="h-4 w-3/4" />
                  <SkeletonBase className="h-3 w-1/2" />
                </div>
                <SkeletonBase className="h-8 w-20 rounded-md" />
              </div>
            ))}
          </div>
        )

      case 'table':
        return (
          <div className={cn("space-y-2", className)}>
            <div className="grid grid-cols-4 gap-4 p-4 border-b">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonBase key={i} className="h-4 w-full" />
              ))}
            </div>
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="grid grid-cols-4 gap-4 p-4">
                {Array.from({ length: 4 }).map((_, j) => (
                  <SkeletonBase key={j} className="h-4 w-full" />
                ))}
              </div>
            ))}
          </div>
        )

      default: // card
        return (
          <Card className={cn("p-6", className)}>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <SkeletonBase className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <SkeletonBase className="h-4 w-3/4" />
                  <SkeletonBase className="h-3 w-1/2" />
                </div>
              </div>
              <div className="space-y-2">
                <SkeletonBase className="h-3 w-full" />
                <SkeletonBase className="h-3 w-4/5" />
                <SkeletonBase className="h-3 w-3/5" />
              </div>
              <div className="flex justify-between">
                <SkeletonBase className="h-8 w-20 rounded-md" />
                <SkeletonBase className="h-8 w-16 rounded-md" />
              </div>
            </div>
          </Card>
        )
    }
  }

  if (variant === 'list' || variant === 'table' || count === 1) {
    return renderSkeleton()
  }

  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>{renderSkeleton()}</div>
      ))}
    </div>
  )
}