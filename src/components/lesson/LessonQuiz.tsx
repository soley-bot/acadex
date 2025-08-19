'use client'

import { useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correct_answer: number
  explanation?: string
}

interface LessonQuizProps {
  lessonId: string
  lessonTitle: string
  isOpen: boolean
  onClose: () => void
  onComplete?: (score: number) => void
}

export function LessonQuiz({ lessonId, lessonTitle, isOpen, onClose, onComplete }: LessonQuizProps) {
  const [quiz, setQuiz] = useState<{ questions: QuizQuestion[], title: string, description: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [showResults, setShowResults] = useState(false)

  // Load quiz data when component opens
  useEffect(() => {
    const loadLessonQuiz = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const { data, error } = await supabase
          .from('quizzes')
          .select(`
            *,
            quiz_questions (*)
          `)
          .eq('lesson_id', lessonId)
          .eq('is_published', true)
          .single()

        if (error) {
          if (error.code === 'PGRST116') {
            // No quiz found for this lesson
            setError('No quiz available for this lesson.')
          } else {
            throw error
          }
          return
        }

        if (data) {
          setQuiz({
            title: data.title,
            description: data.description,
            questions: data.quiz_questions?.map((q: any) => ({
              id: q.id,
              question: q.question,
              options: q.options,
              correct_answer: q.correct_answer,
              explanation: q.explanation,
              order_index: q.order_index
            })).sort((a: any, b: any) => a.order_index - b.order_index) || []
          })
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load quiz')
      } finally {
        setLoading(false)
      }
    }

    if (isOpen && lessonId) {
      loadLessonQuiz()
    }
  }, [isOpen, lessonId])

  if (!isOpen) return null

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary/30 border-t-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading quiz...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !quiz || quiz.questions.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary/90 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Quiz Available</h3>
            <p className="text-gray-600 mb-6">
              {error || 'This lesson does not have a quiz yet.'}
            </p>
            <button
              onClick={onClose}
              className="bg-gradient-to-r from-primary to-primary/90 text-gray-900 px-6 py-2 rounded-xl font-medium transition-all"
            >
              Continue Learning
            </button>
          </div>
        </div>
      </div>
    )
  }

  const quizQuestions = quiz.questions
  const currentQuestion = quizQuestions[currentQuestionIndex]

  // Safety check for currentQuestion
  if (!currentQuestion) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary/90 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Quiz Error</h3>
            <p className="text-gray-600 mb-6">Unable to load quiz question.</p>
            <button
              onClick={onClose}
              className="bg-gradient-to-r from-primary to-primary/90 text-gray-900 px-6 py-2 rounded-xl font-medium transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  const handleAnswerSelect = (answerIndex: number) => {
    if (!currentQuestion) return
    
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answerIndex
    }))
  }

  const handleNext = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    } else {
      // Calculate score and show results
      const score = calculateScore()
      setShowResults(true)
      onComplete?.(score)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const calculateScore = () => {
    let correct = 0
    quizQuestions.forEach(question => {
      if (answers[question.id] === question.correct_answer) {
        correct++
      }
    })
    return Math.round((correct / quizQuestions.length) * 100)
  }

  const getProgressPercentage = () => {
    return ((currentQuestionIndex + 1) / quizQuestions.length) * 100
  }

  if (showResults) {
    const score = calculateScore()
    const correct = quizQuestions.filter(q => answers[q.id] === q.correct_answer).length
    
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-success to-success/90 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-white" />
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">Quiz Complete!</h3>
            <p className="text-gray-600 mb-6">You scored {correct} out of {quizQuestions.length} questions correctly</p>
            
            <div className="text-3xl font-bold text-green-600 mb-6">{score}%</div>
            
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 bg-muted/40 hover:bg-muted/60 text-gray-800 px-4 py-2 rounded-xl font-medium transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setCurrentQuestionIndex(0)
                  setAnswers({})
                  setShowResults(false)
                }}
                className="flex-1 bg-gradient-to-r from-primary to-primary/90 text-gray-900 px-4 py-2 rounded-xl font-medium transition-all"
              >
                Retake Quiz
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/90 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">{quiz.title}</h2>
              <p className="text-red-100 text-sm mt-1">
                Question {currentQuestionIndex + 1} of {quizQuestions.length}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-primary/80/30 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-500"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
          </div>
        </div>

        {/* Question Content */}
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6 leading-relaxed">
            {currentQuestion.question}
          </h3>

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`w-full text-left p-4 border-2 rounded-xl transition-all duration-200 ${
                  answers[currentQuestion.id] === index
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-gray-200 hover:border-primary/30 hover:bg-primary/5/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    answers[currentQuestion.id] === index
                      ? 'border-primary bg-primary/50'
                      : 'border-gray-300'
                  }`}>
                    {answers[currentQuestion.id] === index && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <span className="font-medium">{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="text-sm text-gray-500">
              {Object.keys(answers).length} of {quizQuestions.length} answered
            </div>

            <button
              onClick={handleNext}
              disabled={answers[currentQuestion.id] === undefined}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-primary to-primary/90 text-gray-900 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {currentQuestionIndex === quizQuestions.length - 1 ? 'Finish' : 'Next'}
              {currentQuestionIndex < quizQuestions.length - 1 && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
