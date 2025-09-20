'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Clock, BookOpen, HelpCircle, ChevronLeft, ChevronRight, CheckCircle, ChevronUp, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { QuestionContent } from '../core/QuestionContent'
import type { Quiz } from '@/lib/supabase'
import { formatTime } from '@/lib/date-utils'

interface SimpleSplitLayoutProps {
  quiz: Quiz & {
    questions: Array<{
      id: string
      question: string
      options: any[]
      correct_answer: string | number | number[]
      explanation?: string
      question_type: 'multiple_choice' | 'single_choice' | 'true_false' | 'fill_blank' | 'essay' | 'matching' | 'ordering'
      points?: number
      media_url?: string
      media_type?: 'image' | 'audio' | 'video'
      order_index?: number
    }>
  }
}

export default function SimpleSplitQuizLayout({ quiz }: SimpleSplitLayoutProps) {
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [timeLeft] = useState(29 * 60 + 46) // 29:46
  const [submitting] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const currentQuestion = quiz.questions[currentQuestionIndex]
  const totalQuestions = quiz.questions.length

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const goToNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Clean Top Information Bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-none mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/quizzes" 
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Quizzes
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-lg font-semibold text-gray-900">{quiz.title}</h1>
              <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full uppercase">
                {quiz.difficulty}
              </span>
            </div>
            <div className="flex items-center space-x-8 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span className="font-mono text-base font-medium">{formatTime(timeLeft)}</span>
              </div>
              <span className="font-medium">Question {currentQuestionIndex + 1} of {totalQuestions}</span>
              <div className="flex items-center space-x-2">
                <span className="text-xs">Progress:</span>
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
                  ></div>
                </div>
                <span className="text-xs font-medium">{Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      {isMobile ? (
        <div className="p-4 space-y-4">
          {/* Question Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-blue-600">Question {currentQuestionIndex + 1}</span>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{currentQuestion?.question_type}</span>
              </div>
            </div>
            <QuestionContent
              question={currentQuestion}
              answer={answers[currentQuestion?.id] || null}
              onAnswerChange={handleAnswerChange}
              submitting={submitting}
              quizAttemptId="preview"
            />
          </div>

          {/* Mobile Navigation */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex justify-between items-center">
              <button 
                onClick={goToPreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  currentQuestionIndex === 0 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-blue-600 hover:bg-blue-50'
                }`}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(totalQuestions, 5) }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentQuestionIndex(i)}
                    className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                      i === currentQuestionIndex
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                {totalQuestions > 5 && (
                  <span className="text-gray-400 text-sm px-1">...</span>
                )}
              </div>

              {currentQuestionIndex === totalQuestions - 1 ? (
                <button className="flex items-center px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  Submit Quiz
                  <CheckCircle className="w-4 h-4 ml-2" />
                </button>
              ) : (
                <button 
                  onClick={goToNextQuestion}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Desktop Single-Column Layout */
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="bg-gray-100 border-b border-gray-300 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <HelpCircle className="w-5 h-5 mr-3 text-green-600" />
                  <h2 className="font-semibold text-gray-900 text-lg">Question {currentQuestionIndex + 1} of {totalQuestions}</h2>
                </div>
                <span className="text-sm text-gray-600 bg-gray-200 px-3 py-1 rounded-lg">
                  {currentQuestion?.question_type || 'Multiple Choice'}
                </span>
              </div>
            </div>

            <div className="p-8">
              <QuestionContent
                question={currentQuestion}
                answer={answers[currentQuestion?.id] || null}
                onAnswerChange={handleAnswerChange}
                submitting={submitting}
                quizAttemptId="preview"
              />
            </div>

            {/* Bottom Navigation */}
            <div className="border-t border-gray-300 bg-gray-50 px-6 py-4">
              <div className="flex justify-between items-center">
                <button 
                  onClick={goToPreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className={`flex items-center px-5 py-2 rounded-lg transition-colors ${
                    currentQuestionIndex === 0 
                      ? 'text-gray-400 cursor-not-allowed bg-gray-100' 
                      : 'text-blue-600 hover:bg-blue-50 border border-blue-300'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </button>

                {/* Question Navigation */}
                <div className="flex items-center space-x-2">
                  {Array.from({ length: Math.min(totalQuestions, 7) }, (_, i) => {
                    const questionIndex = totalQuestions <= 7 ? i : 
                      currentQuestionIndex <= 3 ? i :
                      currentQuestionIndex >= totalQuestions - 4 ? totalQuestions - 7 + i :
                      currentQuestionIndex - 3 + i;
                    
                    return (
                      <button
                        key={questionIndex}
                        onClick={() => setCurrentQuestionIndex(questionIndex)}
                        className={`w-10 h-10 rounded-full text-sm font-semibold transition-all ${
                          questionIndex === currentQuestionIndex
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {questionIndex + 1}
                      </button>
                    );
                  })}
                  {totalQuestions > 7 && currentQuestionIndex < totalQuestions - 4 && (
                    <span className="text-gray-400 px-1">...</span>
                  )}
                </div>

                {currentQuestionIndex === totalQuestions - 1 ? (
                  <button 
                    disabled={submitting}
                    className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    {submitting ? 'Submitting...' : 'Submit Quiz'}
                  </button>
                ) : (
                  <button 
                    onClick={goToNextQuestion}
                    className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
                  >
                    Next Question
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}