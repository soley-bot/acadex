'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  CheckCircle, 
  X, 
  Edit3, 
  Save, 
  ArrowLeft, 
  AlertTriangle,
  Clock,
  User,
  Globe,
  HelpCircle,
  BookOpen,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correct_answer: number
  explanation?: string
  difficulty: 'easy' | 'medium' | 'hard'
}

interface ContentReview {
  id: string
  content_type: string
  title: string
  content?: string
  questions?: QuizQuestion[]
  ai_confidence_score: number
  priority: string
  created_at: string
  estimated_review_time: number
}

interface QualityCheck {
  id: string
  category: string
  label: string
  status: 'passed' | 'failed' | 'warning' | 'unchecked'
  notes?: string
}

export default function ContentReviewPage() {
  const params = useParams()
  const router = useRouter()
  const [reviewItem, setReviewItem] = useState<ContentReview | null>(null)
  const [editedContent, setEditedContent] = useState('')
  const [editedQuestions, setEditedQuestions] = useState<QuizQuestion[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set())
  const [qualityChecks, setQualityChecks] = useState<QualityCheck[]>([])
  const [reviewNotes, setReviewNotes] = useState('')
  const [timeSpent, setTimeSpent] = useState(0)

  useEffect(() => {
    const fetchReviewItem = async () => {
      try {
        const isQuiz = Math.random() > 0.5 // Simulate mixed content types
        
        if (isQuiz) {
          // Mock quiz data
          const mockQuizItem: ContentReview = {
            id: params.id as string,
            content_type: 'quiz',
            title: 'Quiz: Present Simple Practice (8 questions)',
            questions: [
              {
                id: '1',
                question: 'Which sentence uses the present simple correctly?',
                options: [
                  'She is working at a bank every day',
                  'She works at a bank',
                  'She working at a bank',
                  'She will work at a bank'
                ],
                correct_answer: 1,
                explanation: 'The present simple is used for permanent situations and facts. "She works at a bank" correctly uses the base form with third person singular.',
                difficulty: 'easy'
              },
              {
                id: '2',
                question: 'Complete the sentence: "They _____ coffee in the morning."',
                options: [
                  'drinks',
                  'drinking',
                  'drink',
                  'are drink'
                ],
                correct_answer: 2,
                explanation: 'With plural subjects like "they", we use the base form of the verb without adding -s.',
                difficulty: 'easy'
              },
              {
                id: '3',
                question: 'Which question is formed correctly in present simple?',
                options: [
                  'Do you speaks English?',
                  'Does you speak English?',
                  'Do you speak English?',
                  'Are you speak English?'
                ],
                correct_answer: 2,
                explanation: 'Questions with "you" use "Do" + base form of the verb.',
                difficulty: 'medium'
              }
            ],
            ai_confidence_score: 0.92,
            priority: 'medium',
            created_at: new Date().toISOString(),
            estimated_review_time: 8
          }
          
          setQualityChecks([
            { id: '1', category: 'clarity', label: 'Question Clarity', status: 'unchecked' },
            { id: '2', category: 'accuracy', label: 'Answer Accuracy', status: 'unchecked' },
            { id: '3', category: 'distractors', label: 'Distractor Quality', status: 'unchecked' },
            { id: '4', category: 'culture', label: 'Cultural Relevance', status: 'unchecked' },
            { id: '5', category: 'difficulty', label: 'Appropriate Difficulty', status: 'unchecked' },
            { id: '6', category: 'grammar', label: 'Grammar Check', status: 'unchecked' },
            { id: '7', category: 'objective', label: 'Learning Objective', status: 'unchecked' },
            { id: '8', category: 'logic', label: 'Multiple Choice Logic', status: 'unchecked' }
          ])
          
          setReviewItem(mockQuizItem)
          setEditedQuestions(mockQuizItem.questions || [])
        } else {
          // Mock lesson data (existing code)
          const mockLessonItem: ContentReview = {
            id: params.id as string,
            content_type: 'lesson',
            title: 'Grammar Lesson - Present Simple',
            content: `The present simple tense is used for habits and facts. We use it when we talk about things that happen regularly or are always true.

Examples:
- I eat breakfast every day
- The sun rises in the east
- She works at a hospital

Formation:
Subject + base verb (+ s/es for third person singular)

Practice:
Complete these sentences with the correct form of the verb in brackets.`,
            ai_confidence_score: 0.85,
            priority: 'high',
            created_at: new Date().toISOString(),
            estimated_review_time: 5
          }
          
          setQualityChecks([
            { id: '1', category: 'grammar', label: 'Grammar Accuracy', status: 'unchecked' },
            { id: '2', category: 'clarity', label: 'Clear Explanations', status: 'unchecked' },
            { id: '3', category: 'examples', label: 'Good Examples', status: 'unchecked' },
            { id: '4', category: 'culture', label: 'Cultural Relevance', status: 'unchecked' },
            { id: '5', category: 'difficulty', label: 'Appropriate Difficulty', status: 'unchecked' },
            { id: '6', category: 'engagement', label: 'Engagement Level', status: 'unchecked' }
          ])
          
          setReviewItem(mockLessonItem)
          setEditedContent(mockLessonItem.content || '')
        }
      } catch (error) {
        console.error('Failed to fetch review item:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchReviewItem()
    
    // Start timer
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [params.id])

  const updateQualityCheck = (id: string, status: QualityCheck['status']) => {
    setQualityChecks(prev => 
      prev.map(check => 
        check.id === id ? { ...check, status } : check
      )
    )
  }

  const getStatusIcon = (status: QualityCheck['status']) => {
    switch (status) {
      case 'passed': return <CheckCircle size={16} className="text-success" />
      case 'failed': return <X size={16} className="text-destructive" />
      case 'warning': return <AlertTriangle size={16} className="text-warning" />
      default: return <div className="w-4 h-4 rounded-full border-2 border-muted" />
    }
  }

  const toggleQuestionExpanded = (questionId: string) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(questionId)) {
        newSet.delete(questionId)
      } else {
        newSet.add(questionId)
      }
      return newSet
    })
  }

  const updateQuestion = (questionId: string, field: keyof QuizQuestion, value: any) => {
    setEditedQuestions(prev => 
      prev.map(q => 
        q.id === questionId ? { ...q, [field]: value } : q
      )
    )
  }

  const handleApprove = async () => {
    console.log('Approving content with notes:', reviewNotes)
    router.push('/admin/content-review')
  }

  const handleReject = async () => {
    console.log('Rejecting content with notes:', reviewNotes)
    router.push('/admin/content-review')
  }

  const handleNeedsRevision = async () => {
    console.log('Marking as needs revision with notes:', reviewNotes)
    if (reviewItem?.content_type === 'quiz') {
      console.log('Edited questions:', editedQuestions)
    } else {
      console.log('Edited content:', editedContent)
    }
    router.push('/admin/content-review')
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-success'
      case 'medium': return 'text-warning'
      case 'hard': return 'text-destructive'
      default: return 'text-muted-foreground'
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-2 gap-6">
            <div className="h-96 bg-muted rounded"></div>
            <div className="h-96 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!reviewItem) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Review item not found</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              {reviewItem.content_type === 'quiz' ? (
                <HelpCircle size={20} className="text-primary" />
              ) : (
                <BookOpen size={20} className="text-secondary" />
              )}
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                reviewItem.content_type === 'quiz' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'
              }`}>
                {reviewItem.content_type.toUpperCase()}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              {reviewItem.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock size={14} />
                Time spent: {formatTime(timeSpent)}
              </span>
              <span>AI Confidence: {Math.round(reviewItem.ai_confidence_score * 100)}%</span>
              <span>Est. review time: {reviewItem.estimated_review_time} min</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Content Display */}
        <Card variant="base">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                {reviewItem.content_type === 'quiz' ? 'Quiz Questions' : 'AI Generated Content'}
              </span>
              {reviewItem.content_type !== 'quiz' && (
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-2 text-sm bg-muted hover:bg-muted/80 px-3 py-1 rounded-lg transition-colors"
                >
                  <Edit3 size={14} />
                  {isEditing ? 'View Mode' : 'Edit Mode'}
                </button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reviewItem.content_type === 'quiz' ? (
              <div className="space-y-4">
                {editedQuestions.map((question, index) => (
                  <Card key={question.id} variant="base" className="border">
                    <CardHeader 
                      className="cursor-pointer"
                      onClick={() => toggleQuestionExpanded(question.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="bg-primary/10 text-primary px-2 py-1 rounded text-sm font-medium">
                            Q{index + 1}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            question.difficulty === 'easy' ? 'bg-success/10 text-success' :
                            question.difficulty === 'medium' ? 'bg-warning/10 text-warning' :
                            'bg-destructive/10 text-destructive'
                          }`}>
                            {question.difficulty}
                          </span>
                        </div>
                        {expandedQuestions.has(question.id) ? 
                          <ChevronUp size={16} /> : <ChevronDown size={16} />
                        }
                      </div>
                      <h4 className="font-medium text-foreground text-left">
                        {question.question}
                      </h4>
                    </CardHeader>
                    
                    {expandedQuestions.has(question.id) && (
                      <CardContent className="space-y-3">
                        <div className="space-y-2">
                          {question.options.map((option, optionIndex) => (
                            <div 
                              key={optionIndex}
                              className={`p-3 rounded-lg border ${
                                optionIndex === question.correct_answer 
                                  ? 'border-success bg-success/10 text-success-foreground' 
                                  : 'border-border bg-muted/30'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm">
                                  {String.fromCharCode(65 + optionIndex)}.
                                </span>
                                <span>{option}</span>
                                {optionIndex === question.correct_answer && (
                                  <CheckCircle size={16} className="text-success ml-auto" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {question.explanation && (
                          <div className="border-t pt-3">
                            <h5 className="font-medium text-foreground mb-1">Explanation:</h5>
                            <p className="text-muted-foreground text-sm">{question.explanation}</p>
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              // Lesson content (existing code)
              isEditing ? (
                <div className="space-y-4">
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="w-full h-64 p-3 border border-border rounded-lg resize-none bg-background text-foreground"
                    placeholder="Edit the content here..."
                  />
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex items-center gap-2 bg-primary hover:bg-secondary text-white hover:text-black px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    <Save size={16} />
                    Save Changes
                  </button>
                </div>
              ) : (
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-foreground">
                    {editedContent}
                  </div>
                </div>
              )
            )}
          </CardContent>
        </Card>

        {/* Review Panel */}
        <div className="space-y-6">
          {/* Quality Checklist */}
          <Card variant="base">
            <CardHeader>
              <CardTitle>Quality Checklist</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {qualityChecks.map((check) => (
                <div key={check.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <span className="font-medium text-foreground">{check.label}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQualityCheck(check.id, 'passed')}
                      className={`p-1 rounded ${check.status === 'passed' ? 'bg-success/20' : 'hover:bg-success/10'}`}
                    >
                      <CheckCircle size={16} className="text-success" />
                    </button>
                    <button
                      onClick={() => updateQualityCheck(check.id, 'warning')}
                      className={`p-1 rounded ${check.status === 'warning' ? 'bg-warning/20' : 'hover:bg-warning/10'}`}
                    >
                      <AlertTriangle size={16} className="text-warning" />
                    </button>
                    <button
                      onClick={() => updateQualityCheck(check.id, 'failed')}
                      className={`p-1 rounded ${check.status === 'failed' ? 'bg-destructive/20' : 'hover:bg-destructive/10'}`}
                    >
                      <X size={16} className="text-destructive" />
                    </button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Review Notes */}
          <Card variant="base">
            <CardHeader>
              <CardTitle>Review Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                className="w-full h-24 p-3 border border-border rounded-lg resize-none bg-background text-foreground"
                placeholder={`Add notes about this ${reviewItem.content_type}...`}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <Card variant="base">
            <CardHeader>
              <CardTitle>Review Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <button
                onClick={handleApprove}
                className="w-full bg-success hover:bg-success/90 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                ✅ Approve & Publish
              </button>
              <button
                onClick={handleNeedsRevision}
                className="w-full bg-warning hover:bg-warning/90 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                📝 Needs Minor Edits
              </button>
              <button
                onClick={handleReject}
                className="w-full bg-destructive hover:bg-destructive/90 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                ❌ Reject Content
              </button>
              <button
                onClick={() => router.push('/admin/content-review')}
                className="w-full bg-muted hover:bg-muted/80 text-muted-foreground px-6 py-3 rounded-lg font-medium transition-colors"
              >
                ⏭️ Skip for Now
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
