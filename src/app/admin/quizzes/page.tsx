'use client'

import { logger } from '@/lib/logger'
import { useState, useCallback, useRef, useMemo, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Pagination } from '@/components/ui/Pagination'
import { Search, Plus, Brain, Clock, Users, BarChart3, Edit, Trash2, Eye, ChevronDown, Settings, EyeOff, Check, Timer, Home, ChevronRight, Filter, Download, Upload } from 'lucide-react'
import { QuizBuilder } from '@/components/admin/QuizBuilder'
import { QuizViewModal } from '@/components/admin/QuizViewModal'
import { CategoryManagement } from '@/components/admin/CategoryManagement'
import { QuizAnalytics } from '@/components/admin/QuizAnalytics'
import { AdminQuizCard } from '@/components/admin/AdminQuizCard'
import { EnhancedDeleteModal } from '@/components/admin/EnhancedDeleteModal'
import { BulkOperations } from '@/components/admin/BulkOperations'
import { useAdminDashboardData, useDeleteQuiz, usePrefetchQuiz, useBulkQuizOperations, type AdminDashboardData } from '@/hooks/useOptimizedAPI'
import { supabase, type Quiz as BaseQuiz } from '@/lib/supabase'
import { authenticatedPut } from '@/lib/auth-api'

// Extended Quiz interface with calculated statistics
interface Quiz extends BaseQuiz {
  attempts_count?: number
  average_score?: number
}

interface Category {
  id: string
  name: string
  type: string
  color: string
}

