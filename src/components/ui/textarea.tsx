import * as React from "react"

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  state?: 'default' | 'error' | 'success'
  resize?: 'none' | 'both' | 'horizontal' | 'vertical'
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", state = 'default', resize = 'vertical', ...props }, ref) => {
    const stateStyles = {
      default: "border-border focus:border-ring focus-ring",
      error: "border-destructive focus:border-destructive focus:ring-destructive focus:ring-offset-2 focus:outline-none focus:ring-2",
      success: "border-success focus:border-success focus:ring-success focus:ring-offset-2 focus:outline-none focus:ring-2"
    }

    const resizeClasses = {
      none: 'resize-none',
      both: 'resize',
      horizontal: 'resize-x', 
      vertical: 'resize-y'
    }

    const baseClasses = "flex min-h-20 w-full rounded-md bg-white px-3 py-2 text-sm text-foreground ring-offset-white placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
    
    return (
      <textarea
        className={`${baseClasses} ${stateStyles[state]} ${resizeClasses[resize]} ${className}`}
        ref={ref}
        {...props}
      />
    )
  }
)

Textarea.displayName = "Textarea"

export { Textarea, type TextareaProps }
