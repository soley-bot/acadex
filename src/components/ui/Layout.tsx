import * as React from "react"

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className = "", size = 'xl', ...props }, ref) => {
    const sizeClasses = {
      sm: 'max-w-sm',      // 576px
      md: 'max-w-2xl',     // 672px  
      lg: 'max-w-4xl',     // 896px
      xl: 'max-w-6xl',     // 1152px
      '2xl': 'max-w-7xl',  // 1280px
      full: 'max-w-full'
    }

    return (
      <div
        ref={ref}
        className={`mx-auto px-6 sm:px-8 md:px-10 lg:px-12 ${sizeClasses[size]} ${className}`}
        {...props}
      />
    )
  }
)

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  background?: 'default' | 'muted' | 'accent'
  padding?: 'sm' | 'md' | 'lg' | 'xl' | 'none'
}

const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ className = "", background = 'default', padding = 'md', ...props }, ref) => {
    const backgroundClasses = {
      default: 'bg-background',
      muted: 'bg-muted',
      accent: 'bg-primary/5'
    }

    const paddingClasses = {
      none: '',
      sm: 'py-8',
      md: 'py-12',
      lg: 'py-16',
      xl: 'py-24'
    }

    return (
      <section
        ref={ref}
        className={`${backgroundClasses[background]} ${paddingClasses[padding]} ${className}`}
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

interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  space?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}

const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  ({ className = "", space = 'md', ...props }, ref) => {
    const spaceClasses = {
      xs: 'space-y-1',
      sm: 'space-y-2', 
      md: 'space-y-4',
      lg: 'space-y-6',
      xl: 'space-y-8'
    }

    return (
      <div ref={ref} className={`flex flex-col ${spaceClasses[space]} ${className}`} {...props} />
    )
  }
)

interface HStackProps extends React.HTMLAttributes<HTMLDivElement> {
  space?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  align?: 'start' | 'center' | 'end' | 'stretch'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
}

const HStack = React.forwardRef<HTMLDivElement, HStackProps>(
  ({ className = "", space = 'md', align = 'center', justify = 'start', ...props }, ref) => {
    const spaceClasses = {
      xs: 'space-x-1',
      sm: 'space-x-2',
      md: 'space-x-4', 
      lg: 'space-x-6',
      xl: 'space-x-8'
    }

    const alignClasses = {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch'
    }

    const justifyClasses = {
      start: 'justify-start',
      center: 'justify-center', 
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly'
    }

    return (
      <div 
        ref={ref} 
        className={`flex ${spaceClasses[space]} ${alignClasses[align]} ${justifyClasses[justify]} ${className}`} 
        {...props} 
      />
    )
  }
)

const Center = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = "", ...props }, ref) => (
    <div ref={ref} className={`flex items-center justify-center ${className}`} {...props} />
  )
)

const Spacer = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = "", ...props }, ref) => (
    <div ref={ref} className={`flex-1 ${className}`} {...props} />
  )
)

Container.displayName = "Container"
Section.displayName = "Section"  
Grid.displayName = "Grid"
Flex.displayName = "Flex"
Stack.displayName = "Stack"
HStack.displayName = "HStack"
Center.displayName = "Center"
Spacer.displayName = "Spacer"

export { Container, Section, Grid, Flex, Stack, HStack, Center, Spacer }
