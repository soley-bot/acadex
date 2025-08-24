'use client'

import React from 'react'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Clock, 
  Users, 
  BarChart3, 
  Edit, 
  Trash2, 
  Eye,
  EyeOff,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { QuizWithStats } from '@/hooks/useQuizQueries'

interface QuizCardProps {
  quiz: QuizWithStats
  onEdit: (quiz: QuizWithStats) => void
  onDelete: (quiz: QuizWithStats) => void
  onView: (quiz: QuizWithStats) => void
  onTogglePublish: (quiz: QuizWithStats) => void
  isOptimisticUpdate?: boolean
}

// Memoized Quiz Card with optimized performance
export const QuizCard = React.memo(({ 
  quiz, 
  onEdit, 
  onDelete, 
  onView, 
  onTogglePublish,
  isOptimisticUpdate = false
}: QuizCardProps) => {
  
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <Card 
      variant="interactive" 
      size="sm" 
      className={`hover:shadow-lg transition-all duration-300 group ${
        isOptimisticUpdate ? 'opacity-75 scale-[0.98]' : ''
      }`}
    >
      {/* Quiz Image */}
      <div className="relative h-48 bg-muted/40 overflow-hidden">
        {quiz.image_url ? (
          <Image
            src={quiz.image_url}
            alt={quiz.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-100 to-blue-200 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">🧠</div>
              <p className="text-sm text-gray-600 font-medium">Quiz</p>
            </div>
          </div>
        )}
        
        {/* Status Badge Overlay */}
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(quiz.is_published)}`}>
            {quiz.is_published ? 'Published' : 'Draft'}
          </span>
        </div>
        
        {/* Difficulty Badge */}
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${getDifficultyColor(quiz.difficulty)}`}>
            {quiz.difficulty}
          </span>
        </div>
      </div>

      <CardContent className="p-6">
        {/* Title and Description */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {quiz.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {quiz.description}
          </p>
        </div>

        {/* Quiz Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4 text-center">
          <div className="bg-muted/30 p-3 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <div className="text-sm font-semibold text-foreground">{quiz.duration_minutes}m</div>
            <div className="text-xs text-muted-foreground">Duration</div>
          </div>
          
          <div className="bg-muted/30 p-3 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div className="text-sm font-semibold text-foreground">{quiz.question_count || 0}</div>
            <div className="text-xs text-muted-foreground">Questions</div>
          </div>
          
          <div className="bg-muted/30 p-3 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <BarChart3 className="h-4 w-4 text-primary" />
            </div>
            <div className="text-sm font-semibold text-foreground">{quiz.attempts_count || 0}</div>
            <div className="text-xs text-muted-foreground">Attempts</div>
          </div>
        </div>

        {/* Performance Metrics */}
        {quiz.attempts_count && quiz.attempts_count > 0 && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-700 font-medium">Avg Score:</span>
              <span className="text-blue-900 font-semibold">{quiz.average_score}%</span>
            </div>
          </div>
        )}

        {/* Category and Date */}
        <div className="mb-4 space-y-1">
          <div className="text-xs text-muted-foreground">
            <span className="font-medium">Category:</span> {quiz.category}
          </div>
          <div className="text-xs text-muted-foreground">
            <span className="font-medium">Created:</span> {formatDate(quiz.created_at)}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView(quiz)}
              className="flex items-center gap-1 text-xs"
            >
              <Eye className="h-3 w-3" />
              View
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(quiz)}
              className="flex items-center gap-1 text-xs"
            >
              <Edit className="h-3 w-3" />
              Edit
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onTogglePublish(quiz)}
              className={`flex items-center gap-1 text-xs ${
                quiz.is_published 
                  ? 'text-warning hover:text-warning' 
                  : 'text-success hover:text-success'
              }`}
            >
              {quiz.is_published ? (
                <>
                  <EyeOff className="h-3 w-3" />
                  Unpublish
                </>
              ) : (
                <>
                  <CheckCircle className="h-3 w-3" />
                  Publish
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(quiz)}
              className="flex items-center gap-1 text-xs text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}, (prevProps, nextProps) => {
  // Custom comparison function for React.memo
  return (
    prevProps.quiz.id === nextProps.quiz.id &&
    prevProps.quiz.updated_at === nextProps.quiz.updated_at &&
    prevProps.quiz.is_published === nextProps.quiz.is_published &&
    prevProps.isOptimisticUpdate === nextProps.isOptimisticUpdate
  )
})

// Loading skeleton for quiz cards
export const QuizCardSkeleton = React.memo(() => (
  <Card variant="base" className="animate-pulse">
    <div className="h-48 bg-gray-200 rounded-t-lg" />
    <CardContent className="p-6 space-y-3">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-200 rounded w-1/2" />
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 rounded" />
        ))}
      </div>
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div className="h-8 bg-gray-200 rounded" />
          <div className="h-8 bg-gray-200 rounded" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="h-8 bg-gray-200 rounded" />
          <div className="h-8 bg-gray-200 rounded" />
        </div>
      </div>
    </CardContent>
  </Card>
))

// Grid of quiz card skeletons
export const QuizGridSkeleton = React.memo(({ count = 6 }: { count?: number }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <QuizCardSkeleton key={i} />
    ))}
  </div>
))

QuizCard.displayName = 'QuizCard'
QuizCardSkeleton.displayName = 'QuizCardSkeleton'
QuizGridSkeleton.displayName = 'QuizGridSkeleton'
