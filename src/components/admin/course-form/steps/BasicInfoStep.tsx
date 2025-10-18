import { Plus, Trash2 } from 'lucide-react'
import { categories, levels } from '@/lib/courseConstants'
import { ImageUpload } from '@/components/ui/ImageUpload'
import type { EnhancedCourseData } from '../types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'

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
    <div className="max-w-2xl mx-auto">
      <div className="flex flex-col gap-6">
        <Card className="p-8 border rounded-lg">
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-bold">Basic Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course Title <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Enter course title"
                value={formData.title}
                onChange={(e) => onFieldChange('title', e.target.value)}
                className={!formData.title.trim() && hasValidationErrors ? 'border-red-500' : ''}
              />
              {!formData.title.trim() && hasValidationErrors && (
                <p className="text-red-500 text-sm mt-1">Title is required</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course Description <span className="text-red-500">*</span>
              </label>
              <Textarea
                placeholder="Describe your course"
                rows={4}
                value={formData.description}
                onChange={(e) => onFieldChange('description', e.target.value)}
                className={!formData.description.trim() && hasValidationErrors ? 'border-red-500' : ''}
              />
              {!formData.description.trim() && hasValidationErrors && (
                <p className="text-red-500 text-sm mt-1">Description is required</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instructor Name <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Your name"
                value={formData.instructor_name}
                onChange={(e) => onFieldChange('instructor_name', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => onFieldChange('category', e.target.value)}
                  className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    !formData.category && hasValidationErrors ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {!formData.category && hasValidationErrors && (
                  <p className="text-red-500 text-sm mt-1">Category is required</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Level <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.level}
                  onChange={(e) => onFieldChange('level', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select level</option>
                  {levels.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price ($)
                </label>
                <Input
                  type="number"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => onFieldChange('price', parseFloat(e.target.value) || 0)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration
                </label>
                <Input
                  placeholder="e.g., 8 weeks"
                  value={formData.duration}
                  onChange={(e) => onFieldChange('duration', e.target.value)}
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-8 border rounded-lg">
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-bold">Course Image</h3>
            <ImageUpload
              value={formData.image_url}
              onChange={(url) => onFieldChange('image_url', url || '')}
              context="course"
            />
          </div>
        </Card>

        <Card className="p-8 border rounded-lg">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold">Learning Objectives</h3>
              <Button variant="outline" size="sm" onClick={addLearningObjective}>
                <Plus className="w-4 h-4 mr-2" />
                Add Objective
              </Button>
            </div>

            <div className="flex flex-col gap-3">
              {formData.learning_objectives.map((objective, index) => (
                <div key={index} className="flex items-end gap-2">
                  <div className="flex-1">
                    <Input
                      placeholder={`Learning objective ${index + 1}`}
                      value={objective}
                      onChange={(e) => updateLearningObjective(index, e.target.value)}
                    />
                  </div>
                  {formData.learning_objectives.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-300 hover:bg-red-50"
                      onClick={() => removeLearningObjective(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-8 border rounded-lg">
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-bold">Publishing</h3>
            <div className="flex items-center space-x-2">
              <Switch
                id="publish-course"
                checked={formData.is_published}
                onCheckedChange={(checked) => onFieldChange('is_published', checked)}
              />
              <div>
                <label htmlFor="publish-course" className="text-sm font-medium cursor-pointer">
                  Publish course
                </label>
                <p className="text-sm text-gray-500">Make this course available to students</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
