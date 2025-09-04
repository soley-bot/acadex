import React, { useCallback, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Brain, Loader2, Sparkles, Target, CheckCircle, X, ArrowLeft, ArrowRight } from 'lucide-react'
import { FrontendQuizData, QuestionType } from '@/lib/simple-ai-quiz-generator'

interface EnhancedAIStepProps {
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
  onAIQuizGenerated?: (quiz: FrontendQuizData) => void
}

const questionTypeLabels = {
  multiple_choice: 'Multiple Choice',
  true_false: 'True/False', 
  fill_blank: 'Fill in the Blank',
  essay: 'Essay',
  matching: 'Matching',
  ordering: 'Ordering'
}

const languageOptions = [
  { code: 'english', name: 'English' },
  { code: 'khmer', name: 'Khmer (ភាសាខ្មែរ)' },
  { code: 'spanish', name: 'Spanish' },
  { code: 'french', name: 'French' },
  { code: 'chinese', name: 'Chinese' },
  { code: 'japanese', name: 'Japanese' }
]

export function EnhancedAIStep({ 
  isGenerating, 
  aiConfig, 
  onConfigChange, 
  onGenerate,
  onCancel,
  onAIQuizGenerated 
}: EnhancedAIStepProps) {
  const [generating, setGenerating] = useState(false)
  const [topic, setTopic] = useState('')
  const [subject, setSubject] = useState('General Knowledge')
  const [questionCount, setQuestionCount] = useState(aiConfig.questionCount || 5)
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>(
    (aiConfig.difficulty as 'beginner' | 'intermediate' | 'advanced') || 'intermediate'
  )
  const [selectedQuestionTypes, setSelectedQuestionTypes] = useState<QuestionType[]>(['multiple_choice', 'true_false'])
  const [language, setLanguage] = useState(aiConfig.language || 'english')
  const [explanationLanguage, setExplanationLanguage] = useState(aiConfig.language || 'english')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic')
      return
    }

    setGenerating(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/simple-ai-generation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: topic.trim(),
          subject,
          questionCount,
          difficulty,
          questionTypes: selectedQuestionTypes,
          language,
          explanationLanguage
        })
      })

      const result = await response.json()

      if (result.success && result.quiz) {
        setSuccess('Quiz generated successfully!')
        if (onAIQuizGenerated) {
          onAIQuizGenerated(result.quiz)
        }
        // Also trigger the original onGenerate for compatibility
        onGenerate()
      } else {
        setError(result.error || 'Failed to generate quiz')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while generating the quiz')
    } finally {
      setGenerating(false)
    }
  }

  const handleQuestionTypeToggle = (type: QuestionType) => {
    setSelectedQuestionTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  return (
    <div className="space-y-6">
      <Card variant="glass" className="p-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <span>AI Quiz Generation</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Topic Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Quiz Topic *
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., English Grammar, Business Writing, Vocabulary..."
              className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
            />
          </div>

          {/* Subject Category */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Subject Category
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
            >
              <option value="English Language">English Language</option>
              <option value="Business English">Business English</option>
              <option value="Academic English">Academic English</option>
              <option value="General Knowledge">General Knowledge</option>
              <option value="Test Preparation">Test Preparation</option>
              <option value="Conversation">Conversation</option>
            </select>
          </div>

          {/* Settings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Question Count */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Number of Questions
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={questionCount}
                onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
              />
            </div>

            {/* Difficulty */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Difficulty Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as 'beginner' | 'intermediate' | 'advanced')}
                className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            {/* Language */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Question Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
              >
                {languageOptions.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Explanation Language */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Explanation Language
              </label>
              <select
                value={explanationLanguage}
                onChange={(e) => setExplanationLanguage(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
              >
                {languageOptions.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Question Types */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">
              Question Types (Select at least one)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(questionTypeLabels).map(([type, label]) => (
                <label
                  key={type}
                  className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    selectedQuestionTypes.includes(type as QuestionType)
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border hover:border-muted-foreground'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedQuestionTypes.includes(type as QuestionType)}
                    onChange={() => handleQuestionTypeToggle(type as QuestionType)}
                    className="sr-only"
                  />
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                      selectedQuestionTypes.includes(type as QuestionType)
                        ? 'border-primary bg-primary'
                        : 'border-border'
                    }`}>
                      {selectedQuestionTypes.includes(type as QuestionType) && (
                        <CheckCircle className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-4 bg-success/10 border border-success/20 rounded-xl">
              <p className="text-success text-sm">{success}</p>
            </div>
          )}

          {/* Generate Button */}
          <div className="flex justify-between pt-4">
            {onCancel && (
              <button
                onClick={onCancel}
                className="px-6 py-3 border border-border rounded-xl hover:bg-muted transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </button>
            )}
            
            <button
              onClick={handleGenerate}
              disabled={generating || !topic.trim() || selectedQuestionTypes.length === 0}
              className="bg-primary hover:bg-secondary text-white hover:text-black px-8 py-3 rounded-xl flex items-center gap-3 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
            >
              {generating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Generating Quiz...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Generate Quiz
                </>
              )}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
