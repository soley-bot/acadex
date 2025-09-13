import React, { useState, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Sparkles, 
  Brain, 
  FileText, 
  CheckSquare, 
  ToggleLeft, 
  Edit3,
  Wand2,
  Lightbulb,
  Zap,
  ChevronRight
} from 'lucide-react'
// AI functionality temporarily disabled
// import { AIQuestionSuggestions } from './AIQuestionSuggestions'
import { useFeatureFlag } from '@/lib/featureFlags'
import type { QuizQuestion } from '@/lib/supabase'

interface QuestionCreationOption {
  id: string
  type: 'manual' | 'ai' | 'template'
  title: string
  description: string
  icon: React.ReactNode
  badge?: string
  difficulty: 'easy' | 'medium' | 'hard'
  timeEstimate: string
  features: string[]
}

interface EnhancedQuestionCreationProps {
  topic?: string
  category?: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  existingQuestions: QuizQuestion[]
  onCreateQuestion: (type: string, data?: any) => void
  onClose: () => void
}

export function EnhancedQuestionCreation({
  topic = '',
  category = 'general',
  difficulty = 'intermediate',
  existingQuestions,
  onCreateQuestion,
  onClose
}: EnhancedQuestionCreationProps) {
  const [activeMethod, setActiveMethod] = useState<'selection' | 'ai' | 'template' | 'manual'>('selection')
  const [selectedQuestionType, setSelectedQuestionType] = useState<string>('')
  const enhancedQuestionCreationEnabled = useFeatureFlag('ENHANCED_QUESTION_CREATION')

  const creationOptions: QuestionCreationOption[] = useMemo(() => [
    // Temporarily disabled - focus on core functionality
    // {
    //   id: 'ai-assisted',
    //   type: 'ai',
    //   title: 'AI-Powered Creation',
    //   description: 'Get intelligent question suggestions based on your topic and difficulty level',
    //   icon: <Sparkles className="h-5 w-5" />,
    //   badge: 'Smart',
    //   difficulty: 'easy',
    //   timeEstimate: '30 seconds',
    //   features: ['Auto-generated options', 'Contextual relevance', 'Difficulty matching', 'Explanation included']
    // },
    // {
    //   id: 'quick-template',
    //   type: 'template',
    //   title: 'Quick Templates',
    //   description: 'Choose from pre-built question templates for common patterns',
    //   icon: <FileText className="h-5 w-5" />,
    //   badge: 'Fast',
    //   difficulty: 'easy',
    //   timeEstimate: '1 minute',
    //   features: ['Pre-formatted', 'Common patterns', 'Customizable', 'Multiple types']
    // },
    {
      id: 'manual-creation',
      type: 'manual',
      title: 'Manual Creation',
      description: 'Build questions from scratch with full control over every detail',
      icon: <Edit3 className="h-5 w-5" />,
      badge: 'Custom',
      difficulty: 'medium',
      timeEstimate: '3-5 minutes',
      features: ['Full control', 'Custom formatting', 'Advanced options', 'Media support']
    }
  ], [])

  const questionTypes = [
    {
      id: 'multiple_choice',
      name: 'Multiple Choice',
      description: 'Single correct answer from multiple options',
      icon: <CheckSquare className="h-4 w-4" />,
      complexity: 'medium',
      bestFor: 'Knowledge assessment, concept testing'
    },
    {
      id: 'true_false',
      name: 'True/False',
      description: 'Simple binary choice questions',
      icon: <ToggleLeft className="h-4 w-4" />,
      complexity: 'easy',
      bestFor: 'Quick checks, fact verification'
    },
    {
      id: 'fill_blank',
      name: 'Fill in the Blank',
      description: 'Students complete missing words or phrases',
      icon: <Edit3 className="h-4 w-4" />,
      complexity: 'medium',
      bestFor: 'Vocabulary, specific terms'
    },
    {
      id: 'essay',
      name: 'Essay/Open-ended',
      description: 'Long-form written responses',
      icon: <FileText className="h-4 w-4" />,
      complexity: 'hard',
      bestFor: 'Critical thinking, analysis'
    }
  ]

  const handleMethodSelect = useCallback((method: 'ai' | 'template' | 'manual') => {
    if (method === 'ai' && !enhancedQuestionCreationEnabled) {
      // Fallback to manual if AI is not enabled
      setActiveMethod('manual')
      return
    }
    setActiveMethod(method)
  }, [enhancedQuestionCreationEnabled])

  const handleQuestionTypeSelect = useCallback((type: string) => {
    setSelectedQuestionType(type)
    if (activeMethod === 'manual') {
      onCreateQuestion(type)
      onClose()
    }
  }, [activeMethod, onCreateQuestion, onClose])

  const handleAISuggestionSelect = useCallback((suggestion: any) => {
    // Convert AI suggestion to QuizQuestion format
    onCreateQuestion(suggestion.question_type, {
      question: suggestion.question,
      options: suggestion.options,
      correct_answer: suggestion.correct_answer,
      explanation: suggestion.explanation,
      difficulty_level: suggestion.difficulty_level
    })
  }, [onCreateQuestion])

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'easy': return 'bg-green-100 text-green-700 border-green-200'
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'hard': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'easy': return 'text-green-600'
      case 'medium': return 'text-yellow-600'
      case 'hard': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  if (activeMethod === 'manual') {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveMethod('selection')}
                className="px-2"
              >
                ← Back
              </Button>
              <div>
                <CardTitle className="text-xl">
                  {activeMethod === 'manual' ? 'Choose Question Type' : 'Select Template'}
                </CardTitle>
                <p className="text-muted-foreground">
                  {activeMethod === 'manual' 
                    ? 'Select the type of question you want to create'
                    : 'Pick a template to get started quickly'
                  }
                </p>
              </div>
            </div>
            <Button variant="ghost" onClick={onClose}>×</Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {questionTypes.map((type) => (
              <Card
                key={type.id}
                className="cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/50 border-2 border-transparent"
                onClick={() => handleQuestionTypeSelect(type.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                      {type.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-base">{type.name}</h3>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getDifficultyColor(type.complexity)}`}
                        >
                          {type.complexity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                        {type.description}
                      </p>
                      <p className="text-xs text-muted-foreground/70">
                        <span className="font-medium">Best for:</span> {type.bestFor}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground/50 flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Default: Creation method selection
  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Plus className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Create New Question</CardTitle>
              <p className="text-muted-foreground">
                Choose how you&apos;d like to create your question
              </p>
            </div>
          </div>
          <Button variant="ghost" onClick={onClose}>×</Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {creationOptions.map((option) => (
            <Card
              key={option.id}
              className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-primary/50 border-2 border-transparent group"
              onClick={() => handleMethodSelect(option.type)}
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                      {option.icon}
                    </div>
                    {option.badge && (
                      <Badge variant="outline" className="text-xs">
                        {option.badge}
                      </Badge>
                    )}
                  </div>

                  {/* Content */}
                  <div>
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                      {option.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      {option.description}
                    </p>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Difficulty</span>
                      <Badge 
                        variant="outline" 
                        className={getDifficultyColor(option.difficulty)}
                      >
                        {option.difficulty}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Time</span>
                      <span className="font-medium">{option.timeEstimate}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground">Features</h4>
                    <div className="flex flex-wrap gap-1">
                      {option.features.slice(0, 2).map((feature, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary" 
                          className="text-xs px-2 py-0.5"
                        >
                          {feature}
                        </Badge>
                      ))}
                      {option.features.length > 2 && (
                        <Badge variant="outline" className="text-xs px-2 py-0.5">
                          +{option.features.length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Action Hint */}
                  <div className="pt-2 border-t border-border/50">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Click to start</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Context Info */}
        {topic && (
          <Card className="bg-muted/30 border-muted">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Brain className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    Creating questions for <span className="font-medium text-foreground">&quot;{topic}&quot;</span>
                    {category && <span> in {category}</span>}
                    {difficulty && <span> • {difficulty} level</span>}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  )
}