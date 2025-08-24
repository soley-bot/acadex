'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Brain, Loader2, Sparkles, Target, BookOpen, Clock, Lightbulb } from 'lucide-react'
import { 
  LanguageSelector, 
  SubjectSelector, 
  DifficultyLevelSelector, 
  QuestionCountSelector, 
  QuestionTypeCheckboxes,
  ErrorDisplay 
} from './shared/QuizFormComponents'
import { validateBasicQuizForm, formatValidationErrors, sanitizeFormInput } from '@/lib/quiz-validation'
import { BaseQuizFormData, VALIDATION_RULES, DifficultyLevel, LanguageCode } from '@/lib/quiz-constants'

// Enhanced interfaces with more AI options - language agnostic
export interface QuizGenerationRequest {
  topic: string
  question_count: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  focus_area?: string
  question_types?: string[]
  language_level?: 'basic' | 'intermediate' | 'advanced' | 'native'
  subject?: string // Subject category (Math, Science, History, English, etc.)
  language?: string // Content language
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
  
  const [formData, setFormData] = useState<BaseQuizFormData>({
    topic: '',
    subject: 'General Knowledge',
    questionCount: 10,
    difficulty: 'beginner',
    language: 'english',
    questionTypes: ['multiple_choice', 'true_false'],
    focusArea: ''
  })

  // Update form data helper
  const updateFormData = (updates: Partial<BaseQuizFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Sanitize inputs
    const sanitizedData = {
      ...formData,
      topic: sanitizeFormInput(formData.topic),
      subject: sanitizeFormInput(formData.subject),
      focusArea: formData.focusArea ? sanitizeFormInput(formData.focusArea) : ''
    }

    // Validate form
    const validation = validateBasicQuizForm(sanitizedData)
    if (!validation.isValid) {
      setError(formatValidationErrors(validation.errors))
      return
    }

    setLoading(true)
    setError('')

    try {
      // Convert to API format (maintaining backward compatibility)
      const apiData = {
        topic: sanitizedData.topic,
        question_count: sanitizedData.questionCount,
        difficulty: sanitizedData.difficulty,
        focus_area: sanitizedData.focusArea,
        question_types: sanitizedData.questionTypes,
        language_level: 'intermediate', // Default for backward compatibility
        subject: sanitizedData.subject,
        language: sanitizedData.language
      }

      const response = await fetch('/api/admin/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiData)
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

            {/* Quiz Topic & Focus */}
            <Card variant="base" className="border-primary/10 bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Quiz Topic & Focus
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Main Topic *
                    </label>
                    <input
                      type="text"
                      value={formData.topic}
                      onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                      placeholder="e.g., Photosynthesis, World War II, Algebra, Python Programming..."
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Subject Category *
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                      required
                    >
                      <option value="General Knowledge">General Knowledge</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Science">Science</option>
                      <option value="Biology">Biology</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Physics">Physics</option>
                      <option value="History">History</option>
                      <option value="Geography">Geography</option>
                      <option value="English Language">English Language</option>
                      <option value="Literature">Literature</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="Programming">Programming</option>
                      <option value="Business">Business</option>
                      <option value="Economics">Economics</option>
                      <option value="Psychology">Psychology</option>
                      <option value="Philosophy">Philosophy</option>
                      <option value="Art">Art</option>
                      <option value="Music">Music</option>
                      <option value="Health">Health</option>
                      <option value="Sports">Sports</option>
                    </select>
                  </div>
                  
                  <div>
                    <LanguageSelector
                      value={formData.language}
                      onChange={(value) => updateFormData({ language: value as LanguageCode })}
                      disabled={loading}
                      label="Content Language"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Specific Focus Area
                    </label>
                    <input
                      type="text"
                      value={formData.focusArea || ''}
                      onChange={(e) => updateFormData({ focusArea: e.target.value })}
                      placeholder="e.g., Cellular respiration, Renaissance period..."
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                      disabled={loading}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quiz Configuration */}
            <Card variant="base" className="border-secondary/20 bg-secondary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-secondary" />
                  Quiz Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <QuestionCountSelector
                  value={formData.questionCount}
                  onChange={(value) => updateFormData({ questionCount: value })}
                  disabled={loading}
                />
                
                <DifficultyLevelSelector
                  value={formData.difficulty}
                  onChange={(value) => updateFormData({ difficulty: value as DifficultyLevel })}
                  disabled={loading}
                />
                
                <QuestionTypeCheckboxes
                  selectedTypes={formData.questionTypes}
                  onChange={(types) => updateFormData({ questionTypes: types })}
                  disabled={loading}
                  maxSelections={3}
                />
                </div>
              </CardContent>
            </Card>

            {/* AI Feature Info */}
            <Card variant="glass" className="bg-gradient-to-r from-primary/5 to-secondary/5">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Brain className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium text-foreground mb-1">Multi-Subject AI Generation</h4>
                    <p className="text-sm text-muted-foreground">
                      Our AI creates contextually relevant questions across any subject area, 
                      with support for multiple languages and customizable complexity levels.
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
