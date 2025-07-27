'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, Plus, Users, BookOpen, Star, Calendar, Edit, Trash2, Eye, MoreVertical } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { CourseForm } from '@/components/admin/CourseForm'
import { EnhancedCourseForm } from '@/components/admin/EnhancedCourseForm'
import { DeleteCourseModal } from '@/components/admin/DeleteCourseModal'
import { CourseViewModal } from '@/components/admin/CourseViewModal'

interface Course {
  id: string
  title: string
  description: string
  instructor_name: string
  price: number
  original_price?: number
  discount_percentage?: number
  category: string
  level: 'beginner' | 'intermediate' | 'advanced'
  duration: string | null
  image_url: string | null
  video_preview_url?: string
  tags?: string[]
  prerequisites?: string[]
  learning_objectives?: string[]
  status?: string
  student_count: number
  is_published: boolean
  is_free?: boolean
  created_at: string
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  
  // Modal states
  const [showCourseForm, setShowCourseForm] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [viewingCourse, setViewingCourse] = useState<Course | null>(null)

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('courses')
        .select(`
          id,
          title,
          description,
          instructor_name,
          price,
          original_price,
          discount_percentage,
          category,
          level,
          duration,
          image_url,
          video_preview_url,
          tags,
          prerequisites,
          learning_objectives,
          status,
          is_published,
          is_free,
          created_at
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Get enrollment counts separately
      const courseIds = data.map(course => course.id)
      const { data: enrollmentCounts, error: enrollmentError } = await supabase
        .from('enrollments')
        .select('course_id')
        .in('course_id', courseIds)

      if (enrollmentError) {
        console.error('Error fetching enrollment counts:', enrollmentError)
      }

      // Transform data to include student count
      const coursesWithStudentCount = data.map(course => {
        const studentCount = enrollmentCounts?.filter(e => e.course_id === course.id).length || 0
        return {
          ...course,
          student_count: studentCount
        }
      })

      setCourses(coursesWithStudentCount)
    } catch (err) {
      console.error('Error fetching courses:', err)
      setError('Failed to load courses. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  // Filter courses based on search and category
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Calculate statistics
  const courseStats = {
    total: courses.length,
    published: courses.filter(c => c.is_published).length,
    draft: courses.filter(c => !c.is_published).length,
    totalStudents: courses.reduce((sum, c) => sum + c.student_count, 0)
  }

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(courses.map(c => c.category)))]

  const getStatusBadge = (isPublished: boolean) => {
    return isPublished 
      ? 'bg-green-100 text-green-800' 
      : 'bg-yellow-100 text-yellow-800'
  }

  const handleCreateCourse = () => {
    setEditingCourse(null)
    setShowCourseForm(true)
  }

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course)
    setShowCourseForm(true)
  }

  const handleDeleteCourse = (course: Course) => {
    setDeletingCourse(course)
    setShowDeleteModal(true)
  }

  const handleViewCourse = (course: Course) => {
    setViewingCourse(course)
    setShowViewModal(true)
  }

  const handleFormSuccess = () => {
    fetchCourses()
    setShowCourseForm(false)
    setEditingCourse(null)
  }

  const handleDeleteSuccess = () => {
    fetchCourses()
    setShowDeleteModal(false)
    setDeletingCourse(null)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading courses...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-center">
          <p className="text-red-600 mb-2">{error}</p>
          <button 
            onClick={fetchCourses}
            className="mt-2 text-red-600 hover:text-red-700 underline"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Course Management</h1>
            <p className="text-gray-600">Create and manage all platform courses</p>
          </div>
          <button 
            onClick={handleCreateCourse}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Course
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courseStats.total}</div>
            <p className="text-xs text-gray-500">All courses on platform</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <Star className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courseStats.published}</div>
            <p className="text-xs text-gray-500">Live courses</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courseStats.draft}</div>
            <p className="text-xs text-gray-500">In development</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courseStats.totalStudents}</div>
            <p className="text-xs text-gray-500">Enrolled learners</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search courses or instructors..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <Card key={course.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <CardDescription className="mt-1">{course.description}</CardDescription>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(course.is_published)}`}>
                  {course.is_published ? 'published' : 'draft'}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Instructor:</span>
                  <span className="font-medium">{course.instructor_name}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Students:</span>
                  <span className="font-medium">{course.student_count}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Duration:</span>
                  <span className="font-medium">{course.duration || 'Not set'}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Price:</span>
                  <span className="font-medium">${course.price}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Category:</span>
                  <span className="font-medium capitalize">{course.category}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Created:</span>
                  <span className="font-medium">{formatDate(course.created_at)}</span>
                </div>

                <div className="flex gap-2 pt-2">
                  <button 
                    onClick={() => handleViewCourse(course)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-center"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </button>
                  <button 
                    onClick={() => handleEditCourse(course)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-center"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteCourse(course)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-center"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredCourses.length === 0 && !loading && (
        <Card className="mt-8 border-2 border-dashed border-gray-300">
          <CardContent className="p-8">
            <div className="text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || selectedCategory !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Start building engaging content for your students'
                }
              </p>
              {!searchTerm && selectedCategory === 'all' && (
                <button 
                  onClick={handleCreateCourse}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Create Course
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <EnhancedCourseForm
        course={editingCourse ? {
          ...editingCourse,
          duration: editingCourse.duration || '',
          image_url: editingCourse.image_url || undefined,
          video_preview_url: editingCourse.video_preview_url || undefined,
          original_price: editingCourse.original_price || 0,
          discount_percentage: editingCourse.discount_percentage || 0,
          tags: editingCourse.tags || [],
          prerequisites: editingCourse.prerequisites || [],
          learning_objectives: editingCourse.learning_objectives || [],
          status: editingCourse.status || 'draft',
          is_free: editingCourse.is_free || false
        } : undefined}
        isOpen={showCourseForm}
        onClose={() => setShowCourseForm(false)}
        onSuccess={handleFormSuccess}
      />

      <DeleteCourseModal
        course={deletingCourse}
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onSuccess={handleDeleteSuccess}
      />

      <CourseViewModal
        course={viewingCourse ? {
          id: viewingCourse.id,
          title: viewingCourse.title,
          description: viewingCourse.description,
          instructor_name: viewingCourse.instructor_name,
          price: viewingCourse.price,
          category: viewingCourse.category,
          level: viewingCourse.level,
          duration: viewingCourse.duration || 'Not set',
          image_url: viewingCourse.image_url || undefined,
          is_published: viewingCourse.is_published,
          created_at: viewingCourse.created_at,
          student_count: viewingCourse.student_count
        } : null}
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        onEdit={() => {
          setShowViewModal(false)
          if (viewingCourse) {
            handleEditCourse(viewingCourse)
          }
        }}
      />
    </div>
  )
}