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
    success: 'bg-green-600 text-white',
    error: 'bg-red-600 text-white',
    warning: 'bg-yellow-600 text-white',
    info: 'bg-blue-600 text-white'
  }

  const variantStyles = {
    default: 'bg-blue-600 text-white',
    destructive: 'bg-red-600 text-white'
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
