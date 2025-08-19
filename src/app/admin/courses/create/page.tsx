'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { CourseForm } from '@/components/admin/CourseForm'

export default function CreateCoursePage() {
  const router = useRouter()

  const handleSuccess = () => {
    router.push('/admin/courses')
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
              <div className="h-6 w-px bg-muted" />
              <h1 className="text-xl font-semibold text-gray-900">Create New Course</h1>
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
            course={undefined}
            embedded={true}
          />
        </div>
      </div>
    </div>
  )
}
