import * as React from "react"

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'destructive'
  size?: 'sm' | 'default' | 'lg'
  showValue?: boolean
  animated?: boolean
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ 
    className = "", 
    value = 0, 
    max = 100, 
    variant = 'default',
    size = 'default',
    showValue = false,
    animated = false,
    ...props 
  }, ref) => {
    const percentage = Math.min((value / max) * 100, 100)

    const variants = {
      default: "bg-primary",
      primary: "bg-primary",
      secondary: "bg-secondary", 
      success: "bg-success",
      warning: "bg-warning",
      destructive: "bg-destructive"
    }

    const sizes = {
      sm: "h-2",
      default: "h-4", 
      lg: "h-6"
    }

    const progressClasses = [
      "h-full w-full flex-1 transition-all duration-300",
      variants[variant],
      animated && "animate-pulse"
    ].filter(Boolean).join(" ")

    return (
      <div className={`relative ${showValue ? 'flex items-center gap-3' : ''}`}>
        <div
          ref={ref}
          className={`relative w-full overflow-hidden rounded-full bg-muted ${sizes[size]} ${className}`}
          {...props}
        >
          <div
            className={progressClasses}
            style={{ transform: `translateX(-${100 - percentage}%)` }}
            role="progressbar"
            aria-valuenow={value}
            aria-valuemin={0}
            aria-valuemax={max}
          />
        </div>
        {showValue && (
          <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
            {Math.round(percentage)}%
          </span>
        )}
      </div>
    )
  }
)

Progress.displayName = "Progress"

export { Progress }
