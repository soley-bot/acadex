import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-bold transition-all duration-200 focus-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        default: "bg-red-600 text-white hover:bg-red-700 hover:shadow-lg hover:-translate-y-0.5",
        destructive: "bg-red-600 text-white hover:bg-red-700 hover:shadow-lg",
        outline: "border-2 border-red-600 text-red-600 bg-transparent hover:bg-red-600 hover:text-white",
        secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
        ghost: "border-2 border-white text-white hover:bg-white hover:text-gray-900",
        link: "text-red-600 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-10 rounded-md px-4 py-2 text-sm",
        lg: "h-14 rounded-lg px-8 py-4 text-lg",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
