"use client"

import * as React from "react"

interface AnimatedDivProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  variant?: 'fadeInUp' | 'slideInRight' | 'scaleIn' | 'fadeIn'
  delay?: number
}

const AnimatedDiv = React.forwardRef<HTMLDivElement, AnimatedDivProps>(
  ({ children, className = "", variant, delay, ...props }, ref) => (
    <div 
      ref={ref} 
      className={`transition-all duration-300 ${className}`} 
      style={{ transitionDelay: delay ? `${delay}s` : undefined }}
      {...props}
    >
      {children}
    </div>
  )
)

interface StaggerContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const StaggerContainer = React.forwardRef<HTMLDivElement, StaggerContainerProps>(
  ({ children, className = "", ...props }, ref) => (
    <div ref={ref} className={`space-y-4 ${className}`} {...props}>
      {children}
    </div>
  )
)

interface StaggerItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const StaggerItem = React.forwardRef<HTMLDivElement, StaggerItemProps>(
  ({ children, className = "", ...props }, ref) => (
    <div 
      ref={ref} 
      className={`transition-all duration-300 ease-out ${className}`} 
      {...props}
    >
      {children}
    </div>
  )
)

interface HoverScaleProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  scale?: number
}

const HoverScale = React.forwardRef<HTMLDivElement, HoverScaleProps>(
  ({ children, className = "", scale = 1.05, ...props }, ref) => {
    return (
      <div 
        ref={ref} 
        className={`transition-all duration-200 hover:brightness-105 ${className}`}
        {...props}
      >
        {children}
      </div>
    )
  }
)

AnimatedDiv.displayName = "AnimatedDiv"
StaggerContainer.displayName = "StaggerContainer"
StaggerItem.displayName = "StaggerItem"
HoverScale.displayName = "HoverScale"

export { AnimatedDiv, StaggerContainer, StaggerItem, HoverScale }
