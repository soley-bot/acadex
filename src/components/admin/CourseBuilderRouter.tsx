'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import type { Course } from '@/lib/supabase'

// Dynamic import for heavy CourseBuilder component
const CourseBuilder = dynamic(
  () => import('./CourseBuilder').then(mod => ({ default: mod.CourseBuilder })),
  {
    loading: () => (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-2xl p-8">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-600">Loading Course Builder...</p>
          </div>
        </div>
      </div>
    ),
    ssr: false
  }
)

interface CourseBuilderRouterProps {
  course?: Course | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CourseBuilderRouter({ course, isOpen, onClose, onSuccess }: CourseBuilderRouterProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CourseBuilder
        course={course}
        isOpen={isOpen}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    </Suspense>
  )
}
