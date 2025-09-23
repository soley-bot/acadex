'use client'

import React, { useRef, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

// Lightweight animation components using CSS instead of framer-motion
interface AnimatedDivProps {
  children: React.ReactNode
  className?: string
  variant?: 'fadeInUp' | 'fadeIn' | 'scaleIn' | 'slideInLeft' | 'slideInRight'
  delay?: number
  once?: boolean
}

// Static animation class mappings - no recreation on renders
const animationClasses = {
  fadeInUp: 'animate-[slideUp_0.4s_ease-out_forwards]',
  fadeIn: 'animate-[fadeIn_0.4s_ease-out_forwards]',
  scaleIn: 'animate-[scaleIn_0.4s_ease-out_forwards]',
  slideInLeft: 'animate-[slideUp_0.4s_ease-out_forwards] translate-x-[-20px]',
  slideInRight: 'animate-[slideUp_0.4s_ease-out_forwards] translate-x-[20px]'
}

export function AnimatedDiv({ 
  children, 
  className = '', 
  variant = 'fadeInUp', 
  delay = 0,
  once = true 
}: AnimatedDivProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && (!hasAnimated || !once)) {
          setTimeout(() => setIsVisible(true), delay)
          if (once) setHasAnimated(true)
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [delay, once, hasAnimated])

  return (
    <div
      ref={ref}
      className={cn(
        'opacity-0', // Start hidden
        isVisible && animationClasses[variant],
        className
      )}
    >
      {children}
    </div>
  )
}

// Optimized stagger container using CSS
interface StaggerContainerProps {
  children: React.ReactNode
  className?: string
  once?: boolean
}

export function StaggerContainer({ children, className = '', once = true }: StaggerContainerProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={cn(
        'stagger-container',
        className,
        isVisible && 'stagger-animate'
      )}
    >
      {children}
    </div>
  )
}

// Individual stagger items - now just a simple wrapper
interface StaggerItemProps {
  children: React.ReactNode
  className?: string
}

export function StaggerItem({ children, className = '' }: StaggerItemProps) {
  return (
    <div className={cn('opacity-0', className)}>
      {children}
    </div>
  )
}

// Lightweight floating element using CSS
export function FloatingElement({ 
  children, 
  className = '',
  intensity = 'medium' 
}: { 
  children: React.ReactNode
  className?: string
  intensity?: 'subtle' | 'medium' | 'strong'
}) {
  const animationClass = intensity === 'subtle' 
    ? 'hover:translate-y-[-2px]' 
    : intensity === 'strong' 
    ? 'hover:translate-y-[-6px]' 
    : 'hover:translate-y-[-4px]'

  return (
    <div className={cn('transition-transform duration-300 ease-out', animationClass, className)}>
      {children}
    </div>
  )
}

// Simple hover scale using CSS transforms
export function HoverScale({ 
  children, 
  className = '',
  scale = 1.02 
}: { 
  children: React.ReactNode
  className?: string
  scale?: number
}) {
  const scaleClass = scale === 1.05 ? 'hover:scale-105' : scale === 1.03 ? 'hover:scale-[1.03]' : 'hover:scale-[1.02]'
  
  return (
    <div className={cn('transition-transform duration-150 active:scale-[0.98]', scaleClass, className)}>
      {children}
    </div>
  )
}

// Simple magnetic hover with CSS
export function MagneticHover({ 
  children, 
  className = '',
  strength = 8 
}: { 
  children: React.ReactNode
  className?: string
  strength?: number
}) {
  return (
    <div className={cn('transition-transform duration-200 hover:translate-y-[-2px] hover:shadow-lg', className)}>
      {children}
    </div>
  )
}