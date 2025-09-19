'use client'

import { useRouter } from 'next/navigation'
import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { ArrowLeft, BookOpen } from 'lucide-react'
import { Card } from '@/components/ui/card'

// Dynamic import for heavy QuizBuilder component - Week 2 Day 4 optimization
const QuizBuilder = dynamic(
  () => import('@/components/admin/QuizBuilder').then(mod => ({ default: mod.QuizBuilder })),
  {
    loading: () => (
      <div className="flex items-center justify-center p-8 min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading Quiz Builder...</p>
        </div>
      </div>
    ),
    ssr: false
  }
)

export default function CreateQuizPage() {
  const router = useRouter()

  const handleSuccess = () => {
    router.push('/admin/quizzes')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Professional Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link 
                href="/admin/quizzes"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                Back to Quizzes
              </Link>
              <div className="h-6 w-px bg-border" />
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <h1 className="text-xl font-semibold text-foreground">Create New Quiz</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Professional Card Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card variant="elevated" className="overflow-hidden">
          <QuizBuilder
            isOpen={true}
            onClose={() => router.push('/admin/quizzes')}
            onSuccess={handleSuccess}
            quiz={null}
          />
        </Card>
      </div>
    </div>
  )
}
