import * as React from "react"

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  onValueChange?: (value: string) => void
  state?: 'default' | 'error' | 'success'
  placeholder?: string
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = "", children, onValueChange, state = 'default', placeholder, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (onValueChange) {
        onValueChange(e.target.value)
      }
    }

    const stateStyles = {
      default: "border-border focus:border-ring focus-ring",
      error: "border-destructive focus:border-destructive focus:ring-destructive focus:ring-offset-2 focus:outline-none focus:ring-2",
      success: "border-success focus:border-success focus:ring-success focus:ring-offset-2 focus:outline-none focus:ring-2"
    }

    const baseClasses = "flex h-10 w-full rounded-md bg-white px-3 py-2 text-sm text-foreground ring-offset-white disabled:cursor-not-allowed disabled:opacity-50 transition-colors cursor-pointer"

    return (
      <select
        className={`${baseClasses} ${stateStyles[state]} ${className}`}
        ref={ref}
        onChange={handleChange}
        {...props}
      >
        {placeholder && (
          <option value="" disabled className="text-muted-foreground">
            {placeholder}
          </option>
        )}
        {children}
      </select>
    )
  }
)

const SelectItem = React.forwardRef<HTMLOptionElement, React.OptionHTMLAttributes<HTMLOptionElement>>(
  ({ className = "", ...props }, ref) => (
    <option ref={ref} className={`text-foreground ${className}`} {...props} />
  )
)

// Compatibility components for more complex select usage
const SelectContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, ...props }, ref) => (
    <div ref={ref} {...props}>
      {children}
    </div>
  )
)

const SelectTrigger = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = "", children, ...props }, ref) => (
    <div
      ref={ref}
      className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
)

const SelectValue = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className = "", ...props }, ref) => (
    <span ref={ref} className={className} {...props} />
  )
)

Select.displayName = "Select"
SelectItem.displayName = "SelectItem"
SelectContent.displayName = "SelectContent"
SelectTrigger.displayName = "SelectTrigger"
SelectValue.displayName = "SelectValue"

export { Select, SelectItem, SelectContent, SelectTrigger, SelectValue, type SelectProps }
