import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        default: "bg-primary hover:bg-secondary text-white shadow-lg hover:shadow-xl",
        destructive: "bg-destructive hover:bg-destructive/90 text-white shadow-lg hover:shadow-xl",
        outline: "border-2 border-primary text-primary bg-white hover:bg-primary hover:text-white shadow-lg hover:shadow-xl",
        secondary: "bg-secondary hover:bg-secondary/90 text-white shadow-lg hover:shadow-xl",
        ghost: "bg-transparent text-primary hover:bg-primary hover:text-white shadow-lg hover:shadow-xl",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-10 rounded-lg px-4 py-2 text-sm",
        lg: "h-14 rounded-2xl px-8 py-4 text-lg",
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
