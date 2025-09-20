'use client'

import { logger } from '@/lib/logger'
import { useState, useCallback, useRef, useMemo, useEffect, useTransition, useDeferredValue } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Pagination } from '@/components/ui/Pagination'
import { Search, Plus, Brain, Clock, Users, BarChart3, Edit, Trash2, Eye, ChevronDown, Settings, EyeOff, Check, Timer, Home, ChevronRight, Filter, Download, Upload, BookOpen } from 'lucide-react'
import { formatDate } from '@/lib/date-utils'
import { IconBrain, IconEye, IconEdit, IconUsers } from '@tabler/icons-react'
import { QuizBuilderRouter } from '@/components/admin/QuizBuilderRouter'
import { QuizViewModal } from '@/components/admin/QuizViewModal'
import { CategoryManagement } from '@/components/admin/CategoryManagement'
import { QuizAnalytics } from '@/components/admin/QuizAnalytics'
import { AdminQuizCard } from '@/components/admin/AdminQuizCard'
import { DeleteModal } from '@/components/ui/DeleteModal'
import { BulkOperations } from '@/components/admin/BulkOperations'
import { StatsCards, type StatCardData } from '@/components/admin/dashboard/StatsCards'
import { QuizActionsToolbar } from '@/components/admin/dashboard/QuizActionsToolbar'
import { QuizFiltersSection } from '@/components/admin/dashboard/QuizFiltersSection'
import { QuizGridView } from '@/components/admin/dashboard/QuizGridView'
import { useAdminDashboardData, useDeleteQuiz, usePrefetchQuiz, useBulkQuizOperations } from '@/hooks/api'
import type { AdminDashboardResponse } from '@/types'
import { useAdminModals } from '@/hooks/admin/useAdminModals'
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
  const quizzes = useMemo(() => (dashboardData as AdminDashboardResponse)?.quizzes || [], [dashboardData])
  const managedCategories = useMemo(() => (dashboardData as AdminDashboardResponse)?.categories || [], [dashboardData])
  
  // ===== REACT 18 CONCURRENT FEATURES =====
  const [isPending, startTransition] = useTransition()
  
  // ===== LOCAL STATE (Minimal) =====
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')
  
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  })

  // ===== UI STATE =====
  
  // 🔄 CONSOLIDATED: All modal states managed by single hook (was 8 separate useState calls)
  const { modalStates, modalData, actions } = useAdminModals<Quiz>()
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'compact'>('grid')

  // Bulk operations state
  const [selectedQuizIds, setSelectedQuizIds] = useState<string[]>([])

  // Destructure for easier access
  const {
    showQuizForm,
    showDeleteModal,
    showViewModal,
    showCategoryManagement,
    showAnalytics,
    showBulkOperations,
    showCategoryDropdown
  } = modalStates

  const {
    editingQuiz,
    deletingQuiz,
    viewingQuiz
  } = modalData

  // Refs for click outside
  const categoryDropdownRef = useRef<HTMLDivElement>(null)

  // Bulk operations mutation
  const bulkQuizOperations = useBulkQuizOperations()

  // ===== DERIVED STATE & MEMOIZED VALUES =====
    // Update pagination when data changes
  const paginationData = useMemo(() => {
    const data = dashboardData as AdminDashboardResponse
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
        actions.closeModal('showCategoryDropdown')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [actions])

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

  // 🔄 CONSOLIDATED: Stats cards data (replaced 4 duplicate Card patterns)
  const statsCardsData: StatCardData[] = useMemo(() => [
    {
      id: 'total-quizzes',
      label: 'Total Quizzes',
      value: quizStats.total,
      description: 'All Assessments', 
      icon: IconBrain,
      colorTheme: 'blue'
    },
    {
      id: 'published-quizzes', 
      label: 'Published',
      value: quizStats.published,
      description: 'Active & Live',
      icon: IconEye,
      colorTheme: 'green'
    },
    {
      id: 'draft-quizzes',
      label: 'Drafts', 
      value: quizStats.draft,
      description: 'In Progress',
      icon: IconEdit,
      colorTheme: 'orange'
    },
    {
      id: 'total-questions',
      label: 'Questions',
      value: quizStats.totalQuestions,
      description: 'Total Items',
      icon: IconUsers,
      colorTheme: 'violet'
    }
  ], [quizStats])

  // Get unique categories and difficulties  
  const categories = useMemo(() => 
    ['all', ...managedCategories.map(c => c.name)], 
    [managedCategories]
  )
  const difficulties = ['all', 'beginner', 'intermediate', 'advanced']

  // ===== OPTIMIZED EVENT HANDLERS =====
  const handleCreateQuiz = useCallback(() => {
    actions.openModal('showQuizForm', null) // Clear editing quiz, open form
  }, [actions])

  const handleEditQuiz = useCallback((quiz: Quiz) => {
    // Prefetch quiz data for faster modal loading
    prefetchQuiz(quiz.id)
    actions.openModal('showQuizForm', quiz) // Set editing quiz, open form
  }, [prefetchQuiz, actions])

  const handleDeleteQuiz = useCallback((quiz: Quiz) => {
    actions.openModal('showDeleteModal', quiz) // Set deleting quiz, open modal
  }, [actions])

  const handleViewQuiz = useCallback((quiz: Quiz) => {
    // Prefetch quiz data for faster modal loading  
    prefetchQuiz(quiz.id)
    actions.openModal('showViewModal', quiz) // Set viewing quiz, open modal
  }, [prefetchQuiz, actions])

  const handleFormSuccess = useCallback(() => {
    // React Query will automatically refetch data
    refetch()
    actions.closeModal('showQuizForm') // Closes modal and clears editingQuiz
  }, [refetch, actions])

  const handleDeleteSuccess = useCallback(() => {
    // No need to manually refetch - React Query mutation handles this
    actions.closeModal('showDeleteModal') // Closes modal and clears deletingQuiz
  }, [actions])

  const handleRefetch = useCallback(() => {
    refetch()
  }, [refetch])

  const handleShowCategoryManagement = useCallback(() => {
    actions.openModal('showCategoryManagement')
  }, [actions])

  const handleShowAnalytics = useCallback(() => {
    actions.openModal('showAnalytics')
  }, [actions])

  const handleToggleCategoryDropdown = useCallback(() => {
    actions.toggleModal('showCategoryDropdown')
  }, [actions])

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

  const checkQuizUsage = async (quiz: any): Promise<{ count: number; message?: string }> => {
    try {
      // Use client for read-only check (should work with RLS)
      const { count, error } = await supabase
        .from('quiz_attempts')
        .select('*', { count: 'exact', head: true })
        .eq('quiz_id', quiz.id)

      if (error) throw error
      const attemptCount = count || 0
      
      return {
        count: attemptCount,
        message: attemptCount > 0 
          ? `This quiz has ${attemptCount} student attempt${attemptCount === 1 ? '' : 's'}. Deleting will remove all associated data.`
          : undefined
      }
    } catch (error) {
      logger.error('Error checking quiz usage:', error)
      return { count: 0 } // Default to 0 if we can't check
    }
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
    actions.setBulkOperations(selectedQuizIds.length > 0)
  }, [selectedQuizIds, actions])

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
      {/* 🔄 EXTRACTED: QuizActionsToolbar (was ~200 lines) */}
      <QuizActionsToolbar
        quizStats={quizStats}
        onShowCategoryManagement={handleShowCategoryManagement}
        onShowAnalytics={handleShowAnalytics}
        isLoading={isFetching}
      />

      {/* 🔄 CONSOLIDATED: Enhanced Stats Cards (was 80+ lines of duplicate patterns) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <StatsCards stats={statsCardsData} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8" />
      </div>

      {/* 🔄 EXTRACTED: QuizFiltersSection (was ~140 lines) */}
      <QuizFiltersSection
        searchTerm={searchTerm}
        onSearchChange={(value) => {
          startTransition(() => {
            setSearchTerm(value)
          })
        }}
        selectedCategories={selectedCategories}
        onCategoryChange={(categories) => {
          startTransition(() => {
            setSelectedCategories(categories)
          })
        }}
        selectedDifficulty={selectedDifficulty}
        onDifficultyChange={(difficulty) => {
          startTransition(() => {
            setSelectedDifficulty(difficulty)
          })
        }}
        categories={categories}
        difficulties={difficulties}
        isPending={isPending}
        showCategoryDropdown={modalStates.showCategoryDropdown}
        onToggleCategoryDropdown={handleToggleCategoryDropdown}
        onCloseCategoryDropdown={() => actions.closeModal('showCategoryDropdown')}
        onClearCategories={handleClearCategories}
        onRemoveCategory={handleRemoveCategory}
        onOpenCategoryManagement={() => {
          actions.closeModal('showCategoryDropdown')
          actions.openModal('showCategoryManagement')
        }}
        categoryDropdownRef={categoryDropdownRef}
      />

      {/* 🔄 EXTRACTED: QuizGridView (was ~180 lines) */}
      <QuizGridView
        quizzes={quizzes}
        viewMode={viewMode}
        selectedQuizIds={selectedQuizIds}
        showBulkOperations={showBulkOperations}
        isLoading={isLoading}
        searchTerm={searchTerm}
        selectedCategories={selectedCategories}
        selectedDifficulty={selectedDifficulty}
        onEditQuiz={handleEditQuiz}
        onDeleteQuiz={handleDeleteQuiz}
        onViewQuiz={handleViewQuiz}
        onTogglePublish={handleTogglePublish}
        onSelectQuiz={handleSelectQuiz}
        onSetSelectedQuizIds={setSelectedQuizIds}
        onSetViewMode={handleSetViewMode}
        onClearAllFilters={() => {
          setSearchTerm('')
          setSelectedCategories([])
          setSelectedDifficulty('all')
        }}
        bulkQuizOperations={bulkQuizOperations}
      />

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
        <QuizBuilderRouter
          quiz={editingQuiz}
          isOpen={showQuizForm}
          onClose={() => actions.closeModal('showQuizForm')}
          onSuccess={handleFormSuccess}
        />
  
        <DeleteModal
          item={deletingQuiz ? { id: deletingQuiz.id, title: deletingQuiz.title, type: 'quiz' as const } : null}
          isOpen={showDeleteModal}
          onClose={() => actions.closeModal('showDeleteModal')}
          onSuccess={handleDeleteSuccess}
          onDelete={deleteQuiz}
          usageCheck={checkQuizUsage}
        />      <QuizViewModal
        quiz={viewingQuiz}
        isOpen={showViewModal}
        onClose={() => actions.closeModal('showViewModal')}
        onEdit={() => {
          actions.closeModal('showViewModal')
          if (viewingQuiz) {
            handleEditQuiz(viewingQuiz)
          }
        }}
      />

      <CategoryManagement
        isOpen={showCategoryManagement}
        onClose={() => actions.closeModal('showCategoryManagement')}
        onCategoryCreated={() => {
          // Refresh categories when new ones are created
          refetch()
        }}
      />

      <QuizAnalytics
        isOpen={showAnalytics}
        onClose={() => actions.closeModal('showAnalytics')}
      />
    </div>
  )
}