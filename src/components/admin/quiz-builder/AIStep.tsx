import React, { memo, useMemo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Brain, Wand2, CheckCircle, AlertCircle, X } from 'lucide-react'
import { useQuizBuilderPerformance } from '@/lib/adminPerformanceSystem'

interface AIStepProps {
  isGenerating: boolean
  aiConfig: {
    enabled: boolean
    language: string
    difficulty: string
    questionCount: number
    topics: string[]
    customPrompt: string
  }
  onConfigChange: (config: any) => void
  onGenerate: () => void
  onCancel?: () => void
  generationProgress?: {
    current: number
    total: number
    status: string
  }
}

// Memoized Language Selector
const LanguageSelector = memo<{
  value: string
  onChange: (value: string) => void
}>(({ value, onChange }) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value)
  }, [onChange])

  const languages = useMemo(() => [
    { value: 'english', label: 'English' },
    { value: 'khmer', label: 'Khmer (ខ្មែរ)' },
    { value: 'spanish', label: 'Spanish' },
    { value: 'french', label: 'French' },
    { value: 'arabic', label: 'Arabic' }
  ], [])

  return (
    <select
      value={value}
      onChange={handleChange}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
    >
      {languages.map(lang => (
        <option key={lang.value} value={lang.value}>
          {lang.label}
        </option>
      ))}
    </select>
  )
}, (prevProps, nextProps) => prevProps.value === nextProps.value)

LanguageSelector.displayName = 'LanguageSelector'

// Memoized Difficulty Selector
const DifficultySelector = memo<{
  value: string
  onChange: (value: string) => void
}>(({ value, onChange }) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value)
  }, [onChange])

  const difficulties = useMemo(() => [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'expert', label: 'Expert' }
  ], [])

  return (
    <select
      value={value}
      onChange={handleChange}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
    >
      {difficulties.map(diff => (
        <option key={diff.value} value={diff.value}>
          {diff.label}
        </option>
      ))}
    </select>
  )
}, (prevProps, nextProps) => prevProps.value === nextProps.value)

DifficultySelector.displayName = 'DifficultySelector'

// Memoized Topic Tags Component
const TopicTags = memo<{
  topics: string[]
  onChange: (topics: string[]) => void
}>(({ topics, onChange }) => {
  const [inputValue, setInputValue] = React.useState('')

  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault()
      if (!topics.includes(inputValue.trim())) {
        onChange([...topics, inputValue.trim()])
      }
      setInputValue('')
    }
  }, [inputValue, topics, onChange])

  const removeTopic = useCallback((indexToRemove: number) => {
    onChange(topics.filter((_, index) => index !== indexToRemove))
  }, [topics, onChange])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }, [])

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {topics.map((topic, index) => (
          <span
            key={`${topic}-${index}`}
            className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-sm"
          >
            {topic}
            <button
              onClick={() => removeTopic(index)}
              className="text-primary hover:text-primary/70"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        placeholder="Type a topic and press Enter"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
      />
    </div>
  )
}, (prevProps, nextProps) => {
  return JSON.stringify(prevProps.topics) === JSON.stringify(nextProps.topics)
})

TopicTags.displayName = 'TopicTags'

// Memoized Generation Progress Component
const GenerationProgress = memo<{
  progress: {
    current: number
    total: number
    status: string
  }
  onCancel?: () => void
}>(({ progress, onCancel }) => {
  const progressPercentage = useMemo(() => {
    return (progress.current / progress.total) * 100
  }, [progress])

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="text-sm font-medium text-primary">Generating Questions</span>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      
      <div className="mb-2">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>{progress.status}</span>
          <span>{progress.current} of {progress.total}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
    </div>
  )
}, (prevProps, nextProps) => {
  return (
    prevProps.progress.current === nextProps.progress.current &&
    prevProps.progress.total === nextProps.progress.total &&
    prevProps.progress.status === nextProps.progress.status
  )
})

GenerationProgress.displayName = 'GenerationProgress'

