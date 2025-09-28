import * as React from "react"
import Image from "next/image"

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg'
}

const Logo = React.forwardRef<HTMLDivElement, LogoProps>(
  ({ className = "", size = 'md', ...props }, ref) => {
    const sizes = {
      sm: { width: 32, height: 28 },
      md: { width: 40, height: 35 },
      lg: { width: 48, height: 42 }
    }

    const { width, height } = sizes[size]

    return (
      <div
        ref={ref}
        className={`flex items-center ${className}`}
        {...props}
      >
        <Image
          src="/logo.svg"
          alt="Acadex Logo"
          width={width}
          height={height}
          className="object-contain"
          priority
        />
      </div>
    )
  }
)

Logo.displayName = "Logo"

export { Logo }
