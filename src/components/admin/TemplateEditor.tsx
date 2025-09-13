import React, { useState, useEffect } from 'react'
import { Save, X, Eye, Settings, Tag, Globe, Lock, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { useCreateTemplate, useUpdateTemplate } from '@/hooks/useTemplates'
import { useToast } from '@/hooks/use-toast'
import type { QuestionTemplate, CreateTemplateRequest, UpdateTemplateRequest, TemplateData } from '@/types/templates'

interface TemplateEditorProps {
  template?: QuestionTemplate | null
  onSave?: (template: QuestionTemplate) => void
  onCancel?: () => void
  isOpen?: boolean
}

// Default template data based on question type
const getDefaultTemplateData = (questionType: string): TemplateData => {
  switch (questionType) {
    case 'multiple_choice':
      return {
        question: 'What is the correct answer?',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correct_answer: 0,
        explanation: 'This is the correct answer because...',
        points: 1,
        time_limit: null,
        randomize_options: true,
        partial_credit: false
      }

    case 'fill_blank':
      return {
        question: 'Fill in the blank: The weather is _____ today.',
        correct_answers: ['nice', 'good', 'pleasant'],
        case_sensitive: false,
        explanation: 'Common adjectives to describe pleasant weather.',
        points: 1,
        time_limit: null
      }

    case 'true_false':
      return {
        question: 'This statement is correct.',
        correct_answer: true,
        explanation: 'This statement is true because...',
        points: 1,
        time_limit: null
      }

    case 'essay':
      return {
        question: 'Discuss your thoughts on this topic.',
        sample_answer: 'A good response should include...',
        word_limit: 500,
        rubric: [
          { criteria: 'Content', points: 5 },
          { criteria: 'Organization', points: 3 },
          { criteria: 'Language Use', points: 2 }
        ],
        points: 10,
        time_limit: 1800 // 30 minutes
      }

    case 'matching':
      return {
        question: 'Match the items with their correct pairs.',
        pairs: [
          { left: 'Apple', right: 'Fruit' },
          { left: 'Carrot', right: 'Vegetable' },
          { left: 'Rose', right: 'Flower' }
        ],
        explanation: 'Match each item with its category.',
        points: 3,
        time_limit: null
      }

    default:
      return {
        question: '',
        points: 1,
        time_limit: null
      }
  }
}

export function TemplateEditor({ template, onSave, onCancel, isOpen = true }: TemplateEditorProps) {
  const { toast } = useToast()
  const createTemplateMutation = useCreateTemplate()
  const updateTemplateMutation = useUpdateTemplate()

  // Form state
  const [formData, setFormData] = useState<CreateTemplateRequest>({
    title: '',
    description: '',
    category: 'grammar',
    question_type: 'multiple_choice',
    difficulty_level: 'medium',
    template_data: getDefaultTemplateData('multiple_choice'),
    language: 'english',
    subject_area: '',
    tags: [],
    is_public: false
  })

  const [tagInput, setTagInput] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Initialize form data when template prop changes
  useEffect(() => {
    if (template) {
      setFormData({
        title: template.title,
        description: template.description || '',
        category: template.category,
        question_type: template.question_type,
        difficulty_level: template.difficulty_level || 'medium',
        template_data: template.template_data,
        language: template.language,
        subject_area: template.subject_area || '',
        tags: template.tags || [],
        is_public: template.is_public
      })
    } else {
      // Reset form for new template
      setFormData({
        title: '',
        description: '',
        category: 'grammar',
        question_type: 'multiple_choice',
        difficulty_level: 'medium',
        template_data: getDefaultTemplateData('multiple_choice'),
        language: 'english',
        subject_area: '',
        tags: [],
        is_public: false
      })
    }
  }, [template])

  // Handle question type change
  const handleQuestionTypeChange = (questionType: string) => {
    setFormData(prev => ({
      ...prev,
      question_type: questionType as any,
      template_data: getDefaultTemplateData(questionType)
    }))
  }

  // Handle template data changes
  const updateTemplateData = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      template_data: {
        ...prev.template_data,
        [key]: value
      }
    }))
  }

  // Handle tag management
  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  // Validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (!formData.category) {
      newErrors.category = 'Category is required'
    }

    if (!formData.template_data.question?.toString().trim()) {
      newErrors.question = 'Question is required'
    }

    // Question type specific validation
    if (formData.question_type === 'multiple_choice') {
      const mcData = formData.template_data as any
      if (!mcData.options || mcData.options.length < 2) {
        newErrors.options = 'At least 2 options are required'
      }
    }

    if (formData.question_type === 'fill_blank') {
      const fbData = formData.template_data as any
      if (!fbData.correct_answers || fbData.correct_answers.length === 0) {
        newErrors.correct_answers = 'At least one correct answer is required'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle save
  const handleSave = async () => {
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors before saving',
        variant: 'destructive'
      })
      return
    }

    try {
      let result

      if (template) {
        // Update existing template
        result = await updateTemplateMutation.mutateAsync({
          templateId: template.id,
          data: formData as UpdateTemplateRequest
        })
      } else {
        // Create new template
        result = await createTemplateMutation.mutateAsync(formData)
      }

      toast({
        title: template ? 'Template Updated' : 'Template Created',
        description: `"${formData.title}" has been ${template ? 'updated' : 'created'} successfully`
      })

      if (onSave) {
        onSave(result.data)
      }
    } catch (error) {
      toast({
        title: template ? 'Failed to Update Template' : 'Failed to Create Template',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive'
      })
    }
  }

  // Render question type specific fields
  const renderQuestionTypeFields = () => {
    const data = formData.template_data as any

    switch (formData.question_type) {
      case 'multiple_choice':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Question</label>
              <Textarea
                value={data.question || ''}
                onChange={(e) => updateTemplateData('question', e.target.value)}
                placeholder="Enter the question..."
                className={errors.question ? 'border-red-500' : ''}
              />
              {errors.question && <p className="text-red-500 text-sm mt-1">{errors.question}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Options</label>
              <div className="space-y-2">
                {(data.options || []).map((option: string, index: number) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...(data.options || [])]
                        newOptions[index] = e.target.value
                        updateTemplateData('options', newOptions)
                      }}
                      placeholder={`Option ${index + 1}`}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newOptions = (data.options || []).filter((_: any, i: number) => i !== index)
                        updateTemplateData('options', newOptions)
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => updateTemplateData('options', [...(data.options || []), `Option ${(data.options || []).length + 1}`])}
                >
                  Add Option
                </Button>
              </div>
              {errors.options && <p className="text-red-500 text-sm mt-1">{errors.options}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Correct Answer (Index)</label>
              <select
                value={data.correct_answer || 0}
                onChange={(e) => updateTemplateData('correct_answer', parseInt(e.target.value))}
                className="w-full p-2 border border-input rounded-md"
              >
                {(data.options || []).map((_: any, index: number) => (
                  <option key={index} value={index}>Option {index + 1}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Randomize Options</label>
                <Switch
                  checked={data.randomize_options || false}
                  onCheckedChange={(checked) => updateTemplateData('randomize_options', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Partial Credit</label>
                <Switch
                  checked={data.partial_credit || false}
                  onCheckedChange={(checked) => updateTemplateData('partial_credit', checked)}
                />
              </div>
            </div>
          </div>
        )

      case 'fill_blank':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Question with Blanks</label>
              <Textarea
                value={data.question || ''}
                onChange={(e) => updateTemplateData('question', e.target.value)}
                placeholder="Use _____ for blanks"
                className={errors.question ? 'border-red-500' : ''}
              />
              {errors.question && <p className="text-red-500 text-sm mt-1">{errors.question}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Correct Answers (comma-separated)</label>
              <Input
                value={(data.correct_answers || []).join(', ')}
                onChange={(e) => updateTemplateData('correct_answers', e.target.value.split(',').map((s: string) => s.trim()))}
                placeholder="answer1, answer2, answer3"
                className={errors.correct_answers ? 'border-red-500' : ''}
              />
              {errors.correct_answers && <p className="text-red-500 text-sm mt-1">{errors.correct_answers}</p>}
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Case Sensitive</label>
              <Switch
                checked={data.case_sensitive || false}
                onCheckedChange={(checked) => updateTemplateData('case_sensitive', checked)}
              />
            </div>
          </div>
        )

      case 'true_false':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Statement</label>
              <Textarea
                value={data.question || ''}
                onChange={(e) => updateTemplateData('question', e.target.value)}
                placeholder="Enter the statement to evaluate..."
                className={errors.question ? 'border-red-500' : ''}
              />
              {errors.question && <p className="text-red-500 text-sm mt-1">{errors.question}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Correct Answer</label>
              <select
                value={data.correct_answer?.toString() || 'true'}
                onChange={(e) => updateTemplateData('correct_answer', e.target.value === 'true')}
                className="w-full p-2 border border-input rounded-md"
              >
                <option value="true">True</option>
                <option value="false">False</option>
              </select>
            </div>
          </div>
        )

      case 'essay':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Essay Question</label>
              <Textarea
                value={data.question || ''}
                onChange={(e) => updateTemplateData('question', e.target.value)}
                placeholder="Enter the essay prompt..."
                className={errors.question ? 'border-red-500' : ''}
              />
              {errors.question && <p className="text-red-500 text-sm mt-1">{errors.question}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Sample Answer</label>
              <Textarea
                value={data.sample_answer || ''}
                onChange={(e) => updateTemplateData('sample_answer', e.target.value)}
                placeholder="Provide a sample answer or key points..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Word Limit</label>
              <Input
                type="number"
                value={data.word_limit || ''}
                onChange={(e) => updateTemplateData('word_limit', parseInt(e.target.value) || null)}
                placeholder="Maximum words (optional)"
              />
            </div>
          </div>
        )

      case 'matching':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Instructions</label>
              <Textarea
                value={data.question || ''}
                onChange={(e) => updateTemplateData('question', e.target.value)}
                placeholder="Instructions for the matching exercise..."
                className={errors.question ? 'border-red-500' : ''}
              />
              {errors.question && <p className="text-red-500 text-sm mt-1">{errors.question}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Matching Pairs</label>
              <div className="space-y-2">
                {(data.pairs || []).map((pair: any, index: number) => (
                  <div key={index} className="grid grid-cols-2 gap-2">
                    <Input
                      value={pair.left}
                      onChange={(e) => {
                        const newPairs = [...(data.pairs || [])]
                        newPairs[index] = { ...pair, left: e.target.value }
                        updateTemplateData('pairs', newPairs)
                      }}
                      placeholder="Left item"
                    />
                    <div className="flex gap-2">
                      <Input
                        value={pair.right}
                        onChange={(e) => {
                          const newPairs = [...(data.pairs || [])]
                          newPairs[index] = { ...pair, right: e.target.value }
                          updateTemplateData('pairs', newPairs)
                        }}
                        placeholder="Right item"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newPairs = (data.pairs || []).filter((_: any, i: number) => i !== index)
                          updateTemplateData('pairs', newPairs)
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => updateTemplateData('pairs', [...(data.pairs || []), { left: '', right: '' }])}
                >
                  Add Pair
                </Button>
              </div>
            </div>
          </div>
        )

      default:
        return (
          <div>
            <label className="block text-sm font-medium mb-2">Question</label>
            <Textarea
              value={data.question || ''}
              onChange={(e) => updateTemplateData('question', e.target.value)}
              placeholder="Enter the question..."
              className={errors.question ? 'border-red-500' : ''}
            />
            {errors.question && <p className="text-red-500 text-sm mt-1">{errors.question}</p>}
          </div>
        )
    }
  }

  if (!isOpen) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {template ? 'Edit Template' : 'Create New Template'}
          </h2>
          <p className="text-muted-foreground">
            {template ? 'Modify your existing template' : 'Design a reusable question pattern'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {showPreview ? 'Hide' : 'Show'} Preview
          </Button>
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button
            onClick={handleSave}
            disabled={createTemplateMutation.isPending || updateTemplateMutation.isPending}
            className="bg-primary hover:bg-secondary text-white hover:text-black"
          >
            <Save className="h-4 w-4 mr-2" />
            {template ? 'Update' : 'Create'} Template
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Editor Panel */}
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Template title"
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe when to use this template..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full p-2 border border-input rounded-md"
                  >
                    <option value="grammar">Grammar</option>
                    <option value="vocabulary">Vocabulary</option>
                    <option value="reading">Reading</option>
                    <option value="listening">Listening</option>
                    <option value="writing">Writing</option>
                    <option value="speaking">Speaking</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Question Type *</label>
                  <select
                    value={formData.question_type}
                    onChange={(e) => handleQuestionTypeChange(e.target.value)}
                    className="w-full p-2 border border-input rounded-md"
                  >
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="fill_blank">Fill in the Blank</option>
                    <option value="true_false">True/False</option>
                    <option value="essay">Essay</option>
                    <option value="matching">Matching</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Difficulty</label>
                  <select
                    value={formData.difficulty_level}
                    onChange={(e) => setFormData(prev => ({ ...prev, difficulty_level: e.target.value as any }))}
                    className="w-full p-2 border border-input rounded-md"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Language</label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
                    className="w-full p-2 border border-input rounded-md"
                  >
                    <option value="english">English</option>
                    <option value="khmer">Khmer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Subject Area</label>
                <Input
                  value={formData.subject_area}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject_area: e.target.value }))}
                  placeholder="e.g., IELTS, TOEFL, General English"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium mb-2">Tags</label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Add a tag"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addTag()
                        }
                      }}
                    />
                    <Button type="button" variant="outline" onClick={addTag}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Settings */}
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <label className="text-sm font-medium">Public Template</label>
                  </div>
                  <Switch
                    checked={formData.is_public}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_public: checked }))}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Public templates can be used by other instructors
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Question Content */}
          <Card>
            <CardHeader>
              <CardTitle>Question Content</CardTitle>
            </CardHeader>
            <CardContent>
              {renderQuestionTypeFields()}

              <Separator className="my-4" />

              {/* Common fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Points</label>
                  <Input
                    type="number"
                    value={formData.template_data.points || ''}
                    onChange={(e) => updateTemplateData('points', parseInt(e.target.value) || 1)}
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Time Limit (seconds)</label>
                  <Input
                    type="number"
                    value={formData.template_data.time_limit || ''}
                    onChange={(e) => updateTemplateData('time_limit', parseInt(e.target.value) || null)}
                    placeholder="No limit"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Explanation</label>
                <Textarea
                  value={(formData.template_data as any).explanation || ''}
                  onChange={(e) => updateTemplateData('explanation', e.target.value)}
                  placeholder="Explain why this is the correct answer..."
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Template Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Template header */}
                  <div className="p-4 bg-muted rounded-lg">
                    <h3 className="font-semibold text-lg mb-1">{formData.title || 'Untitled Template'}</h3>
                    {formData.description && (
                      <p className="text-sm text-muted-foreground mb-3">{formData.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{formData.category}</Badge>
                      <Badge variant="outline">{formData.question_type.replace('_', ' ')}</Badge>
                      <Badge variant="outline">{formData.difficulty_level}</Badge>
                      {formData.is_public ? (
                        <Badge variant="outline" className="text-green-700 border-green-300">
                          <Globe className="h-3 w-3 mr-1" />
                          Public
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-700 border-gray-300">
                          <Lock className="h-3 w-3 mr-1" />
                          Private
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Question preview */}
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Question Preview:</h4>
                    <div className="text-sm">
                      {formData.template_data.question ? (
                        <p className="mb-3">{formData.template_data.question}</p>
                      ) : (
                        <p className="text-muted-foreground italic">No question text</p>
                      )}

                      {/* Question type specific preview */}
                      {formData.question_type === 'multiple_choice' && (formData.template_data as any).options && (
                        <div className="space-y-1">
                          {((formData.template_data as any).options || []).map((option: string, index: number) => (
                            <div key={index} className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full border flex items-center justify-center text-xs">
                                {String.fromCharCode(65 + index)}
                              </span>
                              <span>{option}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {formData.question_type === 'fill_blank' && (
                        <p className="text-xs text-muted-foreground">
                          Accepts: {((formData.template_data as any).correct_answers || []).join(', ')}
                        </p>
                      )}

                      {formData.question_type === 'true_false' && (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full border flex items-center justify-center text-xs">
                              T
                            </span>
                            <span>True</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full border flex items-center justify-center text-xs">
                              F
                            </span>
                            <span>False</span>
                          </div>
                        </div>
                      )}

                      {formData.question_type === 'matching' && (formData.template_data as any).pairs && (
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <strong>Left Items:</strong>
                            {((formData.template_data as any).pairs || []).map((pair: any, index: number) => (
                              <div key={index}>{pair.left}</div>
                            ))}
                          </div>
                          <div>
                            <strong>Right Items:</strong>
                            {((formData.template_data as any).pairs || []).map((pair: any, index: number) => (
                              <div key={index}>{pair.right}</div>
                            ))}
                          </div>
                        </div>
                      )}

                      {formData.template_data.points && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Points: {formData.template_data.points}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Tags preview */}
                  {formData.tags.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2 text-sm">Tags:</h4>
                      <div className="flex flex-wrap gap-1">
                        {formData.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

export default TemplateEditor