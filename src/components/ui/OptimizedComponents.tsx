'use client'

import { memo, useMemo, useState, useEffect } from 'react'

// Optimized form section component
export const FormSection = memo(({ 
  title, 
  children, 
  className = '',
  collapsible = false,
  defaultExpanded = true
}: {
  title: string
  children: React.ReactNode
  className?: string
  collapsible?: boolean
  defaultExpanded?: boolean
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  )
})

FormSection.displayName = 'FormSection'

// Optimized form field component
export const FormField = memo(({ 
  label, 
  children, 
  error, 
  required = false,
  className = ''
}: {
  label: string
  children: React.ReactNode
  error?: string
  required?: boolean
  className?: string
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
})

FormField.displayName = 'FormField'

// Virtualization helpers for large lists
export function useVirtualization(
  items: any[],
  itemHeight: number,
  containerHeight: number
) {
  return useMemo(() => {
    const visibleCount = Math.ceil(containerHeight / itemHeight)
    const bufferSize = Math.min(5, Math.floor(visibleCount * 0.5))
    
    return {
      visibleCount,
      bufferSize,
      totalHeight: items.length * itemHeight
    }
  }, [items.length, itemHeight, containerHeight])
}

// Debounced input optimization
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
