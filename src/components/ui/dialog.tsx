import * as React from "react"

interface DialogProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const Dialog = React.forwardRef<HTMLDivElement, DialogProps>(
  ({ children, open, onOpenChange, ...props }, ref) => {
    React.useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && onOpenChange) {
          onOpenChange(false)
        }
      }
      if (open) {
        document.addEventListener('keydown', handleEscape)
        document.body.style.overflow = 'hidden'
      }
      return () => {
        document.removeEventListener('keydown', handleEscape)
        document.body.style.overflow = 'unset'
      }
    }, [open, onOpenChange])

    if (!open) return null

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div 
          className="fixed inset-0 bg-black/50" 
          onClick={() => onOpenChange?.(false)}
        />
        <div ref={ref} {...props}>
          {children}
        </div>
      </div>
    )
  }
)

const DialogContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = "", children, ...props }, ref) => (
    <div
      ref={ref}
      className={`relative bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
)

const DialogHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = "", ...props }, ref) => (
    <div
      ref={ref}
      className={`flex flex-col space-y-1.5 text-center sm:text-left ${className}`}
      {...props}
    />
  )
)

const DialogTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className = "", ...props }, ref) => (
    <h3
      ref={ref}
      className={`text-lg font-semibold leading-none tracking-tight ${className}`}
      {...props}
    />
  )
)

Dialog.displayName = "Dialog"
DialogContent.displayName = "DialogContent"
DialogHeader.displayName = "DialogHeader"
DialogTitle.displayName = "DialogTitle"

export { Dialog, DialogContent, DialogHeader, DialogTitle }
