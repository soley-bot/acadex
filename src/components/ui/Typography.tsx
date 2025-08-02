import { ReactNode } from 'react'

interface SectionHeadingProps {
  children: ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg'
  color?: 'default' | 'white' | 'muted'
}

const headingSizes = {
  sm: 'text-2xl md:text-3xl',
  md: 'text-3xl md:text-4xl',
  lg: 'text-4xl md:text-5xl lg:text-6xl'
}

const headingColors = {
  default: 'text-gray-900',
  white: 'text-white',
  muted: 'text-gray-600'
}

export function SectionHeading({ 
  children, 
  className = '', 
  size = 'md',
  color = 'default' 
}: SectionHeadingProps) {
  const sizeClass = headingSizes[size]
  const colorClass = headingColors[color]
  
  return (
    <h2 className={`${sizeClass} font-black ${colorClass} tracking-tight ${className}`}>
      {children}
    </h2>
  )
}

interface HeroHeadingProps {
  children: ReactNode
  className?: string
}

export function HeroHeading({ children, className = '' }: HeroHeadingProps) {
  return (
    <h1 className={`text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight ${className}`}>
      {children}
    </h1>
  )
}

interface BadgeProps {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'white'
  className?: string
}

const badgeVariants = {
  primary: 'bg-red-50 text-red-600 border-red-200',
  secondary: 'bg-red-600 text-white border-red-600',
  white: 'bg-white text-gray-700 border-gray-200'
}

export function Badge({ children, variant = 'primary', className = '' }: BadgeProps) {
  const variantClass = badgeVariants[variant]
  
  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${variantClass} ${className}`}>
      {children}
    </div>
  )
}
