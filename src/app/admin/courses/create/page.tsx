'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Brain, BookOpen, Sparkles } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CourseForm } from '@/components/admin/CourseForm'
import { AICourseGenerator, GeneratedCourse } from '@/components/admin/AICourseGenerator'

export default function CreateCoursePage() {
  const router = useRouter()
  const [showAIGenerator, setShowAIGenerator] = useState(false)
  const [prefilledCourse, setPrefilledCourse] = useState<GeneratedCourse | null>(null)

  const handleSuccess = () => {
    router.push('/admin/courses')
  }

  const handleAICourseGenerated = (generatedCourse: GeneratedCourse) => {
    setPrefilledCourse(generatedCourse)
    setShowAIGenerator(false)
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
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAIGenerator(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gradient-to-r from-primary to-primary/80 hover:from-secondary hover:to-secondary/80 text-white hover:text-black rounded-lg transition-all shadow-sm hover:shadow-md"
              >
                <Brain className="h-4 w-4" />
                <Sparkles className="h-3 w-3" />
                Generate with AI
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Professional Card Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {prefilledCourse && (
          <Card variant="glass" className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Sparkles className="h-5 w-5 text-primary" />
                AI-Generated Course Ready
              </CardTitle>
              <CardDescription>
                Your course &ldquo;{prefilledCourse.title}&rdquo; has been generated with {prefilledCourse.modules?.length || 0} modules. Review and customize it below.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
        
        <Card variant="elevated" className="overflow-hidden">
          <CourseForm
            isOpen={true}
            onClose={() => router.push('/admin/courses')}
            onSuccess={handleSuccess}
            course={undefined}
            embedded={true}
            prefilledData={prefilledCourse}
          />
        </Card>
      </div>

      {/* AI Course Generator Modal */}
      <AICourseGenerator
        isOpen={showAIGenerator}
        onClose={() => setShowAIGenerator(false)}
        onCourseGenerated={handleAICourseGenerated}
      />
    </div>
  )
}
