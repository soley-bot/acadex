'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Course } from '@/lib/supabase'
import { APICourseForm } from '@/components/admin/APICourseForm'
import { EnhancedAPICourseForm } from '@/components/admin/EnhancedAPICourseForm'
import { DeleteCourseModal } from '@/components/admin/DeleteCourseModal'
import { CourseViewModal } from '@/components/admin/CourseViewModal'
import SvgIcon from '@/components/ui/SvgIcon'
import { useAuth } from '@/contexts/AuthContext'

export default function CoursesPage() {
  const { user } = useAuth()
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

  // Fetch courses using API route
  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/admin/courses')
      const result = await response.json()
      
      if (result.success) {
        setCourses(result.data || [])
      } else {
        setError(result.error || 'Failed to fetch courses')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch courses')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  // Filter courses based on search and category
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Calculate statistics
  const courseStats = {
    total: courses.length,
    published: courses.filter(c => c.is_published).length,
    draft: courses.filter(c => !c.is_published).length,
    totalStudents: courses.reduce((sum, c) => sum + (c.student_count || 0), 0)
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
    fetchCourses() // Refresh courses after successful form submission
    // Don't auto-close the form - let users choose when to close
    // setShowCourseForm(false)
    // setEditingCourse(null)
  }

  const handleDeleteSuccess = () => {
    fetchCourses() // Refresh courses after successful deletion
    setShowDeleteModal(false)
    setDeletingCourse(null)
  }

  const handleTogglePublish = async (course: Course) => {
    try {
      const response = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseData: {
            id: course.id,
            is_published: !course.is_published
          },
          action: 'update',
          userId: user?.id
        })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to update course')
      }

      // Update local state
      setCourses(prevCourses => 
        prevCourses.map(c => 
          c.id === course.id 
            ? { ...c, is_published: !c.is_published }
            : c
        )
      )
    } catch (err: any) {
      console.error('Error toggling publish status:', err)
      setError(err.message || 'Failed to update course status. Please try again.')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Check if user is admin (after all hooks)
  if (!user || user.role !== 'admin') {
    return (
      <div className="p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">Only administrators can access course management.</p>
          <p className="text-sm text-gray-500 mt-2">
            Current role: {user?.role || 'Not logged in'}
          </p>
        </div>
      </div>
    )
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
            onClick={() => fetchCourses()}
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
            <SvgIcon icon="plus" size={16} variant="white" />
            Add Enhanced Course
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Courses</p>
                <p className="text-3xl font-bold text-foreground mb-1">{courseStats.total}</p>
                <p className="text-xs text-muted-foreground">All courses on platform</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-full ml-4 flex-shrink-0">
                <SvgIcon icon="book" size={24} className="text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-1">Published</p>
                <p className="text-3xl font-bold text-foreground mb-1">{courseStats.published}</p>
                <p className="text-xs text-muted-foreground">Live courses</p>
              </div>
              <div className="bg-green-50 p-3 rounded-full ml-4 flex-shrink-0">
                <SvgIcon icon="check" size={24} className="text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-1">Drafts</p>
                <p className="text-3xl font-bold text-foreground mb-1">{courseStats.draft}</p>
                <p className="text-xs text-muted-foreground">In development</p>
              </div>
              <div className="bg-yellow-50 p-3 rounded-full ml-4 flex-shrink-0">
                <SvgIcon icon="edit" size={24} className="text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Students</p>
                <p className="text-3xl font-bold text-foreground mb-1">{courseStats.totalStudents}</p>
                <p className="text-xs text-muted-foreground">Enrolled learners</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-full ml-4 flex-shrink-0">
                <SvgIcon icon="contacts" size={24} className="text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <SvgIcon 
            icon="search" 
            size={20} 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
          />
          <input
            type="text"
            placeholder="Search courses or instructors..."
            className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <SvgIcon icon="eye" size={16} />
                    View
                  </button>
                  <button 
                    onClick={() => handleTogglePublish(course)}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 ${
                      course.is_published
                        ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    <SvgIcon 
                      icon={course.is_published ? "eye" : "check"} 
                      size={16} 
                      variant="white" 
                    />
                    {course.is_published ? 'Unpublish' : 'Publish'}
                  </button>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <button 
                    onClick={() => handleEditCourse(course)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <SvgIcon icon="edit" size={16} variant="white" />
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteCourse(course)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <SvgIcon icon="ban" size={16} variant="white" />
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
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2 mx-auto"
                >
                  <SvgIcon icon="plus" size={16} variant="white" />
                  Create Course
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <EnhancedAPICourseForm
        course={editingCourse || undefined}
        isOpen={showCourseForm}
        onClose={() => {
          setShowCourseForm(false)
          setEditingCourse(null)
        }}
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
