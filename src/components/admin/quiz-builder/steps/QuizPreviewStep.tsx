// Quiz Preview Step Component
// Handles quiz preview, validation, and publishing

import React, { memo, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
              QuizPreviewStep - {performanceMetrics.metrics?.renderCount || 0} renders | Avg: {performanceMetrics.metrics?.averageRenderTime.toFixed(2) || 0}ms
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

      {/* Questions Preview */}
      {questions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Target className="h-5 w-5 mr-2 text-primary" />
              Questions ({questions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {questions.map((question, index) => {
                // Use the same validation logic as the quiz stats
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
                      isValid = true
                      break
                    case 'matching':
                    case 'ordering':
                      isValid = !!(question.options && question.options.length >= 2)
                      break
                    default:
                      isValid = question.correct_answer !== null
                  }
                }
                
                return (
                  <div key={question.id || index} className={`border rounded-lg p-4 ${isValid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-gray-500">
                            Q{index + 1} - {questionTypeLabels[question.question_type] || question.question_type}
                          </span>
                          {isValid ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                        <p className="text-gray-900 font-medium mb-2">
                          {question.question || 'No question text'}
                        </p>
                        
                        {/* Display options based on question type */}
                        {question.question_type === 'multiple_choice' && question.options && (
                          <div className="space-y-1">
                            {question.options.map((option: string, optionIndex: number) => (
                              <div key={optionIndex} className={`text-sm px-2 py-1 rounded ${
                                question.correct_answer === optionIndex 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                {String.fromCharCode(65 + optionIndex)}. {option || `Option ${optionIndex + 1}`}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {question.question_type === 'true_false' && (
                          <div className="space-y-1">
                            <div className={`text-sm px-2 py-1 rounded ${
                              question.correct_answer === 1
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              ✓ True
                            </div>
                            <div className={`text-sm px-2 py-1 rounded ${
                              question.correct_answer === 0
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              ✗ False
                            </div>
                          </div>
                        )}
                        
                        {(question.question_type === 'fill_blank' || question.question_type === 'essay') && question.correct_answer && (
                          <div className="text-sm px-2 py-1 rounded bg-green-100 text-green-800">
                            Answer: {question.correct_answer.toString()}
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {question.points || 1} pt{(question.points || 1) !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

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
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Draft'}
                </button>
              )}
              
              {onPublish && (
                <button
                  onClick={onPublish}
                  disabled={!quizStats.isValid || isPublishing}
                  className="px-4 py-2 bg-primary text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
