'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useQuizForm } from '@/contexts/QuizContext'
import { CategorySelector, CategorySelectorRef } from '@/components/admin/CategorySelector'
import { ImageUpload } from '@/components/ui/ImageUpload'

const quizDifficulties = ['beginner', 'intermediate', 'advanced'] as const

interface BasicDetailsSectionProps {
  categorySelectorRef: React.RefObject<CategorySelectorRef>
  onManageCategories: () => void
}

export const BasicDetailsSection = React.memo(({ 
  categorySelectorRef, 
  onManageCategories 
}: BasicDetailsSectionProps) => {
  const { formData, updateFormData, errors } = useQuizForm()

  const getFieldError = (fieldName: string) => {
    return errors.find(error => error.field === fieldName)?.message
  }

  const hasFieldError = (fieldName: string) => {
    return errors.some(error => error.field === fieldName)
  }

  return (
    <div className="space-y-6">
      <Card variant="base" className="p-6">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Basic Information
          </CardTitle>
        </CardHeader>
        
        <CardContent className="px-0 pb-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quiz Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quiz Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => updateFormData('title', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  hasFieldError('title') ? 'border-destructive bg-destructive/5' : 'border-gray-300'
                }`}
                placeholder="Enter quiz title"
                maxLength={100}
              />
              {hasFieldError('title') && (
                <p className="mt-1 text-sm text-destructive">
                  {getFieldError('title')}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.title.length}/100 characters
              </p>
            </div>
            
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <CategorySelector
                ref={categorySelectorRef}
                value={formData.category}
                onChange={(category) => updateFormData('category', category)}
                type="quiz"
                onManageCategories={onManageCategories}
                placeholder="Select a category"
                className={hasFieldError('category') ? 'border-destructive' : ''}
              />
              {hasFieldError('category') && (
                <p className="mt-1 text-sm text-destructive">
                  {getFieldError('category')}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => updateFormData('description', e.target.value)}
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                hasFieldError('description') ? 'border-destructive bg-destructive/5' : 'border-gray-300'
              }`}
              placeholder="Describe what this quiz covers..."
              maxLength={500}
            />
            {hasFieldError('description') && (
              <p className="mt-1 text-sm text-destructive">
                {getFieldError('description')}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {formData.description.length}/500 characters
            </p>
          </div>

          {/* Difficulty, Duration, and Image */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => updateFormData('difficulty', e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {quizDifficulties.map((difficulty) => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (minutes)
              </label>
              <input
                type="number"
                min="1"
                max="480"
                value={formData.duration_minutes}
                onChange={(e) => updateFormData('duration_minutes', parseInt(e.target.value) || 30)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  hasFieldError('duration_minutes') ? 'border-destructive' : 'border-gray-300'
                }`}
              />
              {hasFieldError('duration_minutes') && (
                <p className="mt-1 text-sm text-destructive">
                  {getFieldError('duration_minutes')}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quiz Image
              </label>
              <ImageUpload
                value={formData.image_url}
                onChange={(url: string | null) => updateFormData('image_url', url)}
                className="w-full"
              />
            </div>
          </div>

          {/* Publishing */}
          <div className="flex items-center mt-6">
            <input
              type="checkbox"
              id="is_published"
              checked={formData.is_published}
              onChange={(e) => updateFormData('is_published', e.target.checked)}
              className="h-4 w-4 text-primary focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="is_published" className="ml-2 block text-sm text-gray-900">
              Publish quiz (make visible to students)
            </label>
          </div>
        </CardContent>
      </Card>
    </div>
  )
})

BasicDetailsSection.displayName = 'BasicDetailsSection'
