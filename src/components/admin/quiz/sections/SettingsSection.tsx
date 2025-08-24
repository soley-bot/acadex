'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useQuizForm } from '@/contexts/QuizContext'

export const SettingsSection = React.memo(() => {
  const { formData, updateFormData, errors } = useQuizForm()

  const getFieldError = (fieldName: string) => {
    return errors.find(error => error.field === fieldName)?.message
  }

  const hasFieldError = (fieldName: string) => {
    return errors.some(error => error.field === fieldName)
  }

  return (
    <div className="space-y-6">
      {/* Scoring Settings */}
      <Card variant="base" className="p-6">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Scoring Settings
          </CardTitle>
        </CardHeader>
        
        <CardContent className="px-0 pb-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Passing Score (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.passing_score}
                onChange={(e) => updateFormData('passing_score', parseInt(e.target.value) || 70)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  hasFieldError('passing_score') ? 'border-destructive' : 'border-gray-300'
                }`}
              />
              {hasFieldError('passing_score') && (
                <p className="mt-1 text-sm text-destructive">
                  {getFieldError('passing_score')}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Minimum score required to pass (0-100%)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Limit Type
              </label>
              <select
                value={formData.time_limit_type}
                onChange={(e) => updateFormData('time_limit_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="quiz">Entire Quiz</option>
                <option value="question">Per Question</option>
                <option value="none">No Time Limit</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                How time limits should be applied
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attempt Settings */}
      <Card variant="base" className="p-6">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Attempt Settings
          </CardTitle>
        </CardHeader>
        
        <CardContent className="px-0 pb-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Attempts
              </label>
              <select
                value={formData.max_attempts}
                onChange={(e) => updateFormData('max_attempts', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={0}>Unlimited</option>
                <option value={1}>1 attempt</option>
                <option value={2}>2 attempts</option>
                <option value={3}>3 attempts</option>
                <option value={5}>5 attempts</option>
                <option value={10}>10 attempts</option>
              </select>
              {hasFieldError('max_attempts') && (
                <p className="mt-1 text-sm text-destructive">
                  {getFieldError('max_attempts')}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                How many times students can attempt this quiz
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Show Results
              </label>
              <select
                value="immediate"
                onChange={() => {}} // Placeholder for future feature
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled
              >
                <option value="immediate">Immediately after submission</option>
                <option value="after_due">After due date</option>
                <option value="manual">Manual release</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                When students can see their results (coming soon)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      <Card variant="base" className="p-6">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Advanced Settings
          </CardTitle>
        </CardHeader>
        
        <CardContent className="px-0 pb-0">
          <div className="space-y-4">
            {/* Randomize Questions */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="randomize_questions"
                checked={false} // Placeholder for future feature
                onChange={() => {}} // Placeholder for future feature
                className="h-4 w-4 text-primary focus:ring-blue-500 border-gray-300 rounded"
                disabled
              />
              <label htmlFor="randomize_questions" className="ml-2 block text-sm text-gray-900">
                Randomize question order for each student
              </label>
            </div>

            {/* Show Feedback */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="show_feedback"
                checked={true} // Default to true
                onChange={() => {}} // Placeholder for future feature
                className="h-4 w-4 text-primary focus:ring-blue-500 border-gray-300 rounded"
                disabled
              />
              <label htmlFor="show_feedback" className="ml-2 block text-sm text-gray-900">
                Show explanations after each question
              </label>
            </div>

            {/* Allow Review */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="allow_review"
                checked={true} // Default to true
                onChange={() => {}} // Placeholder for future feature
                className="h-4 w-4 text-primary focus:ring-blue-500 border-gray-300 rounded"
                disabled
              />
              <label htmlFor="allow_review" className="ml-2 block text-sm text-gray-900">
                Allow students to review answers before submission
              </label>
            </div>

            {/* Require Password */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="require_password"
                checked={false} // Placeholder for future feature
                onChange={() => {}} // Placeholder for future feature
                className="h-4 w-4 text-primary focus:ring-blue-500 border-gray-300 rounded"
                disabled
              />
              <label htmlFor="require_password" className="ml-2 block text-sm text-gray-900">
                Require password to access quiz
              </label>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Coming Soon</h4>
            <p className="text-sm text-blue-800">
              Advanced features like question randomization, custom feedback timing, 
              and password protection will be available in future updates.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quiz Summary */}
      <Card variant="base" className="p-6 bg-gray-50">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Quiz Summary
          </CardTitle>
        </CardHeader>
        
        <CardContent className="px-0 pb-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-white p-4 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {formData.duration_minutes}
              </div>
              <div className="text-sm text-gray-600">Minutes</div>
            </div>
            
            <div className="bg-white p-4 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {formData.passing_score}%
              </div>
              <div className="text-sm text-gray-600">Pass Score</div>
            </div>
            
            <div className="bg-white p-4 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {formData.max_attempts || '∞'}
              </div>
              <div className="text-sm text-gray-600">Max Attempts</div>
            </div>
            
            <div className="bg-white p-4 rounded-lg">
              <div className="text-2xl font-bold text-primary capitalize">
                {formData.difficulty}
              </div>
              <div className="text-sm text-gray-600">Difficulty</div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-white rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Quiz Configuration</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Time limit applies to the {formData.time_limit_type === 'quiz' ? 'entire quiz' : formData.time_limit_type === 'question' ? 'each question' : 'no time limit'}</li>
              <li>• Students need {formData.passing_score}% to pass</li>
              <li>• {formData.max_attempts === 0 ? 'Unlimited attempts allowed' : `Maximum ${formData.max_attempts} attempt${formData.max_attempts === 1 ? '' : 's'} allowed`}</li>
              <li>• Quiz is currently {formData.is_published ? 'published and visible to students' : 'a draft (not visible to students)'}</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
})

SettingsSection.displayName = 'SettingsSection'
