'use client'

import { logger } from '@/lib/logger'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Course } from '@/lib/supabase'
import { EnhancedAPICourseForm } from '@/components/admin/EnhancedAPICourseForm'
import { DeleteCourseModal } from '@/components/admin/DeleteCourseModal'
import { CourseViewModal } from '@/components/admin/CourseViewModal'
import { CategoryManagement } from '@/components/admin/CategoryManagement'
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
  const [showCategoryManagement, setShowCategoryManagement] = useState(false)

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
      ? 'bg-emerald-100 text-emerald-800' 
      : 'bg-orange-100 text-orange-800'
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
      logger.error('Error toggling publish status:', err)
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="flex items-center justify-center min-h-screen p-6">
          <div className="bg-white rounded-2xl shadow-lg border border-red-200 p-8 max-w-md w-full text-center">
            <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <SvgIcon icon="block" size={24} className="text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Access Denied</h1>
            <p className="text-gray-700 mb-2">Only administrators can access course management.</p>
            <p className="text-sm text-gray-500">
              Current role: {user?.role || 'Not logged in'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="relative mb-6">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
              <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-blue-100 opacity-25 mx-auto"></div>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading courses...</h2>
            <p className="text-gray-600">Fetching the latest course data</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="flex items-center justify-center min-h-screen p-6">
          <div className="bg-white rounded-2xl shadow-lg border border-red-200 p-8 max-w-md w-full text-center">
            <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <SvgIcon icon="error" size={24} className="text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Failed to load courses</h2>
            <p className="text-red-600 mb-6 font-medium">{error}</p>
            <button 
              onClick={() => fetchCourses()}
              className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-3 rounded-lg transition-colors font-semibold w-full flex items-center justify-center gap-2"
            >
              <SvgIcon icon="refresh" size={16} variant="white" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header Section - Enhanced with better design */}
      <div className="mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-2">Course Management</h1>
              <p className="text-gray-600 text-lg">Create, edit, and manage all educational content on your platform</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button 
                onClick={handleCreateCourse}
                className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <SvgIcon icon="add" size={20} variant="white" />
                <span className="sm:hidden">Add Course</span>
                <span className="hidden sm:inline">Create New Course</span>
              </button>
              <button
                onClick={() => setShowCategoryManagement(true)}
                className="bg-gray-700 border border-gray-600 hover:bg-gray-800 text-white px-6 py-3 sm:px-6 sm:py-4 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 font-semibold hover:shadow-md"
              >
                <SvgIcon icon="settings" size={20} />
                <span>Categories</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards - Enhanced design */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="bg-white border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-600 mb-2">Published Courses</p>
                <p className="text-3xl font-bold text-gray-900 mb-1">{courseStats.published}</p>
                <p className="text-sm text-emerald-600 font-medium">Active & Live</p>
              </div>
              <div className="bg-emerald-100 p-4 rounded-xl ml-4 flex-shrink-0 group-hover:bg-emerald-200 transition-colors">
                <SvgIcon icon="check" size={24} className="text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-600 mb-2">Draft Courses</p>
                <p className="text-3xl font-bold text-gray-900 mb-1">{courseStats.draft}</p>
                <p className="text-sm text-orange-600 font-medium">In Progress</p>
              </div>
              <div className="bg-orange-100 p-4 rounded-xl ml-4 flex-shrink-0 group-hover:bg-orange-200 transition-colors">
                <SvgIcon icon="edit" size={24} className="text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group sm:col-span-2 lg:col-span-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-600 mb-2">Total Students</p>
                <p className="text-3xl font-bold text-gray-900 mb-1">{courseStats.totalStudents}</p>
                <p className="text-sm text-blue-600 font-medium">Enrolled Learners</p>
              </div>
              <div className="bg-blue-100 p-4 rounded-xl ml-4 flex-shrink-0 group-hover:bg-blue-200 transition-colors">
                <SvgIcon icon="contacts" size={24} className="text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter - Enhanced design */}
      <div className="mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <SvgIcon 
                icon="search" 
                size={20} 
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" 
              />
              <input
                type="text"
                placeholder="Search courses by title or instructor..."
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-64">
              <select
                className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors text-base font-medium"
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
          </div>
        </div>
      </div>

      {/* Courses Grid - Enhanced card design */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <Card key={course.id} className="hover:shadow-xl transition-all duration-300 bg-white border-gray-200 transform hover:-translate-y-1 group">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg font-bold text-gray-900 leading-tight mb-2">{course.title}</CardTitle>
                  <CardDescription className="text-gray-600 line-clamp-2">{course.description}</CardDescription>
                </div>
                <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${
                  course.is_published 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-orange-100 text-orange-800'
                }`}>
                  {course.is_published ? 'Live' : 'Draft'}
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-3">
                    <div className="flex flex-col">
                      <span className="text-gray-500 text-xs font-medium mb-1">Instructor</span>
                      <span className="font-semibold text-gray-900 truncate">{course.instructor_name}</span>
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="text-gray-500 text-xs font-medium mb-1">Students</span>
                      <span className="font-semibold text-blue-600">{course.student_count}</span>
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="text-gray-500 text-xs font-medium mb-1">Duration</span>
                      <span className="font-semibold text-gray-900">{course.duration || 'Not set'}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex flex-col">
                      <span className="text-gray-500 text-xs font-medium mb-1">Price</span>
                      <span className="font-bold text-green-600 text-lg">${course.price}</span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-gray-500 text-xs font-medium mb-1">Category</span>
                      <span className="font-semibold text-gray-900 capitalize truncate">{course.category}</span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-gray-500 text-xs font-medium mb-1">Created</span>
                      <span className="font-medium text-gray-700 text-xs">{formatDate(course.created_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons - Enhanced design */}
                <div className="space-y-3 pt-2 border-t border-gray-100">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleViewCourse(course)}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-md"
                    >
                      <SvgIcon icon="eye" size={16} />
                      <span>View</span>
                    </button>
                    <button 
                      onClick={() => handleTogglePublish(course)}
                      className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-md ${
                        course.is_published
                          ? 'bg-amber-600 hover:bg-amber-700 text-white'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      <SvgIcon 
                        icon={course.is_published ? "visibility_off" : "check"} 
                        size={16} 
                        variant="white" 
                      />
                      <span>
                        {course.is_published ? 'Unpublish' : 'Publish'}
                      </span>
                    </button>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEditCourse(course)}
                      className="flex-1 bg-gray-800 hover:bg-gray-900 text-white px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-md"
                    >
                      <SvgIcon icon="edit" size={16} variant="white" />
                      <span>Edit</span>
                    </button>
                    <button 
                      onClick={() => handleDeleteCourse(course)}
                      className="flex-1 bg-red-700 hover:bg-red-800 text-white px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-md"
                    >
                      <SvgIcon icon="delete" size={16} variant="white" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State - Enhanced design */}
      {filteredCourses.length === 0 && !loading && (
        <div className="mt-12">
          <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
            <CardContent className="p-12">
              <div className="text-center">
                <div className="bg-gray-200 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <SvgIcon icon="school" size={32} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">No courses found</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto text-lg">
                  {searchTerm || selectedCategory !== 'all' 
                    ? 'Try adjusting your search criteria or browse all categories'
                    : 'Start creating engaging educational content for your students'
                  }
                </p>
                {!searchTerm && selectedCategory === 'all' && (
                  <button 
                    onClick={handleCreateCourse}
                    className="bg-gray-800 hover:bg-gray-900 text-white px-8 py-4 rounded-xl transition-all duration-300 flex items-center gap-3 mx-auto font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <SvgIcon icon="add" size={20} variant="white" />
                    Create Your First Course
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
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

      <CategoryManagement
        isOpen={showCategoryManagement}
        onClose={() => setShowCategoryManagement(false)}
        onCategoryCreated={() => {
          // Refresh courses when new categories are created
          fetchCourses()
        }}
      />
    </div>
  )
}
