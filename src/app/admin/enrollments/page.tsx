'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Users, BookOpen, Calendar, Clock, Search, Filter, UserMinus, Eye, MoreHorizontal, TrendingUp, Award, Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Enrollment, Course, User } from '@/lib/supabase'
import { ManualEnrollmentModal } from '@/components/admin/ManualEnrollmentModal'

interface EnrollmentWithDetails extends Enrollment {
  courses: {
    title: string
    instructor_name: string
    price: number
    level: string
  }
  users: {
    name: string
    email: string
  }
}

interface EnrollmentStats {
  totalEnrollments: number
  activeEnrollments: number
  completedEnrollments: number
  totalRevenue: number
}

export default function AdminEnrollmentsPage() {
  const router = useRouter()
  const [enrollments, setEnrollments] = useState<EnrollmentWithDetails[]>([])
  const [stats, setStats] = useState<EnrollmentStats>({
    totalEnrollments: 0,
    activeEnrollments: 0,
    completedEnrollments: 0,
    totalRevenue: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all')
  const [selectedEnrollment, setSelectedEnrollment] = useState<EnrollmentWithDetails | null>(null)
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false)
  const [showManualEnrollmentModal, setShowManualEnrollmentModal] = useState(false)

  useEffect(() => {
    fetchEnrollments()
  }, [])

  const fetchEnrollments = async () => {
    try {
      setLoading(true)
      setError('') // Clear any previous errors
      
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
      
      // Use API route instead of direct Supabase call
      const response = await fetch('/api/admin/enrollments', {
        method: 'GET',
        credentials: 'include', // Still include cookies as fallback
        headers
      })

      if (!response.ok) {
        // Get more details about the error
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Enrollment fetch error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        })
        throw new Error(`HTTP error! status: ${response.status} - ${errorData.error || response.statusText}`)
      }

      const data = await response.json()
      const enrollmentsWithDetails = (data.enrollments || []) as EnrollmentWithDetails[]
      setEnrollments(enrollmentsWithDetails)

      // Calculate stats
      const totalEnrollments = enrollmentsWithDetails.length
      const completedEnrollments = enrollmentsWithDetails.filter(e => e.completed_at).length
      const activeEnrollments = totalEnrollments - completedEnrollments
      const totalRevenue = enrollmentsWithDetails.reduce((sum, e) => sum + (e.courses?.price || 0), 0)

      setStats({
        totalEnrollments,
        activeEnrollments,
        completedEnrollments,
        totalRevenue
      })
    } catch (error) {
      console.error('Error fetching enrollments:', error)
      // Set a user-friendly error message
      setError('Failed to load enrollments. Please make sure you are logged in as an admin.')
    } finally {
      setLoading(false)
    }
  }

  const handleUnenrollStudent = async (enrollmentId: string) => {
    if (!confirm('Are you sure you want to unenroll this student? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/enrollments/${enrollmentId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Refresh the enrollments list
      fetchEnrollments()
    } catch (error) {
      console.error('Error unenrolling student:', error)
      alert('Failed to unenroll student. Please try again.')
    }
  }

  // Filter enrollments based on search and status
  const filteredEnrollments = enrollments.filter((enrollment) => {
    const matchesSearch = 
      enrollment.users?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.users?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.courses?.title?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && !enrollment.completed_at) ||
      (statusFilter === 'completed' && enrollment.completed_at)
    
    return matchesSearch && matchesStatus
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500'
    if (progress >= 50) return 'bg-yellow-500'
    return 'bg-primary/50'
  }

  const getStatusBadge = (enrollment: EnrollmentWithDetails) => {
    if (enrollment.completed_at) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <Award className="w-3 h-3 mr-1" />
          Completed
        </span>
      )
    }
    
    if (enrollment.progress > 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary/10 text-secondary">
          <TrendingUp className="w-3 h-3 mr-1" />
          In Progress
        </span>
      )
    }
    
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted/40 text-gray-800">
        <Clock className="w-3 h-3 mr-1" />
        Not Started
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="bg-primary/5 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-destructive/20 rounded-full">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-red-800 mb-2">Authentication Error</h3>
            <p className="text-primary text-sm mb-4">{error}</p>
            <button
              onClick={() => router.push('/auth/login?redirect=/admin/enrollments')}
              className="px-4 py-2 bg-primary hover:bg-secondary text-white hover:text-black rounded-lg transition-colors"
            >
              Login Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Enrollment Management</h1>
            <p className="text-gray-600 mt-1">Manage student enrollments and track progress</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowManualEnrollmentModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-primary text-white hover:bg-secondary hover:text-black rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Manual Enrollment</span>
            </button>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">${stats.totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-secondary/10 rounded-lg">
              <Users className="w-6 h-6 text-secondary" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Enrollments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalEnrollments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeEnrollments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Award className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedEnrollments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalEnrollments > 0 ? Math.round((stats.completedEnrollments / stats.totalEnrollments) * 100) : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by student name, email, or course..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-primary"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'completed')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-primary"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Enrollments Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Enrolled
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEnrollments.map((enrollment) => (
                <tr key={enrollment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {enrollment.users?.name || 'Unknown User'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {enrollment.users?.email || 'No email'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {enrollment.courses?.title || 'Unknown Course'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {enrollment.courses?.level || 'Unknown'} • {enrollment.courses?.instructor_name || 'Unknown Instructor'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-full bg-muted/60 rounded-full h-2 mr-2">
                        <div
                          className={`h-2 rounded-full ${getProgressColor(enrollment.progress)}`}
                          style={{ width: `${enrollment.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900 min-w-[3rem]">
                        {enrollment.progress}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(enrollment)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(enrollment.enrolled_at)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    ${enrollment.courses?.price?.toFixed(2) || '0.00'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => {
                          setSelectedEnrollment(enrollment)
                          setShowEnrollmentModal(true)
                        }}
                        className="text-secondary hover:text-blue-900 p-1 rounded-md hover:bg-primary/10"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleUnenrollStudent(enrollment.id)}
                        className="text-primary hover:text-red-900 p-1 rounded-md hover:bg-primary/5"
                        title="Unenroll Student"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredEnrollments.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No enrollments found</h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'No students have enrolled in courses yet'
              }
            </p>
          </div>
        )}
      </div>

      {/* Enrollment Details Modal */}
      {showEnrollmentModal && selectedEnrollment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Enrollment Details</h2>
                <button
                  onClick={() => setShowEnrollmentModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Student Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Student Information</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{selectedEnrollment.users?.name || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{selectedEnrollment.users?.email || 'Unknown'}</span>
                  </div>
                </div>
              </div>

              {/* Course Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Course Information</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Title:</span>
                    <span className="font-medium">{selectedEnrollment.courses?.title || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Instructor:</span>
                    <span className="font-medium">{selectedEnrollment.courses?.instructor_name || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Level:</span>
                    <span className="font-medium capitalize">{selectedEnrollment.courses?.level || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-medium">${selectedEnrollment.courses?.price?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
              </div>

              {/* Progress Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Progress Information</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Progress:</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-muted/60 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getProgressColor(selectedEnrollment.progress)}`}
                          style={{ width: `${selectedEnrollment.progress}%` }}
                        ></div>
                      </div>
                      <span className="font-medium">{selectedEnrollment.progress}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Enrolled Date:</span>
                    <span className="font-medium">{formatDate(selectedEnrollment.enrolled_at)}</span>
                  </div>
                  {selectedEnrollment.completed_at && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Completed Date:</span>
                      <span className="font-medium">{formatDate(selectedEnrollment.completed_at)}</span>
                    </div>
                  )}
                  {selectedEnrollment.last_accessed_at && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Accessed:</span>
                      <span className="font-medium">{formatDate(selectedEnrollment.last_accessed_at)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Watch Time:</span>
                    <span className="font-medium">{selectedEnrollment.total_watch_time_minutes} minutes</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowEnrollmentModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleUnenrollStudent(selectedEnrollment.id)
                  setShowEnrollmentModal(false)
                }}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                Unenroll Student
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Enrollment Modal */}
      <ManualEnrollmentModal
        isOpen={showManualEnrollmentModal}
        onClose={() => setShowManualEnrollmentModal(false)}
        onEnrollmentCreated={fetchEnrollments}
      />
    </div>
  )
}
