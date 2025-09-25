import * as React from "react"

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive'
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className = "", variant = 'default', ...props }, ref) => {
    const variants = {
      default: "border-gray-200 text-gray-800",
      destructive: "border-red-500/50 text-red-600 [&>svg]:text-red-600"
    }

    return (
      <div
        ref={ref}
        className={`relative w-full rounded-lg border p-4 ${variants[variant]} ${className}`}
        {...props}
      />
    )
  }
)

const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className = "", ...props }, ref) => (
    <div ref={ref} className={`text-sm [&_p]:leading-relaxed ${className}`} {...props} />
  )
)

Alert.displayName = "Alert"
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertDescription }