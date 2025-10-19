/**
 * Collapsible Section Component
 * Optimized for mobile space usage with touch interactions
 */

'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface CollapsibleSectionProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  className?: string
  icon?: React.ReactNode
}

export function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
  className = '',
  icon
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className={`border-2 rounded-xl overflow-hidden transition-all duration-300 ${
      isOpen ? 'shadow-md' : 'shadow-sm hover:shadow-md'
    } ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 text-left flex items-center justify-between transition-all duration-300 touch-manipulation min-h-[44px] ${
          isOpen
            ? 'bg-gradient-to-r from-gray-50 to-gray-100'
            : 'bg-gray-50 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100'
        }`}
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          {icon && (
            <span className="transform transition-transform duration-300 hover:scale-110">
              {icon}
            </span>
          )}
          <span className="font-semibold text-gray-900">{title}</span>
        </div>
        <div className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDown className="w-5 h-5 text-gray-600" />
        </div>
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-4 bg-white">
          {children}
        </div>
      </div>
    </div>
  )
}

