'use client'

import { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle, memo } from 'react'
import { ChevronDown, Plus, Settings } from 'lucide-react'
import { createSupabaseClient } from '@/lib/supabase'
import { logger } from '@/lib/logger'

interface Category {
  id: string
  name: string
  description: string | null
  color: string
  icon: string | null
  type: 'general' | 'quiz' | 'course'
}

interface CategorySelectorProps {
  value: string
  onChange: (value: string) => void
  type?: 'general' | 'quiz' | 'course'
  onManageCategories?: () => void
  placeholder?: string
  className?: string
  onRefresh?: () => void // Add refresh callback
}

// Add ref interface for imperative methods
export interface CategorySelectorRef {
  refreshCategories: () => void
}

export const CategorySelector = memo(forwardRef<CategorySelectorRef, CategorySelectorProps>(({ 
  value, 
  onChange, 
  type = 'general', 
  onManageCategories,
  placeholder = "Select a category",
  className = ""
}, ref) => {
  const [categories, setCategories] = useState<Category[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const supabase = createSupabaseClient()

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .in('type', type === 'general' ? ['general'] : ['general', type])
        .order('name')

      if (error) throw error
      setCategories(data || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load categories'
      logger.error('Error fetching categories:', err)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [type]) // Only depend on type, not on other props

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  // Expose refresh method via ref
  useImperativeHandle(ref, () => ({
    refreshCategories: fetchCategories
  }), [fetchCategories])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedCategory = categories.find(cat => cat.name.toLowerCase() === value.toLowerCase())

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 text-left border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background hover:bg-muted transition-colors flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          {selectedCategory && (
            <div
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: selectedCategory.color }}
            />
          )}
          <span className={selectedCategory ? 'text-foreground' : 'text-muted-foreground'}>
            {selectedCategory ? selectedCategory.name : placeholder}
          </span>
        </div>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div 
          className="absolute top-full left-0 right-0 mt-2 bg-background border border-input rounded-lg shadow-xl py-2 max-h-64 overflow-y-auto"
          style={{
            zIndex: 9999, // Very high z-index to escape modal constraints
            position: 'fixed', // Use fixed positioning to escape overflow constraints
            left: dropdownRef.current?.getBoundingClientRect()?.left || 0,
            top: (dropdownRef.current?.getBoundingClientRect()?.bottom || 0) + 8,
            width: dropdownRef.current?.getBoundingClientRect()?.width || 'auto'
          }}
        >
          {/* Header with manage button */}
          {onManageCategories && (
            <div className="px-4 py-2 border-b border-border flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Select Category</span>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false)
                  onManageCategories()
                }}
                className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1"
              >
                <Settings size={14} />
                Manage
              </button>
            </div>
          )}

          {/* Category options */}
          {loading ? (
            <div className="px-4 py-3 text-sm text-muted-foreground flex items-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
              Loading categories...
            </div>
          ) : error ? (
            <div className="px-4 py-3">
              <div className="text-sm text-destructive mb-2">Failed to load categories</div>
              <button
                type="button"
                onClick={() => fetchCategories()}
                className="text-sm text-primary hover:text-primary/80 font-medium"
              >
                Try again
              </button>
            </div>
          ) : categories.length === 0 ? (
            <div className="px-4 py-3">
              <div className="text-sm text-muted-foreground mb-2">No categories found</div>
              {onManageCategories && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false)
                    onManageCategories()
                  }}
                  className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1"
                >
                  <Plus size={14} />
                  Create first category
                </button>
              )}
            </div>
          ) : (
            categories.map(category => (
              <button
                key={category.id}
                type="button"
                onClick={() => {
                  onChange(category.name)
                  setIsOpen(false)
                }}
                className={`w-full px-4 py-3 text-left hover:bg-muted flex items-center gap-3 transition-colors ${
                  selectedCategory?.id === category.id ? 'bg-primary/5 text-primary' : 'text-foreground'
                }`}
              >
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: category.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{category.name}</div>
                  {category.description && (
                    <div className="text-sm text-muted-foreground truncate">{category.description}</div>
                  )}
                </div>
                {category.type !== 'general' && (
                  <span className="text-xs px-2 py-1 bg-muted/40 text-muted-foreground rounded-full">
                    {category.type}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}))

// Add display name for debugging
CategorySelector.displayName = 'CategorySelector'

