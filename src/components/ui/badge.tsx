import * as React from "react"

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'destructive' | 'warning' | 'info' | 'outline'
  size?: 'sm' | 'default' | 'lg'
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className = "", variant = 'default', size = 'default', ...props }, ref) => {
    const variants = {
      default: "bg-background text-foreground border border-border",
      primary: "bg-primary text-primary-foreground border-0",
      secondary: "bg-secondary text-secondary-foreground border-0",
      success: "bg-success text-success-foreground border-0",
      destructive: "bg-destructive text-destructive-foreground border-0",
      warning: "bg-warning text-warning-foreground border-0",
      info: "bg-info text-info-foreground border-0",
      outline: "border border-border bg-transparent text-foreground"
    }

    const sizes = {
      sm: "px-2 py-0.5 text-xs",
      default: "px-2.5 py-0.5 text-xs",
      lg: "px-3 py-1 text-sm"
    }

    const baseClasses = "inline-flex items-center rounded-full font-medium transition-colors focus-ring"
    const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`

    return (
      <div
        ref={ref}
        className={classes}
        {...props}
      />
    )
  }
)

Badge.displayName = "Badge"

export { Badge }
