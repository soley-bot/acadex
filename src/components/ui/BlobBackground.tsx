import * as React from "react"

interface BlobBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'muted' | 'default'
  intensity?: 'subtle' | 'medium' | 'strong'
  animated?: boolean
}

const BlobBackground = React.forwardRef<HTMLDivElement, BlobBackgroundProps>(
  ({ className = "", variant = 'primary', intensity = 'medium', animated = true, ...props }, ref) => {
    const variants = {
      primary: "bg-gradient-to-br from-primary/5 via-background to-primary/10",
      secondary: "bg-gradient-to-br from-secondary/5 via-background to-secondary/10", 
      accent: "bg-gradient-to-br from-primary/10 via-background to-secondary/10",
      muted: "bg-gradient-to-br from-muted/50 via-background to-muted",
      default: "bg-gradient-to-br from-primary/5 via-background to-primary/10"
    }

    const intensities = {
      subtle: { primary: "primary/20", secondary: "secondary/20", opacity: "opacity-40" },
      medium: { primary: "primary/30", secondary: "secondary/30", opacity: "opacity-60" },
      strong: { primary: "primary/40", secondary: "secondary/40", opacity: "opacity-80" }
    }

    const currentIntensity = intensities[intensity]
    const animationClasses = animated ? "animate-pulse" : ""

    return (
      <div
        ref={ref}
        className={`absolute inset-0 overflow-hidden ${variants[variant]} ${className}`}
        {...props}
        aria-hidden="true"
      >
        {/* Primary blob */}
        <div 
          className={`absolute -top-10 -right-10 w-72 h-72 bg-${currentIntensity.primary} rounded-full mix-blend-multiply filter blur-xl ${currentIntensity.opacity} ${animationClasses}`} 
        />
        
        {/* Secondary blob */}
        <div 
          className={`absolute -bottom-8 -left-10 w-72 h-72 bg-${currentIntensity.secondary} rounded-full mix-blend-multiply filter blur-xl ${currentIntensity.opacity} ${animationClasses}`}
          style={{ animationDelay: animated ? '1s' : '0s' }}
        />
        
        {/* Additional accent blob for more visual interest */}
        {intensity === 'strong' && (
          <div 
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-${currentIntensity.primary} rounded-full mix-blend-multiply filter blur-2xl opacity-20 ${animationClasses}`}
            style={{ animationDelay: animated ? '2s' : '0s' }}
          />
        )}
      </div>
    )
  }
)

BlobBackground.displayName = "BlobBackground"

export { BlobBackground }
