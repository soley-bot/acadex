'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, BookOpen } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { CourseForm } from '@/components/admin/CourseForm'

export default function CreateCoursePage() {
  const router = useRouter()

  const handleSuccess = () => {
    router.push('/admin/courses')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Professional Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link 
                href="/admin/courses"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                Back to Courses
              </Link>
              <div className="h-6 w-px bg-border" />
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <h1 className="text-xl font-semibold text-foreground">Create New Course</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Professional Card Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card variant="elevated" className="overflow-hidden">
          <CourseForm
            isOpen={true}
            onClose={() => router.push('/admin/courses')}
            onSuccess={handleSuccess}
            course={undefined}
            embedded={true}
          />
        </Card>
      </div>
    </div>
  )
}
