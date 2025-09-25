import * as React from "react"

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  onCheckedChange?: (checked: boolean) => void
  state?: 'default' | 'error' | 'success'
  size?: 'sm' | 'default' | 'lg'
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = "", onCheckedChange, state = 'default', size = 'default', ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onCheckedChange) {
        onCheckedChange(e.target.checked)
      }
    }

    const sizeClasses = {
      sm: 'h-3 w-3',
      default: 'h-4 w-4', 
      lg: 'h-5 w-5'
    }

    const stateStyles = {
      default: "border-border text-primary focus:ring-ring",
      error: "border-destructive text-destructive focus:ring-destructive",
      success: "border-success text-success focus:ring-success"
    }

    const baseClasses = "rounded border bg-background transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"

    return (
      <input
        type="checkbox"
        className={`${baseClasses} ${sizeClasses[size]} ${stateStyles[state]} ${className}`}
        ref={ref}
        onChange={handleChange}
        {...props}
      />
    )
  }
)

Checkbox.displayName = "Checkbox"

export { Checkbox, type CheckboxProps }
