import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

// Typography variants for consistent design system
const typographyVariants = {
  // Display headings - for hero sections and main titles
  'display-xl': 'text-display-xl font-black tracking-tight text-gray-900',
  'display-lg': 'text-display-lg font-bold tracking-tight text-gray-900', 
  'display-md': 'text-display-md font-bold tracking-tight text-gray-900',
  'display-sm': 'text-display-sm font-bold tracking-tight text-gray-900',
  
  // Standard headings - for sections and subsections
  'h1': 'text-4xl md:text-5xl font-bold text-gray-900 tracking-tight',
  'h2': 'text-3xl md:text-4xl font-bold text-gray-900 tracking-tight',
  'h3': 'text-2xl md:text-3xl font-semibold text-gray-900 tracking-tight',
  'h4': 'text-xl md:text-2xl font-semibold text-gray-900',
  'h5': 'text-lg md:text-xl font-semibold text-gray-900',
  'h6': 'text-base md:text-lg font-semibold text-gray-900',
  
  // Body text variants
  'body-lg': 'text-body-lg text-gray-700 leading-relaxed',
  'body-md': 'text-body-md text-gray-700 leading-relaxed', 
  'body-sm': 'text-body-sm text-gray-600 leading-relaxed',
  
  // Special text variants
  'lead': 'text-xl md:text-2xl text-gray-600 font-medium leading-relaxed',
  'caption': 'text-sm text-gray-500 font-medium',
  'overline': 'text-xs uppercase tracking-wider text-gray-500 font-semibold',
  
  // Interactive text
  'link': 'text-red-600 hover:text-red-700 font-medium underline decoration-2 underline-offset-2 transition-colors',
  'button-text': 'font-semibold leading-none',
  
  // Status text
  'success': 'text-green-700 font-medium',
  'warning': 'text-yellow-700 font-medium', 
  'error': 'text-red-700 font-medium',
  'info': 'text-blue-700 font-medium',
}

// Color variants for different contexts
const colorVariants = {
  'primary': 'text-gray-900',
  'secondary': 'text-gray-700', 
  'muted': 'text-gray-600',
  'muted-light': 'text-gray-300', // Better for dark backgrounds
  'subtle': 'text-gray-500',
  'white': 'text-white',
  'gradient': 'bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent',
  'success': 'text-green-700',
  'warning': 'text-yellow-700',
  'error': 'text-red-700',
  'info': 'text-blue-700',
}

interface TypographyProps {
  variant?: keyof typeof typographyVariants
  color?: keyof typeof colorVariants
  className?: string
  children: ReactNode
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div'
}

export function Typography({
  variant = 'body-md',
  color,
  className,
  children,
  as: Component = 'p',
  ...props
}: TypographyProps) {
  const baseClasses = typographyVariants[variant]
  const colorClasses = color ? colorVariants[color] : ''
  
  return (
    <Component 
      className={cn(baseClasses, colorClasses, className)}
      {...props}
    >
      {children}
    </Component>
  )
}

// Updated legacy components to use new system
interface SectionHeadingProps {
  children: ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg'
  color?: 'default' | 'white' | 'muted'
}

export function SectionHeading({ 
  children, 
  className = '', 
  size = 'md',
  color = 'default' 
}: SectionHeadingProps) {
  const variant = size === 'sm' ? 'h3' : size === 'lg' ? 'h1' : 'h2'
  const colorMap = {
    default: 'primary',
    white: 'white',
    muted: 'muted'
  } as const
  
  return (
    <Typography 
      variant={variant}
      color={colorMap[color]}
      as="h2"
      className={className}
    >
      {children}
    </Typography>
  )
}

export function HeroHeading({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <Typography 
      variant="display-lg"
      as="h1"
      className={className}
    >
      {children}
    </Typography>
  )
}

// Convenience components for common patterns
export function DisplayHeading({ children, className, ...props }: Omit<TypographyProps, 'variant'>) {
  return (
    <Typography 
      variant="display-lg" 
      as="h1" 
      className={cn('mb-6', className)}
      {...props}
    >
      {children}
    </Typography>
  )
}

