/**
 * Progressive Enhanced Quiz Taking Component
 * Week 2 Day 2: Optimistic updates and advanced UX patterns
 */

'use client'

import React, { useState, useTransition, useDeferredValue } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle, Clock, Upload } from 'lucide-react'
import { cn } from '@/lib/utils'
import { 
  useOptimisticQuizSubmission, 
  useProgressiveLoading,
  useBackgroundSyncStatus,
  useNetworkAwareOperations
} from '@/hooks/useProgressiveEnhancement'
import { AdaptiveSkeleton } from '@/components/ui/enhanced-skeletons'
import { useToast } from '@/hooks/use-toast'

interface QuizQuestion {
  id: string
  question: string
  options: Array<{
    id: string
    text: string
    isCorrect?: boolean
  }>
  type: 'multiple-choice' | 'true-false' | 'fill-in-blank'
}

interface QuizData {
  id: string
  title: string
  description: string
  questions: QuizQuestion[]
  timeLimit?: number
  category: string
}

interface ProgressiveQuizTakerProps {
  quiz: QuizData
  userId: string
  onComplete?: (score: number) => void
}

export function ProgressiveQuizTaker({ quiz, userId, onComplete }: ProgressiveQuizTakerProps) {
  const router = useRouter()
  const { toast } = useToast()
  
  // Progressive Enhancement State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [startTime] = useState(Date.now())
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // React 18 Concurrent Features
  const [isPending, startTransition] = useTransition()
  const deferredAnswers = useDeferredValue(answers)
  
  // Progressive Enhancement Hooks
  const optimisticSubmission = useOptimisticQuizSubmission()
  const { syncStatus, addPendingChange, startSync, completeSync } = useBackgroundSyncStatus()
  const { isOnline, isSlowConnection, queueOperation } = useNetworkAwareOperations()
  
  // Progress calculation
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100
  const answeredCount = Object.keys(deferredAnswers).length
  
  // Current question
  const currentQuestion = quiz.questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1
  
  // Progressive loading state
  const { showSkeleton, showContent, fadeIn } = useProgressiveLoading(
    currentQuestion,
    false,
    false
  )
  
  // Handle answer selection with optimistic updates
  const handleAnswerChange = (questionId: string, answer: any) => {
    startTransition(() => {
      setAnswers(prev => ({
        ...prev,
        [questionId]: answer
      }))
      
      addPendingChange()
      
      // Auto-save in background if online
      if (isOnline && !isSlowConnection) {
        queueOperation(async () => {
          await saveProgressToServer({
            quizId: quiz.id,
            userId,
            answers: { ...answers, [questionId]: answer },
            currentQuestion: currentQuestionIndex
          })
        })
      }
    })
  }
  
  // Navigate between questions with smooth transitions
  const navigateToQuestion = (direction: 'next' | 'prev') => {
    startTransition(() => {
      if (direction === 'next' && currentQuestionIndex < quiz.questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1)
      } else if (direction === 'prev' && currentQuestionIndex > 0) {
        setCurrentQuestionIndex(prev => prev - 1)
      }
    })
  }
  
  // Submit quiz with optimistic updates
  const handleSubmit = async () => {
    if (answeredCount < quiz.questions.length) {
      toast({
        title: "Incomplete Quiz",
        description: `Please answer all ${quiz.questions.length} questions before submitting.`,
        variant: "destructive",
      })
      return
    }
    
    setIsSubmitting(true)
    startSync()
    
    try {
      const submissionData = {
        quizId: quiz.id,
        userId,
        answers: deferredAnswers,
        timeSpent: Date.now() - startTime
      }
      
      // Use optimistic submission
      const result = await optimisticSubmission.mutateAsync(submissionData)
      
      completeSync(true)
      onComplete?.(result.score)
      
      toast({
        title: "Quiz Submitted!",
        description: `Your score: ${result.score}%`,
        variant: "default",
      })
      
      // Navigate to results with smooth transition
      startTransition(() => {
        router.push(`/quizzes/${quiz.id}/results/${result.id}`)
      })
      
    } catch (error) {
      completeSync(false)
      
      toast({
        title: "Submission Failed",
        description: "Please try again or check your connection.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Render question options based on type
  const renderQuestionOptions = (question: QuizQuestion) => {
    if (question.type === 'multiple-choice') {
      return (
        <div className="space-y-3">
          {question.options.map((option) => (
            <label
              key={option.id}
              className={cn(
                "flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-all",
                "hover:bg-muted/50",
                answers[question.id] === option.id && "border-primary bg-primary/10",
                isPending && "opacity-70"
              )}
            >
              <input
                type="radio"
                name={`question-${question.id}`}
                value={option.id}
                checked={answers[question.id] === option.id}
                onChange={() => handleAnswerChange(question.id, option.id)}
                className="sr-only"
              />
              <div className={cn(
                "w-4 h-4 rounded-full border-2 transition-colors",
                answers[question.id] === option.id 
                  ? "border-primary bg-primary" 
                  : "border-muted-foreground"
              )}>
                {answers[question.id] === option.id && (
                  <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />
                )}
              </div>
              <span className="flex-1 text-sm">{option.text}</span>
            </label>
          ))}
        </div>
      )
    }
    
    if (question.type === 'true-false') {
      return (
        <div className="space-y-3">
          {['true', 'false'].map((option) => (
            <label
              key={option}
              className={cn(
                "flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-all",
                "hover:bg-muted/50",
                answers[question.id] === option && "border-primary bg-primary/10",
                isPending && "opacity-70"
              )}
            >
              <input
                type="radio"
                name={`question-${question.id}`}
                value={option}
                checked={answers[question.id] === option}
                onChange={() => handleAnswerChange(question.id, option)}
                className="sr-only"
              />
              <div className={cn(
                "w-4 h-4 rounded-full border-2 transition-colors",
                answers[question.id] === option 
                  ? "border-primary bg-primary" 
                  : "border-muted-foreground"
              )}>
                {answers[question.id] === option && (
                  <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />
                )}
              </div>
              <span className="flex-1 capitalize">{option}</span>
            </label>
          ))}
        </div>
      )
    }
    
    return null
  }
  
  if (showSkeleton) {
    return <AdaptiveSkeleton type="quiz-question" />
  }
  
  return (
    <div className={cn("space-y-6", fadeIn && "animate-in fade-in-0 duration-300")}>
      {/* Header with Progress */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold">{quiz.title}</h2>
            <p className="text-muted-foreground">
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </p>
          </div>
          
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            {syncStatus === 'syncing' && (
              <Badge variant="secondary" className="animate-pulse">
                <Upload className="w-3 h-3 mr-1" />
                Syncing...
              </Badge>
            )}
            {syncStatus === 'success' && (
              <Badge variant="default" className="bg-green-500">
                <CheckCircle className="w-3 h-3 mr-1" />
                Saved
              </Badge>
            )}
            {!isOnline && (
              <Badge variant="destructive">
                <AlertCircle className="w-3 h-3 mr-1" />
                Offline
              </Badge>
            )}
            {isSlowConnection && (
              <Badge variant="secondary">
                <Clock className="w-3 h-3 mr-1" />
                Slow Connection
              </Badge>
            )}
          </div>
        </div>
        
        <Progress value={progress} className="h-2" />
        
        <div className="text-sm text-muted-foreground">
          {answeredCount} of {quiz.questions.length} questions answered
        </div>
      </div>
      
      {/* Question Card */}
      <Card className={cn("transition-all duration-300", isPending && "opacity-70")}>
        <CardHeader>
          <CardTitle className="text-lg leading-relaxed">
            {currentQuestion.question}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderQuestionOptions(currentQuestion)}
        </CardContent>
      </Card>
      
      {/* Navigation */}
      <div className="flex justify-between items-center pt-4">
        <Button
          variant="outline"
          onClick={() => navigateToQuestion('prev')}
          disabled={currentQuestionIndex === 0 || isPending}
        >
          Previous
        </Button>
        
        <div className="flex space-x-2">
          {!isLastQuestion ? (
            <Button
              onClick={() => navigateToQuestion('next')}
              disabled={isPending}
            >
              Next Question
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || isPending || answeredCount < quiz.questions.length}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <Upload className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Quiz'
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

// Helper function to save progress to server
async function saveProgressToServer(data: {
  quizId: string
  userId: string
  answers: Record<string, any>
  currentQuestion: number
}) {
  const response = await fetch('/api/quiz-progress', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  
  if (!response.ok) {
    throw new Error('Failed to save progress')
  }
  
  return response.json()
}