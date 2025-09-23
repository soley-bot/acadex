import React, { memo, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { IconRocket, IconRobotFace, IconAlertTriangle } from '@tabler/icons-react'

const aiConfigSchema = z.object({
  topic: z.string().min(3, 'Topic must be at least 3 characters').min(1, 'Topic is required'),
  subject: z.string().optional(),
  questionCount: z.number().min(1).max(20),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  language: z.enum(['english', 'khmer']),
  questionTypes: z.array(z.string()).min(1, 'Please select at least one question type'),
  customPrompt: z.string().optional()
})

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

type FormValues = z.infer<typeof aiConfigSchema>

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
  
  const form = useForm<FormValues>({
    resolver: zodResolver(aiConfigSchema),
    defaultValues: {
      topic: aiConfig.topic,
      subject: aiConfig.subject || '',
      questionCount: aiConfig.questionCount,
      difficulty: aiConfig.difficulty,
      language: aiConfig.language,
      questionTypes: aiConfig.questionTypes,
      customPrompt: aiConfig.customPrompt || ''
    },
    mode: 'onChange'
  })

  const watchedValues = form.watch()

  useEffect(() => {
    // Update parent state whenever form values change
    onConfigUpdate(watchedValues)
  }, [watchedValues, onConfigUpdate])

  const handleGenerate = () => {
    if (form.formState.isValid) {
      onGenerateQuestions()
    } else {
      toast({
        title: 'Validation Error',
        description: 'Please fix the form errors before generating questions',
        variant: 'destructive'
      })
    }
  }

  const handleQuestionTypeChange = (questionType: string, checked: boolean) => {
    const currentTypes = watchedValues.questionTypes || []
    if (checked) {
      form.setValue('questionTypes', [...currentTypes, questionType])
    } else {
      form.setValue('questionTypes', currentTypes.filter(type => type !== questionType))
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">AI Configuration</h2>
        <p className="text-gray-600">
          Configure your AI quiz generation settings
        </p>
      </div>

      {/* Main Form Card */}
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-700">
            <IconRobotFace size={20} />
            AI Generation Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Topic & Subject Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Topic *</Label>
              <Input
                id="topic"
                placeholder="e.g., Business English, Grammar, Reading"
                {...form.register('topic')}
              />
              {form.formState.errors.topic && (
                <p className="text-sm text-red-600">{form.formState.errors.topic.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="e.g., English, Mathematics, Science"
                {...form.register('subject')}
              />
            </div>
          </div>

          {/* Question Count & Difficulty Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="questionCount">Question Count</Label>
              <Input
                id="questionCount"
                type="number"
                min="1"
                max="20"
                {...form.register('questionCount', { valueAsNumber: true })}
              />
              {form.formState.errors.questionCount && (
                <p className="text-sm text-red-600">{form.formState.errors.questionCount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select 
                value={watchedValues.difficulty} 
                onValueChange={(value) => form.setValue('difficulty', value as 'beginner' | 'intermediate' | 'advanced')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.difficulty && (
                <p className="text-sm text-red-600">{form.formState.errors.difficulty.message}</p>
              )}
            </div>
          </div>

          {/* Language */}
          <div className="space-y-2">
            <Label>Language</Label>
            <Select 
              value={watchedValues.language} 
              onValueChange={(value) => form.setValue('language', value as 'english' | 'khmer')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="khmer">Khmer</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.language && (
              <p className="text-sm text-red-600">{form.formState.errors.language.message}</p>
            )}
          </div>

          {/* Question Types */}
          <div className="space-y-3">
            <Label>Question Types to Generate *</Label>
            <div className="space-y-3">
              {questionTypeOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.value}
                    checked={watchedValues.questionTypes?.includes(option.value) || false}
                    onCheckedChange={(checked) => handleQuestionTypeChange(option.value, !!checked)}
                  />
                  <Label htmlFor={option.value} className="text-sm font-normal">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-600">
              Select one or more question types. At least one type must be selected.
            </p>
            {form.formState.errors.questionTypes && (
              <p className="text-sm text-red-600">{form.formState.errors.questionTypes.message}</p>
            )}
          </div>

          {/* Custom Instructions */}
          <div className="space-y-2">
            <Label htmlFor="customPrompt">Custom Instructions (Optional)</Label>
            <Textarea
              id="customPrompt"
              placeholder="e.g., Focus on business scenarios, include academic vocabulary, test specific skills..."
              rows={3}
              {...form.register('customPrompt')}
            />
          </div>

          {/* Generate Button */}
          <div className="flex justify-center pt-4">
            <Button
              size="lg"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isGenerating ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Generating Questions...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <IconRocket size={18} />
                  Generate AI Questions
                </div>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
})

AIConfigurationStep.displayName = 'AIConfigurationStep'