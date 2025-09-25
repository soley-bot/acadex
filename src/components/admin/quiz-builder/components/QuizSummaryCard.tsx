import React, { memo, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { 
  IconCircleCheck,
  IconAlertTriangle,
  IconDeviceFloppy,
  IconWorldUpload,
  IconClock,
  IconTargetArrow,
  IconQuestionMark,
  IconCheck
} from '@tabler/icons-react'
import type { Quiz, QuizQuestion } from '@/lib/supabase'
import { calculateQuizStats } from '../utils/QuizBuilderUtils'

interface QuizSummaryCardProps {
  quiz: Partial<Quiz>
  questions: QuizQuestion[]
  onSave: () => void
  onPublish: () => void
  isSaving: boolean
  isPublishing: boolean
  canPublish?: boolean
}

export const QuizSummaryCard = memo<QuizSummaryCardProps>(({
  quiz,
  questions,
  onSave,
  onPublish,
  isSaving,
  isPublishing,
  canPublish = false
}) => {
  const summaryStats = useMemo(() => {
    const baseStats = calculateQuizStats(quiz, questions)
    
    // Add the helper properties that the component needs
    return {
      ...baseStats,
      hasTitle: Boolean(quiz.title?.trim()),
      hasQuestions: questions.length > 0,
      allQuestionsValid: baseStats.validQuestions === baseStats.totalQuestions
    }
  }, [questions, quiz])

  const getStatusColor = (isComplete: boolean) => isComplete ? 'green' : 'orange'
  const getStatusIcon = (isComplete: boolean) => isComplete ? <IconCheck size={14} /> : <IconAlertTriangle size={14} />

  return (
    <Card className="shadow-sm border border-gray-200">
      <CardContent className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <IconCircleCheck size={20} className="text-green-600" />
            <h3 className="text-lg font-semibold">Quiz Summary</h3>
          </div>
          <Badge 
            className={summaryStats.isValid ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}
          >
            <div className="flex items-center gap-1">
              {summaryStats.isValid ? <IconCheck size={12} /> : <IconAlertTriangle size={12} />}
              {summaryStats.isValid ? 'Ready to Publish' : 'Needs Attention'}
            </div>
          </Badge>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="border border-blue-200 bg-blue-50 p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">
              {summaryStats.totalQuestions}
            </p>
            <p className="text-sm text-gray-600">Total Questions</p>
          </Card>

          <Card className="border border-green-200 bg-green-50 p-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              {summaryStats.validQuestions}
            </p>
            <p className="text-sm text-gray-600">Valid Questions</p>
          </Card>

          <Card className="border border-yellow-200 bg-yellow-50 p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">
              {summaryStats.totalPoints}
            </p>
            <p className="text-sm text-gray-600">Total Points</p>
          </Card>

          <Card className="border border-purple-200 bg-purple-50 p-4 text-center">
            <p className="text-2xl font-bold text-violet-600">
              {quiz.duration_minutes || 10}m
            </p>
            <p className="text-sm text-gray-600">Est. Time</p>
          </Card>
        </div>

        {/* Progress Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Quiz Completion</span>
            <span className="text-gray-600">
              {Math.round((summaryStats.completionRate || 0))}%
            </span>
          </div>
          <Progress 
            value={summaryStats.completionRate || 0} 
            className="h-2"
          />
        </div>

        {/* Checklist */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(summaryStats.hasTitle)}
              <span className="text-sm">Has Title</span>
            </div>
            <Badge 
              className={summaryStats.hasTitle ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}
            >
              {summaryStats.hasTitle ? 'Added' : 'Missing'}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(summaryStats.hasQuestions)}
              <span className="text-sm">Has Questions</span>
            </div>
            <Badge 
              className={summaryStats.hasQuestions ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}
            >
              {summaryStats.hasQuestions ? `${summaryStats.totalQuestions} Added` : 'None'}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(summaryStats.allQuestionsValid)}
              <span className="text-sm">All Questions Valid</span>
            </div>
            <Badge 
              className={summaryStats.allQuestionsValid ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}
            >
              {summaryStats.allQuestionsValid ? 'All Valid' : `${summaryStats.validQuestions}/${summaryStats.totalQuestions}`}
            </Badge>
          </div>
        </div>

        {/* Validation Alert */}
        {!summaryStats.isValid && (
          <Alert className="border-orange-200 bg-orange-50">
            <IconAlertTriangle className="w-4 h-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="text-sm font-medium">Complete these steps to publish:</p>
                <ul className="text-sm space-y-1 ml-0 pl-5">
                  {!summaryStats.hasTitle && <li>Add a quiz title</li>}
                  {!summaryStats.hasQuestions && <li>Add at least one question</li>}
                  {summaryStats.hasQuestions && !summaryStats.allQuestionsValid && (
                    <li>Fix {summaryStats.totalQuestions - summaryStats.validQuestions} invalid question(s)</li>
                  )}
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Separator />

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={onSave}
            disabled={isPublishing || isSaving}
            className="flex items-center gap-2"
          >
            <IconDeviceFloppy size={16} />
            {isSaving ? 'Saving...' : 'Save Draft'}
          </Button>

          <Button
            onClick={onPublish}
            disabled={!summaryStats.isValid || isSaving || !canPublish || isPublishing}
            className={`flex items-center gap-2 ${
              summaryStats.isValid ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            <IconWorldUpload size={16} />
            {isPublishing ? 'Publishing...' : 'Publish Quiz'}
          </Button>
        </div>

        {/* Quiz Info Summary */}
        {summaryStats.isValid && (
          <Card className="border border-green-200 bg-green-50 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconTargetArrow size={16} className="text-green-700" />
                <span className="text-sm font-medium text-green-700">Ready to Publish!</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <IconQuestionMark size={14} />
                  <span className="text-xs text-gray-600">{summaryStats.totalQuestions} Questions</span>
                </div>
                <div className="flex items-center gap-1">
                  <IconClock size={14} />
                  <span className="text-xs text-gray-600">{quiz.duration_minutes || 10} min</span>
                </div>
              </div>
            </div>
          </Card>
        )}
      </CardContent>
    </Card>
  )
})

QuizSummaryCard.displayName = 'QuizSummaryCard'
