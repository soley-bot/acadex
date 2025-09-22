/**
 * Enhanced Skeleton Loaders
 * Week 2 Day 2: Progressive loading with adaptive skeletons
 */

import React from 'react'
import { cn } from '@/lib/utils'

// ==============================================
// BASE SKELETON COMPONENTS
// ==============================================

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  animate?: boolean
  variant?: 'pulse' | 'wave' | 'shimmer'
}

export function Skeleton({ 
  className, 
  animate = true, 
  variant = 'shimmer',
  ...props 
}: SkeletonProps) {
  const animations = {
    pulse: 'animate-pulse',
    wave: 'animate-wave',
    shimmer: 'animate-shimmer',
  }
  
  return (
    <div
      className={cn(
        'bg-muted rounded-md',
        animate && animations[variant],
        className
      )}
      {...props}
    />
  )
}

// ==============================================
// QUIZ-SPECIFIC SKELETONS
// ==============================================

export function QuizCardSkeleton({ count = 1 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border rounded-lg p-6 space-y-4 bg-card">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-8 w-20 rounded-full" />
          </div>
          
          {/* Description */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          
          {/* Stats */}
          <div className="flex justify-between items-center pt-4">
            <div className="flex space-x-4">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-9 w-24 rounded-md" />
          </div>
        </div>
      ))}
    </>
  )
}

export function QuizQuestionSkeleton() {
  return (
    <div className="space-y-6">
      {/* Question Header */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-32" /> {/* Question 1 of 10 */}
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-6 w-3/4" />
      </div>
      
      {/* Options */}
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-3 p-4 border rounded-lg">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-5 w-full" />
          </div>
        ))}
      </div>
      
      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Skeleton className="h-10 w-20 rounded-md" />
        <Skeleton className="h-10 w-20 rounded-md" />
      </div>
    </div>
  )
}

export function QuizResultsSkeleton() {
  return (
    <div className="space-y-8">
      {/* Score Circle */}
      <div className="flex justify-center">
        <Skeleton className="h-32 w-32 rounded-full" />
      </div>
      
      {/* Score Text */}
      <div className="text-center space-y-2">
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-5 w-64 mx-auto" />
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="text-center p-4 border rounded-lg">
            <Skeleton className="h-8 w-12 mx-auto mb-2" />
            <Skeleton className="h-4 w-20 mx-auto" />
          </div>
        ))}
      </div>
      
      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <Skeleton className="h-10 w-24 rounded-md" />
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>
    </div>
  )
}

// ==============================================
// DASHBOARD SKELETONS
// ==============================================

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-5 w-48" />
        </div>
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-6 w-6 rounded-md" />
            </div>
            <Skeleton className="h-8 w-16 mt-3" />
            <Skeleton className="h-4 w-24 mt-2" />
          </div>
        ))}
      </div>
      
      {/* Recent Activity */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />
        <div className="border rounded-lg divide-y">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-4 flex items-center space-x-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-8 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ==============================================
// ADAPTIVE SKELETON LOADER
// ==============================================

interface AdaptiveSkeletonProps {
  type: 'quiz-card' | 'quiz-question' | 'quiz-results' | 'dashboard' | 'list' | 'table'
  count?: number
  variant?: 'pulse' | 'wave' | 'shimmer'
  className?: string
}

export function AdaptiveSkeleton({ 
  type, 
  count = 1, 
  variant = 'shimmer',
  className 
}: AdaptiveSkeletonProps) {
  const skeletonComponents = {
    'quiz-card': () => <QuizCardSkeleton count={count} />,
    'quiz-question': () => <QuizQuestionSkeleton />,
    'quiz-results': () => <QuizResultsSkeleton />,
    'dashboard': () => <DashboardSkeleton />,
    'list': () => <ListSkeleton count={count} variant={variant} />,
    'table': () => <TableSkeleton rows={count} variant={variant} />,
  }
  
  const SkeletonComponent = skeletonComponents[type]
  
  return (
    <div className={cn('animate-in fade-in-0 duration-200', className)}>
      <SkeletonComponent />
    </div>
  )
}

// ==============================================
// GENERIC SKELETONS
// ==============================================

function ListSkeleton({ count, variant }: { count: number; variant: 'pulse' | 'wave' | 'shimmer' }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
          <Skeleton className="h-12 w-12 rounded-full" variant={variant} />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" variant={variant} />
            <Skeleton className="h-3 w-1/2" variant={variant} />
          </div>
          <Skeleton className="h-8 w-20 rounded-md" variant={variant} />
        </div>
      ))}
    </div>
  )
}

function TableSkeleton({ rows, variant }: { rows: number; variant: 'pulse' | 'wave' | 'shimmer' }) {
  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b bg-muted/50 flex space-x-4">
        <Skeleton className="h-4 w-32" variant={variant} />
        <Skeleton className="h-4 w-24" variant={variant} />
        <Skeleton className="h-4 w-20" variant={variant} />
        <Skeleton className="h-4 w-16" variant={variant} />
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 border-b last:border-b-0 flex space-x-4">
          <Skeleton className="h-4 w-32" variant={variant} />
          <Skeleton className="h-4 w-24" variant={variant} />
          <Skeleton className="h-4 w-20" variant={variant} />
          <Skeleton className="h-4 w-16" variant={variant} />
        </div>
      ))}
    </div>
  )
}