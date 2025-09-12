'use client'

import React from 'react'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

// Simple, performance-optimized animation components
interface AnimatedDivProps {
  children: React.ReactNode
  className?: string
  variant?: 'fadeInUp' | 'fadeIn' | 'scaleIn' | 'slideInLeft' | 'slideInRight'
  delay?: number
  once?: boolean
}

export function AnimatedDiv({ 
  children, 
  className = '', 
  variant = 'fadeInUp', 
  delay = 0,
  once = true 
}: AnimatedDivProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once, amount: 0.1, margin: "0px 0px -50px 0px" })

  // Simplified animation variants for better performance
  const getVariantProps = (variant: string) => {
    const baseDelay = delay
    const baseDuration = 0.4 // Reduced from 0.6

    switch (variant) {
      case 'fadeIn':
        return {
          initial: { opacity: 0 },
          animate: isInView ? { opacity: 1 } : { opacity: 0 },
          transition: { duration: baseDuration, delay: baseDelay }
        }
      case 'scaleIn':
        return {
          initial: { opacity: 0, scale: 0.95 },
          animate: isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 },
          transition: { duration: baseDuration, delay: baseDelay }
        }
      case 'slideInLeft':
        return {
          initial: { opacity: 0, x: -30 },
          animate: isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 },
          transition: { duration: baseDuration, delay: baseDelay }
        }
      case 'slideInRight':
        return {
          initial: { opacity: 0, x: 30 },
          animate: isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 },
          transition: { duration: baseDuration, delay: baseDelay }
        }
      default: // fadeInUp
        return {
          initial: { opacity: 0, y: 20 },
          animate: isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 },
          transition: { duration: baseDuration, delay: baseDelay }
        }
    }
  }

  const props = getVariantProps(variant)

  return (
    <motion.div
      ref={ref}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Optimized stagger container
interface StaggerContainerProps {
  children: React.ReactNode
  className?: string
  once?: boolean
}

export function StaggerContainer({ children, className = '', once = true }: StaggerContainerProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once, amount: 0.1, margin: "0px 0px -50px 0px" })

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.05, // Faster stagger
            delayChildren: 0.05
          }
        }
      }}
    >
      {children}
    </motion.div>
  )
}

// Individual stagger items
interface StaggerItemProps {
  children: React.ReactNode
  className?: string
}

export function StaggerItem({ children, className = '' }: StaggerItemProps) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 15 },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: { duration: 0.3 }
        }
      }}
    >
      {children}
    </motion.div>
  )
}

// Lightweight floating element
export function FloatingElement({ 
  children, 
  className = '',
  intensity = 'medium' 
}: { 
  children: React.ReactNode
  className?: string
  intensity?: 'subtle' | 'medium' | 'strong'
}) {
  // Use CSS animation for better performance
  return (
    <div className={`${className} animate-gentle-float`}>
      {children}
    </div>
  )
}

// Optimized hover scale
export function HoverScale({ 
  children, 
  className = '',
  scale = 1.02 
}: { 
  children: React.ReactNode
  className?: string
  scale?: number
}) {
  return (
    <motion.div
      className={className}
      whileHover={{ scale }}
      whileTap={{ scale: scale - 0.01 }}
      transition={{ duration: 0.15 }}
    >
      {children}
    </motion.div>
  )
}

// Simple magnetic hover with CSS fallback
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
    <div className={`${className} hover-lift`}>
      {children}
    </div>
  )
}