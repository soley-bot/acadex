'use client'

import { useState } from 'react'
import { ReadingPassageDisplayNew as ReadingPassageDisplay } from './ReadingPassageDisplayNew'
import { FileText, HelpCircle, BookOpen, Timer, BarChart3, ChevronLeft, ChevronRight, Check, Info } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Quiz } from '@/lib/supabase'

interface ReadingQuizLayoutProps {
  quiz: Quiz & {
    word_count?: number | null
    estimated_read_time?: number | null
  }
  questions: Array<{
    id: string
    question: string
    options: any[]
    correct_answer: string | number | number[]
    explanation?: string
    question_type: string
    order_index?: number
  }>
  currentQuestionIndex: number
  onQuestionChange: (index: number) => void
  answers: Record<string, any>
  children: React.ReactNode
  timeLeft?: number
  className?: string
}

export function ReadingQuizLayoutNew({ 
  quiz, 
  questions,
  currentQuestionIndex,
  onQuestionChange,
  answers,
  children, 
  timeLeft,
  className = '' 
}: ReadingQuizLayoutProps) {
  const [activeTab, setActiveTab] = useState<'passage' | 'question'>('passage')
  const [isPassageExpanded, setIsPassageExpanded] = useState(false)

  // Calculate progress
  const answeredQuestions = Object.keys(answers).length
  const progressPercentage = (answeredQuestions / questions.length) * 100

  // Simple Mobile Layout
  const MobileLayout = () => (
    <div className="lg:hidden">
      {/* Simple Progress Header */}
      <Card className="mb-4 bg-white border-gray-200 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <h2 className="font-semibold text-gray-900 text-lg">{quiz.title}</h2>
            </div>
            {timeLeft !== undefined && (
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
                <Timer className="w-4 h-4 text-blue-600" />
                <span className="font-mono text-sm font-semibold text-blue-700">
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </span>
              </div>
            )}
          </div>
          
          {/* Simple Progress Display */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <span className="text-blue-600 font-medium">{answeredQuestions} answered</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Simple Tab Navigation */}
      <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
        <button
          onClick={() => setActiveTab('passage')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
            activeTab === 'passage'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FileText className="h-4 w-4" />
          Reading
        </button>
        <button
          onClick={() => setActiveTab('question')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
            activeTab === 'question'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <HelpCircle className="h-4 w-4" />
          Question {currentQuestionIndex + 1}
          {answers[questions[currentQuestionIndex]?.id] && (
            <Check className="w-4 h-4 ml-1 text-green-500" />
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[60vh]">
        {activeTab === 'passage' ? (
          <ReadingPassageDisplay
            title={quiz.passage_title}
            source={quiz.passage_source}
            passage={quiz.reading_passage || ''}
            audioUrl={quiz.passage_audio_url}
            wordCount={quiz.word_count || undefined}
            estimatedReadTime={quiz.estimated_read_time || undefined}
            className="h-full"
          />
        ) : (
          <Card className="h-full bg-white shadow-sm">
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {answers[questions[currentQuestionIndex]?.id] && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-md">
                      <Check className="w-3 h-3" />
                      Answered
                    </span>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {children}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Simple Navigation */}
      <div className="mt-6 flex items-center justify-between gap-4">
        <button
          onClick={() => onQuestionChange(Math.max(0, currentQuestionIndex - 1))}
          disabled={currentQuestionIndex === 0}
          className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        <div className="flex items-center gap-1">
          {questions.map((question, index) => (
            <button
              key={question.id}
              onClick={() => onQuestionChange(index)}
              className={`w-8 h-8 rounded-lg text-xs font-medium transition-all duration-200 ${
                index === currentQuestionIndex
                  ? 'bg-blue-600 text-white shadow-md'
                  : answers[question.id] !== undefined
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        <button
          onClick={() => onQuestionChange(Math.min(questions.length - 1, currentQuestionIndex + 1))}
          disabled={currentQuestionIndex === questions.length - 1}
          className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )

  // Enhanced Desktop Layout - More space for questions, mobile-style dropdown
  const DesktopLayout = () => (
    <div className="hidden lg:block">
      {/* Simple Header */}
      <Card className="mb-6 bg-white border-gray-200 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-blue-600" />
              <div>
                <h2 className="font-bold text-xl text-gray-900">{quiz.title}</h2>
                {quiz.passage_title && (
                  <p className="text-sm text-gray-600">{quiz.passage_title}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              {/* Simple Progress */}
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </div>
                <div className="text-xs text-gray-500">
                  {answeredQuestions} answered
                </div>
              </div>
              
              {/* Timer */}
              {timeLeft !== undefined && (
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
                  <Timer className="w-5 h-5 text-blue-600" />
                  <span className="font-mono text-lg font-medium text-blue-700">
                    {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Mobile-style Dropdown Layout - More space for questions */}
      <div className="space-y-6">
        {/* Reading Passage - Collapsible */}
        <div>
          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-3 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  Reading Passage
                </CardTitle>
                <button
                  onClick={() => setIsPassageExpanded(!isPassageExpanded)}
                  className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                >
                  {isPassageExpanded ? 'Collapse' : 'Expand'}
                </button>
              </div>
            </CardHeader>
            
            {/* Passage Content - Collapsible */}
            <div className={`overflow-hidden transition-all duration-300 ${
              isPassageExpanded ? 'max-h-[500px]' : 'max-h-24'
            }`}>
              <CardContent className="pt-4">
                <div className="overflow-y-auto">
                  <div className="text-base leading-relaxed text-gray-900 whitespace-pre-wrap">
                    {quiz.reading_passage?.split('\n').slice(0, isPassageExpanded ? undefined : 3).map((paragraph, index) => (
                      <p key={index} className="mb-3 first:mt-0">
                        {paragraph}
                      </p>
                    ))}
                    {!isPassageExpanded && quiz.reading_passage && quiz.reading_passage.split('\n').length > 3 && (
                      <p className="text-gray-500 text-sm">... (click expand to read more)</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        </div>

        {/* Question Section - More prominent */}
        <div className="flex-1">
          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-gray-900 mb-2">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </CardTitle>
                  <div className="text-sm text-gray-500 capitalize bg-gray-100 px-3 py-1 rounded-lg inline-block">
                    {questions[currentQuestionIndex]?.question_type?.replace('_', ' ')}
                  </div>
                </div>
                {answers[questions[currentQuestionIndex]?.id] && (
                  <span className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-green-100 text-green-700 rounded-lg">
                    <Check className="w-4 h-4" />
                    Answered
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {children}
            </CardContent>
          </Card>

          {/* Question Navigation - Simple */}
          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={() => onQuestionChange(Math.max(0, currentQuestionIndex - 1))}
              disabled={currentQuestionIndex === 0}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all shadow-sm"
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>

            <div className="flex items-center gap-2">
              {questions.map((question, index) => (
                <button
                  key={question.id}
                  onClick={() => onQuestionChange(index)}
                  className={`w-10 h-10 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    index === currentQuestionIndex
                      ? 'bg-blue-600 text-white shadow-md'
                      : answers[question.id] !== undefined
                      ? 'bg-green-100 text-green-700 border border-green-300'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => onQuestionChange(Math.min(questions.length - 1, currentQuestionIndex + 1))}
              disabled={currentQuestionIndex === questions.length - 1}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all shadow-sm"
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  if (!quiz.reading_passage) {
    // Enhanced fallback layout for non-reading quizzes
    return (
      <div className={`standard-quiz-layout ${className} max-w-6xl mx-auto`}>
        <Card className="bg-white shadow-lg border-0">
          <CardContent className="p-12">
            {children}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`reading-quiz-layout ${className}`}>
      <MobileLayout />
      <DesktopLayout />
    </div>
  )
}