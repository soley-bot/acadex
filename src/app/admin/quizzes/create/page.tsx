'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Eye, Plus, Brain } from 'lucide-react'
import { QuizForm } from '@/components/admin/QuizForm'
import { AIQuizGenerator, GeneratedQuiz } from '@/components/admin/AIQuizGenerator'

export default function CreateQuizPage() {
  const router = useRouter()
  const [showAIGenerator, setShowAIGenerator] = useState(false)
  const [prefilledQuiz, setPrefilledQuiz] = useState<GeneratedQuiz | null>(null)

  const handleSuccess = () => {
    router.push('/admin/quizzes')
  }

  const handleAIQuizGenerated = (generatedQuiz: GeneratedQuiz) => {
    setPrefilledQuiz(generatedQuiz)
    setShowAIGenerator(false)
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
              <h1 className="text-xl font-semibold text-gray-900">Create New Quiz</h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAIGenerator(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-700 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors"
              >
                <Brain className="h-4 w-4" />
                Generate with AI
              </button>
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
            quiz={null}
            prefilledData={prefilledQuiz}
          />
        </div>
      </div>

      {/* AI Quiz Generator Modal */}
      <AIQuizGenerator
        isOpen={showAIGenerator}
        onClose={() => setShowAIGenerator(false)}
        onQuizGenerated={handleAIQuizGenerated}
      />
    </div>
  )
}
