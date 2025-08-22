'use client'

import { useState, useEffect } from 'react'
import { Brain, Loader2, Settings, Eye, EyeOff } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface InlineAIQuizGeneratorProps {
  onQuizGenerated: (quiz: any) => void
  onCancel: () => void
}

interface QuizOptions {
  availableSubjects: string[]
  subjectTemplates: Record<string, any>
  supportedOptions: {
    teachingStyles: string[]
    complexityLevels: string[]
    assessmentTypes: string[]
    questionTypes: string[]
    bloomsLevels: string[]
  }
}

export function InlineAIQuizGenerator({ onQuizGenerated, onCancel }: InlineAIQuizGeneratorProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [options, setOptions] = useState<QuizOptions | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showPromptPreview, setShowPromptPreview] = useState(false)
  const [promptPreview, setPromptPreview] = useState<{ systemPrompt: string; prompt: string } | null>(null)

  const [formData, setFormData] = useState({
    // Basic fields
    topic: '',
    questionCount: 10,
    difficulty: 'beginner' as const,
    subject: '',
    
    // Enhanced fields
    category: '',
    customSystemPrompt: '',
    customInstructions: '',
    teachingStyle: '',
    focusAreas: [] as string[],
    questionTypes: [] as string[],
    includeExamples: false,
    realWorldApplications: false,
    complexityLevel: '',
    assessmentType: '',
    
    // Language options
    quizLanguage: 'english',
    explanationLanguage: 'english',
    includeTranslations: false,
    
    // Debug options
    includeDebugInfo: false
  })

  // Load options when component mounts
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await fetch('/api/admin/generate-enhanced-quiz')
        const result = await response.json()
        if (result.success) {
          setOptions(result)
          // Set default subject if available
          if (result.availableSubjects.length > 0 && !formData.subject) {
            setFormData(prev => ({ ...prev, subject: result.availableSubjects[0] }))
          }
        }
      } catch (error) {
        console.error('Failed to load quiz options:', error)
      }
    }

    fetchOptions()
  }, [formData.subject])

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const handleSubjectChange = (subject: string) => {
    updateFormData({ subject })
    
    // Auto-populate recommended question types for the subject
    if (options?.subjectTemplates[subject]) {
      const template = options.subjectTemplates[subject]
      updateFormData({
        subject,
        questionTypes: template.recommendedQuestionTypes,
        category: template.defaultCategory
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.topic.trim()) {
      setError('Please enter a topic for the quiz')
      return
    }

    if (!formData.subject.trim()) {
      setError('Please select a subject')
      return
    }

    if (formData.questionCount < 3 || formData.questionCount > 25) {
      setError('Question count must be between 3 and 25')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/generate-enhanced-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to generate quiz')
      }

      onQuizGenerated(result.quiz)
    } catch (err: any) {
      setError(err.message || 'Failed to generate quiz')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Brain className="h-6 w-6 text-primary" />
            Enhanced AI Quiz Generator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-destructive/5 border border-destructive/30 rounded-lg">
                <p className="text-destructive">{error}</p>
              </div>
            )}

            {/* Basic Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Basic Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Subject Selection */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Subject *
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => handleSubjectChange(e.target.value)}
                    className="w-full px-3 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-base bg-background text-foreground"
                    disabled={loading}
                    required
                  >
                    <option value="">Select a subject...</option>
                    {options?.availableSubjects.map(subject => (
                      <option key={subject} value={subject}>
                        {subject.charAt(0).toUpperCase() + subject.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Topic Input */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Topic *
                  </label>
                  <input
                    type="text"
                    value={formData.topic}
                    onChange={(e) => updateFormData({ topic: e.target.value })}
                    placeholder="e.g., Quadratic Equations, Cell Biology, World War II"
                    className="w-full px-3 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-base bg-background text-foreground"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => updateFormData({ category: e.target.value })}
                  placeholder="e.g., Mathematics, Science, History (auto-suggested from subject if left empty)"
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-base"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">Optional: Leave empty to auto-generate based on subject and topic</p>
              </div>

              {/* Question Count and Difficulty */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Questions
                  </label>
                  <select
                    value={formData.questionCount}
                    onChange={(e) => updateFormData({ questionCount: parseInt(e.target.value) })}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-base"
                    disabled={loading}
                  >
                    {[5, 10, 15, 20, 25].map(count => (
                      <option key={count} value={count}>{count} Questions</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty Level
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => updateFormData({ difficulty: e.target.value as any })}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-base"
                    disabled={loading}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Advanced Settings Toggle */}
            <div className="border-t pt-6">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-sm text-secondary hover:text-secondary/80 font-medium"
              >
                <Settings className="h-4 w-4" />
                Advanced Settings & Prompt Control
                {showAdvanced ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Advanced Settings */}
            {showAdvanced && (
              <Card variant="base" className="border-secondary/20 bg-secondary/5">
                <CardContent className="space-y-4 p-6">
                  <h4 className="font-medium text-secondary">Advanced Configuration</h4>
                  
                  {/* Teaching Style and Assessment Type */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Teaching Style
                      </label>
                      <select
                        value={formData.teachingStyle}
                        onChange={(e) => updateFormData({ teachingStyle: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="">Default</option>
                        {options?.supportedOptions.teachingStyles.map(style => (
                          <option key={style} value={style}>
                            {style.charAt(0).toUpperCase() + style.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Assessment Focus
                      </label>
                      <select
                        value={formData.assessmentType}
                        onChange={(e) => updateFormData({ assessmentType: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="">Default</option>
                        {options?.supportedOptions.assessmentTypes.map(type => (
                          <option key={type} value={type}>
                            {type.replace('_', ' ').charAt(0).toUpperCase() + type.replace('_', ' ').slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Question Types */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question Types
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {options?.supportedOptions.questionTypes.map(type => (
                        <label key={type} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.questionTypes.includes(type)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                updateFormData({ questionTypes: [...formData.questionTypes, type] })
                              } else {
                                updateFormData({ questionTypes: formData.questionTypes.filter(t => t !== type) })
                              }
                            }}
                            className="rounded"
                          />
                          <span className="text-sm">{type.replace('_', ' ')}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Content Options */}
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.includeExamples}
                        onChange={(e) => updateFormData({ includeExamples: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm">Include Examples</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.realWorldApplications}
                        onChange={(e) => updateFormData({ realWorldApplications: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm">Real-World Applications</span>
                    </label>
                  </div>

                  {/* Custom Instructions */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Custom Instructions
                    </label>
                    <textarea
                      value={formData.customInstructions}
                      onChange={(e) => updateFormData({ customInstructions: e.target.value })}
                      placeholder="Add specific instructions for the AI (e.g., 'Focus on practical applications', 'Include step-by-step solutions')"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      rows={3}
                    />
                  </div>

                  {/* Language Settings */}
                  <div className="border-t border-gray-200 pt-4">
                    <h5 className="font-medium text-gray-800 mb-3">Language Options</h5>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Quiz Language
                        </label>
                        <select
                          value={formData.quizLanguage}
                          onChange={(e) => updateFormData({ quizLanguage: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          <option value="english">English</option>
                          <option value="spanish">Spanish</option>
                          <option value="french">French</option>
                          <option value="german">German</option>
                          <option value="italian">Italian</option>
                          <option value="portuguese">Portuguese</option>
                          <option value="dutch">Dutch</option>
                          <option value="chinese">Chinese</option>
                          <option value="japanese">Japanese</option>
                          <option value="korean">Korean</option>
                          <option value="arabic">Arabic</option>
                          <option value="russian">Russian</option>
                          <option value="indonesian">Indonesian</option>
                          <option value="khmer">Khmer</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Explanation Language
                        </label>
                        <select
                          value={formData.explanationLanguage}
                          onChange={(e) => updateFormData({ explanationLanguage: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          <option value="english">English</option>
                          <option value="spanish">Spanish</option>
                          <option value="french">French</option>
                          <option value="german">German</option>
                          <option value="italian">Italian</option>
                          <option value="portuguese">Portuguese</option>
                          <option value="dutch">Dutch</option>
                          <option value="chinese">Chinese</option>
                          <option value="japanese">Japanese</option>
                          <option value="korean">Korean</option>
                          <option value="arabic">Arabic</option>
                          <option value="russian">Russian</option>
                          <option value="indonesian">Indonesian</option>
                          <option value="khmer">Khmer</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-3">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.includeTranslations}
                          onChange={(e) => updateFormData({ includeTranslations: e.target.checked })}
                          className="rounded"
                        />
                        <span className="text-sm">Include English translations for key terms</span>
                      </label>
                    </div>
                  </div>

                  {/* Custom System Prompt */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Custom System Prompt (Advanced)
                    </label>
                    <textarea
                      value={formData.customSystemPrompt}
                      onChange={(e) => updateFormData({ customSystemPrompt: e.target.value })}
                      placeholder="Override the entire system prompt for complete control..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Info Box */}
            <Card variant="base" className="border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Brain className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-primary">Enhanced AI Quiz Generation</h4>
                    <p className="text-sm text-primary/80 mt-1">
                      Generate quizzes for any subject with full control over prompts, question types, 
                      and teaching style. Advanced settings allow complete customization of the AI behavior.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !formData.topic.trim() || !formData.subject.trim()}
                className="px-6 py-3 bg-primary hover:bg-secondary text-white hover:text-black rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating Quiz...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4" />
                    Generate Enhanced Quiz
                  </>
                )}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
