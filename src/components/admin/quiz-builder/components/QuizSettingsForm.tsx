import React, { memo, useCallback } from 'react'
import {
  Card,
  Stack,
  Group,
  Title,
  TextInput,
  Textarea,
  NumberInput,
  Text,
  Badge
} from '@mantine/core'
import { 
  IconTarget,
  IconClock,
  IconUser
} from '@tabler/icons-react'
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
  const handleTitleChange = useCallback((value: string) => {
    onUpdate({ title: value })
  }, [onUpdate])

  const handleDescriptionChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({ description: event.target.value })
  }, [onUpdate])

  const handleTimeLimitChange = useCallback((value: number | string) => {
    const numValue = typeof value === 'string' ? parseInt(value) || null : value || null
    onUpdate({ time_limit_minutes: numValue })
  }, [onUpdate])

  const handleDurationChange = useCallback((value: number | string) => {
    const numValue = typeof value === 'string' ? parseInt(value) || 10 : value || 10
    onUpdate({ duration_minutes: numValue })
  }, [onUpdate])

  return (
    <Card shadow="sm" padding="xl" radius="md" withBorder>
      <Stack gap="lg">
        {/* Header */}
        <Group gap="xs">
          <IconTarget size={20} color="var(--mantine-color-blue-6)" />
          <Title order={3}>Quiz Settings</Title>
        </Group>

        {/* Quiz Title */}
        <div>
          <Group gap="xs" mb="xs">
            <Text size="sm" fw={500}>Quiz Title</Text>
            <Badge size="xs" color="red">Required</Badge>
          </Group>
          <TextInput
            value={quiz.title || ''}
            onChange={(event) => handleTitleChange(event.currentTarget.value)}
            placeholder="Enter quiz title"
            error={errors.title}
            size="md"
            styles={{
              input: {
                fontSize: '16px',
                padding: '12px 16px'
              }
            }}
          />
        </div>

        {/* Description */}
        <div>
          <Text size="sm" fw={500} mb="xs">Description</Text>
          <Textarea
            value={quiz.description || ''}
            onChange={handleDescriptionChange}
            placeholder="Enter quiz description"
            rows={3}
            error={errors.description}
            size="md"
            styles={{
              input: {
                fontSize: '14px',
                padding: '12px 16px'
              }
            }}
          />
        </div>

        {/* Duration and Time Settings */}
        <Group grow>
          <div>
            <Group gap="xs" mb="xs">
              <IconClock size={16} />
              <Text size="sm" fw={500}>Expected Duration (minutes)</Text>
              <Badge size="xs" color="red">Required</Badge>
            </Group>
            <NumberInput
              value={quiz.duration_minutes || 10}
              onChange={handleDurationChange}
              placeholder="Duration in minutes"
              min={1}
              max={300}
              error={errors.duration_minutes}
              size="md"
              description="How long should students expect to spend?"
            />
          </div>

          <div>
            <Group gap="xs" mb="xs">
              <IconUser size={16} />
              <Text size="sm" fw={500}>Time Limit (minutes)</Text>
              <Badge size="xs" variant="outline">Optional</Badge>
            </Group>
            <NumberInput
              value={quiz.time_limit_minutes || ''}
              onChange={handleTimeLimitChange}
              placeholder="No time limit"
              min={1}
              max={300}
              error={errors.time_limit_minutes}
              size="md"
              description="Set a hard time limit (leave empty for no limit)"
            />
          </div>
        </Group>

        {/* Settings Summary */}
        <Card withBorder padding="md" bg="gray.0">
          <Group justify="space-between" align="center">
            <div>
              <Text size="xs" c="dimmed" tt="uppercase" fw={600}>Quiz Configuration</Text>
              <Text size="sm">
                {quiz.title ? `"${quiz.title}"` : 'Untitled Quiz'}
              </Text>
            </div>
            <Group gap="lg">
              <div style={{ textAlign: 'center' }}>
                <Text size="lg" fw={700} c="blue">
                  {quiz.duration_minutes || 10}
                </Text>
                <Text size="xs" c="dimmed">Duration (min)</Text>
              </div>
              <div style={{ textAlign: 'center' }}>
                <Text size="lg" fw={700} c={quiz.time_limit_minutes ? 'orange' : 'gray'}>
                  {quiz.time_limit_minutes || '∞'}
                </Text>
                <Text size="xs" c="dimmed">Time Limit</Text>
              </div>
            </Group>
          </Group>
        </Card>
      </Stack>
    </Card>
  )
})

QuizSettingsForm.displayName = 'QuizSettingsForm'