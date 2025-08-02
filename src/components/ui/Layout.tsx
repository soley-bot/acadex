import { ReactNode } from 'react'

interface ContainerProps {
  children: ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const containerSizes = {
  sm: 'max-w-4xl',
  md: 'max-w-6xl', 
  lg: 'max-w-7xl',
  xl: 'max-w-8xl'
}

export function Container({ children, className = '', size = 'md' }: ContainerProps) {
  const sizeClass = containerSizes[size]
  return (
    <div className={`${sizeClass} mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  )
}

interface SectionProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'muted' | 'dark'
  spacing?: 'sm' | 'md' | 'lg'
}

const sectionVariants = {
  default: 'bg-white',
  muted: 'bg-gray-50',
  dark: 'bg-gray-900'
}

const sectionSpacing = {
  sm: 'py-8 md:py-12',
  md: 'py-12 md:py-20',
  lg: 'py-16 md:py-24'
}

export function Section({ children, className = '', variant = 'default', spacing = 'md' }: SectionProps) {
  const variantClass = sectionVariants[variant]
  const spacingClass = sectionSpacing[spacing]
  
  return (
    <section className={`relative ${spacingClass} ${variantClass} ${className}`}>
      {children}
    </section>
  )
}
