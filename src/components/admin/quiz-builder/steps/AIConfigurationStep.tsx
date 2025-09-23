import React, { memo } from 'react'
import {
  Stack,
  Text,
  Card,
  TextInput,
  Select,
  NumberInput,
  Textarea,
  Button,
  Checkbox,
  Group,
  Title,
  Paper,
  Alert
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { useToast } from '@/hooks/use-toast'
import { IconRocket, IconRobotFace, IconAlertTriangle } from '@tabler/icons-react'

// Define local types (will eventually be moved to shared types file)
interface AIConfig {
  enabled: boolean
  language: 'english' | 'khmer'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  questionCount: number
  questionTypes: string[]
  topic: string
  subject: string
  customPrompt: string
}

interface AIConfigurationStepProps {
  aiConfig: AIConfig
  onConfigUpdate: (updates: Partial<AIConfig>) => void
  onGenerateQuestions: () => void
  isGenerating: boolean
}

interface FormValues {
  topic: string
  subject: string
  questionCount: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  language: 'english' | 'khmer'
  questionTypes: string[]
  customPrompt: string
}

const questionTypeOptions = [
  { value: 'multiple_choice', label: '☑️ Multiple Choice' },
  { value: 'true_false', label: '✓ True/False' },
  { value: 'fill_blank', label: '📝 Fill in Blank' },
  { value: 'essay', label: '📄 Essay' }
]

export const AIConfigurationStep = memo<AIConfigurationStepProps>(({
  aiConfig,
  onConfigUpdate,
  onGenerateQuestions,
  isGenerating
}) => {
  const { toast } = useToast()
  
  // Mantine form with validation
  const form = useForm<FormValues>({
    initialValues: {
      topic: aiConfig.topic,
      subject: aiConfig.subject,
      questionCount: aiConfig.questionCount,
      difficulty: aiConfig.difficulty,
      language: aiConfig.language,
      questionTypes: aiConfig.questionTypes,
      customPrompt: aiConfig.customPrompt
    },
    validate: {
      topic: (value) => value.trim().length < 3 ? 'Topic must be at least 3 characters' : null,
      questionTypes: (value) => value.length === 0 ? 'Please select at least one question type' : null,
    },
    onValuesChange: (values) => {
      // Update parent state whenever form values change
      onConfigUpdate(values)
    }
  })

  const handleGenerate = () => {
    const validation = form.validate()
    
    if (!validation.hasErrors) {
      onGenerateQuestions()
    } else {
      toast({
        title: 'Validation Error',
        description: 'Please fix the form errors before generating questions',
        variant: 'destructive'
      })
    }
  }

  return (
    <Stack gap="xl">
      {/* Header */}
      <Stack gap="xs" align="center">
        <Title order={2} ta="center">AI Configuration</Title>
        <Text c="dimmed" ta="center">
          Configure your AI quiz generation settings
        </Text>
      </Stack>

      {/* Main Form Card */}
      <Card
        shadow="sm"
        padding="xl"
        radius="md"
        withBorder
        style={{
          background: 'linear-gradient(135deg, #f8f4ff 0%, #e8f5ff 100%)',
          borderColor: '#d1c7f0'
        }}
      >
        <Stack gap="md">
          {/* Header */}
          <Group gap="xs">
            <IconRobotFace size={20} color="#7c3aed" />
            <Text fw={600} c="#7c3aed" size="lg">
              AI Generation Settings
            </Text>
          </Group>

          {/* Form Grid */}
          <form>
            <Stack gap="md">
              {/* Topic & Subject Row */}
              <Group grow>
                <TextInput
                  label="Topic"
                  placeholder="e.g., Business English, Grammar, Reading"
                  required
                  {...form.getInputProps('topic')}
                />
                <TextInput
                  label="Subject"
                  placeholder="e.g., English, Mathematics, Science"
                  {...form.getInputProps('subject')}
                />
              </Group>

              {/* Question Count & Difficulty Row */}
              <Group grow>
                <NumberInput
                  label="Question Count"
                  min={1}
                  max={20}
                  {...form.getInputProps('questionCount')}
                />
                <Select
                  label="Difficulty"
                  data={[
                    { value: 'beginner', label: 'Beginner' },
                    { value: 'intermediate', label: 'Intermediate' },
                    { value: 'advanced', label: 'Advanced' }
                  ]}
                  {...form.getInputProps('difficulty')}
                />
              </Group>

              {/* Language */}
              <Select
                label="Language"
                data={[
                  { value: 'english', label: 'English' },
                  { value: 'khmer', label: 'Khmer' }
                ]}
                {...form.getInputProps('language')}
              />

              {/* Question Types */}
              <Stack gap="xs">
                <Text size="sm" fw={500}>
                  Question Types to Generate *
                </Text>
                <Checkbox.Group
                  {...form.getInputProps('questionTypes')}
                >
                  <Stack gap="xs">
                    {questionTypeOptions.map((option) => (
                      <Checkbox
                        key={option.value}
                        value={option.value}
                        label={option.label}
                        size="sm"
                      />
                    ))}
                  </Stack>
                </Checkbox.Group>
                <Text size="xs" c="dimmed">
                  Select one or more question types. At least one type must be selected.
                </Text>
                {form.errors.questionTypes && (
                  <Text size="xs" c="red">{form.errors.questionTypes}</Text>
                )}
              </Stack>

              {/* Custom Instructions */}
              <Textarea
                label="Custom Instructions (Optional)"
                placeholder="e.g., Focus on business scenarios, include academic vocabulary, test specific skills..."
                rows={3}
                {...form.getInputProps('customPrompt')}
              />

              {/* Generate Button */}
              <Group justify="center" pt="md">
                <Button
                  size="lg"
                  leftSection={isGenerating ? undefined : <IconRocket size={18} />}
                  loading={isGenerating}
                  onClick={handleGenerate}
                  gradient={{ from: 'violet', to: 'blue', deg: 45 }}
                  variant="gradient"
                >
                  {isGenerating ? 'Generating Questions...' : 'Generate AI Questions'}
                </Button>
              </Group>
            </Stack>
          </form>
        </Stack>
      </Card>
    </Stack>
  )
})

AIConfigurationStep.displayName = 'AIConfigurationStep'