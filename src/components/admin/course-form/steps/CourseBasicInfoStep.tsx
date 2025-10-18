import React, { memo, useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Book, User, Coins, X } from 'lucide-react'

const courseBasicInfoSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').min(1, 'Course title is required'),
  description: z.string().min(20, 'Description must be at least 20 characters').min(1, 'Course description is required'),
  instructor_name: z.string().min(1, 'Instructor name is required'),
  category: z.string().min(1, 'Please select a category'),
  level: z.string().min(1, 'Please select a difficulty level'),
  price: z.number().min(0, 'Price cannot be negative').optional(),
  estimated_duration: z.number().min(0).optional(),
  tags: z.array(z.string()),
  learning_outcomes: z.array(z.string())
})

type CourseBasicInfo = z.infer<typeof courseBasicInfoSchema>

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
  const [tagInput, setTagInput] = useState('')
  const [outcomeInput, setOutcomeInput] = useState('')

  const form = useForm<CourseBasicInfo>({
    resolver: zodResolver(courseBasicInfoSchema),
    defaultValues: {
      ...initialData,
      tags: initialData.tags || [],
      learning_outcomes: initialData.learning_outcomes || []
    },
    mode: 'onChange'
  })

  const watchedValues = form.watch()

  useEffect(() => {
    if (form.formState.isValid) {
      onChange(watchedValues)
    }
  }, [watchedValues, form.formState.isValid, onChange])

  const handleTagAdd = () => {
    const tag = tagInput.trim()
    if (tag && !watchedValues.tags.includes(tag)) {
      const newTags = [...watchedValues.tags, tag]
      form.setValue('tags', newTags)
      setTagInput('')
    }
  }

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleTagAdd()
    }
  }

  const handleTagRemove = (tagToRemove: string) => {
    const newTags = watchedValues.tags.filter(tag => tag !== tagToRemove)
    form.setValue('tags', newTags)
  }

  const handleOutcomeAdd = () => {
    const outcome = outcomeInput.trim()
    if (outcome && !watchedValues.learning_outcomes.includes(outcome)) {
      const newOutcomes = [...watchedValues.learning_outcomes, outcome]
      form.setValue('learning_outcomes', newOutcomes)
      setOutcomeInput('')
    }
  }

  const handleOutcomeKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleOutcomeAdd()
    }
  }

  const handleOutcomeRemove = (outcomeToRemove: string) => {
    const newOutcomes = watchedValues.learning_outcomes.filter(outcome => outcome !== outcomeToRemove)
    form.setValue('learning_outcomes', newOutcomes)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Book size={20} className="text-blue-600" />
          Course Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Course Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Course Title *</Label>
            <Input
              id="title"
              placeholder="Enter course title"
              {...form.register('title')}
            />
            {form.formState.errors.title && (
              <p className="text-sm text-red-600">{form.formState.errors.title.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="instructor_name">Instructor Name *</Label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                id="instructor_name"
                placeholder="Enter instructor name"
                className="pl-9"
                {...form.register('instructor_name')}
              />
            </div>
            {form.formState.errors.instructor_name && (
              <p className="text-sm text-red-600">{form.formState.errors.instructor_name.message}</p>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Course Description *</Label>
          <Textarea
            id="description"
            placeholder="Enter detailed course description"
            rows={4}
            {...form.register('description')}
          />
          {form.formState.errors.description && (
            <p className="text-sm text-red-600">{form.formState.errors.description.message}</p>
          )}
        </div>

        {/* Category and Level */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Category *</Label>
            <Select 
              value={watchedValues.category} 
              onValueChange={(value) => form.setValue('category', value)}
            >
              <SelectTrigger>
                <SelectValue>Select category</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.category && (
              <p className="text-sm text-red-600">{form.formState.errors.category.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Difficulty Level *</Label>
            <Select 
              value={watchedValues.level} 
              onValueChange={(value) => form.setValue('level', value)}
            >
              <SelectTrigger>
                <SelectValue>Select level</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {levels.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.level && (
              <p className="text-sm text-red-600">{form.formState.errors.level.message}</p>
            )}
          </div>
        </div>

        {/* Price and Duration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Price (USD)</Label>
            <div className="relative">
              <Coin size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                id="price"
                type="number"
                placeholder="0.00"
                step="0.01"
                min="0"
                className="pl-9"
                {...form.register('price', { valueAsNumber: true })}
              />
            </div>
            <p className="text-sm text-gray-600">Leave empty for free course</p>
            {form.formState.errors.price && (
              <p className="text-sm text-red-600">{form.formState.errors.price.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="estimated_duration">Estimated Duration (hours)</Label>
            <Input
              id="estimated_duration"
              type="number"
              placeholder="0"
              step="0.5"
              min="0"
              {...form.register('estimated_duration', { valueAsNumber: true })}
            />
            <p className="text-sm text-gray-600">Total estimated time to complete</p>
          </div>
        </div>

        {/* Tags Section */}
        <div className="space-y-3">
          <Label>Course Tags</Label>
          <div className="flex flex-wrap gap-2 mb-3">
            {watchedValues.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {tag}
                <button
                  type="button"
                  onClick={() => handleTagRemove(tag)}
                  className="ml-1 hover:text-red-600"
                >
                  <X size={12} />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Add tags (press Enter)"
              onKeyDown={handleTagKeyDown}
            />
            <Button type="button" onClick={handleTagAdd} variant="outline">
              Add
            </Button>
          </div>
          <p className="text-sm text-gray-600">Add tags that help students find your course</p>
        </div>

        {/* Learning Outcomes Section */}
        <div className="space-y-3">
          <Label>Learning Outcomes</Label>
          <div className="space-y-2 mb-3">
            {watchedValues.learning_outcomes.map((outcome, index) => (
              <div key={index} className="flex items-start justify-between gap-3 p-2 bg-gray-50 rounded-md">
                <span className="text-sm flex-1">• {outcome}</span>
                <button
                  type="button"
                  onClick={() => handleOutcomeRemove(outcome)}
                  className="text-red-500 hover:text-red-700 mt-0.5"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={outcomeInput}
              onChange={(e) => setOutcomeInput(e.target.value)}
              placeholder="Add learning outcome (press Enter)"
              onKeyDown={handleOutcomeKeyDown}
            />
            <Button type="button" onClick={handleOutcomeAdd} variant="outline">
              Add
            </Button>
          </div>
          <p className="text-sm text-gray-600">What will students learn from this course?</p>
        </div>

        {/* Course Stats */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Total Tags</p>
                <p className="text-sm font-medium mt-1">{watchedValues.tags.length}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Learning Outcomes</p>
                <p className="text-sm font-medium mt-1">{watchedValues.learning_outcomes.length}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Price</p>
                <p className="text-sm font-medium mt-1">
                  {watchedValues.price ? `$${watchedValues.price.toFixed(2)}` : 'Free'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
})

CourseBasicInfoStep.displayName = 'CourseBasicInfoStep'
