import * as React from "react"

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  variant?: 'default' | 'muted' | 'error' | 'success'
  size?: 'sm' | 'default' | 'lg'
  required?: boolean
  optional?: boolean
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className = "", variant = 'default', size = 'default', required = false, optional = false, children, ...props }, ref) => {
    const variantClasses = {
      default: 'text-foreground',
      muted: 'text-muted-foreground',
      error: 'text-destructive',
      success: 'text-success'
    }

    const sizeClasses = {
      sm: 'text-xs',
      default: 'text-sm',
      lg: 'text-base'
    }

    return (
      <label
        ref={ref}
        className={`font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
        {...props}
      >
        {children}
        {required && (
          <span className="ml-1 text-destructive" aria-label="required">
            *
          </span>
        )}
        {optional && (
          <span className="ml-1 text-muted-foreground text-xs font-normal">
            (optional)
          </span>
        )}
      </label>
    )
  }
)

Label.displayName = "Label"

export { Label, type LabelProps }
