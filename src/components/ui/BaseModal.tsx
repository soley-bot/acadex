'use client'

import { ReactNode } from 'react'
import { X } from 'lucide-react'

interface BaseModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  headerIcon?: ReactNode
  headerGradient?: 'blue' | 'purple' | 'red' | 'green' | 'orange' | 'gray'
  children: ReactNode
  footer?: ReactNode
  preventClose?: boolean
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg', 
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  '2xl': 'max-w-6xl'
}

const gradientClasses = {
  blue: 'bg-gradient-to-r from-blue-600 to-indigo-600',
  purple: 'bg-gradient-to-r from-purple-600 to-indigo-600', 
  red: 'bg-gradient-to-r from-red-600 to-pink-600',
  green: 'bg-gradient-to-r from-green-600 to-emerald-600',
  orange: 'bg-gradient-to-r from-orange-600 to-amber-600',
  gray: 'bg-gradient-to-r from-gray-600 to-slate-600'
}

export function BaseModal({ 
  isOpen, 
  onClose, 
  title, 
  subtitle, 
  size = 'lg',
  headerIcon,
  headerGradient = 'blue',
  children, 
  footer,
  preventClose = false
}: BaseModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden`}>
        {/* Header */}
        <div className={`${gradientClasses[headerGradient]} p-6 text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {headerIcon && (
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  {headerIcon}
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold text-white">{title}</h2>
                {subtitle && (
                  <p className="text-white/80 text-sm font-medium mt-1">{subtitle}</p>
                )}
              </div>
            </div>
            {!preventClose && (
              <button
                onClick={onClose}
                className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
                aria-label="Close modal"
              >
                <X size={20} color="white" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="border-t border-gray-100 px-6 py-4 bg-gray-50">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
