'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { CourseBuilderRouter } from '@/components/admin/CourseBuilderRouter'
import { createSupabaseClient, type Course } from '@/lib/supabase'

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
        const supabase = createSupabaseClient()
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

  const handleClose = () => {
    router.push('/admin/courses')
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-2xl p-8">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-gray-600">Loading course...</p>
          </div>
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
    <CourseBuilderRouter
      course={course}
      isOpen={true}
      onClose={handleClose}
      onSuccess={handleSuccess}
    />
  )
}
