import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

// Card variant styles following the design system
export const cardVariants = {
  // Base card - minimal styling with semantic colors
  base: "surface-primary border border-subtle rounded-xl transition-all duration-300",
  
  // Elevated card - subtle shadow and hover effect
  elevated: "surface-primary border border-subtle rounded-xl shadow-md hover:shadow-lg transition-all duration-300", 
  
  // Interactive card - hover effects for clickable cards  
  interactive: "surface-primary border border-subtle rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer",
  
  // Glass card - for hero/landing sections (maintaining existing glass effect)
  glass: "backdrop-blur-lg bg-white/80 border border-white/20 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
}

// Consistent size system
export const cardSizes = {
  sm: "p-4",      // Small cards like stats
  md: "p-6",      // Standard cards like course listings  
  lg: "p-8",      // Large cards like course details
  xl: "p-10"      // Hero cards
}

// New unified card component - doesn't replace existing Card
export function UnifiedCard({ 
  children, 
  variant = 'base',
  size = 'md',
  className = '',
  onClick,
  ...props 
}: {
  children: ReactNode
  variant?: keyof typeof cardVariants
  size?: keyof typeof cardSizes  
  className?: string
  onClick?: () => void
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={cn(cardVariants[variant], cardSizes[size], className)}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  )
}

// Utility function to get variant classes (for existing components)
export function getCardVariantClasses(variant: keyof typeof cardVariants, size: keyof typeof cardSizes = 'md') {
  return cn(cardVariants[variant], cardSizes[size])
}

// Background variants for containers/sections
export const backgroundVariants = {
  default: "bg-background",
  muted: "bg-muted/50", 
  accent: "bg-gradient-to-br from-primary/5 via-background to-secondary/5",
  hero: "bg-gradient-to-br from-primary/10 via-white to-secondary/10"
}

// Grid patterns for consistent layouts
export const gridVariants = {
  courses: "grid md:grid-cols-2 lg:grid-cols-3 gap-6",
  features: "grid md:grid-cols-2 lg:grid-cols-3 gap-8", 
  stats: "grid grid-cols-2 md:grid-cols-4 gap-4",
  auto: "grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6"
}
