import * as React from "react"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'destructive' | 'outline' | 'ghost' | 'link'
  size?: 'xs' | 'sm' | 'default' | 'lg' | 'xl' | 'icon'
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = 'primary', size = 'default', asChild, children, ...props }, ref) => {
    const variants = {
      primary: "bg-primary text-primary-foreground hover:bg-primary-hover",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary-hover",
      success: "bg-success text-success-foreground hover:bg-success/90",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      outline: "border border-border bg-background hover:bg-muted text-foreground",
      ghost: "hover:bg-muted text-foreground",
      link: "text-primary underline-offset-4 hover:underline"
    }

    const sizes = {
      xs: "h-8 px-2 text-xs",
      sm: "h-9 px-3 text-sm",
      default: "h-10 px-4 py-2 text-sm",
      lg: "h-11 px-8 text-base",
      xl: "h-12 px-10 text-lg",
      icon: "h-10 w-10"
    }

    const baseClasses = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-ring disabled:pointer-events-none disabled:opacity-50"
    const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`

    if (asChild) {
      return React.cloneElement(children as React.ReactElement, {
        ref,
        className: classes,
        ...props
      })
    }

    return (
      <button
        className={classes}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = "Button"

export { Button, type ButtonProps }
