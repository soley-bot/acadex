"use client"

import * as React from "react"

interface DropdownMenuProps {
  children: React.ReactNode
  className?: string
}

const DropdownMenuContext = React.createContext<{
  open: boolean
  setOpen: (open: boolean) => void
} | null>(null)

const DropdownMenu: React.FC<DropdownMenuProps> = ({ children, className = "" }) => {
  const [open, setOpen] = React.useState(false)

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div className={`relative inline-block text-left ${className}`}>
        {children}
      </div>
    </DropdownMenuContext.Provider>
  )
}

interface DropdownMenuTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

const DropdownMenuTrigger = React.forwardRef<HTMLButtonElement, DropdownMenuTriggerProps>(
  ({ className = "", children, asChild, onClick, ...props }, ref) => {
    const context = React.useContext(DropdownMenuContext)
    if (!context) throw new Error('DropdownMenuTrigger must be used within DropdownMenu')

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      context.setOpen(!context.open)
      onClick?.(e)
    }

    if (asChild) {
      // When asChild is true, return children as-is (assuming it's a valid React element)
      return React.cloneElement(children as React.ReactElement, {
        ref,
        onClick: handleClick,
        ...props
      })
    }

    return (
      <button
        ref={ref}
        className={`inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 ${className}`}
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    )
  }
)

interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'center' | 'end'
}

const DropdownMenuContent = React.forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  ({ className = "", children, align = 'end', ...props }, ref) => {
    const context = React.useContext(DropdownMenuContext)
    if (!context) throw new Error('DropdownMenuContent must be used within DropdownMenu')

    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (ref && 'current' in ref && ref.current && !ref.current.contains(event.target as Node)) {
          context.setOpen(false)
        }
      }

      if (context.open) {
        document.addEventListener('mousedown', handleClickOutside)
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }, [context, ref])

    if (!context.open) return null

    const alignmentClasses = {
      start: 'left-0',
      center: 'left-1/2 transform -translate-x-1/2',
      end: 'right-0'
    }

    return (
      <div
        ref={ref}
        className={`absolute ${alignmentClasses[align]} mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 ${className}`}
        {...props}
      >
        <div className="py-1">{children}</div>
      </div>
    )
  }
)

interface DropdownMenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

const DropdownMenuItem = React.forwardRef<HTMLButtonElement, DropdownMenuItemProps>(
  ({ className = "", children, asChild, onClick, ...props }, ref) => {
    const context = React.useContext(DropdownMenuContext)

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e)
      context?.setOpen(false)
    }

    if (asChild) {
      // When asChild is true, return children as-is (assuming it's a valid React element)
      return React.cloneElement(children as React.ReactElement, {
        ref,
        className: `block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${className}`,
        onClick: handleClick,
        ...props
      })
    }

    return (
      <button
        ref={ref}
        className={`block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${className}`}
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    )
  }
)

const DropdownMenuSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = "", ...props }, ref) => (
    <div ref={ref} className={`-mx-1 my-1 h-px bg-gray-200 ${className}`} {...props} />
  )
)

const DropdownMenuLabel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = "", ...props }, ref) => (
    <div ref={ref} className={`px-2 py-1.5 text-sm font-semibold text-gray-900 ${className}`} {...props} />
  )
)

const DropdownMenuCheckboxItem = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { checked?: boolean, onCheckedChange?: (checked: boolean) => void }>(
  ({ className = "", children, checked, onCheckedChange, ...props }, ref) => (
    <button
      ref={ref}
      className={`flex items-center w-full px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 ${className}`}
      onClick={() => onCheckedChange?.(!checked)}
      {...props}
    >
      <span className="mr-2">{checked ? '✓' : ''}</span>
      {children}
    </button>
  )
)

DropdownMenu.displayName = "DropdownMenu"
DropdownMenuTrigger.displayName = "DropdownMenuTrigger"
DropdownMenuContent.displayName = "DropdownMenuContent"
DropdownMenuItem.displayName = "DropdownMenuItem"
DropdownMenuSeparator.displayName = "DropdownMenuSeparator"
DropdownMenuLabel.displayName = "DropdownMenuLabel"
DropdownMenuCheckboxItem.displayName = "DropdownMenuCheckboxItem"

export { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem
}