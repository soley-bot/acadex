"use client"

import { CheckCircle, Circle, AlertTriangle, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"

interface Question {
  id: string
  question: string
  question_type: string
  points?: number
}

interface QuizReviewStepProps {
  questions: Question[]
  answers: Record<string, any>
  onEdit: (questionIndex: number) => void
  onSubmit: () => void
  onBack: () => void
  submitting?: boolean
}

export function QuizReviewStep({
  questions,
  answers,
  onEdit,
  onSubmit,
  onBack,
  submitting = false
}: QuizReviewStepProps) {
  const answeredQuestions = questions.filter(q => answers[q.id] !== undefined && answers[q.id] !== null && answers[q.id] !== '')
  const unansweredQuestions = questions.filter(q => !answers[q.id] || answers[q.id] === '' || (Array.isArray(answers[q.id]) && answers[q.id].length === 0))
  const totalPoints = questions.reduce((sum, q) => sum + (q.points || 1), 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur border-b">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Quiz
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            Review Your Answers
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {/* Summary Card */}
        <div className="bg-white rounded-xl shadow-lg border p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-2xl font-bold text-green-700">{answeredQuestions.length}</p>
              <p className="text-sm text-green-600">Answered</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-2xl font-bold text-orange-700">{unansweredQuestions.length}</p>
              <p className="text-sm text-orange-600">Unanswered</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-2xl font-bold text-blue-700">{totalPoints}</p>
              <p className="text-sm text-blue-600">Total Points</p>
            </div>
          </div>

          {unansweredQuestions.length > 0 && (
            <div className="p-4 bg-warning/10 border border-warning rounded-lg flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-warning-foreground">
                  {unansweredQuestions.length} unanswered question{unansweredQuestions.length !== 1 ? 's' : ''}
                </p>
                <p className="text-sm text-warning-foreground/80 mt-1">
                  You can still go back and answer them before submitting.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Questions List */}
        <div className="space-y-3 mb-6">
          {questions.map((question, idx) => {
            const isAnswered = answers[question.id] !== undefined &&
                              answers[question.id] !== null &&
                              answers[question.id] !== '' &&
                              !(Array.isArray(answers[question.id]) && answers[question.id].length === 0)

            return (
              <div
                key={question.id}
                className={cn(
                  "bg-white border-2 rounded-lg p-4 transition-all hover:shadow-md",
                  isAnswered ? "border-green-200" : "border-orange-200"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0 mt-1">
                      {isAnswered ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <Circle className="h-5 w-5 text-orange-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">Question {idx + 1}</span>
                        <span className="text-xs px-2 py-0.5 bg-muted rounded-full">
                          {question.points || 1} pt{(question.points || 1) !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {question.question}
                      </p>
                      {isAnswered && (
                        <div className="mt-2 text-xs text-green-600 font-medium">
                          ✓ Answer provided
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => onEdit(idx)}
                    className="text-sm text-primary hover:text-primary/80 font-medium transition-colors whitespace-nowrap"
                  >
                    {isAnswered ? 'Review' : 'Answer'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Submit Button */}
        <div className="bg-white rounded-xl shadow-lg border p-6">
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Ready to submit?</h3>
            <p className="text-sm text-muted-foreground">
              Once submitted, you won&apos;t be able to change your answers.
            </p>
          </div>
          <button
            onClick={onSubmit}
            disabled={submitting}
            className={cn(
              "w-full py-3 px-4 rounded-lg font-medium transition-all",
              "bg-primary text-primary-foreground hover:bg-primary/90",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              submitting && "animate-pulse"
            )}
          >
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        </div>
      </div>
    </div>
  )
}
