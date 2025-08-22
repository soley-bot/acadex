'use client'

import { logger } from '@/lib/logger'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Pagination } from '@/components/ui/Pagination'
import { Search, Plus, Brain, Clock, Users, BarChart3, Edit, Trash2, Eye, ChevronDown, Settings, EyeOff, Check } from 'lucide-react'
import { supabase, Quiz as BaseQuiz } from '@/lib/supabase'

// Extended Quiz interface with calculated statistics
interface Quiz extends BaseQuiz {
  attempts_count?: number
  average_score?: number
}
import { QuizForm } from '@/components/admin/QuizForm'
import { QuizViewModal } from '@/components/admin/QuizViewModal'
import { CategoryManagement } from '@/components/admin/CategoryManagement'
import { InlineAIQuizGenerator } from '@/components/admin/InlineAIQuizGenerator'
import { QuizAnalytics } from '@/components/admin/QuizAnalytics'
import { DeleteModal } from '@/components/ui/DeleteModal'
import { EnhancedDeleteModal } from '@/components/admin/EnhancedDeleteModal'
import { ContentReviewPanel } from '@/components/admin/ContentReviewPanel'

// Types for AI Quiz Generation
interface GeneratedQuiz {
  title: string
  description: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration_minutes: number
  questions: {
    question: string
    question_type: string
    options?: string[]
    correct_answer?: number
    correct_answer_text?: string
    explanation: string
  }[]
}

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  })
  
  // Modal states
  const [showQuizForm, setShowQuizForm] = useState(false)
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingQuiz, setDeletingQuiz] = useState<Quiz | null>(null)
  const [showEnhancedDeleteModal, setShowEnhancedDeleteModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [viewingQuiz, setViewingQuiz] = useState<Quiz | null>(null)
  const [showCategoryManagement, setShowCategoryManagement] = useState(false)
  const [showAIGenerator, setShowAIGenerator] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [contentReviewRefresh, setContentReviewRefresh] = useState(0)

  // Refs for click outside
  const categoryDropdownRef = useRef<HTMLDivElement>(null)

  // Fetch quizzes with pagination
  const fetchQuizzes = useCallback(async (page = 1) => {
    try {
      setLoading(true)
      setError(null)
      
      const limit = 12
      const from = (page - 1) * limit
      const to = from + limit - 1

      const { data, error, count } = await supabase
        .from('quizzes')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to)

      if (error) throw error

      // Get attempt counts and average scores for each quiz
      const quizIds = data.map((quiz: { id: string }) => quiz.id)
      
      const { data: attempts, error: attemptsError } = await supabase
        .from('quiz_attempts')
        .select('quiz_id, score, total_questions')
        .in('quiz_id', quizIds)

      if (attemptsError) {
        logger.error('Error fetching quiz attempts:', attemptsError)
      }

      // Get actual question counts from database
      const { data: questionCounts, error: questionCountError } = await supabase
        .from('quiz_questions')
        .select('quiz_id')
        .in('quiz_id', quizIds)

      if (questionCountError) {
        logger.error('Error fetching question counts:', questionCountError)
      }

      // Process quizzes with actual statistics
      const processedQuizzes = data.map((quiz: any) => {
        const quizAttempts = attempts?.filter((attempt: any) => attempt.quiz_id === quiz.id) || []
        const actualQuestionCount = questionCounts?.filter((q: any) => q.quiz_id === quiz.id).length || 0
        
        const attemptsCount = quizAttempts.length
        const averageScore = attemptsCount > 0 
          ? Math.round(quizAttempts.reduce((sum: number, attempt: any) => sum + attempt.score, 0) / attemptsCount)
          : 0

        return {
          ...quiz,
          total_questions: actualQuestionCount, // Use actual count from database
          attempts_count: attemptsCount,
          average_score: averageScore
        }
      })

      setQuizzes(processedQuizzes || [])
      setPagination({
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      })
    } catch (err) {
      logger.error('Error fetching quizzes:', err)
      setError('Failed to load quizzes. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchQuizzes(pagination.page)
  }, [fetchQuizzes, pagination.page])

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Filter quizzes based on search and filters
  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quiz.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(quiz.category)
    const matchesDifficulty = selectedDifficulty === 'all' || quiz.difficulty === selectedDifficulty
    return matchesSearch && matchesCategory && matchesDifficulty
  })

  // Calculate statistics
  const quizStats = {
    total: quizzes.length,
    published: quizzes.filter(q => q.is_published).length,
    draft: quizzes.filter(q => !q.is_published).length,
    totalQuestions: quizzes.reduce((sum, q) => sum + (q.total_questions || 0), 0),
    averagePassingScore: quizzes.length > 0 
      ? Math.round(quizzes.reduce((sum, q) => sum + (q.passing_score || 70), 0) / quizzes.length)
      : 0
  }

  // Get unique categories and difficulties
  const categories = ['all', ...Array.from(new Set(quizzes.map(q => q.category)))]
  const difficulties = ['all', 'beginner', 'intermediate', 'advanced']

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-success/20 text-success'
      case 'intermediate': return 'bg-warning/20 text-warning'
      case 'advanced': return 'bg-destructive/20 text-destructive'
      default: return 'bg-muted/40 text-muted-foreground'
    }
  }

  const getStatusBadge = (isPublished: boolean) => {
    return isPublished 
      ? 'bg-success/20 text-success border border-success/30'
      : 'bg-warning/20 text-warning border border-warning/30'
  }

  const handleCreateQuiz = () => {
    setEditingQuiz(null)
    setShowQuizForm(true)
  }

  const handleAIQuizGenerated = async (generatedQuiz: GeneratedQuiz) => {
    try {
      setLoading(true)
      
      // Create the quiz in the database
      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .insert({
          title: generatedQuiz.title,
          description: generatedQuiz.description,
          category: generatedQuiz.category,
          difficulty: generatedQuiz.difficulty,
          duration_minutes: generatedQuiz.duration_minutes,
          passing_score: 70, // Default passing score
          total_questions: generatedQuiz.questions.length,
          is_published: false
        })
        .select()
        .single()

      if (quizError) throw quizError

      // Insert questions with proper handling of different answer types
      const questionsToInsert = generatedQuiz.questions.map((q, index) => {
        let correct_answer: number
        let correct_answer_text: string | null
        
        // Handle different question types properly
        if (['fill_blank', 'essay'].includes(q.question_type)) {
          // Text-based answers
          correct_answer = 0  // Default value for database constraint
          correct_answer_text = q.correct_answer_text || ''
        } else {
          // Choice-based answers (multiple_choice, single_choice, true_false)  
          correct_answer = q.correct_answer as number
          correct_answer_text = null
        }
        
        return {
          quiz_id: quiz.id,
          question: q.question,
          question_type: q.question_type,
          options: q.options || [],
          correct_answer,
          correct_answer_text,
          explanation: q.explanation || null,
          order_index: index,
          points: 1
        }
      })

      const { error: questionsError } = await supabase
        .from('quiz_questions')
        .insert(questionsToInsert)

      if (questionsError) throw questionsError

      // Refresh the quiz list and close the AI generator
      await fetchQuizzes(pagination.page)
      setShowAIGenerator(false)
      // Refresh content review panel to show newly generated AI content
      setContentReviewRefresh(prev => prev + 1)
      
    } catch (err: any) {
      logger.error('Error saving AI-generated quiz:', err)
      setError('Failed to save AI-generated quiz. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleEditQuiz = (quiz: Quiz) => {
    setEditingQuiz(quiz)
    setShowQuizForm(true)
  }

  const handleDeleteQuiz = (quiz: Quiz) => {
    setDeletingQuiz(quiz)
    setShowEnhancedDeleteModal(true)
  }

  const handleViewQuiz = (quiz: Quiz) => {
    setViewingQuiz(quiz)
    setShowViewModal(true)
  }

  const handleTogglePublish = async (quiz: Quiz) => {
    try {
      const { error } = await supabase
        .from('quizzes')
        .update({ is_published: !quiz.is_published })
        .eq('id', quiz.id)

      if (error) throw error

      // Update local state
      setQuizzes(prevQuizzes => 
        prevQuizzes.map(q => 
          q.id === quiz.id 
            ? { ...q, is_published: !q.is_published }
            : q
        )
      )
    } catch (err: any) {
      logger.error('Error toggling quiz publish status:', err)
      setError('Failed to update quiz status. Please try again.')
    }
  }

  const handleFormSuccess = () => {
    fetchQuizzes(pagination.page)
    setShowQuizForm(false)
    setEditingQuiz(null)
    // Refresh content review panel to show newly created content
    setContentReviewRefresh(prev => prev + 1)
  }

  const handleDeleteSuccess = () => {
    fetchQuizzes(pagination.page)
    setShowDeleteModal(false)
    setShowEnhancedDeleteModal(false)
    setDeletingQuiz(null)
  }

  const deleteQuiz = async (quiz: any) => {
    const { error } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', quiz.id)

    if (error) throw error
  }

  const checkQuizUsage = async (quiz: any) => {
    const { count, error } = await supabase
      .from('quiz_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('quiz_id', quiz.id)

    if (error) throw error
    return { count: count || 0 }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-96">
          <Card variant="elevated" size="md" className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-foreground font-medium">Loading quizzes...</p>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <Card variant="elevated" size="md" className="text-center max-w-md mx-auto">
          <p className="text-primary mb-4 font-bold">{error}</p>
          <button 
            onClick={() => fetchQuizzes(pagination.page)}
            className="text-primary hover:text-primary/80 underline font-bold bg-primary/5 hover:bg-destructive/20 px-4 py-2 rounded-lg transition-colors"
          >
            Try again
          </button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      {/* Enhanced Header Section */}
      <div className="mb-8 relative z-40">
        <Card variant="glass" className="p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-4xl font-bold text-foreground leading-tight mb-2">Quiz Management</h1>
              <p className="text-muted-foreground text-lg">Create, edit, and manage interactive assessments for your students</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative group z-50">
                <Link
                  href="/admin/quizzes/create"
                  className="bg-primary hover:bg-secondary text-white hover:text-black px-6 py-3 sm:px-8 sm:py-4 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl w-full sm:w-auto"
                >
                  <Plus size={20} />
                  <span>Create New Quiz</span>
                </Link>
                <div className="absolute top-full left-0 mt-2 bg-background border border-muted rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[999] min-w-52">
                  <Link
                    href="/admin/quizzes/create"
                    className="w-full text-left px-4 py-3 hover:bg-muted rounded-t-lg flex items-center gap-2"
                  >
                    <Plus size={16} />
                    Create Manually
                  </Link>
                  <button
                    onClick={() => setShowAIGenerator(true)}
                    className="w-full text-left px-4 py-3 hover:bg-muted rounded-b-lg flex items-center gap-2"
                  >
                    <Brain size={16} className="text-primary" />
                    Create with AI
                  </button>
                </div>
              </div>
              <button
                onClick={() => setShowCategoryManagement(true)}
                className="border-2 border-primary text-primary hover:bg-primary hover:text-white px-6 py-3 sm:px-6 sm:py-4 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 font-semibold hover:shadow-md"
              >
                <Settings size={20} />
                <span>Categories</span>
              </button>
              <button
                onClick={() => setShowAnalytics(true)}
                className="bg-primary hover:bg-secondary text-white hover:text-black px-6 py-3 sm:px-6 sm:py-4 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
              >
                <BarChart3 size={20} />
                <span>Analytics</span>
              </button>
            </div>
          </div>
        </Card>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
        <Card variant="interactive" className="hover:shadow-lg transition-shadow duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-muted-foreground mb-2">Total Quizzes</p>
                <p className="text-3xl font-bold mb-1">{quizStats.total}</p>
                <p className="text-sm text-primary font-medium">All Assessments</p>
              </div>
              <div className="bg-primary/10 p-4 rounded-xl ml-4 flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                <Brain className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card variant="interactive" className="hover:shadow-lg transition-shadow duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-muted-foreground mb-2">Published</p>
                <p className="text-3xl font-bold mb-1">{quizStats.published}</p>
                <p className="text-sm text-success font-medium">Active & Live</p>
              </div>
              <div className="bg-success/10 p-4 rounded-xl ml-4 flex-shrink-0 group-hover:bg-success/20 transition-colors">
                <Eye className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card variant="interactive" className="hover:shadow-lg transition-shadow duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-muted-foreground mb-2">Drafts</p>
                <p className="text-3xl font-bold text-foreground mb-1">{quizStats.draft}</p>
                <p className="text-sm text-warning font-medium">In Progress</p>
              </div>
              <div className="bg-warning/10 p-4 rounded-xl ml-4 flex-shrink-0 group-hover:bg-warning/20 transition-colors">
                <Edit className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card variant="interactive" className="hover:shadow-lg transition-shadow duration-300 group sm:col-span-2 lg:col-span-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-muted-foreground mb-2">Total Questions</p>
                <p className="text-3xl font-bold text-foreground mb-1">{quizStats.totalQuestions}</p>
                <p className="text-sm text-secondary font-medium">Assessment Items</p>
              </div>
              <div className="bg-secondary/10 p-4 rounded-xl ml-4 flex-shrink-0 group-hover:bg-secondary/20 transition-colors">
                <Users className="h-6 w-6 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="interactive" className="hover:shadow-lg transition-shadow duration-300 group sm:col-span-2 xl:col-span-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-muted-foreground mb-2">Avg Passing Score</p>
                <p className="text-3xl font-bold text-foreground mb-1">{quizStats.averagePassingScore}%</p>
                <p className="text-sm text-primary font-medium">Success Rate</p>
              </div>
              <div className="bg-primary/10 p-4 rounded-xl ml-4 flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Review Panel */}
      <div className="mb-8">
        <ContentReviewPanel compact={true} maxItems={3} refreshTrigger={contentReviewRefresh} />
      </div>

      {/* Enhanced Search and Filters */}
      <div className="mb-8">
        <Card variant="base" className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <input
                type="text"
                placeholder="Search quizzes by title or category..."
                className="w-full pl-12 pr-4 py-4 border border-muted rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent bg-background hover:bg-muted/20 transition-colors text-base font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-3">
              <div className="relative" ref={categoryDropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  className="px-6 py-4 border-2 border-primary text-primary hover:bg-primary hover:text-white rounded-xl transition-colors text-base font-medium min-w-48 flex items-center justify-between"
                >
                  <span>
                    {selectedCategories.length === 0 
                      ? 'All Categories' 
                      : selectedCategories.length === 1 && selectedCategories[0]
                      ? selectedCategories[0].charAt(0).toUpperCase() + selectedCategories[0].slice(1)
                      : `${selectedCategories.length} Categories`
                    }
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {showCategoryDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-muted rounded-xl shadow-xl z-[999] py-2 max-h-64 overflow-y-auto">
                    <div className="px-4 py-2 border-b border-muted flex justify-between items-center">
                      <button
                        onClick={() => setSelectedCategories([])}
                        className="text-sm text-primary hover:text-primary/80 font-medium"
                      >
                        Clear All
                      </button>
                      <button
                        onClick={() => {
                          setShowCategoryDropdown(false)
                          setShowCategoryManagement(true)
                        }}
                        className="text-sm text-gray-600 hover:text-gray-800 font-medium flex items-center gap-1"
                      >
                        <Settings size={14} />
                        Manage
                      </button>
                    </div>
                    {categories.filter(cat => cat !== 'all').map(category => (
                      <label key={category} className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCategories([...selectedCategories, category])
                            } else {
                              setSelectedCategories(selectedCategories.filter(c => c !== category))
                            }
                          }}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 mr-3"
                        />
                        <span className="text-gray-900 font-medium capitalize">{category}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              
              <select
                className="px-6 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors text-base font-medium min-w-0"
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
              >
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty === 'all' ? 'All Levels' : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Selected Categories Tags */}
          {selectedCategories.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
              <span className="text-sm text-gray-600 font-medium mr-2">Active filters:</span>
              {selectedCategories.map(category => (
                <span
                  key={category}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                  <button
                    onClick={() => setSelectedCategories(selectedCategories.filter(c => c !== category))}
                    className="text-purple-600 hover:text-purple-800 ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
              <button
                onClick={() => setSelectedCategories([])}
                className="text-sm text-muted-foreground hover:text-foreground underline font-medium"
              >
                Clear all
              </button>
            </div>
          )}
        </Card>
      </div>
  
      {/* Conditional Content Rendering */}
      {showAIGenerator ? (
        /* AI Quiz Generator Form */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">AI Quiz Generator</h2>
              <p className="text-gray-600 mt-1">Create quizzes automatically using AI for any subject</p>
            </div>
            <button
              onClick={() => setShowAIGenerator(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ← Back to Quizzes
            </button>
          </div>
          
          <InlineAIQuizGenerator
            onQuizGenerated={handleAIQuizGenerated}
            onCancel={() => setShowAIGenerator(false)}
          />
        </div>
      ) : (
        /* Regular Quiz Grid */
        <>
          {/* Enhanced Quizzes Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredQuizzes.map((quiz) => (
              <Card key={quiz.id} variant="interactive" size="sm" className="hover:shadow-lg transition-shadow duration-300 group">
            
            {/* Quiz Image */}
            <div className="relative h-48 bg-muted/40">
              {quiz.image_url ? (
                <Image
                  src={quiz.image_url}
                  alt={quiz.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-100 to-blue-200 flex items-center justify-center">
                  <div className="text-4xl font-black text-purple-500">
                    {quiz.title.charAt(0).toUpperCase()}
                  </div>
                </div>
              )}
            </div>

            <CardHeader className="pb-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <CardTitle className="text-lg font-bold text-gray-900 leading-tight">{quiz.title}</CardTitle>
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full flex-shrink-0 ${getStatusBadge(quiz.is_published)}`}>
                      {quiz.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <CardDescription className="line-clamp-2 text-base text-gray-600 leading-relaxed">{quiz.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className={`inline-flex px-3 py-2 text-sm font-bold rounded-xl capitalize ${getDifficultyColor(quiz.difficulty)}`}>
                    {quiz.difficulty}
                  </span>
                  <span className="text-base text-gray-700 font-medium capitalize">{quiz.category}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-base">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock className="h-5 w-5 flex-shrink-0 text-secondary" />
                    <span className="font-medium">{quiz.duration_minutes} min</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Brain className="h-5 w-5 flex-shrink-0 text-purple-600" />
                    <span className="font-medium">{quiz.total_questions} questions</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-base">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Users className="h-5 w-5 flex-shrink-0 text-emerald-600" />
                    <span className="font-medium">{quiz.attempts_count || 0} attempts</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <BarChart3 className="h-5 w-5 flex-shrink-0 text-orange-600" />
                    <span className="font-medium">{quiz.average_score || 0}% avg</span>
                  </div>
                </div>

                <div className="text-sm text-gray-500 border-t border-gray-200 pt-3 font-medium">
                  Created: {formatDate(quiz.created_at)}
                </div>

                {/* Enhanced Action Buttons */}
                <div className="space-y-3 pt-2">
                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleViewQuiz(quiz)}
                      className="flex-1 bg-muted/40 hover:bg-muted/60 text-gray-800 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-md"
                    >
                      <Eye className="h-5 w-5" />
                      <span>View</span>
                    </button>
                    <button 
                      onClick={() => handleTogglePublish(quiz)}
                      className={`flex-1 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-md ${
                        quiz.is_published
                          ? 'bg-amber-600 hover:bg-amber-700 text-white'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      {quiz.is_published ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Check className="h-5 w-5" />
                      )}
                      <span>
                        {quiz.is_published ? 'Unpublish' : 'Publish'}
                      </span>
                    </button>
                  </div>
                  
                  <div className="flex gap-3">
                    <Link
                      href={`/admin/quizzes/${quiz.id}/edit`}
                      className="flex-1 bg-primary hover:bg-secondary text-black hover:text-white px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-md"
                    >
                      <Edit className="h-5 w-5" />
                      <span>Edit</span>
                    </Link>
                    <button 
                      onClick={() => handleDeleteQuiz(quiz)}
                      className="flex-1 bg-primary hover:bg-primary/90 text-secondary px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-md"
                    >
                      <Trash2 className="h-5 w-5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Enhanced Empty State */}
      {filteredQuizzes.length === 0 && !loading && (
        <Card className="mt-8 border-2 border-dashed border-gray-300 bg-white">
          <CardContent className="p-12">
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Brain className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">No quizzes found</h3>
              <p className="text-gray-600 mb-6 text-base leading-relaxed max-w-md mx-auto">
                {searchTerm || selectedCategory !== 'all' || selectedDifficulty !== 'all'
                  ? 'Try adjusting your search or filter criteria to find the quizzes you are looking for'
                  : 'Start creating engaging quizzes for your students to test their knowledge and understanding'
                }
              </p>
              {!searchTerm && selectedCategory === 'all' && selectedDifficulty === 'all' && (
                <button 
                  onClick={handleCreateQuiz}
                  className="bg-gradient-to-r from-secondary to-secondary/90 hover:from-secondary/80 hover:to-secondary/90 text-white px-8 py-4 rounded-xl font-semibold text-base transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Create Your First Quiz
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-12 flex justify-center">
          <Card variant="glass">
            <CardContent className="p-4">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                totalItems={pagination.total}
                itemsPerPage={pagination.limit}
                onPageChange={handlePageChange}
              />
            </CardContent>
          </Card>
        </div>
      )}
        </>
      )}

      {/* Modals */}
      <QuizForm
        quiz={editingQuiz}
        isOpen={showQuizForm}
        onClose={() => setShowQuizForm(false)}
        onSuccess={handleFormSuccess}
      />

      <DeleteModal
        item={deletingQuiz ? { ...deletingQuiz, type: 'quiz' } : null}
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onSuccess={handleDeleteSuccess}
        onDelete={deleteQuiz}
        usageCheck={checkQuizUsage}
      />

      <EnhancedDeleteModal
        item={deletingQuiz ? { id: deletingQuiz.id, title: deletingQuiz.title, type: 'quiz' } : null}
        isOpen={showEnhancedDeleteModal}
        onClose={() => setShowEnhancedDeleteModal(false)}
        onSuccess={handleDeleteSuccess}
      />

      <QuizViewModal
        quiz={viewingQuiz}
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        onEdit={() => {
          setShowViewModal(false)
          if (viewingQuiz) {
            handleEditQuiz(viewingQuiz)
          }
        }}
      />

      <CategoryManagement
        isOpen={showCategoryManagement}
        onClose={() => setShowCategoryManagement(false)}
        onCategoryCreated={() => {
          // Refresh categories when new ones are created
          fetchQuizzes(pagination.page)
        }}
      />

      <QuizAnalytics
        isOpen={showAnalytics}
        onClose={() => setShowAnalytics(false)}
      />
    </div>
  )
}