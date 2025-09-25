import * as React from "react"

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className = "", size = 'xl', ...props }, ref) => {
    const sizeClasses = {
      sm: 'max-w-sm',
      md: 'max-w-4xl',
      lg: 'max-w-6xl', 
      xl: 'max-w-7xl',
      full: 'max-w-full'
    }

    return (
      <div
        ref={ref}
        className={`mx-auto px-4 sm:px-6 lg:px-8 ${sizeClasses[size]} ${className}`}
        {...props}
      />
    )
  }
)

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  background?: 'default' | 'gradient' | 'gray'
}

const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ className = "", background = 'default', ...props }, ref) => {
    const backgroundClasses = {
      default: 'bg-white',
      gradient: 'bg-gradient-to-br from-blue-50 to-indigo-100',
      gray: 'bg-gray-50'
    }

    return (
      <section
        ref={ref}
        className={`py-12 ${backgroundClasses[background]} ${className}`}
        {...props}
      />
    )
  }
)

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4 | 5 | 6
}

const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ className = "", cols = 1, ...props }, ref) => {
    const colClasses = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
      5: 'grid-cols-1 md:grid-cols-3 lg:grid-cols-5',
      6: 'grid-cols-1 md:grid-cols-3 lg:grid-cols-6'
    }

    return (
      <div
        ref={ref}
        className={`grid ${colClasses[cols]} gap-6 ${className}`}
        {...props}
      />
    )
  }
)

const Flex = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = "", ...props }, ref) => (
    <div ref={ref} className={`flex ${className}`} {...props} />
  )
)

Container.displayName = "Container"
Section.displayName = "Section"
Grid.displayName = "Grid"
Flex.displayName = "Flex"

export { Container, Section, Grid, Flex }