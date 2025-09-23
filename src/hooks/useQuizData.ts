import { useState, useCallback } from 'react'
import { Quiz } from '@/lib/supabase'

interface Question {
  id: string
  question: string
  options: string[] | Array<{left: string; right: string}>
  correct_answer: string | number | number[]
  explanation?: string
  question_type: 'multiple_choice' | 'single_choice' | 'true_false' | 'fill_blank' | 'essay' | 'matching' | 'ordering'
  points?: number
  media_url?: string
  media_type?: 'image' | 'audio' | 'video'
}

interface UseQuizDataReturn {
  quiz: Quiz | null
  questions: Question[]
  loading: boolean
  error: string | null
  loadQuiz: (quizId: string) => Promise<void>
  refetch: () => Promise<void>
}

export function useQuizData(): UseQuizDataReturn {
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadQuiz = useCallback(async (quizId: string) => {
    try {
      setLoading(true)
      setError(null)

      // Import the function dynamically to avoid circular dependencies
      const { getQuizQuestions } = await import('@/lib/database')
      const result = await getQuizQuestions(quizId)

      if (result.error) {
        setError(result.error)
        return
      }

      if (result.data?.quiz) {
        setQuiz(result.data.quiz)
        setQuestions(result.data.questions || [])
      }
    } catch (err) {
      console.error('Error loading quiz:', err)
      setError('Failed to load quiz')
    } finally {
      setLoading(false)
    }
  }, [])

  const refetch = useCallback(async () => {
    if (quiz?.id) {
      await loadQuiz(quiz.id)
    }
  }, [quiz?.id, loadQuiz])

  return {
    quiz,
    questions,
    loading,
    error,
    loadQuiz,
    refetch
  }
}