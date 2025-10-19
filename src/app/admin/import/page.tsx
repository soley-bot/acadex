'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, Info, Loader2, Download, X, ChevronDown, ChevronUp, Search, FolderOpen, Sparkles, Check } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import AdminRoute from '@/components/AdminRoute'
import { createSupabaseClient } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

type ImportType = 'quizzes' | 'courses'
type Step = 'form' | 'preview' | 'importing' | 'success'
type ValidationStatus = 'valid' | 'warning' | 'error'

interface AIEnhancement {
  explanation?: string
  tags?: string[]
  difficulty?: 'easy' | 'medium' | 'hard'
  warnings?: string[]
  confidence: number
}

interface PreviewQuestion {
  rowIndex: number
  question: string
  type: 'multiple_choice' | 'true_false' | 'fill_blank'
  option_a?: string
  option_b?: string
  option_c?: string
  option_d?: string
  correct_answer?: string
  correct_answer_text?: string
  explanation?: string
  points?: number
  difficulty?: string
  tags?: string | string[]
  status: ValidationStatus
  issues?: string[]
  selected?: boolean
  aiEnhancement?: AIEnhancement
  aiAccepted?: boolean // Track if user accepted AI suggestions
}

interface Quiz {
  id: string
  title: string
  category: string
  total_questions: number
  updated_at: string
}

