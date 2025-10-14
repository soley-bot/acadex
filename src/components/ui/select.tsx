import * as React from "react"

// Simple context-based Select component
interface SelectContextValue {
  value?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  open: boolean
  setOpen: (open: boolean) => void
}

const SelectContext = React.createContext<SelectContextValue>({
  open: false,
  setOpen: () => {}
})

interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  children: React.ReactNode
}

const Select: React.FC<SelectProps> = ({ value, onValueChange, disabled, children }) => {
  const [open, setOpen] = React.useState(false)
  
  return (
    <SelectContext.Provider value={{ value, onValueChange, disabled, open, setOpen }}>
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  )
}

const SelectItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { value: string }>(
  ({ className = "", value, children, ...props }, ref) => {
    const context = React.useContext(SelectContext)
    
    const handleClick = () => {
      if (!context.disabled && context.onValueChange) {
        context.onValueChange(value)
        context.setOpen(false)
      }
    }
    
    return (
      <div
        ref={ref}
        className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground ${
          context.value === value ? 'bg-accent' : ''
        } ${className}`}
        onClick={handleClick}
        {...props}
      >
        {children}
      </div>
    )
  }
)

const SelectContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = "", children, ...props }, ref) => {
    const context = React.useContext(SelectContext)
    
    if (!context.open) return null
    
    return (
      <div
        ref={ref}
        className={`absolute top-full mt-1 max-h-60 w-full overflow-auto rounded-md border bg-white text-foreground shadow-md z-50 p-1 ${className}`}
        {...props}
      >
        {children}
      </div>
    )
  }
)

const SelectTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className = "", children, ...props }, ref) => {
    const context = React.useContext(SelectContext)
    
    // Close on click outside
    React.useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (context.open && ref && 'current' in ref && ref.current && !ref.current.contains(e.target as Node)) {
          context.setOpen(false)
        }
      }
      
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [context, ref])
    
    return (
      <button
        ref={ref}
        type="button"
        className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        onClick={() => !context.disabled && context.setOpen(!context.open)}
        disabled={context.disabled}
        {...props}
      >
        {children}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`ml-2 h-4 w-4 opacity-50 transition-transform ${context.open ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
    )
  }
)

const SelectValue = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement> & { placeholder?: string }>(
  ({ className = "", children, placeholder, ...props }, ref) => {
    const context = React.useContext(SelectContext)
    return (
      <span ref={ref} className={className} {...props}>
        {context.value || children || placeholder}
      </span>
    )
  }
)

Select.displayName = "Select"
SelectItem.displayName = "SelectItem"
SelectContent.displayName = "SelectContent"
SelectTrigger.displayName = "SelectTrigger"
SelectValue.displayName = "SelectValue"

export { Select, SelectItem, SelectContent, SelectTrigger, SelectValue, type SelectProps }
