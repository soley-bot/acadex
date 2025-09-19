import React, { memo } from 'react'
import {
  Card,
  TextInput,
  Textarea,
  Select,
  Group,
  Stack,
  Title,
  NumberInput,
  Text,
  Chip
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { IconBook, IconUser, IconCoin } from '@tabler/icons-react'

interface CourseBasicInfo {
  title: string
  description: string
  instructor_name: string
  category: string
  level: string
  price?: number
  estimated_duration?: number
  tags: string[]
  learning_outcomes: string[]
}

interface CourseBasicInfoStepProps {
  initialData: CourseBasicInfo
  onChange: (data: CourseBasicInfo) => void
  categories: Array<{ value: string; label: string }>
  levels: Array<{ value: string; label: string }>
}

export const CourseBasicInfoStep = memo<CourseBasicInfoStepProps>(({
  initialData,
  onChange,
  categories,
  levels
}) => {
  const form = useForm<CourseBasicInfo>({
    initialValues: initialData,
    validate: {
      title: (value) => {
        if (!value.trim()) return 'Course title is required'
        if (value.trim().length < 3) return 'Title must be at least 3 characters'
        return null
      },
      description: (value) => {
        if (!value.trim()) return 'Course description is required'
        if (value.trim().length < 20) return 'Description must be at least 20 characters'
        return null
      },
      instructor_name: (value) => {
        if (!value.trim()) return 'Instructor name is required'
        return null
      },
      category: (value) => !value ? 'Please select a category' : null,
      level: (value) => !value ? 'Please select a difficulty level' : null,
      price: (value) => {
        if (value !== undefined && value < 0) return 'Price cannot be negative'
        return null
      }
    },
    onValuesChange: (values) => {
      onChange(values)
    }
  })

  const handleTagAdd = (tag: string) => {
    if (tag.trim() && !form.values.tags.includes(tag.trim())) {
      const newTags = [...form.values.tags, tag.trim()]
      form.setFieldValue('tags', newTags)
    }
  }

  const handleTagRemove = (tagToRemove: string) => {
    const newTags = form.values.tags.filter(tag => tag !== tagToRemove)
    form.setFieldValue('tags', newTags)
  }

  const handleLearningOutcomeAdd = (outcome: string) => {
    if (outcome.trim() && !form.values.learning_outcomes.includes(outcome.trim())) {
      const newOutcomes = [...form.values.learning_outcomes, outcome.trim()]
      form.setFieldValue('learning_outcomes', newOutcomes)
    }
  }

  const handleLearningOutcomeRemove = (outcomeToRemove: string) => {
    const newOutcomes = form.values.learning_outcomes.filter(outcome => outcome !== outcomeToRemove)
    form.setFieldValue('learning_outcomes', newOutcomes)
  }

  return (
    <Card shadow="sm" padding="xl" radius="md" withBorder>
      <Stack gap="lg">
        {/* Header */}
        <Group gap="xs">
          <IconBook size={20} color="var(--mantine-color-blue-6)" />
          <Title order={3}>Course Information</Title>
        </Group>

        {/* Basic Course Details */}
        <Group grow>
          <TextInput
            label="Course Title"
            placeholder="Enter course title"
            required
            {...form.getInputProps('title')}
          />
          <TextInput
            label="Instructor Name"
            placeholder="Enter instructor name"
            required
            leftSection={<IconUser size={16} />}
            {...form.getInputProps('instructor_name')}
          />
        </Group>

        {/* Description */}
        <Textarea
          label="Course Description"
          placeholder="Enter detailed course description"
          required
          rows={4}
          {...form.getInputProps('description')}
        />

        {/* Category and Level */}
        <Group grow>
          <Select
            label="Category"
            placeholder="Select category"
            required
            data={categories}
            {...form.getInputProps('category')}
          />
          <Select
            label="Difficulty Level"
            placeholder="Select level"
            required
            data={levels}
            {...form.getInputProps('level')}
          />
        </Group>

        {/* Price and Duration */}
        <Group grow>
          <NumberInput
            label="Price (USD)"
            placeholder="0.00"
            min={0}
            step={0.01}
            leftSection={<IconCoin size={16} />}
            description="Leave empty for free course"
            {...form.getInputProps('price')}
          />
          <NumberInput
            label="Estimated Duration (hours)"
            placeholder="0"
            min={0}
            step={0.5}
            description="Total estimated time to complete"
            {...form.getInputProps('estimated_duration')}
          />
        </Group>

        {/* Tags Section */}
        <div>
          <Text size="sm" fw={500} mb="xs">Course Tags</Text>
          <Group gap="xs" mb="xs">
            {form.values.tags.map((tag, index) => (
              <Chip
                key={index}
                variant="light"
                checked={false}
                onChange={() => handleTagRemove(tag)}
              >
                {tag}
              </Chip>
            ))}
          </Group>
          <TextInput
            placeholder="Add tags (press Enter)"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                const input = e.currentTarget
                handleTagAdd(input.value)
                input.value = ''
              }
            }}
            description="Press Enter to add tags that help students find your course"
          />
        </div>

        {/* Learning Outcomes Section */}
        <div>
          <Text size="sm" fw={500} mb="xs">Learning Outcomes</Text>
          <Stack gap="xs" mb="xs">
            {form.values.learning_outcomes.map((outcome, index) => (
              <Group key={index} gap="xs" justify="space-between">
                <Text size="sm" flex={1}>• {outcome}</Text>
                <button
                  type="button"
                  onClick={() => handleLearningOutcomeRemove(outcome)}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </Group>
            ))}
          </Stack>
          <TextInput
            placeholder="Add learning outcome (press Enter)"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                const input = e.currentTarget
                handleLearningOutcomeAdd(input.value)
                input.value = ''
              }
            }}
            description="What will students learn from this course?"
          />
        </div>

        {/* Course Stats */}
        <Card withBorder variant="light">
          <Group justify="space-between">
            <div>
              <Text size="xs" c="dimmed" tt="uppercase">Total Tags</Text>
              <Text size="sm" fw={500}>{form.values.tags.length}</Text>
            </div>
            <div>
              <Text size="xs" c="dimmed" tt="uppercase">Learning Outcomes</Text>
              <Text size="sm" fw={500}>{form.values.learning_outcomes.length}</Text>
            </div>
            <div>
              <Text size="xs" c="dimmed" tt="uppercase">Price</Text>
              <Text size="sm" fw={500}>
                {form.values.price ? `$${form.values.price.toFixed(2)}` : 'Free'}
              </Text>
            </div>
          </Group>
        </Card>
      </Stack>
    </Card>
  )
})

CourseBasicInfoStep.displayName = 'CourseBasicInfoStep'