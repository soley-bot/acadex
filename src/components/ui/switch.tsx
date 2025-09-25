import * as React from "react"

interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  onCheckedChange?: (checked: boolean) => void
  size?: 'sm' | 'default' | 'lg'
  variant?: 'default' | 'success' | 'destructive'
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className = "", onCheckedChange, onChange, size = 'default', variant = 'default', ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e)
      onCheckedChange?.(e.target.checked)
    }

    const sizes = {
      sm: { 
        track: "w-9 h-5",
        thumb: "h-4 w-4",
        translate: "peer-checked:after:translate-x-4"
      },
      default: { 
        track: "w-11 h-6",
        thumb: "h-5 w-5", 
        translate: "peer-checked:after:translate-x-full"
      },
      lg: { 
        track: "w-14 h-8",
        thumb: "h-7 w-7",
        translate: "peer-checked:after:translate-x-6"
      }
    }

    const variants = {
      default: "peer-checked:bg-primary",
      success: "peer-checked:bg-success",
      destructive: "peer-checked:bg-destructive"
    }

    const currentSize = sizes[size]

    return (
      <label className="inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          ref={ref}
          className="sr-only peer"
          onChange={handleChange}
          {...props}
        />
        <div 
          className={`
            relative ${currentSize.track} bg-muted 
            peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring peer-focus:ring-offset-2
            rounded-full peer transition-colors
            ${currentSize.translate}
            after:content-[''] after:absolute after:top-0.5 after:left-0.5 
            after:bg-background after:border after:border-border after:rounded-full 
            after:${currentSize.thumb} after:transition-all
            ${variants[variant]}
            disabled:cursor-not-allowed disabled:opacity-50
            ${className}
          `} 
        />
      </label>
    )
  }
)

Switch.displayName = "Switch"

export { Switch }
