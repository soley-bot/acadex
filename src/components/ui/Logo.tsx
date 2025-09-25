import * as React from "react"

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg'
}

const Logo = React.forwardRef<HTMLDivElement, LogoProps>(
  ({ className = "", size = 'md', ...props }, ref) => {
    const sizes = {
      sm: "text-lg",
      md: "text-2xl",
      lg: "text-4xl"
    }

    return (
      <div
        ref={ref}
        className={`font-bold text-primary ${sizes[size]} ${className}`}
        {...props}
      >
        ACADEX
      </div>
    )
  }
)

Logo.displayName = "Logo"

export { Logo }
