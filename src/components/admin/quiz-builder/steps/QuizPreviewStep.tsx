// Quiz Preview Step Component
// Handles quiz preview, validation, and publishing

import React, { memo, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, CheckCircle, AlertTriangle, Clock, Target, Users, BarChart3 } from 'lucide-react'
import { usePerformanceMonitor } from '@/hooks/usePerformanceOptimization'
import type { Quiz, QuizQuestion } from '@/lib/supabase'

interface QuizPreviewStepProps {
  quiz: Partial<Quiz>
  questions: QuizQuestion[]
  onSave?: () => void
  onPublish?: () => void
  isSaving?: boolean
  isPublishing?: boolean
}

export const QuizPreviewStep = memo<QuizPreviewStepProps>(({
  quiz,
  questions,
  onSave,
  onPublish,
  isSaving = false,
  isPublishing = false
}) => {
  // Performance monitoring
  const { metrics } = usePerformanceMonitor({
    componentName: 'QuizPreviewStep',
    threshold: 16,
    logSlowRenders: process.env.NODE_ENV === 'development'
  })

  // Calculate quiz statistics
  const quizStats = useMemo(() => {
    const totalQuestions = questions.length
    const validQuestions = questions.filter(q => 
      q.question?.trim() && 
      q.options && 
      q.options.length >= 2 &&
      q.correct_answer !== null
    ).length
    
    const totalPoints = questions.reduce((sum, q) => sum + (q.points || 1), 0)
    const estimatedTime = Math.ceil(totalQuestions * 1.5) // 1.5 minutes per question average
    
    const questionTypes = questions.reduce((acc, q) => {
      const type = q.question_type || 'multiple_choice'
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const isValid = !!(
      quiz.title?.trim() &&
      quiz.category?.trim() &&
      totalQuestions > 0 &&
      validQuestions === totalQuestions
    )

    return {
      totalQuestions,
      validQuestions,
      totalPoints,
      estimatedTime,
      questionTypes,
      isValid,
      completionRate: totalQuestions > 0 ? (validQuestions / totalQuestions) * 100 : 0
    }
  }, [quiz, questions])

  const validationIssues = useMemo(() => {
    const issues: string[] = []
    
    if (!quiz.title?.trim()) issues.push('Quiz title is required')
    if (!quiz.category?.trim()) issues.push('Quiz category is required')
    if (quizStats.totalQuestions === 0) issues.push('At least one question is required')
    if (quizStats.validQuestions < quizStats.totalQuestions) {
      issues.push(`${quizStats.totalQuestions - quizStats.validQuestions} question(s) need to be completed`)
    }
    
    return issues
  }, [quiz, quizStats])

  const questionTypeLabels: Record<string, string> = {
    'multiple_choice': 'Multiple Choice',
    'true_false': 'True/False',
    'fill_blank': 'Fill in the Blank',
    'essay': 'Essay',
    'matching': 'Matching',
    'ordering': 'Ordering'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-xl text-gray-900">
            <Eye className="h-6 w-6 mr-3 text-primary" />
            Quiz Preview & Publishing
          </CardTitle>
          <p className="text-gray-600">Review your quiz and publish when ready</p>
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-gray-500">
              QuizPreviewStep - {metrics.renderCount} renders | Avg: {metrics.averageRenderTime.toFixed(2)}ms
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Quiz Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quiz Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{quiz.title || 'Untitled Quiz'}</h3>
              <p className="text-gray-600 mt-1">{quiz.description || 'No description provided'}</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{quizStats.totalQuestions}</div>
                <div className="text-sm text-gray-600">Questions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{quizStats.totalPoints}</div>
                <div className="text-sm text-gray-600">Total Points</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{quizStats.estimatedTime}</div>
                <div className="text-sm text-gray-600">Est. Minutes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{quizStats.completionRate.toFixed(0)}%</div>
                <div className="text-sm text-gray-600">Complete</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quiz Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Question Types */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <BarChart3 className="h-5 w-5 mr-2 text-primary" />
              Question Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(quizStats.questionTypes).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(quizStats.questionTypes).map(([type, count]) => (
                  <div key={type} className="flex justify-between items-center">
                    <span className="text-gray-700">{questionTypeLabels[type] || type}</span>
                    <span className="font-semibold text-primary">{count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No questions added yet</p>
            )}
          </CardContent>
        </Card>

        {/* Settings Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Target className="h-5 w-5 mr-2 text-primary" />
              Quiz Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-700">Category:</span>
              <span className="font-semibold">{quiz.category || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Difficulty:</span>
              <span className="font-semibold capitalize">{quiz.difficulty || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Time Limit:</span>
              <span className="font-semibold">
                {quiz.time_limit_minutes ? `${quiz.time_limit_minutes} minutes` : 'No limit'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Passing Score:</span>
              <span className="font-semibold">{quiz.passing_score || 70}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Max Attempts:</span>
              <span className="font-semibold">
                {quiz.max_attempts === 0 ? 'Unlimited' : quiz.max_attempts || 'Not set'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Validation Status */}
      <Card className={`border-2 ${quizStats.isValid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
        <CardContent className="pt-6">
          <div className={`flex items-center ${quizStats.isValid ? 'text-green-800' : 'text-red-800'}`}>
            {quizStats.isValid ? (
              <CheckCircle className="h-6 w-6 mr-3" />
            ) : (
              <AlertTriangle className="h-6 w-6 mr-3" />
            )}
            <div>
              <h3 className="font-semibold">
                {quizStats.isValid ? 'Quiz is ready to publish!' : 'Quiz needs attention'}
              </h3>
              <p className={`text-sm ${quizStats.isValid ? 'text-green-700' : 'text-red-700'}`}>
                {quizStats.isValid 
                  ? 'All validation checks passed. Your quiz is ready for students.'
                  : 'Please fix the issues below before publishing.'
                }
              </p>
            </div>
          </div>
          
          {!quizStats.isValid && validationIssues.length > 0 && (
            <ul className="mt-4 list-disc list-inside text-red-700 text-sm space-y-1">
              {validationIssues.map((issue, index) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {quiz.is_published ? 'This quiz is published and visible to students' : 'This quiz is saved as a draft'}
            </div>
            
            <div className="flex space-x-3">
              {onSave && (
                <button
                  onClick={onSave}
                  disabled={isSaving}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Draft'}
                </button>
              )}
              
              {onPublish && (
                <button
                  onClick={onPublish}
                  disabled={!quizStats.isValid || isPublishing}
                  className="px-4 py-2 bg-primary hover:bg-secondary text-white hover:text-black rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPublishing ? 'Publishing...' : 'Publish Quiz'}
                </button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}, (prevProps, nextProps) => {
  // Custom comparison for optimal re-rendering
  return (
    prevProps.quiz === nextProps.quiz &&
    prevProps.questions.length === nextProps.questions.length &&
    prevProps.isSaving === nextProps.isSaving &&
    prevProps.isPublishing === nextProps.isPublishing
  )
})

QuizPreviewStep.displayName = 'QuizPreviewStep'

export default QuizPreviewStep
