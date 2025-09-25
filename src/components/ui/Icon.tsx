import * as React from "react"

interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  name?: string
  size?: number
}

const Icon = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className = "", name = "", size = 24, ...props }, ref) => (
    <span
      ref={ref}
      className={`inline-block ${className}`}
      style={{ width: size, height: size }}
      {...props}
    >
      {name}
    </span>
  )
)

Icon.displayName = "Icon"

export default Icon
