import * as React from "react"

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  variant?: 'default' | 'muted' | 'primary' | 'success' | 'destructive'
  fluid?: boolean
}

interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  variant?: 'default' | 'muted' | 'primary' | 'success' | 'destructive'
  fluid?: boolean
}

const H1 = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className = "", variant = 'default', fluid = false, ...props }, ref) => {
    const variantClasses = {
      default: 'text-foreground',
      muted: 'text-muted-foreground',
      primary: 'text-primary',
      success: 'text-success',
      destructive: 'text-destructive'
    }

    const sizeClass = fluid ? 'text-fluid-2xl' : 'text-4xl'
    
    return (
      <h1 
        ref={ref} 
        className={`${sizeClass} font-bold tracking-tight ${variantClasses[variant]} ${className}`} 
        {...props} 
      />
    )
  }
)

const H2 = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className = "", variant = 'default', fluid = false, ...props }, ref) => {
    const variantClasses = {
      default: 'text-foreground',
      muted: 'text-muted-foreground', 
      primary: 'text-primary',
      success: 'text-success',
      destructive: 'text-destructive'
    }

    const sizeClass = fluid ? 'text-fluid-xl' : 'text-3xl'
    
    return (
      <h2 
        ref={ref} 
        className={`${sizeClass} font-semibold tracking-tight ${variantClasses[variant]} ${className}`} 
        {...props} 
      />
    )
  }
)

const H3 = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className = "", variant = 'default', fluid = false, ...props }, ref) => {
    const variantClasses = {
      default: 'text-foreground',
      muted: 'text-muted-foreground',
      primary: 'text-primary', 
      success: 'text-success',
      destructive: 'text-destructive'
    }

    const sizeClass = fluid ? 'text-fluid-lg' : 'text-2xl'
    
    return (
      <h3 
        ref={ref} 
        className={`${sizeClass} font-semibold tracking-tight ${variantClasses[variant]} ${className}`} 
        {...props} 
      />
    )
  }
)

const H4 = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className = "", variant = 'default', fluid = false, ...props }, ref) => {
    const variantClasses = {
      default: 'text-foreground',
      muted: 'text-muted-foreground',
      primary: 'text-primary',
      success: 'text-success', 
      destructive: 'text-destructive'
    }

    const sizeClass = fluid ? 'text-fluid-base' : 'text-xl'
    
    return (
      <h4 
        ref={ref} 
        className={`${sizeClass} font-semibold tracking-tight ${variantClasses[variant]} ${className}`} 
        {...props} 
      />
    )
  }
)

const BodyLG = React.forwardRef<HTMLParagraphElement, TextProps>(
  ({ className = "", variant = 'default', fluid = false, ...props }, ref) => {
    const variantClasses = {
      default: 'text-foreground',
      muted: 'text-muted-foreground',
      primary: 'text-primary',
      success: 'text-success',
      destructive: 'text-destructive'
    }

    const sizeClass = fluid ? 'text-fluid-base' : 'text-lg'
    
    return (
      <p 
        ref={ref} 
        className={`${sizeClass} leading-7 ${variantClasses[variant]} ${className}`} 
        {...props} 
      />
    )
  }
)

const BodyMD = React.forwardRef<HTMLParagraphElement, TextProps>(
  ({ className = "", variant = 'default', fluid = false, ...props }, ref) => {
    const variantClasses = {
      default: 'text-foreground',
      muted: 'text-muted-foreground',
      primary: 'text-primary', 
      success: 'text-success',
      destructive: 'text-destructive'
    }

    const sizeClass = fluid ? 'text-fluid-sm' : 'text-base'
    
    return (
      <p 
        ref={ref} 
        className={`${sizeClass} leading-6 ${variantClasses[variant]} ${className}`} 
        {...props} 
      />
    )
  }
)

const BodySM = React.forwardRef<HTMLParagraphElement, TextProps>(
  ({ className = "", variant = 'default', fluid = false, ...props }, ref) => {
    const variantClasses = {
      default: 'text-foreground',
      muted: 'text-muted-foreground',
      primary: 'text-primary',
      success: 'text-success', 
      destructive: 'text-destructive'
    }

    const sizeClass = fluid ? 'text-fluid-sm' : 'text-sm'
    
    return (
      <p 
        ref={ref} 
        className={`${sizeClass} leading-5 ${variantClasses[variant]} ${className}`} 
        {...props} 
      />
    )
  }
)

const Lead = React.forwardRef<HTMLParagraphElement, TextProps>(
  ({ className = "", variant = 'muted', ...props }, ref) => (
    <BodyLG ref={ref} className={`text-xl ${className}`} variant={variant} {...props} />
  )
)

const Muted = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className = "", ...props }, ref) => (
    <p ref={ref} className={`text-sm text-muted-foreground ${className}`} {...props} />
  )
)

H1.displayName = "H1"
H2.displayName = "H2" 
H3.displayName = "H3"
H4.displayName = "H4"
BodyLG.displayName = "BodyLG"
BodyMD.displayName = "BodyMD"
BodySM.displayName = "BodySM"
Lead.displayName = "Lead"
Muted.displayName = "Muted"

export { H1, H2, H3, H4, BodyLG, BodyMD, BodySM, Lead, Muted, type HeadingProps, type TextProps }
