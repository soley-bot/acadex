import { Container, Paper, Stack, TextInput, Textarea, Select, NumberInput, Switch, Button, Group, ActionIcon, Text } from '@mantine/core'
import { IconPlus, IconTrash } from '@tabler/icons-react'
import { categories, levels } from '@/lib/courseConstants'
import { ImageUpload } from '@/components/ui/ImageUpload'
import type { EnhancedCourseData } from '../types'

interface BasicInfoStepProps {
  formData: EnhancedCourseData
  onFieldChange: (field: keyof EnhancedCourseData, value: any) => void
  hasValidationErrors: boolean
}

export function BasicInfoStep({ formData, onFieldChange, hasValidationErrors }: BasicInfoStepProps) {
  const addLearningObjective = () => {
    onFieldChange('learning_objectives', [...formData.learning_objectives, ''])
  }

  const updateLearningObjective = (index: number, value: string) => {
    const newObjectives = [...formData.learning_objectives]
    newObjectives[index] = value
    onFieldChange('learning_objectives', newObjectives)
  }

  const removeLearningObjective = (index: number) => {
    if (formData.learning_objectives.length > 1) {
      const newObjectives = formData.learning_objectives.filter((_, i) => i !== index)
      onFieldChange('learning_objectives', newObjectives)
    }
  }

  return (
    <Container size="md">
      <Stack gap="lg">
        <Paper p="xl" withBorder radius="lg">
          <Stack gap="md">
            <Text size="lg" fw="bold">Basic Information</Text>
            
            <TextInput
              label="Course Title"
              placeholder="Enter course title"
              required
              value={formData.title}
              onChange={(e) => onFieldChange('title', e.target.value)}
              error={!formData.title.trim() && hasValidationErrors ? 'Title is required' : null}
            />

            <Textarea
              label="Course Description"
              placeholder="Describe your course"
              required
              minRows={4}
              value={formData.description}
              onChange={(e) => onFieldChange('description', e.target.value)}
              error={!formData.description.trim() && hasValidationErrors ? 'Description is required' : null}
            />

            <TextInput
              label="Instructor Name"
              placeholder="Your name"
              required
              value={formData.instructor_name}
              onChange={(e) => onFieldChange('instructor_name', e.target.value)}
            />

            <Group grow>
              <Select
                label="Category"
                placeholder="Select category"
                required
                data={categories.map(cat => ({ value: cat, label: cat }))}
                value={formData.category}
                onChange={(value) => onFieldChange('category', value)}
                error={!formData.category && hasValidationErrors ? 'Category is required' : null}
              />

              <Select
                label="Level"
                placeholder="Select level"
                required
                data={levels}
                value={formData.level}
                onChange={(value) => onFieldChange('level', value)}
              />
            </Group>

            <Group grow>
              <NumberInput
                label="Price ($)"
                placeholder="0.00"
                min={0}
                step={0.01}
                value={formData.price}
                onChange={(value) => onFieldChange('price', value || 0)}
              />

              <TextInput
                label="Duration"
                placeholder="e.g., 8 weeks"
                value={formData.duration}
                onChange={(e) => onFieldChange('duration', e.target.value)}
              />
            </Group>
          </Stack>
        </Paper>

        <Paper p="xl" withBorder radius="lg">
          <Stack gap="md">
            <Text size="lg" fw="bold">Course Image</Text>
            <ImageUpload
              value={formData.image_url}
              onChange={(url) => onFieldChange('image_url', url || '')}
              context="course"
            />
          </Stack>
        </Paper>

        <Paper p="xl" withBorder radius="lg">
          <Stack gap="md">
            <Group justify="space-between" align="center">
              <Text size="lg" fw="bold">Learning Objectives</Text>
              <Button variant="light" size="sm" leftSection={<IconPlus size="1rem" />} onClick={addLearningObjective}>
                Add Objective
              </Button>
            </Group>

            <Stack gap="sm">
              {formData.learning_objectives.map((objective, index) => (
                <Group key={index} align="flex-end">
                  <TextInput
                    style={{ flex: 1 }}
                    placeholder={`Learning objective ${index + 1}`}
                    value={objective}
                    onChange={(e) => updateLearningObjective(index, e.target.value)}
                  />
                  {formData.learning_objectives.length > 1 && (
                    <ActionIcon
                      color="red"
                      variant="light"
                      onClick={() => removeLearningObjective(index)}
                    >
                      <IconTrash size="1rem" />
                    </ActionIcon>
                  )}
                </Group>
              ))}
            </Stack>
          </Stack>
        </Paper>

        <Paper p="xl" withBorder radius="lg">
          <Stack gap="md">
            <Text size="lg" fw="bold">Publishing</Text>
            <Switch
              label="Publish course"
              description="Make this course available to students"
              checked={formData.is_published}
              onChange={(e) => onFieldChange('is_published', e.currentTarget.checked)}
            />
          </Stack>
        </Paper>
      </Stack>
    </Container>
  )
}