'use client'

import { useState, useEffect } from 'react'
import { Sparkles, Loader2, BookOpen, Plus, RefreshCw, Edit3, Eye, EyeOff, AlertCircle, CheckCircle, X } from 'lucide-react'
import { AICourseGenerator, CourseGenerationRequest, GeneratedCourse } from '@/lib/ai-course-generator'

interface AICourseBuilderProps {
  onCourseGenerated: (courseData: GeneratedCourse) => void
  onClose: () => void
}

export function AICourseBuilder({ onCourseGenerated, onClose }: AICourseBuilderProps) {
  const [generating, setGenerating] = useState(false)
  const [step, setStep] = useState(1)
  const [apiConnected, setApiConnected] = useState<boolean | null>(null)
  const [testingConnection, setTestingConnection] = useState(false)
  
  const [formData, setFormData] = useState<CourseGenerationRequest>({
    title: '',
    description: '',
    level: 'beginner',
    duration: '',
    topics: [],
    learning_objectives: [],
    module_count: 4,
    lessons_per_module: 3,
    course_format: 'mixed',
    // Enhanced generation options
    subject_area: 'General Education',
    content_depth: 'detailed',
    content_style: 'practical',
    include_examples: true,
    include_exercises: true,
    rich_text_format: false,
    content_length: 'medium',
    language_focus: 'general',
    // Quiz generation options
    include_lesson_quizzes: false,
    quiz_questions_per_lesson: 3,
    quiz_difficulty: 'medium'
  })
  
  const [currentTopic, setCurrentTopic] = useState('')
  const [currentObjective, setCurrentObjective] = useState('')
  const [error, setError] = useState('')
  const [generatedCourse, setGeneratedCourse] = useState<GeneratedCourse | null>(null)
  
  // Prompt editing
  const [showPromptEditor, setShowPromptEditor] = useState(false)
  const [customPrompt, setCustomPrompt] = useState('')
  const [useCustomPrompt, setUseCustomPrompt] = useState(false)

  useEffect(() => {
    testAPIConnection()
  }, [])

  const testAPIConnection = async () => {
    setTestingConnection(true)
    try {
      const response = await fetch('/api/admin/generate-course', {
        method: 'GET',
        credentials: 'include'
      })
      const data = await response.json()
      setApiConnected(data.success)
      if (!data.success) {
        setError(data.error || 'Failed to connect to Gemini API')
      }
    } catch (err: any) {
      setApiConnected(false)
      setError('Failed to test API connection')
    } finally {
      setTestingConnection(false)
    }
  }

  const generateDefaultPrompt = () => {
    const generator = new AICourseGenerator()
    return generator.generateDefaultPrompt(formData)
  }

  const handleAddTopic = () => {
    if (currentTopic.trim() && !formData.topics.includes(currentTopic.trim())) {
      setFormData(prev => ({
        ...prev,
        topics: [...prev.topics, currentTopic.trim()]
      }))
      setCurrentTopic('')
    }
  }

  const handleAddObjective = () => {
    if (currentObjective.trim() && !formData.learning_objectives.includes(currentObjective.trim())) {
      setFormData(prev => ({
        ...prev,
        learning_objectives: [...prev.learning_objectives, currentObjective.trim()]
      }))
      setCurrentObjective('')
    }
  }

  const removeTopic = (index: number) => {
    setFormData(prev => ({
      ...prev,
      topics: prev.topics.filter((_, i) => i !== index)
    }))
  }

  const removeObjective = (index: number) => {
    setFormData(prev => ({
      ...prev,
      learning_objectives: prev.learning_objectives.filter((_, i) => i !== index)
    }))
  }

  const handleShowPromptEditor = () => {
    if (!customPrompt) {
      setCustomPrompt(generateDefaultPrompt())
    }
    setShowPromptEditor(true)
  }

  const handleGenerate = async () => {
    if (!formData.title || !formData.description || formData.topics.length === 0) {
      setError('Please fill in all required fields')
      return
    }

    if (!apiConnected) {
      setError('Gemini API is not connected. Please check your API key.')
      return
    }

    setGenerating(true)
    setError('')

    try {
      const response = await fetch('/api/admin/generate-course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          custom_prompt: useCustomPrompt ? customPrompt : undefined
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate course')
      }

      setGeneratedCourse(data.course)
      setStep(5) // Go to review step
    } catch (err: any) {
      setError(err.message || 'Failed to generate course')
    } finally {
      setGenerating(false)
    }
  }

  const handleUseCourse = () => {
    if (generatedCourse) {
      onCourseGenerated(generatedCourse)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">AI Course Generator</h2>
                <p className="text-sm text-gray-600">Create a complete course with AI assistance</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* API Status */}
              <div className="flex items-center gap-2 text-sm">
                {testingConnection ? (
                  <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                ) : apiConnected ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-destructive" />
                )}
                <span className={testingConnection ? 'text-gray-500' : apiConnected ? 'text-green-600' : 'text-primary'}>
                  {testingConnection ? 'Testing...' : apiConnected ? 'API Connected' : 'API Error'}
                </span>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Step Indicator */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              {[
                { num: 1, label: 'Basic Info' },
                { num: 2, label: 'Topics & Goals' },
                { num: 3, label: 'Generation Settings' },
                { num: 4, label: 'Prompt (Optional)' },
                { num: 5, label: 'Review' }
              ].map((stepInfo) => (
                <div key={stepInfo.num} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= stepInfo.num 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-muted/60 text-gray-600'
                  }`}>
                    {stepInfo.num}
                  </div>
                  <div className="ml-2 text-xs text-gray-600 hidden sm:block">
                    {stepInfo.label}
                  </div>
                  {stepInfo.num < 5 && (
                    <div className={`w-12 sm:w-16 h-1 mx-2 ${
                      step > stepInfo.num ? 'bg-purple-600' : 'bg-muted/60'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Course Information</h3>
                <p className="text-gray-600">Tell us about the course you want to create</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="e.g., Business English for Professionals"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Describe what students will learn and achieve..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Level
                  </label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      level: e.target.value as 'beginner' | 'intermediate' | 'advanced' 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="e.g., 8 weeks, 20 hours"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Modules
                  </label>
                  <select
                    value={formData.module_count}
                    onChange={(e) => setFormData(prev => ({ ...prev, module_count: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    {[2, 3, 4, 5, 6, 8, 10].map(count => (
                      <option key={count} value={count}>{count} modules</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lessons per Module
                  </label>
                  <select
                    value={formData.lessons_per_module}
                    onChange={(e) => setFormData(prev => ({ ...prev, lessons_per_module: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    {[2, 3, 4, 5, 6, 8].map(count => (
                      <option key={count} value={count}>{count} lessons</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  disabled={!formData.title || !formData.description}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Topics and Objectives */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Topics & Learning Objectives</h3>
                <p className="text-gray-600">Define what the course will cover</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Topics */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Topics *
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={currentTopic}
                      onChange={(e) => setCurrentTopic(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTopic()}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., Grammar fundamentals"
                    />
                    <button
                      type="button"
                      onClick={handleAddTopic}
                      className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {formData.topics.map((topic, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                        <span className="text-sm">{topic}</span>
                        <button
                          onClick={() => removeTopic(index)}
                          className="text-destructive hover:text-primary/80"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Learning Objectives */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Learning Objectives
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={currentObjective}
                      onChange={(e) => setCurrentObjective(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddObjective()}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., Master present tense usage"
                    />
                    <button
                      type="button"
                      onClick={handleAddObjective}
                      className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {formData.learning_objectives.map((objective, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                        <span className="text-sm">{objective}</span>
                        <button
                          onClick={() => removeObjective(index)}
                          className="text-destructive hover:text-primary/80"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Course Format */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Course Format
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { value: 'text', label: 'Text-based', desc: 'Reading materials and exercises' },
                    { value: 'mixed', label: 'Mixed Content', desc: 'Text, exercises, and interactions' },
                    { value: 'interactive', label: 'Interactive', desc: 'Rich activities and multimedia' }
                  ].map(format => (
                    <label
                      key={format.value}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        formData.course_format === format.value
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="format"
                        value={format.value}
                        checked={formData.course_format === format.value}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          course_format: e.target.value as 'text' | 'mixed' | 'interactive' 
                        }))}
                        className="sr-only"
                      />
                      <div className="font-medium text-gray-900">{format.label}</div>
                      <div className="text-sm text-gray-600">{format.desc}</div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={formData.topics.length === 0}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Generation Settings */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Content Generation Settings</h3>
                <p className="text-gray-600">Customize how the AI generates your course content</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Subject Area */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Subject Area</label>
                  <select
                    value={formData.subject_area}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject_area: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="General Education">General Education</option>
                    <option value="Language Learning">Language Learning</option>
                    <option value="Business">Business</option>
                    <option value="Technology">Technology</option>
                    <option value="Science">Science</option>
                    <option value="Arts">Arts</option>
                    <option value="Health">Health</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="History">History</option>
                    <option value="Literature">Literature</option>
                  </select>
                </div>

                {/* Content Depth */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Content Depth</label>
                  <select
                    value={formData.content_depth}
                    onChange={(e) => setFormData(prev => ({ ...prev, content_depth: e.target.value as 'basic' | 'detailed' | 'comprehensive' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="basic">Basic - Fundamental concepts with simple explanations</option>
                    <option value="detailed">Detailed - Thorough explanations with examples</option>
                    <option value="comprehensive">Comprehensive - Extensive detail with advanced concepts</option>
                  </select>
                </div>

                {/* Content Style */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Content Style</label>
                  <select
                    value={formData.content_style}
                    onChange={(e) => setFormData(prev => ({ ...prev, content_style: e.target.value as 'academic' | 'practical' | 'conversational' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="academic">Academic - Formal language with theoretical frameworks</option>
                    <option value="practical">Practical - Real-world applications and hands-on examples</option>
                    <option value="conversational">Conversational - Friendly, accessible language</option>
                  </select>
                </div>

                {/* Content Length */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Content Length</label>
                  <select
                    value={formData.content_length}
                    onChange={(e) => setFormData(prev => ({ ...prev, content_length: e.target.value as 'short' | 'medium' | 'long' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="short">Short - 200-400 words per lesson (20 min)</option>
                    <option value="medium">Medium - 400-800 words per lesson (35 min)</option>
                    <option value="long">Long - 800-1500 words per lesson (50 min)</option>
                  </select>
                </div>
              </div>

              {/* Language Focus (for language learning) */}
              {formData.subject_area === 'Language Learning' && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Language Focus</label>
                  <select
                    value={formData.language_focus}
                    onChange={(e) => setFormData(prev => ({ ...prev, language_focus: e.target.value as 'general' | 'business' | 'academic' | 'conversational' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="general">General Language Skills</option>
                    <option value="business">Business Language</option>
                    <option value="academic">Academic Language</option>
                    <option value="conversational">Conversational Skills</option>
                  </select>
                </div>
              )}

              {/* Content Features */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900">Content Features</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <input
                      id="include_examples"
                      type="checkbox"
                      checked={formData.include_examples}
                      onChange={(e) => setFormData(prev => ({ ...prev, include_examples: e.target.checked }))}
                      className="rounded border-gray-300 text-primary focus:ring-red-500"
                    />
                    <label htmlFor="include_examples" className="text-sm text-gray-700">
                      Include practical examples and scenarios
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      id="include_exercises"
                      type="checkbox"
                      checked={formData.include_exercises}
                      onChange={(e) => setFormData(prev => ({ ...prev, include_exercises: e.target.checked }))}
                      className="rounded border-gray-300 text-primary focus:ring-red-500"
                    />
                    <label htmlFor="include_exercises" className="text-sm text-gray-700">
                      Include practice exercises and activities
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      id="rich_text_format"
                      type="checkbox"
                      checked={formData.rich_text_format}
                      onChange={(e) => setFormData(prev => ({ ...prev, rich_text_format: e.target.checked }))}
                      className="rounded border-gray-300 text-primary focus:ring-red-500"
                    />
                    <label htmlFor="rich_text_format" className="text-sm text-gray-700">
                      Use rich text formatting (headers, lists, emphasis)
                    </label>
                  </div>

                                    <div className="flex items-center space-x-3">
                    <input
                      id="include_lesson_quizzes"
                      type="checkbox"
                      checked={formData.include_lesson_quizzes}
                      onChange={(e) => setFormData(prev => ({ ...prev, include_lesson_quizzes: e.target.checked }))}
                      className="rounded border-gray-300 text-primary focus:ring-red-500"
                    />
                    <label htmlFor="include_lesson_quizzes" className="text-sm text-gray-700">
                      Include lesson quizzes
                    </label>
                  </div>
                </div>

                {/* Quiz Configuration */}
                {formData.include_lesson_quizzes && (
                  <div className="space-y-4 p-4 bg-primary/5 rounded-lg border border-destructive/30">
                    <h5 className="text-sm font-medium text-red-900">Quiz Configuration</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="quiz_questions_per_lesson" className="block text-sm font-medium text-gray-700 mb-1">
                          Questions per lesson
                        </label>
                        <select
                          id="quiz_questions_per_lesson"
                          value={formData.quiz_questions_per_lesson || 3}
                          onChange={(e) => setFormData(prev => ({ ...prev, quiz_questions_per_lesson: parseInt(e.target.value) }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                        >
                          <option value={2}>2 questions</option>
                          <option value={3}>3 questions</option>
                          <option value={4}>4 questions</option>
                          <option value={5}>5 questions</option>
                        </select>
                      </div>
                      
                      <div>
                        <label htmlFor="quiz_difficulty" className="block text-sm font-medium text-gray-700 mb-1">
                          Quiz difficulty
                        </label>
                        <select
                          id="quiz_difficulty"
                          value={formData.quiz_difficulty || 'medium'}
                          onChange={(e) => setFormData(prev => ({ ...prev, quiz_difficulty: e.target.value as 'easy' | 'medium' | 'hard' }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                        >
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Prompt Editor (Optional) */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Customize AI Prompt (Optional)</h3>
                <p className="text-gray-600">Edit the prompt to fine-tune the AI generation</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    id="useCustomPrompt"
                    checked={useCustomPrompt}
                    onChange={(e) => setUseCustomPrompt(e.target.checked)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <label htmlFor="useCustomPrompt" className="text-sm font-medium text-gray-700">
                    Use custom prompt instead of default
                  </label>
                </div>
                
                {!useCustomPrompt && (
                  <p className="text-sm text-gray-600">
                    The AI will use a carefully crafted default prompt optimized for course generation based on your settings.
                  </p>
                )}
              </div>

              {useCustomPrompt && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">
                      Custom AI Prompt
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setCustomPrompt(generateDefaultPrompt())}
                        className="text-sm text-purple-600 hover:text-purple-800"
                      >
                        Load default prompt
                      </button>
                      <button
                        type="button"
                        onClick={handleShowPromptEditor}
                        className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800"
                      >
                        <Edit3 className="w-3 h-3" />
                        Edit
                      </button>
                    </div>
                  </div>
                  
                  <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    rows={12}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-mono text-sm"
                    placeholder="Enter your custom prompt here..."
                  />
                  
                  <div className="text-xs text-gray-500">
                    Tip: The prompt should instruct the AI to generate course content in JSON format. 
                    Include specific requirements for content quality, structure, and learning objectives.
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(3)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={generating || !apiConnected || (useCustomPrompt && !customPrompt.trim())}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-secondary to-secondary/90 text-white rounded-lg hover:from-secondary/90 hover:to-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  {generating ? 'Generating...' : 'Generate Course'}
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Review Generated Course */}
          {step === 5 && generatedCourse && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Generated Course Preview</h3>
                <p className="text-gray-600">Review and customize your AI-generated course</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <div className="mb-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-2">
                    {generatedCourse.course.title}
                  </h4>
                  <p className="text-gray-600 mb-4">{generatedCourse.course.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Level:</span>
                      <div className="capitalize">{generatedCourse.course.level}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Duration:</span>
                      <div>{generatedCourse.course.duration}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Modules:</span>
                      <div>{generatedCourse.modules.length}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Total Lessons:</span>
                      <div>{generatedCourse.modules.reduce((acc, mod) => acc + mod.lessons.length, 0)}</div>
                    </div>
                  </div>
                </div>

                {/* Course Structure Preview */}
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {generatedCourse.modules.map((module, moduleIndex) => (
                    <div key={moduleIndex} className="bg-white rounded-lg p-4 border">
                      <h5 className="font-semibold text-gray-900 mb-2">
                        Module {moduleIndex + 1}: {module.title}
                      </h5>
                      <p className="text-sm text-gray-600 mb-3">{module.description}</p>
                      
                      <div className="space-y-2">
                        {module.lessons.map((lesson, lessonIndex) => (
                          <div key={lessonIndex} className="flex items-center gap-2 text-sm">
                            <BookOpen className="w-4 h-4 text-blue-500" />
                            <span className="flex-1">{lesson.title}</span>
                            <span className="text-gray-500">({lesson.duration_minutes} min)</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-primary/5 border border-destructive/30 rounded-lg p-4">
                  <p className="text-primary text-sm">{error}</p>
                </div>
              )}

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(4)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Back
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setStep(4)
                      setGeneratedCourse(null)
                    }}
                    disabled={generating}
                    className="flex items-center gap-2 px-6 py-2 border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 disabled:opacity-50"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Regenerate
                  </button>
                  <button
                    onClick={handleUseCourse}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Use This Course
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Global Error Display */}
          {error && step !== 4 && (
            <div className="mt-6 bg-primary/5 border border-destructive/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-red-800 font-medium">Generation Error</h4>
                  <p className="text-red-700 text-sm mt-1">{error}</p>
                  {!apiConnected && (
                    <button
                      onClick={testAPIConnection}
                      disabled={testingConnection}
                      className="mt-2 text-sm text-primary hover:text-red-800 underline"
                    >
                      {testingConnection ? 'Testing...' : 'Test API Connection'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