export function SubsectionHeading({ children, className, ...props }: Omit<TypographyProps, 'variant'>) {
  return (
    <Typography 
      variant="h3" 
      as="h3" 
      className={cn('mb-3', className)}
      {...props}
    >
      {children}
    </Typography>
  )
}

export function BodyText({ children, className, ...props }: Omit<TypographyProps, 'variant'>) {
  return (
    <Typography 
      variant="body-md" 
      as="p" 
      className={cn('mb-4', className)}
      {...props}
    >
      {children}
    </Typography>
  )
}

export function Lead({ children, className, ...props }: Omit<TypographyProps, 'variant'>) {
  return (
    <Typography 
      variant="lead" 
      as="p" 
      className={cn('mb-6', className)}
      {...props}
    >
      {children}
    </Typography>
  )
}

// Display components for hero sections
export function DisplayXL({ children, className, ...props }: Omit<TypographyProps, 'variant'>) {
  return (
    <Typography 
      variant="display-xl" 
      as="h1" 
      className={className}
      {...props}
    >
      {children}
    </Typography>
  )
}

export function DisplayLG({ children, className, ...props }: Omit<TypographyProps, 'variant'>) {
  return (
    <Typography 
      variant="display-lg" 
      as="h1" 
      className={className}
      {...props}
    >
      {children}
    </Typography>
  )
}

export function DisplayMD({ children, className, ...props }: Omit<TypographyProps, 'variant'>) {
  return (
    <Typography 
      variant="display-md" 
      as="h2" 
      className={className}
      {...props}
    >
      {children}
    </Typography>
  )
}

// Standard heading components
export function H1({ children, className, ...props }: Omit<TypographyProps, 'variant'>) {
  return (
    <Typography 
      variant="h1" 
      as="h1" 
      className={className}
      {...props}
    >
      {children}
    </Typography>
  )
}

export function H2({ children, className, ...props }: Omit<TypographyProps, 'variant'>) {
  return (
    <Typography 
      variant="h2" 
      as="h2" 
      className={className}
      {...props}
    >
      {children}
    </Typography>
  )
}

export function H3({ children, className, ...props }: Omit<TypographyProps, 'variant'>) {
  return (
    <Typography 
      variant="h3" 
      as="h3" 
      className={className}
      {...props}
    >
      {children}
    </Typography>
  )
}

export function H4({ children, className, ...props }: Omit<TypographyProps, 'variant'>) {
  return (
    <Typography 
      variant="h4" 
      as="h4" 
      className={className}
      {...props}
    >
      {children}
    </Typography>
  )
}

export function H5({ children, className, ...props }: Omit<TypographyProps, 'variant'>) {
  return (
    <Typography 
      variant="h5" 
      as="h5" 
      className={className}
      {...props}
    >
      {children}
    </Typography>
  )
}

export function H6({ children, className, ...props }: Omit<TypographyProps, 'variant'>) {
  return (
    <Typography 
      variant="h6" 
      as="h6" 
      className={className}
      {...props}
    >
      {children}
    </Typography>
  )
}

// Body text components
export function BodyLG({ children, className, ...props }: Omit<TypographyProps, 'variant'>) {
  return (
    <Typography 
      variant="body-lg" 
      as="p" 
      className={className}
      {...props}
    >
      {children}
    </Typography>
  )
}

export function BodyMD({ children, className, ...props }: Omit<TypographyProps, 'variant'>) {
  return (
    <Typography 
      variant="body-md" 
      as="p" 
      className={className}
      {...props}
    >
      {children}
    </Typography>
  )
}

export function BodySM({ children, className, ...props }: Omit<TypographyProps, 'variant'>) {
  return (
    <Typography 
      variant="body-sm" 
      as="p" 
      className={className}
      {...props}
    >
      {children}
    </Typography>
  )
}

// Updated Badge component
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
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${variantClass} ${className}`}>
      {children}
    </div>
  )
}
