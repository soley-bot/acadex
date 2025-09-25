import React, { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Wand2, Lightbulb, Zap, RefreshCw, CheckCircle, Copy, Plus } from 'lucide-react'
import { logger } from '@/lib/logger'
import { supabase } from '@/lib/supabase'
import type { QuizQuestion } from '@/lib/supabase'

interface QuestionSuggestion {
  id: string
  question: string
  question_type: string
  options?: string[]
  correct_answer?: any
  explanation: string
  difficulty_level: 'easy' | 'medium' | 'hard'
  category: string
  confidence: number
}

interface AIQuestionSuggestionsProps {
  topic: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  existingQuestions: QuizQuestion[]
  onSelectSuggestion: (suggestion: QuestionSuggestion) => void
  onClose: () => void
}

export function AIQuestionSuggestions({
  topic,
  category,
  difficulty,
  existingQuestions,
  onSelectSuggestion,
  onClose
}: AIQuestionSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<QuestionSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(new Set())

  // Helper function to get auth headers
  const getAuthHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      throw new Error('Authentication required')
    }
    
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`
    }
  }

  const generateSuggestions = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const headers = await getAuthHeaders()
      
      const response = await fetch('/api/ai/question-suggestions', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          topic,
          category,
          difficulty,
          existingQuestions: existingQuestions.map(q => ({ 
            question: q.question, 
            type: q.question_type 
          })),
          count: 6
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate question suggestions')
      }

      const data = await response.json()
      setSuggestions(data.suggestions || [])
      
      logger.info('AI question suggestions generated', {
        topic,
        category,
        difficulty,
        suggestionCount: data.suggestions?.length || 0
      })
      
    } catch (error) {
      logger.error('Failed to generate AI question suggestions:', error)
      setError(error instanceof Error ? error.message : 'Failed to generate suggestions')
    } finally {
      setIsLoading(false)
    }
  }, [topic, category, difficulty, existingQuestions])

  useEffect(() => {
    generateSuggestions()
  }, [generateSuggestions])

  const handleSelectSuggestion = useCallback((suggestion: QuestionSuggestion) => {
    setSelectedSuggestions(prev => new Set([...prev, suggestion.id]))
    onSelectSuggestion(suggestion)
  }, [onSelectSuggestion])

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'easy': return 'bg-green-100 text-green-700 border-green-200'
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'hard': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'multiple_choice': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'true_false': return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'fill_blank': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'essay': return 'bg-teal-100 text-teal-700 border-teal-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  if (error) {
    return (
      <Card className="border-destructive bg-destructive/5">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-destructive mb-4">
            <Sparkles className="h-5 w-5" />
            <h3 className="font-semibold">AI Suggestions Unavailable</h3>
          </div>
          <p className="text-muted-foreground mb-4">{error}</p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={generateSuggestions}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Continue Manually
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">AI Question Suggestions</CardTitle>
              <p className="text-sm text-muted-foreground">
                Smart suggestions for &quot;{topic}&quot; • {difficulty} level
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={generateSuggestions} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <div className="h-5 bg-gray-200 rounded w-16"></div>
                      <div className="h-5 bg-gray-200 rounded w-20"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-8 bg-gray-200 rounded w-24"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : suggestions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suggestions.map((suggestion) => {
              const isSelected = selectedSuggestions.has(suggestion.id)
              
              return (
                <Card 
                  key={suggestion.id} 
                  className={`transition-all duration-200 hover:shadow-md cursor-pointer border-2 ${
                    isSelected 
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => !isSelected && handleSelectSuggestion(suggestion)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Question Type & Difficulty Badges */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getTypeColor(suggestion.question_type)}`}
                        >
                          {suggestion.question_type.replace('_', ' ')}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getDifficultyColor(suggestion.difficulty_level)}`}
                        >
                          {suggestion.difficulty_level}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {Math.round(suggestion.confidence * 100)}% match
                        </Badge>
                      </div>

                      {/* Question Text */}
                      <p className="text-sm font-medium leading-relaxed">
                        {suggestion.question}
                      </p>

                      {/* Options Preview (for multiple choice) */}
                      {suggestion.options && suggestion.options.length > 0 && (
                        <div className="space-y-1">
                          {suggestion.options.slice(0, 2).map((option, index) => (
                            <div key={index} className="text-xs text-muted-foreground flex items-center gap-2">
                              <div className="w-1 h-1 bg-muted-foreground/50 rounded-full"></div>
                              {option}
                            </div>
                          ))}
                          {suggestion.options.length > 2 && (
                            <div className="text-xs text-muted-foreground/70">
                              +{suggestion.options.length - 2} more options
                            </div>
                          )}
                        </div>
                      )}

                      {/* Action Button */}
                      <div className="pt-2">
                        {isSelected ? (
                          <div className="flex items-center gap-2 text-primary text-sm font-medium">
                            <CheckCircle className="h-4 w-4" />
                            Added to quiz
                          </div>
                        ) : (
                          <Button size="sm" variant="ghost" className="h-8 text-xs hover:bg-primary/10">
                            <Plus className="h-3 w-3 mr-1" />
                            Add Question
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card className="border-dashed border-2">
            <CardContent className="p-8 text-center">
              <Lightbulb className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="font-medium text-muted-foreground mb-2">No Suggestions Generated</h3>
              <p className="text-sm text-muted-foreground/70 mb-4">
                Try adjusting your topic or difficulty level for better results.
              </p>
              <Button variant="outline" onClick={generateSuggestions}>
                <Wand2 className="h-4 w-4 mr-2" />
                Generate New Suggestions
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        {suggestions.length > 0 && !isLoading && (
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {suggestions.length} suggestions • {selectedSuggestions.size} selected
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={generateSuggestions}>
                <Zap className="h-4 w-4 mr-2" />
                More Suggestions
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                Continue Creating
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
