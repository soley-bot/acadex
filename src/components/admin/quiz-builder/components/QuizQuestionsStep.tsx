import React, { memo, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { IconRocket, IconAlertTriangle } from '@tabler/icons-react'
import { calculateQuizStats } from '../utils/QuizBuilderUtils'
import type { Quiz, QuizQuestion } from '@/lib/supabase'
import { QuestionCreationInterface } from './QuestionCreationInterface'
import { InlineQuestionEditor } from './InlineQuestionEditorClean'

interface QuizQuestionsProps {
  questions: QuizQuestion[]
  onUpdate: (index: number, updates: Partial<QuizQuestion>) => void
  onAdd: (questionType: string) => void
  onDuplicate: (index: number) => void
  onRemove: (index: number) => void
  onGenerateAI?: () => void
  isGenerating?: boolean
  aiConfig?: any
  onAIConfigChange?: (config: any) => void
  quizData?: Partial<Quiz>
}

interface QuestionValidation {
  question: QuizQuestion
  errors: string[]
  index: number
}

export const QuizQuestions = memo<QuizQuestionsProps>(({
  questions,
  onUpdate,
  onAdd,
  onDuplicate,
  onRemove,
  onGenerateAI,
  isGenerating = false,
  aiConfig,
  onAIConfigChange,
  quizData
}) => {
  const questionsWithValidation = useMemo((): QuestionValidation[] => {
    return questions.map((question: QuizQuestion, index: number) => {
      const errors: string[] = []

      // Validate question text
      if (!question.question?.trim()) {
        errors.push('Question text is required')
      }

      // Validate based on question type
      if (question.question_type === 'multiple_choice' || question.question_type === 'single_choice') {
        if (!question.options || question.options.length < 2) {
          errors.push('At least 2 options required')
        }
        if (question.correct_answer === null || question.correct_answer === undefined) {
          errors.push('Correct answer is required')
        }
      }

      if (question.question_type === 'true_false') {
        if (question.correct_answer === null || question.correct_answer === undefined || ![0, 1].includes(question.correct_answer)) {
          errors.push('True/False answer required')
        }
      }

      if (question.question_type === 'fill_blank' || question.question_type === 'essay') {
        if (!question.correct_answer_text?.trim()) {
          errors.push('Correct answer is required')
        }
      }

      return { question, errors, index }
    })
  }, [questions])

  const handleGenerateAI = () => {
    if (!onGenerateAI) return
    
    // Basic validation - ensure we have AI config set up
    const validTypes = ['multiple_choice', 'true_false', 'short_answer'].filter(type => {
      return aiConfig?.[type]?.enabled
    })
    
    if (validTypes.length === 0) {
      alert('Please select at least one question type before generating.')
      return
    }
    onGenerateAI()
  }

  const validQuestions = questionsWithValidation.filter(({ errors }) => errors.length === 0)
  const invalidQuestions = questionsWithValidation.filter(({ errors }) => errors.length > 0)

  // Calculate quiz stats for summary display
  const quizStats = useMemo(() => {
    return calculateQuizStats(quizData || {}, questions)
  }, [quizData, questions])

  return (
    <Card className="p-4 border rounded-lg">
      <div className="flex flex-col gap-4">
        {/* Optimized Header with inline controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-semibold">Quiz Questions</h3>
            <Badge variant="outline" className="text-xs">
              {questions.length} questions
            </Badge>
            {onGenerateAI && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateAI}
                disabled={isGenerating}
                className="flex items-center gap-1 text-xs"
              >
                <IconRocket size={12} />
                {isGenerating ? 'Generating...' : 'Generate More'}
              </Button>
            )}
          </div>

          <QuestionCreationInterface 
            onCreateQuestion={onAdd} 
            quizData={quizData}
            existingQuestions={questions}
          />
        </div>

      {/* Validation Summary */}
      {invalidQuestions.length > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <IconAlertTriangle className="w-4 h-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="text-sm font-medium">
                {invalidQuestions.length} question{invalidQuestions.length === 1 ? '' : 's'} need{invalidQuestions.length === 1 ? 's' : ''} attention
              </p>
              {invalidQuestions.map(({ index, errors }) => (
                <p key={index} className="text-sm text-gray-600">
                  Question {index + 1}: {errors.join(', ')}
                </p>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Questions List */}
      {questions.length === 0 ? (
        <Card className="border border-gray-200">
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <p className="text-lg text-gray-500">No questions yet</p>
            <p className="text-sm text-gray-500 text-center">
              Create your first question to get started with your quiz
            </p>
            <QuestionCreationInterface 
              onCreateQuestion={onAdd} 
              quizData={quizData}
              existingQuestions={questions}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {questionsWithValidation.map(({ question, errors, index }) => (
            <InlineQuestionEditor
              key={index}
              question={question}
              questionIndex={index}
              errors={errors}
              onUpdate={onUpdate}
              onDuplicate={onDuplicate}
              onRemove={onRemove}
            />
          ))}
        </div>
      )}

        {/* Compact stats footer - essential metrics in single row */}
        {questions.length > 0 && (
          <div className="grid grid-cols-4 gap-4 p-3 bg-gray-50 border rounded-lg text-center">
            <div>
              <div className="text-sm font-medium">{questions.length}</div>
              <div className="text-xs text-gray-600">Total</div>
            </div>
            <div>
              <div className="text-sm font-medium text-green-600">{validQuestions.length}</div>
              <div className="text-xs text-gray-600">Valid</div>
            </div>
            <div>
              <div className={`text-sm font-medium ${invalidQuestions.length > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                {invalidQuestions.length}
              </div>
              <div className="text-xs text-gray-600">Issues</div>
            </div>
            <div>
              <div className="text-sm font-medium text-blue-600">{quizStats.totalPoints}</div>
              <div className="text-xs text-gray-600">Points Total</div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
})

QuizQuestions.displayName = 'QuizQuestions'