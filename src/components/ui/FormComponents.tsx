import * as React from "react"

interface FormFieldProps {
  children: React.ReactNode
  className?: string
}

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ children, className = "", ...props }, ref) => (
    <div ref={ref} className={`space-y-2 ${className}`} {...props}>
      {children}
    </div>
  )
)

FormField.displayName = "FormField"

export { FormField }