export default function ImportPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [importType, setImportType] = useState<ImportType>('quizzes')
  const [currentStep, setCurrentStep] = useState<Step>('form')
  const [importMode, setImportMode] = useState<'new' | 'existing'>('existing')
  const [sourceType, setSourceType] = useState<'sheets' | 'csv'>('sheets')
  const [sheetUrl, setSheetUrl] = useState('')
  const [selectedQuiz, setSelectedQuiz] = useState<string>('')
  const [newQuizTitle, setNewQuizTitle] = useState('')
  const [newQuizCategory, setNewQuizCategory] = useState('')
  const [showQuizModal, setShowQuizModal] = useState(false)
  const [quizSearchQuery, setQuizSearchQuery] = useState('')
  const [aiProvider, setAiProvider] = useState<'claude' | 'gemini'>('gemini')
  const [aiOptions, setAiOptions] = useState({
    generateExplanations: true,
    suggestDifficulty: true,
    autoTag: true,
    validateAnswers: false
  })
  const [expandedQuestions, setExpandedQuestions] = useState<number[]>([])
  const [filterStatus, setFilterStatus] = useState<'all' | ValidationStatus>('all')
  const [importProgress, setImportProgress] = useState(0)
  
  // Real data states
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [questions, setQuestions] = useState<PreviewQuestion[]>([])
  const [summary, setSummary] = useState({
    total: 0,
    valid: 0,
    warnings: 0,
    errors: 0,
    breakdown: {
      multiple_choice: 0,
      true_false: 0,
      fill_blank: 0
    }
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [importedCount, setImportedCount] = useState(0)
  const [importedQuizId, setImportedQuizId] = useState<string>('')
  const [aiEnhancing, setAiEnhancing] = useState(false)
  const [aiEnhanced, setAiEnhanced] = useState(false)
  const [aiStats, setAiStats] = useState({
    total: 0,
    enhanced: 0,
    explanationsAdded: 0,
    tagsAdded: 0,
    difficultyAdded: 0,
    warningsFound: 0
  })

  // Fetch quizzes on mount
  useEffect(() => {
    fetchQuizzes()
    checkAuth()
  }, [])

  // Recalculate summary whenever questions change (e.g., after accepting AI suggestions)
  useEffect(() => {
    if (questions.length > 0) {
      const validCount = questions.filter(q => q.status === 'valid').length
      const warningCount = questions.filter(q => q.status === 'warning').length
      const errorCount = questions.filter(q => q.status === 'error').length

      setSummary({
        total: questions.length,
        valid: validCount,
        warnings: warningCount,
        errors: errorCount,
        breakdown: {
          multiple_choice: questions.filter(q => q.type === 'multiple_choice').length,
          true_false: questions.filter(q => q.type === 'true_false').length,
          fill_blank: questions.filter(q => q.type === 'fill_blank').length
        }
      })
    }
  }, [questions])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/check', { credentials: 'include' })
      const data = await response.json()
      console.log('[Import] Auth check:', data)
    } catch (err) {
      console.error('[Import] Auth check failed:', err)
    }
  }

  const fetchQuizzes = async () => {
    try {
      const supabase = createSupabaseClient()
      const { data, error } = await supabase
        .from('quizzes')
        .select('id, title, category, total_questions, updated_at')
        .order('updated_at', { ascending: false })
        .limit(50)
      
      if (error) throw error
      setQuizzes(data || [])
    } catch (err: any) {
      console.error('Failed to fetch quizzes:', err)
    }
  }

  const filteredQuizzes = quizzes.filter(quiz =>
    quiz.title.toLowerCase().includes(quizSearchQuery.toLowerCase()) ||
    quiz.category.toLowerCase().includes(quizSearchQuery.toLowerCase())
  )

  const filteredQuestions = questions.filter(q => 
    filterStatus === 'all' ? true : q.status === filterStatus
  )

  const selectedQuizData = quizzes.find(q => q.id === selectedQuiz)

  const handleFetchPreview = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('[Import] Fetching preview for:', sheetUrl)
      console.log('[Import] User:', user?.email, 'Role:', user?.role)

      // BEST PRACTICE: Verify user first with getUser()
      const supabase = createSupabaseClient()
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

      if (authError || !authUser) {
        throw new Error('Authentication required - please log in again')
      }

      // After verification, get session for token
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        throw new Error('No active session - please log in again')
      }
      
      const response = await fetch('/api/import/preview', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        credentials: 'include',
        body: JSON.stringify({ sheetUrl })
      })
      
      console.log('[Import] Response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('[Import] Error:', errorData)
        throw new Error(errorData.error || 'Failed to fetch preview')
      }
      
      const data = await response.json()
      console.log('[Import] Success:', data.summary)
      setQuestions(data.questions)
      setSummary(data.summary)
      // Reset AI enhancement state when fetching new preview
      setAiEnhanced(false)
      setAiStats({
        total: 0,
        enhanced: 0,
        explanationsAdded: 0,
        tagsAdded: 0,
        difficultyAdded: 0,
        warningsFound: 0
      })
      setCurrentStep('preview')
    } catch (err: any) {
      console.error('[Import] Exception:', err)
      setError(err.message || 'Failed to fetch preview')
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async () => {
    try {
      setCurrentStep('importing')
      setImportProgress(0)
      setError(null)
      
      // Filter only valid questions (no errors)
      const validQuestions = questions.filter(q => q.status === 'valid' || q.status === 'warning')
      
      if (validQuestions.length === 0) {
        throw new Error('No valid questions to import')
      }
      
      // Prepare request body
      const requestBody: any = {
        questions: validQuestions
      }
      
      if (importMode === 'new') {
        requestBody.newQuizData = {
          title: newQuizTitle,
          category: newQuizCategory
        }
      } else {
        requestBody.quizId = selectedQuiz
      }
      
      console.log('[Import] Importing questions:', {
        mode: importMode,
        count: validQuestions.length,
        quizId: selectedQuiz,
        newQuizTitle
      })
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setImportProgress(prev => Math.min(prev + 15, 90))
      }, 300)
      
      const response = await fetch('/api/import/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(requestBody)
      })
      
      clearInterval(progressInterval)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to import questions')
      }
      
      const data = await response.json()
      setImportProgress(100)
      setImportedCount(data.imported)
      setImportedQuizId(data.quizId) // Store the quiz ID for "View Quiz" button

      setTimeout(() => setCurrentStep('success'), 500)
    } catch (err: any) {
      setError(err.message || 'Failed to import questions')
      setCurrentStep('preview') // Go back to preview on error
    }
  }

  const handleAiEnhance = async () => {
    try {
      setAiEnhancing(true)
      setError(null)

      console.log('[Import] Requesting AI enhancement')

      const response = await fetch('/api/import/ai-enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          questions,
          options: {
            ...aiOptions,
            provider: aiProvider
          }
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to enhance questions')
      }

      const data = await response.json()
      console.log('[Import] AI enhancement complete:', data.stats)

      setQuestions(data.questions)
      setAiStats(data.stats)
      setAiEnhanced(true)
    } catch (err: any) {
      console.error('[Import] AI enhancement error:', err)
      setError(err.message || 'Failed to enhance questions with AI')
    } finally {
      setAiEnhancing(false)
    }
  }

  const acceptAiSuggestion = (rowIndex: number) => {
    setQuestions(prev => prev.map(q => {
      if (q.rowIndex === rowIndex && q.aiEnhancement) {
        // Apply AI enhancements
        const updatedQuestion = {
          ...q,
          explanation: q.aiEnhancement.explanation || q.explanation,
          tags: q.aiEnhancement.tags ? q.aiEnhancement.tags.join(', ') : q.tags,
          difficulty: q.aiEnhancement.difficulty || q.difficulty,
          aiAccepted: true
        }

        // Re-check warnings after applying AI suggestions
        const newIssues = []
        if (!updatedQuestion.explanation) {
          newIssues.push('Missing explanation (recommended)')
        }
        if (!updatedQuestion.difficulty) {
          newIssues.push('Missing difficulty level')
        }
        if (!updatedQuestion.tags) {
          newIssues.push('No tags specified')
        }

        // Update status: if no more issues, change from 'warning' to 'valid'
        return {
          ...updatedQuestion,
          status: newIssues.length === 0 ? 'valid' as const : q.status,
          issues: newIssues
        }
      }
      return q
    }))
  }

  const rejectAiSuggestion = (rowIndex: number) => {
    setQuestions(prev => prev.map(q => {
      if (q.rowIndex === rowIndex) {
        return {
          ...q,
          aiEnhancement: undefined,
          aiAccepted: false
        }
      }
      return q
    }))
  }

  const acceptAllAiSuggestions = () => {
    setQuestions(prev => prev.map(q => {
      if (q.aiEnhancement) {
        // Apply AI enhancements
        const updatedQuestion = {
          ...q,
          explanation: q.aiEnhancement.explanation || q.explanation,
          tags: q.aiEnhancement.tags ? q.aiEnhancement.tags.join(', ') : q.tags,
          difficulty: q.aiEnhancement.difficulty || q.difficulty,
          aiAccepted: true
        }

        // Re-check warnings after applying AI suggestions
        const newIssues = []
        if (!updatedQuestion.explanation) {
          newIssues.push('Missing explanation (recommended)')
        }
        if (!updatedQuestion.difficulty) {
          newIssues.push('Missing difficulty level')
        }
        if (!updatedQuestion.tags) {
          newIssues.push('No tags specified')
        }

        // Update status: if no more issues, change from 'warning' to 'valid'
        return {
          ...updatedQuestion,
          status: newIssues.length === 0 ? 'valid' as const : q.status,
          issues: newIssues
        }
      }
      return q
    }))
  }

  const toggleQuestion = (id: number) => {
    setExpandedQuestions(prev =>
      prev.includes(id) ? prev.filter(qid => qid !== id) : [...prev, id]
    )
  }

  const getStatusColor = (status: ValidationStatus) => {
    switch(status) {
      case 'valid': return 'text-green-600 bg-green-50 border-green-200'
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'error': return 'text-red-600 bg-red-50 border-red-200'
    }
  }

  const getStatusIcon = (status: ValidationStatus) => {
    switch(status) {
      case 'valid': return <CheckCircle className="w-5 h-5" />
      case 'warning': return <AlertCircle className="w-5 h-5" />
      case 'error': return <X className="w-5 h-5" />
    }
  }

  return (
    <AdminRoute>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <span>Admin</span>
              <span>/</span>
              <span className="text-gray-900 font-medium">Import</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Bulk Import</h1>
            <p className="text-gray-600 mt-1">Import content from Google Sheets or CSV files</p>
          </div>

          {/* Import Type Toggle (like Auth Page) */}
          <div className="mb-6">
            <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
              <button
                onClick={() => setImportType('quizzes')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  importType === 'quizzes'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Import Quizzes
              </button>
              <button
                onClick={() => setImportType('courses')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  importType === 'courses'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Import Courses
              </button>
            </div>
          </div>

          {/* Step Indicator */}
          <div className="mb-6 flex items-center justify-center gap-2">
            <Badge variant={currentStep === 'form' ? 'secondary' : 'outline'}>1. Configure</Badge>
            <div className="w-8 h-px bg-gray-300" />
            <Badge variant={currentStep === 'preview' ? 'secondary' : 'outline'}>2. Preview</Badge>
            <div className="w-8 h-px bg-gray-300" />
            <Badge variant={currentStep === 'importing' ? 'secondary' : 'outline'}>3. Import</Badge>
            <div className="w-8 h-px bg-gray-300" />
            <Badge variant={currentStep === 'success' ? 'secondary' : 'outline'}>4. Success</Badge>
          </div>

          {/* Form Screen */}
          {currentStep === 'form' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Import {importType === 'quizzes' ? 'Quiz Questions' : 'Course Content'}
                </CardTitle>
                <CardDescription>
                  Configure your import settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Target Selection */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm">1</div>
                    Select Target {importType === 'quizzes' ? 'Quiz' : 'Course'}
                  </h3>
                  
                  <div className="ml-8 space-y-3">
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          checked={importMode === 'new'}
                          onChange={() => setImportMode('new')}
                          className="w-4 h-4"
                        />
                        <span>Create new {importType === 'quizzes' ? 'quiz' : 'course'}</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          checked={importMode === 'existing'}
                          onChange={() => setImportMode('existing')}
                          className="w-4 h-4"
                        />
                        <span>Add to existing</span>
                      </label>
                    </div>

                    {importMode === 'new' ? (
                      <Input
                        placeholder={`New ${importType === 'quizzes' ? 'Quiz' : 'Course'} Name`}
                        value={newQuizTitle}
                        onChange={(e) => setNewQuizTitle(e.target.value)}
                      />
                    ) : (
                      <div className="space-y-2">
                        <Label>Selected {importType === 'quizzes' ? 'Quiz' : 'Course'}</Label>
                        <Button
                          variant="outline"
                          className="w-full justify-between"
                          onClick={() => setShowQuizModal(true)}
                        >
                          {selectedQuizData ? (
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{selectedQuizData.title}</span>
                              <span className="text-xs text-gray-500">• {selectedQuizData.category}</span>
                            </div>
                          ) : (
                            <span className="text-gray-500">Select a {importType === 'quizzes' ? 'quiz' : 'course'}...</span>
                          )}
                          <FolderOpen className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t" />

                {/* Import Source */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm">2</div>
                    Choose Import Method
                  </h3>

                  <div className="ml-8 space-y-3">
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          checked={sourceType === 'sheets'}
                          onChange={() => setSourceType('sheets')}
                          className="w-4 h-4"
                        />
                        <FileSpreadsheet className="w-4 h-4" />
                        <span>Google Sheets</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          checked={sourceType === 'csv'}
                          onChange={() => setSourceType('csv')}
                          className="w-4 h-4"
                        />
                        <Upload className="w-4 h-4" />
                        <span>CSV File</span>
                      </label>
                    </div>

                    {sourceType === 'sheets' && (
                      <div className="space-y-2">
                        <Label>Sheet URL</Label>
                        <Input
                          placeholder="https://docs.google.com/spreadsheets/d/..."
                          value={sheetUrl}
                          onChange={(e) => setSheetUrl(e.target.value)}
                        />
                        <Alert>
                          <Info className="w-4 h-4" />
                          <AlertDescription className="text-xs">
                            Share with: <strong>import@acadex.com</strong>
                          </AlertDescription>
                        </Alert>
                      </div>
                    )}

                    <Button variant="link" size="sm" className="gap-2 pl-0">
                      <Download className="w-4 h-4" />
                      Download {importType === 'quizzes' ? 'Quiz' : 'Course'} Template
                    </Button>
                  </div>
                </div>

                <div className="border-t" />

                {/* AI Options - Now Available */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    AI Enhancement (Optional)
                    <Badge variant="outline" className={`ml-2 text-xs ${
                      aiProvider === 'claude'
                        ? 'bg-purple-50 text-purple-600 border-purple-200'
                        : 'bg-blue-50 text-blue-600 border-blue-200'
                    }`}>
                      {aiProvider === 'claude' ? 'Powered by Claude' : 'Powered by Gemini'}
                    </Badge>
                  </h3>

                  {/* AI Provider Selection */}
                  <div className="ml-8 space-y-3">
                    <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <span className="text-sm font-medium text-gray-700">AI Provider:</span>
                      <div className="flex gap-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="aiProvider"
                            checked={aiProvider === 'claude'}
                            onChange={() => setAiProvider('claude')}
                            className="w-4 h-4 cursor-pointer"
                          />
                          <span className="text-sm text-gray-700">Claude (Anthropic)</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="aiProvider"
                            checked={aiProvider === 'gemini'}
                            onChange={() => setAiProvider('gemini')}
                            className="w-4 h-4 cursor-pointer"
                          />
                          <span className="text-sm text-gray-700">Gemini (Google)</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="ml-8 space-y-2">
                    {Object.entries({
                      generateExplanations: 'Generate missing explanations',
                      suggestDifficulty: 'Auto-suggest difficulty levels',
                      autoTag: 'Auto-tag questions by topic',
                      validateAnswers: 'Validate answers with AI'
                    }).map(([key, label]) => (
                      <label key={key} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={aiOptions[key as keyof typeof aiOptions]}
                          onChange={(e) => setAiOptions(prev => ({
                            ...prev,
                            [key]: e.target.checked
                          }))}
                          className="w-4 h-4 cursor-pointer"
                        />
                        <span className="text-sm text-gray-700">{label}</span>
                      </label>
                    ))}
                  </div>
                  <p className="ml-8 text-xs text-gray-500 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    AI will suggest improvements in the preview step
                  </p>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline">Cancel</Button>
                  <Button onClick={handleFetchPreview}>
                    Fetch & Preview →
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Preview Screen */}
          {currentStep === 'preview' && (
            <div className="space-y-4">
              {/* Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>📊 Import Preview</CardTitle>
                  <CardDescription>
                    Review {importType === 'quizzes' ? 'questions' : 'content'} before importing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{summary.total}</div>
                      <div className="text-xs text-gray-600">Total</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{summary.valid}</div>
                      <div className="text-xs text-gray-600">Valid</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">{summary.warnings}</div>
                      <div className="text-xs text-gray-600">Warnings</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{summary.errors}</div>
                      <div className="text-xs text-gray-600">Errors</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Enhancement Section */}
              {!aiEnhanced && Object.values(aiOptions).some(v => v) && (
                <Card className={`border-2 ${
                  aiProvider === 'claude'
                    ? 'border-purple-200 bg-purple-50/50'
                    : 'border-blue-200 bg-blue-50/50'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          aiProvider === 'claude'
                            ? 'bg-purple-100'
                            : 'bg-blue-100'
                        }`}>
                          <Sparkles className={`w-5 h-5 ${
                            aiProvider === 'claude'
                              ? 'text-purple-600'
                              : 'text-blue-600'
                          }`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">AI Enhancement Available</h3>
                          <p className="text-sm text-gray-600">
                            Let {aiProvider === 'claude' ? 'Claude' : 'Gemini'} analyze and improve your questions
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={handleAiEnhance}
                        disabled={aiEnhancing}
                        className="gap-2"
                      >
                        {aiEnhancing ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Enhancing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            Enhance with AI
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* AI Enhancement Stats */}
              {aiEnhanced && aiStats.enhanced > 0 && (
                <Card className="border-2 border-green-200 bg-green-50/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">AI Enhancement Complete</h3>
                          <div className="text-sm text-gray-600 flex gap-4 mt-1">
                            {aiStats.explanationsAdded > 0 && <span>✨ {aiStats.explanationsAdded} explanations</span>}
                            {aiStats.tagsAdded > 0 && <span>🏷️ {aiStats.tagsAdded} tagged</span>}
                            {aiStats.difficultyAdded > 0 && <span>📊 {aiStats.difficultyAdded} difficulty set</span>}
                            {aiStats.warningsFound > 0 && <span>⚠️ {aiStats.warningsFound} warnings</span>}
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={acceptAllAiSuggestions}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        <Check className="w-4 h-4" />
                        Accept All
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Filter Tabs */}
              <div className="flex gap-2">
                {(['all', 'valid', 'warning', 'error'] as const).map(status => (
                  <Button
                    key={status}
                    variant={filterStatus === status ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => setFilterStatus(status)}
                  >
                    {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                    {status !== 'all' && (
                      <Badge variant="outline" className="ml-2">
                        {status === 'warning' ? summary.warnings : status === 'error' ? summary.errors : summary.valid}
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>

              {/* Questions */}
              <div className="space-y-3">
                {filteredQuestions.map((q, index) => (
                  <Card key={`question-${q.rowIndex}-${index}`} className={`border-2 ${getStatusColor(q.status)}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div>{getStatusIcon(q.status)}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">Q{q.rowIndex}</span>
                            <Badge variant="outline" className="text-xs">{q.type}</Badge>
                            <Badge variant="outline" className="text-xs">{q.points} pts</Badge>
                            <Badge variant="outline" className="text-xs">{q.difficulty}</Badge>
                          </div>
                          <p className="font-medium mb-2">{q.question}</p>
                          {q.issues && (
                            <div className="text-sm space-y-1">
                              {q.issues.map((issue, i) => (
                                <div key={i} className="flex items-center gap-2 text-current">
                                  <AlertCircle className="w-3 h-3" />
                                  <span>{issue}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => toggleQuestion(q.rowIndex)}>
                          {expandedQuestions.includes(q.rowIndex) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>
                      </div>
                      
                      {/* AI Suggestions */}
                      {q.aiEnhancement && !q.aiAccepted && (
                        <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-purple-600" />
                              <span className="text-sm font-semibold text-purple-900">AI Suggestions</span>
                              <Badge variant="outline" className="text-xs">
                                {Math.round(q.aiEnhancement.confidence * 100)}% confident
                              </Badge>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => acceptAiSuggestion(q.rowIndex)}
                                className="h-7 px-2 text-xs gap-1 bg-white hover:bg-green-50 hover:border-green-300"
                              >
                                <Check className="w-3 h-3" />
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => rejectAiSuggestion(q.rowIndex)}
                                className="h-7 px-2 text-xs gap-1 bg-white hover:bg-red-50 hover:border-red-300"
                              >
                                <X className="w-3 h-3" />
                                Reject
                              </Button>
                            </div>
                          </div>
                          <div className="space-y-2 text-sm">
                            {q.aiEnhancement.explanation && (
                              <div className="flex gap-2">
                                <span className="font-medium text-gray-700">Explanation:</span>
                                <span className="text-gray-600">{q.aiEnhancement.explanation}</span>
                              </div>
                            )}
                            {q.aiEnhancement.tags && q.aiEnhancement.tags.length > 0 && (
                              <div className="flex gap-2 items-center flex-wrap">
                                <span className="font-medium text-gray-700">Tags:</span>
                                {q.aiEnhancement.tags.map((tag, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
                                ))}
                              </div>
                            )}
                            {q.aiEnhancement.difficulty && (
                              <div className="flex gap-2">
                                <span className="font-medium text-gray-700">Difficulty:</span>
                                <Badge variant="outline" className="text-xs">{q.aiEnhancement.difficulty}</Badge>
                              </div>
                            )}
                            {q.aiEnhancement.warnings && q.aiEnhancement.warnings.length > 0 && (
                              <div className="space-y-1">
                                <span className="font-medium text-orange-700">⚠️ AI Warnings:</span>
                                {q.aiEnhancement.warnings.map((warning, i) => (
                                  <div key={i} className="text-orange-600 ml-5 text-xs">• {warning}</div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {q.aiAccepted && (
                        <div className="mt-4 p-2 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-2 text-sm text-green-700">
                            <CheckCircle className="w-4 h-4" />
                            <span className="font-medium">AI suggestions applied</span>
                          </div>
                        </div>
                      )}

                      {/* Expanded Details */}
                      {expandedQuestions.includes(q.rowIndex) && (
                        <div className="mt-4 pt-4 border-t space-y-2 text-sm">
                          {q.type === 'multiple_choice' && (q.option_a || q.option_b || q.option_c || q.option_d) && (
                            <div>
                              <strong>Options:</strong>
                              <ul className="ml-4 mt-1 space-y-1">
                                {q.option_a && (
                                  <li key="opt-a" className={Number(q.correct_answer) === 0 ? 'text-green-600 font-medium' : ''}>
                                    A. {q.option_a} {Number(q.correct_answer) === 0 && '✓'}
                                  </li>
                                )}
                                {q.option_b && (
                                  <li key="opt-b" className={Number(q.correct_answer) === 1 ? 'text-green-600 font-medium' : ''}>
                                    B. {q.option_b} {Number(q.correct_answer) === 1 && '✓'}
                                  </li>
                                )}
                                {q.option_c && (
                                  <li key="opt-c" className={Number(q.correct_answer) === 2 ? 'text-green-600 font-medium' : ''}>
                                    C. {q.option_c} {Number(q.correct_answer) === 2 && '✓'}
                                  </li>
                                )}
                                {q.option_d && (
                                  <li key="opt-d" className={Number(q.correct_answer) === 3 ? 'text-green-600 font-medium' : ''}>
                                    D. {q.option_d} {Number(q.correct_answer) === 3 && '✓'}
                                  </li>
                                )}
                              </ul>
                            </div>
                          )}
                          {q.type === 'true_false' && q.correct_answer_text && (
                            <div>
                              <strong>Correct Answer:</strong> <span className="text-green-600 font-medium">{q.correct_answer_text}</span>
                            </div>
                          )}
                          {q.type === 'fill_blank' && q.correct_answer_text && (
                            <div>
                              <strong>Correct Answer:</strong> <span className="text-green-600 font-medium">{q.correct_answer_text}</span>
                            </div>
                          )}
                          {q.explanation && (
                            <div>
                              <strong>Explanation:</strong> {q.explanation}
                            </div>
                          )}
                          {q.tags && q.tags.length > 0 && (
                            <div className="flex gap-1 flex-wrap">
                              <strong>Tags:</strong>
                              {(Array.isArray(q.tags) ? q.tags : [q.tags]).map((tag, i) => (
                                <Badge key={i} variant="outline" className="text-xs">{tag}</Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Actions */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <Button variant="outline" onClick={() => {
                      setCurrentStep('form')
                      // Don't reset questions/summary so user can go back and forth
                    }}>
                      ← Back
                    </Button>
                    <div className="flex items-center gap-3">
                      {summary.warnings > 0 && summary.errors === 0 && (
                        <div className="flex items-center gap-2 text-sm text-yellow-700 bg-yellow-50 px-3 py-2 rounded-lg border border-yellow-200">
                          <AlertCircle className="w-4 h-4" />
                          <span>{summary.warnings} item{summary.warnings !== 1 ? 's' : ''} with warnings will be imported</span>
                        </div>
                      )}
                      {summary.errors > 0 && (
                        <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                          <X className="w-4 h-4" />
                          <span>Fix {summary.errors} error{summary.errors !== 1 ? 's' : ''} before importing</span>
                        </div>
                      )}
                      <Button onClick={handleImport} disabled={summary.errors > 0}>
                        Import {summary.valid + summary.warnings} {importType === 'quizzes' ? 'Questions' : 'Items'} →
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Importing Screen */}
          {currentStep === 'importing' && (
            <Card className="max-w-xl mx-auto">
              <CardContent className="p-8 text-center space-y-6">
                <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto" />
                <div>
                  <h2 className="text-2xl font-bold mb-2">Importing...</h2>
                  <p className="text-gray-600">Please wait while we process your data</p>
                </div>
                <Progress value={importProgress} className="h-2" />
                <p className="text-sm text-gray-600">{importProgress}% Complete</p>
              </CardContent>
            </Card>
          )}

          {/* Success Screen */}
          {currentStep === 'success' && (
            <Card className="max-w-xl mx-auto">
              <CardContent className="p-8 text-center space-y-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">Success! 🎉</h2>
                  <p className="text-gray-600">
                    Imported <strong>{importedCount} {importType === 'quizzes' ? 'questions' : 'items'}</strong> successfully
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-6 text-sm">
                  <p className="font-semibold mb-2">Summary:</p>
                  <div className="space-y-1 text-left">
                    <div>• Multiple Choice: {summary?.breakdown?.multiple_choice || 0}</div>
                    <div>• True/False: {summary?.breakdown?.true_false || 0}</div>
                    <div>• Fill in Blank: {summary?.breakdown?.fill_blank || 0}</div>
                  </div>
                </div>
                <div className="flex gap-3 justify-center">
                  <Button variant="outline" onClick={() => {
                    setCurrentStep('form')
                    setSelectedQuiz('')
                    setNewQuizTitle('')
                    setSheetUrl('')
                  }}>
                    Import More
                  </Button>
                  <Button onClick={() => {
                    if (importedQuizId) {
                      router.push(`/admin/quizzes/${importedQuizId}/edit`)
                    }
                  }}>
                    View {importType === 'quizzes' ? 'Quiz' : 'Course'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Quiz Selection Modal */}
      {showQuizModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[600px] flex flex-col">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle>Select {importType === 'quizzes' ? 'Quiz' : 'Course'}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowQuizModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="relative mt-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by name or course..."
                  value={quizSearchQuery}
                  onChange={(e) => setQuizSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                {filteredQuizzes.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                    <p>No {importType} found</p>
                  </div>
                ) : (
                  filteredQuizzes.map(quiz => (
                    <button
                      key={quiz.id}
                      onClick={() => {
                        setSelectedQuiz(quiz.id)
                        setShowQuizModal(false)
                      }}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                        selectedQuiz === quiz.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{quiz.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{quiz.category}</p>
                          <div className="flex gap-3 mt-2 text-xs text-gray-500">
                            <span>{quiz.total_questions} questions</span>
                            <span>•</span>
                            <span>Updated {new Date(quiz.updated_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        {selectedQuiz === quiz.id && (
                          <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 ml-2" />
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </CardContent>
            <div className="border-t p-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowQuizModal(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowQuizModal(false)} disabled={!selectedQuiz}>
                Select
              </Button>
            </div>
          </Card>
        </div>
      )}
    </AdminRoute>
  )
}
