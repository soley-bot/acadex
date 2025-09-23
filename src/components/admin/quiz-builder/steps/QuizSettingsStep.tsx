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
  difficulty: z.enum(['beginner', 'intermediate', 'advanced'])
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
  
  // Update parent when form values change
  React.useEffect(() => {
    onQuizUpdate({
      title: watchedValues.title,
      description: watchedValues.description,
      duration_minutes: watchedValues.duration_minutes,
      time_limit_minutes: watchedValues.time_limit_minutes,
      category: watchedValues.category,
      difficulty: watchedValues.difficulty
    })
  }, [watchedValues, onQuizUpdate])

  const showTimeLimitWarning = watchedValues.time_limit_minutes && 
    watchedValues.duration_minutes && 
    watchedValues.time_limit_minutes < watchedValues.duration_minutes

  return (
    <Card className="p-6 border rounded-lg">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center gap-2">
          <IconTarget size={20} className="text-blue-600" />
          <h3 className="text-lg font-semibold">Quiz Settings</h3>
        </div>

        {/* Error Display */}
        {errors.length > 0 && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription>
              <div className="flex flex-col gap-1">
                {errors.map((error, index) => (
                  <span key={index} className="text-sm text-red-800">{error}</span>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Form */}
        <div className="flex flex-col gap-4">
          {/* Basic Info Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quiz Title <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Enter quiz title"
                {...form.register('title')}
                className={form.formState.errors.title ? 'border-red-500' : ''}
              />
              {form.formState.errors.title && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.title.message}</p>
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
                <option value="">Select category</option>
                <option value="ielts">IELTS</option>
                <option value="toefl">TOEFL</option>
                <option value="english">English</option>
                <option value="business">Business English</option>
                <option value="grammar">Grammar</option>
                <option value="vocabulary">Vocabulary</option>
                <option value="listening">Listening</option>
                <option value="reading">Reading</option>
                <option value="writing">Writing</option>
                <option value="speaking">Speaking</option>
                <option value="general">General English</option>
                <option value="test-prep">Test Preparation</option>
              </select>
              {form.formState.errors.category && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.category.message}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <Textarea
              placeholder="Enter quiz description"
              rows={3}
              {...form.register('description')}
            />
          </div>

          {/* Timing & Difficulty Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                📝 Expected Duration (minutes) <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                placeholder="10"
                min="1"
                max="300"
                {...form.register('duration_minutes', { valueAsNumber: true })}
                className={form.formState.errors.duration_minutes ? 'border-red-500' : ''}
              />
              <p className="text-xs text-gray-500 mt-1">Estimated time students need (shown before they start)</p>
              {form.formState.errors.duration_minutes && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.duration_minutes.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty Level <span className="text-red-500">*</span>
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

          {/* Time Limit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ⏰ Time Limit (minutes) - Optional
            </label>
            <Input
              type="number"
              placeholder="Leave empty for no time limit"
              min="1"
              max="600"
              {...form.register('time_limit_minutes', { 
                valueAsNumber: true,
                setValueAs: (value) => value === '' ? null : Number(value)
              })}
            />
            <p className="text-xs text-gray-500 mt-1">Hard deadline - Quiz auto-submits when time expires</p>
            {form.formState.errors.time_limit_minutes && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.time_limit_minutes.message}</p>
            )}
          </div>

          {/* Warning Alert */}
          {showTimeLimitWarning && (
            <Alert className="border-orange-200 bg-orange-50">
              <IconAlertTriangle className="w-4 h-4" />
              <AlertDescription className="text-orange-800">
                ⚠️ Warning: Time limit is shorter than expected duration!
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </Card>
  )
})

QuizSettingsStep.displayName = 'QuizSettingsStep'