import React, { memo } from 'react'
import { IconTarget, IconAlertTriangle } from '@tabler/icons-react'
import type { Quiz } from '@/lib/supabase'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useCategories } from '@/hooks/useCategories'

interface QuizSettingsStepProps {
  quiz: Partial<Quiz>
  onQuizUpdate: (updates: Partial<Quiz>) => void
  isValid?: boolean
  errors?: string[]
}

// Zod validation schema
const formSchema = z.object({
  title: z.string()
    .min(1, 'Quiz title is required')
    .min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  duration_minutes: z.number()
    .min(1, 'Duration must be at least 1 minute')
    .max(300, 'Duration cannot exceed 300 minutes'),
  time_limit_minutes: z.number().nullable().optional(),
  category: z.string().min(1, 'Please select a category'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  image_url: z.string().url().optional().or(z.literal('').transform(() => undefined))
}).refine((data) => {
  if (data.time_limit_minutes && data.duration_minutes && data.time_limit_minutes < data.duration_minutes) {
    return false
  }
  if (data.time_limit_minutes && (data.time_limit_minutes < 1 || data.time_limit_minutes > 600)) {
    return false
  }
  return true
}, {
  message: 'Time limit should not be shorter than expected duration and must be between 1 and 600 minutes',
  path: ['time_limit_minutes']
})

type FormValues = z.infer<typeof formSchema>

export const QuizSettingsStep = memo<QuizSettingsStepProps>(({
  quiz,
  onQuizUpdate,
  isValid = true,
  errors = []
}) => {
  // Fetch categories from database
  const { categories, isLoading: categoriesLoading, error: categoriesError } = useCategories()
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: quiz.title || '',
      description: quiz.description || '',
      duration_minutes: quiz.duration_minutes || 10,
      time_limit_minutes: quiz.time_limit_minutes || null,
      category: quiz.category || '',
      difficulty: (quiz.difficulty as 'beginner' | 'intermediate' | 'advanced') || 'intermediate'
    }
  })

  // Watch form values for real-time updates
  const watchedValues = form.watch()
  
  // Update parent when form values change, but avoid infinite loops
  const prevValuesRef = React.useRef<FormValues>()
  React.useEffect(() => {
    const currentValues = {
      title: watchedValues.title,
      description: watchedValues.description,
      duration_minutes: watchedValues.duration_minutes,
      time_limit_minutes: watchedValues.time_limit_minutes,
      category: watchedValues.category,
      difficulty: watchedValues.difficulty
    }
    
    // Only update if values actually changed
    if (!prevValuesRef.current || JSON.stringify(prevValuesRef.current) !== JSON.stringify(currentValues)) {
      prevValuesRef.current = currentValues
      onQuizUpdate(currentValues)
    }
  }, [watchedValues.title, watchedValues.description, watchedValues.duration_minutes, 
      watchedValues.time_limit_minutes, watchedValues.category, watchedValues.difficulty, onQuizUpdate])

  const showTimeLimitWarning = watchedValues.time_limit_minutes && 
    watchedValues.duration_minutes && 
    watchedValues.time_limit_minutes < watchedValues.duration_minutes

  return (
    <Card className="p-4 border rounded-lg">
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <IconTarget size={18} className="text-blue-600" />
          <h3 className="text-base font-semibold">Quiz Settings</h3>
        </div>

        {/* Error Display */}
        {errors.length > 0 && (
          <Alert className="border-red-200 bg-red-50 py-2">
            <AlertDescription>
              <div className="flex flex-col gap-1">
                {errors.map((error, index) => (
                  <span key={index} className="text-xs text-red-800">{error}</span>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Form */}
        <div className="flex flex-col gap-4">
          {/* Compact 3-column grid for primary fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Enter quiz title"
                {...form.register('title')}
                className={form.formState.errors.title ? 'border-red-500' : ''}
              />
              {form.formState.errors.title && (
                <p className="text-red-500 text-xs mt-1">{form.formState.errors.title.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                {...form.register('category')}
                className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  form.formState.errors.category ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">
                  {categoriesLoading ? 'Loading categories...' : 'Select category'}
                </option>
                {categories.map((category) => (
                  <option key={category.id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
              {form.formState.errors.category && (
                <p className="text-red-500 text-xs mt-1">{form.formState.errors.category.message}</p>
              )}
              {categoriesError && (
                <p className="text-amber-600 text-xs mt-1">
                  ⚠ Using fallback categories - {categoriesError}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty <span className="text-red-500">*</span>
              </label>
              <select
                {...form.register('difficulty')}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          {/* Description - Optimized textarea sizing */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <Textarea
              placeholder="Enter quiz description"
              rows={2}
              className="resize-none"
              {...form.register('description')}
            />
          </div>

          {/* Smart field grouping - related timing/scoring controls together */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time Limit <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="30"
                  min="1"
                  max="300"
                  {...form.register('duration_minutes', { valueAsNumber: true })}
                  className={form.formState.errors.duration_minutes ? 'border-red-500' : ''}
                />
                <span className="absolute right-3 top-2 text-sm text-gray-500">minutes</span>
              </div>
              {form.formState.errors.duration_minutes && (
                <p className="text-red-500 text-xs mt-1">{form.formState.errors.duration_minutes.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Attempts
              </label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="3"
                  min="1"
                  max="10"
                  className="pr-12"
                  // Note: This would need to be added to the schema and form if needed
                />
                <span className="absolute right-3 top-2 text-sm text-gray-500">tries</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Passing Score
              </label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="70"
                  min="1"
                  max="100"
                  className="pr-6"
                  // Note: This would need to be added to the schema and form if needed
                />
                <span className="absolute right-3 top-2 text-sm text-gray-500">%</span>
              </div>
            </div>
          </div>

          {/* Optional Reading Passage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reading Passage (Optional)
            </label>
            <Textarea
              placeholder="Enter reading passage if this quiz requires one"
              rows={3}
              className="resize-none"
              // Note: This would need to be added to the schema and form if needed
            />
          </div>

          {/* Consolidated validation - single status bar at bottom */}
          <div className="bg-gray-50 border rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isValid ? (
                  <>
                    <span className="text-green-600">✓</span>
                    <span className="text-sm font-medium text-green-700">Settings Complete</span>
                  </>
                ) : (
                  <>
                    <span className="text-amber-600">⚠</span>
                    <span className="text-sm font-medium text-amber-700">
                      {errors.length} field{errors.length !== 1 ? 's' : ''} need attention
                    </span>
                  </>
                )}
              </div>
              {showTimeLimitWarning && (
                <div className="flex items-center gap-1 text-xs text-orange-600">
                  <IconAlertTriangle className="w-3 h-3" />
                  <span>Time limit warning</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
})

QuizSettingsStep.displayName = 'QuizSettingsStep'
