'use client'

import { useState, useEffect } from 'react'
import { Plus, X, Search, User, BookOpen } from 'lucide-react'
import type { Course, User as UserType } from '@/lib/supabase'

interface ManualEnrollmentModalProps {
  isOpen: boolean
  onClose: () => void
  onEnrollmentCreated: () => void
}

export function ManualEnrollmentModal({ isOpen, onClose, onEnrollmentCreated }: ManualEnrollmentModalProps) {
  const [users, setUsers] = useState<UserType[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedUserId, setSelectedUserId] = useState('')
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [userSearch, setUserSearch] = useState('')
  const [courseSearch, setCourseSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      fetchUsers()
      fetchCourses()
    }
  }, [isOpen])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'GET',
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`)
      }

      const data = await response.json()
      setUsers(data.users || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/admin/courses', {
        method: 'GET',
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch courses: ${response.status}`)
      }

      const data = await response.json()
      // Filter for published courses only
      const publishedCourses = (data.courses || []).filter((course: Course) => course.is_published)
      setCourses(publishedCourses)
    } catch (error) {
      console.error('Error fetching courses:', error)
    }
  }

  const handleEnroll = async () => {
    if (!selectedUserId || !selectedCourseId) {
      setError('Please select both a user and a course')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          user_id: selectedUserId,
          course_id: selectedCourseId
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create enrollment')
      }

      onEnrollmentCreated()
      onClose()
      resetForm()
    } catch (error: any) {
      setError(error.message || 'Failed to create enrollment')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setSelectedUserId('')
    setSelectedCourseId('')
    setUserSearch('')
    setCourseSearch('')
    setError('')
  }

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    user.email?.toLowerCase().includes(userSearch.toLowerCase())
  )

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(courseSearch.toLowerCase()) ||
    course.instructor_name.toLowerCase().includes(courseSearch.toLowerCase())
  )

  const selectedUser = users.find(u => u.id === selectedUserId)
  const selectedCourse = courses.find(c => c.id === selectedCourseId)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Plus className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Manual Enrollment</h2>
                <p className="text-sm text-gray-600">Enroll a student in a course without payment</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Select User */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Student
            </label>
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                {filteredUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => setSelectedUserId(user.id)}
                    className={`w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                      selectedUserId === user.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user.name}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>
                      {selectedUserId === user.id && (
                        <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {selectedUser && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Selected:</strong> {selectedUser.name} ({selectedUser.email})
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Select Course */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Course
            </label>
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search courses by title or instructor..."
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                {filteredCourses.map((course) => (
                  <button
                    key={course.id}
                    onClick={() => setSelectedCourseId(course.id)}
                    className={`w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                      selectedCourseId === course.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <BookOpen className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {course.title}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {course.instructor_name} • ${course.price} • {course.level}
                        </p>
                      </div>
                      {selectedCourseId === course.id && (
                        <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {selectedCourse && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Selected:</strong> {selectedCourse.title} (${selectedCourse.price})
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          {selectedUser && selectedCourse && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-green-800 mb-2">Enrollment Summary</h4>
              <div className="space-y-1 text-sm text-green-700">
                <p><strong>Student:</strong> {selectedUser.name}</p>
                <p><strong>Course:</strong> {selectedCourse.title}</p>
                <p><strong>Price:</strong> ${selectedCourse.price} (Free enrollment)</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={() => {
              onClose()
              resetForm()
            }}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleEnroll}
            disabled={loading || !selectedUserId || !selectedCourseId}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
            <span>{loading ? 'Enrolling...' : 'Enroll Student'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
