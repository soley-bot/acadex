import React, { memo } from 'react'
import {
  Card,
  TextInput,
  Textarea,
  NumberInput,
  Select,
  Stack,
  Group,
  Title,
  Text,
  Alert
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { IconTarget, IconAlertTriangle } from '@tabler/icons-react'
import type { Quiz } from '@/lib/supabase'

interface QuizSettingsStepProps {
  quiz: Partial<Quiz>
  onQuizUpdate: (updates: Partial<Quiz>) => void
  isValid?: boolean
  errors?: string[]
}

interface FormValues {
  title: string
  description: string
  duration_minutes: number
  time_limit_minutes: number | null
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

export const QuizSettingsStep = memo<QuizSettingsStepProps>(({
  quiz,
  onQuizUpdate,
  isValid = true,
  errors = []
}) => {
  const form = useForm<FormValues>({
    initialValues: {
      title: quiz.title || '',
      description: quiz.description || '',
      duration_minutes: quiz.duration_minutes || 10,
      time_limit_minutes: quiz.time_limit_minutes || null,
      category: quiz.category || '',
      difficulty: (quiz.difficulty as 'beginner' | 'intermediate' | 'advanced') || 'intermediate'
    },
    validate: {
      title: (value) => {
        if (!value.trim()) return 'Quiz title is required'
        if (value.trim().length < 3) return 'Title must be at least 3 characters'
        return null
      },
      duration_minutes: (value) => {
        if (!value || value < 1) return 'Duration must be at least 1 minute'
        if (value > 300) return 'Duration cannot exceed 300 minutes'
        return null
      },
      time_limit_minutes: (value, values) => {
        if (value && values.duration_minutes && value < values.duration_minutes) {
          return 'Time limit should not be shorter than expected duration'
        }
        if (value && (value < 1 || value > 600)) {
          return 'Time limit must be between 1 and 600 minutes'
        }
        return null
      },
      category: (value) => !value.trim() ? 'Please select a category' : null
    },
    onValuesChange: (values) => {
      // Update parent state whenever form values change
      onQuizUpdate({
        title: values.title,
        description: values.description,
        duration_minutes: values.duration_minutes,
        time_limit_minutes: values.time_limit_minutes,
        category: values.category,
        difficulty: values.difficulty
      })
    }
  })

  const showTimeLimitWarning = form.values.time_limit_minutes && 
    form.values.duration_minutes && 
    form.values.time_limit_minutes < form.values.duration_minutes

  return (
    <Card shadow="sm" padding="xl" radius="md" withBorder>
      <Stack gap="lg">
        {/* Header */}
        <Group gap="xs">
          <IconTarget size={20} color="var(--mantine-color-blue-6)" />
          <Title order={3}>Quiz Settings</Title>
        </Group>

        {/* Error Display */}
        {errors.length > 0 && (
          <Alert color="red" variant="light">
            <Stack gap="xs">
              {errors.map((error, index) => (
                <Text key={index} size="sm">{error}</Text>
              ))}
            </Stack>
          </Alert>
        )}

        {/* Form */}
        <Stack gap="md">
          {/* Basic Info Row */}
          <Group grow>
            <TextInput
              label="Quiz Title"
              placeholder="Enter quiz title"
              required
              {...form.getInputProps('title')}
            />
            <Select
              label="Category"
              placeholder="Select category"
              required
              data={[
                { value: 'ielts', label: 'IELTS' },
                { value: 'toefl', label: 'TOEFL' },
                { value: 'english', label: 'English' },
                { value: 'grammar', label: 'Grammar' },
                { value: 'vocabulary', label: 'Vocabulary' },
                { value: 'reading', label: 'Reading' },
                { value: 'listening', label: 'Listening' },
                { value: 'speaking', label: 'Speaking' },
                { value: 'writing', label: 'Writing' }
              ]}
              {...form.getInputProps('category')}
            />
          </Group>

          {/* Description */}
          <Textarea
            label="Description"
            placeholder="Enter quiz description"
            rows={3}
            {...form.getInputProps('description')}
          />

          {/* Timing & Difficulty Row */}
          <Group grow>
            <NumberInput
              label="📝 Expected Duration (minutes)"
              placeholder="10"
              min={1}
              max={300}
              required
              description="Estimated time students need (shown before they start)"
              {...form.getInputProps('duration_minutes')}
            />
            <Select
              label="Difficulty Level"
              required
              data={[
                { value: 'beginner', label: 'Beginner' },
                { value: 'intermediate', label: 'Intermediate' },
                { value: 'advanced', label: 'Advanced' }
              ]}
              {...form.getInputProps('difficulty')}
            />
          </Group>

          {/* Time Limit */}
          <NumberInput
            label="⏰ Time Limit (minutes) - Optional"
            placeholder="Leave empty for no time limit"
            min={1}
            max={600}
            description="Hard deadline - Quiz auto-submits when time expires"
            {...form.getInputProps('time_limit_minutes')}
          />

          {/* Warning Alert */}
          {showTimeLimitWarning && (
            <Alert
              icon={<IconAlertTriangle size={16} />}
              color="orange"
              variant="light"
            >
              <Text size="sm">
                ⚠️ Warning: Time limit is shorter than expected duration!
              </Text>
            </Alert>
          )}
        </Stack>
      </Stack>
    </Card>
  )
})

QuizSettingsStep.displayName = 'QuizSettingsStep'