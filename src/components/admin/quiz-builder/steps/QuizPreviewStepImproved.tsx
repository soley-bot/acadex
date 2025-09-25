// Quiz Preview Step Component - Improved Layout
// Handles quiz preview, validation, and publishing

import React, { memo, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Eye, CheckCircle, AlertTriangle, Clock, Target, Users, BarChart3 } from 'lucide-react'
import { useQuizBuilderPerformance } from '@/lib/adminPerformanceSystem'
import { calculateQuizStats } from '../utils/QuizBuilderUtils'
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
  const performanceMetrics = useQuizBuilderPerformance()

  // Calculate quiz statistics
  const quizStats = useMemo(() => {
    const baseStats = calculateQuizStats(quiz, questions)
    
    // Add category validation for this component
    const isValid = !!(
      quiz.title?.trim() &&
      quiz.category?.trim() &&
      baseStats.totalQuestions > 0 &&
      baseStats.validQuestions === baseStats.totalQuestions
    )

    return {
      ...baseStats,
      isValid
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
    <Card className="p-6 border rounded-lg">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Quiz Review & Publish</h3>
        </div>

        {/* Compact header summary - all key info in 2-line overview */}
        <Card className="border border-gray-200">
          <CardContent className="p-4 space-y-2">
            <div className="text-sm font-medium">
              &ldquo;{quiz.title || 'Untitled Quiz'}&rdquo; • {quiz.category || 'No Category'} • {quiz.difficulty || 'No Difficulty'}
            </div>
            <div className="text-xs text-gray-600">
              {quizStats.totalQuestions} questions • {quizStats.totalPoints} points • ~{quizStats.estimatedTime} minutes • {quizStats.completionRate.toFixed(0)}% complete
            </div>
            <div className="flex items-center gap-4 mt-3">
              {validationIssues.length === 0 ? (
                <div className="flex items-center gap-1 text-green-600 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  <span>Ready to publish</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-amber-600 text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{validationIssues.length} issue{validationIssues.length !== 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Side-by-side details - question distribution and settings together */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-700">Question Distribution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.entries(
                questions.reduce((acc, q) => {
                  const type = questionTypeLabels[q.question_type] || q.question_type
                  acc[type] = (acc[type] || 0) + 1
                  return acc
                }, {} as Record<string, number>)
              ).map(([type, count]) => (
                <div key={type} className="flex justify-between text-sm">
                  <span>{type}:</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
              {questions.length === 0 && (
                <p className="text-gray-500 text-sm">No questions added yet</p>
              )}
            </CardContent>
          </Card>

          <Card className="border border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-700">Settings Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Time Limit:</span>
                <span className="font-medium">{quiz.duration_minutes || 'Not set'} minutes</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Attempts:</span>
                <span className="font-medium">3 maximum</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Passing Score:</span>
                <span className="font-medium">70%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Difficulty:</span>
                <span className="font-medium">{quiz.difficulty || 'Not set'}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Condensed question preview - one line per question with status */}
        <Card className="border border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-700">Questions Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {questions.length === 0 ? (
              <p className="text-gray-500 text-sm">No questions added yet</p>
            ) : (
              <>
                <div className="space-y-1">
                  {questions.slice(0, 5).map((question, index) => {
                    // Validate question
                    let isValid = false
                    if (question.question?.trim()) {
                      switch (question.question_type) {
                        case 'multiple_choice':
                        case 'single_choice':
                          isValid = !!(question.options && question.options.length >= 2 && question.correct_answer !== null)
                          break
                        case 'true_false':
                          isValid = (question.correct_answer !== null && question.correct_answer !== undefined)
                          break
                        case 'fill_blank':
                        case 'essay':
                          isValid = !!question.correct_answer_text?.trim()
                          break
                        default:
                          isValid = true
                      }
                    }

                    const typeLabel = questionTypeLabels[question.question_type] || question.question_type

                    return (
                      <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded text-sm">
                        <div className="flex-1">
                          <span className="font-medium">
                            {index + 1}. {question.question?.substring(0, 60)}
                            {(question.question?.length || 0) > 60 ? '...' : ''}
                          </span>
                          <span className="text-gray-500 ml-2">[{typeLabel}]</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {isValid ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-amber-600" />
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {questions.length > 5 && (
                  <div className="text-center pt-2">
                    <Button variant="outline" size="sm">
                      View All {questions.length} Questions
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Focused issue resolution - clear list of problems with action buttons */}
        {validationIssues.length > 0 && (
          <Card className="border border-amber-200 bg-amber-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-amber-800">Issues to Resolve</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                {validationIssues.map((issue, index) => (
                  <div key={index} className="text-sm text-amber-700">
                    • {issue}
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm">
                  Fix Issues
                </Button>
                <Button variant="outline" size="sm" className="text-amber-700 border-amber-300">
                  Publish with Minor Issues
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Streamlined actions - three clear options at bottom */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <Button 
            variant="outline" 
            onClick={onSave}
            disabled={isSaving}
            className="flex items-center justify-center gap-2"
          >
            {isSaving ? 'Saving...' : 'Save Draft'}
          </Button>
          
          <Button variant="outline" className="flex items-center justify-center gap-2">
            <Eye className="w-4 h-4" />
            Preview Quiz
          </Button>
          
          <Button 
            onClick={onPublish}
            disabled={!quizStats.isValid || isPublishing}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
          >
            {isPublishing ? 'Publishing...' : 'Publish Quiz'}
          </Button>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-gray-500 text-center">
            QuizPreviewStep - {performanceMetrics.metrics?.renderCount || 0} renders | Avg: {performanceMetrics.metrics?.averageRenderTime.toFixed(2) || 0}ms
          </div>
        )}
      </div>
    </Card>
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
