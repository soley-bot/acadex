import { IconX, IconDeviceFloppy, IconLoader2, IconAlertCircle, IconBook, IconList } from '@tabler/icons-react'
import { useCourseFormPerformance } from '@/lib/adminPerformanceSystem'
import { useCourseForm } from './hooks/useCourseForm'
import { BasicInfoStep } from './steps/BasicInfoStep'
import type { CourseFormProps } from './types'
import { BaseModal } from '@/components/ui/BaseModal'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function CourseForm({ course, isOpen, onClose, onSuccess, embedded = false }: CourseFormProps) {
  const {
    formData,
    error,
    successMessage,
    activeTab,
    isLoading,
    isDirty,
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
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <Card className="p-4 border rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">
                {course ? 'Edit Course' : 'Create New Course'}
              </h2>
              <div className="flex gap-2 mt-2">
                {isDirty && <span className="text-orange-600 font-medium text-sm">● Unsaved changes</span>}
                {totalLessons > 0 && (
                  <>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {totalLessons} lessons
                    </Badge>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {Math.round(totalDurationMinutes / 60)}h {totalDurationMinutes % 60}m
                    </Badge>
                  </>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {!embedded && (
                <Button
                  variant="outline"
                  onClick={() => {
                    if (isDirty) {
                      const confirmed = window.confirm(
                        'You have unsaved changes. Are you sure you want to cancel? Your changes will be lost.'
                      );
                      if (!confirmed) return;
                    }
                    onClose();
                  }}
                >
                  <IconX className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              )}
              <Button
                onClick={handleSubmit}
                disabled={isLoading || hasValidationErrors || !isDirty}
                className={`${
                  isDirty && !hasValidationErrors && !isLoading
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : ''
                } disabled:opacity-50`}
              >
                {isLoading ? (
                  <IconLoader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : isDirty ? (
                  <IconDeviceFloppy className="w-4 h-4 mr-2" />
                ) : (
                  <span className="mr-2">✓</span>
                )}
                {course ? 'Update Course' : 'Create Course'}
              </Button>
            </div>
          </div>
        </Card>

        {/* Unsaved Changes Warning */}
        {isDirty && (
          <Alert className="border-orange-200 bg-orange-50">
            <div className="flex items-center justify-between w-full">
              <AlertDescription className="text-orange-800 font-medium">
                ⚠️ You have unsaved changes
              </AlertDescription>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={isLoading || hasValidationErrors}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                {isLoading ? 'Saving...' : 'Save Now'}
              </Button>
            </div>
          </Alert>
        )}

        {/* Error/Success Messages */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <IconAlertCircle className="w-4 h-4" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {successMessage && (
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">
              {successMessage}
            </AlertDescription>
          </Alert>
        )}

        {mutationError && (
          <Alert className="border-red-200 bg-red-50">
            <IconAlertCircle className="w-4 h-4" />
            <AlertDescription className="text-red-800">
              {mutationError.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Performance Alert */}
        {isSlowComponent && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <IconAlertCircle className="w-4 h-4" />
            <AlertDescription className="text-yellow-800">
              Performance warning: Form is responding slowly (Score: {performanceScore}/100)
            </AlertDescription>
          </Alert>
        )}

        {/* Form Tabs */}
        <div className="w-full">
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab('basic')}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm ${
                activeTab === 'basic'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <IconBook className="w-4 h-4" />
              Basic Info
            </button>
            <button
              onClick={() => setActiveTab('modules')}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm ${
                activeTab === 'modules'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <IconList className="w-4 h-4" />
              Modules & Lessons
            </button>
          </div>

          <div>
            {activeTab === 'basic' && (
              <BasicInfoStep
                formData={formData}
                onFieldChange={handleFieldChange}
                hasValidationErrors={hasValidationErrors}
              />
            )}

            {activeTab === 'modules' && (
              <Card className="p-8 border rounded-lg">
                <p className="text-gray-600">Module management coming soon...</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  if (embedded) {
    return content
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={course ? 'Edit Course' : 'Create New Course'}
    >
      {content}
    </BaseModal>
  )
}
