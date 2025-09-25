import React, { memo, useEffect, useRef } from 'react'
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

  // Update parent when form values change, but avoid infinite loops
  const prevConfigRef = useRef<typeof watchedValues>()
  useEffect(() => {
    // Only update if values actually changed
    if (!prevConfigRef.current || JSON.stringify(prevConfigRef.current) !== JSON.stringify(watchedValues)) {
      prevConfigRef.current = watchedValues
      onConfigUpdate(watchedValues)
    }
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
    <Card className="p-6 border rounded-lg">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center gap-2">
          <IconRobotFace size={20} className="text-purple-600" />
          <h3 className="text-lg font-semibold">AI Question Generation</h3>
        </div>

        <div className="flex flex-col gap-6">
          {/* Consolidated content section - topic and level in single row */}
          <Card className="border border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-700">Content Setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="topic">Topic/Subject</Label>
                  <Input
                    id="topic"
                    placeholder="e.g., Business English, Grammar"
                    {...form.register('topic')}
                    className={form.formState.errors.topic ? 'border-red-500' : ''}
                  />
                  {form.formState.errors.topic && (
                    <p className="text-xs text-red-600">{form.formState.errors.topic.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Target Level</Label>
                  <Select 
                    value={watchedValues.difficulty} 
                    onValueChange={(value) => form.setValue('difficulty', value as 'beginner' | 'intermediate' | 'advanced')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="customPrompt">Additional Context (Optional)</Label>
                <Textarea
                  id="customPrompt"
                  placeholder="Add specific instructions or context for question generation"
                  rows={2}
                  className="resize-none"
                  {...form.register('customPrompt')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Interactive question type grid - checkboxes with quantity selectors */}
          <Card className="border border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-700">Question Types & Quantity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {questionTypeOptions.map((option) => {
                  const isChecked = watchedValues.questionTypes?.includes(option.value) || false
                  return (
                    <div key={option.value} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={option.value}
                          checked={isChecked}
                          onCheckedChange={(checked) => handleQuestionTypeChange(option.value, checked as boolean)}
                        />
                        <Label htmlFor={option.value} className="text-sm cursor-pointer">
                          {option.label}
                        </Label>
                      </div>
                      <Select defaultValue="5" disabled={!isChecked}>
                        <SelectTrigger className="w-16 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                          <SelectItem value="5">5</SelectItem>
                          <SelectItem value="8">8</SelectItem>
                          <SelectItem value="10">10</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )
                })}
              </div>
              
              {/* Visual quantity feedback - real-time total count display */}
              <div className="text-center text-sm text-gray-600 bg-gray-50 p-2 rounded">
                Total: {Math.min(watchedValues.questionCount || 8, 20)} questions selected
              </div>
              
              {form.formState.errors.questionTypes && (
                <p className="text-xs text-red-600">{form.formState.errors.questionTypes.message}</p>
              )}
            </CardContent>
          </Card>

          {/* Compact difficulty sliders and language & style */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-gray-700">Difficulty Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Easy:</span>
                    <span>30%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Medium:</span>
                    <span>50%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '50%' }}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Hard:</span>
                    <span>20%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: '20%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-gray-700">Language & Style</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-xs">Language:</Label>
                  <Select 
                    value={watchedValues.language} 
                    onValueChange={(value) => form.setValue('language', value as 'english' | 'khmer')}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="khmer">Khmer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Style:</Label>
                  <Select defaultValue="academic">
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="academic">Academic</SelectItem>
                      <SelectItem value="conversational">Conversational</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Tone:</Label>
                  <Select defaultValue="formal">
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="neutral">Neutral</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Prominent generation button - clear call-to-action with icon */}
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <CardContent className="p-4">
              <Button
                size="lg"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium"
              >
                {isGenerating ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Generating Questions...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <IconRocket size={18} />
                    Generate {Math.min(watchedValues.questionCount || 8, 20)} Questions with AI 🚀
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Card>
  )
})

AIConfigurationStep.displayName = 'AIConfigurationStep'
