'use client'

import { useState, useCallback, useMemo, useTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Pagination } from '@/components/ui/Pagination'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import {
  Search,
  Plus,
  Brain,
  Settings,
  BarChart3,
  ChevronDown,
  X,
  Eye,
  Edit,
  Trash2,
  Loader2,
  Filter
} from 'lucide-react'
import { QuizBuilderRouter } from '@/components/admin/QuizBuilderRouter'
import { QuizViewModal } from '@/components/admin/QuizViewModal'
import { CategoryManagement } from '@/components/admin/CategoryManagement'
import { QuizAnalytics } from '@/components/admin/QuizAnalytics'
import { DeleteModal } from '@/components/admin/DeleteModal'
import { useAdminDashboardData, usePrefetchQuiz } from '@/hooks/api'
import { useAdminModals } from '@/hooks/admin/useAdminModals'
import { authenticatedPut } from '@/lib/auth-api'
import { logger } from '@/lib/logger'
import type { Quiz as BaseQuiz } from '@/lib/supabase'
import type { AdminDashboardResponse } from '@/types'

interface Quiz extends BaseQuiz {
  attempts_count?: number
  average_score?: number
}

export default function AdminQuizzesPage() {
  // ===== DATA FETCHING =====
  const [currentPage, setCurrentPage] = useState(1)
  const { data: dashboardData, isLoading, error, refetch } = useAdminDashboardData(currentPage, 12)
  const prefetchQuiz = usePrefetchQuiz()

  // ===== STATE =====
  const [isPending, startTransition] = useTransition()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')

  const { modalStates, modalData, actions } = useAdminModals<Quiz>()

  // ===== DERIVED DATA =====
  const quizzes = useMemo(() => (dashboardData as AdminDashboardResponse)?.quizzes || [], [dashboardData])
  const categories = useMemo(() => (dashboardData as AdminDashboardResponse)?.categories?.map(c => c.name) || [], [dashboardData])

  const quizStats = useMemo(() => ({
    total: quizzes.length,
    published: quizzes.filter(q => q.is_published).length,
    draft: quizzes.filter(q => !q.is_published).length,
    totalQuestions: quizzes.reduce((sum, q) => sum + (q.total_questions || 0), 0),
  }), [quizzes])

  const paginationData = useMemo(() => {
    const data = dashboardData as AdminDashboardResponse
    return data?.stats ? {
      page: currentPage,
      limit: 12,
      total: data.stats.totalQuizzes,
      totalPages: Math.ceil(data.stats.totalQuizzes / 12)
    } : null
  }, [dashboardData, currentPage])

  // ===== HANDLERS =====
  const handleCreateQuiz = useCallback(() => {
    actions.openModal('showForm', null)
  }, [actions])

  const handleEditQuiz = useCallback((quiz: Quiz) => {
    prefetchQuiz(quiz.id)
    actions.openModal('showForm', quiz)
  }, [prefetchQuiz, actions])

  const handleDeleteQuiz = useCallback((quiz: Quiz) => {
    actions.openModal('showDeleteModal', quiz)
  }, [actions])

  const handleViewQuiz = useCallback((quiz: Quiz) => {
    prefetchQuiz(quiz.id)
    actions.openModal('showViewModal', quiz)
  }, [prefetchQuiz, actions])

  const handleTogglePublish = useCallback(async (quiz: Quiz) => {
    try {
      const response = await authenticatedPut(`/api/admin/quizzes/${quiz.id}`, {
        is_published: !quiz.is_published,
        updated_at: new Date().toISOString()
      })
      if (!response.ok) throw new Error('Failed to toggle publish state')
      refetch()
    } catch (error) {
      logger.error('Failed to toggle quiz publication:', error)
      refetch()
    }
  }, [refetch])

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // ===== LOADING & ERROR STATES =====
  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">{error?.message || 'An error occurred'}</p>
            <Button onClick={() => refetch()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const categoryDisplayText = selectedCategories.length === 0
    ? 'All Categories'
    : selectedCategories.length === 1
      ? selectedCategories[0]
      : `${selectedCategories.length} selected`

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Premium Header with brand gradient */}
      <div className="bg-gradient-to-r from-primary via-secondary to-primary shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8 md:py-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8">
              <div className="flex items-center gap-4 md:gap-5">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <Brain className="h-7 w-7 md:h-8 md:w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 md:mb-2 tracking-tight">Quiz Management</h1>
                  <p className="text-white/90 text-base md:text-lg">Create and manage your quizzes</p>
                </div>
              </div>
              <Button
                onClick={handleCreateQuiz}
                size="lg"
                className="w-full sm:w-auto gap-2 !bg-white !text-[#6366f1] hover:!bg-gray-50 hover:!text-[#6366f1] shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 font-semibold px-6 md:px-8 h-11 md:h-12 whitespace-nowrap flex-shrink-0"
              >
                <Plus className="h-5 w-5 !text-[#6366f1]" />
                <span className="!text-[#6366f1]">Create Quiz</span>
              </Button>
            </div>

            {/* Enhanced Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-4 md:p-6">
                  <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 tracking-tight">{quizStats.total}</div>
                  <div className="text-xs md:text-sm text-gray-600 font-medium">Total Quizzes</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-4 md:p-6">
                  <div className="text-2xl md:text-3xl font-bold text-green-700 mb-1 tracking-tight">{quizStats.published}</div>
                  <div className="text-xs md:text-sm text-green-600 font-medium">Published</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-4 md:p-6">
                  <div className="text-2xl md:text-3xl font-bold text-orange-700 mb-1 tracking-tight">{quizStats.draft}</div>
                  <div className="text-xs md:text-sm text-orange-600 font-medium">Drafts</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-4 md:p-6">
                  <div className="text-2xl md:text-3xl font-bold text-blue-700 mb-1 tracking-tight">{quizStats.totalQuestions}</div>
                  <div className="text-xs md:text-sm text-blue-600 font-medium">Questions</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Filters - Enhanced */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <Card className="shadow-md border-0">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 md:left-4 top-1/2 h-4 w-4 md:h-5 md:w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search quizzes..."
                  value={searchTerm}
                  onChange={(e) => startTransition(() => setSearchTerm(e.target.value))}
                  className="pl-10 md:pl-12 h-10 md:h-11 text-sm md:text-base border-gray-200 focus:border-primary focus:ring-primary"
                  disabled={isPending}
                />
              </div>

              {/* Category Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 min-w-[140px] sm:min-w-[180px] h-10 md:h-11 border-gray-200 hover:border-primary hover:bg-primary/5 transition-colors text-sm md:text-base" disabled={isPending}>
                    <Filter className="h-4 w-4" />
                    <span className="flex-1 text-left truncate">{categoryDisplayText}</span>
                    <ChevronDown className="h-4 w-4 ml-auto flex-shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 shadow-xl border-gray-200 z-[100]" align="start">
                  {categories.length > 0 ? (
                    <>
                      <div className="max-h-[200px] overflow-y-auto">
                        {categories.map(category => (
                          <DropdownMenuCheckboxItem
                            key={category}
                            checked={selectedCategories.includes(category)}
                            onCheckedChange={(checked) => {
                              startTransition(() => {
                                setSelectedCategories(checked
                                  ? [...selectedCategories, category]
                                  : selectedCategories.filter(c => c !== category)
                                )
                              })
                            }}
                            className="hover:bg-primary/10 focus:bg-primary/10 cursor-pointer"
                            onSelect={(e) => e.preventDefault()}
                          >
                            {category}
                          </DropdownMenuCheckboxItem>
                        ))}
                      </div>
                      <DropdownMenuSeparator />
                    </>
                  ) : (
                    <div className="px-2 py-4 text-sm text-gray-500 text-center">
                      No categories yet
                    </div>
                  )}
                  <DropdownMenuItem
                    onClick={() => {
                      actions.openModal('showCategoryManagement')
                    }}
                    className="flex items-center cursor-pointer text-primary font-medium"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Categories
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Difficulty Filter */}
              <select 
                value={selectedDifficulty} 
                onChange={(e) => startTransition(() => setSelectedDifficulty(e.target.value))} 
                disabled={isPending}
                className="w-[120px] sm:w-[160px] h-10 md:h-11 border border-gray-200 hover:border-primary transition-colors text-sm md:text-base rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>

              {/* Analytics Button */}
              <Button variant="outline" onClick={() => actions.openModal('showAnalytics')} className="gap-2 h-10 md:h-11 px-3 md:px-5 border-gray-200 hover:border-primary hover:bg-primary/5 hover:text-primary transition-colors text-sm md:text-base">
                <BarChart3 className="h-4 w-4 md:h-5 md:w-5" />
                <span className="hidden sm:inline">Analytics</span>
              </Button>
            </div>

            {/* Active Filter Tags */}
            {selectedCategories.length > 0 && (
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                <span className="text-sm text-gray-600 font-medium">Active filters:</span>
                {selectedCategories.map(category => (
                  <Badge key={category} variant="secondary" className="gap-1 px-3 py-1 bg-primary/10 text-primary border-primary/20">
                    {category}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-red-500 transition-colors"
                      onClick={() => setSelectedCategories(selectedCategories.filter(c => c !== category))}
                    />
                  </Badge>
                ))}
                <Button size="sm" variant="ghost" onClick={() => setSelectedCategories([])} className="ml-2 text-primary hover:text-primary hover:bg-primary/10">
                  Clear all
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quiz Grid - Enhanced */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 md:pb-12">
        {quizzes.length === 0 ? (
          <Card className="shadow-md border-0">
            <CardContent className="p-8 md:p-16 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                <Brain className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">No quizzes found</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">Create your first quiz to get started with assessments and track student progress</p>
              <Button onClick={handleCreateQuiz} size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                Create Your First Quiz
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {quizzes.map(quiz => (
              <Card key={quiz.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md hover:-translate-y-1 overflow-hidden">
                {/* Quiz Image */}
                {quiz.image_url && (
                  <div className="relative w-full h-40 md:h-48 bg-gradient-to-br from-primary/10 to-secondary/10 overflow-hidden">
                    <Image
                      src={quiz.image_url}
                      alt={quiz.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                {!quiz.image_url && (
                  <div className="relative w-full h-40 md:h-48 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                    <Brain className="h-12 w-12 md:h-16 md:w-16 text-primary/30" />
                  </div>
                )}

                <CardContent className="p-4 md:p-6">
                  <div className="flex items-start justify-between gap-2 mb-2 md:mb-3">
                    <h3 className="font-bold text-base md:text-lg line-clamp-2 text-gray-900 group-hover:text-primary transition-colors flex-1">{quiz.title}</h3>
                    <Badge
                      variant={quiz.is_published ? 'default' : 'secondary'}
                      className={`flex-shrink-0 text-xs ${quiz.is_published ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-orange-500 hover:bg-orange-600 text-white'}`}
                    >
                      {quiz.is_published ? 'Live' : 'Draft'}
                    </Badge>
                  </div>
                  <p className="text-xs md:text-sm text-gray-600 line-clamp-2 mb-3 md:mb-4 min-h-[32px] md:min-h-[40px]">{quiz.description}</p>

                  <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm text-gray-500 mb-4 md:mb-5 pb-4 md:pb-5 border-b border-gray-100">
                    <span className="font-medium">{quiz.total_questions || 0} questions</span>
                    <span>•</span>
                    <span className="capitalize">{quiz.difficulty || 'Medium'}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-2 md:mb-3">
                    <Button size="sm" variant="outline" onClick={() => handleViewQuiz(quiz)} title="View Quiz" className="h-8 md:h-9 hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors">
                      <Eye className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleEditQuiz(quiz)} title="Edit Quiz" className="h-8 md:h-9 hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors">
                      <Edit className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleTogglePublish(quiz)}
                      title={quiz.is_published ? 'Unpublish Quiz' : 'Publish Quiz'}
                      className={`h-8 md:h-9 text-white text-xs md:text-sm ${quiz.is_published ? 'bg-secondary hover:bg-secondary/90' : 'bg-green-600 hover:bg-green-700'}`}
                    >
                      {quiz.is_published ? 'Unpublish' : 'Publish'}
                    </Button>
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteQuiz(quiz)}
                    className="w-full h-8 md:h-9 text-xs md:text-sm text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors font-medium"
                  >
                    <Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4 mr-2" />
                    Delete
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {paginationData && paginationData.totalPages > 1 && (
          <div className="mt-6 md:mt-8 flex justify-center">
            <Pagination
              currentPage={paginationData.page}
              totalPages={paginationData.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <QuizBuilderRouter
        quiz={modalData.editingItem}
        isOpen={modalStates.showForm}
        onClose={() => actions.closeModal('showForm')}
        onSuccess={() => {
          refetch()
          actions.closeModal('showForm')
        }}
      />

      <DeleteModal
        item={modalData.deletingItem ? { id: modalData.deletingItem.id, title: modalData.deletingItem.title, type: 'quiz' } : null}
        isOpen={modalStates.showDeleteModal}
        onClose={() => actions.closeModal('showDeleteModal')}
        onSuccess={() => {
          refetch()
          actions.closeModal('showDeleteModal')
        }}
      />

      <QuizViewModal
        quiz={modalData.viewingItem}
        isOpen={modalStates.showViewModal}
        onClose={() => actions.closeModal('showViewModal')}
        onEdit={() => {
          actions.closeModal('showViewModal')
          if (modalData.viewingItem) handleEditQuiz(modalData.viewingItem)
        }}
      />

      <CategoryManagement
        isOpen={modalStates.showCategoryManagement}
        onClose={() => actions.closeModal('showCategoryManagement')}
        onCategoryCreated={refetch}
      />

      <QuizAnalytics
        isOpen={modalStates.showAnalytics}
        onClose={() => actions.closeModal('showAnalytics')}
      />
    </div>
  )
}
