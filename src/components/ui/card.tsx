import * as React from "react"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'base' | 'elevated' | 'interactive'
  size?: 'sm' | 'md' | 'lg'
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", variant = 'default', size, ...props }, ref) => {
    const variantStyles = {
      default: 'rounded-lg border border-gray-200 bg-white shadow-sm',
      glass: 'rounded-lg border border-white/20 bg-white/10 backdrop-blur-md shadow-xl',
      base: 'rounded-lg border border-gray-200 bg-white shadow-sm',
      elevated: 'rounded-lg border border-gray-200 bg-white shadow-lg hover:shadow-xl transition-shadow',
      interactive: 'rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer'
    }

    const sizeStyles = {
      sm: 'p-4',
      md: 'p-6', 
      lg: 'p-8'
    }
    
    return (
      <div
        ref={ref}
        className={`${variantStyles[variant]} ${size ? sizeStyles[size] : ''} ${className}`}
        {...props}
      />
    )
  }
)

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = "", ...props }, ref) => (
    <div ref={ref} className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props} />
  )
)

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className = "", ...props }, ref) => (
    <h3
      ref={ref}
      className={`text-lg font-semibold leading-none tracking-tight ${className}`}
      {...props}
    />
  )
)

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className = "", ...props }, ref) => (
    <p ref={ref} className={`text-sm text-gray-600 ${className}`} {...props} />
  )
)

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = "", ...props }, ref) => (
    <div ref={ref} className={`p-6 pt-0 ${className}`} {...props} />
  )
)

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = "", ...props }, ref) => (
    <div ref={ref} className={`flex items-center p-6 pt-0 ${className}`} {...props} />
  )
)

Card.displayName = "Card"
CardHeader.displayName = "CardHeader"
CardTitle.displayName = "CardTitle"
CardDescription.displayName = "CardDescription"
CardContent.displayName = "CardContent"
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }