import * as React from "react"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = 'default', size = 'default', asChild, children, ...props }, ref) => {
    const variants = {
      default: "bg-blue-600 text-white hover:bg-blue-700",
      destructive: "bg-red-600 text-white hover:bg-red-700",
      outline: "border border-gray-300 bg-white hover:bg-gray-50",
      secondary: "bg-gray-600 text-white hover:bg-gray-700",
      ghost: "hover:bg-gray-100",
      link: "text-blue-600 underline hover:text-blue-800"
    }

    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-9 px-3 text-sm",
      lg: "h-11 px-8",
      icon: "h-10 w-10"
    }

    const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
    const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`

    if (asChild) {
      return React.cloneElement(children as React.ReactElement, {
        ref,
        className: classes,
        ...props
      })
    }

    return (
      <button
        className={classes}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = "Button"

export { Button, type ButtonProps }