// Main AI Step Component
export const AIStep = memo<AIStepProps>(({
  isGenerating,
  aiConfig,
  onConfigChange,
  onGenerate,
  onCancel,
  generationProgress
}) => {
  // Performance monitoring
  const performanceMetrics = useQuizBuilderPerformance()

  // Memoized configuration handlers
  const handleConfigChange = useCallback((field: string, value: any) => {
    onConfigChange({ ...aiConfig, [field]: value })
  }, [aiConfig, onConfigChange])

  const handleEnabledToggle = useCallback(() => {
    handleConfigChange('enabled', !aiConfig.enabled)
  }, [aiConfig.enabled, handleConfigChange])

  const handleLanguageChange = useCallback((language: string) => {
    handleConfigChange('language', language)
  }, [handleConfigChange])

  const handleDifficultyChange = useCallback((difficulty: string) => {
    handleConfigChange('difficulty', difficulty)
  }, [handleConfigChange])

  const handleQuestionCountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleConfigChange('questionCount', parseInt(e.target.value) || 1)
  }, [handleConfigChange])

  const handleTopicsChange = useCallback((topics: string[]) => {
    handleConfigChange('topics', topics)
  }, [handleConfigChange])

  const handleCustomPromptChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleConfigChange('customPrompt', e.target.value)
  }, [handleConfigChange])

  // Memoized generation button state
  const generationButtonState = useMemo(() => {
    const canGenerate = aiConfig.enabled && aiConfig.questionCount > 0
    
    return {
      disabled: isGenerating || !canGenerate,
      text: isGenerating ? 'Generating...' : 'Generate Questions',
      icon: isGenerating ? Loader2 : Wand2,
      className: `w-full px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
        isGenerating || !canGenerate
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-primary hover:bg-secondary text-white hover:text-black'
      }`
    }
  }, [isGenerating, aiConfig.enabled, aiConfig.questionCount])

  return (
    <div className="space-y-6">
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500">
          AI Step - {performanceMetrics.metrics?.renderCount || 0} renders
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-primary" />
            <span>AI-Powered Quiz Generation</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* AI Enable Toggle */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Enable AI Generation</h3>
              <p className="text-sm text-gray-600">
                Let AI create intelligent quiz questions based on your preferences
              </p>
            </div>
            <button
              onClick={handleEnabledToggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                aiConfig.enabled ? 'bg-primary' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  aiConfig.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* AI Configuration */}
          {aiConfig.enabled && (
            <div className="space-y-4 border border-blue-200 rounded-lg p-4 bg-blue-50">
              {/* Generation Progress */}
              {isGenerating && generationProgress && (
                <GenerationProgress
                  progress={generationProgress}
                  onCancel={onCancel}
                />
              )}

              {/* Language and Difficulty */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language
                  </label>
                  <LanguageSelector
                    value={aiConfig.language}
                    onChange={handleLanguageChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty Level
                  </label>
                  <DifficultySelector
                    value={aiConfig.difficulty}
                    onChange={handleDifficultyChange}
                  />
                </div>
              </div>

              {/* Question Count */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Questions
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={aiConfig.questionCount}
                  onChange={handleQuestionCountChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Topics */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Topics (Optional)
                </label>
                <TopicTags
                  topics={aiConfig.topics}
                  onChange={handleTopicsChange}
                />
              </div>

              {/* Custom Prompt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Instructions (Optional)
                </label>
                <textarea
                  value={aiConfig.customPrompt}
                  onChange={handleCustomPromptChange}
                  placeholder="Additional instructions for AI generation..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Generate Button */}
              <button
                onClick={onGenerate}
                disabled={generationButtonState.disabled}
                className={generationButtonState.className}
              >
                <div className="flex items-center justify-center space-x-2">
                  <generationButtonState.icon 
                    className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} 
                  />
                  <span>{generationButtonState.text}</span>
                </div>
              </button>
            </div>
          )}

          {/* AI Benefits */}
          {!aiConfig.enabled && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">AI Generation Benefits:</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Intelligent question creation based on learning objectives</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Multi-language support for global accessibility</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Adaptive difficulty based on learning levels</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Time-saving automated content generation</span>
                </li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}, (prevProps, nextProps) => {
  return (
    prevProps.isGenerating === nextProps.isGenerating &&
    JSON.stringify(prevProps.aiConfig) === JSON.stringify(nextProps.aiConfig) &&
    JSON.stringify(prevProps.generationProgress) === JSON.stringify(nextProps.generationProgress)
  )
})

AIStep.displayName = 'AIStep'

