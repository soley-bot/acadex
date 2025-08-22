'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Edit, Trash2, Save, X, Palette } from 'lucide-react'
import { supabase } from '@/lib/supabase'
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

export function CategoryManagement({ isOpen, onClose, onCategoryCreated }: CategoryManagementProps) {
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

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/categories')
      
      if (!response.ok) {
        throw new Error('Failed to fetch categories')
      }
      
      const data = await response.json()
      setCategories(data.categories || [])
    } catch (err) {
      logger.error('Error fetching categories:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchCategories()
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingCategory) {
        // Update existing category
        const response = await fetch('/api/admin/categories', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: editingCategory.id,
            ...formData
          })
        })

        if (!response.ok) {
          throw new Error('Failed to update category')
        }
      } else {
        // Create new category
        const response = await fetch('/api/admin/categories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        })

        if (!response.ok) {
          throw new Error('Failed to create category')
        }
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
    } catch (err) {
      logger.error('Error saving category:', err)
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
    } catch (err) {
      logger.error('Error deleting category:', err)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="surface-primary rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-subtle">
        <div className="bg-gradient-to-r from-secondary to-secondary/90 p-6 text-current">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Category Management</h2>
              <p className="text-purple-100">Create and manage categories for quizzes and courses</p>
            </div>
            <button
              onClick={onClose}
              className="text-purple-200 hover:text-white transition-colors p-2"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Header Actions */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
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
              className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus size={16} />
              Add Category
            </button>
          </div>

          {/* Category Form */}
          {showForm && (
            <Card className="mb-6 border-purple-200">
              <CardHeader className="bg-purple-50">
                <CardTitle className="text-lg text-purple-900">
                  {editingCategory ? 'Edit Category' : 'Create New Category'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="e.g., Advanced Grammar"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="general">General</option>
                        <option value="quiz">Quiz Only</option>
                        <option value="course">Course Only</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      rows={3}
                      placeholder="Brief description of this category"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Color
                      </label>
                      <div className="flex flex-wrap gap-2">
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Icon
                      </label>
                      <select
                        value={formData.icon}
                        onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        {iconOptions.map(icon => (
                          <option key={icon} value={icon}>
                            {icon.charAt(0).toUpperCase() + icon.slice(1).replace('-', ' ')}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="bg-primary text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <Save size={16} />
                      {editingCategory ? 'Update' : 'Create'} Category
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false)
                        setEditingCategory(null)
                      }}
                      className="bg-muted/40 hover:bg-muted/60 text-gray-700 px-6 py-2 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Categories List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.filter(c => c.is_active).map(category => (
              <Card key={category.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-medium"
                        style={{ backgroundColor: category.color }}
                      >
                        {category.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{category.name}</h4>
                        <span className="text-xs text-gray-500 uppercase">{category.type}</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(category)}
                        className="text-gray-400 hover:text-purple-600 p-1 transition-colors"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="text-gray-400 hover:text-primary p-1 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  {category.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">{category.description}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {categories.filter(c => c.is_active).length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Palette className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No categories yet</h3>
              <p className="text-gray-600 mb-4">Create your first category to organize your content</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
