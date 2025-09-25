import * as React from "react"

interface BlobBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'primary' | 'secondary' | 'default'
}

const BlobBackground = React.forwardRef<HTMLDivElement, BlobBackgroundProps>(
  ({ className = "", variant = 'primary', ...props }, ref) => {
    const variants = {
      primary: "bg-gradient-to-br from-blue-50 to-indigo-100",
      secondary: "bg-gradient-to-br from-gray-50 to-gray-100",
      default: "bg-gradient-to-br from-blue-50 to-indigo-100"
    }

    return (
      <div
        ref={ref}
        className={`absolute inset-0 overflow-hidden ${variants[variant]} ${className}`}
        {...props}
      >
        <div className="absolute -top-10 -right-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" />
        <div className="absolute -bottom-8 -left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-1000" />
      </div>
    )
  }
)

BlobBackground.displayName = "BlobBackground"

export { BlobBackground }
