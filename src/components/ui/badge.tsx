import * as React from "react"

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className = "", variant = 'default', ...props }, ref) => {
    const variants = {
      default: "bg-blue-600 text-white",
      secondary: "bg-gray-600 text-white",
      destructive: "bg-red-600 text-white",
      outline: "border border-gray-300 text-gray-700"
    }

    return (
      <div
        ref={ref}
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${variants[variant]} ${className}`}
        {...props}
      />
    )
  }
)

Badge.displayName = "Badge"

export { Badge }
