import React, { useState, useCallback } from 'react'
import { Wand2, Settings, ChevronDown, ChevronUp } from 'lucide-react'
import { useQuizBuilderState, QuizBuilderState } from '@/contexts/QuizBuilderContext'
import { useAIGeneration } from '@/hooks/useAIGeneration'
import { EnhancedQuizGenerationRequest } from '@/lib/enhanced-ai-services'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface AIConfigurationStepProps {
  onComplete?: () => void
  initialConfig?: Partial<EnhancedQuizGenerationRequest>
}

export const AIConfigurationStep: React.FC<AIConfigurationStepProps> = ({
  onComplete,
  initialConfig = {}
}) => {
  const { transitionTo, updateData } = useQuizBuilderState()
  const { generateQuiz, isGenerating } = useAIGeneration()
  
  const [config, setConfig] = useState<EnhancedQuizGenerationRequest>({
    subject: '',
    topic: '',
    questionCount: 10,
    difficulty: 'intermediate',
    quizLanguage: 'english',
    questionTypes: ['multiple_choice'],
    ...initialConfig
  })
  
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const updateConfig = useCallback((updates: Partial<EnhancedQuizGenerationRequest>) => {
    setConfig(prev => ({ ...prev, ...updates }))
    setValidationErrors([]) // Clear errors on change
  }, [])

  const validateConfig = useCallback((): string[] => {
    const errors: string[] = []
    
    if (!config.topic.trim()) errors.push('Topic is required')
    if (!config.subject.trim()) errors.push('Subject is required')
    if (config.questionCount < 1) errors.push('At least 1 question is required')
    if (config.questionCount > 50) errors.push('Maximum 50 questions allowed')
    
    return errors
  }, [config])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    const errors = validateConfig()
    if (errors.length > 0) {
      setValidationErrors(errors)
      return
    }

    try {
      transitionTo(QuizBuilderState.GENERATING)
      updateData({ generationConfig: config })
      
      const result = await generateQuiz(config)
      
      updateData({ 
        questions: result.questions,
        lastGenerated: new Date()
      })
      
      transitionTo(QuizBuilderState.EDITING)
      onComplete?.()
      
    } catch (error: any) {
      transitionTo(QuizBuilderState.ERROR, { 
        error: error.message || 'Failed to generate quiz' 
      })
    }
  }, [config, validateConfig, transitionTo, updateData, generateQuiz, onComplete])

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="h-6 w-6 text-primary" />
          <span>AI Quiz Configuration</span>
        </CardTitle>
        <p className="text-gray-600">
          Configure your AI-generated quiz with advanced customization options
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-red-800 font-medium mb-2">Please fix the following errors:</div>
              <ul className="text-red-700 text-sm space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Basic Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject *
              </label>
              <input
                type="text"
                value={config.subject}
                onChange={(e) => updateConfig({ subject: e.target.value })}
                placeholder="e.g., English Grammar, Mathematics"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topic *
              </label>
              <input
                type="text"
                value={config.topic}
                onChange={(e) => updateConfig({ topic: e.target.value })}
                placeholder="e.g., Present Perfect Tense, Algebra Basics"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Questions
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={config.questionCount}
                onChange={(e) => updateConfig({ questionCount: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level
              </label>
              <select
                value={config.difficulty}
                onChange={(e) => updateConfig({ difficulty: e.target.value as 'beginner' | 'intermediate' | 'advanced' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          {/* Advanced Configuration Toggle */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center space-x-2 text-primary hover:text-secondary transition-colors"
          >
            {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            <span className="text-sm font-medium">
              {showAdvanced ? 'Hide' : 'Show'} Advanced Options
            </span>
          </button>

          {/* Advanced Configuration */}
          {showAdvanced && (
            <div className="border border-gray-200 rounded-lg p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quiz Language
                  </label>
                  <select
                    value={config.quizLanguage}
                    onChange={(e) => updateConfig({ quizLanguage: e.target.value as 'english' | 'khmer' | 'spanish' | 'french' | 'arabic' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="english">English</option>
                    <option value="khmer">Khmer</option>
                    <option value="spanish">Spanish</option>
                    <option value="french">French</option>
                    <option value="arabic">Arabic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question Types
                  </label>
                  <div className="space-y-2">
                    {(['multiple_choice', 'true_false', 'fill_blank', 'essay'] as const).map((type) => (
                      <label key={type} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={config.questionTypes?.includes(type) || false}
                          onChange={(e) => {
                            const types = config.questionTypes || []
                            if (e.target.checked) {
                              updateConfig({ questionTypes: [...types, type] })
                            } else {
                              updateConfig({ questionTypes: types.filter(t => t !== type) })
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm capitalize">{type.replace('_', ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <button
              type="submit"
              disabled={isGenerating}
              className="flex items-center space-x-2 bg-primary hover:bg-secondary text-white hover:text-black px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Wand2 className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Generating...' : 'Generate Quiz'}</span>
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
