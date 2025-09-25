import * as React from "react"

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'info'
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className = "", variant = 'default', ...props }, ref) => {
    const variants = {
      default: "border-border bg-background text-foreground [&>svg]:text-foreground",
      success: "border-success/50 bg-success/10 text-success-foreground [&>svg]:text-success",
      warning: "border-warning/50 bg-warning/10 text-warning-foreground [&>svg]:text-warning",
      destructive: "border-destructive/50 bg-destructive/10 text-destructive-foreground [&>svg]:text-destructive",
      info: "border-info/50 bg-info/10 text-info-foreground [&>svg]:text-info"
    }

    return (
      <div
        ref={ref}
        role="alert"
        className={`relative w-full rounded-lg border p-4 ${variants[variant]} ${className}`}
        {...props}
      />
    )
  }
)

const AlertTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className = "", ...props }, ref) => (
    <h5 
      ref={ref} 
      className={`mb-1 font-medium leading-none tracking-tight ${className}`} 
      {...props} 
    />
  )
)

const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className = "", ...props }, ref) => (
    <div 
      ref={ref} 
      className={`text-sm [&_p]:leading-relaxed ${className}`} 
      {...props} 
    />
  )
)

Alert.displayName = "Alert"
AlertTitle.displayName = "AlertTitle"
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
