import React, { useMemo } from 'react'
import { 
  Lightbulb, 
  TrendingUp, 
  Users, 
  Clock, 
  Target,
  ChevronRight,
  Sparkles
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { QuestionTypeIndicator } from './QuestionTypeIndicators'
import { FEATURE_FLAGS } from '@/lib/featureFlags'
import { trackFormEvent } from '@/lib/quizFormMonitoring'
import type { QuestionType } from '@/lib/supabase'

interface Question {
  id?: string
  question: string
  question_type: QuestionType
  options: string[] | any[]
  correct_answer: any
  explanation?: string
  points?: number
  difficulty_level?: string
}

interface SmartSuggestion {
  id: string
  type: 'balance' | 'difficulty' | 'engagement' | 'coverage' | 'flow' | 'accessibility'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  action: string
  suggestedQuestionType?: QuestionType
  suggestedContent?: Partial<Question>
  reasoning: string
  impact: string
  estimatedTime?: number
}

interface SmartSuggestionsProps {
  questions: Question[]
  quizTitle?: string
  quizCategory?: string
  targetDifficulty?: 'easy' | 'medium' | 'hard'
  targetAudience?: 'beginner' | 'intermediate' | 'advanced'
  onApplySuggestion: (suggestion: SmartSuggestion) => void
  className?: string
}

export function SmartSuggestions({
  questions,
  quizTitle,
  quizCategory,
  targetDifficulty = 'medium',
  targetAudience = 'intermediate',
  onApplySuggestion,
  className = ''
}: SmartSuggestionsProps) {
  
  // Analyze current quiz state and generate smart suggestions
  const suggestions = useMemo(() => {
    const analysis = analyzeQuizStructure(questions, { 
      targetDifficulty, 
      targetAudience, 
      quizTitle, 
      quizCategory 
    })
    return generateSmartSuggestions(analysis, questions)
  }, [questions, targetDifficulty, targetAudience, quizTitle, quizCategory])

  const handleApplySuggestion = (suggestion: SmartSuggestion) => {
    trackFormEvent('smart_suggestion_applied', {
      suggestionType: suggestion.type,
      suggestionPriority: suggestion.priority,
      questionCount: questions.length
    })
    onApplySuggestion(suggestion)
  }

  if (!FEATURE_FLAGS.SMART_QUESTION_STATES || suggestions.length === 0) {
    return null
  }

  const highPrioritySuggestions = suggestions.filter(s => s.priority === 'high')
  const mediumPrioritySuggestions = suggestions.filter(s => s.priority === 'medium')

  return (
    <div className={`space-y-4 ${className}`}>
      {/* High Priority Suggestions */}
      {highPrioritySuggestions.length > 0 && (
        <Card variant="base" className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-orange-900">
              <Lightbulb className="h-5 w-5 text-orange-600" />
              High Priority Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {highPrioritySuggestions.map((suggestion) => (
              <SuggestionCard
                key={suggestion.id}
                suggestion={suggestion}
                onApply={() => handleApplySuggestion(suggestion)}
                variant="high"
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Medium Priority Suggestions */}
      {mediumPrioritySuggestions.length > 0 && (
        <Card variant="base" className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Sparkles className="h-5 w-5 text-blue-600" />
              Optimization Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mediumPrioritySuggestions.slice(0, 3).map((suggestion) => (
              <SuggestionCard
                key={suggestion.id}
                suggestion={suggestion}
                onApply={() => handleApplySuggestion(suggestion)}
                variant="medium"
              />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

interface SuggestionCardProps {
  suggestion: SmartSuggestion
  onApply: () => void
  variant: 'high' | 'medium' | 'low'
}

function SuggestionCard({ suggestion, onApply, variant }: SuggestionCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'high':
        return {
          border: 'border-orange-200',
          bg: 'bg-white',
          button: 'bg-orange-600 hover:bg-orange-700 text-white',
          icon: 'text-orange-600'
        }
      case 'medium':
        return {
          border: 'border-blue-200',
          bg: 'bg-white',
          button: 'bg-blue-600 hover:bg-blue-700 text-white',
          icon: 'text-blue-600'
        }
      default:
        return {
          border: 'border-gray-200',
          bg: 'bg-white',
          button: 'bg-gray-600 hover:bg-gray-700 text-white',
          icon: 'text-gray-600'
        }
    }
  }

  const styles = getVariantStyles()
  const TypeIcon = getSuggestionIcon(suggestion.type)

  return (
    <div className={`border rounded-lg p-3 ${styles.border} ${styles.bg}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <TypeIcon className={`h-4 w-4 ${styles.icon}`} />
            <h4 className="font-medium text-gray-900">{suggestion.title}</h4>
          </div>
          
          <p className="text-sm text-gray-600 mb-2">{suggestion.description}</p>
          
          <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
            <span>Impact: {suggestion.impact}</span>
            {suggestion.estimatedTime && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{suggestion.estimatedTime}min</span>
              </div>
            )}
            {suggestion.suggestedQuestionType && (
              <QuestionTypeIndicator 
                questionType={suggestion.suggestedQuestionType}
                size="sm"
              />
            )}
          </div>
          
          <p className="text-xs text-gray-500 italic">{suggestion.reasoning}</p>
        </div>
        
        <button
          onClick={onApply}
          className={`ml-3 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-1 ${styles.button}`}
        >
          {suggestion.action}
          <ChevronRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  )
}

// Analyze quiz structure and identify areas for improvement
function analyzeQuizStructure(
  questions: Question[], 
  context: {
    targetDifficulty: string
    targetAudience: string
    quizTitle?: string
    quizCategory?: string
  }
) {
  const analysis = {
    totalQuestions: questions.length,
    typeDistribution: {} as Record<QuestionType, number>,
    difficultyDistribution: {} as Record<string, number>,
    averagePoints: 0,
    hasExplanations: 0,
    questionLengths: questions.map(q => q.question.length),
    missingFields: [] as string[],
    patterns: [] as string[]
  }

  // Analyze type distribution
  questions.forEach(q => {
    analysis.typeDistribution[q.question_type] = (analysis.typeDistribution[q.question_type] || 0) + 1
    if (q.difficulty_level) {
      analysis.difficultyDistribution[q.difficulty_level] = (analysis.difficultyDistribution[q.difficulty_level] || 0) + 1
    }
    if (q.explanation) {
      analysis.hasExplanations++
    }
  })

  // Calculate average points
  analysis.averagePoints = questions.reduce((sum, q) => sum + (q.points || 1), 0) / questions.length

  // Identify patterns
  if (analysis.totalQuestions < 5) analysis.patterns.push('too_few_questions')
  if (analysis.totalQuestions > 20) analysis.patterns.push('too_many_questions')
  if (Object.keys(analysis.typeDistribution).length === 1) analysis.patterns.push('single_question_type')
  if (analysis.hasExplanations < questions.length * 0.5) analysis.patterns.push('missing_explanations')

  return analysis
}

// Generate smart suggestions based on analysis
function generateSmartSuggestions(analysis: any, questions: Question[]): SmartSuggestion[] {
  const suggestions: SmartSuggestion[] = []

  // Balance suggestion - add variety in question types
  if (Object.keys(analysis.typeDistribution).length < 3 && analysis.totalQuestions > 3) {
    suggestions.push({
      id: 'balance-question-types',
      type: 'balance',
      priority: 'high',
      title: 'Add Question Type Variety',
      description: 'Your quiz uses only a few question types. Adding variety will improve engagement.',
      action: 'Add Variety',
      suggestedQuestionType: getSuggestedQuestionType(analysis.typeDistribution),
      reasoning: 'Diverse question types test different cognitive skills and keep learners engaged.',
      impact: 'High - Improves engagement and comprehensive assessment',
      estimatedTime: 3
    })
  }

  // Difficulty progression suggestion
  if (analysis.patterns.includes('missing_explanations')) {
    suggestions.push({
      id: 'add-explanations',
      type: 'accessibility',
      priority: 'high',
      title: 'Add Question Explanations',
      description: `${Math.round((1 - analysis.hasExplanations / analysis.totalQuestions) * 100)}% of questions are missing explanations.`,
      action: 'Add Explanations',
      reasoning: 'Explanations help learners understand correct answers and learn from mistakes.',
      impact: 'High - Improves learning outcomes and user satisfaction',
      estimatedTime: 2
    })
  }

  // Length optimization
  if (analysis.totalQuestions < 5) {
    suggestions.push({
      id: 'increase-question-count',
      type: 'coverage',
      priority: 'medium',
      title: 'Add More Questions',
      description: 'Consider adding more questions for comprehensive coverage.',
      action: 'Add Questions',
      reasoning: 'More questions provide better assessment reliability and topic coverage.',
      impact: 'Medium - Improves assessment accuracy',
      estimatedTime: 5
    })
  }

  // Engagement optimization
  if (!analysis.typeDistribution.matching && !analysis.typeDistribution.ordering && analysis.totalQuestions > 5) {
    suggestions.push({
      id: 'add-interactive-questions',
      type: 'engagement',
      priority: 'medium',
      title: 'Add Interactive Questions',
      description: 'Consider adding matching or ordering questions for better interaction.',
      action: 'Add Interactive',
      suggestedQuestionType: 'matching',
      reasoning: 'Interactive question types increase engagement and test practical application.',
      impact: 'Medium - Increases learner engagement',
      estimatedTime: 4
    })
  }

  // Flow optimization
  if (analysis.totalQuestions > 10) {
    suggestions.push({
      id: 'optimize-question-flow',
      type: 'flow',
      priority: 'low',
      title: 'Optimize Question Flow',
      description: 'Consider grouping similar questions and creating a logical progression.',
      action: 'Reorder',
      reasoning: 'Logical question flow helps learners build understanding progressively.',
      impact: 'Medium - Improves learning experience',
      estimatedTime: 3
    })
  }

  return suggestions.slice(0, 5) // Limit to top 5 suggestions
}

// Helper functions
function getSuggestedQuestionType(typeDistribution: Record<QuestionType, number>): QuestionType {
  const allTypes: QuestionType[] = [
    'multiple_choice', 'single_choice', 'true_false', 'fill_blank', 
    'essay', 'matching', 'ordering'
  ]
  const unused = allTypes.filter(type => !typeDistribution[type])
  
  return unused[0] || 'multiple_choice'
}

function getSuggestionIcon(type: string) {
  switch (type) {
    case 'balance': return TrendingUp
    case 'difficulty': return Target
    case 'engagement': return Users
    case 'coverage': return Clock
    case 'flow': return Lightbulb
    case 'accessibility': return Sparkles
    default: return Lightbulb
  }
}
