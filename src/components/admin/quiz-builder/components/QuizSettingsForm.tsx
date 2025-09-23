import React, { memo, useCallback } from 'react'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { 
  Target,
  Clock,
  User,
  Infinity
} from 'lucide-react'
import type { Quiz } from '@/lib/supabase'

interface QuizSettingsFormProps {
  quiz: Partial<Quiz>
  onUpdate: (updates: Partial<Quiz>) => void
  errors?: {
    title?: string
    description?: string
    duration_minutes?: string
    time_limit_minutes?: string
  }
}

export const QuizSettingsForm = memo<QuizSettingsFormProps>(({
  quiz,
  onUpdate,
  errors = {}
}) => {
  const handleTitleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ title: event.target.value })
  }, [onUpdate])

  const handleDescriptionChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({ description: event.target.value })
  }, [onUpdate])

  const handleTimeLimitChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    const numValue = value === '' ? null : parseInt(value) || null
    onUpdate({ time_limit_minutes: numValue })
  }, [onUpdate])

  const handleDurationChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    const numValue = value === '' ? 10 : parseInt(value) || 10
    onUpdate({ duration_minutes: numValue })
  }, [onUpdate])

  return (
    <Card className="shadow-sm border">
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Quiz Settings</h3>
          </div>

          {/* Quiz Title */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="quiz-title" className="text-sm font-medium">
                Quiz Title
              </Label>
              <Badge variant="destructive" className="text-xs">
                Required
              </Badge>
            </div>
            <Input
              id="quiz-title"
              value={quiz.title || ''}
              onChange={handleTitleChange}
              placeholder="Enter quiz title"
              className={`text-base p-3 ${errors.title ? 'border-red-500' : ''}`}
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="quiz-description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="quiz-description"
              value={quiz.description || ''}
              onChange={handleDescriptionChange}
              placeholder="Enter quiz description"
              rows={3}
              className={`text-sm p-3 resize-none ${errors.description ? 'border-red-500' : ''}`}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Duration and Time Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <Label htmlFor="duration" className="text-sm font-medium">
                  Expected Duration (minutes)
                </Label>
                <Badge variant="destructive" className="text-xs">
                  Required
                </Badge>
              </div>
              <Input
                id="duration"
                type="number"
                value={quiz.duration_minutes || 10}
                onChange={handleDurationChange}
                placeholder="Duration in minutes"
                min={1}
                max={300}
                className={errors.duration_minutes ? 'border-red-500' : ''}
              />
              <p className="text-xs text-gray-600">
                How long should students expect to spend?
              </p>
              {errors.duration_minutes && (
                <p className="text-sm text-red-600">{errors.duration_minutes}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <Label htmlFor="time-limit" className="text-sm font-medium">
                  Time Limit (minutes)
                </Label>
                <Badge variant="outline" className="text-xs">
                  Optional
                </Badge>
              </div>
              <Input
                id="time-limit"
                type="number"
                value={quiz.time_limit_minutes || ''}
                onChange={handleTimeLimitChange}
                placeholder="No time limit"
                min={1}
                max={300}
                className={errors.time_limit_minutes ? 'border-red-500' : ''}
              />
              <p className="text-xs text-gray-600">
                Set a hard time limit (leave empty for no limit)
              </p>
              {errors.time_limit_minutes && (
                <p className="text-sm text-red-600">{errors.time_limit_minutes}</p>
              )}
            </div>
          </div>

          {/* Settings Summary */}
          <Card className="bg-gray-50 border">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-1">
                    Quiz Configuration
                  </p>
                  <p className="text-sm font-medium">
                    {quiz.title ? `"${quiz.title}"` : 'Untitled Quiz'}
                  </p>
                </div>
                <div className="flex gap-8">
                  <div className="text-center">
                    <p className="text-lg font-bold text-blue-600">
                      {quiz.duration_minutes || 10}
                    </p>
                    <p className="text-xs text-gray-500">Duration (min)</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-lg font-bold ${
                      quiz.time_limit_minutes ? 'text-orange-600' : 'text-gray-400'
                    }`}>
                      {quiz.time_limit_minutes || <Infinity className="h-5 w-5 mx-auto" />}
                    </p>
                    <p className="text-xs text-gray-500">Time Limit</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
})

QuizSettingsForm.displayName = 'QuizSettingsForm'