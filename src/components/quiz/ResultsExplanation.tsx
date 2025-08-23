/**
 * Results Explanation Component
 * Enhanced text formatting optimized for mobile reading
 */

'use client'

import { CheckCircle, AlertTriangle, Lightbulb } from 'lucide-react'

interface ResultsExplanationProps {
  question: string
  userAnswer: string
  correctAnswer: string
  isCorrect: boolean
  explanation?: string
  questionNumber: number
}

export function ResultsExplanation({
  question,
  userAnswer,
  correctAnswer,
  isCorrect,
  explanation,
  questionNumber
}: ResultsExplanationProps) {
  return (
    <div className="space-y-4">
      {/* Question Header */}
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
          isCorrect 
            ? 'bg-success text-white' 
            : 'bg-destructive text-white'
        }`}>
          {isCorrect ? (
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          ) : (
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-1">
            Question {questionNumber}
          </h4>
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed break-words">
            {question}
          </p>
        </div>
      </div>

      {/* Answers Section */}
      <div className="ml-11 sm:ml-13 space-y-3">
        {/* User Answer */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
            Your answer:
          </div>
          <div className={`text-sm sm:text-base font-medium break-words ${
            isCorrect ? 'text-success' : 'text-destructive'
          }`}>
            {userAnswer}
          </div>
        </div>

        {/* Correct Answer (if different) */}
        {!isCorrect && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="text-xs sm:text-sm font-medium text-green-700 mb-1">
              Correct answer:
            </div>
            <div className="text-sm sm:text-base font-medium text-success break-words">
              {correctAnswer}
            </div>
          </div>
        )}

        {/* Explanation */}
        {explanation && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-xs sm:text-sm font-medium text-blue-700 mb-1">
                  Explanation:
                </div>
                <div className="text-sm sm:text-base text-blue-800 leading-relaxed break-words">
                  {explanation}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
