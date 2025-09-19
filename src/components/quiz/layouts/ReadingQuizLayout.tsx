'use client'

import { useState } from 'react'
import { ReadingPassageDisplay } from '../display/ReadingPassageDisplay'
import { FileText, HelpCircle, BookOpen, Timer, BarChart3 } from 'lucide-react'
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

export function ReadingQuizLayout({ 
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

  // Calculate progress
  const answeredQuestions = Object.keys(answers).length
  const progressPercentage = (answeredQuestions / questions.length) * 100

  // Mobile/tablet view with enhanced tabs
  const MobileLayout = () => (
    <div className="lg:hidden space-y-4">
      {/* Progress Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <h2 className="font-semibold">{quiz.title}</h2>
            </div>
            {timeLeft !== undefined && (
              <div className="flex items-center gap-2 text-primary">
                <Timer className="w-4 h-4" />
                <span className="font-mono text-sm">
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </span>
              </div>
            )}
          </div>
          
          {/* Progress Bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span>Progress: {answeredQuestions}/{questions.length}</span>
              <span>{Math.round(progressPercentage)}% complete</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tab Navigation */}
      <div className="flex bg-muted rounded-lg p-1">
        <button
          onClick={() => setActiveTab('passage')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            activeTab === 'passage'
              ? 'bg-background text-primary shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <FileText className="h-4 w-4" />
          Reading Passage
        </button>
        <button
          onClick={() => setActiveTab('question')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            activeTab === 'question'
              ? 'bg-background text-primary shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <HelpCircle className="h-4 w-4" />
          Question {currentQuestionIndex + 1}
        </button>
      </div>
      
      {/* Tab Content */}
      <div className="space-y-4">
        {activeTab === 'passage' ? (
          <ReadingPassageDisplay
            title={quiz.passage_title}
            source={quiz.passage_source}
            passage={quiz.reading_passage || ''}
            audioUrl={quiz.passage_audio_url}
            wordCount={quiz.word_count || undefined}
            estimatedReadTime={quiz.estimated_read_time || undefined}
          />
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {Math.round((currentQuestionIndex + 1) / questions.length * 100)}%
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {children}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )

  // Desktop view with enhanced split layout
  const DesktopLayout = () => (
    <div className="hidden lg:block">
      {/* Progress Header */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <h2 className="font-semibold">{quiz.title}</h2>
            </div>
            <div className="flex items-center gap-4">
              {/* Progress */}
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {answeredQuestions}/{questions.length} answered
                </span>
                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
              
              {/* Timer */}
              {timeLeft !== undefined && (
                <div className="flex items-center gap-2 text-primary">
                  <Timer className="w-4 h-4" />
                  <span className="font-mono">
                    {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Split Layout */}
      <div className="grid lg:grid-cols-12 gap-6 min-h-[70vh]">
        {/* Left side: Reading Passage */}
        <div className="lg:col-span-7">
          <ReadingPassageDisplay
            title={quiz.passage_title}
            source={quiz.passage_source}
            passage={quiz.reading_passage || ''}
            audioUrl={quiz.passage_audio_url}
            wordCount={quiz.word_count || undefined}
            estimatedReadTime={quiz.estimated_read_time || undefined}
            className="h-full"
          />
        </div>

        {/* Right side: Questions Navigation & Current Question */}
        <div className="lg:col-span-5 space-y-4">
          {/* Question Navigation */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Questions Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2 mb-4">
                {questions.map((question, index) => (
                  <button
                    key={question.id}
                    onClick={() => onQuestionChange(index)}
                    className={`aspect-square rounded-lg text-sm font-medium transition-all duration-200 ${
                      index === currentQuestionIndex
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : answers[question.id] !== undefined
                        ? 'bg-green-100 text-green-700 border-2 border-green-200 hover:bg-green-200'
                        : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-primary rounded-sm"></div>
                  <span>Current Question</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-100 border border-green-200 rounded-sm"></div>
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-muted rounded-sm"></div>
                  <span>Unanswered</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Question */}
          <Card className="flex-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </CardTitle>
                <div className="text-sm text-muted-foreground">
                  {questions[currentQuestionIndex]?.question_type === 'multiple_choice' && 'Multiple Choice'}
                  {questions[currentQuestionIndex]?.question_type === 'single_choice' && 'Single Choice'}
                  {questions[currentQuestionIndex]?.question_type === 'true_false' && 'True/False'}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {children}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )

  if (!quiz.reading_passage) {
    // Fallback to standard layout if no passage
    return <div className={className}>{children}</div>
  }

  return (
    <div className={`reading-quiz-layout ${className}`}>
      <MobileLayout />
      <DesktopLayout />
    </div>
  )
}