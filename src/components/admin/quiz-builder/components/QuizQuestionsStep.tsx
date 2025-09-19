import React, { memo, useMemo } from 'react'
import {
  Stack,
  Group,
  Title,
  Button,
  Alert,
  Text,
  Badge,
  Loader,
  Card
} from '@mantine/core'
import { IconRocket, IconAlertTriangle } from '@tabler/icons-react'
import { calculateQuizStats } from '../utils/QuizBuilderUtils'
import type { Quiz, QuizQuestion } from '@/lib/supabase'
import { QuestionCreationInterface } from './QuestionCreationInterface'

interface QuizQuestionsProps {
  questions: QuizQuestion[]
  onUpdate: (index: number, updates: Partial<QuizQuestion>) => void
  onAdd: (questionType: string) => void
  onDuplicate: (index: number) => void
  onRemove: (index: number) => void
  onGenerateAI?: () => void
  isGenerating?: boolean
  aiConfig?: any
  onAIConfigChange?: (config: any) => void
  quizData?: Partial<Quiz>
}

interface QuestionValidation {
  question: QuizQuestion
  errors: string[]
  index: number
}

export const QuizQuestions = memo<QuizQuestionsProps>(({
  questions,
  onUpdate,
  onAdd,
  onDuplicate,
  onRemove,
  onGenerateAI,
  isGenerating = false,
  aiConfig,
  onAIConfigChange,
  quizData
}) => {
  const questionsWithValidation = useMemo((): QuestionValidation[] => {
    return questions.map((question: QuizQuestion, index: number) => {
      const errors: string[] = []
      
      // Basic validation
      if (!question.question.trim()) errors.push('Question text is required')
      
      // Type-specific validation
      switch (question.question_type) {
        case 'multiple_choice':
        case 'single_choice':
          if (!question.options || question.options.length < 2) {
            errors.push('At least 2 options required for multiple choice')
          }
          if (question.correct_answer === null || question.correct_answer === undefined) {
            errors.push('Correct answer must be selected')
          }
          break
          
        case 'true_false':
          if (question.correct_answer === null || question.correct_answer === undefined) {
            errors.push('Please select True or False as the correct answer')
          }
          break
          
        case 'fill_blank':
          if (!question.correct_answer_text || question.correct_answer_text.toString().trim() === '') {
            errors.push('Correct answer is required for fill in the blank')
          }
          break
          
        case 'essay':
          // Essay questions only need question text (no specific validation)
          break
          
        case 'matching':
        case 'ordering':
          if (!question.options || question.options.length < 2) {
            errors.push('At least 2 options required')
          }
          break
      }
      
      return { question, errors, index }
    })
  }, [questions])

  const handleGenerateAI = () => {
    if (!onGenerateAI) return

    const validTypes = (aiConfig?.questionTypes || ['multiple_choice']).filter((type: string) => type.trim())
    if (validTypes.length === 0) {
      alert('Please select at least one question type before generating.')
      return
    }
    onGenerateAI()
  }

  const validQuestions = questionsWithValidation.filter(({ errors }) => errors.length === 0)
  const invalidQuestions = questionsWithValidation.filter(({ errors }) => errors.length > 0)

  // Calculate quiz stats for summary display
  const quizStats = useMemo(() => {
    return calculateQuizStats(quizData || {}, questions)
  }, [quizData, questions])

  return (
    <Stack gap="lg">
      {/* Header */}
      <Group justify="space-between" align="center">
        <Group gap="sm" align="center">
          <Title order={3}>Quiz Questions</Title>
          <Badge variant="light" color={questions.length > 0 ? 'blue' : 'gray'}>
            {questions.length} {questions.length === 1 ? 'question' : 'questions'}
          </Badge>
        </Group>

        <Group gap="sm">
          {onGenerateAI && (
            <Button
              variant="gradient"
              gradient={{ from: 'violet', to: 'indigo' }}
              leftSection={<IconRocket size={16} />}
              onClick={handleGenerateAI}
              disabled={isGenerating}
              loading={isGenerating}
              size="sm"
            >
              {isGenerating ? 'Generating...' : 'Generate with AI'}
            </Button>
          )}
          
          <QuestionCreationInterface 
            onCreateQuestion={onAdd} 
            quizData={quizData}
            existingQuestions={questions}
          />
        </Group>
      </Group>

      {/* Validation Summary */}
      {invalidQuestions.length > 0 && (
        <Alert 
          icon={<IconAlertTriangle size={16} />} 
          color="orange" 
          variant="light"
        >
          <Stack gap="xs">
            <Text size="sm" fw={500}>
              {invalidQuestions.length} question{invalidQuestions.length === 1 ? '' : 's'} need{invalidQuestions.length === 1 ? 's' : ''} attention
            </Text>
            {invalidQuestions.map(({ index, errors }) => (
              <Text key={index} size="sm" c="dimmed">
                Question {index + 1}: {errors.join(', ')}
              </Text>
            ))}
          </Stack>
        </Alert>
      )}

      {/* Questions List */}
      {questions.length === 0 ? (
        <Card withBorder>
          <Stack gap="md" align="center" py="xl">
            <Text size="lg" c="dimmed">No questions yet</Text>
            <Text size="sm" c="dimmed" ta="center">
              Add your first question using the button above, or generate questions with AI
            </Text>
            <QuestionCreationInterface 
              onCreateQuestion={onAdd} 
              quizData={quizData}
              existingQuestions={questions}
            />
          </Stack>
        </Card>
      ) : (
        <Stack gap="md">
          {questionsWithValidation.map(({ question, errors, index }) => (
            <Card 
              key={index} 
              withBorder 
              shadow={errors.length > 0 ? 'md' : 'sm'}
              style={{ 
                borderColor: errors.length > 0 ? 'var(--mantine-color-red-4)' : undefined 
              }}
            >
              <Stack gap="sm">
                <Group justify="space-between" align="flex-start">
                  <Group gap="xs" align="center">
                    <Badge variant="light" size="sm">
                      Q{index + 1}
                    </Badge>
                    <Badge variant="outline" size="sm" color="blue">
                      {question.question_type.replace('_', ' ')}
                    </Badge>
                    {question.points && (
                      <Badge variant="outline" size="sm" color="green">
                        {question.points} pts
                      </Badge>
                    )}
                  </Group>
                  
                  <Group gap="xs">
                    <Button 
                      variant="subtle" 
                      size="xs"
                      onClick={() => onDuplicate(index)}
                    >
                      Duplicate
                    </Button>
                    <Button 
                      variant="subtle" 
                      color="red" 
                      size="xs"
                      onClick={() => onRemove(index)}
                    >
                      Remove
                    </Button>
                  </Group>
                </Group>

                <Text size="sm" lineClamp={2}>
                  {question.question || 'No question text'}
                </Text>

                {errors.length > 0 && (
                  <Alert icon={<IconAlertTriangle size={14} />} color="red" variant="light" p="xs">
                    <Text size="xs">{errors.join(', ')}</Text>
                  </Alert>
                )}
              </Stack>
            </Card>
          ))}
        </Stack>
      )}

      {/* Summary Stats */}
      {questions.length > 0 && (
        <Card withBorder variant="light">
          <Group justify="space-between">
            <Group gap="xl">
              <div>
                <Text size="xs" c="dimmed" tt="uppercase">Total Questions</Text>
                <Text size="sm" fw={500}>{questions.length}</Text>
              </div>
              <div>
                <Text size="xs" c="dimmed" tt="uppercase">Valid</Text>
                <Text size="sm" fw={500} c="green">{validQuestions.length}</Text>
              </div>
              <div>
                <Text size="xs" c="dimmed" tt="uppercase">Need Attention</Text>
                <Text size="sm" fw={500} c={invalidQuestions.length > 0 ? "orange" : "green"}>
                  {invalidQuestions.length}
                </Text>
              </div>
              <div>
                <Text size="xs" c="dimmed" tt="uppercase">Total Points</Text>
                <Text size="sm" fw={500}>
                  {quizStats.totalPoints}
                </Text>
              </div>
            </Group>
          </Group>
        </Card>
      )}
    </Stack>
  )
})

QuizQuestions.displayName = 'QuizQuestions'