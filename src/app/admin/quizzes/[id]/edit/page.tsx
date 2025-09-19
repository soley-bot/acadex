'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Eye, Loader2 } from 'lucide-react'
import { QuizBuilderRouter } from '@/components/admin/QuizBuilderRouter'
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
      try {
        setLoading(true)
        setError(null)

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

        console.log('Fetching quiz with ID:', params.id)
        console.log('Using headers:', headers)

        const response = await fetch(`/api/admin/quizzes/${params.id}`, {
          method: 'GET',
          credentials: 'include', // Include cookies as fallback
          headers
        })
        
        console.log('API Response status:', response.status)
        console.log('API Response headers:', Object.fromEntries(response.headers.entries()))
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error('API Error response:', errorText)
          throw new Error(`Failed to fetch quiz: ${response.statusText}`)
        }
        
        const data = await response.json()
        
        console.log('✅ Successfully fetched quiz:', {
          id: data.id,
          title: data.title,
          hasQuestions: !!(data.questions),
          questionsCount: data.questions ? data.questions.length : 0,
          questionsData: data.questions ? data.questions.slice(0, 2) : [], // First 2 questions for debugging
          allKeys: Object.keys(data)
        })
        
        setQuiz(data)
      } catch (err: any) {
        console.error('❌ Error fetching quiz:', err)
        setError(err?.message || 'Failed to load quiz')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchQuiz()
    }
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
          <QuizBuilderRouter
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
