'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const progressVariants = cva(
  'relative w-full overflow-hidden rounded-full transition-all duration-300',
  {
    variants: {
      size: {
        sm: 'h-1.5',
        default: 'h-2.5',
        lg: 'h-4',
      },
      variant: {
        default: 'bg-muted',
        accent: 'bg-muted',
        success: 'bg-muted',
        brand: 'bg-muted',
      },
    },
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
  }
)

const progressIndicatorVariants = cva(
  'h-full w-full flex-1 transition-all duration-500 ease-out rounded-full',
  {
    variants: {
      variant: {
        default: 'bg-primary',
        accent: 'bg-primary',
        success: 'bg-success',
        brand: 'bg-brand',
        gradient: 'bg-gradient-to-r from-primary to-primary/80',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

interface ProgressProps extends VariantProps<typeof progressVariants> {
  value: number
  max?: number
  className?: string
  indicatorVariant?: VariantProps<typeof progressIndicatorVariants>['variant']
  showLabel?: boolean
}

export const Progress: React.FC<ProgressProps> = ({ 
  value, 
  max = 100, 
  size,
  variant,
  indicatorVariant = 'default',
  className,
  showLabel = false
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
  
  return (
    <div className="flex items-center gap-3 w-full">
      <div className={cn(progressVariants({ size, variant }), className)}>
        <div
          className={cn(progressIndicatorVariants({ variant: indicatorVariant }))}
          style={{ transform: `translateX(-${100 - percentage}%)` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-gray-600 whitespace-nowrap">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  )
}
