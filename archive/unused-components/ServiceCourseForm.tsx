// Option 2: Service Role Client for Admin Operations
// Replace SimpleCourseForm with this version that bypasses RLS

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useAuth } from '@/contexts/AuthContext'
import { Course } from '@/lib/supabase'

// Create service role client that bypasses RLS
const supabaseService = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  // You need to add this to your .env.local file
  // Get it from Supabase Dashboard > Settings > API > service_role key
  'YOUR_SERVICE_ROLE_KEY_HERE' // Replace with actual service role key
)

interface ServiceCourseFormProps {
  course?: Course
  isOpen: boolean
  onClose: () => void
  onSuccess: (course: Course) => void
}

export function ServiceCourseForm({ course, isOpen, onClose, onSuccess }: ServiceCourseFormProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'english',
    level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    duration: '',
    price: 0,
    is_published: false
  })

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title || '',
        description: course.description || '',
        category: course.category || 'english',
        level: course.level || 'beginner' as 'beginner' | 'intermediate' | 'advanced',
        duration: course.duration || '',
        price: course.price || 0,
        is_published: course.is_published || false
      })
    } else {
      setFormData({
        title: '',
        description: '',
        category: 'english',
        level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
        duration: '',
        price: 0,
        is_published: false
      })
    }
    setError(null)
  }, [course])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const courseData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        level: formData.level,
        duration: formData.duration.trim(),
        price: formData.price,
        is_published: formData.is_published,
        instructor_id: user.id,
        instructor_name: user.name || 'Unknown Instructor'
      }

      let result
      if (course) {
        // Update using service role (bypasses RLS)
        const { data, error: updateError } = await supabaseService
          .from('courses')
          .update(courseData)
          .eq('id', course.id)
          .select()
          .single()

        if (updateError) throw updateError
        result = data
      } else {
        // Create using service role (bypasses RLS)
        const { data, error: createError } = await supabaseService
          .from('courses')
          .insert(courseData)
          .select()
          .single()

        if (createError) throw createError
        result = data
      }

      onSuccess(result as Course)
      onClose()

    } catch (err: any) {
      console.error('Service course save error:', err)
      setError(err.message || 'Failed to save course')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">
            {course ? 'Edit Course' : 'Create Course'} (Service Mode)
          </h2>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="english">English</option>
                  <option value="business">Business</option>
                  <option value="technology">Technology</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Level
                </label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration
                </label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 2 hours"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price ($)
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_published"
                checked={formData.is_published}
                onChange={(e) => setFormData(prev => ({ ...prev, is_published: e.target.checked }))}
                className="mr-2"
              />
              <label htmlFor="is_published" className="text-sm font-medium text-gray-700">
                Publish immediately
              </label>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Saving...' : (course ? 'Update' : 'Create')} Course
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
