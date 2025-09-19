import React, { memo, useMemo } from 'react'
import {
  Card,
  Stack,
  Group,
  Title,
  Text,
  Button,
  Grid,
  Badge,
  Progress,
  Alert,
  Divider
} from '@mantine/core'
import { 
  IconCircleCheck,
  IconAlertTriangle,
  IconDeviceFloppy,
  IconWorldUpload,
  IconClock,
  IconTargetArrow,
  IconQuestionMark,
  IconCheck
} from '@tabler/icons-react'
import type { Quiz, QuizQuestion } from '@/lib/supabase'
import { calculateQuizStats } from '../utils/QuizBuilderUtils'

interface QuizSummaryCardProps {
  quiz: Partial<Quiz>
  questions: QuizQuestion[]
  onSave: () => void
  onPublish: () => void
  isSaving: boolean
  isPublishing: boolean
  canPublish?: boolean
}

export const QuizSummaryCard = memo<QuizSummaryCardProps>(({
  quiz,
  questions,
  onSave,
  onPublish,
  isSaving,
  isPublishing,
  canPublish = false
}) => {
  const summaryStats = useMemo(() => {
    const baseStats = calculateQuizStats(quiz, questions)
    
    // Add the helper properties that the component needs
    return {
      ...baseStats,
      hasTitle: Boolean(quiz.title?.trim()),
      hasQuestions: questions.length > 0,
      allQuestionsValid: baseStats.validQuestions === baseStats.totalQuestions
    }
  }, [questions, quiz])

  const getStatusColor = (isComplete: boolean) => isComplete ? 'green' : 'orange'
  const getStatusIcon = (isComplete: boolean) => isComplete ? <IconCheck size={14} /> : <IconAlertTriangle size={14} />

  return (
    <Card shadow="sm" padding="xl" radius="md" withBorder>
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between" align="flex-start">
          <Group gap="xs">
            <IconCircleCheck size={20} color="var(--mantine-color-green-6)" />
            <Title order={3}>Quiz Summary</Title>
          </Group>
          <Badge 
            color={summaryStats.isValid ? 'green' : 'orange'} 
            variant={summaryStats.isValid ? 'filled' : 'light'}
            leftSection={summaryStats.isValid ? <IconCheck size={12} /> : <IconAlertTriangle size={12} />}
          >
            {summaryStats.isValid ? 'Ready to Publish' : 'Needs Attention'}
          </Badge>
        </Group>

        {/* Statistics Grid */}
        <Grid>
          <Grid.Col span={6}>
            <Card withBorder padding="md" style={{ textAlign: 'center', backgroundColor: 'var(--mantine-color-blue-0)' }}>
              <Text size="xl" fw={700} c="blue">
                {summaryStats.totalQuestions}
              </Text>
              <Text size="sm" c="dimmed">Total Questions</Text>
            </Card>
          </Grid.Col>

          <Grid.Col span={6}>
            <Card withBorder padding="md" style={{ textAlign: 'center', backgroundColor: 'var(--mantine-color-green-0)' }}>
              <Text size="xl" fw={700} c="green">
                {summaryStats.validQuestions}
              </Text>
              <Text size="sm" c="dimmed">Valid Questions</Text>
            </Card>
          </Grid.Col>

          <Grid.Col span={6}>
            <Card withBorder padding="md" style={{ textAlign: 'center', backgroundColor: 'var(--mantine-color-yellow-0)' }}>
              <Text size="xl" fw={700} c="orange">
                {summaryStats.totalPoints}
              </Text>
              <Text size="sm" c="dimmed">Total Points</Text>
            </Card>
          </Grid.Col>

          <Grid.Col span={6}>
            <Card withBorder padding="md" style={{ textAlign: 'center', backgroundColor: 'var(--mantine-color-purple-0)' }}>
              <Text size="xl" fw={700} c="violet">
                {summaryStats.estimatedTime}m
              </Text>
              <Text size="sm" c="dimmed">Est. Time</Text>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Completion Progress */}
        <div>
          <Group justify="space-between" mb="xs">
            <Text size="sm" fw={500}>Quiz Completion</Text>
            <Text size="sm" c="dimmed">
              {Math.round(summaryStats.completionRate)}%
            </Text>
          </Group>
          <Progress 
            value={summaryStats.completionRate} 
            color={summaryStats.completionRate === 100 ? 'green' : 'orange'}
            size="lg"
            radius="md"
          />
        </div>

        {/* Status Checklist */}
        <Stack gap="xs">
          <Text size="sm" fw={500} mb="xs">Quiz Status</Text>
          
          <Group justify="space-between">
            <Group gap="xs">
              {getStatusIcon(summaryStats.hasTitle)}
              <Text size="sm">Quiz Title</Text>
            </Group>
            <Badge 
              size="sm" 
              color={getStatusColor(summaryStats.hasTitle)}
              variant="light"
            >
              {summaryStats.hasTitle ? 'Complete' : 'Missing'}
            </Badge>
          </Group>

          <Group justify="space-between">
            <Group gap="xs">
              {getStatusIcon(summaryStats.hasQuestions)}
              <Text size="sm">Has Questions</Text>
            </Group>
            <Badge 
              size="sm" 
              color={getStatusColor(summaryStats.hasQuestions)}
              variant="light"
            >
              {summaryStats.hasQuestions ? `${summaryStats.totalQuestions} Added` : 'None'}
            </Badge>
          </Group>

          <Group justify="space-between">
            <Group gap="xs">
              {getStatusIcon(summaryStats.allQuestionsValid)}
              <Text size="sm">All Questions Valid</Text>
            </Group>
            <Badge 
              size="sm" 
              color={getStatusColor(summaryStats.allQuestionsValid)}
              variant="light"
            >
              {summaryStats.allQuestionsValid ? 'All Valid' : `${summaryStats.validQuestions}/${summaryStats.totalQuestions}`}
            </Badge>
          </Group>
        </Stack>

        {/* Validation Alert */}
        {!summaryStats.isValid && (
          <Alert 
            icon={<IconAlertTriangle size={16} />} 
            color="orange" 
            variant="light"
          >
            <Text size="sm" fw={500} mb="xs">Complete these steps to publish:</Text>
            <Text size="sm" component="ul" style={{ margin: 0, paddingLeft: 20 }}>
              {!summaryStats.hasTitle && <li>Add a quiz title</li>}
              {!summaryStats.hasQuestions && <li>Add at least one question</li>}
              {summaryStats.hasQuestions && !summaryStats.allQuestionsValid && (
                <li>Fix {summaryStats.totalQuestions - summaryStats.validQuestions} invalid question(s)</li>
              )}
            </Text>
          </Alert>
        )}

        <Divider />

        {/* Action Buttons */}
        <Group justify="space-between">
          <Button
            variant="default"
            leftSection={<IconDeviceFloppy size={16} />}
            onClick={onSave}
            loading={isSaving}
            disabled={isPublishing}
          >
            {isSaving ? 'Saving...' : 'Save Draft'}
          </Button>

          <Button
            leftSection={<IconWorldUpload size={16} />}
            onClick={onPublish}
            loading={isPublishing}
            disabled={!summaryStats.isValid || isSaving || !canPublish}
            color={summaryStats.isValid ? 'green' : 'gray'}
          >
            {isPublishing ? 'Publishing...' : 'Publish Quiz'}
          </Button>
        </Group>

        {/* Quiz Info Summary */}
        {summaryStats.isValid && (
          <Card withBorder padding="sm" bg="green.0">
            <Group justify="space-between" align="center">
              <Group gap="sm">
                <IconTargetArrow size={16} color="var(--mantine-color-green-7)" />
                <Text size="sm" fw={500} c="green.7">Ready to Publish!</Text>
              </Group>
              <Group gap="lg">
                <Group gap={4}>
                  <IconQuestionMark size={14} />
                  <Text size="xs" c="dimmed">{summaryStats.totalQuestions} Questions</Text>
                </Group>
                <Group gap={4}>
                  <IconClock size={14} />
                  <Text size="xs" c="dimmed">{quiz.duration_minutes || 10} min</Text>
                </Group>
              </Group>
            </Group>
          </Card>
        )}
      </Stack>
    </Card>
  )
})

QuizSummaryCard.displayName = 'QuizSummaryCard'