import * as React from "react"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  state?: 'default' | 'error' | 'success'
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", type, state = 'default', ...props }, ref) => {
    const stateStyles = {
      default: "border-border focus:border-ring focus-ring",
      error: "border-destructive focus:border-destructive focus:ring-destructive focus:ring-offset-2 focus:outline-none focus:ring-2",
      success: "border-success focus:border-success focus:ring-success focus:ring-offset-2 focus:outline-none focus:ring-2"
    }

    const baseClasses = "flex h-10 w-full rounded-md bg-white px-3 py-2 text-sm text-foreground ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
    
    return (
      <input
        type={type}
        className={`${baseClasses} ${stateStyles[state]} ${className}`}
        ref={ref}
        {...props}
      />
    )
  }
)

Input.displayName = "Input"

export { Input, type InputProps }
