'use client'

import React from 'react'
import { Brain } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { AdminQuizCard } from '@/components/admin/AdminQuizCard'
import { BulkOperations } from '@/components/admin/BulkOperations'

interface QuizGridViewProps {
  quizzes: any[]
  viewMode: 'grid' | 'compact' | 'list'
  selectedQuizIds: string[]
  showBulkOperations: boolean
  isLoading: boolean
  searchTerm: string
  selectedCategories: string[]
  selectedDifficulty: string
  onEditQuiz: (quiz: any) => void
  onDeleteQuiz: (quiz: any) => void
  onViewQuiz: (quiz: any) => void
  onTogglePublish: (quiz: any) => void
  onSelectQuiz: (quizId: string) => void
  onSetSelectedQuizIds: (ids: string[]) => void
  bulkQuizOperations: any
  onSetViewMode: (mode: 'grid' | 'compact' | 'list') => void
  onClearAllFilters: () => void
}

export const QuizGridView: React.FC<QuizGridViewProps> = ({
  quizzes,
  viewMode,
  selectedQuizIds,
  showBulkOperations,
  isLoading,
  searchTerm,
  selectedCategories,
  selectedDifficulty,
  onEditQuiz,
  onDeleteQuiz,
  onViewQuiz,
  onTogglePublish,
  onSelectQuiz,
  onSetSelectedQuizIds,
  bulkQuizOperations,
  onSetViewMode,
  onClearAllFilters
}) => {
  // Filter quizzes based on search term, categories, and difficulty
  const filteredQuizzes = React.useMemo(() => {
    return quizzes.filter(quiz => {
      const matchesSearch = !searchTerm || 
        quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.category?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCategory = selectedCategories.length === 0 || 
        selectedCategories.includes(quiz.category)

      const matchesDifficulty = selectedDifficulty === 'all' || 
        quiz.difficulty === selectedDifficulty

      return matchesSearch && matchesCategory && matchesDifficulty
    })
  }, [quizzes, searchTerm, selectedCategories, selectedDifficulty])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* View Toggle and Controls */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-muted-foreground">
            Showing {filteredQuizzes.length} of {quizzes.length} quizzes
          </span>
        </div>
        <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
          <button
            onClick={() => onSetViewMode('grid')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              viewMode === 'grid'
                ? 'bg-white text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Grid
          </button>
          <button
            onClick={() => onSetViewMode('compact')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              viewMode === 'compact'
                ? 'bg-white text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Compact
          </button>
          <button
            onClick={() => onSetViewMode('list')}
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
          onSelectionChange={(newSelection) => onSetSelectedQuizIds([...newSelection])}
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
              onEdit={onEditQuiz}
              onDelete={onDeleteQuiz}
              onView={onViewQuiz}
              onTogglePublish={onTogglePublish}
              compact={false}
              isSelected={selectedQuizIds.includes(quiz.id)}
              onSelect={onSelectQuiz}
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
              onEdit={onEditQuiz}
              onDelete={onDeleteQuiz}
              onView={onViewQuiz}
              onTogglePublish={onTogglePublish}
              compact={true}
              isSelected={selectedQuizIds.includes(quiz.id)}
              onSelect={onSelectQuiz}
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
              onEdit={onEditQuiz}
              onDelete={onDeleteQuiz}
              onView={onViewQuiz}
              onTogglePublish={onTogglePublish}
              compact={true}
              isSelected={selectedQuizIds.includes(quiz.id)}
              onSelect={onSelectQuiz}
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
                  : 'Get started by creating your first quiz. Our intuitive builder makes it easy to create engaging assessments for your students.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-semibold">
                  Create Your First Quiz
                </button>
                {searchTerm || selectedCategories.length > 0 || selectedDifficulty !== 'all' ? (
                  <button 
                    onClick={onClearAllFilters}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
                  >
                    Clear All Filters
                  </button>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}