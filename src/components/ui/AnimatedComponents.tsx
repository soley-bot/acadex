// Simple animation components using CSS transitions
// Replacement for complex animation library

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface AnimatedDivProps {
  children: ReactNode
  className?: string
  variant?: 'fadeIn' | 'fadeInUp' | 'fadeInDown' | 'slideInLeft' | 'slideInRight' | 'scale' | 'scaleIn'
  delay?: number
}

export function AnimatedDiv({
  children,
  className,
  variant = 'fadeIn',
  delay = 0
}: AnimatedDivProps) {
  const animations = {
    fadeIn: 'animate-fade-in',
    fadeInUp: 'animate-fade-in-up',
    fadeInDown: 'animate-fade-in-down',
    slideInLeft: 'animate-slide-in-left',
    slideInRight: 'animate-slide-in-right',
    scale: 'animate-scale',
    scaleIn: 'animate-scale'
  }

  return (
    <div
      className={cn(animations[variant], className)}
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </div>
  )
}

interface StaggerContainerProps {
  children: ReactNode
  className?: string
}

export function StaggerContainer({ children, className }: StaggerContainerProps) {
  return <div className={className}>{children}</div>
}

interface StaggerItemProps {
  children: ReactNode
  className?: string
}

export function StaggerItem({ children, className }: StaggerItemProps) {
  return <div className={className}>{children}</div>
}

interface HoverScaleProps {
  children: ReactNode
  className?: string
  scale?: number
}

export function HoverScale({ children, className, scale = 1.05 }: HoverScaleProps) {
  const scaleValue = scale === 1.05 ? 'scale-105' : `scale-[${scale}]`

  return (
    <div className={cn(`transition-transform duration-200 hover:${scaleValue}`, className)}>
      {children}
    </div>
  )
}
