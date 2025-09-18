// Quiz Settings Step Component
// Handles quiz basic configuration and metadata

import React, { memo, useCallback, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings, FileText, Clock, Target, Globe, Camera } from 'lucide-react'
import { useQuizBuilderPerformance } from '@/lib/adminPerformanceSystem'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { uploadImage } from '@/lib/imageUpload'
import type { Quiz } from '@/lib/supabase'

interface QuizSettingsStepProps {
  quiz: Partial<Quiz>
  onQuizUpdate: (updates: Partial<Quiz>) => void
  isValid?: boolean
  errors?: string[]
}

export const QuizSettingsStep = memo<QuizSettingsStepProps>(({
  quiz,
  onQuizUpdate,
  isValid = true,
  errors = []
}) => {
  const [categories] = useState<string[]>([
    'English Grammar',
    'English Language', 
    'General English',
    'IELTS Preparation',
    'TOEFL Preparation',
    'Business English',
    'Academic Writing',
    'Conversation Practice',
    'Vocabulary Building',
    'Reading Comprehension',
    'Listening Skills'
  ])
  const [loadingCategories] = useState(false)

  // Performance monitoring
  const performanceMetrics = useQuizBuilderPerformance()

  const handleFieldChange = useCallback((field: keyof Quiz, value: any) => {
    onQuizUpdate({ [field]: value })
  }, [onQuizUpdate])

  // Memoize category change specifically to prevent CategorySelector re-renders
  const handleCategoryChange = useCallback((value: string) => {
    onQuizUpdate({ category: value })
  }, [onQuizUpdate])

  const handleImageUpload = useCallback(async (file: File): Promise<string> => {
    const result = await uploadImage(file, 'quiz-images', 'quizzes')
    if (result.success && result.url) {
      return result.url
    }
    throw new Error(result.error || 'Failed to upload image')
  }, [])

  const difficulties = [
    { value: 'beginner', label: 'Beginner', color: 'bg-green-100 text-green-800' },
    { value: 'intermediate', label: 'Intermediate', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'advanced', label: 'Advanced', color: 'bg-red-100 text-red-800' }
  ]

  return (
    <div className="space-y-8">
      {/* Clean Header - No card wrapper */}
      <div className="border-b border-gray-100 pb-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Settings className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-1">Quiz Settings</h3>
            <p className="text-gray-600">Configure basic quiz information and settings</p>
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-gray-700 mt-2 bg-gray-100 px-3 py-1 rounded border">
                QuizSettingsStep - {performanceMetrics.metrics?.renderCount || 0} renders | Avg: {performanceMetrics.metrics?.averageRenderTime.toFixed(2) || 0}ms
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <FileText className="h-5 w-5 mr-2 text-primary" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quiz Title *
            </label>
            <input
              type="text"
              value={quiz.title || ''}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              placeholder="Enter quiz title..."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 bg-white placeholder:text-gray-600"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Description
            </label>
            <textarea
              value={quiz.description || ''}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              placeholder="Describe what this quiz covers..."
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary resize-none text-gray-900 bg-white placeholder:text-gray-600"
            />
          </div>

          {/* Quiz Image */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Quiz Cover Image
            </label>
            <ImageUpload
              value={quiz.image_url || null}
              onChange={(url) => handleFieldChange('image_url', url)}
              onFileUpload={handleImageUpload}
              placeholder="Upload quiz cover image or enter image URL"
              className="w-full"
              context="quiz"
            />
            <p className="text-xs text-gray-700 mt-1 font-medium">
              Optional cover image for your quiz. Recommended size: 800x400px
            </p>
          </div>

          {/* Category and Difficulty */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Category
              </label>
              <select
                value={quiz.category || ''}
                onChange={(e) => handleFieldChange('category', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 bg-white"
                disabled={loadingCategories}
              >
                <option value="" className="text-gray-700">{loadingCategories ? 'Loading categories...' : 'Select category...'}</option>
                {categories.map(category => (
                  <option key={category} value={category} className="text-gray-900">{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Difficulty Level
              </label>
              <div className="flex space-x-2">
                {difficulties.map(diff => (
                  <button
                    key={diff.value}
                    onClick={() => handleFieldChange('difficulty', diff.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      quiz.difficulty === diff.value
                        ? diff.color + ' ring-2 ring-offset-1 ring-current shadow-sm'
                        : 'bg-gray-50 text-gray-800 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {diff.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quiz Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Clock className="h-5 w-5 mr-2 text-primary" />
            Quiz Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Expected Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                📝 Expected Duration (minutes) *
              </label>
              <input
                type="number"
                value={quiz.duration_minutes || 10}
                onChange={(e) => handleFieldChange('duration_minutes', parseInt(e.target.value) || 10)}
                placeholder="10"
                min="1"
                max="300"
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 bg-white placeholder:text-gray-600"
              />
              <p className="text-xs text-gray-700 mt-1 font-medium">
                💡 <strong>Estimated time</strong> students need to complete this quiz
              </p>
            </div>

            {/* Time Limit */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                ⏰ Time Limit (minutes) - Optional
              </label>
              <input
                type="number"
                value={quiz.time_limit_minutes || ''}
                onChange={(e) => handleFieldChange('time_limit_minutes', parseInt(e.target.value) || null)}
                placeholder="Leave empty for no limit"
                min="1"
                max="180"
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 bg-white placeholder:text-gray-600"
              />
              <p className="text-xs text-gray-700 mt-1 font-medium">
                🚨 <strong>Hard deadline</strong> - Quiz auto-submits when time expires
              </p>
              {quiz.time_limit_minutes && quiz.duration_minutes && quiz.time_limit_minutes < quiz.duration_minutes && (
                <p className="text-xs text-red-600 mt-1 font-medium">
                  ⚠️ Warning: Time limit is shorter than expected duration!
                </p>
              )}
            </div>

            {/* Passing Score */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Passing Score (%)
              </label>
              <input
                type="number"
                value={quiz.passing_score || 70}
                onChange={(e) => handleFieldChange('passing_score', parseInt(e.target.value))}
                placeholder="70"
                min="0"
                max="100"
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 bg-white placeholder:text-gray-600"
              />
            </div>

            {/* Max Attempts */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Max Attempts
              </label>
              <input
                type="number"
                value={quiz.max_attempts || 0}
                onChange={(e) => handleFieldChange('max_attempts', parseInt(e.target.value))}
                placeholder="0 (unlimited)"
                min="0"
                max="10"
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 bg-white placeholder:text-gray-600"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Publishing Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Globe className="h-5 w-5 mr-2 text-primary" />
            Publishing Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="is_published"
              checked={quiz.is_published || false}
              onChange={(e) => handleFieldChange('is_published', e.target.checked)}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="is_published" className="text-sm font-medium text-gray-900">
              Publish quiz immediately after creation
            </label>
          </div>
          <p className="text-xs text-gray-700 mt-2 font-medium">
            Published quizzes will be visible to students immediately. You can change this later.
          </p>
        </CardContent>
      </Card>

      {/* Validation Errors */}
      {!isValid && errors.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center text-red-800 mb-2">
              <Target className="h-5 w-5 mr-2" />
              Please fix the following issues:
            </div>
            <ul className="list-disc list-inside text-red-700 text-sm space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}, (prevProps, nextProps) => {
  // Optimized comparison for better performance
  if (prevProps.quiz !== nextProps.quiz || prevProps.isValid !== nextProps.isValid) {
    return false
  }
  
  // Handle undefined errors arrays safely
  const prevErrors = prevProps.errors || []
  const nextErrors = nextProps.errors || []
  
  // Simple array comparison for errors
  if (prevErrors.length !== nextErrors.length) {
    return false
  }
  
  // Only compare error messages if arrays have same length
  for (let i = 0; i < prevErrors.length; i++) {
    if (prevErrors[i] !== nextErrors[i]) {
      return false
    }
  }
  
  return true
})

QuizSettingsStep.displayName = 'QuizSettingsStep'

export default QuizSettingsStep
