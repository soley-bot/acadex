'use client'

import React, { useState, useEffect, useCallback, memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Edit, Trash2, Save, X, Palette } from 'lucide-react'
import { createSupabaseClient } from '@/lib/supabase'
import { logger } from '@/lib/logger'

interface Category {
  id: string
  name: string
  description: string | null
  color: string
  icon: string | null
  type: 'general' | 'quiz' | 'course'
  is_active: boolean
  created_at: string
  updated_at: string
}

interface CategoryManagementProps {
  isOpen: boolean
  onClose: () => void
  onCategoryCreated?: () => void
}

// Static arrays - no recreation on renders
const colorOptions = [
  '#6366f1', '#3b82f6', '#10b981', '#f59e0b', 
  '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16',
  '#f97316', '#ec4899', '#64748b', '#059669'
]

const iconOptions = [
  'folder', 'book', 'edit', 'bookmark', 'mic', 
  'pen-tool', 'book-open', 'headphones', 'message-circle',
  'briefcase', 'graduation-cap', 'star', 'target', 'award'
]

export const CategoryManagement = memo<CategoryManagementProps>(({ isOpen, onClose, onCategoryCreated }) => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#6366f1',
    icon: 'folder',
    type: 'general' as 'general' | 'quiz' | 'course'
  })

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true)
      console.log('Fetching categories...')

      const supabase = createSupabaseClient()

      // Get the current session to include Authorization header
      const { data: { session } } = await supabase.auth.getSession()
      
      // Prepare headers
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      }
      
      // Add Authorization header if we have a session
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }
      
      const response = await fetch('/api/admin/categories', {
        method: 'GET',
        credentials: 'include', // Include cookies as fallback
        headers
      })
      
      console.log('Categories response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('Categories fetch error:', errorData)
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('Categories fetched:', data.categories?.length || 0, 'categories')
      setCategories(data.categories || [])
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      logger.error('Error fetching categories', { error: errorMessage })
      console.error('Category fetch error:', errorMessage)
      alert(`Failed to fetch categories: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      fetchCategories()
    }
  }, [isOpen, fetchCategories])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const supabase = createSupabaseClient()

      // Get the current session to include Authorization header
      const { data: { session } } = await supabase.auth.getSession()
      
      // Prepare headers
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      }
      
      // Add Authorization header if we have a session
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }
      
      let response: Response
      
      if (editingCategory) {
        // Update existing category
        response = await fetch('/api/admin/categories', {
          method: 'PUT',
          credentials: 'include', // Include cookies as fallback
          headers,
          body: JSON.stringify({
            id: editingCategory.id,
            ...formData
          })
        })
      } else {
        // Create new category
        response = await fetch('/api/admin/categories', {
          method: 'POST',
          credentials: 'include', // Include cookies as fallback
          headers,
          body: JSON.stringify(formData)
        })
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      await fetchCategories()
      setShowForm(false)
      setEditingCategory(null)
      setFormData({
        name: '',
        description: '',
        color: '#6366f1',
        icon: 'folder',
        type: 'general'
      })
      
      if (onCategoryCreated) {
        onCategoryCreated()
      }
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      logger.error('Error saving category', { error: errorMessage })
      // TODO: Add user-facing error notification
      console.error('Category save error:', errorMessage)
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description || '',
      color: category.color,
      icon: category.icon || 'folder',
      type: category.type
    })
    setShowForm(true)
  }

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return

    try {
      const response = await fetch(`/api/admin/categories?id=${categoryId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete category')
      }

      await fetchCategories()
    } catch (err: any) {
      logger.error('Error deleting category', { error: err?.message || 'Unknown error' })
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden border border-gray-200">
        <div className="bg-primary px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Category Management</h2>
              <p className="text-white/80 text-sm">Create and manage categories for quizzes and courses</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-5 overflow-y-auto max-h-[calc(90vh-100px)]">
          {/* Header Actions */}
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-base font-semibold text-gray-900">
              Categories ({categories.filter(c => c.is_active).length})
            </h3>
            <button
              onClick={() => {
                setEditingCategory(null)
                setFormData({
                  name: '',
                  description: '',
                  color: '#6366f1',
                  icon: 'folder',
                  type: 'general'
                })
                setShowForm(true)
              }}
              className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
            >
              <Plus size={16} />
              Add Category
            </button>
          </div>

          {/* Category Form */}
          {showForm && (
            <Card className="mb-4 border-primary/20">
              <CardHeader className="bg-primary/5 px-4 py-3">
                <CardTitle className="text-base text-gray-900 font-semibold">
                  {editingCategory ? 'Edit Category' : 'Create New Category'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Category Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="e.g., Advanced Grammar"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Type
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="general">General</option>
                        <option value="quiz">Quiz Only</option>
                        <option value="course">Course Only</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      rows={2}
                      placeholder="Brief description of this category"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Color
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {colorOptions.map(color => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, color }))}
                            className={`w-8 h-8 rounded-full border-2 transition-all ${
                              formData.color === color 
                                ? 'border-gray-800 scale-110' 
                                : 'border-gray-300 hover:border-gray-500'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Icon
                      </label>
                      <select
                        value={formData.icon}
                        onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        {iconOptions.map(icon => (
                          <option key={icon} value={icon}>
                            {icon.charAt(0).toUpperCase() + icon.slice(1).replace('-', ' ')}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3">
                    <button
                      type="submit"
                      className="bg-primary hover:bg-secondary text-white hover:text-black px-5 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
                    >
                      <Save size={14} />
                      {editingCategory ? 'Update' : 'Create'} Category
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false)
                        setEditingCategory(null)
                      }}
                      className="bg-muted/40 hover:bg-muted/60 text-gray-700 px-5 py-2 rounded-lg transition-colors text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">Loading categories...</p>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && categories.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Palette className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No categories yet</h3>
              <p className="text-gray-600 mb-6">Create your first category to organize your quizzes and courses</p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg inline-flex items-center gap-2"
              >
                <Plus size={16} />
                Create Category
              </button>
            </div>
          )}

          {/* Categories List */}
          {!loading && categories.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-1">
              {categories.filter(c => c.is_active).map(category => (
                <Card key={category.id} className="hover:shadow-lg transition-shadow border border-gray-200">
                  <CardContent className="p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                        style={{ backgroundColor: category.color }}
                      >
                        {category.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-sm text-gray-900 truncate">{category.name}</h4>
                        <span className="text-[10px] text-gray-500 uppercase tracking-wide">{category.type}</span>
                      </div>
                    </div>
                    <div className="flex gap-0.5 flex-shrink-0 ml-1">
                      <button
                        onClick={() => handleEdit(category)}
                        className="text-gray-400 hover:text-primary p-1 transition-colors rounded hover:bg-gray-100"
                        title="Edit category"
                      >
                        <Edit size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="text-gray-400 hover:text-red-600 p-1 transition-colors rounded hover:bg-red-50"
                        title="Delete category"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  {category.description && (
                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{category.description}</p>
                  )}
                </CardContent>
              </Card>
            ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
})

CategoryManagement.displayName = 'CategoryManagement'

