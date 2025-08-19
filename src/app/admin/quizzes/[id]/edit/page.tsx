'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Eye, Loader2 } from 'lucide-react'
import { QuizForm } from '@/components/admin/QuizForm'
import { supabase } from '@/lib/supabase'
import type { Quiz } from '@/lib/supabase'

export default function EditQuizPage() {
  const router = useRouter()
  const params = useParams()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchQuiz = async () => {
      if (!params.id) return

      try {
        const { data, error } = await supabase
          .from('quizzes')
          .select('*')
          .eq('id', params.id)
          .single()

        if (error) throw error
        setQuiz(data)
      } catch (err: any) {
        console.error('Error fetching quiz:', err)
        setError('Failed to load quiz')
      } finally {
        setLoading(false)
      }
    }

    fetchQuiz()
  }, [params.id])

  const handleSuccess = () => {
    router.push('/admin/quizzes')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-secondary" />
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      </div>
    )
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-primary mb-4">{error || 'Quiz not found'}</p>
          <Link 
            href="/admin/quizzes"
            className="text-secondary hover:text-blue-700 underline"
          >
            Back to Quizzes
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
                href="/admin/quizzes"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                Back to Quizzes
              </Link>
              <div className="h-6 w-px bg-muted" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Edit Quiz</h1>
                <p className="text-sm text-gray-500">{quiz.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={`/quizzes/${quiz.id}`}
                target="_blank"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-muted/40 hover:bg-muted/60 rounded-lg transition-colors"
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
          <QuizForm
            isOpen={true}
            onClose={() => router.push('/admin/quizzes')}
            onSuccess={handleSuccess}
            quiz={quiz}
          />
        </div>
      </div>
    </div>
  )
}
