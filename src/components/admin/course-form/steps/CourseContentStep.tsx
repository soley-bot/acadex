import React, { memo, useState } from 'react'
import {
  Card,
  Stack,
  Group,
  Title,
  Text,
  Button,
  TextInput,
  Textarea,
  NumberInput,
  Select,
  Switch,
  Badge,
  Accordion,
  ActionIcon,
  Alert
} from '@mantine/core'
import { 
  IconPlus, 
  IconTrash, 
  IconBook, 
  IconVideo,
  IconAlertTriangle
} from '@tabler/icons-react'

interface LessonData {
  id?: string
  title: string
  description: string
  content: string
  video_url?: string
  video_type?: 'upload' | 'youtube'
  duration_minutes?: number
  order_index: number
  is_free_preview: boolean
  quiz_id?: string
}

interface ModuleData {
  id?: string
  title: string
  description: string
  order_index: number
  lessons: LessonData[]
}

interface QuizOption {
  id: string
  title: string
  description?: string
}

interface CourseContentStepProps {
  modules: ModuleData[]
  availableQuizzes: QuizOption[]
  onChange: (modules: ModuleData[]) => void
  onQuizChange?: (quizId: string) => void
}

export const CourseContentStep = memo<CourseContentStepProps>(({
  modules,
  availableQuizzes,
  onChange,
  onQuizChange
}) => {
  const [expandedModules, setExpandedModules] = useState<string[]>([])

  const addModule = () => {
    const newModule: ModuleData = {
      title: '',
      description: '',
      order_index: modules.length,
      lessons: []
    }
    onChange([...modules, newModule])
  }

  const updateModule = (moduleIndex: number, updates: Partial<ModuleData>) => {
    const updatedModules = modules.map((module, index) =>
      index === moduleIndex ? { ...module, ...updates } : module
    )
    onChange(updatedModules)
  }

  const removeModule = (moduleIndex: number) => {
    const updatedModules = modules.filter((_, index) => index !== moduleIndex)
      .map((module, index) => ({ ...module, order_index: index }))
    onChange(updatedModules)
  }

  const addLesson = (moduleIndex: number) => {
    const newLesson: LessonData = {
      title: '',
      description: '',
      content: '',
      order_index: modules[moduleIndex].lessons.length,
      is_free_preview: false
    }
    
    const updatedModules = modules.map((module, index) =>
      index === moduleIndex 
        ? { ...module, lessons: [...module.lessons, newLesson] }
        : module
    )
    onChange(updatedModules)
  }

  const updateLesson = (moduleIndex: number, lessonIndex: number, updates: Partial<LessonData>) => {
    const updatedModules = modules.map((module, index) =>
      index === moduleIndex 
        ? {
            ...module,
            lessons: module.lessons.map((lesson, lIndex) =>
              lIndex === lessonIndex ? { ...lesson, ...updates } : lesson
            )
          }
        : module
    )
    onChange(updatedModules)
  }

  const removeLesson = (moduleIndex: number, lessonIndex: number) => {
    const updatedModules = modules.map((module, index) =>
      index === moduleIndex 
        ? {
            ...module,
            lessons: module.lessons.filter((_, lIndex) => lIndex !== lessonIndex)
              .map((lesson, lIndex) => ({ ...lesson, order_index: lIndex }))
          }
        : module
    )
    onChange(updatedModules)
  }

  const totalLessons = modules.reduce((total, module) => total + module.lessons.length, 0)
  const totalDuration = modules.reduce((total, module) => 
    total + module.lessons.reduce((moduleTotal, lesson) => 
      moduleTotal + (lesson.duration_minutes || 0), 0), 0)

  const toggleModuleExpansion = (moduleId: string) => {
    setExpandedModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    )
  }

  return (
    <Card shadow="sm" padding="xl" radius="md" withBorder>
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between" align="center">
          <Group gap="xs">
            <IconBook size={20} color="var(--mantine-color-blue-6)" />
            <Title order={3}>Course Content</Title>
          </Group>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={addModule}
            variant="light"
          >
            Add Module
          </Button>
        </Group>

        {/* Course Stats */}
        <Card withBorder variant="light">
          <Group justify="space-between">
            <div>
              <Text size="xs" c="dimmed" tt="uppercase">Modules</Text>
              <Text size="sm" fw={500}>{modules.length}</Text>
            </div>
            <div>
              <Text size="xs" c="dimmed" tt="uppercase">Total Lessons</Text>
              <Text size="sm" fw={500}>{totalLessons}</Text>
            </div>
            <div>
              <Text size="xs" c="dimmed" tt="uppercase">Total Duration</Text>
              <Text size="sm" fw={500}>{totalDuration} minutes</Text>
            </div>
          </Group>
        </Card>

        {/* Modules List */}
        {modules.length === 0 ? (
          <Card withBorder>
            <Stack gap="md" align="center" py="xl">
              <Text size="lg" c="dimmed">No modules yet</Text>
              <Text size="sm" c="dimmed" ta="center">
                Add your first module to start building your course content
              </Text>
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={addModule}
              >
                Create First Module
              </Button>
            </Stack>
          </Card>
        ) : (
          <Stack gap="md">
            {modules.map((module, moduleIndex) => (
              <Card key={moduleIndex} withBorder>
                <Stack gap="md">
                  {/* Module Header */}
                  <Group justify="space-between" align="flex-start">
                    <Group gap="sm" align="flex-start" flex={1}>
                      <Badge variant="light" size="sm">
                        Module {moduleIndex + 1}
                      </Badge>
                      <Stack gap="xs" flex={1}>
                        <TextInput
                          placeholder="Module title"
                          value={module.title}
                          onChange={(e) => updateModule(moduleIndex, { title: e.currentTarget.value })}
                          variant="unstyled"
                          size="md"
                          fw={500}
                        />
                        <Textarea
                          placeholder="Module description"
                          value={module.description}
                          onChange={(e) => updateModule(moduleIndex, { description: e.currentTarget.value })}
                          variant="unstyled"
                          size="sm"
                          rows={2}
                        />
                      </Stack>
                    </Group>
                    <ActionIcon
                      color="red"
                      variant="subtle"
                      onClick={() => removeModule(moduleIndex)}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>

                  {/* Lessons */}
                  <div>
                    <Group justify="space-between" mb="sm">
                      <Text size="sm" fw={500}>
                        Lessons ({module.lessons.length})
                      </Text>
                      <Button
                        size="xs"
                        variant="light"
                        leftSection={<IconPlus size={14} />}
                        onClick={() => addLesson(moduleIndex)}
                      >
                        Add Lesson
                      </Button>
                    </Group>

                    {module.lessons.length === 0 ? (
                      <Alert color="gray" variant="light">
                        <Text size="sm">No lessons in this module yet</Text>
                      </Alert>
                    ) : (
                      <Stack gap="sm">
                        {module.lessons.map((lesson, lessonIndex) => (
                          <Card key={lessonIndex} withBorder padding="md">
                            <Stack gap="sm">
                              <Group justify="space-between" align="flex-start">
                                <Group gap="xs">
                                  <Badge variant="outline" size="xs">
                                    {lessonIndex + 1}
                                  </Badge>
                                  {lesson.is_free_preview && (
                                    <Badge color="green" size="xs">Free Preview</Badge>
                                  )}
                                </Group>
                                <ActionIcon
                                  color="red"
                                  variant="subtle"
                                  size="sm"
                                  onClick={() => removeLesson(moduleIndex, lessonIndex)}
                                >
                                  <IconTrash size={14} />
                                </ActionIcon>
                              </Group>

                              <Group grow>
                                <TextInput
                                  placeholder="Lesson title"
                                  value={lesson.title}
                                  onChange={(e) => updateLesson(moduleIndex, lessonIndex, { title: e.currentTarget.value })}
                                  size="sm"
                                />
                                <NumberInput
                                  placeholder="Duration (min)"
                                  value={lesson.duration_minutes}
                                  onChange={(value) => updateLesson(moduleIndex, lessonIndex, { duration_minutes: Number(value) || 0 })}
                                  min={0}
                                  size="sm"
                                />
                              </Group>

                              <Textarea
                                placeholder="Lesson description"
                                value={lesson.description}
                                onChange={(e) => updateLesson(moduleIndex, lessonIndex, { description: e.currentTarget.value })}
                                rows={2}
                                size="sm"
                              />

                              <Group>
                                <TextInput
                                  placeholder="Video URL (YouTube or upload)"
                                  value={lesson.video_url}
                                  onChange={(e) => updateLesson(moduleIndex, lessonIndex, { video_url: e.currentTarget.value })}
                                  leftSection={<IconVideo size={16} />}
                                  flex={1}
                                  size="sm"
                                />
                              </Group>

                              <Group justify="space-between">
                                <Switch
                                  label="Free preview"
                                  checked={lesson.is_free_preview}
                                  onChange={(e) => updateLesson(moduleIndex, lessonIndex, { is_free_preview: e.currentTarget.checked })}
                                  size="sm"
                                />
                                <Select
                                  placeholder="Attach quiz"
                                  data={availableQuizzes.map(q => ({ value: q.id, label: q.title }))}
                                  value={lesson.quiz_id}
                                  onChange={(value) => updateLesson(moduleIndex, lessonIndex, { quiz_id: value || undefined })}
                                  clearable
                                  size="sm"
                                  style={{ minWidth: 200 }}
                                />
                              </Group>
                            </Stack>
                          </Card>
                        ))}
                      </Stack>
                    )}
                  </div>
                </Stack>
              </Card>
            ))}
          </Stack>
        )}

        {/* Summary Alert */}
        {modules.length > 0 && totalLessons === 0 && (
          <Alert icon={<IconAlertTriangle size={16} />} color="orange" variant="light">
            <Text size="sm">
              Your course has {modules.length} module(s) but no lessons yet. 
              Add lessons to each module to complete your course structure.
            </Text>
          </Alert>
        )}
      </Stack>
    </Card>
  )
})

CourseContentStep.displayName = 'CourseContentStep'