export default function AdminQuizzesPage() {
  // ===== REACT QUERY HOOKS (Optimized) =====
  const [currentPage, setCurrentPage] = useState(1)
  const { 
    data: dashboardData, 
    isLoading, 
    isFetching,
    error, 
    refetch 
  } = useAdminDashboardData(currentPage, 12)
  
  const deleteQuizMutation = useDeleteQuiz()
  const prefetchQuiz = usePrefetchQuiz()

  // Extract data from the batched response (memoized to prevent unnecessary recalculations)
  const quizzes = useMemo(() => (dashboardData as AdminDashboardData)?.quizzes || [], [dashboardData])
  const managedCategories = useMemo(() => (dashboardData as AdminDashboardData)?.categories || [], [dashboardData])
  
  // ===== LOCAL STATE (Minimal) =====
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  })

  // ===== UI STATE =====
  
  // Modal states
  const [showQuizForm, setShowQuizForm] = useState(false)
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null)
  const [deletingQuiz, setDeletingQuiz] = useState<Quiz | null>(null)
  const [showEnhancedDeleteModal, setShowEnhancedDeleteModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [viewingQuiz, setViewingQuiz] = useState<Quiz | null>(null)
  const [showCategoryManagement, setShowCategoryManagement] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'compact'>('grid')

  // Bulk operations state
  const [selectedQuizIds, setSelectedQuizIds] = useState<string[]>([])
  const [showBulkOperations, setShowBulkOperations] = useState(false)

  // Refs for click outside
  const categoryDropdownRef = useRef<HTMLDivElement>(null)

  // Bulk operations mutation
  const bulkQuizOperations = useBulkQuizOperations()

  // ===== DERIVED STATE & MEMOIZED VALUES =====
    // Update pagination when data changes
  const paginationData = useMemo(() => {
    const data = dashboardData as AdminDashboardData
    if (data?.stats) {
      return {
        page: currentPage,
        limit: 12,
        total: data.stats.totalQuizzes,
        totalPages: Math.ceil(data.stats.totalQuizzes / 12)
      }
    }
    return null
  }, [dashboardData, currentPage])

  // Handle pagination with optimized data fetching
  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

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

  // ===== OPTIMIZED FILTERING WITH MEMOIZATION =====
  const filteredQuizzes = useMemo(() => {
    if (!quizzes.length) return []
    
    return quizzes.filter(quiz => {
      const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           quiz.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(quiz.category)
      const matchesDifficulty = selectedDifficulty === 'all' || quiz.difficulty === selectedDifficulty
      return matchesSearch && matchesCategory && matchesDifficulty
    })
  }, [quizzes, searchTerm, selectedCategories, selectedDifficulty])

  // Memoized statistics calculation  
  const quizStats = useMemo(() => ({
    total: quizzes.length,
    published: quizzes.filter(q => q.is_published).length,
    draft: quizzes.filter(q => !q.is_published).length,
    totalQuestions: quizzes.reduce((sum, q) => sum + (q.total_questions || 0), 0),
    averagePassingScore: quizzes.length > 0 
      ? Math.round(quizzes.reduce((sum, q) => sum + (q.passing_score || 70), 0) / quizzes.length)
      : 0
  }), [quizzes])

  // Get unique categories and difficulties  
  const categories = useMemo(() => 
    ['all', ...managedCategories.map(c => c.name)], 
    [managedCategories]
  )
  const difficulties = ['all', 'beginner', 'intermediate', 'advanced']

  // ===== OPTIMIZED EVENT HANDLERS =====
  const handleCreateQuiz = useCallback(() => {
    setEditingQuiz(null)
    setShowQuizForm(true)
  }, [])

  const handleEditQuiz = useCallback((quiz: Quiz) => {
    // Prefetch quiz data for faster modal loading
    prefetchQuiz(quiz.id)
    setEditingQuiz(quiz)
    setShowQuizForm(true)
  }, [prefetchQuiz])

  const handleDeleteQuiz = useCallback((quiz: Quiz) => {
    setDeletingQuiz(quiz)
    setShowEnhancedDeleteModal(true)
  }, [])

  const handleViewQuiz = useCallback((quiz: Quiz) => {
    // Prefetch quiz data for faster modal loading  
    prefetchQuiz(quiz.id)
    setViewingQuiz(quiz)
    setShowViewModal(true)
  }, [prefetchQuiz])

  const handleFormSuccess = useCallback(() => {
    // React Query will automatically refetch data
    refetch()
    setShowQuizForm(false)
    setEditingQuiz(null)
  }, [refetch])

  const handleDeleteSuccess = useCallback(() => {
    // No need to manually refetch - React Query mutation handles this
    setShowEnhancedDeleteModal(false)
    setDeletingQuiz(null)
  }, [])

  const handleRefetch = useCallback(() => {
    refetch()
  }, [refetch])

  const handleShowCategoryManagement = useCallback(() => {
    setShowCategoryManagement(true)
  }, [])

  const handleShowAnalytics = useCallback(() => {
    setShowAnalytics(true)
  }, [])

  const handleToggleCategoryDropdown = useCallback(() => {
    setShowCategoryDropdown(!showCategoryDropdown)
  }, [showCategoryDropdown])

  const handleClearCategories = useCallback(() => {
    setSelectedCategories([])
  }, [])

  const handleRemoveCategory = useCallback((category: string) => {
    setSelectedCategories(selectedCategories.filter(c => c !== category))
  }, [selectedCategories])

  const handleSetViewMode = useCallback((mode: 'grid' | 'compact' | 'list') => {
    setViewMode(mode)
  }, [])

  const handleTogglePublish = useCallback(async (quiz: Quiz) => {
    try {
      const newPublishedState = !quiz.is_published
      
      logger.info(`${newPublishedState ? 'Publishing' : 'Unpublishing'} quiz:`, {
        quizId: quiz.id,
        title: quiz.title,
        newState: newPublishedState
      })

      // Use authenticated API call with proper headers
      const response = await authenticatedPut(`/api/admin/quizzes/${quiz.id}`, {
        is_published: newPublishedState,
        updated_at: new Date().toISOString()
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to toggle publish state')
      }

      // Refetch to ensure consistency
      refetch()
      
      logger.info(`Successfully ${newPublishedState ? 'published' : 'unpublished'} quiz:`, quiz.id)
    } catch (error) {
      logger.error('Failed to toggle quiz publication:', error)
      // Refetch to restore correct state
      refetch()
    }
  }, [refetch])

  // Simplified delete function (React Query handles the API call)
  const deleteQuiz = useCallback(async (quiz: any) => {
    try {
      await deleteQuizMutation.mutateAsync(quiz.id)
      return Promise.resolve()
    } catch (error) {
      return Promise.reject(error)
    }
  }, [deleteQuizMutation])

  const checkQuizUsage = async (quiz: any) => {
    try {
      // Use client for read-only check (should work with RLS)
      const { count, error } = await supabase
        .from('quiz_attempts')
        .select('*', { count: 'exact', head: true })
        .eq('quiz_id', quiz.id)

      if (error) throw error
      return count || 0
    } catch (error) {
      logger.error('Error checking quiz usage:', error)
      return 0 // Default to 0 if we can't check
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // ===== BULK OPERATIONS HANDLERS =====
  const handleSelectQuiz = useCallback((quizId: string) => {
    setSelectedQuizIds(prev => 
      prev.includes(quizId) 
        ? prev.filter(id => id !== quizId)
        : [...prev, quizId]
    )
  }, [])

  // Show bulk operations when items are selected
  useEffect(() => {
    setShowBulkOperations(selectedQuizIds.length > 0)
  }, [selectedQuizIds])

  // ===== LOADING & ERROR STATES =====
  if (isLoading) {
    return (
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-72 animate-pulse"></div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i} variant="glass" className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="h-8 w-8 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search and Filters Skeleton */}
        <Card variant="glass" className="mb-8 animate-pulse">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="h-12 bg-gray-200 rounded-xl"></div>
              <div className="h-12 bg-gray-200 rounded-xl"></div>
              <div className="h-12 bg-gray-200 rounded-xl"></div>
              <div className="h-12 bg-gray-200 rounded-xl"></div>
            </div>
          </CardContent>
        </Card>

        {/* Quizzes Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} variant="base" className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
                <div className="flex justify-between items-center">
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                  <div className="flex gap-2">
                    <div className="h-8 w-8 bg-gray-200 rounded"></div>
                    <div className="h-8 w-8 bg-gray-200 rounded"></div>
                    <div className="h-8 w-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="p-8">
        <Card variant="elevated" size="md" className="text-center max-w-md mx-auto">
          <p className="text-primary mb-4 font-bold">{error?.message || 'An error occurred'}</p>
          <button 
            onClick={handleRefetch}
            className="text-primary hover:text-primary/80 underline font-bold bg-primary/5 hover:bg-destructive/20 px-4 py-2 rounded-lg transition-colors"
          >
            Try again
          </button>
        </Card>
      </div>
    )
  }

  // Main component render
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 relative">
      {/* Loading Overlay for Refetching */}
      {isFetching && !isLoading && (
        <div className="absolute top-0 left-0 right-0 z-50 bg-primary/10 border-b border-primary/20 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <div className="flex items-center justify-center gap-2 text-primary">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
              <span className="text-sm font-medium">Refreshing quizzes...</span>
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 py-4">
            <Link 
              href="/admin" 
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Home className="h-4 w-4" />
              <span className="font-medium">Admin</span>
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold text-foreground">Quiz Management</span>
          </div>
        </div>
      </div>

      {/* Enhanced Header Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Card variant="glass" className="p-6 sm:p-8">
          <div className="flex flex-col gap-6">
            {/* Header Content */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-4 mb-3">
                  <div className="p-3 bg-primary rounded-xl">
                    <Brain className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl lg:text-4xl font-bold text-foreground leading-tight">Quiz Management</h1>
                    <p className="text-muted-foreground text-lg mt-1">Create, edit, and manage interactive assessments for your students</p>
                  </div>
                </div>
              </div>
              
              {/* Quick Stats Badge */}
              <div className="flex items-center gap-4 text-sm">
                <div className="bg-white/60 backdrop-blur-sm rounded-lg px-4 py-2 border border-border">
                  <span className="text-muted-foreground">Total Quizzes:</span>
                  <span className="font-bold text-foreground ml-2">{quizStats.total}</span>
                </div>
                <div className="bg-white/60 backdrop-blur-sm rounded-lg px-4 py-2 border border-border">
                  <span className="text-muted-foreground">Published:</span>
                  <span className="font-bold text-success ml-2">{quizStats.published}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-border">
              {/* Primary Actions */}
              <div className="flex flex-col sm:flex-row gap-3 flex-1">
                <div className="relative group">
                  <Link
                    href="/admin/quizzes/create"
                    className="bg-primary hover:bg-secondary text-white hover:text-black px-6 py-3 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl group"
                  >
                    <Plus size={20} />
                    <span>Create New Quiz</span>
                    <ChevronDown size={16} className="group-hover:rotate-180 transition-transform" />
                  </Link>
                  <div className="absolute top-full left-0 mt-2 bg-background border border-border rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 min-w-56">
                    <div className="p-2">
                      <Link
                        href="/admin/quizzes/create"
                        className="w-full text-left px-4 py-3 hover:bg-muted rounded-lg flex items-center gap-3 transition-colors"
                      >
                        <Edit size={16} className="text-primary" />
                        <div>
                          <div className="font-medium">Create Manually</div>
                          <div className="text-xs text-muted-foreground">Build from scratch</div>
                        </div>
                      </Link>
                      <button
                        disabled
                        className="w-full text-left px-4 py-3 opacity-50 cursor-not-allowed rounded-lg flex items-center gap-3 transition-colors"
                      >
                        <Brain size={16} className="text-secondary" />
                        <div>
                          <div className="font-medium">Create with AI</div>
                          <div className="text-xs text-muted-foreground">Coming soon</div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleShowCategoryManagement}
                  className="border-2 border-primary text-primary hover:bg-primary hover:text-white px-6 py-3 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 font-semibold hover:shadow-md"
                >
                  <Settings size={20} />
                  <span>Manage Categories</span>
                </button>
              </div>

              {/* Secondary Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleShowAnalytics}
                  className="bg-muted hover:bg-muted/80 text-foreground px-6 py-3 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 font-semibold hover:shadow-md"
                >
                  <BarChart3 size={20} />
                  <span>Analytics</span>
                </button>
                
                {/* Import/Export Actions */}
                <div className="relative group">
                  <button className="bg-muted hover:bg-muted/80 text-foreground px-6 py-3 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 font-semibold hover:shadow-md">
                    <span>More</span>
                    <ChevronDown size={16} className="group-hover:rotate-180 transition-transform" />
                  </button>
                  <div className="absolute top-full right-0 mt-2 bg-background border border-border rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 min-w-48">
                    <div className="p-2">
                      <button className="w-full text-left px-4 py-3 hover:bg-muted rounded-lg flex items-center gap-3 transition-colors">
                        <Download size={16} className="text-primary" />
                        <span>Export Quizzes</span>
                      </button>
                      <button className="w-full text-left px-4 py-3 hover:bg-muted rounded-lg flex items-center gap-3 transition-colors">
                        <Upload size={16} className="text-secondary" />
                        <span>Import Quizzes</span>
                      </button>
                      <div className="border-t border-border my-2"></div>
                      <button className="w-full text-left px-4 py-3 hover:bg-muted rounded-lg flex items-center gap-3 transition-colors">
                        <Settings size={16} className="text-muted-foreground" />
                        <span>Quiz Settings</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Enhanced Stats Cards */}
            {/* Enhanced Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
          
          <Card variant="interactive" className="hover:shadow-lg transition-shadow duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-muted-foreground mb-2">Questions</p>
                  <p className="text-3xl font-bold text-foreground mb-1">{quizStats.totalQuestions}</p>
                  <p className="text-sm text-secondary font-medium">Total Items</p>
                </div>
                <div className="bg-secondary/10 p-4 rounded-xl ml-4 flex-shrink-0 group-hover:bg-secondary/20 transition-colors">
                  <Users className="h-6 w-6 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Search and Filters Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card variant="base" className="p-6 mb-6">
          <div className="flex flex-col gap-4">
            {/* Search and Quick Filters Row */}
            <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search quizzes by title, category, or description..."
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent bg-white hover:bg-gray-50 transition-colors text-base font-medium text-gray-900 placeholder:text-gray-600"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex gap-3 flex-shrink-0">
                <div className="relative" ref={categoryDropdownRef}>
                  <button
                    type="button"
                    onClick={handleToggleCategoryDropdown}
                    className="px-6 py-4 border-2 border-primary text-primary hover:bg-primary hover:text-white rounded-xl transition-colors text-base font-medium min-w-48 flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <Filter size={16} />
                      {selectedCategories.length === 0 
                        ? 'All Categories' 
                        : selectedCategories.length === 1 && selectedCategories[0]
                        ? selectedCategories[0].charAt(0).toUpperCase() + selectedCategories[0].slice(1)
                        : `${selectedCategories.length} Categories`
                      }
                    </span>
                  </button>
                  
                  {showCategoryDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-xl shadow-xl z-50 py-2 max-h-64 overflow-y-auto">
                      <div className="px-4 py-2 border-b border-border flex justify-between items-center">
                        <button
                          onClick={handleClearCategories}
                          className="text-sm text-primary hover:text-primary/80 font-medium"
                        >
                          Clear All
                        </button>
                        <button
                          onClick={() => {
                            setShowCategoryDropdown(false)
                            setShowCategoryManagement(true)
                          }}
                          className="text-sm text-muted-foreground hover:text-foreground font-medium flex items-center gap-1"
                        >
                          <Settings size={14} />
                          Manage
                        </button>
                      </div>
                      {categories.filter(cat => cat !== 'all').map(category => (
                        <label key={category} className="flex items-center px-4 py-3 hover:bg-muted cursor-pointer">
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
                            className="rounded border-border text-primary focus:ring-primary mr-3"
                          />
                          <span className="text-foreground font-medium capitalize">{category}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                <select
                  className="px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent bg-white hover:bg-gray-50 transition-colors text-base font-medium min-w-40 text-gray-900"
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
              <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                <span className="text-sm text-muted-foreground font-medium mr-2">Active filters:</span>
                {selectedCategories.map(category => (
                  <span
                    key={category}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                    <button
                      onClick={() => handleRemoveCategory(category)}
                      className="text-primary hover:text-primary/80 ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <button
                  onClick={handleClearCategories}
                  className="text-sm text-muted-foreground hover:text-foreground underline font-medium"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* View Toggle and Controls */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-muted-foreground">
            Showing {filteredQuizzes.length} of {quizzes.length} quizzes
          </span>
        </div>
        <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
          <button
            onClick={() => handleSetViewMode('grid')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              viewMode === 'grid'
                ? 'bg-white text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Grid
          </button>
          <button
            onClick={() => handleSetViewMode('compact')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              viewMode === 'compact'
                ? 'bg-white text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Compact
          </button>
          <button
            onClick={() => handleSetViewMode('list')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              viewMode === 'list'
                ? 'bg-white text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            List
          </button>
        </div>
      </div>

      {/* Bulk Operations */}
      {showBulkOperations && (
        <BulkOperations
          items={filteredQuizzes}
          selectedItems={new Set(selectedQuizIds)}
          onSelectionChange={(newSelection) => setSelectedQuizIds([...newSelection])}
          onBulkDelete={async (itemIds) => {
            await bulkQuizOperations.mutateAsync({
              action: 'delete',
              itemIds,
            })
          }}
          onBulkPublish={async (itemIds, isPublished) => {
            await bulkQuizOperations.mutateAsync({
              action: isPublished ? 'publish' : 'unpublish',
              itemIds,
            })
          }}
          onBulkArchive={async (itemIds) => {
            await bulkQuizOperations.mutateAsync({
              action: 'archive',
              itemIds,
            })
          }}
          onBulkDuplicate={async (itemIds) => {
            await bulkQuizOperations.mutateAsync({
              action: 'duplicate',
              itemIds,
            })
          }}
          onBulkExport={async (itemIds) => {
            await bulkQuizOperations.mutateAsync({
              action: 'export',
              itemIds,
            })
          }}
          getItemId={(quiz) => quiz.id}
          getItemTitle={(quiz) => quiz.title}
          getItemStatus={(quiz) => quiz.is_published ? 'published' : 'draft'}
          itemType="quiz"
        />
      )}
  
      {/* Enhanced Quizzes Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz) => (
            <AdminQuizCard
              key={quiz.id}
              quiz={quiz}
              onEdit={handleEditQuiz}
              onDelete={handleDeleteQuiz}
              onView={handleViewQuiz}
              onTogglePublish={handleTogglePublish}
              compact={false}
              isSelected={selectedQuizIds.includes(quiz.id)}
              onSelect={handleSelectQuiz}
              showSelection={true}
            />
          ))}
        </div>
      ) : viewMode === 'compact' ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {filteredQuizzes.map((quiz) => (
            <AdminQuizCard
              key={quiz.id}
              quiz={quiz}
              onEdit={handleEditQuiz}
              onDelete={handleDeleteQuiz}
              onView={handleViewQuiz}
              onTogglePublish={handleTogglePublish}
              compact={true}
              isSelected={selectedQuizIds.includes(quiz.id)}
              onSelect={handleSelectQuiz}
              showSelection={true}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredQuizzes.map((quiz) => (
            <AdminQuizCard
              key={quiz.id}
              quiz={quiz}
              onEdit={handleEditQuiz}
              onDelete={handleDeleteQuiz}
              onView={handleViewQuiz}
              onTogglePublish={handleTogglePublish}
              compact={true}
              isSelected={selectedQuizIds.includes(quiz.id)}
              onSelect={handleSelectQuiz}
              showSelection={true}
            />
          ))}
        </div>
      )}

      {/* Enhanced Empty State */}
      {filteredQuizzes.length === 0 && !isLoading && (
        <Card className="mt-8 border-2 border-dashed border-gray-300 bg-white">
          <CardContent className="p-12">
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Brain className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">No quizzes found</h3>
              <p className="text-gray-600 mb-6 text-base leading-relaxed max-w-md mx-auto">
                {searchTerm || selectedCategories.length > 0 || selectedDifficulty !== 'all'
                  ? 'Try adjusting your search or filter criteria to find the quizzes you are looking for'
                  : 'Start creating engaging quizzes for your students to test their knowledge and understanding'
                }
              </p>
              {!searchTerm && selectedCategories.length === 0 && selectedDifficulty === 'all' && (
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

        {/* Modals */}
        <QuizBuilder
          quiz={editingQuiz}
          isOpen={showQuizForm}
          onClose={() => setShowQuizForm(false)}
          onSuccess={handleFormSuccess}
        />
  
        <EnhancedDeleteModal
          item={deletingQuiz ? { id: deletingQuiz.id, title: deletingQuiz.title, type: 'quiz' } : null}
          isOpen={showEnhancedDeleteModal}
          onClose={() => setShowEnhancedDeleteModal(false)}
          onSuccess={handleDeleteSuccess}
        />      <QuizViewModal
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
          refetch()
        }}
      />

      <QuizAnalytics
        isOpen={showAnalytics}
        onClose={() => setShowAnalytics(false)}
      />
    </div>
  )
}