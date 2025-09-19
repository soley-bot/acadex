import React, { useState, useCallback } from 'react'
import {
  Container,
  Paper,
  Stack,
  Group,
  Title,
  Button,
  Stepper,
  Alert,
  LoadingOverlay,
  Text
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { 
  IconCheck,
  IconAlertTriangle,
  IconArrowLeft,
  IconArrowRight,
  IconDeviceFloppy
} from '@tabler/icons-react'

// Import our extracted components
import { CourseBasicInfoStep } from './steps/CourseBasicInfoStep'
import { CourseContentStep } from './steps/CourseContentStep'
import { CourseImageStep } from './steps/CourseImageStep'

// Types for our form data
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

interface CourseImageData {
  id?: string
  url?: string
  file?: File
  thumbnail_url?: string
  alt_text?: string
}

interface CourseFormData {
  // Basic Info
  title: string
  description: string
  short_description: string
  category: string
  level: 'beginner' | 'intermediate' | 'advanced'
  price: number
  is_free: boolean
  estimated_hours: number
  tags: string[]
  learning_outcomes: string[]
  prerequisites: string[]
  
  // Content
  modules: ModuleData[]
  
  // Images
  images: {
    featured_image?: CourseImageData
    thumbnail_image?: CourseImageData
    gallery_images?: CourseImageData[]
  }
}

interface QuizOption {
  id: string
  title: string
  description?: string
}

interface CourseFormProps {
  initialData?: Partial<CourseFormData>
  availableQuizzes: QuizOption[]
  onSubmit: (data: CourseFormData) => Promise<void>
  onCancel?: () => void
  onImageUpload?: (file: File, type: 'featured' | 'thumbnail' | 'gallery') => Promise<string>
  isEditing?: boolean
  isLoading?: boolean
}

export default function CourseForm({
  initialData,
  availableQuizzes,
  onSubmit,
  onCancel,
  onImageUpload,
  isEditing = false,
  isLoading = false
}: CourseFormProps) {
  const [activeStep, setActiveStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<CourseFormData>({
    initialValues: {
      title: '',
      description: '',
      short_description: '',
      category: '',
      level: 'beginner' as const,
      price: 0,
      is_free: false,
      estimated_hours: 0,
      tags: [],
      learning_outcomes: [],
      prerequisites: [],
      modules: [],
      images: {},
      ...initialData
    },
    validate: (values) => {
      const errors: Record<string, string> = {}

      // Step 1 - Basic Info validation
      if (!values.title?.trim()) errors.title = 'Title is required'
      if (!values.description?.trim()) errors.description = 'Description is required'
      if (!values.category) errors.category = 'Category is required'
      if (values.price < 0) errors.price = 'Price cannot be negative'
      if (values.estimated_hours <= 0) errors.estimated_hours = 'Estimated hours must be greater than 0'

      // Step 2 - Content validation
      if (values.modules.length === 0) {
        errors.modules = 'At least one module is required'
      } else {
        const hasLessons = values.modules.some(module => module.lessons.length > 0)
        if (!hasLessons) {
          errors.modules = 'At least one lesson is required'
        }
      }

      // Step 3 - Images validation
      if (!values.images.featured_image) {
        errors.featured_image = 'Featured image is required'
      }

      return errors
    }
  })

  const steps = [
    {
      label: 'Basic Info',
      description: 'Course details and settings',
      icon: IconCheck
    },
    {
      label: 'Content',
      description: 'Modules and lessons',
      icon: IconCheck
    },
    {
      label: 'Images',
      description: 'Course imagery',
      icon: IconCheck
    }
  ]

  const validateCurrentStep = useCallback(() => {
    const errors = form.validate()
    const currentStepErrors = getCurrentStepErrors(errors.errors as Record<string, string>, activeStep)
    return Object.keys(currentStepErrors).length === 0
  }, [form, activeStep])

  const getCurrentStepErrors = (errors: Record<string, string>, step: number) => {
    const stepFields: Record<number, string[]> = {
      0: ['title', 'description', 'short_description', 'category', 'level', 'price', 'estimated_hours'],
      1: ['modules'],
      2: ['featured_image']
    }
    
    const fieldsForStep = stepFields[step] || []
    return Object.keys(errors)
      .filter(key => fieldsForStep.includes(key))
      .reduce((obj, key) => ({ ...obj, [key]: errors[key] }), {})
  }

  const nextStep = () => {
    if (validateCurrentStep()) {
      setActiveStep((current) => (current < steps.length - 1 ? current + 1 : current))
    } else {
      notifications.show({
        title: 'Validation Error',
        message: 'Please fix the errors in the current step before proceeding',
        color: 'red'
      })
    }
  }

  const prevStep = () => {
    setActiveStep((current) => (current > 0 ? current - 1 : current))
  }

  const handleSubmit = async (values: CourseFormData) => {
    if (!form.isValid()) {
      notifications.show({
        title: 'Validation Error', 
        message: 'Please fix all errors before submitting',
        color: 'red'
      })
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(values)
      notifications.show({
        title: 'Success',
        message: `Course ${isEditing ? 'updated' : 'created'} successfully!`,
        color: 'green'
      })
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to save course. Please try again.',
        color: 'red'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Container size="lg" py="xl">
      <Paper shadow="sm" radius="md" p="xl" pos="relative">
        <LoadingOverlay visible={isLoading || isSubmitting} />
        
        <Stack gap="xl">
          {/* Header */}
          <Group justify="space-between" align="flex-start">
            <div>
              <Title order={2}>
                {isEditing ? 'Edit Course' : 'Create New Course'}
              </Title>
              <Text c="dimmed" mt="xs">
                {isEditing ? 'Update course information and content' : 'Build your course step by step'}
              </Text>
            </div>
            {onCancel && (
              <Button variant="subtle" onClick={onCancel} leftSection={<IconArrowLeft size={16} />}>
                Cancel
              </Button>
            )}
          </Group>

          {/* Progress Stepper */}
          <Stepper active={activeStep} onStepClick={setActiveStep} allowNextStepsSelect={false}>
            {steps.map((step, index) => (
              <Stepper.Step
                key={index}
                label={step.label}
                description={step.description}
                icon={<step.icon size={18} />}
              />
            ))}
          </Stepper>

          {/* Form Steps */}
          <form onSubmit={form.onSubmit(handleSubmit)}>
            {activeStep === 0 && (
              <CourseBasicInfoStep
                initialData={{
                  title: form.values.title,
                  description: form.values.description,
                  instructor_name: '', // Add this if needed
                  category: form.values.category,
                  level: form.values.level,
                  price: form.values.price,
                  estimated_duration: form.values.estimated_hours,
                  tags: form.values.tags,
                  learning_outcomes: form.values.learning_outcomes
                }}
                onChange={(newValues) => {
                  Object.entries(newValues).forEach(([field, value]) => {
                    if (field === 'estimated_duration') {
                      form.setFieldValue('estimated_hours', value)
                    } else if (field === 'instructor_name') {
                      // Handle if needed
                    } else {
                      form.setFieldValue(field as keyof CourseFormData, value)
                    }
                  })
                }}
                categories={[
                  { value: 'general', label: 'General' },
                  { value: 'ielts', label: 'IELTS' },
                  { value: 'toefl', label: 'TOEFL' },
                  { value: 'gre', label: 'GRE' },
                  { value: 'gmat', label: 'GMAT' }
                ]}
                levels={[
                  { value: 'beginner', label: 'Beginner' },
                  { value: 'intermediate', label: 'Intermediate' },
                  { value: 'advanced', label: 'Advanced' }
                ]}
              />
            )}

            {activeStep === 1 && (
              <CourseContentStep
                modules={form.values.modules}
                availableQuizzes={availableQuizzes}
                onChange={(modules) => form.setFieldValue('modules', modules)}
              />
            )}

            {activeStep === 2 && (
              <CourseImageStep
                images={form.values.images}
                onChange={(images) => form.setFieldValue('images', images)}
                onUpload={onImageUpload}
                isUploading={isSubmitting}
              />
            )}

            {/* Navigation */}
            <Group justify="space-between" mt="xl" pt="md" style={{ borderTop: '1px solid var(--mantine-color-gray-3)' }}>
              <Button
                variant="default"
                onClick={prevStep}
                disabled={activeStep === 0}
                leftSection={<IconArrowLeft size={16} />}
              >
                Previous
              </Button>

              <Group>
                {activeStep < steps.length - 1 ? (
                  <Button
                    onClick={nextStep}
                    rightSection={<IconArrowRight size={16} />}
                  >
                    Next Step
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    loading={isSubmitting}
                    leftSection={<IconDeviceFloppy size={16} />}
                  >
                    {isEditing ? 'Update Course' : 'Create Course'}
                  </Button>
                )}
              </Group>
            </Group>
          </form>

          {/* Summary Alert */}
          {Object.keys(form.errors).length > 0 && (
            <Alert icon={<IconAlertTriangle size={16} />} color="red" variant="light">
              <Text size="sm" fw={500} mb="xs">Please fix the following errors:</Text>
              <Text size="sm" component="ul" style={{ margin: 0, paddingLeft: 20 }}>
                {Object.entries(form.errors).map(([field, error]) => (
                  <li key={field}>{error}</li>
                ))}
              </Text>
            </Alert>
          )}
        </Stack>
      </Paper>
    </Container>
  )
}