import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface ContainerProps {
  children: ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  center?: boolean
}

// Container max-widths following mobile-first approach
const containerSizes = {
  sm: 'max-w-2xl',      // 672px - For narrow content like articles
  md: 'max-w-4xl',      // 896px - For standard content
  lg: 'max-w-6xl',      // 1152px - For wide content
  xl: 'max-w-7xl',      // 1280px - For very wide content  
  full: 'max-w-none',   // No max width
}

// Responsive padding that scales with viewport
const containerPadding = {
  none: '',
  sm: 'px-4 sm:px-6',                    // 16px mobile, 24px tablet+
  md: 'px-4 sm:px-6 lg:px-8',          // 16px mobile, 24px tablet, 32px desktop
  lg: 'px-container-px',                 // Fluid padding using clamp
}

export function Container({
  children,
  className,
  size = 'lg',
  padding = 'md',
  center = true,
}: ContainerProps) {
  return (
    <div 
      className={cn(
        containerSizes[size],
        containerPadding[padding],
        center && 'mx-auto',
        'w-full',
        className
      )}
    >
      {children}
    </div>
  )
}

// Section wrapper with consistent vertical spacing
interface SectionProps {
  children: ReactNode
  className?: string
  spacing?: 'sm' | 'md' | 'lg'
  background?: 'transparent' | 'white' | 'glass' | 'gradient' | 'muted' | 'dark'
}

const sectionSpacing = {
  sm: 'py-section-sm',   // clamp(3rem, 6vw, 4rem)
  md: 'py-section-md',   // clamp(4rem, 8vw, 6rem)  
  lg: 'py-section-lg',   // clamp(6rem, 10vw, 8rem)
}

const sectionBackgrounds = {
  transparent: '',
  white: 'bg-white',
  glass: 'backdrop-blur-lg bg-white/80 border border-white/20 shadow-2xl',
  gradient: 'bg-gradient-to-br from-red-50 via-white to-orange-50',
  muted: 'bg-gray-50',
  dark: 'bg-gray-900',
}

export function Section({
  children,
  className,
  spacing = 'md',
  background = 'transparent',
}: SectionProps) {
  return (
    <section 
      className={cn(
        sectionSpacing[spacing],
        sectionBackgrounds[background],
        'relative w-full',
        className
      )}
    >
      {children}
    </section>
  )
}

// Grid component with responsive columns
interface GridProps {
  children: ReactNode
  className?: string
  cols?: 1 | 2 | 3 | 4 | 6 | 12
  gap?: 'sm' | 'md' | 'lg'
  responsive?: {
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
}

const gridCols = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
  12: 'grid-cols-12',
}

const gridGaps = {
  sm: 'gap-4',
  md: 'gap-6',
  lg: 'gap-8',
}

export function Grid({
  children,
  className,
  cols = 1,
  gap = 'md',
  responsive,
}: GridProps) {
  let gridClass = gridCols[cols]
  
  // Override with custom responsive classes if provided
  if (responsive) {
    gridClass = 'grid-cols-1'
    if (responsive.sm) gridClass += ` sm:grid-cols-${responsive.sm}`
    if (responsive.md) gridClass += ` md:grid-cols-${responsive.md}`
    if (responsive.lg) gridClass += ` lg:grid-cols-${responsive.lg}`
    if (responsive.xl) gridClass += ` xl:grid-cols-${responsive.xl}`
  }
  
  return (
    <div 
      className={cn(
        'grid',
        gridClass,
        gridGaps[gap],
        className
      )}
    >
      {children}
    </div>
  )
}

// Flex utilities for responsive layouts
interface FlexProps {
  children: ReactNode
  className?: string
  direction?: 'row' | 'col' | 'row-reverse' | 'col-reverse'
  wrap?: boolean
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly'
  align?: 'start' | 'end' | 'center' | 'stretch' | 'baseline'
  gap?: 'sm' | 'md' | 'lg'
  responsive?: {
    sm?: 'row' | 'col'
    md?: 'row' | 'col'
    lg?: 'row' | 'col'
  }
}

export function Flex({
  children,
  className,
  direction = 'row',
  wrap = false,
  justify = 'start',
  align = 'start',
  gap = 'md',
  responsive,
}: FlexProps) {
  const flexDirection = `flex-${direction}`
  const flexWrap = wrap ? 'flex-wrap' : 'flex-nowrap'
  const justifyContent = `justify-${justify}`
  const alignItems = `items-${align}`
  const flexGap = gridGaps[gap] // Reuse gap classes
  
  let responsiveClasses = ''
  if (responsive) {
    if (responsive.sm) responsiveClasses += ` sm:flex-${responsive.sm}`
    if (responsive.md) responsiveClasses += ` md:flex-${responsive.md}`
    if (responsive.lg) responsiveClasses += ` lg:flex-${responsive.lg}`
  }
  
  return (
    <div 
      className={cn(
        'flex',
        flexDirection,
        flexWrap,
        justifyContent,
        alignItems,
        flexGap,
        responsiveClasses,
        className
      )}
    >
      {children}
    </div>
  )
}
