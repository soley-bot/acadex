'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Eye, Loader2 } from 'lucide-react'
import { CourseForm } from '@/components/admin/CourseForm'
import { supabase } from '@/lib/supabase'
import type { Course } from '@/lib/supabase'

export default function EditCoursePage() {
  const router = useRouter()
  const params = useParams()
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCourse = async () => {
      if (!params.id) return

      try {
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .eq('id', params.id)
          .single()

        if (error) throw error
        setCourse(data)
      } catch (err: any) {
        console.error('Error fetching course:', err)
        setError('Failed to load course')
      } finally {
        setLoading(false)
      }
    }

    fetchCourse()
  }, [params.id])

  const handleSuccess = () => {
    router.push('/admin/courses')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading course...</p>
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Course not found'}</p>
          <Link 
            href="/admin/courses"
            className="text-blue-600 hover:text-blue-700 underline"
          >
            Back to Courses
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link 
                href="/admin/courses"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                Back to Courses
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Edit Course</h1>
                <p className="text-sm text-gray-500">{course.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={`/courses/${course.id}`}
                target="_blank"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Eye className="h-4 w-4" />
                Preview
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <CourseForm
            isOpen={true}
            onClose={() => router.push('/admin/courses')}
            onSuccess={handleSuccess}
            course={course}
            embedded={true}
          />
        </div>
      </div>
    </div>
  )
}
