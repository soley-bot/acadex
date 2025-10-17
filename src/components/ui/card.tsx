import * as React from "react"

interface CardProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 'default' | 'elevated' | 'interactive' | 'outline' | 'glass'
  size?: 'sm' | 'md' | 'lg'
  as?: 'div' | 'article' | 'section' | 'aside'
}

const Card = React.forwardRef<HTMLElement, CardProps>(
  ({ className = "", variant = 'default', size, as: Component = 'article', ...props }, ref) => {
    const variantStyles = {
      default: 'rounded-lg border border-border bg-background shadow-sm',
      elevated: 'rounded-lg border border-border bg-background shadow-lg hover:shadow-xl transition-shadow',
      interactive: 'rounded-lg border border-border bg-background shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer',
      outline: 'rounded-lg border border-border bg-transparent',
      glass: 'rounded-3xl backdrop-blur-lg bg-white/80 border border-white/20 shadow-2xl transition-all duration-300'
    }

    const sizeStyles = {
      sm: 'p-4',
      md: 'p-6', 
      lg: 'p-8'
    }
    
    return (
      <Component
        ref={ref as any}
        className={`${variantStyles[variant]} ${size ? sizeStyles[size] : ''} ${className}`}
        {...props}
      />
    )
  }
)

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = "", ...props }, ref) => (
    <div ref={ref} className={`flex flex-col space-y-1.5 p-4 sm:p-5 lg:p-6 ${className}`} {...props} />
  )
)

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className = "", ...props }, ref) => (
    <h3
      ref={ref}
      className={`text-lg font-semibold leading-none tracking-tight text-foreground ${className}`}
      {...props}
    />
  )
)

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className = "", ...props }, ref) => (
    <p ref={ref} className={`text-sm text-muted-foreground ${className}`} {...props} />
  )
)

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = "", ...props }, ref) => (
    <div ref={ref} className={`p-4 sm:p-5 lg:p-6 pt-0 ${className}`} {...props} />
  )
)

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = "", ...props }, ref) => (
    <div ref={ref} className={`flex items-center p-4 sm:p-5 lg:p-6 pt-0 ${className}`} {...props} />
  )
)

Card.displayName = "Card"
CardHeader.displayName = "CardHeader"
CardTitle.displayName = "CardTitle"
CardDescription.displayName = "CardDescription"
CardContent.displayName = "CardContent"
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, type CardProps }
