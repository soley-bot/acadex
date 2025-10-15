import * as React from "react"
import { ChevronDown, Check } from "lucide-react"

// Modern dropdown component with smooth animations
interface SelectContextValue {
  value?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  open: boolean
  setOpen: (open: boolean) => void
  placeholder?: string
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
  placeholder?: string
}

const Select: React.FC<SelectProps> = ({ value, onValueChange, disabled, children, placeholder }) => {
  const [open, setOpen] = React.useState(false)
  
  return (
    <SelectContext.Provider value={{ value, onValueChange, disabled, open, setOpen, placeholder }}>
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  )
}

const SelectItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { value: string }>(
  ({ className = "", value, children, ...props }, ref) => {
    const context = React.useContext(SelectContext)
    const isSelected = context.value === value
    
    const handleClick = () => {
      if (!context.disabled && context.onValueChange) {
        context.onValueChange(value)
        context.setOpen(false)
      }
    }
    
    return (
      <div
        ref={ref}
        className={`relative flex w-full cursor-pointer select-none items-center justify-between rounded-lg py-2.5 px-3 text-sm outline-none transition-colors duration-150 ${
          isSelected 
            ? 'bg-primary/10 text-primary font-medium' 
            : 'hover:bg-gray-50 text-gray-700'
        } ${context.disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        onClick={handleClick}
        {...props}
      >
        <span>{children}</span>
        {isSelected && <Check className="w-4 h-4 text-primary" />}
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
        role="listbox"
        className={`absolute top-full mt-2 max-h-80 w-full overflow-auto rounded-xl border border-gray-200 bg-white shadow-lg z-50 p-2 animate-in fade-in-0 zoom-in-95 ${className}`}
        style={{
          animation: 'slideDown 200ms ease-out'
        }}
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
    const triggerRef = React.useRef<HTMLButtonElement>(null)
    
    // Merge refs
    React.useImperativeHandle(ref, () => triggerRef.current!)
    
    // Close on click outside
    React.useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (context.open && triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
          const content = triggerRef.current.parentElement?.querySelector('[role="listbox"]')
          if (content && !content.contains(e.target as Node)) {
            context.setOpen(false)
          }
        }
      }
      
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [context])
    
    // Close on escape key
    React.useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && context.open) {
          context.setOpen(false)
          triggerRef.current?.focus()
        }
      }
      
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }, [context])
    
    return (
      <button
        ref={triggerRef}
        type="button"
        className={`flex h-11 w-full items-center justify-between rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 transition-all duration-200 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50 ${
          context.open ? 'border-primary ring-2 ring-primary/20' : ''
        } ${className}`}
        onClick={() => !context.disabled && context.setOpen(!context.open)}
        disabled={context.disabled}
        aria-haspopup="listbox"
        aria-expanded={context.open}
        {...props}
      >
        <span className="truncate">{children}</span>
        <ChevronDown 
          className={`ml-2 h-4 w-4 text-gray-500 transition-transform duration-200 ${
            context.open ? 'rotate-180' : ''
          }`}
        />
      </button>
    )
  }
)

const SelectValue = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement> & { placeholder?: string }>(
  ({ className = "", children, placeholder, ...props }, ref) => {
    const context = React.useContext(SelectContext)
    const displayValue = context.value || children || placeholder || context.placeholder
    
    return (
      <span 
        ref={ref} 
        className={`${!context.value && !children ? 'text-gray-500' : 'text-gray-900'} ${className}`} 
        {...props}
      >
        {displayValue}
      </span>
    )
  }
)

Select.displayName = "Select"
SelectItem.displayName = "SelectItem"
SelectContent.displayName = "SelectContent"
SelectTrigger.displayName = "SelectTrigger"
SelectValue.displayName = "SelectValue"

// Add animation keyframes to global styles if not already present
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = `
    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `
  if (!document.querySelector('style[data-select-animations]')) {
    style.setAttribute('data-select-animations', 'true')
    document.head.appendChild(style)
  }
}

export { Select, SelectItem, SelectContent, SelectTrigger, SelectValue, type SelectProps }
