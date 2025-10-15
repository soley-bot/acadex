'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Clock, Brain, Users, BarChart3, Edit, Trash2, Eye, EyeOff, Check, Timer, BookOpen } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Quiz } from '@/lib/supabase'
import { formatDate } from '@/lib/date-utils'

// Extended Quiz interface with calculated statistics
interface ExtendedQuiz extends Quiz {
  attempts_count?: number
  average_score?: number
}

interface AdminQuizCardProps {
  quiz: ExtendedQuiz
  onEdit: (quiz: ExtendedQuiz) => void
  onDelete: (quiz: ExtendedQuiz) => void
  onView: (quiz: ExtendedQuiz) => void
  onTogglePublish: (quiz: ExtendedQuiz) => void
  compact?: boolean
  isSelected?: boolean
  onSelect?: (quizId: string) => void
  showSelection?: boolean
}

export function AdminQuizCard({ 
  quiz, 
  onEdit, 
  onDelete, 
  onView, 
  onTogglePublish,
  compact = false,
  isSelected = false,
  onSelect,
  showSelection = false
}: AdminQuizCardProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'badge-success'
      case 'intermediate': return 'badge-warning'
      case 'advanced': return 'badge-destructive'
      default: return 'badge-base'
    }
  }

  const getStatusBadge = (isPublished: boolean) => {
    return isPublished 
      ? 'badge-success'
      : 'badge-warning'
  }

  if (compact) {
    return (
      <Card className={`group bg-white hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 border border-gray-100 shadow-md ${isSelected ? 'ring-2 ring-primary' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* Selection Checkbox */}
            {showSelection && (
              <div className="flex-shrink-0">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => onSelect?.(quiz.id)}
                />
              </div>
            )}

            {/* Quiz Image - Small */}
            <div className="relative w-16 h-12 bg-muted rounded-lg overflow-hidden flex-shrink-0">
              {quiz.image_url ? (
                <Image
                  src={quiz.image_url}
                  alt={quiz.title}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-100 to-blue-200 flex items-center justify-center">
                  <div className="text-lg font-black text-purple-500">
                    {quiz.title.charAt(0).toUpperCase()}
                  </div>
                </div>
              )}
            </div>

            {/* Quiz Content - Flexible */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 mb-1">
                <h3 className="font-semibold text-foreground line-clamp-1">
                  {quiz.title}
                </h3>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${getStatusBadge(quiz.is_published)}`}>
                  {quiz.is_published ? 'Published' : 'Draft'}
                </span>
              </div>

              <p className="text-muted-foreground text-sm mb-2 line-clamp-1">
                {quiz.description}
              </p>

              {/* Meta Info - Horizontal */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className={`px-2 py-1 rounded-md font-medium ${getDifficultyColor(quiz.difficulty)}`}>
                  {quiz.difficulty}
                </span>
                <span>{quiz.category}</span>
                <span>{quiz.total_questions}q</span>
                <span>{quiz.duration_minutes}m</span>
                <span>{quiz.attempts_count || 0} attempts</span>
              </div>
            </div>

            {/* Action Buttons - Compact */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onView(quiz)}
                className="h-8 w-8 p-0"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(quiz)}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onTogglePublish(quiz)}
                className={`h-8 w-8 p-0 ${
                  quiz.is_published
                    ? 'text-warning hover:text-warning'
                    : 'text-success hover:text-success'
                }`}
              >
                {quiz.is_published ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(quiz)}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Full card view (existing design)
  return (
    <Card className={`overflow-hidden group bg-white hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 shadow-lg ${isSelected ? 'ring-2 ring-primary' : ''}`}>
      {/* Selection Checkbox - Absolute positioned for full cards */}
      {showSelection && (
        <div className="absolute top-3 right-3 z-10">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onSelect?.(quiz.id)}
            className="bg-white/90 backdrop-blur-sm"
          />
        </div>
      )}

      {/* Quiz Image */}
      <div className="relative h-40 bg-muted/40">
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

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
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
            <div className="flex items-center gap-2">
              <span className={`inline-flex px-3 py-2 text-sm font-bold rounded-xl capitalize ${getDifficultyColor(quiz.difficulty)}`}>
                {quiz.difficulty}
              </span>
            </div>
            <span className="text-base text-gray-700 font-medium capitalize">{quiz.category}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-base">
            <div className="flex items-center gap-2 text-gray-700">
              <Clock className="h-5 w-5 flex-shrink-0 text-secondary" />
              <div className="flex flex-col">
                <span className="font-medium">{quiz.duration_minutes} min</span>
                <span className="text-xs text-gray-500">Expected</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Brain className="h-5 w-5 flex-shrink-0 text-purple-600" />
              <div className="flex flex-col">
                <span className="font-medium">{quiz.total_questions} questions</span>
                <span className="text-xs text-gray-500">Total</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-base">
            <div className="flex items-center gap-2 text-gray-700">
              {quiz.time_limit_minutes ? (
                <>
                  <Timer className="h-5 w-5 flex-shrink-0 text-red-600" />
                  <div className="flex flex-col">
                    <span className="font-medium">{quiz.time_limit_minutes} min</span>
                    <span className="text-xs text-red-600">Time Limit</span>
                  </div>
                </>
              ) : (
                <>
                  <Clock className="h-5 w-5 flex-shrink-0 text-green-600" />
                  <div className="flex flex-col">
                    <span className="font-medium text-green-600">No Limit</span>
                    <span className="text-xs text-green-600">Unlimited</span>
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Users className="h-5 w-5 flex-shrink-0 text-emerald-600" />
              <div className="flex flex-col">
                <span className="font-medium">{quiz.attempts_count || 0} attempts</span>
                <span className="text-xs text-gray-500">Total</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4 text-base">
            <div className="flex items-center gap-2 text-gray-700">
              <BarChart3 className="h-5 w-5 flex-shrink-0 text-orange-600" />
              <div className="flex flex-col">
                <span className="font-medium">{quiz.average_score || 0}% avg score</span>
                <span className="text-xs text-gray-500">Performance</span>
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-500 border-t border-gray-200 pt-3 font-medium">
            Created: {formatDate(quiz.created_at)}
          </div>

          {/* Enhanced Action Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex gap-3">
              <button 
                onClick={() => onView(quiz)}
                className="flex-1 bg-muted/40 hover:bg-muted/60 text-gray-800 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-md"
              >
                <Eye className="h-5 w-5" />
                <span>View</span>
              </button>
              <button 
                onClick={() => onTogglePublish(quiz)}
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
              <button
                onClick={() => onEdit(quiz)}
                className="flex-1 bg-primary hover:bg-secondary text-white hover:text-black px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-md"
              >
                <Edit className="h-5 w-5" />
                <span>Edit</span>
              </button>
              <button 
                onClick={() => onDelete(quiz)}
                className="flex-1 bg-destructive hover:bg-destructive/90 text-white px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-md"
              >
                <Trash2 className="h-5 w-5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

