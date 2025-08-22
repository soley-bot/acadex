'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Brain, Loader2, Sparkles, Target, BookOpen, Clock, Lightbulb } from 'lucide-react'

// Enhanced interfaces with more AI options
export interface QuizGenerationRequest {
  topic: string
  question_count: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  focus_area?: string
  question_types?: string[]
  language_level?: 'basic' | 'intermediate' | 'advanced' | 'native'
}

export interface GeneratedQuizQuestion {
  question: string
  question_type: 'multiple_choice' | 'true_false'
  options?: string[]
  correct_answer: string | number
  explanation: string
}

export interface GeneratedQuiz {
  title: string
  description: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration_minutes: number
  questions: GeneratedQuizQuestion[]
}

interface AIQuizGeneratorProps {
  isOpen: boolean
  onClose: () => void
  onQuizGenerated: (quiz: GeneratedQuiz) => void
}

export function AIQuizGenerator({ isOpen, onClose, onQuizGenerated }: AIQuizGeneratorProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState<QuizGenerationRequest>({
    topic: '',
    question_count: 10,
    difficulty: 'beginner',
    focus_area: '',
    question_types: ['multiple_choice', 'true_false'],
    language_level: 'intermediate'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.topic.trim()) {
      setError('Please enter a topic for the quiz')
      return
    }

    if (formData.question_count < 3 || formData.question_count > 20) {
      setError('Question count must be between 3 and 20')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to generate quiz')
      }

      onQuizGenerated(result.quiz)
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to generate quiz')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card variant="elevated" className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="bg-gradient-to-r from-primary/5 via-primary/10 to-secondary/5 border-b border-border">
          <CardTitle className="flex items-center gap-3 text-foreground">
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              <Sparkles className="h-4 w-4 text-secondary" />
            </div>
            AI Quiz Generator
          </CardTitle>
          <CardDescription>
            Create engaging quizzes with AI assistance. Customize the content to match your learning objectives.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Card variant="base" className="border-destructive/20 bg-destructive/5">
                <CardContent className="p-4">
                  <p className="text-destructive text-sm">{error}</p>
                </CardContent>
              </Card>
            )}

            {/* Step 1: Basic Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <Target className="h-4 w-4 text-primary" />
                <h3 className="font-medium text-foreground">Quiz Topic & Focus</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Main Topic *
                  </label>
                  <input
                    type="text"
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    placeholder="e.g., English Grammar, Business Vocabulary, IELTS Speaking..."
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Specific Focus Area
                  </label>
                  <input
                    type="text"
                    value={formData.focus_area || ''}
                    onChange={(e) => setFormData({ ...formData, focus_area: e.target.value })}
                    placeholder="e.g., Past Tense, Present Perfect..."
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Language Level
                  </label>
                  <select
                    value={formData.language_level}
                    onChange={(e) => setFormData({ ...formData, language_level: e.target.value as any })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                  >
                    <option value="basic">Basic (A1-A2)</option>
                    <option value="intermediate">Intermediate (B1-B2)</option>
                    <option value="advanced">Advanced (C1-C2)</option>
                    <option value="native">Native Level</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Step 2: Quiz Configuration */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <BookOpen className="h-4 w-4 text-primary" />
                <h3 className="font-medium text-foreground">Quiz Configuration</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    <Clock className="h-4 w-4 inline mr-1" />
                    Number of Questions
                  </label>
                  <select
                    value={formData.question_count}
                    onChange={(e) => setFormData({ ...formData, question_count: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                  >
                    {[5, 10, 15, 20].map(num => (
                      <option key={num} value={num}>{num} questions</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    <Target className="h-4 w-4 inline mr-1" />
                    Difficulty Level
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    <Lightbulb className="h-4 w-4 inline mr-1" />
                    Question Types
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.question_types?.includes('multiple_choice')}
                        onChange={(e) => {
                          const types = formData.question_types || []
                          if (e.target.checked) {
                            setFormData({ ...formData, question_types: [...types, 'multiple_choice'] })
                          } else {
                            setFormData({ ...formData, question_types: types.filter(t => t !== 'multiple_choice') })
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm text-foreground">Multiple Choice</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.question_types?.includes('true_false')}
                        onChange={(e) => {
                          const types = formData.question_types || []
                          if (e.target.checked) {
                            setFormData({ ...formData, question_types: [...types, 'true_false'] })
                          } else {
                            setFormData({ ...formData, question_types: types.filter(t => t !== 'true_false') })
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm text-foreground">True/False</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Feature Info */}
            <Card variant="glass" className="bg-gradient-to-r from-primary/5 to-secondary/5">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Brain className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium text-foreground mb-1">Enhanced AI Generation</h4>
                    <p className="text-sm text-muted-foreground">
                      Our AI will create contextually relevant questions with detailed explanations, 
                      tailored to your specified language level and learning objectives.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={loading || !formData.topic.trim()}
                className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-secondary text-white hover:text-black font-medium rounded-lg transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating Quiz...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Quiz
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
