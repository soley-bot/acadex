import { useState } from 'react'

export interface ToastProps {
  title: string
  description?: string
  variant?: 'default' | 'destructive'
  duration?: number
}

// Toast hook that matches shadcn/ui interface
export function useToast() {
  const [toasts, setToasts] = useState<(ToastProps & { id: string })[]>([])

  const toast = (props: ToastProps) => {
    const id = Math.random().toString(36).substr(2, 9)
    
    // Convert to the internal toast format
    const internalToast = {
      id,
      type: props.variant === 'destructive' ? 'error' as const : 'success' as const,
      title: props.title,
      message: props.description,
      duration: props.duration || 5000
    }
    
    setToasts(prev => [...prev, { ...props, id }])
    
    // Auto-remove after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, props.duration || 5000)
  }

  const dismiss = (toastId: string) => {
    setToasts(prev => prev.filter(t => t.id !== toastId))
  }

  return {
    toast,
    dismiss,
    toasts
  }
}