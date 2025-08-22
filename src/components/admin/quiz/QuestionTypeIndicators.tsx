import React from 'react'
import { 
  CheckSquare, 
  Circle, 
  ToggleLeft, 
  Type, 
  FileText, 
  Shuffle, 
  ArrowUpDown 
} from 'lucide-react'
import { QuestionType } from '@/lib/supabase'

// Question type icon mapping with enhanced visual indicators
const QUESTION_TYPE_ICONS = {
  multiple_choice: CheckSquare,
  single_choice: Circle,
  true_false: ToggleLeft,
  fill_blank: Type,
  essay: FileText,
  matching: Shuffle,
  ordering: ArrowUpDown
} as const

// Question type color schemes for better visual hierarchy
const QUESTION_TYPE_COLORS = {
  multiple_choice: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'text-blue-600',
    badge: 'bg-blue-100 text-blue-800'
  },
  single_choice: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: 'text-green-600',
    badge: 'bg-green-100 text-green-800'
  },
  true_false: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    icon: 'text-purple-600',
    badge: 'bg-purple-100 text-purple-800'
  },
  fill_blank: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    icon: 'text-orange-600',
    badge: 'bg-orange-100 text-orange-800'
  },
  essay: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: 'text-red-600',
    badge: 'bg-red-100 text-red-800'
  },
  matching: {
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    icon: 'text-indigo-600',
    badge: 'bg-indigo-100 text-indigo-800'
  },
  ordering: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    icon: 'text-yellow-600',
    badge: 'bg-yellow-100 text-yellow-800'
  }
} as const

// Enhanced question type labels with descriptions
const QUESTION_TYPE_INFO = {
  multiple_choice: {
    label: 'Multiple Choice',
    description: 'Select one or more correct answers from multiple options',
    complexity: 'Simple',
    estimatedTime: '30s'
  },
  single_choice: {
    label: 'Single Choice',
    description: 'Select exactly one correct answer from multiple options',
    complexity: 'Simple',
    estimatedTime: '20s'
  },
  true_false: {
    label: 'True/False',
    description: 'Simple binary choice question',
    complexity: 'Simple',
    estimatedTime: '15s'
  },
  fill_blank: {
    label: 'Fill in the Blank',
    description: 'Type the correct word or phrase to complete the sentence',
    complexity: 'Medium',
    estimatedTime: '45s'
  },
  essay: {
    label: 'Essay',
    description: 'Open-ended written response question',
    complexity: 'Complex',
    estimatedTime: '5min'
  },
  matching: {
    label: 'Matching',
    description: 'Match items from two columns',
    complexity: 'Medium',
    estimatedTime: '60s'
  },
  ordering: {
    label: 'Ordering',
    description: 'Arrange items in the correct sequence',
    complexity: 'Medium',
    estimatedTime: '45s'
  }
} as const

interface QuestionTypeIndicatorProps {
  questionType: QuestionType
  showDescription?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function QuestionTypeIndicator({ 
  questionType, 
  showDescription = false,
  size = 'md' 
}: QuestionTypeIndicatorProps) {
  const Icon = QUESTION_TYPE_ICONS[questionType]
  const colors = QUESTION_TYPE_COLORS[questionType]
  const info = QUESTION_TYPE_INFO[questionType]
  
  const sizeClasses = {
    sm: {
      icon: 'h-3 w-3',
      text: 'text-xs',
      badge: 'px-2 py-0.5'
    },
    md: {
      icon: 'h-4 w-4',
      text: 'text-sm',
      badge: 'px-2.5 py-1'
    },
    lg: {
      icon: 'h-5 w-5',
      text: 'text-base',
      badge: 'px-3 py-1.5'
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div className={`inline-flex items-center gap-1.5 rounded-full font-medium ${colors.badge} ${sizeClasses[size].badge} ${sizeClasses[size].text}`}>
        <Icon className={`${colors.icon} ${sizeClasses[size].icon}`} />
        <span>{info.label}</span>
      </div>
      
      {showDescription && (
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>•</span>
          <span>{info.description}</span>
          <span>•</span>
          <span className="font-medium">{info.estimatedTime}</span>
        </div>
      )}
    </div>
  )
}

interface QuestionComplexityBadgeProps {
  questionType: QuestionType
}

export function QuestionComplexityBadge({ questionType }: QuestionComplexityBadgeProps) {
  const info = QUESTION_TYPE_INFO[questionType]
  
  const complexityColors = {
    Simple: 'bg-green-100 text-green-800 border-green-200',
    Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Complex: 'bg-red-100 text-red-800 border-red-200'
  }
  
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${complexityColors[info.complexity as keyof typeof complexityColors]}`}>
      {info.complexity}
    </span>
  )
}

export { QUESTION_TYPE_ICONS, QUESTION_TYPE_COLORS, QUESTION_TYPE_INFO }
