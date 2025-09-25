import React from "react"

export interface ToastProps {
  message?: string
  title?: string
  description?: string
  type?: 'success' | 'error' | 'warning' | 'info'
  variant?: 'default' | 'destructive'
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const Toast: React.FC<ToastProps> = ({ 
  message, 
  title, 
  description, 
  type = 'info', 
  variant = 'default' 
}) => {
  const typeStyles = {
    success: 'bg-success text-success-foreground',
    error: 'bg-destructive text-destructive-foreground',
    warning: 'bg-warning text-warning-foreground',
    info: 'bg-info text-info-foreground'
  }

  const variantStyles = {
    default: 'bg-primary text-primary-foreground',
    destructive: 'bg-destructive text-destructive-foreground'
  }

  const finalStyle = variant === 'destructive' ? variantStyles.destructive : typeStyles[type]
  const displayMessage = message || title || description

  return (
    <div className={`fixed top-4 right-4 p-4 rounded-md shadow-lg z-50 ${finalStyle}`}>
      {title && <div className="font-semibold">{title}</div>}
      {description && <div className="text-sm opacity-90">{description}</div>}
      {!title && !description && displayMessage && <div>{displayMessage}</div>}
    </div>
  )
}

const Toaster: React.FC = () => {
  return <div id="toast-container"></div>
}

export { Toast, Toaster }
