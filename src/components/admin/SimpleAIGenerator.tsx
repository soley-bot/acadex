'use client'

import { useState } from 'react'
import { Brain, Loader2, Sparkles, Target, CheckCircle, X } from 'lucide-react'
import { FrontendQuizData, QuestionType } from '@/lib/simple-ai-quiz-generator'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SUPPORTED_LANGUAGES, DIFFICULTY_LEVELS, type DifficultyLevel } from '@/lib/quiz-constants-unified'
import { ErrorHandler } from '@/lib/errorHandler'

interface SimpleAIGeneratorProps {
  onQuizGenerated: (quiz: FrontendQuizData) => void
}

const questionTypeLabels = {
  multiple_choice: 'Multiple Choice',
  true_false: 'True/False', 
  fill_blank: 'Fill in the Blank',
  essay: 'Essay',
  matching: 'Matching',
  ordering: 'Ordering'
}

export function SimpleAIGenerator({ onQuizGenerated }: SimpleAIGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [topic, setTopic] = useState('')
  const [subject, setSubject] = useState('General Knowledge')
  const [questionCount, setQuestionCount] = useState(5)
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('intermediate')
  const [selectedQuestionTypes, setSelectedQuestionTypes] = useState<QuestionType[]>(['multiple_choice', 'true_false'])
  const [language, setLanguage] = useState('english')
  const [explanationLanguage, setExplanationLanguage] = useState('english')
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
      const response = await fetch('/api/admin/generate-simple-quiz', {
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
        onQuizGenerated(result.quiz)
        setSuccess('Quiz generated successfully!')
        setTopic('')
        setTimeout(() => {
          setIsOpen(false)
          setSuccess('')
        }, 1500)
      } else {
        setError(result.error || 'Failed to generate quiz')
      }
    } catch (err: any) {
      const formattedError = ErrorHandler.formatError(err)
      setError(formattedError.message)
    } finally {
      setGenerating(false)
    }
  }

  const toggleQuestionType = (type: QuestionType) => {
    setSelectedQuestionTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  if (!isOpen) {
    return (
      <div className="space-y-3">
        <button
          onClick={() => setIsOpen(true)}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors"
        >
          <Brain className="h-5 w-5" />
          Generate with AI
        </button>
        
        {/* Quick Examples */}
        <div className="text-xs text-gray-500">
          <p className="font-medium mb-1">Quick examples:</p>
          <div className="space-y-1">
            {['Photosynthesis', 'World War 2', 'Basic Algebra', 'English Grammar'].map(example => (
              <button
                key={example}
                onClick={() => {
                  setTopic(example)
                  setIsOpen(true)
                }}
                className="text-blue-600 hover:underline block"
              >
                • {example}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">AI Quiz Generator</CardTitle>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <CardDescription>
          Generate quiz questions with all question types and language support
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Topic Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Topic *
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Photosynthesis, World War 2, Basic Math..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Questions
            </label>
            <select
              value={questionCount}
              onChange={(e) => setQuestionCount(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {[3, 5, 8, 10, 15, 20].map(num => (
                <option key={num} value={num}>{num} questions</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {DIFFICULTY_LEVELS.map(level => (
                <option key={level.value} value={level.value}>{level.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {SUPPORTED_LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Explanation Language */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Explanation Language
          </label>
          <select
            value={explanationLanguage}
            onChange={(e) => setExplanationLanguage(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {SUPPORTED_LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code}>{lang.name}</option>
            ))}
          </select>
        </div>

        {/* Question Types */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Question Types * (select at least one)
          </label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(questionTypeLabels).map(([type, label]) => (
              <button
                key={type}
                onClick={() => toggleQuestionType(type as QuestionType)}
                className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                  selectedQuestionTypes.includes(type as QuestionType)
                    ? 'bg-primary/10 border-primary/30 text-primary'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {selectedQuestionTypes.includes(type as QuestionType) && (
                  <CheckCircle className="h-3 w-3 inline mr-1" />
                )}
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={generating || !topic.trim() || selectedQuestionTypes.length === 0}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-primary hover:bg-primary/90 disabled:bg-gray-400 text-white rounded-lg transition-colors"
        >
          {generating ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Target className="h-5 w-5" />
              Generate Quiz ({questionCount} questions)
            </>
          )}
        </button>

        {/* Status Messages */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            ❌ {error}
          </div>
        )}
        
        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            ✅ {success}
          </div>
        )}

        {/* Features Note */}
        <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded">
          <strong>Enhanced Features:</strong>
          <ul className="mt-1 space-y-1">
            <li>• All question types supported (multiple choice, true/false, fill blank, essay, matching, ordering)</li>
            <li>• Multi-language content and explanation support</li>
            <li>• Proper correct answer formats for each question type</li>
            <li>• Detailed explanations for all questions</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

