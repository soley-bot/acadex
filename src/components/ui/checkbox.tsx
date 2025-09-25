import * as React from "react"

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onCheckedChange?: (checked: boolean) => void
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = "", onCheckedChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onCheckedChange) {
        onCheckedChange(e.target.checked)
      }
    }

    return (
      <input
        type="checkbox"
        className={`h-4 w-4 rounded border border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 ${className}`}
        ref={ref}
        onChange={handleChange}
        {...props}
      />
    )
  }
)

Checkbox.displayName = "Checkbox"

export { Checkbox }