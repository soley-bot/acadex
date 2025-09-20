import { Modal, Container, Tabs, Group, Button, Alert, Paper, Stack, Text, Badge } from '@mantine/core'
import { IconX, IconDeviceFloppy, IconLoader2, IconAlertCircle, IconBook, IconList } from '@tabler/icons-react'
import { useCourseFormPerformance } from '@/lib/adminPerformanceSystem'
import { useCourseForm } from './hooks/useCourseForm'
import { BasicInfoStep } from './steps/BasicInfoStep'
import type { CourseFormProps } from './types'

export function CourseForm({ course, isOpen, onClose, onSuccess, embedded = false }: CourseFormProps) {
  const {
    formData,
    error,
    successMessage,
    activeTab,
    isLoading,
    totalLessons,
    totalDurationMinutes,
    hasValidationErrors,
    setActiveTab,
    handleFieldChange,
    createCourse,
    updateCourse,
    mutationError,
    setError,
    setSuccessMessage
  } = useCourseForm(course)

  // Performance monitoring
  const { 
    metrics, 
    logPerformanceReport, 
    isSlowComponent, 
    performanceScore 
  } = useCourseFormPerformance()

  const handleSubmit = async () => {
    if (hasValidationErrors) {
      setError('Please fill in all required fields')
      return
    }

    try {
      if (course?.id) {
        await updateCourse({
          id: course.id,
          updates: formData
        })
        setSuccessMessage('Course updated successfully!')
      } else {
        await createCourse(formData)
        setSuccessMessage('Course created successfully!')
      }

      setTimeout(() => {
        onSuccess()
        onClose()
      }, 1500)
    } catch (err) {
      setError('Failed to save course')
    }
  }

  const content = (
    <Container size="lg">
      <Stack gap="lg">
        {/* Header */}
        <Paper p="md" withBorder radius="lg">
          <Group justify="space-between" align="center">
            <div>
              <Text size="xl" fw="bold">
                {course ? 'Edit Course' : 'Create New Course'}
              </Text>
              {totalLessons > 0 && (
                <Group gap="xs" mt="xs">
                  <Badge variant="light" color="blue">
                    {totalLessons} lessons
                  </Badge>
                  <Badge variant="light" color="green">
                    {Math.round(totalDurationMinutes / 60)}h {totalDurationMinutes % 60}m
                  </Badge>
                </Group>
              )}
            </div>
            <Group gap="sm">
              {!embedded && (
                <Button variant="outline" onClick={onClose} leftSection={<IconX size="1rem" />}>
                  Cancel
                </Button>
              )}
              <Button
                onClick={handleSubmit}
                loading={isLoading}
                disabled={hasValidationErrors}
                leftSection={<IconDeviceFloppy size="1rem" />}
              >
                {course ? 'Update Course' : 'Create Course'}
              </Button>
            </Group>
          </Group>
        </Paper>

        {/* Error/Success Messages */}
        {error && (
          <Alert color="red" icon={<IconAlertCircle size="1rem" />} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {successMessage && (
          <Alert color="green" onClose={() => setSuccessMessage(null)}>
            {successMessage}
          </Alert>
        )}

        {mutationError && (
          <Alert color="red" icon={<IconAlertCircle size="1rem" />}>
            {mutationError.message}
          </Alert>
        )}

        {/* Performance Alert */}
        {isSlowComponent && (
          <Alert color="yellow" icon={<IconAlertCircle size="1rem" />}>
            Performance warning: Form is responding slowly (Score: {performanceScore}/100)
          </Alert>
        )}

        {/* Form Tabs */}
        <Tabs value={activeTab} onChange={(value) => setActiveTab(value as 'basic' | 'modules')}>
          <Tabs.List>
            <Tabs.Tab value="basic" leftSection={<IconBook size="1rem" />}>
              Basic Info
            </Tabs.Tab>
            <Tabs.Tab value="modules" leftSection={<IconList size="1rem" />}>
              Modules & Lessons
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="basic" pt="lg">
            <BasicInfoStep
              formData={formData}
              onFieldChange={handleFieldChange}
              hasValidationErrors={hasValidationErrors}
            />
          </Tabs.Panel>

          <Tabs.Panel value="modules" pt="lg">
            <Paper p="xl" withBorder radius="lg">
              <Text>Module management coming soon...</Text>
            </Paper>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  )

  if (embedded) {
    return content
  }

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      size="xl"
      centered
      overlayProps={{ opacity: 0.55, blur: 3 }}
      closeButtonProps={{ 'aria-label': 'Close course form' }}
    >
      {content}
    </Modal>
  )
}