'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { 
  BookOpen, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye,
  Users,
  Clock,
  Star,
  DollarSign,
  Search,
  Filter,
  Save,
  X,
  Loader2
} from 'lucide-react'

// Exact database schema types
interface CourseData {
  id?: string
  title: string
  description: string
  instructor_id: string
  instructor_name: string
  category: string
  level: 'beginner' | 'intermediate' | 'advanced'
  price: number
  duration: string
  image_url?: string | null
  thumbnail_url?: string | null
  video_preview_url?: string | null
  tags?: string[] | null
  prerequisites?: string[] | null
  learning_objectives?: string[] | null
  status?: 'draft' | 'review' | 'published' | 'archived'
  published_at?: string | null
  archived_at?: string | null
  original_price?: number | null
  discount_percentage?: number | null
  is_free?: boolean
  rating?: number | null
  student_count: number
  is_published: boolean
  created_at?: string
  updated_at?: string
}

interface CourseModule {
  id?: string
  course_id: string
  title: string
  description?: string | null
  order_index: number
  is_published: boolean
}

interface CourseLesson {
  id?: string
  module_id: string
  title: string
  description?: string | null
  content?: string | null
  video_url?: string | null
  duration_minutes: number
  order_index: number
  is_published: boolean
  is_free_preview: boolean
}

// Simple course form component that matches database schema exactly
function SimpleCourseForm({ 
  isOpen, 
  onClose, 
  onSuccess 
}: { 
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<CourseData>({
    title: '',
    description: '',
    instructor_id: user?.id || '',
    instructor_name: user?.name || '',
    category: 'English Grammar',
    level: 'beginner',
    price: 0,
    duration: '4 weeks',
    image_url: null,
    learning_objectives: [''],
    status: 'draft',
    is_free: false,
    student_count: 0,
    is_published: false
  })

  const [modules, setModules] = useState<Array<{
    title: string
    lessons: Array<{
      title: string
      content: string
      duration_minutes: number
      is_free_preview: boolean
    }>
  }>>([
    {
      title: 'Introduction',
      lessons: [{
        title: 'Welcome to the Course',
        content: 'Course introduction content...',
        duration_minutes: 10,
        is_free_preview: true
      }]
    }
  ])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🚀 Starting course creation with schema-accurate data')
    
    if (!user) {
      setError('User not authenticated')
      return
    }

    if (!formData.title || !formData.description) {
      setError('Title and description are required')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Prepare course data exactly matching database schema
      const courseData: CourseData = {
        title: formData.title,
        description: formData.description,
        instructor_id: user.id,
        instructor_name: user.name || 'Unknown Instructor',
        category: formData.category,
        level: formData.level,
        price: Number(formData.price) || 0,
        duration: formData.duration,
        image_url: formData.image_url || null,
        learning_objectives: formData.learning_objectives || [],
        status: 'draft',
        is_free: formData.price === 0,
        student_count: 0,
        is_published: false,
        updated_at: new Date().toISOString()
      }

      console.log('📊 Course data prepared:', courseData)

      // Insert course
      const { data: courseResult, error: courseError } = await supabase
        .from('courses')
        .insert(courseData)
        .select()
        .single()

      if (courseError) {
        console.error('❌ Course insert error:', courseError)
        throw courseError
      }

      console.log('✅ Course created:', courseResult)

      const courseId = courseResult.id

      // Insert modules and lessons
      for (let moduleIndex = 0; moduleIndex < modules.length; moduleIndex++) {
        const moduleData = modules[moduleIndex]
        
        if (!moduleData) continue
        
        const moduleRecord: CourseModule = {
          course_id: courseId,
          title: moduleData.title,
          description: null,
          order_index: moduleIndex,
          is_published: true
        }

        console.log(`📝 Creating module ${moduleIndex}:`, moduleRecord)

        const { data: moduleResult, error: moduleError } = await supabase
          .from('course_modules')
          .insert(moduleRecord)
          .select()
          .single()

        if (moduleError) {
          console.error(`❌ Module ${moduleIndex} error:`, moduleError)
          throw moduleError
        }

        console.log(`✅ Module ${moduleIndex} created:`, moduleResult)

        // Insert lessons for this module
        for (let lessonIndex = 0; lessonIndex < moduleData.lessons.length; lessonIndex++) {
          const lessonData = moduleData.lessons[lessonIndex]
          
          if (!lessonData) continue
          
          const lessonRecord: CourseLesson = {
            module_id: moduleResult.id,
            title: lessonData.title,
            description: null,
            content: lessonData.content,
            video_url: null,
            duration_minutes: lessonData.duration_minutes,
            order_index: lessonIndex,
            is_published: true,
            is_free_preview: lessonData.is_free_preview
          }

          console.log(`📄 Creating lesson ${lessonIndex}:`, lessonRecord)

          const { error: lessonError } = await supabase
            .from('course_lessons')
            .insert(lessonRecord)

          if (lessonError) {
            console.error(`❌ Lesson ${lessonIndex} error:`, lessonError)
            throw lessonError
          }

          console.log(`✅ Lesson ${lessonIndex} created successfully`)
        }
      }

      console.log('🎉 Course creation completed successfully!')
      onSuccess()
      onClose()

    } catch (err) {
      console.error('💥 Fatal error in course creation:', err)
      setError(err instanceof Error ? err.message : 'Failed to create course')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Create New Course</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Advanced English Grammar"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe what students will learn..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="English Grammar">English Grammar</option>
                <option value="IELTS Preparation">IELTS Preparation</option>
                <option value="Vocabulary Building">Vocabulary Building</option>
                <option value="Business English">Business English</option>
                <option value="Conversation Skills">Conversation Skills</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Level
              </label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price ($)
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration
              </label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 4 weeks, 10 hours"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Create Course
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<CourseData[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const loadCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setCourses(data || [])
    } catch (error) {
      console.error('Error loading courses:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCourses()
  }, [])

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Course Management</h1>
              <p className="text-gray-600 mt-2">Manage your courses and content</p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Course
            </button>
          </div>

          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div key={course.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {course.title}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      course.is_published 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {course.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {course.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{course.student_count}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        <span>${course.price}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{course.duration}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button className="flex-1 text-center py-2 px-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                      <Eye className="w-4 h-4 inline mr-1" />
                      View
                    </button>
                    <button className="flex-1 text-center py-2 px-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                      <Edit3 className="w-4 h-4 inline mr-1" />
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <SimpleCourseForm
          isOpen={showCreateForm}
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => {
            loadCourses()
            setShowCreateForm(false)
          }}
        />
      </div>
    </div>
  )
}
